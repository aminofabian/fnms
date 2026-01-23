"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingCart, Package, Mail, ArrowRight, Check, Truck, Leaf, Phone, Sparkles, Clock } from "lucide-react";

export default function ComingSoonPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Calculate 2 weeks from now
  useEffect(() => {
    setIsClient(true);
    setMounted(true);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14);

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      console.log("Email submitted:", email);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-[#fafafa] to-[#f5f5f5]">
      {/* Sophisticated animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(154, 205, 50, 0.4), transparent 70%)',
            animationDuration: '8s'
          }} 
        />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-15 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(255, 140, 0, 0.3), transparent 70%)',
            animationDuration: '10s',
            animationDelay: '2s'
          }} 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-10"
          style={{ 
            background: 'radial-gradient(circle, rgba(154, 205, 50, 0.2), transparent 70%)',
          }} 
        />
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header with Logo */}
        <header className="w-full px-6 md:px-8 lg:px-12 pt-8 md:pt-12 pb-4">
          <div className="max-w-7xl mx-auto flex justify-end">
            <div className="relative group">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-[#9ACD32]/20 to-[#FF8C00]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image
                src="/fnms.png"
                alt="FnM's Mini Mart Logo"
                width={300}
                height={300}
                className="relative w-auto h-20 md:h-28 lg:h-36 object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </div>
        </header>

        {/* Main content wrapper */}
        <main className="flex-1 px-6 md:px-8 lg:px-12 pb-16 md:pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-12 md:space-y-16 lg:space-y-20">
              
              {/* Hero Section */}
              <div className="space-y-6 md:space-y-8 animate-fade-in">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-[#9ACD32]/10 to-[#FF8C00]/10 border border-[#9ACD32]/20 mb-4">
                  <Clock className="w-4 h-4 text-[#9ACD32]" />
                  <span className="text-sm font-semibold text-gray-700">Launching Soon</span>
                </div>
                
                <h1 className="space-y-4">
                  <div className="inline-block">
                    <span 
                      className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight block mb-4 bg-gradient-to-r from-[#9ACD32] via-[#9ACD32] to-[#FF8C00] bg-clip-text text-transparent"
                      style={{
                        textShadow: '0 0 40px rgba(154, 205, 50, 0.1)'
                      }}
                    >
                      Coming Soon
                    </span>
                    <div className="h-2 w-32 md:w-40 mx-auto rounded-full bg-gradient-to-r from-[#9ACD32] via-[#FF8C00] to-[#9ACD32] shadow-lg shadow-[#9ACD32]/30" />
                  </div>
                </h1>
                
                <p className="text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto leading-relaxed font-light text-gray-700">
                  Fresh groceries, everyday essentials, and more—all delivered to your door.
                  <br className="hidden md:block" />
                  <span className="text-[#9ACD32] font-medium">Your neighborhood mini mart, now online.</span>
                </p>
              </div>

              {/* Countdown Timer - Enhanced */}
              <div className="py-8 md:py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
                  {[
                    { label: "Days", value: timeLeft.days, color: '#9ACD32', gradient: 'from-[#9ACD32] to-[#7CB342]' },
                    { label: "Hours", value: timeLeft.hours, color: '#FF8C00', gradient: 'from-[#FF8C00] to-[#FFA500]' },
                    { label: "Minutes", value: timeLeft.minutes, color: '#9ACD32', gradient: 'from-[#9ACD32] to-[#7CB342]' },
                    { label: "Seconds", value: timeLeft.seconds, color: '#FF8C00', gradient: 'from-[#FF8C00] to-[#FFA500]' },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className="relative group"
                      style={{
                        animation: mounted ? `fadeInUp 0.6s ease-out ${index * 0.1}s both` : 'none'
                      }}
                    >
                      {/* Glow effect */}
                      <div 
                        className={`absolute -inset-1 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-br ${item.gradient}`}
                      />
                      
                      {/* Card */}
                      <div className="relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1">
                        <div 
                          className={`text-5xl md:text-6xl lg:text-7xl font-black mb-4 tabular-nums bg-gradient-to-br ${item.gradient} bg-clip-text text-transparent`}
                        >
                          {String(item.value).padStart(2, "0")}
                        </div>
                        <div className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-gray-500">
                          {item.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email signup form - Premium design */}
              <div className="max-w-2xl mx-auto py-8">
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                      {/* Outer glow */}
                      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#FF8C00]/30 via-[#9ACD32]/30 to-[#FF8C00]/30 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Form container */}
                      <div className="relative bg-white/80 backdrop-blur-md border-2 border-gray-200/50 rounded-3xl p-4 md:p-5 shadow-2xl group-hover:shadow-[#FF8C00]/20 transition-all duration-500">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#FF8C00]/10 to-[#FF8C00]/5 flex-shrink-0">
                              <Mail className="w-5 h-5 text-[#FF8C00]" />
                            </div>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter your email address"
                              className="flex-1 bg-transparent border-0 outline-none text-base md:text-lg text-gray-800 placeholder:text-gray-400 min-w-0"
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            className="relative overflow-hidden rounded-2xl px-8 md:px-10 py-4 font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            style={{ 
                              background: 'linear-gradient(135deg, #FF8C00, #FFA500)',
                            }}
                          >
                            <span className="relative z-10">Notify Me</span>
                            <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FFA500] to-[#FF8C00] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-600 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#9ACD32]" />
                      Be the first to know when we launch. No spam, promise.
                    </p>
                  </form>
                ) : (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#9ACD32]/30 to-[#FF8C00]/20 blur-2xl opacity-60" />
                    <div className="relative flex items-center justify-center gap-5 bg-white/90 backdrop-blur-md border-2 border-[#9ACD32]/30 rounded-3xl p-8 md:p-10 shadow-2xl">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl bg-gradient-to-br from-[#9ACD32] to-[#7CB342] animate-scale-in">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xl md:text-2xl text-gray-900 mb-1">You&apos;re on the list!</div>
                        <div className="text-base md:text-lg text-gray-600">
                          We&apos;ll notify you when we launch.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information - Enhanced */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 py-8">
                <a 
                  href="mailto:support@fmns.co.ke" 
                  className="group relative flex items-center gap-3 px-6 md:px-8 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-[#9ACD32]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#9ACD32]/40 min-w-[280px] justify-center"
                >
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#9ACD32]/10 to-[#9ACD32]/5 group-hover:from-[#9ACD32]/20 group-hover:to-[#9ACD32]/10 transition-all">
                    <Mail className="w-5 h-5 text-[#9ACD32]" />
                  </div>
                  <span className="font-semibold text-gray-800 group-hover:text-[#9ACD32] transition-colors">support@fmns.co.ke</span>
                </a>
                <a 
                  href="tel:0721530181" 
                  className="group relative flex items-center gap-3 px-6 md:px-8 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-[#FF8C00]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#FF8C00]/40 min-w-[280px] justify-center"
                >
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#FF8C00]/10 to-[#FF8C00]/5 group-hover:from-[#FF8C00]/20 group-hover:to-[#FF8C00]/10 transition-all">
                    <Phone className="w-5 h-5 text-[#FF8C00]" />
                  </div>
                  <span className="font-semibold text-gray-800 group-hover:text-[#FF8C00] transition-colors">0721530181</span>
                </a>
              </div>

              {/* Features preview - Premium cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 max-w-6xl mx-auto py-12">
                {[
                  {
                    icon: Leaf,
                    title: "Fresh Produce",
                    description: "Daily fresh fruits, vegetables & more delivered straight from local farms",
                    color: '#9ACD32',
                    gradient: 'from-[#9ACD32] to-[#7CB342]',
                  },
                  {
                    icon: Truck,
                    title: "Fast Delivery",
                    description: "Quick and reliable delivery service right to your doorstep",
                    color: '#FF8C00',
                    gradient: 'from-[#FF8C00] to-[#FFA500]',
                  },
                  {
                    icon: Package,
                    title: "Best Prices",
                    description: "Competitive prices and great deals on all your daily essentials",
                    color: '#9ACD32',
                    gradient: 'from-[#9ACD32] to-[#7CB342]',
                  },
                ].map((feature, index) => (
                  <div
                    key={feature.title}
                    className="relative group"
                    style={{
                      animation: mounted ? `fadeInUp 0.6s ease-out ${(index + 4) * 0.1}s both` : 'none'
                    }}
                  >
                    {/* Glow effect */}
                    <div className={`absolute -inset-1 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.gradient}`} />
                    
                    {/* Card */}
                    <div className="relative h-full bg-white/90 backdrop-blur-sm border-2 border-gray-200/50 rounded-3xl p-8 md:p-10 text-center space-y-6 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-2 shadow-lg bg-gradient-to-br ${feature.gradient} group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="font-bold text-2xl text-gray-900">{feature.title}</h3>
                      <p className="text-base leading-relaxed text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
