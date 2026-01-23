"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingCart, Package, Mail, ArrowRight, Check, Truck, Leaf, Phone } from "lucide-react";

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

  // Calculate 2 weeks from now
  useEffect(() => {
    setIsClient(true);
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
      // Here you would typically send the email to your backend
      console.log("Email submitted:", email);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: 'rgba(154, 205, 50, 0.15)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: 'rgba(255, 140, 0, 0.1)', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: 'rgba(154, 205, 50, 0.05)', animationDelay: '2s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen px-4 py-8 md:py-12">
        <div className="max-w-6xl w-full mx-auto">
          {/* Logo Section - Top Right */}
          <div className="flex justify-end mb-6 md:mb-12 pt-4">
            <Image
              src="/fnms.png"
              alt="FnM's Mini Mart Logo"
              width={300}
              height={300}
              className="w-auto h-24 md:h-32 lg:h-40 object-contain"
              priority
            />
          </div>

            {/* Main content wrapper */}
            <div className="text-center space-y-10 md:space-y-12">

            {/* Main heading */}
            <div className="space-y-5 md:space-y-6">
              <div className="inline-block">
                <span className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight block mb-2" 
                  style={{ color: '#9ACD32' }}>
                  Coming Soon
                </span>
                <div className="h-1.5 w-24 md:w-32 mx-auto rounded-full" 
                  style={{ background: 'linear-gradient(90deg, #9ACD32, #FF8C00)' }} 
                />
              </div>
              <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed" 
                style={{ color: 'rgba(0, 0, 0, 0.75)' }}>
                Fresh groceries, everyday essentials, and more—all delivered to your door. 
                Your neighborhood mini mart, now online.
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              {[
                { label: "Days", value: timeLeft.days, color: '#9ACD32' },
                { label: "Hours", value: timeLeft.hours, color: '#FF8C00' },
                { label: "Minutes", value: timeLeft.minutes, color: '#9ACD32' },
                { label: "Seconds", value: timeLeft.seconds, color: '#FF8C00' },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className="relative group transform transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute -inset-1 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity" 
                    style={{ backgroundColor: item.color + '40' }} 
                  />
                  <div className="relative bg-white border-2 rounded-2xl p-6 md:p-8 shadow-xl" 
                    style={{ borderColor: item.color + '30' }}>
                    <div className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-3 tabular-nums" 
                      style={{ color: item.color }}>
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <div className="text-xs md:text-sm font-semibold uppercase tracking-widest" 
                      style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                      {item.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Email signup form */}
            <div className="max-w-lg mx-auto">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-3xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity" 
                    style={{ background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.3), rgba(154, 205, 50, 0.2))' }} 
                  />
                  <div className="relative flex items-center gap-3 bg-white border-2 rounded-3xl p-3 shadow-xl" 
                    style={{ borderColor: 'rgba(255, 140, 0, 0.2)' }}>
                    <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(255, 140, 0, 0.1)' }}>
                      <Mail className="w-5 h-5" style={{ color: '#FF8C00' }} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email to get notified"
                      className="flex-1 bg-transparent border-0 outline-none px-2 py-2 text-base"
                      style={{ color: '#000000' }}
                      required
                    />
                    <button
                      type="submit"
                      className="rounded-xl px-6 md:px-8 py-3 font-semibold transition-all flex items-center gap-2 group/btn shadow-lg transform hover:scale-105"
                      style={{ 
                        background: 'linear-gradient(135deg, #FF8C00, #FFA500)',
                        color: '#FFFFFF' 
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      Notify Me
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
                <p className="text-sm md:text-base" style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
                  Be the first to know when we launch. No spam, promise.
                </p>
              </form>
            ) : (
              <div className="relative">
                <div className="absolute -inset-1 rounded-3xl blur-lg opacity-60" 
                  style={{ background: 'linear-gradient(135deg, rgba(154, 205, 50, 0.3), rgba(255, 140, 0, 0.2))' }} 
                />
                <div className="relative flex items-center justify-center gap-4 bg-white border-2 rounded-3xl p-6 md:p-8 shadow-xl" 
                  style={{ borderColor: 'rgba(154, 205, 50, 0.3)' }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" 
                    style={{ background: 'linear-gradient(135deg, #9ACD32, #7CB342)' }}>
                    <Check className="w-7 h-7" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg md:text-xl" style={{ color: '#000000' }}>You&apos;re on the list!</div>
                    <div className="text-sm md:text-base" style={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                      We&apos;ll notify you when we launch.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

            {/* Contact Information */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8">
              <a 
                href="mailto:support@fmns.co.ke" 
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 group"
                style={{ borderColor: 'rgba(154, 205, 50, 0.3)' }}
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(154, 205, 50, 0.1)' }}>
                  <Mail className="w-5 h-5" style={{ color: '#9ACD32' }} />
                </div>
                <span className="font-medium" style={{ color: '#000000' }}>support@fmns.co.ke</span>
              </a>
              <a 
                href="tel:0721530181" 
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 group"
                style={{ borderColor: 'rgba(255, 140, 0, 0.3)' }}
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 140, 0, 0.1)' }}>
                  <Phone className="w-5 h-5" style={{ color: '#FF8C00' }} />
                </div>
                <span className="font-medium" style={{ color: '#000000' }}>0721530181</span>
              </a>
            </div>

            {/* Features preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Leaf,
                  title: "Fresh Produce",
                  description: "Daily fresh fruits, vegetables & more",
                  color: '#9ACD32',
                },
                {
                  icon: Truck,
                  title: "Fast Delivery",
                  description: "Quick delivery to your doorstep",
                  color: '#FF8C00',
                },
                {
                  icon: Package,
                  title: "Best Prices",
                  description: "Great deals on all your essentials",
                  color: '#9ACD32',
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="relative group transform transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div className="absolute -inset-1 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" 
                    style={{ backgroundColor: feature.color + '40' }} 
                  />
                  <div className="relative bg-white border-2 rounded-2xl p-8 text-center space-y-4 shadow-xl" 
                    style={{ borderColor: feature.color + '30' }}>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" 
                      style={{ 
                        background: `linear-gradient(135deg, ${feature.color}, ${feature.color}DD)`,
                      }}>
                      <feature.icon className="w-8 h-8" style={{ color: '#FFFFFF' }} />
                    </div>
                    <h3 className="font-bold text-xl" style={{ color: '#000000' }}>{feature.title}</h3>
                    <p className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 2 === 0 ? 'rgba(154, 205, 50, 0.4)' : 'rgba(255, 140, 0, 0.4)',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
