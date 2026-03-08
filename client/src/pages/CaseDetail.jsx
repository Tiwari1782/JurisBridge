import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import PaymentButton from '../components/payment/PaymentButton';
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

  // ── NEW: Resolve modal state ──
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);

  // ── NEW: Payment state ──
  const [paymentDone, setPaymentDone] = useState(false);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchCase();
  }, [id]);

  // ── NEW: Fetch payments when case is resolved ──
  useEffect(() => {
    if (caseData?.status === 'resolved' || caseData?.status === 'closed') {
      fetchPayments();
    }
  }, [caseData?.status]);

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

  // ── NEW: Fetch payments for this case ──
  const fetchPayments = async () => {
    try {
      const { data } = await api.get(`/payments/case/${id}`);
      const casePayments = data.data || [];
      setPayments(casePayments);
      // Check if any completed payment exists
      const hasCompleted = casePayments.some((p) => p.status === 'completed');
      setPaymentDone(hasCompleted);
    } catch (err) {
      /* silent */
    }
  };

  // ── NEW: Handle resolve case (Lawyer) ──
  const handleResolveCase = async () => {
    if (!resolution.trim()) {
      toast.error('Please provide a resolution summary');
      return;
    }
    setResolving(true);
    try {
      const { data } = await api.put(`/cases/${id}/resolve`, { resolution });
      toast.success(data.message || 'Case resolved successfully!');
      setCaseData(data.data);
      setShowResolveModal(false);
      setResolution('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve case');
    }
    setResolving(false);
  };

  // ── NEW: Handle payment success ──
  const handlePaymentSuccess = (paymentData) => {
    setPaymentDone(true);
    setPayments((prev) => [paymentData, ...prev]);
    fetchCase(); // Refresh case data
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

  // ── NEW: Derived booleans ──
  const canResolve = isLawyer() && (caseData.status === 'active' || caseData.status === 'in_progress');
  const showPaymentButton = isClient && caseData.status === 'resolved' && !paymentDone && lawyerFee > 0;

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

              {/* ── NEW: Resolve Case Button (Lawyer only) ── */}
              {canResolve && (
                <button onClick={() => setShowResolveModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0.05) 100%)',
                    borderColor: '#C9A84C',
                    color: '#C9A84C',
                  }}>
                  <i className="fas fa-check-double text-[10px]"></i>Resolve Case
                </button>
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

            {/* ── NEW: Gold Payment Banner (Client sees this when case is resolved) ── */}
            {showPaymentButton && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="rounded-2xl border-2 p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.02) 50%, rgba(13,27,42,0.03) 100%)',
                  borderColor: '#C9A84C',
                  boxShadow: '0 4px 24px rgba(201,168,76,0.15), 0 0 0 1px rgba(201,168,76,0.1)',
                }}>
                {/* Gold shimmer accent */}
                <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #C9A84C, #d4b96e, #C9A84C)' }}></div>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ background: '#C9A84C' }}></div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #d4b96e 100%)', boxShadow: '0 4px 16px rgba(201,168,76,0.4)' }}>
                    <i className="fas fa-indian-rupee-sign text-2xl text-white"></i>
                  </div>

                  {/* Text */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-heading font-bold" style={{ color: '#C9A84C' }}>
                      🎉 Case Resolved — Payment Due
                    </h3>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Your lawyer <strong style={{ color: 'var(--text-primary)' }}>{lawyerName}</strong> has resolved your case.
                      Please complete the consultation fee payment securely via Razorpay.
                    </p>
                    <p className="text-xs mt-2 flex items-center gap-1.5 justify-center sm:justify-start" style={{ color: 'var(--text-muted)' }}>
                      <i className="fas fa-shield-halved text-[9px]" style={{ color: '#2d8a5e' }}></i>
                      Secured by Razorpay • 256-bit encryption
                    </p>
                  </div>

                  {/* Payment Button — GOLD */}
                  <div className="flex-shrink-0">
                    <PaymentButton
                      caseId={id}
                      amount={lawyerFee}
                      lawyerName={lawyerName}
                      onSuccess={handlePaymentSuccess}
                      className="px-8 py-4 rounded-2xl text-sm font-bold text-[#0D1B2A] shadow-xl hover:shadow-2xl hover:-translate-y-1"
                      style={{
                        background: 'linear-gradient(135deg, #C9A84C 0%, #d4b96e 50%, #C9A84C 100%)',
                        backgroundSize: '200% 200%',
                        animation: 'goldShimmer 3s ease-in-out infinite',
                        boxShadow: '0 6px 24px rgba(201,168,76,0.5), 0 0 0 2px rgba(201,168,76,0.2)',
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── NEW: Payment Success Banner ── */}
            {isClient && paymentDone && caseData.status === 'resolved' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                className="rounded-2xl border p-5 flex items-center gap-4"
                style={{ background: 'rgba(45,138,94,0.04)', borderColor: 'rgba(45,138,94,0.2)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(45,138,94,0.1)' }}>
                  <i className="fas fa-check-circle text-xl" style={{ color: '#2d8a5e' }}></i>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#2d8a5e' }}>Payment Completed ✓</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    ₹{lawyerFee.toLocaleString('en-IN')} paid successfully to {lawyerName}. Thank you!
                  </p>
                </div>
              </motion.div>
            )}

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

            {/* ── NEW: Payment Card in Sidebar (when resolved & client) ── */}
            {isClient && caseData.status === 'resolved' && (
              <div className="rounded-2xl border-2 overflow-hidden"
                style={{
                  borderColor: paymentDone ? '#2d8a5e' : '#C9A84C',
                  background: 'var(--bg-card)',
                  boxShadow: paymentDone ? '0 0 16px rgba(45,138,94,0.1)' : '0 0 16px rgba(201,168,76,0.15)',
                }}>
                <div className="px-5 py-3 flex items-center gap-2"
                  style={{
                    background: paymentDone ? 'rgba(45,138,94,0.06)' : 'linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 100%)',
                    borderBottom: `1px solid ${paymentDone ? 'rgba(45,138,94,0.2)' : 'rgba(201,168,76,0.2)'}`,
                  }}>
                  <i className={`fas ${paymentDone ? 'fa-check-circle' : 'fa-indian-rupee-sign'} text-[10px]`}
                    style={{ color: paymentDone ? '#2d8a5e' : '#C9A84C' }}></i>
                  <h3 className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: paymentDone ? '#2d8a5e' : '#C9A84C' }}>
                    {paymentDone ? 'Payment Complete' : 'Payment Required'}
                  </h3>
                </div>
                <div className="p-5">
                  {paymentDone ? (
                    <div className="text-center py-2">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(45,138,94,0.1)' }}>
                        <i className="fas fa-receipt text-xl" style={{ color: '#2d8a5e' }}></i>
                      </div>
                      <p className="text-sm font-bold" style={{ color: '#2d8a5e' }}>₹{lawyerFee.toLocaleString('en-IN')} Paid</p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Thank you for your payment</p>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-2xl font-heading font-bold mb-1" style={{ color: '#C9A84C' }}>
                        ₹{lawyerFee.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>Consultation fee for {lawyerName}</p>
                      <PaymentButton
                        caseId={id}
                        amount={lawyerFee}
                        lawyerName={lawyerName}
                        onSuccess={handlePaymentSuccess}
                        className="w-full px-5 py-3.5 rounded-xl text-sm font-bold text-[#0D1B2A]"
                        style={{
                          background: 'linear-gradient(135deg, #C9A84C 0%, #d4b96e 50%, #C9A84C 100%)',
                          boxShadow: '0 4px 16px rgba(201,168,76,0.4)',
                        }}
                      />
                      <p className="text-[9px] mt-3 flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <i className="fas fa-lock text-[7px]"></i>Secured by Razorpay
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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

                {/* ── NEW: Resolve button in Quick Actions (Lawyer) ── */}
                {canResolve && (
                  <button onClick={() => setShowResolveModal(true)}
                    className="w-full inline-flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold border-2 transition-all hover:shadow-lg hover:-translate-y-0.5"
                    style={{
                      borderColor: '#C9A84C',
                      color: '#C9A84C',
                      background: 'rgba(201,168,76,0.04)',
                    }}>
                    <i className="fas fa-check-double text-[10px]"></i>Mark as Resolved
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── NEW: RESOLVE CASE MODAL (Lawyer) ── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showResolveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowResolveModal(false)}>

            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-lg rounded-2xl border overflow-hidden"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
              onClick={(e) => e.stopPropagation()}>

              {/* Modal Header — Gold accent */}
              <div className="px-6 py-4 flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0.03) 100%)', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #d4b96e)' }}>
                  <i className="fas fa-check-double text-white text-sm"></i>
                </div>
                <div>
                  <h2 className="text-base font-heading font-bold" style={{ color: 'var(--text-primary)' }}>Resolve Case</h2>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Provide a resolution summary for the client</p>
                </div>
                <button onClick={() => setShowResolveModal(false)} className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--bg-hover)]"
                  style={{ color: 'var(--text-muted)' }}>
                  <i className="fas fa-xmark text-sm"></i>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                    Resolution Summary <span style={{ color: '#c0392b' }}>*</span>
                  </label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Describe how the case was resolved, any agreements made, next steps for the client..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border text-sm resize-none transition-all focus:outline-none"
                    style={{
                      background: 'var(--bg-base)',
                      borderColor: resolution.trim() ? '#C9A84C' : 'var(--border-default)',
                      color: 'var(--text-primary)',
                      boxShadow: resolution.trim() ? '0 0 0 3px rgba(201,168,76,0.1)' : 'none',
                    }}
                  />
                  <p className="text-[10px] mt-1.5 text-right" style={{ color: resolution.length > 2500 ? '#c0392b' : 'var(--text-muted)' }}>
                    {resolution.length}/3000
                  </p>
                </div>

                {/* Info tip */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)' }}>
                  <i className="fas fa-info-circle text-[10px] mt-0.5" style={{ color: '#C9A84C' }}></i>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Once resolved, the client will be prompted to complete the <strong style={{ color: '#C9A84C' }}>₹{lawyerFee.toLocaleString('en-IN')}</strong> consultation fee payment via Razorpay.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: '1px solid var(--border-default)', background: 'var(--bg-hover)' }}>
                <button onClick={() => setShowResolveModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
                  Cancel
                </button>
                <button onClick={handleResolveCase} disabled={resolving || !resolution.trim()}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-[#0D1B2A] transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #C9A84C 0%, #d4b96e 100%)',
                    boxShadow: '0 4px 12px rgba(201,168,76,0.3)',
                  }}>
                  {resolving ? (
                    <><div className="w-3.5 h-3.5 border-2 border-[#0D1B2A]/30 border-t-[#0D1B2A] rounded-full animate-spin inline-block mr-2"></div>Resolving...</>
                  ) : (
                    <><i className="fas fa-check-double mr-2 text-[10px]"></i>Resolve Case</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NEW: Gold shimmer animation ── */}
      <style>{`
        @keyframes goldShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default CaseDetail;