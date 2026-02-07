import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Wrapper from '@/components/wrapper';
import emailjs from 'emailjs-com';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const emailServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
  const emailTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
  const emailPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;
  const emailTo = import.meta.env.VITE_EMAILJS_TO_EMAIL as string | undefined;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.contact-header',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-header',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo('.contact-info-card',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-info',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo('.contact-form',
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (!emailServiceId || !emailTemplateId || !emailPublicKey) {
        throw new Error('Email service is not configured.');
      }

      await emailjs.send(
        emailServiceId,
        emailTemplateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          to_email: emailTo || undefined,
        },
        emailPublicKey
      );
      setShowSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.log('Email error:', error);
      setErrorMessage('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }

  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: ['info@bismillahwholesale.com', 'orders@bismillahwholesale.com'],
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+92 300 1234567', '+92 301 7654321'],
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['123 Business Avenue', 'Lahore, Pakistan'],
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Mon - Sat: 9AM - 6PM', 'Sun: Closed'],
    },
  ];

  return (
    <section id="contact" ref={sectionRef} className="py-16 sm:py-24 bg-black">
      <Wrapper>
        {/* Header */}
        <div className="contact-header text-center mb-10 sm:mb-16 opacity-0">
          <span className="text-gold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 block">
            Get In Touch
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Contact <span className="text-gold">Us</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg px-2 sm:px-0">
            Have questions about our wholesale program? We would love to hear from you. 
            Reach out and our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Contact Info Cards */}
          <div className="contact-info lg:col-span-1 space-y-3 sm:space-y-4">
            {contactInfo.map((info) => (
              <div
                key={info.title}
                className="contact-info-card p-4 sm:p-5 bg-white/5 border border-white/10 hover:border-gold/50 transition-all duration-300 opacity-0"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{info.title}</h3>
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-white/60 text-xs sm:text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="contact-form lg:col-span-2 opacity-0">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 bg-white/5 border border-gold/20">
              <h3 className="text-xl sm:text-2xl text-white font-semibold mb-4 sm:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Send us a Message
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-white/70 text-sm">Your Name *</Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-white/5 border-white/20 text-white focus:border-gold rounded-none text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-white/70 text-sm">Email Address *</Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-white/5 border-white/20 text-white focus:border-gold rounded-none text-sm"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-white/70 text-sm">Phone Number</Label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-white/5 border-white/20 text-white focus:border-gold rounded-none text-sm"
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-white/70 text-sm">Subject *</Label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="bg-white/5 border-white/20 text-white focus:border-gold rounded-none text-sm"
                    placeholder="How can we help?"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                <Label className="text-white/70 text-sm">Your Message *</Label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="bg-white/5 border-white/20 text-white focus:border-gold rounded-none resize-none text-sm"
                  placeholder="Tell us about your wholesale needs..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold hover:bg-gold-light text-black rounded-none py-4 sm:py-6 font-semibold disabled:opacity-50 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </>
                )}
              </Button>
              {errorMessage && (
                <p className="mt-3 text-sm text-red-400">{errorMessage}</p>
              )}
            </form>
          </div>
        </div>
      </Wrapper>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-black border border-gold/30 max-w-md">
          <div className="text-center py-6 sm:py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
            >
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-gold" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl text-white font-bold mb-2">Message Sent!</h3>
            <p className="text-white/60 mb-4 sm:mb-6 text-sm sm:text-base px-2">
              Thank you for reaching out. We will get back to you within 24 hours.
            </p>
            <Button
              onClick={() => setShowSuccess(false)}
              className="bg-gold hover:bg-gold-light text-black rounded-none text-sm"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Contact;
