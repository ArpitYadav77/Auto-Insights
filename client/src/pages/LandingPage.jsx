import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  HiOutlineChartBar, HiOutlineLightBulb, HiOutlineCode,
  HiOutlineDocumentReport, HiOutlineDatabase, HiOutlineSparkles,
  HiOutlineCloudUpload, HiOutlineCog, HiOutlineDocumentText,
  HiArrowRight
} from 'react-icons/hi'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' } })
}

function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  )
}

function StatCounter({ end, label, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end])
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-extrabold gradient-text">{count.toLocaleString()}{suffix}</div>
      <div className="text-gray-400 mt-2 text-sm">{label}</div>
    </div>
  )
}

const features = [
  { icon: HiOutlineDatabase, title: 'Auto Profiling', desc: 'Instant dataset profiling with column types, missing values, and statistical summaries.' },
  { icon: HiOutlineLightBulb, title: 'AI Hypotheses', desc: 'GPT-powered business hypothesis generation with KPIs and analysis recommendations.' },
  { icon: HiOutlineChartBar, title: 'Smart EDA', desc: 'Automated histograms, box plots, correlation matrices, and Pareto charts.' },
  { icon: HiOutlineCode, title: 'Code Generation', desc: 'Generate executable Python/Pandas code for any business question.' },
  { icon: HiOutlineSparkles, title: 'SQL Generator', desc: 'Auto-generate SQL queries optimized for your dataset schema.' },
  { icon: HiOutlineDocumentReport, title: 'Executive Reports', desc: 'Download comprehensive PDF reports with insights and recommendations.' },
]

const steps = [
  { icon: HiOutlineCloudUpload, title: 'Upload', desc: 'Drag & drop your CSV or XLSX dataset' },
  { icon: HiOutlineCog, title: 'Analyze', desc: 'AI profiles, visualizes, and generates insights' },
  { icon: HiOutlineDocumentText, title: 'Report', desc: 'Download executive reports with actionable recommendations' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <HiOutlineSparkles className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold gradient-text">Auto Insights</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium px-4 py-2">Log In</Link>
            <Link to="/register" className="gradient-bg px-5 py-2 rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-brand-500/25">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-accent-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-brand-950/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm mb-8">
              <HiOutlineSparkles className="text-brand-400" /> AI-Powered Analytics Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              Transform Data Into{' '}
              <span className="gradient-text">Business Insights</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your datasets and let AI automatically profile, visualize, hypothesize, and generate executive reports — in minutes, not days.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="gradient-bg px-8 py-3.5 rounded-xl font-semibold text-lg hover:brightness-110 transition-all shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2">
              Get Started Free <HiArrowRight />
            </Link>
            <a href="#features" className="px-8 py-3.5 rounded-xl font-semibold text-lg border border-white/10 hover:bg-white/5 transition-all text-gray-300">
              Learn More
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter end={10000} label="Datasets Analyzed" suffix="+" />
          <StatCounter end={50000} label="Insights Generated" suffix="+" />
          <StatCounter end={99} label="Accuracy Rate" suffix="%" />
          <StatCounter end={500} label="Active Users" suffix="+" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need for <span className="gradient-text">Data Analytics</span></h2>
              <p className="text-gray-400 max-w-2xl mx-auto">From raw data to executive presentations — our AI handles the entire analytics pipeline.</p>
            </motion.div>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <AnimatedSection key={f.title}>
                <motion.div variants={fadeUp} custom={i} className="glass rounded-2xl p-6 card-hover group cursor-default h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center mb-4 group-hover:from-brand-500/30 group-hover:to-accent-500/30 transition-all">
                    <f.icon className="text-2xl text-brand-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-brand-950/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It <span className="gradient-text">Works</span></h2>
              <p className="text-gray-400">Three simple steps to actionable intelligence.</p>
            </motion.div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-brand-500/50 via-accent-500/50 to-brand-500/50" />
            {steps.map((s, i) => (
              <AnimatedSection key={s.title}>
                <motion.div variants={fadeUp} custom={i} className="text-center relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/30 relative z-10">
                    <s.icon className="text-3xl text-white" />
                  </div>
                  <div className="text-xs font-bold text-brand-400 mb-2">STEP {i + 1}</div>
                  <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm">{s.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="max-w-4xl mx-auto gradient-bg rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Data?</h2>
              <p className="text-brand-100 mb-8 max-w-xl mx-auto">Start analyzing your datasets with AI-powered insights. No credit card required.</p>
              <Link to="/register" className="inline-flex items-center gap-2 bg-white text-brand-600 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl">
                Get Started Free <HiArrowRight />
              </Link>
            </div>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <HiOutlineSparkles className="text-white text-sm" />
            </div>
            <span className="font-semibold gradient-text">Auto Insights</span>
          </div>
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Auto Insights. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
