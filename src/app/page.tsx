'use client';

import Link from "next/link";
import Image from "next/image";
import { Search, Sparkles, Target, Shield, Zap, ArrowRight, CheckCircle2, Globe, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

// Animated counter component
function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
}

// Floating orb component
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div 
      className={`absolute rounded-full blur-3xl opacity-30 animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section - Full viewport height with gradient mesh */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Animated background orbs */}
        <FloatingOrb className="w-96 h-96 bg-purple-600 -top-20 -left-20" delay={0} />
        <FloatingOrb className="w-80 h-80 bg-blue-600 top-1/3 -right-20" delay={1} />
        <FloatingOrb className="w-64 h-64 bg-cyan-500 bottom-20 left-1/4" delay={2} />
        
        {/* Grid overlay for depth */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        
        <div className="container-glass relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Pill badge */}
            <div className={`inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full mb-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-sm text-gray-300">Now powered by UmukoziHR Intelligence</span>
            </div>
            
            {/* Main heading with gradient text */}
            <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
              <span className="text-white">Find Your </span>
              <span className="text-gradient">Dream Career</span>
              <br />
              <span className="text-white">in Africa</span>
            </h1>
            
            {/* Subheadline */}
            <p className={`text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed ${mounted ? 'animate-slide-up stagger-2' : 'opacity-0'}`}>
              AI-powered job matching meets tailored applications. 
              <span className="text-white"> One platform</span> connecting 
              <span className="text-gradient"> exceptional talent</span> with 
              <span className="text-white"> visionary employers.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 ${mounted ? 'animate-slide-up stagger-3' : 'opacity-0'}`}>
              <Link href="/jobs" className="btn-primary flex items-center gap-3 text-lg group">
                <Search className="h-5 w-5" />
                <span>Explore Opportunities</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/signup?type=employer" className="btn-secondary flex items-center gap-3 text-lg">
                <Target className="h-5 w-5" />
                <span>Post a Job</span>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className={`flex flex-wrap justify-center gap-8 text-gray-500 ${mounted ? 'animate-fade-in stagger-4' : 'opacity-0'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Verified Employers</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <span>Secure Applications</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>AI-Powered Matching</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
          <span className="text-sm">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Section - Floating glass cards */}
      <section className="py-20 relative">
        <div className="container-glass">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 10000, suffix: "+", label: "Active Jobs", icon: Target },
              { value: 50000, suffix: "+", label: "Candidates", icon: Users },
              { value: 2500, suffix: "+", label: "Companies", icon: Globe },
              { value: 95, suffix: "%", label: "Match Rate", icon: TrendingUp },
            ].map((stat, index) => (
              <div 
                key={index}
                className={`glass-card p-6 md:p-8 text-center group ${mounted ? 'animate-scale-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <stat.icon className="h-8 w-8 mx-auto mb-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Neumorphic cards */}
      <section className="section-padding relative">
        <div className="container-glass">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              The <span className="text-gradient">Future of Hiring</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the next generation of talent acquisition and career discovery.
            </p>
          </div>
          
          {/* Feature cards grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: AI Matching */}
            <div className="glass-card p-8 group">
              <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-pulse-glow">
                <Sparkles className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Matching</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Our intelligent algorithms analyze skills, experience, and preferences to connect you with opportunities that truly fit.
              </p>
              <ul className="space-y-3">
                {["Smart skill analysis", "Cultural fit scoring", "Real-time recommendations"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Feature 2: Tailor Integration */}
            <div className="glass-card p-8 group relative overflow-hidden">
              {/* Gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500" />
              
              <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-pulse-glow">
                <Target className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Tailor Integration</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Seamlessly import your profile and apply with professionally tailored resumes optimized for each position.
              </p>
              <ul className="space-y-3">
                {["One-click profile import", "JD-optimized resumes", "ATS-friendly formatting"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Feature 3: Verified Employers */}
            <div className="glass-card p-8 group">
              <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-pulse-glow">
                <Shield className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Verified Employers</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Every company is vetted to ensure authentic opportunities and protect your job search experience.
              </p>
              <ul className="space-y-3">
                {["Verified company profiles", "Transparent job listings", "Direct communication"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Steps with connecting line */}
      <section className="section-padding relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
        
        <div className="container-glass relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It <span className="text-gradient">Works</span>
            </h2>
          </div>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500 to-purple-500/0 -translate-y-1/2" />
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Create Profile", desc: "Sign up and build your professional profile in minutes" },
                { step: "02", title: "Get Matched", desc: "Our AI analyzes your skills and finds perfect opportunities" },
                { step: "03", title: "Tailor & Apply", desc: "Apply with resumes customized for each position" },
                { step: "04", title: "Land Your Role", desc: "Connect with employers and secure your dream job" },
              ].map((item, index) => (
                <div key={index} className="relative text-center group">
                  {/* Step number bubble */}
                  <div className="relative z-10 mx-auto w-20 h-20 rounded-full neu-raised flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-gradient">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Glassmorphic with pulsing glow */}
      <section className="section-padding relative">
        <div className="container-glass">
          <div className="relative glass-card p-12 md:p-20 text-center overflow-hidden">
            {/* Background gradient effects */}
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-600/30 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full neu-raised mb-8 animate-pulse-glow">
                <Image 
                  src="/umukozi-logo.png" 
                  alt="UmukoziHR" 
                  width={48} 
                  height={48}
                  className="rounded-lg"
                />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your
                <span className="block text-gradient mt-2">Career Journey?</span>
              </h2>
              
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Join thousands of professionals and companies already experiencing the future of recruitment.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup?type=candidate" className="btn-primary flex items-center justify-center gap-3 text-lg">
                  Create Free Profile
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/signup?type=employer" className="btn-glass flex items-center justify-center gap-3 text-lg">
                  <Globe className="h-5 w-5" />
                  Start Hiring Today
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}