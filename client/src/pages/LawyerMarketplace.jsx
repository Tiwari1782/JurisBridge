import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';

const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };

const SPECIALIZATIONS = [
  'All', 'Criminal Law', 'Family Law', 'Corporate Law', 'Civil Litigation',
  'Cyber Law', 'Property Law', 'Employment Law', 'Intellectual Property',
  'Consumer Rights', 'Tax Law', 'Immigration Law', 'Constitutional Law',
];

const LawyerMarketplace = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => { fetchLawyers(); }, [filter, sortBy]);

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      let url = '/lawyers?limit=50';
      if (filter !== 'All') url += `&specialization=${encodeURIComponent(filter)}`;
      if (sortBy) url += `&sort=${sortBy}`;
      const { data } = await api.get(url);
      setLawyers(data.data || []);
    } catch (e) {}
    setLoading(false);
  };

  const filtered = lawyers.filter((l) => !search || l.userId?.name?.toLowerCase().includes(search.toLowerCase()));

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(<i key={i} className={`fas fa-star text-[9px] ${i < full ? 'text-[#C9A84C]' : ''}`} style={i >= full ? { color: 'var(--border-default)' } : {}}></i>);
    }
    return stars;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <PageHeader title="Lawyer Marketplace" subtitle="Find verified legal professionals across 12 specializations" icon="fa-user-tie" breadcrumbs={[{ label: 'Lawyers' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="rounded-2xl p-5 mb-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 input-icon-wrapper">
              <i className="fas fa-magnifying-glass input-icon"></i>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field" placeholder="Search lawyers by name..." />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field !w-auto">
              <option value="rating">⭐ Sort by Rating</option>
              <option value="experience">📅 Sort by Experience</option>
              <option value="fee_low">💰 Fee: Low → High</option>
              <option value="fee_high">💰 Fee: High → Low</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {SPECIALIZATIONS.map((spec) => (
              <button key={spec} onClick={() => setFilter(spec)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 border"
                style={{
                  background: filter === spec ? 'var(--brand-primary)' : 'transparent',
                  color: filter === spec ? '#fff' : 'var(--text-secondary)',
                  borderColor: filter === spec ? 'var(--brand-primary)' : 'var(--border-default)',
                  boxShadow: filter === spec ? '0 2px 8px rgba(26,60,110,0.2)' : 'none',
                }}>
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{filtered.length}</span> lawyers found
            {filter !== 'All' && <> in <span className="font-semibold" style={{ color: 'var(--brand-primary)' }}>{filter}</span></>}
          </p>
        </div>

        {/* Grid */}
        {loading ? <Loader text="Finding lawyers..." /> : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-hover)' }}>
              <i className="fas fa-user-tie text-xl" style={{ color: 'var(--border-default)' }}></i>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No lawyers found</p>
          </div>
        ) : (
          <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((lawyer, idx) => (
              <motion.div key={lawyer._id} custom={idx} variants={fadeUp}>
                <Link to={`/lawyers/${lawyer._id}`}
                  className="group block rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--brand-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                >
                  {/* Availability dot */}
                  <div className="absolute top-4 right-4">
                    <span className={`w-3 h-3 rounded-full inline-block ${lawyer.isAvailable ? 'bg-[#2d8a5e] shadow-[0_0_8px_rgba(45,138,94,0.4)]' : 'bg-[#8494A7]'}`} title={lawyer.isAvailable ? 'Available' : 'Unavailable'}></span>
                  </div>

                  {/* Top */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 relative"
                      style={{ background: 'linear-gradient(135deg, var(--bg-hover), var(--bg-card))', border: '1px solid var(--border-default)' }}>
                      <i className="fas fa-user-tie text-lg" style={{ color: 'var(--brand-primary)' }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-heading font-bold truncate" style={{ color: 'var(--text-primary)' }}>{lawyer.userId?.name || 'Lawyer'}</h3>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{lawyer.experience} years experience</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {renderStars(lawyer.rating)}
                        <span className="text-xs font-bold ml-1" style={{ color: '#C9A84C' }}>{lawyer.rating}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>({lawyer.totalReviews})</span>
                      </div>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {lawyer.specializations?.slice(0, 3).map((spec) => (
                      <span key={spec} className="px-2.5 py-1 rounded-lg text-[10px] font-medium border" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>{spec}</span>
                    ))}
                    {lawyer.specializations?.length > 3 && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-medium" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>+{lawyer.specializations.length - 3}</span>
                    )}
                  </div>

                  {/* Bottom */}
                  <div className="pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-default)' }}>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <i className="fas fa-indian-rupee-sign text-[9px]" style={{ color: '#C9A84C' }}></i>
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>₹{lawyer.consultationFee}</span>
                      </span>
                      {lawyer.location && (
                        <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                          <i className="fas fa-location-dot text-[9px]"></i>{lawyer.location}
                        </span>
                      )}
                    </div>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" style={{ background: 'var(--bg-hover)' }}>
                      <i className="fas fa-arrow-right text-[9px]" style={{ color: 'var(--brand-primary)' }}></i>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LawyerMarketplace;