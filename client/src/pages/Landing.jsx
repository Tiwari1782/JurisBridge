import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

/* ====== ANIMATIONS ====== */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: 80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ====== 3D TILT ====== */
const TiltCard = ({ children, className = "", intensity = 8 }) => {
  const ref = useRef(null);
  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    el.style.transform = `perspective(1000px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) scale3d(1.02,1.02,1.02)`;
  };
  const handleLeave = () => {
    if (ref.current)
      ref.current.style.transform =
        "perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)";
  };
  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`will-change-transform ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.15s ease-out, box-shadow 0.3s ease",
      }}
    >
      {children}
    </div>
  );
};

/* ====== DATA ====== */
const features = [
  {
    icon: "fa-microchip",
    title: "JurisPilot AI",
    desc: "Multi-provider AI cascade with Groq, Gemini, OpenAI & Claude. Instant, cited legal guidance with confidence scoring.",
    tag: "AI Powered",
    gradient: "from-[#1A3C6E] to-[#3B6CB5]",
  },
  {
    icon: "fa-user-tie",
    title: "Verified Lawyers",
    desc: "Search by specialization, location, rating. View profiles, reviews, and connect securely via chat or video.",
    tag: "Marketplace",
    gradient: "from-[#C9A84C] to-[#d4b96e]",
  },
  {
    icon: "fa-file-circle-check",
    title: "Smart Documents",
    desc: "Upload contracts. AI extracts clauses, flags risk indicators, and provides plain-language summaries.",
    tag: "Analysis",
    gradient: "from-[#2d8a5e] to-[#3da673]",
  },
  {
    icon: "fa-scroll",
    title: "Legal Notices",
    desc: "Provide facts — JurisPilot generates professionally worded notices citing relevant Indian laws.",
    tag: "Automation",
    gradient: "from-[#c0392b] to-[#e74c3c]",
  },
  {
    icon: "fa-vault",
    title: "Evidence Vault",
    desc: "Upload evidence with tamper-proof SHA256 hashing. Every file is time-stamped and integrity-verified.",
    tag: "Security",
    gradient: "from-[#8e44ad] to-[#a569bd]",
  },
  {
    icon: "fa-video",
    title: "Video Consultation",
    desc: "Face-to-face consultations with screen sharing. Secure WebRTC calls directly from the case dashboard.",
    tag: "Communication",
    gradient: "from-[#2980b9] to-[#5dade2]",
  },
];

const steps = [
  {
    icon: "fa-message",
    title: "Describe Your Issue",
    desc: "Ask JurisPilot in plain language. Get instant guidance with relevant laws and steps.",
  },
  {
    icon: "fa-magnifying-glass",
    title: "Find a Lawyer",
    desc: "Browse verified lawyers filtered by specialization, experience, and fee.",
  },
  {
    icon: "fa-folder-open",
    title: "Create Your Case",
    desc: "File your case, upload documents, add evidence, and track every update.",
  },
  {
    icon: "fa-handshake",
    title: "Resolve & Pay",
    desc: "Chat, video call, get your case resolved, and pay securely via Razorpay.",
  },
];

const stats = [
  { value: "55+", label: "API Endpoints", icon: "fa-code" },
  { value: "12", label: "Specializations", icon: "fa-scale-balanced" },
  { value: "4", label: "AI Providers", icon: "fa-microchip" },
  { value: "₹0", label: "To Start", icon: "fa-indian-rupee-sign" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Tenant",
    text: "JurisPilot helped me understand my rights instantly. The AI confidence score gave me trust in the advice.",
    rating: 5,
  },
  {
    name: "Adv. Rajesh Gupta",
    role: "Criminal Lawyer",
    text: "The case management system is exceptional. Video calls and document analysis save hours of work.",
    rating: 5,
  },
  {
    name: "Anita Desai",
    role: "Business Owner",
    text: "Generated a legal notice in minutes that would have cost me thousands. Incredible platform.",
    rating: 5,
  },
];

/* ====== LANDING PAGE ====== */
const Landing = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.3]);

  // Mouse parallax
  const orbRef1 = useRef(null);
  const orbRef2 = useRef(null);
  const orbRef3 = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      if (orbRef1.current)
        orbRef1.current.style.transform = `translate(${x * 30}px, ${y * 20}px)`;
      if (orbRef2.current)
        orbRef2.current.style.transform = `translate(${x * -20}px, ${y * 30}px)`;
      if (orbRef3.current)
        orbRef3.current.style.transform = `translate(${x * 15}px, ${y * -25}px)`;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div className="overflow-hidden">
      <style>{`
        @keyframes orbFloat { 0% { transform: translateY(0) translateX(0); } 100% { transform: translateY(-40px) translateX(20px); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes floatSlow { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes borderGlow { 0%,100% { border-color: rgba(201,168,76,0.1); } 50% { border-color: rgba(201,168,76,0.3); } }
        .shimmer-text { background: linear-gradient(90deg, #C9A84C 0%, #f0dfa0 50%, #C9A84C 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
        .glow-gold { box-shadow: 0 0 30px rgba(201,168,76,0.15), 0 0 60px rgba(201,168,76,0.05); }
        .glow-primary { box-shadow: 0 0 30px rgba(26,60,110,0.2); }
        .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); }
        .dark .glass { background: rgba(255,255,255,0.02); }
      `}</style>

      {/* ============ HERO ============ */}
      <section
        ref={heroRef}
        className="relative min-h-[94vh] flex items-center overflow-hidden"
        style={{ background: "var(--bg-base)" }}
      >
        {/* Parallax Orbs */}
        <div
          ref={orbRef1}
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[80px] transition-transform duration-700 ease-out"
          style={{ background: "var(--brand-primary)" }}
        />
        <div
          ref={orbRef2}
          className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[80px] transition-transform duration-700 ease-out"
          style={{ background: "#C9A84C" }}
        />
        <div
          ref={orbRef3}
          className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full opacity-[0.03] blur-[60px] transition-transform duration-700 ease-out"
          style={{ background: "var(--brand-primary)" }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(var(--brand-primary) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 w-full z-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div initial="hidden" animate="visible">
              <motion.div
                custom={0}
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-default)",
                }}
              >
                <span className="w-2 h-2 bg-[#2d8a5e] rounded-full animate-pulse"></span>
                <span className="text-[#2d8a5e] text-xs font-semibold">
                  AI-Powered Legal Platform for India
                </span>
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUp}
                className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-heading font-extrabold leading-[1.08] tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Legal Assistance,
                <br />
                <span className="shimmer-text">Made Simple</span>
                <br />& Accessible
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                className="mt-6 text-lg leading-relaxed max-w-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                AI-powered legal guidance, verified lawyer marketplace, document
                analysis, video consultations, and legal notice generation — all
                in one platform.
              </motion.p>

              <motion.div
                custom={3}
                variants={fadeUp}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 text-white rounded-xl text-[15px] font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                  style={{ background: "var(--brand-primary)" }}
                >
                  Get Started Free
                  <i className="fas fa-arrow-right text-xs transition-transform duration-300 group-hover:translate-x-1"></i>
                </Link>
                <Link
                  to="/lawyers"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-[15px] font-semibold border transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                >
                  <i
                    className="fas fa-user-tie text-[10px]"
                    style={{ color: "var(--brand-primary)" }}
                  ></i>
                  Browse Lawyers
                </Link>
              </motion.div>

              {/* Trust Stats */}
              <motion.div
                custom={4}
                variants={fadeUp}
                className="mt-12 flex items-center gap-8"
              >
                {[
                  { icon: "fa-shield-halved", value: "100%", label: "Secure" },
                  { icon: "fa-clock", value: "24/7", label: "AI Available" },
                  { icon: "fa-star", value: "4.9/5", label: "Rating" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border"
                      style={{
                        background: "var(--bg-card)",
                        borderColor: "var(--border-default)",
                      }}
                    >
                      <i
                        className={`fas ${s.icon} text-xs`}
                        style={{ color: "#C9A84C" }}
                      ></i>
                    </div>
                    <div>
                      <p
                        className="text-base font-bold leading-tight"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {s.value}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {s.label}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — 3D AI Preview */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideRight}
              className="hidden lg:block relative"
              style={{ perspective: "1200px" }}
            >
              <TiltCard
                className="rounded-2xl p-7 relative z-10 glow-primary"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 bg-[#0D1B2A] rounded-xl flex items-center justify-center shadow-lg">
                    <i className="fas fa-microchip text-[#C9A84C] text-sm"></i>
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      JurisPilot AI
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Legal Assistant
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-[#2d8a5e]/10 rounded-full">
                    <span className="w-1.5 h-1.5 bg-[#2d8a5e] rounded-full animate-pulse"></span>
                    <span className="text-[#2d8a5e] text-[10px] font-semibold">
                      Online
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div
                    className="ml-10 px-4 py-3 text-[13px] rounded-2xl rounded-br-sm text-white"
                    style={{ background: "var(--brand-primary)" }}
                  >
                    My landlord refuses to return my deposit. What are my
                    rights?
                  </div>
                  <div
                    className="mr-4 px-4 py-3 text-[12px] leading-relaxed rounded-2xl rounded-bl-sm border"
                    style={{
                      background: "var(--bg-hover)",
                      borderColor: "var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <p
                      className="font-semibold text-[11px] mb-1.5 flex items-center gap-1.5"
                      style={{ color: "#C9A84C" }}
                    >
                      <i className="fas fa-scale-balanced text-[9px]"></i>
                      Section 108, Transfer of Property Act
                    </p>
                    Under Indian tenancy law, your landlord is legally obligated
                    to return the security deposit upon vacation...
                  </div>
                </div>

                <div className="flex items-center gap-3 px-1">
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Confidence
                  </span>
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-hover)" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "92%" }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#d4b96e]"
                    />
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="text-[12px] font-bold"
                    style={{ color: "#C9A84C" }}
                  >
                    92%
                  </motion.span>
                </div>
              </TiltCard>

              {/* Floating Badges */}
              {[
                {
                  top: "-24px",
                  right: "-24px",
                  icon: "fa-user-check",
                  iconBg: "rgba(45,138,94,0.1)",
                  iconColor: "#2d8a5e",
                  title: "Verified Lawyers",
                  sub: "Bar Council verified",
                  delay: 0,
                },
                {
                  bottom: "-24px",
                  left: "-24px",
                  icon: "fa-bolt",
                  iconBg: "rgba(201,168,76,0.1)",
                  iconColor: "#C9A84C",
                  title: "Voice Input",
                  sub: "Speak your question",
                  delay: 1,
                },
                {
                  top: "45%",
                  right: "-48px",
                  icon: "fa-video",
                  iconBg: "rgba(41,128,185,0.1)",
                  iconColor: "#2980b9",
                  title: "Video Calls",
                  sub: "Face-to-face",
                  delay: 2,
                },
              ].map((badge, idx) => (
                <motion.div
                  key={idx}
                  animate={{ y: [0, idx % 2 === 0 ? -8 : 10, 0] }}
                  transition={{
                    duration: 5 + idx,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: badge.delay,
                  }}
                  className="absolute z-20"
                  style={{
                    top: badge.top,
                    right: badge.right,
                    bottom: badge.bottom,
                    left: badge.left,
                  }}
                >
                  <div
                    className="px-4 py-3 rounded-xl flex items-center gap-3 border"
                    style={{
                      background: "var(--bg-card)",
                      borderColor: "var(--border-default)",
                      boxShadow: "var(--shadow-lg)",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: badge.iconBg }}
                    >
                      <i
                        className={`fas ${badge.icon} text-xs`}
                        style={{ color: badge.iconColor }}
                      ></i>
                    </div>
                    <div>
                      <p
                        className="text-xs font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {badge.title}
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {badge.sub}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ============ TRUSTED BY BAR ============ */}
      <section
        className="py-6 border-y"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-10 flex-wrap">
          {[
            "Groq AI",
            "Google Gemini",
            "OpenAI",
            "Anthropic Claude",
            "Razorpay",
          ].map((name) => (
            <span
              key={name}
              className="text-xs font-semibold tracking-wider uppercase opacity-30"
              style={{ color: "var(--text-primary)" }}
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section
        className="py-24 relative"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{
                background: "var(--bg-hover)",
                color: "var(--brand-primary)",
              }}
            >
              <i className="fas fa-sparkles text-[10px]"></i>
              Platform Features
            </span>
            <h2
              className="text-3xl lg:text-[2.5rem] font-heading font-bold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Everything You Need,{" "}
              <span style={{ color: "#C9A84C" }}>All in One Place</span>
            </h2>
            <p
              className="mt-4 max-w-2xl mx-auto text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              AI intelligence meets verified legal professionals in a platform
              built for modern India
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                custom={idx * 0.3}
                variants={fadeUp}
              >
                <TiltCard
                  intensity={5}
                  className="h-full rounded-2xl p-7 border group transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-default)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {/* Left accent bar */}
                  <div
                    className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${f.gradient} rounded-r-full opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  {/* Subtle gradient glow in top-right corner */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${f.gradient} opacity-[0.04] group-hover:opacity-[0.08] rounded-bl-full transition-opacity duration-500`}
                  />

                  <div className="relative z-10">
                    <span
                      className="inline-block text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-4"
                      style={{
                        background: "var(--bg-hover)",
                        color: "var(--brand-primary)",
                      }}
                    >
                      {f.tag}
                    </span>

                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${f.gradient} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <i className={`fas ${f.icon} text-white text-sm`}></i>
                    </div>

                    <h3
                      className="text-lg font-heading font-bold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {f.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section
        className="py-24 relative"
        style={{ background: "var(--bg-card)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl lg:text-[2.5rem] font-heading font-bold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Get Started in{" "}
              <span style={{ color: "var(--brand-primary)" }}>
                4 Simple Steps
              </span>
            </h2>
          </motion.div>

          <div className="relative">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              className="absolute left-6 top-0 w-[2px] origin-top"
              style={{
                background:
                  "linear-gradient(to bottom, var(--brand-primary), #C9A84C)",
              }}
            />

            <div className="space-y-10">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={idx * 0.5}
                  variants={fadeUp}
                  className="relative flex gap-6"
                >
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-white text-sm font-bold"
                      style={{ background: "var(--brand-primary)" }}
                    >
                      {idx + 1}
                    </div>
                  </div>
                  <TiltCard
                    intensity={4}
                    className="flex-1 rounded-xl p-6 border transition-shadow duration-300"
                    style={{
                      background: "var(--bg-card)",
                      borderColor: "var(--border-default)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="text-base font-heading font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {step.title}
                      </h3>
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ml-4"
                        style={{ background: "rgba(201,168,76,0.1)" }}
                      >
                        <i
                          className={`fas ${step.icon} text-xs`}
                          style={{ color: "#C9A84C" }}
                        ></i>
                      </div>
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {step.desc}
                    </p>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: "#0D1B2A" }}
      >
        <div
          className="absolute top-[-20%] left-[10%] w-[250px] h-[250px] rounded-full bg-[#C9A84C] opacity-[0.04] blur-[60px]"
          style={{ animation: "orbFloat 15s ease-in-out infinite alternate" }}
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, idx) => (
              <motion.div
                key={s.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx * 0.4}
                variants={fadeUp}
                className="text-center group"
              >
                <div className="w-14 h-14 bg-white/5 group-hover:bg-white/10 border border-white/5 group-hover:border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110">
                  <i className={`fas ${s.icon} text-[#C9A84C] text-lg`}></i>
                </div>
                <p className="text-3xl font-heading font-bold text-white">
                  {s.value}
                </p>
                <p className="text-[#8494A7] text-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-24" style={{ background: "var(--bg-base)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <h2
              className="text-3xl font-heading font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Trusted by{" "}
              <span style={{ color: "#C9A84C" }}>Users & Lawyers</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx * 0.3}
                variants={fadeUp}
              >
                <TiltCard
                  intensity={4}
                  className="h-full rounded-2xl p-6 border"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-default)",
                  }}
                >
                  <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <i
                        key={i}
                        className="fas fa-star text-[#C9A84C] text-xs"
                      ></i>
                    ))}
                  </div>
                  <p
                    className="text-sm leading-relaxed mb-5 italic"
                    style={{ color: "var(--text-primary)" }}
                  >
                    "{t.text}"
                  </p>
                  <div
                    className="flex items-center gap-3 pt-4"
                    style={{ borderTop: "1px solid var(--border-default)" }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: "var(--bg-hover)" }}
                    >
                      <i
                        className="fas fa-user text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      ></i>
                    </div>
                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {t.name}
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {t.role}
                      </p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-24" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
          >
            <TiltCard
              intensity={3}
              className="relative rounded-3xl overflow-hidden"
            >
              <div
                className="px-8 py-16 sm:px-16 sm:py-20 text-center relative"
                style={{
                  background: "linear-gradient(135deg, #1A3C6E, #0D1B2A)",
                }}
              >
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A84C]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-sm" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/[0.03] rounded-full" />

                <div className="relative z-10">
                  <h2
                    className="text-3xl sm:text-4xl font-heading font-bold leading-tight"
                    style={{ color: "#ffffff" }}
                  >
                    Ready to Transform Your
                    <br />
                    Legal Experience?
                  </h2>
                  <p
                    className="mt-5 max-w-lg mx-auto text-base"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    Join users and legal professionals already using
                    JurisBridge. Start free today.
                  </p>
                  <div className="mt-10 flex flex-wrap justify-center gap-4">
                    <Link
                      to="/register"
                      className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-white text-[#0D1B2A] rounded-xl text-[15px] font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <i className="fas fa-user-plus text-xs"></i>
                      Join as Client
                      <i className="fas fa-arrow-right text-xs transition-transform duration-300 group-hover:translate-x-1"></i>
                    </Link>
                    <Link
                      to="/register/lawyer"
                      className="group inline-flex items-center gap-2.5 px-8 py-3.5 border border-white/20 hover:border-white/40 rounded-xl text-[15px] font-semibold transition-all duration-300 hover:-translate-y-0.5"
                      style={{ color: "#ffffff" }}
                    >
                      <i className="fas fa-user-tie text-xs"></i>
                      Join as Lawyer
                    </Link>
                  </div>
                  <div className="mt-10 flex flex-wrap justify-center gap-6">
                    {[
                      { icon: "fa-shield-halved", text: "SHA256 Encrypted" },
                      { icon: "fa-credit-card", text: "Free to Start" },
                      { icon: "fa-microphone", text: "Voice AI Input" },
                      { icon: "fa-video", text: "Video Consult" },
                    ].map((b) => (
                      <div key={b.text} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#2d8a5e] rounded-full"></span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: "rgba(255,255,255,0.45)" }}
                        >
                          {b.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
