import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Clock, DollarSign, ArrowRight, ShieldCheck, 
  Users, Landmark, Star, MessageCircle, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Btn } from '../components/UI';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleApplyForLoan = () => {
    if (!user) {
      navigate('/register');
    } else if (user.role === 'borrower') {
      navigate('/borrower/apply');
    } else if (user.role) {
      navigate(`/${user.role}/dashboard`);
    } else {
      navigate('/login');
    }
  };

  const handleLoginClick = () => {
    if (user && user.role) {
      navigate(`/${user.role}/dashboard`);
    } else {
      navigate('/login');
    }
  };

  const handleSignUpClick = () => {
    navigate('/register');
  };

  const stats = [
    { label: 'Loans Approved', value: '25,000+' },
    { label: 'Active Customers', value: '10,000+' },
    { label: 'Trusted Agents', value: '150+' },
    { label: 'Collection Success Rate', value: '99.2%' }
  ];

  const steps = [
    { 
      step: '01', 
      title: 'Sign Up', 
      desc: 'Create your secure account in under two minutes with basic profile details.' 
    },
    { 
      step: '02', 
      title: 'Verify Identity', 
      desc: 'Upload your standard government ID and residential proof for secure KYC clearance.' 
    },
    { 
      step: '03', 
      title: 'Apply For Loan', 
      desc: 'Configure your target amount, choose a repayment schedule, and submit.' 
    },
    { 
      step: '04', 
      title: 'Get Approved', 
      desc: 'Our credit operations team reviews application nodes in real-time.' 
    }
  ];

  const trustIndicators = [
    {
      icon: ShieldCheck,
      title: 'Secure Platform',
      desc: 'End-to-end data encryption safeguards your information and compliance logs.'
    },
    {
      icon: CheckCircle2,
      title: 'KYC Verification',
      desc: 'Instant digital verification ensures compliance and security for all accounts.'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Support',
      desc: 'Get direct updates, status tracking, and assistance over WhatsApp.'
    },
    {
      icon: Clock,
      title: 'Fast Processing',
      desc: 'Approved loans are processed and authorized within hours.'
    }
  ];

  const testimonials = [
    {
      name: 'Sofia Rodriguez',
      role: 'Business Owner',
      comment: 'Arkad Finance gave me the liquidity I needed to expand my restaurant. The approval process was incredibly fast and the staff were highly professional.',
      rating: 5,
      loan: 'MXN $75,000 Approved'
    },
    {
      name: 'Valeria Gomez',
      role: 'Freelance Designer',
      comment: 'Outstanding customer experience. Uploaded my registry files online and was authorized the same day. Highly recommended!',
      rating: 5,
      loan: 'MXN $30,000 Approved'
    },
    {
      name: 'Mateo Sanchez',
      role: 'Retail Partner',
      comment: 'Clear term sheets, no hidden fees, and seamless digital signature. Arkad has set a new standard for modern lending platforms.',
      rating: 5,
      loan: 'MXN $50,000 Approved'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden font-sans selection:bg-primary selection:text-white">
      
      {/* Grid Pattern Background overlay across the whole page */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />

      {/* ── HEADER / NAVBAR ── */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Landmark size={20} />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-slate-900 uppercase italic leading-none block">ARKAD</span>
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em] block mt-0.5 group-hover:text-indigo-600 transition-colors">FINANCE</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary hover:after:w-full after:transition-all after:duration-300">How It Works</a>
            <a href="#why-choose-us" className="hover:text-slate-900 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary hover:after:w-full after:transition-all after:duration-300">Trust Indicators</a>
            <a href="#testimonials" className="hover:text-slate-900 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary hover:after:w-full after:transition-all after:duration-300">Testimonials</a>
          </div>

          {/* Auth CTA */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLoginClick}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 px-3 py-2 transition-all"
            >
              Log In
            </button>
            <Btn 
              onClick={handleSignUpClick}
              className="rounded-xl italic text-[9px] !h-10 px-5 bg-gradient-to-r from-primary to-indigo-650 hover:from-primary-hover hover:to-indigo-700 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              Sign Up
            </Btn>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <header className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 overflow-hidden bg-gradient-to-b from-white via-white to-transparent">
        {/* Soft Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 -z-10 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 blur-[160px] rounded-full translate-x-1/2 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[8px] font-black uppercase tracking-widest text-primary italic">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" /> Trusted Credit Partner
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-none text-slate-900 italic uppercase">
              Get a <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-violet-600 drop-shadow-sm">Personal Loan</span> <br />
              Fast.
            </h1>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Get approved quickly, manage payments easily, and stay connected through our secure loan management platform. 
              Arkad Finance provides modern, transparent credit products tailored to your needs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Btn 
                onClick={handleApplyForLoan} 
                className="w-full sm:w-auto !h-14 !px-8 text-[10px] font-black uppercase tracking-widest italic rounded-2xl bg-gradient-to-r from-primary to-indigo-650 hover:from-primary-hover hover:to-indigo-700 text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
              >
                Apply For Loan <ArrowRight size={14} className="ml-2 inline" />
              </Btn>
              <Btn 
                onClick={handleSignUpClick}
                variant="outline"
                className="w-full sm:w-auto !h-14 !px-8 text-[10px] font-black uppercase tracking-widest italic rounded-2xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm"
              >
                Become a Member
              </Btn>
            </div>
          </div>

          {/* Right Column: Premium Fintech Illustration */}
          <div className="lg:col-span-6 relative flex justify-center w-full">
            {/* Ambient behind illustration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-indigo-500/10 blur-[80px] rounded-full scale-75 -z-10" />

            <div className="w-full max-w-[480px] bg-white/70 border border-slate-200/80 rounded-[2.5rem] p-6 sm:p-8 relative backdrop-blur-2xl shadow-xl shadow-slate-200/30 space-y-4 hover:shadow-2xl transition-all duration-500 border-t-white">
              
              {/* Card Title */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Security Verification Nodes</span>
                <span className="text-[7px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20">SSL Secure</span>
              </div>

              {/* Stage 1: Identity Verification */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-white border border-slate-200/60 rounded-2xl flex items-center justify-between shadow-sm hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 font-bold shadow-sm">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-800 leading-none">Identity Verification</h4>
                    <p className="text-[8px] font-medium text-slate-400 mt-1">KYC Registry successfully verified</p>
                  </div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">Cleared</span>
              </motion.div>

              {/* Stage 2: Secure Processing */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-white border border-slate-200/60 rounded-2xl flex items-center justify-between shadow-sm hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 shadow-sm">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-800 leading-none">Secure Processing</h4>
                    <p className="text-[8px] font-medium text-slate-400 mt-1">Encrypted bank-grade transmission</p>
                  </div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">Active</span>
              </motion.div>

              {/* Stage 3: Fast Loan Approval */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-white border border-slate-200/60 rounded-2xl flex items-center justify-between shadow-sm hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center border border-violet-100 shadow-sm">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-800 leading-none">Fast Loan Approval</h4>
                    <p className="text-[8px] font-medium text-slate-400 mt-1">Processed in under 2 hours</p>
                  </div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded animate-pulse">Approved</span>
              </motion.div>

              {/* Stage 4: Funds Disbursement */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gradient-to-r from-primary/5 to-indigo-500/5 border border-primary/20 rounded-2xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-650 text-white flex items-center justify-center shadow-lg shadow-primary/20">
                    <Landmark size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-800 leading-none">Funds Disbursement</h4>
                    <p className="text-[8px] font-medium text-slate-400 mt-1">Direct payout authorization complete</p>
                  </div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-primary to-indigo-600 px-2.5 py-0.5 rounded shadow-sm">Disbursed</span>
              </motion.div>

            </div>
          </div>

        </div>
      </header>

      {/* ── COMPANY STATISTICS ── */}
      <section className="relative py-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-slate-100 to-indigo-50 border-y border-slate-200/60 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/60 border border-white rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-slate-100/50">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x-0 sm:divide-x divide-slate-200">
              {stats.map((stat, i) => (
                <div key={i} className="space-y-2 px-2">
                  <p className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-indigo-700">{stat.value}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative bg-slate-50">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
          <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">01 / Flow</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 italic uppercase">How It Works</h3>
          <p className="text-slate-500 text-sm font-medium">Four simple steps to secure your capital with absolute transparency.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-[4.5rem] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-primary/10 via-indigo-500/25 to-violet-500/10 -z-10" />

          {steps.map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -6 }}
              className="p-8 bg-white border border-slate-200/80 rounded-[2rem] relative group overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-t-white"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-[3rem] group-hover:scale-110 transition-transform" />
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-primary flex items-center justify-center text-base font-black italic mb-6 shadow-sm border border-indigo-100">{item.step}</div>
              <h4 className="text-base font-black text-slate-900 uppercase italic tracking-tight mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
              <p className="text-slate-500 text-[11px] font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TRUST INDICATORS ── */}
      <section id="why-choose-us" className="py-14 bg-white border-y border-slate-200/60 relative">
        {/* Soft decorative background circles */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50/20 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">02 / Security</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 italic uppercase">Trust Indicators</h3>
            <p className="text-slate-500 text-sm font-medium">Compliance, security, and processing architectures built to protect your identity.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustIndicators.map((item, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -4 }}
                className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4 hover:border-indigo-300/60 transition-all group shadow-sm hover:bg-white hover:shadow-md"
              >
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/85 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-105 transition-all shadow-sm">
                  <item.icon size={20} />
                </div>
                <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-tight group-hover:text-indigo-900 transition-colors">{item.title}</h4>
                <p className="text-slate-500 text-[11px] font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-14 bg-gradient-to-b from-slate-50 via-slate-100/40 to-slate-50 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">03 / Experience</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 italic uppercase leading-none">Customer Testimonials</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 text-left">
            {testimonials.map((t, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow space-y-4 border-t-white"
              >
                <div className="flex gap-1 text-amber-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium italic leading-relaxed">
                  "{t.comment}"
                </p>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-slate-900">{t.name}</h5>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.role}</p>
                  </div>
                  <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{t.loan}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-slate-200/60 py-10 text-slate-500 text-[10px] relative">
        {/* Subtle top decoration */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-12 pb-8 border-b border-slate-200/60">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-primary/20">
                <Landmark size={16} />
              </div>
              <span className="text-xs font-black tracking-tight text-slate-900 uppercase italic">ARKAD FINANCE</span>
            </div>
            <p className="leading-relaxed font-medium text-slate-400">
              Next-generation credit facility infrastructure for safe personal lending and secure compliance registry.
            </p>
          </div>

          {/* Links Column 1: About Us */}
          <div className="space-y-4">
            <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">About Us</h5>
            <p className="leading-relaxed font-medium text-slate-400">
              Arkad Finance provides trusted credit management technology solutions, enabling fast, transparent credit authorization.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Contact</h5>
            <div className="space-y-1 font-bold text-slate-600">
              <p>Monterrey, Nuevo León, MX</p>
              <p className="text-slate-455 hover:text-primary transition-colors">support@arkad.com</p>
              <p className="text-slate-455">+52 81 1234 5678</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
          <p className="font-medium text-slate-400">© 2026 Arkad Finance Ltd. All rights reserved. Secure Asset Management.</p>
        </div>
      </footer>

    </div>
  );
}
