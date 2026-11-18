import React from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WhatsAppIcon from '../../WhatsAppIcon';
import { formatDoctorDisplayName, formatWhatsAppNumber } from '../../../utils/portfolioFormatters';

/**
 * PublicPortfolioInfo — Displays the clinician's biography, core expertise,
 * and an elevated Contact & Clinic consultation card (`#contact`).
 */
export default function PublicPortfolioInfo({
  bio,
  services,
  contactEmail,
  contactPhone,
  clinicName,
  clinicAddress,
  dentistName,
  isExpanded,
  onToggleExpand,
}) {
  const { t, i18n } = useTranslation('portfolio');
  const isArabic = i18n.language?.startsWith('ar');
  const doctorLabel = formatDoctorDisplayName(dentistName, isArabic);

  const waNumber = formatWhatsAppNumber(contactPhone);
  const waGreeting = isArabic
    ? `مرحباً ${doctorLabel}، أرغب في الاستفسار وحجز استشارة.`
    : `Hello ${doctorLabel}, I am interested in booking a consultation regarding your portfolio.`;
  const hasContactDetails = Boolean(contactPhone || contactEmail || clinicName || clinicAddress);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* ── Bio & Core Expertise Section ── */}
      <div className="lg:col-span-7 xl:col-span-8 w-full min-w-0">
        <section className="bg-base-200 border border-neutral-light rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden w-full">
          <h2 className="text-[11px] font-bold text-base-content/60 uppercase tracking-wider mb-3 flex items-center gap-2.5">
            <span className="w-6 h-px bg-primary/40 shrink-0" />
            <span>{t('public.professionalExperience')}</span>
          </h2>

          {bio ? (
            <div className="space-y-3 w-full min-w-0">
              <p
                className={`text-sm sm:text-base text-base-content/90 leading-relaxed max-w-2xl whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${
                  !isExpanded ? 'line-clamp-6' : ''
                }`}
              >
                {bio}
              </p>
              {bio.length > 360 && (
                <button
                  type="button"
                  onClick={onToggleExpand}
                  className="text-primary font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {isExpanded ? `↑ ${t('public.showLess')}` : `↓ ${t('public.readFullBio')}`}
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-base-content/60 italic font-medium">
              {t('public.infoNotAvailable')}
            </p>
          )}

          {/* Core Expertise Chips */}
          {services && services.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-light">
              <h3 className="text-[10px] font-bold text-base-content/60 uppercase tracking-wider mb-2.5">
                {t('public.coreExpertise')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {services.map((service, i) => (
                  <span
                    key={`${service}-${i}`}
                    className="px-3 py-1 bg-base-100 text-base-content text-xs font-bold rounded-lg border border-neutral-light hover:border-primary/40 hover:text-primary transition-colors break-words"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Dedicated Contact & Clinic Card (#contact) ── */}
      <div id="contact" className="lg:col-span-5 xl:col-span-4 scroll-mt-24">
        <aside className="bg-base-200 border border-neutral-light rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <MessageCircle size={16} />
            </div>
            <h2 className="text-sm font-bold text-base-content">
              {t('public.contactAndConsultation')}
            </h2>
          </div>

          {hasContactDetails ? (
            <>
              <div className="space-y-2">
                {waNumber && (
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waGreeting)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn btn-sm bg-[#00b85c] hover:bg-[#009f4f] text-white border-none rounded-xl font-bold gap-2 min-h-[40px] h-auto py-2 shadow-sm shadow-success/20"
                  >
                    <WhatsAppIcon size={17} className="shrink-0" />
                    <span className="truncate">{t('public.whatsappContact')}</span>
                  </a>
                )}

                {contactPhone && (
                  <a
                    href={`tel:${contactPhone.trim()}`}
                    className="w-full btn btn-sm bg-base-100 text-base-content border border-neutral-light hover:border-primary/40 hover:text-primary rounded-xl font-bold gap-2 min-h-[40px] h-auto py-2"
                  >
                    <Phone size={15} className="text-primary shrink-0" />
                    <span className="truncate">{t('public.callClinic')}</span>
                  </a>
                )}

                {contactEmail && (
                  <a
                    href={`mailto:${contactEmail.trim()}`}
                    className="w-full btn btn-sm bg-base-100 text-base-content border border-neutral-light hover:border-primary/40 hover:text-primary rounded-xl font-bold gap-2 min-h-[40px] h-auto py-2"
                  >
                    <Mail size={15} className="text-primary shrink-0" />
                    <span className="truncate">{t('public.sendEmail')}</span>
                  </a>
                )}
              </div>

              {(clinicName || clinicAddress) && (
                <div className="pt-3 border-t border-neutral-light flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-base-100 border border-neutral-light flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <MapPin size={14} />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/55">
                      {t('public.clinicLocation')}
                    </p>
                    {clinicName && (
                      <p className="text-xs sm:text-sm font-bold text-base-content break-words">
                        {clinicName}
                      </p>
                    )}
                    {clinicAddress && (
                      <p className="text-xs text-base-content/70 leading-relaxed break-words [overflow-wrap:anywhere]">
                        {clinicAddress}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-base-content/60 italic">
              {t('public.contactNotAvailable')}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
