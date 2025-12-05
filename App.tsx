import React, { useState } from 'react';
import { BookOpen, PenTool, Feather, Mic, Layout, Search, Menu, X, ArrowRight, Star } from 'lucide-react';
import VoiceAgent from './components/VoiceAgent';
import ServiceForm from './components/ServiceForm';
import { ServiceType, ServicePackage } from './types';

const services: ServicePackage[] = [
  {
    id: 'ghostwriting',
    title: 'Ghostwriting',
    description: 'Our professional writers bring your ideas to life with a compelling narrative voice tailored to your vision.',
    icon: 'feather',
    priceRange: '$10k - $50k',
    type: ServiceType.Ghostwriting
  },
  {
    id: 'editorial',
    title: 'Editorial Assessment',
    description: 'A comprehensive review of your manuscript’s strengths and weaknesses with actionable feedback.',
    icon: 'search',
    priceRange: '$500 - $2k',
    type: ServiceType.EditorialAssessment
  },
  {
    id: 'copyediting',
    title: 'Copy Editing',
    description: 'Meticulous line-by-line polishing to ensure grammar, style, and consistency are flawless.',
    icon: 'pen-tool',
    priceRange: '$1k - $5k',
    type: ServiceType.CopyEditing
  },
  {
    id: 'cover-design',
    title: 'Cover Design',
    description: 'Market-ready, eye-catching book covers designed by award-winning illustrators.',
    icon: 'layout',
    priceRange: '$500 - $3k',
    type: ServiceType.CoverDesign
  },
  {
    id: 'marketing',
    title: 'Book Marketing',
    description: 'Strategic launch campaigns to maximize visibility and sales potential.',
    icon: 'mic',
    priceRange: '$2k - $10k',
    type: ServiceType.BookMarketing
  }
];

const getIcon = (name: string) => {
  switch(name) {
    case 'feather': return <Feather className="w-6 h-6" />;
    case 'search': return <Search className="w-6 h-6" />;
    case 'pen-tool': return <PenTool className="w-6 h-6" />;
    case 'layout': return <Layout className="w-6 h-6" />;
    case 'mic': return <Mic className="w-6 h-6" />;
    default: return <BookOpen className="w-6 h-6" />;
  }
};

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  const openForm = (service: ServiceType = ServiceType.GeneralInquiry) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-brand-700" />
              <span className="font-serif text-2xl font-bold text-brand-900">Write Chronicles</span>
            </div>
            
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#services" className="text-stone-600 hover:text-brand-700 transition-colors font-medium">Services</a>
              <a href="#process" className="text-stone-600 hover:text-brand-700 transition-colors font-medium">Process</a>
              <a href="#testimonials" className="text-stone-600 hover:text-brand-700 transition-colors font-medium">Stories</a>
              <button 
                onClick={() => openForm()}
                className="bg-brand-800 text-white px-6 py-2 rounded-full font-medium hover:bg-brand-700 transition-all hover:shadow-lg"
              >
                Get Started
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-stone-600">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-stone-200">
            <div className="px-4 pt-2 pb-4 space-y-1">
              <a href="#services" className="block px-3 py-2 text-stone-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Services</a>
              <a href="#process" className="block px-3 py-2 text-stone-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Process</a>
              <button 
                onClick={() => { openForm(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-brand-700 font-bold"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" className="text-brand-200" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block mb-4 px-4 py-1 bg-brand-100 text-brand-800 rounded-full text-sm font-semibold tracking-wide uppercase">
            Publishing Excellence
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-950 mb-6 leading-tight">
            Your Story, <br className="hidden md:block" />
            <span className="text-brand-600 italic">Masterfully Told.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-stone-600 mb-10 leading-relaxed">
            From manuscript to bestseller, Write Chronicles offers premier publishing services for authors who demand excellence. 
            <span className="block mt-2 font-medium text-brand-700">Talk to Page, our AI consultant, to begin.</span>
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => openForm()}
              className="px-8 py-4 bg-brand-800 text-white rounded-full font-semibold text-lg hover:bg-brand-700 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
            >
              Start Your Project <ArrowRight className="w-5 h-5" />
            </button>
            <a 
              href="#services"
              className="px-8 py-4 bg-white text-brand-800 border border-brand-200 rounded-full font-semibold text-lg hover:bg-brand-50 transition-all flex items-center justify-center"
            >
              Explore Services
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-900 mb-4">Crafted for Authors</h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Choose from our suite of professional services designed to elevate your work at every stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="group p-8 rounded-2xl bg-stone-50 border border-stone-100 hover:border-brand-200 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 transition-transform">
                  {getIcon(service.icon)}
                </div>
                <h3 className="text-xl font-serif font-bold text-brand-900 mb-3">{service.title}</h3>
                <p className="text-stone-600 mb-6 leading-relaxed">{service.description}</p>
                <div className="flex justify-between items-center pt-6 border-t border-stone-200">
                  <span className="text-sm font-medium text-stone-500">{service.priceRange}</span>
                  <button 
                    onClick={() => openForm(service.type)}
                    className="text-brand-700 font-semibold hover:text-brand-900 text-sm flex items-center gap-1"
                  >
                    Inquire <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Trust Section */}
      <section id="testimonials" className="py-20 bg-brand-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/2 -translate-y-1/2">
           <Feather className="w-96 h-96" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex gap-1 mb-6 text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <blockquote className="text-3xl font-serif leading-relaxed mb-8">
                "Write Chronicles didn't just edit my book; they understood its soul. The team transformed my rough manuscript into a polished masterpiece that hit the bestseller lists."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-700 rounded-full flex items-center justify-center font-serif font-bold text-xl">
                  ES
                </div>
                <div>
                  <div className="font-bold">Elena Sterling</div>
                  <div className="text-brand-300 text-sm">Best-selling Author, 'The Silent Key'</div>
                </div>
              </div>
            </div>
            
            <div className="bg-brand-800 p-8 rounded-2xl border border-brand-700">
              <h3 className="text-xl font-bold mb-4">Why Choose Write Chronicles?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 min-w-[20px]"><CheckCircle className="w-5 h-5 text-brand-300" /></div>
                  <span className="text-brand-100">Hand-picked industry veterans from top-tier publishing houses.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 min-w-[20px]"><CheckCircle className="w-5 h-5 text-brand-300" /></div>
                  <span className="text-brand-100">End-to-end support, from rough draft to global distribution.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 min-w-[20px]"><CheckCircle className="w-5 h-5 text-brand-300" /></div>
                  <span className="text-brand-100">AI-enhanced analytics for market positioning (ask Page about this!).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-100 pt-20 pb-10 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-6 h-6 text-brand-700" />
                <span className="font-serif text-xl font-bold text-brand-900">Write Chronicles</span>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed">
                Empowering authors to tell stories that matter. <br/>
                New York • London • Remote
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-brand-900 mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-stone-600">
                <li><a href="#" className="hover:text-brand-700">Ghostwriting</a></li>
                <li><a href="#" className="hover:text-brand-700">Editorial Assessment</a></li>
                <li><a href="#" className="hover:text-brand-700">Copy Editing</a></li>
                <li><a href="#" className="hover:text-brand-700">Book Marketing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-brand-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-stone-600">
                <li><a href="#" className="hover:text-brand-700">About Us</a></li>
                <li><a href="#" className="hover:text-brand-700">Careers</a></li>
                <li><a href="#" className="hover:text-brand-700">Blog</a></li>
                <li><a href="#" className="hover:text-brand-700">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-brand-900 mb-4">Newsletter</h4>
              <p className="text-sm text-stone-600 mb-4">Industry insights delivered to your inbox.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email" className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-sm" />
                <button className="px-4 py-2 bg-brand-800 text-white rounded-lg text-sm hover:bg-brand-700">Join</button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-stone-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-stone-500 text-sm">© {new Date().getFullYear()} Write Chronicles Inc. All rights reserved.</p>
            <div className="flex gap-6 text-stone-400">
              <a href="#" className="hover:text-brand-600 transition-colors">Twitter</a>
              <a href="#" className="hover:text-brand-600 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-brand-600 transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Components */}
      <ServiceForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        preSelectedService={selectedService} 
      />
      
      <VoiceAgent onOpenForm={(service) => openForm(service || ServiceType.GeneralInquiry)} />
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}