import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }) };

const statusConfig = {
  draft: { icon: 'fa-pen', color: '#8494A7', label: 'Draft' },
  generated: { icon: 'fa-microchip', color: '#C9A84C', label: 'Generated' },
  reviewed: { icon: 'fa-check-double', color: '#2980b9', label: 'Reviewed' },
  sent: { icon: 'fa-paper-plane', color: '#2d8a5e', label: 'Sent' },
};

const LegalNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    try { const { data } = await api.get('/notices'); setNotices(data.data || []); } catch (e) {}
    setLoading(false);
  };

  const viewNotice = async (notice) => {
    try { const { data } = await api.get(`/notices/${notice._id}`); setSelectedNotice(data.data); setShowPreview(true); } catch (e) { toast.error('Failed to load'); }
  };

  const handleDelete = async (noticeId) => {
    if (!confirm('Delete this notice?')) return;
    try {
      await api.delete(`/notices/${noticeId}`);
      setNotices((prev) => prev.filter((n) => n._id !== noticeId));
      if (selectedNotice?._id === noticeId) { setSelectedNotice(null); setShowPreview(false); }
      toast.success('Deleted');
    } catch (e) { toast.error('Failed'); }
  };

  const handleStatusUpdate = async (noticeId, status) => {
    try { await api.put(`/notices/${noticeId}/status`, { status }); toast.success(`Updated to ${status}`); fetchNotices(); } catch (e) { toast.error('Failed'); }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); toast.success('Copied to clipboard'); };

  if (loading) return <Loader fullScreen text="Loading notices..." />;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <PageHeader title="Legal Notices" subtitle="Generate and manage AI-drafted legal notices" icon="fa-scroll"
        breadcrumbs={[{ label: 'Legal Notices' }]}
        actions={
          <Link to="/notices/new" className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: 'var(--brand-primary)' }}>
            <i className="fas fa-plus text-xs"></i>Generate Notice
            <i className="fas fa-arrow-right text-[9px] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"></i>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <div className={`${showPreview ? 'w-2/5' : 'w-full'} transition-all duration-500`}>
            {notices.length === 0 ? (
              <EmptyState icon="fa-scroll" title="No Legal Notices" description="Generate your first AI-drafted legal notice with proper citations." actionLabel="Generate Notice" actionTo="/notices/new" actionIcon="fa-plus" />
            ) : (
              <motion.div initial="hidden" animate="visible" className="space-y-3">
                {notices.map((notice, idx) => {
                  const sc = statusConfig[notice.status] || statusConfig.draft;
                  return (
                    <motion.div key={notice._id} custom={idx} variants={fadeUp} onClick={() => viewNotice(notice)}
                      className="rounded-xl p-5 border cursor-pointer group transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5"
                      style={{
                        background: selectedNotice?._id === notice._id ? 'var(--bg-elevated)' : 'var(--bg-card)',
                        borderColor: selectedNotice?._id === notice._id ? 'var(--brand-primary)' : 'var(--border-default)',
                        boxShadow: selectedNotice?._id === notice._id ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                      }}
                    >
                      <div className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{ background: sc.color }}></div>

                      <div className="flex items-start gap-4 pl-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: `${sc.color}10` }}>
                          <i className="fas fa-scroll text-sm" style={{ color: sc.color }}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{notice.subject}</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase flex-shrink-0" style={{ background: `${sc.color}10`, color: sc.color }}>
                              <i className={`fas ${sc.icon} text-[7px]`}></i>{sc.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                            <span className="flex items-center gap-1"><i className="fas fa-user text-[8px]"></i>To: {notice.recipient?.name}</span>
                            <span>·</span>
                            <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(notice._id); }} className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#c0392b]/10 hover:text-[#c0392b]" style={{ color: 'var(--text-secondary)' }}>
                          <i className="fas fa-trash text-[10px]"></i>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Preview Panel */}
          <AnimatePresence>
            {showPreview && selectedNotice && (
              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.35 }}
                className="w-3/5 rounded-2xl border overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-md)' }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
                  <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <i className="fas fa-scroll" style={{ color: '#C9A84C' }}></i>Notice Preview
                  </h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyToClipboard(selectedNotice.generatedNotice)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:scale-105" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }} title="Copy"><i className="fas fa-copy text-xs"></i></button>
                    <select value={selectedNotice.status} onChange={(e) => handleStatusUpdate(selectedNotice._id, e.target.value)} className="text-xs px-2.5 py-1.5 rounded-lg border font-medium" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                      <option value="draft">Draft</option><option value="generated">Generated</option><option value="reviewed">Reviewed</option><option value="sent">Sent</option>
                    </select>
                    <button onClick={() => setShowPreview(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}><i className="fas fa-xmark text-xs"></i></button>
                  </div>
                </div>

                <div className="px-6 py-4 border-b grid grid-cols-2 gap-4 text-xs" style={{ borderColor: 'var(--border-default)' }}>
                  <div className="rounded-lg p-3" style={{ background: 'var(--bg-hover)' }}>
                    <p className="font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>FROM</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedNotice.sender?.name}</p>
                    <p style={{ color: 'var(--text-secondary)' }}>{selectedNotice.sender?.address}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'var(--bg-hover)' }}>
                    <p className="font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>TO</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedNotice.recipient?.name}</p>
                    <p style={{ color: 'var(--text-secondary)' }}>{selectedNotice.recipient?.address}</p>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(100vh-400px)]">
                  {selectedNotice.generatedNotice ? (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{selectedNotice.generatedNotice}</div>
                  ) : (
                    <p className="text-sm text-center py-10" style={{ color: 'var(--text-secondary)' }}>Notice not yet generated</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LegalNotices;