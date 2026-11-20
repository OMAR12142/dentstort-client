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
  whatsappPhone,
  clinicName,
  clinicAddress,
  dentistName,
  visibility,
  isExpanded,
  onToggleExpand,
}) {
  const { t, i18n } = useTranslation('portfolio');
  const isArabic = i18n.language?.startsWith('ar');
  const doctorLabel = formatDoctorDisplayName(dentistName, isArabic);

  // Visibility checks
  const hasVisibleBio = Boolean(bio) && visibility?.bio !== false;
  const hasVisibleSpecialties = Boolean(services && services.length > 0) && visibility?.specialties !== false;
  const hasBioSection = hasVisibleBio || hasVisibleSpecialties;

  const waRaw = visibility?.whatsapp !== false ? (whatsappPhone || contactPhone) : '';
  const waNumber = formatWhatsAppNumber(waRaw);
  const waGreeting = isArabic
    ? `مرحباً ${doctorLabel}، أرغب في الاستفسار وحجز استشارة.`
    : `Hello ${doctorLabel}, I am interested in booking a consultation regarding your portfolio.`;

  const hasWa = Boolean(waNumber) && visibility?.whatsapp !== false;
  const hasPhone = Boolean(contactPhone) && visibility?.phone !== false;
  const hasEmail = Boolean(contactEmail) && visibility?.email !== false;
  const showClinicInfo = visibility?.clinicInfo !== false;
  const showLocationCard = visibility?.locationCard !== false;
  const hasLocation = Boolean((clinicName && showClinicInfo) || (clinicAddress && showLocationCard));

  const hasContactCard = hasWa || hasPhone || hasEmail || hasLocation;

  // Complete collapse if neither bio nor contact has any visible content
  if (!hasBioSection && !hasContactCard) {
    return null;
  }

  const isBothVisible = hasBioSection && hasContactCard;

  return (
    <div className={isBothVisible ? 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-start' : 'w-full'}>
      {/* ── Bio & Core Expertise Section ── */}
      {hasBioSection && (
        <div className={isBothVisible ? 'lg:col-span-7 xl:col-span-8 w-full min-w-0' : 'w-full max-w-4xl mx-auto min-w-0'}>
          <section className="bg-base-200 border border-neutral-light rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden w-full">
            <h2 className="text-[11px] font-bold text-base-content/60 uppercase tracking-wider mb-3 flex items-center gap-2.5">
              <span className="w-6 h-px bg-primary/40 shrink-0" />
              <span>{t('public.professionalExperience')}</span>
            </h2>

            {hasVisibleBio && (
              <div className="space-y-3 w-full min-w-0">
                <p
                  className={`text-sm sm:text-base text-base-content/90 leading-relaxed max-w-2xl whitespace-pre-wrap break-words overflow-hidden [overflow-wrap:anywhere] ${
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
            )}

            {/* Core Expertise Chips */}
            {hasVisibleSpecialties && (
              <div className={`pt-4 border-neutral-light ${hasVisibleBio ? 'mt-4 border-t' : ''}`}>
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
      )}

      {/* ── Dedicated Contact & Clinic Card (#contact) ── */}
      {hasContactCard && (
        <div
          id="contact"
          className={isBothVisible ? 'lg:col-span-5 xl:col-span-4 scroll-mt-24' : 'w-full max-w-lg mx-auto scroll-mt-24'}
        >
          <aside className="bg-base-200 border border-neutral-light rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <MessageCircle size={16} />
              </div>
              <h2 className="text-sm font-bold text-base-content">
                {t('public.contactAndConsultation')}
              </h2>
            </div>

            <div className="space-y-2">
              {hasWa && (
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

              {hasPhone && (
                <a
                  href={`tel:${contactPhone.trim()}`}
                  className="w-full btn btn-sm bg-base-100 text-base-content border border-neutral-light hover:border-primary/40 hover:text-primary rounded-xl font-bold gap-2 min-h-[40px] h-auto py-2"
                >
                  <Phone size={15} className="text-primary shrink-0" />
                  <span className="truncate">{t('public.callClinic')}</span>
                </a>
              )}

              {hasEmail && (
                <a
                  href={`mailto:${contactEmail.trim()}`}
                  className="w-full btn btn-sm bg-base-100 text-base-content border border-neutral-light hover:border-primary/40 hover:text-primary rounded-xl font-bold gap-2 min-h-[40px] h-auto py-2"
                >
                  <Mail size={15} className="text-primary shrink-0" />
                  <span className="truncate">{t('public.sendEmail')}</span>
                </a>
              )}
            </div>

            {hasLocation && (
              <div className="pt-3 border-t border-neutral-light flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-base-100 border border-neutral-light flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <MapPin size={14} />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/55">
                    {t('public.clinicLocation')}
                  </p>
                  {clinicName && showClinicInfo && (
                    <p className="text-xs sm:text-sm font-bold text-base-content break-words">
                      {clinicName}
                    </p>
                  )}
                  {clinicAddress && showLocationCard && (
                    <p className="text-xs text-base-content/70 leading-relaxed break-words [overflow-wrap:anywhere]">
                      {clinicAddress}
                    </p>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
