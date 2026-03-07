import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }) };

const statusConfig = {
  pending: { bg: 'rgba(214,163,23,0.08)', border: 'rgba(214,163,23,0.2)', text: '#b8860b', icon: 'fa-clock', label: 'Pending', gradient: 'from-[#d4a017] to-[#f0c040]' },
  active: { bg: 'rgba(45,138,94,0.08)', border: 'rgba(45,138,94,0.2)', text: '#2d8a5e', icon: 'fa-bolt', label: 'Active', gradient: 'from-[#2d8a5e] to-[#3da673]' },
  in_progress: { bg: 'rgba(41,128,185,0.08)', border: 'rgba(41,128,185,0.2)', text: '#2980b9', icon: 'fa-spinner', label: 'In Progress', gradient: 'from-[#2980b9] to-[#5dade2]' },
  resolved: { bg: 'rgba(45,138,94,0.08)', border: 'rgba(45,138,94,0.2)', text: '#2d8a5e', icon: 'fa-check-circle', label: 'Resolved', gradient: 'from-[#2d8a5e] to-[#3da673]' },
  closed: { bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)', text: '#64748b', icon: 'fa-lock', label: 'Closed', gradient: 'from-[#64748b] to-[#8494A7]' },
};

const priorityConfig = {
  urgent: { color: '#c0392b', bg: 'rgba(192,57,43,0.08)', icon: 'fa-circle-exclamation', label: 'Urgent' },
  high: { color: '#d4a017', bg: 'rgba(214,163,23,0.08)', icon: 'fa-arrow-up', label: 'High' },
  normal: { color: '#2980b9', bg: 'rgba(41,128,185,0.08)', icon: 'fa-minus', label: 'Normal' },
  low: { color: '#8494A7', bg: 'rgba(132,148,167,0.08)', icon: 'fa-arrow-down', label: 'Low' },
};

const timelineIcons = {
  case_created: { icon: 'fa-folder-plus', color: '#1A3C6E' },
  lawyer_assigned: { icon: 'fa-user-tie', color: '#C9A84C' },
  case_accepted: { icon: 'fa-handshake', color: '#2d8a5e' },
  case_rejected: { icon: 'fa-xmark', color: '#c0392b' },
  status_changed: { icon: 'fa-arrow-right', color: '#2980b9' },
  document_uploaded: { icon: 'fa-file-arrow-up', color: '#8e44ad' },
  evidence_added: { icon: 'fa-vault', color: '#16a085' },
  message_sent: { icon: 'fa-message', color: '#2980b9' },
  case_resolved: { icon: 'fa-check-double', color: '#2d8a5e' },
  case_closed: { icon: 'fa-lock', color: '#64748b' },
  payment_made: { icon: 'fa-indian-rupee-sign', color: '#C9A84C' },
  default: { icon: 'fa-circle-dot', color: '#8494A7' },
};

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLawyer } = useAuthStore();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    try {
      const { data } = await api.get(`/cases/${id}`);
      setCaseData(data.data);
    } catch (err) {
      toast.error('Failed to load case');
      navigate('/cases');
    }
    setLoading(false);
  };

  if (loading) return <Loader fullScreen text="Loading case..." />;
  if (!caseData) return null;

  const sc = statusConfig[caseData.status] || statusConfig.pending;
  const pc = priorityConfig[caseData.priority] || priorityConfig.normal;

  // Safe data extraction
  const clientName = caseData.userId?.name || 'Client';
  const clientEmail = caseData.userId?.email || '';
  const clientPhone = caseData.userId?.phone || '';

  const hasLawyer = caseData.lawyerId !== null && caseData.lawyerId !== undefined;
  const lawyerName = caseData.lawyerId?.userId?.name || caseData.lawyerId?.name || null;
  const lawyerEmail = caseData.lawyerId?.userId?.email || caseData.lawyerId?.email || null;
  const lawyerRating = caseData.lawyerId?.rating || 0;
  const lawyerExp = caseData.lawyerId?.experience || 0;
  const lawyerFee = caseData.lawyerId?.consultationFee || 0;
  const lawyerSpecs = caseData.lawyerId?.specializations || [];
  const lawyerAvailable = caseData.lawyerId?.isAvailable || false;
  const lawyerProfileId = caseData.lawyerId?._id || null;

  const docs = caseData.documents || [];
  const evidence = caseData.evidence || [];
  const timeline = caseData.timeline || [];

  const isClient = !isLawyer();
  const canChat = caseData.status === 'active' || caseData.status === 'in_progress';

  const tabs = [
    { key: 'details', label: 'Details', icon: 'fa-file-lines' },
    { key: 'timeline', label: `Timeline (${timeline.length})`, icon: 'fa-clock-rotate-left' },
    { key: 'documents', label: `Documents (${docs.length + evidence.length})`, icon: 'fa-paperclip' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* ====== HEADER ====== */}
      <div className="border-b" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-4 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            <Link to="/dashboard" className="hover:underline" style={{ color: 'var(--text-muted)' }}><i className="fas fa-home text-[9px]"></i></Link>
            <i className="fas fa-chevron-right text-[7px] opacity-40"></i>
            <Link to="/cases" className="hover:underline" style={{ color: 'var(--text-muted)' }}>Cases</Link>
            <i className="fas fa-chevron-right text-[7px] opacity-40"></i>
            <span style={{ color: 'var(--text-secondary)' }}>{caseData.title?.slice(0, 40)}...</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${sc.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                <i className={`fas ${sc.icon} text-white text-lg`}></i>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-heading font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {caseData.title}
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {/* Status Badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                    <i className={`fas ${sc.icon} text-[8px]`}></i>{sc.label}
                  </span>
                  {/* Priority Badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: pc.bg, color: pc.color }}>
                    <i className={`fas ${pc.icon} text-[8px]`}></i>{pc.label} Priority
                  </span>
                  {/* Category */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                    <i className="fas fa-tag text-[8px]" style={{ color: 'var(--brand-primary)' }}></i>{caseData.category}
                  </span>
                  {/* Date */}
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Filed {new Date(caseData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              {canChat && (
                <>
                  <Link to={`/chat/${id}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: 'var(--brand-primary)' }}>
                    <i className="fas fa-comments text-[10px]"></i>Chat
                  </Link>
                  <Link to={`/video/${id}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(45,138,94,0.06)', borderColor: '#2d8a5e', color: '#2d8a5e' }}>
                    <i className="fas fa-video text-[10px]"></i>Video Call
                  </Link>
                </>
              )}
              {isClient && caseData.status === 'pending' && !hasLawyer && (
                <Link to={`/lawyers`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all"
                  style={{ borderColor: '#C9A84C', color: '#C9A84C', background: 'rgba(201,168,76,0.04)' }}>
                  <i className="fas fa-user-tie text-[10px]"></i>Find Lawyer
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====== TABS ====== */}
      <div className="border-b" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 -mb-px">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all duration-200"
                style={{
                  borderBottomColor: activeTab === tab.key ? 'var(--brand-primary)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--brand-primary)' : 'var(--text-secondary)',
                }}>
                <i className={`fas ${tab.icon} text-[10px]`}></i>{tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ====== CONTENT ====== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Details Tab */}
            {activeTab === 'details' && (
              <motion.div initial="hidden" animate="visible" className="space-y-6">
                {/* Description */}
                <motion.div variants={fadeUp} custom={0} className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <i className="fas fa-align-left text-[9px]"></i>Description
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                    {caseData.description}
                  </p>
                </motion.div>

                {/* Lawyer Notes */}
                {caseData.lawyerNotes && (
                  <motion.div variants={fadeUp} custom={1} className="rounded-2xl border p-6 relative overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{ background: '#C9A84C' }}></div>
                    <div className="pl-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#C9A84C' }}>
                        <i className="fas fa-note-sticky text-[9px]"></i>Lawyer's Notes
                      </h3>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                        {caseData.lawyerNotes}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Resolution */}
                {caseData.resolution && (
                  <motion.div variants={fadeUp} custom={2} className="rounded-2xl border p-6 relative overflow-hidden"
                    style={{ background: 'rgba(45,138,94,0.03)', borderColor: 'rgba(45,138,94,0.15)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{ background: '#2d8a5e' }}></div>
                    <div className="pl-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#2d8a5e' }}>
                        <i className="fas fa-check-double text-[9px]"></i>Resolution
                      </h3>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                        {caseData.resolution}
                      </p>
                      {caseData.resolvedAt && (
                        <p className="text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>
                          Resolved on {new Date(caseData.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* AI Escalation */}
                {caseData.escalatedFromAI && (
                  <motion.div variants={fadeUp} custom={3} className="rounded-2xl border p-4 flex items-center gap-3"
                    style={{ background: 'rgba(201,168,76,0.04)', borderColor: 'rgba(201,168,76,0.15)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,168,76,0.1)' }}>
                      <i className="fas fa-microchip text-xs" style={{ color: '#C9A84C' }}></i>
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#C9A84C' }}>Escalated from JurisPilot AI</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>This case was escalated from an AI consultation that recommended professional legal help.</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <motion.div initial="hidden" animate="visible" className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <i className="fas fa-clock-rotate-left text-[9px]"></i>Case Timeline
                </h3>
                {timeline.length > 0 ? (
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-[15px] top-0 bottom-0 w-[2px] rounded-full" style={{ background: 'var(--border-default)' }}></div>

                    <div className="space-y-6">
                      {[...timeline].reverse().map((event, idx) => {
                        const tl = timelineIcons[event.event] || timelineIcons.default;
                        return (
                          <motion.div key={event._id || idx} custom={idx} variants={fadeUp} className="relative flex gap-4 pl-1">
                            <div className="relative z-10 flex-shrink-0">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                                style={{ background: `${tl.color}12`, border: `2px solid var(--bg-card)` }}>
                                <i className={`fas ${tl.icon} text-[10px]`} style={{ color: tl.color }}></i>
                              </div>
                            </div>
                            <div className="flex-1 pb-1">
                              <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                                {event.description}
                              </p>
                              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                {new Date(event.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {' · '}
                                {new Date(event.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <i className="fas fa-clock-rotate-left text-xl mb-3" style={{ color: 'var(--border-default)' }}></i>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No timeline events yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <motion.div initial="hidden" animate="visible" className="space-y-6">
                {/* Documents */}
                <motion.div variants={fadeUp} custom={0} className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <i className="fas fa-file-lines text-[9px]"></i>Documents ({docs.length})
                  </h3>
                  {docs.length > 0 ? (
                    <div className="space-y-2">
                      {docs.map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border transition-all group"
                          style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-default)' }}>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
                            <i className="fas fa-file-pdf text-xs" style={{ color: 'var(--brand-primary)' }}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{doc.fileName || doc.name || `Document ${idx + 1}`}</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}</p>
                          </div>
                          {doc.fileUrl && (
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: 'var(--bg-card)', color: 'var(--brand-primary)' }}>
                              <i className="fas fa-download text-[10px]"></i>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-file-lines text-xl mb-2" style={{ color: 'var(--border-default)' }}></i>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No documents uploaded yet</p>
                      {isClient && <Link to="/documents" className="text-xs font-semibold mt-2 inline-block hover:underline" style={{ color: 'var(--brand-primary)' }}>Upload Document</Link>}
                    </div>
                  )}
                </motion.div>

                {/* Evidence */}
                <motion.div variants={fadeUp} custom={1} className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <i className="fas fa-vault text-[9px]"></i>Evidence ({evidence.length})
                  </h3>
                  {evidence.length > 0 ? (
                    <div className="space-y-2">
                      {evidence.map((ev, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-default)' }}>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(22,160,133,0.08)' }}>
                            <i className="fas fa-shield-halved text-xs" style={{ color: '#16a085' }}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{ev.fileName || ev.description || `Evidence ${idx + 1}`}</p>
                            {ev.hash && <p className="text-[9px] font-mono truncate" style={{ color: 'var(--text-muted)' }}>SHA256: {ev.hash.slice(0, 20)}...</p>}
                          </div>
                          <i className="fas fa-check-circle text-xs" style={{ color: '#16a085' }}></i>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-vault text-xl mb-2" style={{ color: 'var(--border-default)' }}></i>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No evidence added yet</p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* ====== SIDEBAR ====== */}
          <div className="space-y-5">

            {/* Assigned Lawyer Card */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="px-5 py-3 flex items-center gap-2" style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-default)' }}>
                <i className="fas fa-user-tie text-[10px]" style={{ color: '#C9A84C' }}></i>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Assigned Lawyer</h3>
              </div>

              <div className="p-5">
                {hasLawyer && lawyerName ? (
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(26,60,110,0.08)', border: '1px solid var(--border-default)' }}>
                          <i className="fas fa-user-tie text-xl" style={{ color: 'var(--brand-primary)' }}></i>
                        </div>
                        {lawyerAvailable && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#2d8a5e] rounded-full flex items-center justify-center"
                            style={{ border: '2px solid var(--bg-card)', boxShadow: '0 0 6px rgba(45,138,94,0.3)' }}>
                            <i className="fas fa-check text-[6px] text-white"></i>
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{lawyerName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fas fa-star text-[8px] ${i < Math.floor(lawyerRating) ? 'text-[#C9A84C]' : ''}`}
                              style={i >= Math.floor(lawyerRating) ? { color: 'var(--border-default)' } : {}}></i>
                          ))}
                          <span className="text-[10px] font-bold ml-1" style={{ color: '#C9A84C' }}>{lawyerRating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Lawyer Details */}
                    <div className="space-y-2.5 mb-4">
                      {[
                        { icon: 'fa-briefcase', label: 'Experience', value: `${lawyerExp} years` },
                        { icon: 'fa-indian-rupee-sign', label: 'Consultation Fee', value: `₹${lawyerFee.toLocaleString('en-IN')}` },
                        lawyerEmail && { icon: 'fa-envelope', label: 'Email', value: lawyerEmail },
                      ].filter(Boolean).map((item) => (
                        <div key={item.icon} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-hover)' }}>
                            <i className={`fas ${item.icon} text-[9px]`} style={{ color: 'var(--text-muted)' }}></i>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Specializations */}
                    {lawyerSpecs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {lawyerSpecs.map((s) => (
                          <span key={s} className="px-2 py-1 rounded-md text-[9px] font-medium" style={{ background: 'rgba(26,60,110,0.05)', color: 'var(--brand-primary)' }}>{s}</span>
                        ))}
                      </div>
                    )}

                    {/* View Profile */}
                    {lawyerProfileId && (
                      <Link to={`/lawyers/${lawyerProfileId}`} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:-translate-y-0.5"
                        style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)', background: 'var(--bg-card)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.color = 'var(--brand-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)'; }}>
                        <i className="fas fa-external-link text-[9px]"></i>View Full Profile
                      </Link>
                    )}
                  </div>
                ) : (
                  /* No Lawyer Assigned */
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(214,163,23,0.08)' }}>
                      <i className="fas fa-user-clock text-xl" style={{ color: '#d4a017' }}></i>
                    </div>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No Lawyer Assigned</p>
                    <p className="text-[11px] mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Your case is pending. A lawyer hasn't been assigned yet.
                    </p>
                    {isClient && (
                      <Link to="/lawyers" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: '#C9A84C' }}>
                        <i className="fas fa-search text-[10px]"></i>Browse Lawyers
                      </Link>
                    )}

                    {/* Waiting animation */}
                    <div className="mt-4 pt-4 flex items-center justify-center gap-2" style={{ borderTop: '1px solid var(--border-default)' }}>
                      <div className="flex gap-1">
                        {[0, 150, 300].map((d) => (
                          <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#d4a017', animationDelay: `${d}ms` }}></span>
                        ))}
                      </div>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Awaiting lawyer assignment</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Client Info (visible to lawyers) */}
            {isLawyer() && (
              <div className="rounded-2xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <i className="fas fa-user text-[9px]"></i>Client
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-hover)' }}>
                    <i className="fas fa-user text-sm" style={{ color: 'var(--text-secondary)' }}></i>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{clientName}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{clientEmail}</p>
                  </div>
                </div>
                {clientPhone && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <i className="fas fa-phone text-[9px]"></i>{clientPhone}
                  </div>
                )}
              </div>
            )}

            {/* Case Filed By (visible to client) */}
            {isClient && (
              <div className="rounded-2xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <i className="fas fa-user text-[9px]"></i>Filed By
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-hover)' }}>
                    <i className="fas fa-user text-sm" style={{ color: 'var(--text-secondary)' }}></i>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{clientName}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{clientEmail}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="rounded-2xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <i className="fas fa-info-circle text-[9px]"></i>Case Info
              </h3>
              <div className="space-y-3">
                {[
                  { icon: 'fa-hashtag', label: 'Case ID', value: caseData._id?.slice(-8).toUpperCase() },
                  { icon: 'fa-calendar-plus', label: 'Filed On', value: new Date(caseData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                  { icon: 'fa-clock', label: 'Last Updated', value: new Date(caseData.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                  { icon: 'fa-file-lines', label: 'Documents', value: docs.length },
                  { icon: 'fa-vault', label: 'Evidence', value: evidence.length },
                  caseData.resolvedAt && { icon: 'fa-check-double', label: 'Resolved On', value: new Date(caseData.resolvedAt).toLocaleDateString('en-IN') },
                  caseData.closedAt && { icon: 'fa-lock', label: 'Closed On', value: new Date(caseData.closedAt).toLocaleDateString('en-IN') },
                ].filter(Boolean).map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      <i className={`fas ${item.icon} text-[9px]`}></i>{item.label}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {canChat && (
              <div className="rounded-2xl border p-5 space-y-2" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <i className="fas fa-bolt text-[9px]"></i>Quick Actions
                </h3>
                <Link to={`/chat/${id}`} className="w-full inline-flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: 'var(--brand-primary)' }}>
                  <i className="fas fa-comments text-[10px]"></i>Open Chat
                </Link>
                <Link to={`/video/${id}`} className="w-full inline-flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold border transition-all hover:-translate-y-0.5"
                  style={{ borderColor: '#2d8a5e', color: '#2d8a5e', background: 'rgba(45,138,94,0.04)' }}>
                  <i className="fas fa-video text-[10px]"></i>Start Video Call
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;