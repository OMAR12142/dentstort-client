import React from 'react';
import { Mail } from 'lucide-react';
import WhatsAppIcon from '../../WhatsAppIcon';

/**
 * PublicPortfolioInfo — Displays the clinician's biography, services, and contact options.
 */
export default function PublicPortfolioInfo({ 
  bio, 
  services, 
  contactEmail, 
  contactPhone, 
  dentistName,
  isExpanded, 
  onToggleExpand 
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-12 gap-8 items-start">

        {/* Bio Section */}
        <div className="lg:col-span-8 w-full overflow-hidden">
          <section className="rounded-2xl p-5 sm:p-8 overflow-hidden w-full">
            <h2 className="text-xs font-bold text-[#666666] dark:text-gray-400 uppercase mb-1 flex items-center gap-3">
              <span className="w-8 h-px bg-[#0A66C2]/30" /> Professional Experience
            </h2>
            {bio ? (
              <div className="space-y-4 w-full">
                <p className={`text-base sm:text-lg text-[#191919] dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words overflow-hidden ${!isExpanded ? 'line-clamp-[12]' : ''}`}>
                  {bio}
                </p>
                {bio.length > 500 && (
                  <button
                    onClick={onToggleExpand}
                    className="text-[#0A66C2] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity mt-4"
                  >
                    {isExpanded ? '↑ Show Less' : '↓ Read Full Bio'}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-[#666666] dark:text-gray-500 italic font-medium">Information not available</p>
            )}

            {/* Services Badges Integration */}
            {services && services.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#E0DFDC] dark:border-[#3A3A3A]">
                <h3 className="text-[10px] font-black text-[#666666] uppercase tracking-[0.2em] mb-4">Core Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {services.map((service, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-[#0A66C2]/5 text-[#0A66C2] text-xs font-bold rounded-xl border border-[#0A66C2]/20 hover:bg-[#0A66C2]/10 transition-colors"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Contact Section */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl sm:p-8 shadow-sm h-full flex flex-col justify-between">
            <div className="space-y-4 mt-auto">
              {contactPhone && (
                <a
                  href={`https://wa.me/${contactPhone.replace(/\D/g, '').startsWith('0') ? '20' + contactPhone.replace(/\D/g, '').substring(1) : contactPhone.replace(/\D/g, '').startsWith('20') ? contactPhone.replace(/\D/g, '') : '20' + contactPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello Dr. ${dentistName}, I am interested in booking a consultation regarding your portfolio.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn bg-[#00c066] hover:bg-[#18a666] text-white border-none rounded-xl font-bold gap-2 h-12 shadow-lg shadow-[#057642]/20"
                >
                  <WhatsAppIcon size={18} /> WhatsApp Contact
                </a>
              )}
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="w-full btn bg-white dark:bg-[#3A3A3A] text-[#191919] dark:text-white border border-[#E0DFDC] dark:border-[#3A3A3A] hover:bg-gray-50 dark:hover:bg-[#444] rounded-xl font-bold gap-2 h-12">
                  <Mail size={18} /> Send Email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
