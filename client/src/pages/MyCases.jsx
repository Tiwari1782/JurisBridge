import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] } }),
};

const statusConfig = {
  pending: { bg: 'rgba(214,163,23,0.08)', border: 'rgba(214,163,23,0.2)', text: '#b8860b', icon: 'fa-clock', label: 'Pending' },
  active: { bg: 'rgba(45,138,94,0.08)', border: 'rgba(45,138,94,0.2)', text: '#2d8a5e', icon: 'fa-bolt', label: 'Active' },
  in_progress: { bg: 'rgba(41,128,185,0.08)', border: 'rgba(41,128,185,0.2)', text: '#2980b9', icon: 'fa-spinner', label: 'In Progress' },
  resolved: { bg: 'rgba(45,138,94,0.08)', border: 'rgba(45,138,94,0.2)', text: '#2d8a5e', icon: 'fa-check-circle', label: 'Resolved' },
  closed: { bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)', text: '#64748b', icon: 'fa-lock', label: 'Closed' },
};

const priorityConfig = {
  urgent: { color: '#c0392b', icon: 'fa-arrow-up' },
  high: { color: '#d4a017', icon: 'fa-arrow-up' },
  normal: { color: '#2980b9', icon: 'fa-minus' },
  low: { color: '#8494A7', icon: 'fa-arrow-down' },
};

const MyCases = () => {
  const { isLawyer } = useAuthStore();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data } = await api.get('/cases');
        setCases(data.data || []);
      } catch (err) { console.error('Fetch cases error:', err); }
      setLoading(false);
    };
    fetchCases();
  }, []);

  const tabs = [
    { key: 'all', label: 'All Cases', icon: 'fa-layer-group' },
    { key: 'active', label: 'Active', icon: 'fa-bolt' },
    { key: 'pending', label: 'Pending', icon: 'fa-clock' },
    { key: 'resolved', label: 'Resolved', icon: 'fa-check-circle' },
    { key: 'closed', label: 'Closed', icon: 'fa-lock' },
  ];

  const filtered = activeTab === 'all' ? cases : cases.filter((c) => c.status === activeTab);

  if (loading) return <Loader fullScreen text="Loading cases..." />;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <PageHeader
        title="My Cases"
        subtitle={`${cases.length} total cases`}
        icon="fa-folder-open"
        breadcrumbs={[{ label: 'Cases' }]}
        actions={
          !isLawyer() && (
            <Link to="/cases/new" className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" style={{ background: 'var(--brand-primary)' }}>
              <i className="fas fa-plus text-xs"></i>
              New Case
              <i className="fas fa-arrow-right text-[9px] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"></i>
            </Link>
          )
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const count = tab.key === 'all' ? cases.length : cases.filter((c) => c.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap border"
                style={{
                  background: activeTab === tab.key ? 'var(--brand-primary)' : 'var(--bg-card)',
                  color: activeTab === tab.key ? '#ffffff' : 'var(--text-secondary)',
                  borderColor: activeTab === tab.key ? 'var(--brand-primary)' : 'var(--border-default)',
                  boxShadow: activeTab === tab.key ? '0 4px 12px rgba(26,60,110,0.2)' : 'none',
                }}
              >
                <i className={`fas ${tab.icon} text-[10px]`}></i>
                {tab.label}
                <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold" style={{
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--bg-hover)',
                  color: activeTab === tab.key ? '#ffffff' : 'var(--text-muted)',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cases List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="fa-folder-open"
            title={activeTab === 'all' ? 'No Cases Yet' : `No ${activeTab} cases`}
            description={activeTab === 'all' ? 'Create your first legal case and get matched with a verified lawyer.' : `You don't have any cases with "${activeTab}" status.`}
            actionLabel={!isLawyer() ? 'Create Case' : null}
            actionTo="/cases/new"
            actionIcon="fa-plus"
          />
        ) : (
          <motion.div initial="hidden" animate="visible" className="space-y-3">
            {filtered.map((caseItem, idx) => {
              const s = statusConfig[caseItem.status] || statusConfig.pending;
              const p = priorityConfig[caseItem.priority] || priorityConfig.normal;
              return (
                <motion.div key={caseItem._id} custom={idx} variants={fadeUp}>
                  <Link to={`/cases/${caseItem._id}`}
                    className="block rounded-2xl p-5 border group transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--brand-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                  >
                    {/* Left status bar */}
                    <div className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{ background: s.text }}></div>

                    <div className="flex items-center gap-5 pl-3">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                        <i className={`fas ${s.icon} text-sm`} style={{ color: s.text }}></i>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1">
                          <p className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{caseItem.title}</p>
                        </div>
                        <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          <span className="flex items-center gap-1.5">
                            <i className="fas fa-tag text-[8px]" style={{ color: 'var(--brand-primary)' }}></i>
                            {caseItem.category}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <i className={`fas ${p.icon} text-[8px]`} style={{ color: p.color }}></i>
                            {caseItem.priority}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <i className="fas fa-calendar text-[8px]"></i>
                            {new Date(caseItem.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          {caseItem.lawyerId?.userId?.name && (
                            <span className="flex items-center gap-1.5">
                              <i className="fas fa-user-tie text-[8px]" style={{ color: '#C9A84C' }}></i>
                              {caseItem.lawyerId.userId.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider" style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                          <i className={`fas ${s.icon} text-[7px]`}></i>
                          {s.label}
                        </span>
                        <i className="fas fa-chevron-right text-[9px] opacity-0 group-hover:opacity-50 transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0" style={{ color: 'var(--text-secondary)' }}></i>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyCases;