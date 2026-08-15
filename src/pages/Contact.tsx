import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { useStoreConfigStore } from '../store/useStoreConfigStore';
import SEO from '../components/SEO';

export default function Contact() {
  const { config } = useStoreConfigStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <SEO 
        title={`Contact Us | Rare Dreams`}
        description="Get in touch with Rare Dreams. We're here to help you with any questions about our luxury fashion collections."
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-8 font-medium text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
          Back
        </button>
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-neutral-900 tracking-tight">Contact Us</h1>
          <p className="text-neutral-500 text-lg">
            We're here to help. Reach out to us for any questions about our products, your order, or just to say hello.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Information */}
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-neutral-900">Get in Touch</h2>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                Whether you need styling advice, order assistance, or have a general inquiry, our dedicated support team is ready to assist you.
              </p>
            </div>

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <Phone className="text-neutral-900" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Phone Number</h3>
                  <p className="text-neutral-600">{config.helplineNumber || '01954710343'}</p>
                  <p className="text-xs text-neutral-500 mt-1">Available 10:00 AM - 10:00 PM (Everyday)</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <Mail className="text-neutral-900" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Email Address</h3>
                  <p className="text-neutral-600">{config.supportEmail || 'xmrezaul.karim998@gmail.com'}</p>
                  <p className="text-xs text-neutral-500 mt-1">We aim to reply within 24 hours.</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <MapPin className="text-neutral-900" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Showroom Location</h3>
                  <p className="text-neutral-600 max-w-xs">{config.address || 'Level 4, Block B, Jamuna Future Park, Dhaka, Bangladesh'}</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-100">
              <h3 className="font-bold text-neutral-900 mb-4 uppercase tracking-wider text-sm">Connect With Us</h3>
              <div className="flex items-center gap-4">
                <a 
                  href={config.facebookUrl || "https://facebook.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white transition-all text-neutral-600"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a 
                  href={config.instagramUrl || "https://instagram.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-[#E1306C] hover:border-[#E1306C] hover:text-white transition-all text-neutral-600"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a 
                  href={config.tiktokUrl || "https://tiktok.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-black hover:border-black hover:text-white transition-all text-neutral-600"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-neutral-50 p-8 md:p-10 rounded-2xl border border-neutral-100">
            <h3 className="text-2xl font-bold mb-6 text-neutral-900">Send a Message</h3>
            
            {isSuccess ? (
              <div className="bg-green-50 text-green-800 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3 py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <Send className="text-green-600" size={24} />
                </div>
                <h4 className="text-xl font-bold">Message Sent!</h4>
                <p className="text-green-700">Thank you for reaching out. We will get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-bold text-neutral-700">Full Name *</label>
                    <input 
                      type="text" 
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold text-neutral-700">Email Address *</label>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-bold text-neutral-700">Phone Number (Optional)</label>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      placeholder="+880 1XXX-XXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-bold text-neutral-700">Subject *</label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    >
                      <option value="" disabled>Select a subject</option>
                      <option value="Order Status">Order Status</option>
                      <option value="Returns & Exchanges">Returns & Exchanges</option>
                      <option value="Product Inquiry">Product Inquiry</option>
                      <option value="Wholesale">Wholesale / B2B</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-bold text-neutral-700">Message *</label>
                  <textarea 
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-black hover:bg-neutral-800 text-white rounded-xl px-6 py-4 text-sm font-bold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      SENDING...
                    </>
                  ) : (
                    <>
                      SEND MESSAGE <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
