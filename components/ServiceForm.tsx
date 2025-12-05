import React, { useEffect, useState } from 'react';
import { ServiceType, FormState } from '../types';
import { X, CheckCircle, Send } from 'lucide-react';

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService: ServiceType | null;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ isOpen, onClose, preSelectedService }) => {
  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    service: ServiceType.GeneralInquiry,
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      if (preSelectedService) {
        setFormState(prev => ({ ...prev, service: preSelectedService }));
      }
    }
  }, [isOpen, preSelectedService]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-brand-900 mb-2">Request Received</h3>
              <p className="text-stone-600">
                Thank you, {formState.name}. Our team will review your inquiry about {formState.service} and get back to you shortly.
              </p>
              <button 
                onClick={onClose} 
                className="mt-8 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-serif font-bold text-brand-900 mb-2">Start Your Journey</h2>
              <p className="text-stone-600 mb-6">Tell us about your project. Our team is ready to help.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                    placeholder="Jane Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    value={formState.email}
                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Service Interested In</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white"
                    value={formState.service}
                    onChange={(e) => setFormState({...formState, service: e.target.value as ServiceType})}
                  >
                    {Object.values(ServiceType).map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Project Details</label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all h-32 resize-none"
                    placeholder="Tell us about your book..."
                    value={formState.message}
                    onChange={(e) => setFormState({...formState, message: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-800 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Request
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceForm;