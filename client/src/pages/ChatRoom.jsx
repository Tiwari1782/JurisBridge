import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const ChatRoom = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchChat();
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [caseId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChat = async () => {
    try {
      const [caseRes, msgRes] = await Promise.all([
        api.get(`/cases/${caseId}`),
        api.get(`/chat/${caseId}/messages`),  // ✅ FIXED: added /messages
      ]);
      setCaseData(caseRes.data.data);
      setMessages(msgRes.data.data || []);
    } catch (err) {
      console.error('Chat load error:', err);
      toast.error('Failed to load chat');
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/chat/${caseId}/messages`);  // ✅ FIXED
      setMessages(data.data || []);
    } catch (e) {}
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // Optimistic update
    const tempMsg = {
      _id: 'temp_' + Date.now(),
      senderId: { _id: user?.id || user?._id, name: user?.name },
      message: text,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await api.post(`/chat/${caseId}/messages`, { message: text });  // ✅ FIXED
      fetchMessages();
    } catch (err) {
      toast.error('Failed to send message');
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const isMe = (msg) => {
    const senderId = msg.senderId?._id || msg.senderId;
    return senderId === user?.id || senderId === user?._id;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const groupedMessages = () => {
    const groups = [];
    let lastDate = '';
    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toDateString();
      if (msgDate !== lastDate) {
        groups.push({ type: 'date', date: msg.createdAt });
        lastDate = msgDate;
      }
      groups.push({ type: 'message', data: msg });
    });
    return groups;
  };

  // Get the other person's name
  const getOtherName = () => {
    if (!caseData) return 'User';
    const lawyerName = caseData.lawyerId?.userId?.name || caseData.lawyerId?.name;
    const clientName = caseData.userId?.name;
    const myId = user?.id || user?._id;
    // If I'm the client, show lawyer name. If I'm the lawyer, show client name.
    if (caseData.userId?._id === myId) return lawyerName || 'Lawyer';
    return clientName || 'Client';
  };

  if (loading) return <Loader fullScreen text="Loading chat..." />;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>

      {/* ====== TOP BAR ====== */}
      <div className="sticky top-0 z-30 px-4 py-3 border-b" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(`/cases/${caseId}`)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
            <i className="fas fa-arrow-left text-xs"></i>
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(26,60,110,0.08)' }}>
                <i className="fas fa-user-tie text-sm" style={{ color: 'var(--brand-primary)' }}></i>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#2d8a5e] rounded-full" style={{ border: '2px solid var(--bg-card)' }}></span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{getOtherName()}</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                Case: {caseData?.title?.slice(0, 40)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/video/${caseId}`} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(45,138,94,0.08)'; e.currentTarget.style.color = '#2d8a5e'; e.currentTarget.style.borderColor = '#2d8a5e'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
              title="Video Call">
              <i className="fas fa-video text-xs"></i>
            </Link>
            <Link to={`/cases/${caseId}`} className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
              title="View Case">
              <i className="fas fa-folder-open text-xs"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* ====== MESSAGES ====== */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-1">

          {/* Case must be active to chat */}
          {caseData && !['active', 'in_progress'].includes(caseData.status) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-xl p-4 mb-4 text-center border" style={{ background: 'rgba(214,163,23,0.05)', borderColor: 'rgba(214,163,23,0.15)' }}>
              <i className="fas fa-info-circle text-sm mb-2" style={{ color: '#d4a017' }}></i>
              <p className="text-xs font-medium" style={{ color: '#b8860b' }}>
                {caseData.status === 'pending'
                  ? 'Chat will be available once the lawyer accepts your case.'
                  : `This case is ${caseData.status}. Chat is read-only.`
                }
              </p>
            </motion.div>
          )}

          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'var(--bg-hover)' }}>
                <i className="fas fa-comments text-2xl" style={{ color: 'var(--border-default)' }}></i>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Start the conversation</p>
              <p className="text-xs text-center max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Send a message to begin your legal consultation. All conversations are encrypted.
              </p>
            </motion.div>
          )}

          <AnimatePresence>
            {groupedMessages().map((item, idx) => {
              if (item.type === 'date') {
                return (
                  <div key={'date_' + idx} className="flex items-center justify-center py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-medium" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                      {formatDate(item.date)}
                    </span>
                  </div>
                );
              }

              const msg = item.data;
              const mine = isMe(msg);

              return (
                <motion.div key={msg._id} initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div className={`max-w-[70%]`}>
                    {!mine && (
                      <p className="text-[10px] font-medium mb-1 ml-1" style={{ color: 'var(--text-muted)' }}>
                        {msg.senderId?.name || 'User'}
                      </p>
                    )}

                    <div className={`relative px-4 py-3 text-sm leading-relaxed ${
                      mine ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md'
                    } ${msg.isTemp ? 'opacity-70' : ''}`}
                      style={mine
                        ? { background: 'var(--brand-primary)', color: '#ffffff', boxShadow: '0 2px 8px rgba(26,60,110,0.15)' }
                        : { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }
                      }>
                      <p className="whitespace-pre-wrap break-words">{msg.message || msg.content}</p>

                      {/* Attachments */}
                      {msg.attachments?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((att, i) => (
                            <a key={i} href={att.fileUrl || att.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors"
                              style={{ background: mine ? 'rgba(255,255,255,0.15)' : 'var(--bg-hover)', color: mine ? '#ffffff' : 'var(--brand-primary)' }}>
                              <i className="fas fa-paperclip text-[9px]"></i>
                              {att.fileName || att.name || `Attachment ${i + 1}`}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={`flex items-center gap-1.5 mt-1 ${mine ? 'justify-end mr-1' : 'ml-1'}`}>
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        {formatTime(msg.createdAt)}
                      </span>
                      {mine && !msg.isTemp && <i className="fas fa-check-double text-[8px]" style={{ color: '#2d8a5e' }}></i>}
                      {mine && msg.isTemp && <i className="fas fa-clock text-[8px]" style={{ color: 'var(--text-muted)' }}></i>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ====== INPUT BAR ====== */}
      <div className="sticky bottom-0 z-30 border-t" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Disable input if case not active */}
          {caseData && !['active', 'in_progress'].includes(caseData.status) ? (
            <div className="text-center py-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <i className="fas fa-lock text-[9px] mr-1.5"></i>
                {caseData.status === 'pending' ? 'Chat will unlock once the lawyer accepts the case' : 'This case is closed'}
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3.5 rounded-xl text-sm transition-all focus:outline-none"
                    style={{ background: 'var(--bg-hover)', border: '1.5px solid var(--border-default)', color: 'var(--text-primary)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--brand-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                    maxLength={2000} disabled={sending} autoFocus />
                </div>

                <motion.button type="submit" disabled={sending || !input.trim()} whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 disabled:opacity-30 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ background: 'var(--brand-primary)' }}>
                  {sending
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    : <i className="fas fa-paper-plane text-xs"></i>
                  }
                </motion.button>
              </form>

              <div className="flex items-center justify-between mt-1.5 px-1">
                <p className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <i className="fas fa-lock text-[7px]"></i>End-to-end encrypted
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{input.length}/2000</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;