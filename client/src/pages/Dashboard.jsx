import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import Loader from '../components/common/Loader';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

const Dashboard = () => {
  const { user, isLawyer } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/dashboard');
        setStats(data.data);
      } catch (err) { console.error('Dashboard stats error:', err); }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <Loader fullScreen text="Loading dashboard..." />;
  if (isLawyer()) return <LawyerView stats={stats} user={user} />;
  return <UserView stats={stats} user={user} />;
};

/* ====== USER DASHBOARD ====== */
const UserView = ({ stats, user }) => {
  const overview = stats?.overview || {};
  const recentCases = stats?.recentCases || [];
  const recentQueries = stats?.recentQueries || [];

  const quickActions = [
    { icon: 'fa-microchip', label: 'Ask JurisPilot', desc: 'AI Legal Guidance', to: '/jurispilot', gradient: 'from-[#0D1B2A] to-[#1A3C6E]', iconColor: '#C9A84C' },
    { icon: 'fa-folder-plus', label: 'New Case', desc: 'File a Case', to: '/cases/new', gradient: 'from-[#1A3C6E] to-[#3B6CB5]', iconColor: '#ffffff' },
    { icon: 'fa-file-circle-plus', label: 'Analyze Doc', desc: 'Upload & Scan', to: '/documents', gradient: 'from-[#C9A84C] to-[#d4b96e]', iconColor: '#0D1B2A' },
    { icon: 'fa-scroll', label: 'Legal Notice', desc: 'Generate Notice', to: '/notices/new', gradient: 'from-[#2d8a5e] to-[#3da673]', iconColor: '#ffffff' },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0]}`}
        subtitle="Here's an overview of your legal activity"
        icon="fa-grid-2"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, idx) => (
            <motion.div key={action.label} custom={idx} variants={fadeUp}>
              <Link to={action.to} className="group block rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--brand-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
              >
                {/* Corner glow */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${action.gradient} opacity-[0.04] group-hover:opacity-[0.1] rounded-bl-full transition-opacity duration-500`} />

                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10`}>
                  <i className={`fas ${action.icon} text-sm`} style={{ color: action.iconColor }}></i>
                </div>
                <p className="text-sm font-semibold relative z-10" style={{ color: 'var(--text-primary)' }}>{action.label}</p>
                <p className="text-[11px] mt-0.5 relative z-10" style={{ color: 'var(--text-secondary)' }}>{action.desc}</p>

                {/* Arrow on hover */}
                <div className="absolute bottom-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0" style={{ background: 'var(--bg-hover)' }}>
                  <i className="fas fa-arrow-right text-[9px]" style={{ color: 'var(--brand-primary)' }}></i>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: 'fa-folder-open', label: 'Total Cases', value: overview.totalCases || 0, accent: 'primary' },
            { icon: 'fa-spinner', label: 'Active Cases', value: overview.activeCases || 0, accent: 'gold' },
            { icon: 'fa-microchip', label: 'AI Queries', value: overview.totalAIQueries || 0, accent: 'info' },
            { icon: 'fa-file-lines', label: 'Documents', value: overview.totalDocuments || 0, accent: 'success' },
          ].map((s, idx) => (
            <motion.div key={s.label} custom={idx + 4} variants={fadeUp}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div custom={8} variants={fadeUp}>
            <ActivityCard
              icon="fa-folder-open" iconBg="rgba(26,60,110,0.1)" iconColor="var(--brand-primary)"
              title="Recent Cases" linkTo="/cases" items={recentCases}
              renderItem={(c) => (
                <Link key={c._id} to={`/cases/${c._id}`} className="flex items-center gap-4 px-6 py-4 transition-all duration-200 group"
                  style={{ borderBottom: '1px solid var(--bg-hover)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: 'var(--bg-hover)' }}>
                    <i className="fas fa-folder text-xs" style={{ color: 'var(--text-secondary)' }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.category}</p>
                  </div>
                  <StatusBadge status={c.status} />
                  <i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: 'var(--text-secondary)' }}></i>
                </Link>
              )}
              emptyIcon="fa-folder-open" emptyText="No cases yet — create your first case"
            />
          </motion.div>

          <motion.div custom={9} variants={fadeUp}>
            <ActivityCard
              icon="fa-microchip" iconBg="rgba(201,168,76,0.1)" iconColor="#C9A84C"
              title="Recent AI Queries" linkTo="/jurispilot" items={recentQueries}
              renderItem={(q) => (
                <div key={q._id} className="px-6 py-4 transition-all duration-200 group cursor-pointer"
                  style={{ borderBottom: '1px solid var(--bg-hover)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <p className="text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>{q.query}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      <i className="fas fa-microchip text-[8px]"></i>{q.provider}
                    </span>
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                      <div className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#d4b96e]" style={{ width: `${q.confidence}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: '#C9A84C' }}>{q.confidence}%</span>
                  </div>
                </div>
              )}
              emptyIcon="fa-microchip" emptyText="No queries yet — try JurisPilot AI"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

/* ====== LAWYER DASHBOARD ====== */
const LawyerView = ({ stats, user }) => {
  const overview = stats?.overview || {};
  const recentCases = stats?.recentCases || [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <PageHeader
        title={`${greeting()}, Adv. ${user?.name?.split(' ')[0]}`}
        subtitle="Manage your practice and client communications"
        icon="fa-grid-2"
        actions={
          <Link to="/lawyer/requests" className="btn-primary text-sm">
            <i className="fas fa-inbox"></i>
            View Requests
            {overview.pendingRequests > 0 && (
              <span className="ml-1 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">{overview.pendingRequests}</span>
            )}
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: 'fa-folder-open', label: 'Total Cases', value: overview.totalCases || 0, accent: 'primary' },
            { icon: 'fa-clock', label: 'Pending', value: overview.pendingRequests || 0, accent: 'gold' },
            { icon: 'fa-check-circle', label: 'Resolved', value: overview.resolvedCases || 0, accent: 'success' },
            { icon: 'fa-star', label: 'Rating', value: overview.rating || '0.0', accent: 'gold' },
          ].map((s, idx) => (
            <motion.div key={s.label} custom={idx} variants={fadeUp}><StatCard {...s} /></motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { icon: 'fa-inbox', label: 'Case Requests', desc: 'Review pending requests', to: '/lawyer/requests', gradient: 'from-[#C9A84C] to-[#d4b96e]' },
            { icon: 'fa-microchip', label: 'JurisPilot AI', desc: 'Legal research assistant', to: '/jurispilot', gradient: 'from-[#0D1B2A] to-[#1A3C6E]' },
            { icon: 'fa-folder-open', label: 'All Cases', desc: 'View your case history', to: '/cases', gradient: 'from-[#1A3C6E] to-[#3B6CB5]' },
          ].map((a, idx) => (
            <motion.div key={a.label} custom={idx + 4} variants={fadeUp}>
              <Link to={a.to} className="group block rounded-2xl p-6 border relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl ${a.gradient} opacity-[0.04] group-hover:opacity-[0.1] rounded-bl-full transition-opacity duration-500`} />
                <div className={`w-11 h-11 bg-gradient-to-br ${a.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg relative z-10`}>
                  <i className={`fas ${a.icon} text-sm text-white`}></i>
                </div>
                <p className="text-sm font-semibold relative z-10" style={{ color: 'var(--text-primary)' }}>{a.label}</p>
                <p className="text-[11px] mt-0.5 relative z-10" style={{ color: 'var(--text-secondary)' }}>{a.desc}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Cases */}
        <motion.div initial="hidden" animate="visible" custom={7} variants={fadeUp}>
          <ActivityCard
            icon="fa-folder-open" iconBg="rgba(26,60,110,0.1)" iconColor="var(--brand-primary)"
            title="Active Cases" linkTo="/cases" items={recentCases}
            renderItem={(c) => (
              <Link key={c._id} to={`/cases/${c._id}`} className="flex items-center gap-4 px-6 py-4 transition-all group"
                style={{ borderBottom: '1px solid var(--bg-hover)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: 'var(--bg-hover)' }}>
                  <i className="fas fa-folder text-xs" style={{ color: 'var(--text-secondary)' }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.category}</p>
                </div>
                <StatusBadge status={c.status} />
                <i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: 'var(--text-secondary)' }}></i>
              </Link>
            )}
            emptyIcon="fa-folder-open" emptyText="No active cases"
          />
        </motion.div>
      </div>
    </div>
  );
};

/* ====== ACTIVITY CARD ====== */
const ActivityCard = ({ icon, iconBg, iconColor, title, linkTo, items, renderItem, emptyIcon, emptyText }) => (
  <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
    <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-default)' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          <i className={`fas ${icon} text-xs`} style={{ color: iconColor }}></i>
        </div>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      <Link to={linkTo} className="flex items-center gap-1.5 text-xs font-medium hover:underline transition-colors" style={{ color: 'var(--brand-primary)' }}>
        View all <i className="fas fa-arrow-right text-[8px]"></i>
      </Link>
    </div>
    <div>
      {items.length > 0 ? items.map(renderItem) : (
        <div className="px-6 py-14 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--bg-hover)' }}>
            <i className={`fas ${emptyIcon} text-xl`} style={{ color: 'var(--border-default)' }}></i>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{emptyText}</p>
        </div>
      )}
    </div>
  </div>
);

/* ====== STATUS BADGE ====== */
const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: 'rgba(214,163,23,0.1)', text: '#856404', icon: 'fa-clock' },
    active: { bg: 'rgba(45,138,94,0.1)', text: '#155724', icon: 'fa-bolt' },
    in_progress: { bg: 'rgba(41,128,185,0.1)', text: '#004085', icon: 'fa-spinner' },
    resolved: { bg: 'rgba(45,138,94,0.1)', text: '#155724', icon: 'fa-check' },
    closed: { bg: 'rgba(100,116,139,0.1)', text: '#383d41', icon: 'fa-lock' },
  };
  const c = config[status] || config.pending;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider" style={{ background: c.bg, color: c.text }}>
      <i className={`fas ${c.icon} text-[7px]`}></i>
      {status?.replace('_', ' ')}
    </span>
  );
};

export default Dashboard;