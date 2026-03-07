import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Loader from '../components/common/Loader';

const VideoCall = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [callState, setCallState] = useState('idle'); // idle | connecting | connected | ended
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const timerRef = useRef(null);

  // Format duration
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Initialize media stream
  const initializeMedia = async () => {
    try {
      setCallState('connecting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setCallState('connected');

      // Start duration timer
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Media error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera and microphone access denied. Please allow permissions in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera or microphone found. Please connect a device and try again.');
      } else {
        setError('Failed to access camera/microphone. Please check your device settings.');
      }
      setCallState('idle');
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen share, restore camera
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false,
        });
        screenStreamRef.current = screenStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        // When user stops sharing via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          screenStreamRef.current = null;
          setIsScreenSharing(false);
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error('Screen share error:', err);
      }
    }
  };

  // End call
  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (timerRef.current) clearInterval(timerRef.current);

    setCallState('ended');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/50 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center">
            <i className="fas fa-gavel text-[#0D1B2A] text-xs"></i>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">JurisBridge Consultation</p>
            <p className="text-white/50 text-[10px]">Case: {caseId?.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {callState === 'connected' && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#2d8a5e] rounded-full animate-pulse"></span>
            <span className="text-white/80 text-xs font-mono">{formatDuration(callDuration)}</span>
          </div>
        )}

        <button
          onClick={() => { endCall(); navigate(`/cases/${caseId}`); }}
          className="text-white/50 hover:text-white text-xs transition-colors"
        >
          <i className="fas fa-xmark text-lg"></i>
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative flex items-center justify-center">
        {callState === 'idle' && !error && (
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-video text-white/30 text-3xl"></i>
            </div>
            <h2 className="text-white text-xl font-heading font-bold mb-2">Start Video Consultation</h2>
            <p className="text-white/40 text-sm mb-8 max-w-md">
              Connect face-to-face with your {user?.role === 'lawyer' ? 'client' : 'lawyer'} for a secure legal consultation.
            </p>
            <button
              onClick={initializeMedia}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#2d8a5e] hover:bg-[#236b4a] text-white rounded-2xl text-base font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#2d8a5e]/30 hover:scale-105"
            >
              <i className="fas fa-video"></i>
              Start Call
            </button>
          </div>
        )}

        {callState === 'connecting' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-[#C9A84C] animate-spin mx-auto mb-6"></div>
            <p className="text-white/60 text-sm">Setting up your camera...</p>
          </div>
        )}

        {error && (
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 rounded-full bg-[#c0392b]/20 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-video-slash text-[#c0392b] text-xl"></i>
            </div>
            <p className="text-white text-sm font-semibold mb-2">Unable to Start Call</p>
            <p className="text-white/40 text-xs mb-6">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => { setError(''); initializeMedia(); }} className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-all">
                <i className="fas fa-rotate-right mr-2"></i>Retry
              </button>
              <button onClick={() => navigate(`/cases/${caseId}`)} className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl text-xs font-medium transition-all">
                Go Back
              </button>
            </div>
          </div>
        )}

        {(callState === 'connected') && (
          <>
            {/* Remote Video (full screen) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ background: '#111' }}
            />

            {/* Placeholder when no remote video yet */}
            {!remoteVideoRef.current?.srcObject && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0D1B2A] to-[#0a0a0a]">
                <div className="text-center">
                  <div className="w-28 h-28 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user-tie text-white/20 text-4xl"></i>
                  </div>
                  <p className="text-white/40 text-sm">Waiting for {user?.role === 'lawyer' ? 'client' : 'lawyer'} to join...</p>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: `${i * 200}ms` }}></span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute bottom-28 right-6 w-48 h-36 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black z-20 group">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isVideoOff && (
                <div className="absolute inset-0 bg-[#0D1B2A] flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <i className="fas fa-video-slash text-white/30 text-sm"></i>
                  </div>
                </div>
              )}
              {/* Label */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[9px] text-white/70 font-medium">
                {isScreenSharing && <i className="fas fa-display mr-1 text-[#C9A84C]"></i>}
                You
              </div>
            </div>
          </>
        )}

        {callState === 'ended' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-phone-slash text-white/30 text-xl"></i>
            </div>
            <p className="text-white text-lg font-heading font-bold mb-1">Call Ended</p>
            <p className="text-white/40 text-sm mb-2">Duration: {formatDuration(callDuration)}</p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => { setCallState('idle'); setCallDuration(0); setError(''); }} className="px-5 py-2.5 bg-[#2d8a5e] hover:bg-[#236b4a] text-white rounded-xl text-sm font-medium transition-all">
                <i className="fas fa-rotate-right mr-2"></i>Call Again
              </button>
              <button onClick={() => navigate(`/cases/${caseId}`)} className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-medium transition-all">
                Back to Case
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {callState === 'connected' && (
        <div className="relative z-20 flex items-center justify-center gap-4 py-6 bg-gradient-to-t from-black/80 to-transparent">
          {/* Mute */}
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              isMuted ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-sm`}></i>
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              isVideoOff ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
            }`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            <i className={`fas ${isVideoOff ? 'fa-video-slash' : 'fa-video'} text-sm`}></i>
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              isScreenSharing ? 'bg-[#C9A84C] text-[#0D1B2A]' : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <i className="fas fa-display text-sm"></i>
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="w-14 h-14 bg-[#c0392b] hover:bg-[#a93226] text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg shadow-[#c0392b]/30"
            title="End call"
          >
            <i className="fas fa-phone-slash text-base"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;