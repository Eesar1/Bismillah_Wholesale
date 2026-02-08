import React, { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Gem, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';

interface HeroProps {
  onExploreProducts: () => void;
}

const Hero: React.FC<HeroProps> = ({ onExploreProducts }) => {
  const gemRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let isActive = true;

    const initAnimations = async () => {
      const { default: gsap } = await import('gsap');
      if (!isActive) return;

      // GSAP animations for floating elements
      if (gemRef.current) {
        gsap.to(gemRef.current, {
          y: -15,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      if (sparklesRef.current) {
        gsap.to(sparklesRef.current, {
          y: 15,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.5,
        });
      }

      // GSAP text reveal animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.hero-badge',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 }
      )
        .fromTo(
          '.hero-title span',
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.1 },
          '-=0.4'
        )
        .fromTo(
          '.hero-subtitle',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.6'
        )
        .fromTo(
          '.hero-stats',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.4'
        )
        .fromTo(
          '.hero-buttons',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.4'
        )
        .fromTo(
          '.hero-categories',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.4'
        );
    };

    void initAnimations();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt="Luxury Boutique"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
      </div>

      {/* Decorative Elements - Repositioned for mobile */}
      <div
        ref={gemRef}
        className="absolute top-[15%] left-[5%] sm:top-1/4 sm:left-10 text-gold/10 sm:text-gold/20 pointer-events-none hidden sm:block"
      >
        <Gem className="w-10 h-10 sm:w-16 sm:h-16" />
      </div>
      <div
        ref={sparklesRef}
        className="absolute bottom-[20%] right-[5%] sm:bottom-1/4 sm:right-10 text-gold/10 sm:text-gold/20 pointer-events-none hidden sm:block"
      >
        <Sparkles className="w-12 h-12 sm:w-20 sm:h-20" />
      </div>

      {/* Content */}
      <Wrapper className="relative z-10 pt-24 sm:pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="hero-badge mb-4 sm:mb-6 opacity-0">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-xs sm:text-sm tracking-wider">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              PREMIUM WHOLESALE COLLECTION
            </span>
          </div>

          {/* Main Heading */}
          <h1
            ref={titleRef}
            className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            <span className="inline-block opacity-0 text-gold">Luxury</span>{' '}
            <span className="inline-block opacity-0">Jewellery</span>
            <br className="hidden sm:block" />
            <span className="inline-block opacity-0">&</span>{' '}
            <span className="inline-block opacity-0 text-gold">Elegant</span>{' '}
            <span className="inline-block opacity-0">Fashion</span>
          </h1>

          {/* Subheading */}
          <p
            ref={subtitleRef}
            className="hero-subtitle text-base sm:text-lg lg:text-xl text-white/70 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0 opacity-0"
          >
            Discover our exclusive wholesale collection of premium jewellery and designer clothing. 
            Elevate your inventory with timeless elegance and unmatched quality.
          </p>

          {/* Stats */}
          <div className="hero-stats flex flex-wrap justify-center gap-6 sm:gap-8 mb-8 sm:mb-10 opacity-0">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gold">500+</div>
              <div className="text-xs sm:text-sm text-white/60">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gold">50+</div>
              <div className="text-xs sm:text-sm text-white/60">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gold">10K+</div>
              <div className="text-xs sm:text-sm text-white/60">Happy Clients</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hero-buttons flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center opacity-0">
            <Button
              onClick={onExploreProducts}
              size="lg"
              className="bg-gold hover:bg-gold-light text-black font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-none group w-full sm:w-auto"
            >
              Explore Collection
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-gold bg-transparent text-gold hover:bg-gold/15 hover:text-white hover:border-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-none w-full sm:w-auto"
            >
              Contact Us
            </Button>
          </div>

          {/* Category Preview */}
          <div className="hero-categories mt-10 sm:mt-16 flex flex-wrap justify-center gap-3 sm:gap-6 opacity-0">
            <div className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 bg-white/5 border border-white/10 rounded-lg">
              <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
              <span className="text-white/80 text-sm sm:text-base">Fine Jewellery</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 bg-white/5 border border-white/10 rounded-lg">
              <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
              <span className="text-white/80 text-sm sm:text-base">Designer Clothing</span>
            </div>
          </div>
        </div>
      </Wrapper>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
};

export default Hero;
