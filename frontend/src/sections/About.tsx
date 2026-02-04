import React, { useEffect, useRef } from 'react';
import { Gem, Shirt, Truck, Shield, Award, Users } from 'lucide-react';
import Wrapper from '@/components/wrapper';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const About: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo('.about-header',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.about-header',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Stats animation
      gsap.fromTo('.about-stat',
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.about-stats',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Features animation
      gsap.fromTo('.about-feature',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.about-features',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Mission animation
      gsap.fromTo('.about-mission',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.about-mission',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Gem,
      title: 'Premium Jewellery',
      description: 'Handcrafted pieces using 18K gold, diamonds, and precious gemstones sourced from certified suppliers.',
    },
    {
      icon: Shirt,
      title: 'Designer Clothing',
      description: 'Curated collection of elegant fashion pieces from renowned designers and emerging talents.',
    },
    {
      icon: Truck,
      title: 'Global Shipping',
      description: 'Worldwide delivery with secure packaging and real-time tracking for peace of mind.',
    },
    {
      icon: Shield,
      title: 'Quality Guaranteed',
      description: 'Every product undergoes rigorous quality checks with certification and authenticity guarantees.',
    },
    {
      icon: Award,
      title: 'Wholesale Pricing',
      description: 'Competitive wholesale rates with volume discounts and flexible payment terms.',
    },
    {
      icon: Users,
      title: 'Dedicated Support',
      description: 'Personal account managers and 24/7 customer support for all your business needs.',
    },
  ];

  const stats = [
    { value: '10+', label: 'Years Experience' },
    { value: '5000+', label: 'Products' },
    { value: '50+', label: 'Countries Served' },
    { value: '10000+', label: 'Happy Clients' },
  ];

  return (
    <section id="about" ref={sectionRef} className="py-16 sm:py-24 bg-gradient-to-b from-black to-neutral-950">
      <Wrapper>
        {/* Header */}
        <div className="about-header text-center mb-10 sm:mb-16 opacity-0">
          <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 block">
            About Us
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Your Trusted <span className="text-gold">Wholesale</span> Partner
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed px-2 sm:px-0">
            Since 2014, Bismillah Wholesale has been the premier destination for retailers seeking 
            premium jewellery and designer clothing. We bridge the gap between luxury manufacturers 
            and businesses worldwide, offering unparalleled quality and service.
          </p>
        </div>

        {/* Stats */}
        <div className="about-stats grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-20">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="about-stat text-center p-4 sm:p-6 bg-white/5 border border-gold/20 opacity-0"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gold mb-1 sm:mb-2">{stat.value}</div>
              <div className="text-white/60 text-xs sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="about-features grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="about-feature group p-4 sm:p-6 bg-white/5 border border-white/10 hover:border-gold/50 transition-all duration-500 opacity-0"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gold/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-gold/20 transition-colors">
                <feature.icon className="w-5 h-5 sm:w-7 sm:h-7 text-gold" />
              </div>
              <h3 className="text-base sm:text-xl font-semibold text-white mb-2 sm:mb-3 group-hover:text-gold transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="about-mission mt-12 sm:mt-20 text-center p-6 sm:p-8 lg:p-12 bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 border border-gold/30 opacity-0">
          <h3
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-gold mb-3 sm:mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Our Mission
          </h3>
          <p className="text-white/70 max-w-3xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
            To empower retailers worldwide with access to exceptional luxury products at competitive wholesale prices, 
            while maintaining the highest standards of quality, authenticity, and customer service. 
            We believe every business deserves to offer their customers the very best.
          </p>
        </div>
      </Wrapper>
    </section>
  );
};

export default About;
