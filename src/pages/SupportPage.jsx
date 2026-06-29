import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Headset } from 'lucide-react';
import SEO from '../components/common/SEO';

export default function SupportPage() {
  return (
    <>
      <SEO title="Support | DentStory" />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div className="bg-base-100 rounded-3xl p-8 border border-neutral-light shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Headset size={32} className="text-primary" />
          </div>
          
          <h1 className="text-2xl font-black text-base-content mb-3">How can we help you?</h1>
          <p className="text-base-content/70 font-medium mb-10 max-w-md mx-auto">
            Have questions, feedback, or need technical assistance? Our support team is ready to help you get the most out of DentStory.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="https://wa.me/201098854397?text=Hello%20DentStory%20Support,"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base-content group-hover:text-emerald-500 transition-colors">WhatsApp Support</h3>
                <p className="text-xs text-base-content/60 font-medium mt-1">Quickest response time</p>
              </div>
            </a>

            <a
              href="mailto:omarselema52@gmail.com?subject=DentStory Support Request"
              className="flex items-center gap-4 p-5 rounded-2xl bg-base-200 border border-neutral-light hover:bg-base-300 transition-colors group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-base-300 text-base-content flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base-content">Email Us</h3>
                <p className="text-xs text-base-content/60 font-medium mt-1">omarselema52@gmail.com</p>
              </div>
            </a>
          </div>
        </div>
      </motion.div>
    </>
  );
}
