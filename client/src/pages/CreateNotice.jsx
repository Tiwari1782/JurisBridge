import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import PageHeader from '../components/common/PageHeader';
import toast from 'react-hot-toast';

const CreateNotice = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sender: { name: user?.name || '', address: '', email: user?.email || '', phone: user?.phone || '' },
    recipient: { name: '', address: '', email: '', phone: '' },
    subject: '', incidentDescription: '', legalClaim: '', desiredResolution: '', deadline: 15, language: 'en',
  });

  const handleChange = (section, field, value) => {
    if (section) setFormData((p) => ({ ...p, [section]: { ...p[section], [field]: value } }));
    else setFormData((p) => ({ ...p, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await api.post('/notices/generate', formData); toast.success('Notice generated!'); navigate('/notices'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to generate'); }
    setLoading(false);
  };

  const canProceed = () => {
    if (step === 1) return formData.sender.name && formData.sender.address;
    if (step === 2) return formData.recipient.name && formData.recipient.address;
    if (step === 3) return formData.subject && formData.incidentDescription && formData.legalClaim && formData.desiredResolution;
    return true;
  };

  const steps = [
    { num: 1, label: 'Sender', icon: 'fa-user', color: '#1A3C6E' },
    { num: 2, label: 'Recipient', icon: 'fa-user-tag', color: '#C9A84C' },
    { num: 3, label: 'Details', icon: 'fa-file-lines', color: '#2d8a5e' },
    { num: 4, label: 'Review', icon: 'fa-eye', color: '#8e44ad' },
  ];

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => { setDirection(1); setStep(step + 1); };
  const goBack = () => { setDirection(-1); if (step > 1) setStep(step - 1); else navigate('/notices'); };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <PageHeader title="Generate Legal Notice" subtitle="JurisPilot drafts a professional notice from your inputs" icon="fa-scroll"
        breadcrumbs={[{ label: 'Notices', to: '/notices' }, { label: 'Generate' }]} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-10 px-4">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div animate={{ scale: step === s.num ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 300 }}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  style={{
                    background: step >= s.num ? s.color : 'var(--bg-card)',
                    color: step >= s.num ? '#fff' : 'var(--text-secondary)',
                    border: step >= s.num ? 'none' : '2px solid var(--border-default)',
                    boxShadow: step === s.num ? `0 4px 14px ${s.color}30` : 'none',
                  }}>
                  {step > s.num ? <i className="fas fa-check text-xs"></i> : <i className={`fas ${s.icon} text-xs`}></i>}
                </motion.div>
                <span className="text-[10px] font-medium mt-2 hidden sm:block" style={{ color: step >= s.num ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className="w-14 sm:w-24 h-[2px] mx-2 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
                  <motion.div animate={{ width: step > s.num ? '100%' : '0%' }} transition={{ duration: 0.5 }}
                    className="h-full rounded-full" style={{ background: s.color }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border p-8 overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>

                {/* Step 1: Sender */}
                {step === 1 && (
                  <div className="space-y-5">
                    <StepHeader icon="fa-user" color="#1A3C6E" title="Sender Details" subtitle="Your information as the notice issuer" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Full Name *" value={formData.sender.name} onChange={(v) => handleChange('sender', 'name', v)} placeholder="Your full legal name" required />
                      <InputField label="Email" type="email" value={formData.sender.email} onChange={(v) => handleChange('sender', 'email', v)} placeholder="Email address" />
                    </div>
                    <InputField label="Address *" textarea value={formData.sender.address} onChange={(v) => handleChange('sender', 'address', v)} placeholder="Complete postal address" required />
                    <InputField label="Phone" type="tel" value={formData.sender.phone} onChange={(v) => handleChange('sender', 'phone', v)} placeholder="Phone number" />
                  </div>
                )}

                {/* Step 2: Recipient */}
                {step === 2 && (
                  <div className="space-y-5">
                    <StepHeader icon="fa-user-tag" color="#C9A84C" title="Recipient Details" subtitle="Person or entity receiving this notice" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Full Name *" value={formData.recipient.name} onChange={(v) => handleChange('recipient', 'name', v)} placeholder="Recipient's name" required />
                      <InputField label="Email" type="email" value={formData.recipient.email} onChange={(v) => handleChange('recipient', 'email', v)} placeholder="Recipient's email" />
                    </div>
                    <InputField label="Address *" textarea value={formData.recipient.address} onChange={(v) => handleChange('recipient', 'address', v)} placeholder="Recipient's postal address" required />
                    <InputField label="Phone" type="tel" value={formData.recipient.phone} onChange={(v) => handleChange('recipient', 'phone', v)} placeholder="Recipient's phone" />
                  </div>
                )}

                {/* Step 3: Details */}
                {step === 3 && (
                  <div className="space-y-5">
                    <StepHeader icon="fa-file-lines" color="#2d8a5e" title="Notice Details" subtitle="Describe the matter — JurisPilot will draft the formal notice" />
                    <InputField label="Subject *" value={formData.subject} onChange={(v) => handleChange(null, 'subject', v)} placeholder="e.g., Demand for Return of Security Deposit" max={200} required />
                    <InputField label="Incident Description *" textarea rows={4} value={formData.incidentDescription} onChange={(v) => handleChange(null, 'incidentDescription', v)} placeholder="What happened, when, who was involved..." max={3000} required />
                    <InputField label="Legal Claim *" textarea rows={3} value={formData.legalClaim} onChange={(v) => handleChange(null, 'legalClaim', v)} placeholder="What laws or rights were violated..." max={2000} required />
                    <InputField label="Desired Resolution *" textarea rows={2} value={formData.desiredResolution} onChange={(v) => handleChange(null, 'desiredResolution', v)} placeholder="What outcome do you want..." max={1000} required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Response Deadline (days)</label>
                        <input type="number" value={formData.deadline} onChange={(e) => handleChange(null, 'deadline', parseInt(e.target.value))} className="input-field" min={7} max={90} />
                      </div>
                      <div>
                        <label className="input-label">Language</label>
                        <select value={formData.language} onChange={(e) => handleChange(null, 'language', e.target.value)} className="input-field">
                          <option value="en">English</option><option value="hi">Hindi</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                  <div className="space-y-6">
                    <StepHeader icon="fa-eye" color="#8e44ad" title="Review & Generate" subtitle="Verify details before AI generates your notice" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ReviewCard icon="fa-user" label="FROM" name={formData.sender.name} detail={formData.sender.address} color="#1A3C6E" />
                      <ReviewCard icon="fa-user-tag" label="TO" name={formData.recipient.name} detail={formData.recipient.address} color="#C9A84C" />
                    </div>

                    <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-default)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Subject</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{formData.subject}</p>
                    </div>

                    <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-default)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Incident</p>
                      <p className="text-xs leading-relaxed line-clamp-4" style={{ color: 'var(--text-primary)' }}>{formData.incidentDescription}</p>
                    </div>

                    <div className="flex items-center gap-5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span><i className="fas fa-clock text-[9px] mr-1.5" style={{ color: '#C9A84C' }}></i>{formData.deadline} days deadline</span>
                      <span><i className="fas fa-language text-[9px] mr-1.5" style={{ color: '#C9A84C' }}></i>{formData.language === 'en' ? 'English' : 'Hindi'}</span>
                    </div>

                    <div className="rounded-xl p-4 border" style={{ borderColor: 'rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.04)' }}>
                      <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#C9A84C' }}>
                        <i className="fas fa-microchip text-[10px]"></i>
                        JurisPilot will generate a formal notice with proper legal citations and demand clauses.
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid var(--border-default)' }}>
              <button type="button" onClick={goBack} className="btn-ghost text-sm">
                <i className="fas fa-arrow-left text-xs"></i>{step > 1 ? 'Previous' : 'Cancel'}
              </button>
              {step < 4 ? (
                <motion.button type="button" onClick={goNext} disabled={!canProceed()} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5"
                  style={{ background: 'var(--brand-primary)' }}>
                  Next <i className="fas fa-arrow-right text-xs"></i>
                </motion.button>
              ) : (
                <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:shadow-xl hover:-translate-y-0.5"
                  style={{ background: loading ? 'var(--text-secondary)' : 'var(--brand-primary)' }}>
                  {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Generating...</> : <><i className="fas fa-microchip text-xs"></i>Generate with JurisPilot</>}
                </motion.button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ====== REUSABLE SUBCOMPONENTS ====== */
const StepHeader = ({ icon, color, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}12` }}>
      <i className={`fas ${icon} text-sm`} style={{ color }}></i>
    </div>
    <div>
      <h3 className="text-base font-heading font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
    </div>
  </div>
);

const InputField = ({ label, textarea, value, onChange, max, rows = 3, ...props }) => (
  <div>
    <label className="input-label">{label}</label>
    {textarea ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} className="input-field" rows={rows} maxLength={max} {...props} />
    ) : (
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input-field" maxLength={max} {...props} />
    )}
    {max && <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{value?.length || 0}/{max}</p>}
  </div>
);

const ReviewCard = ({ icon, label, name, detail, color }) => (
  <div className="rounded-xl p-4 border relative overflow-hidden" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-default)' }}>
    <div className="absolute top-0 left-0 w-1 h-full" style={{ background: color }}></div>
    <div className="pl-3">
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
        <i className={`fas ${icon} text-[8px]`} style={{ color }}></i>{label}
      </p>
      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</p>
      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{detail}</p>
    </div>
  </div>
);

export default CreateNotice;