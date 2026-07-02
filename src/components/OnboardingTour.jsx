import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Building2,
  Users,
  CalendarDays,
  Image,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
} from 'lucide-react';

const TOUR_STEPS = [
  {
    icon: Sparkles,
    title: 'Welcome to DentStory! 🦷',
    description:
      "Let's take a quick 1-minute tour to help you get started with managing your clinics, patients, and financials!",
    color: '#0ea5e9',
  },
  {
    icon: Building2,
    title: 'Step 1: Add Your Clinics',
    description:
      'First things first! Navigate to the Clinics page from the sidebar and add your clinic. You MUST have at least one clinic before adding patients.',
    color: '#8b5cf6',
  },
  {
    icon: Users,
    title: 'Step 2: Add Your Patients',
    description:
      'Once your clinic is set up, go to the Patients page and click "Add Patient" to register your first patient and assign them to a clinic.',
    color: '#10b981',
  },
  {
    icon: CalendarDays,
    title: 'Step 3: Schedule Appointments',
    description:
      'Use the Agenda page to manage all your scheduled appointments, follow-ups, and view your calendar at a glance.',
    color: '#f59e0b',
  },
  {
    icon: Image,
    title: 'Step 4: Build Your Portfolio',
    description:
      'Upload X-Rays and Before/After photos in the Portfolio section. You need to create a patient first before assigning photos.',
    color: '#ec4899',
  },
  {
    icon: BarChart3,
    title: 'Step 5: Track Your Earnings',
    description:
      'Your dashboard and analytics are fully automated! Watch your Net Profit grow based on the sessions and expenses you log.',
    color: '#06b6d4',
  },
];

export default function OnboardingTour() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  // Only show if user exists and hasn't completed onboarding
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (user && user.hasCompletedOnboarding === false) {
      // Small delay so the dashboard loads first
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // If not visible, render nothing
  if (!visible) return null;

  const currentStep = TOUR_STEPS[step];
  const isFirst = step === 0;
  const isLast = step === TOUR_STEPS.length - 1;
  const Icon = currentStep.icon;

  const completeTour = async () => {
    // Prevent double-calls
    if (isClosing) return;
    setIsClosing(true);

    // 1. Immediately update localStorage + Zustand so it persists across refresh
    const freshUser = useAuthStore.getState().user;
    updateUser({ ...freshUser, hasCompletedOnboarding: true });

    // 2. Hide the modal
    setVisible(false);

    // 3. Tell the backend (fire-and-forget, localStorage is already set)
    try {
      await api.put('/api/auth/onboarding-complete');
      toast.success("You're all set! 🎉");
    } catch (err) {
      console.error('Failed to save onboarding status:', err);
      // Don't revert — localStorage is the source of truth for the UI
    }
  };

  const handleNext = () => {
    if (isLast) {
      completeTour();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) setStep((s) => s - 1);
  };

  const handleSkip = () => {
    completeTour();
  };

  const handleClose = () => {
    completeTour();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-md bg-base-100 rounded-2xl shadow-2xl border border-neutral-light overflow-hidden animate-in zoom-in-95 duration-300"
        style={{ '--step-color': currentStep.color }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-base-content/40 hover:text-base-content hover:bg-base-200 transition-colors"
          aria-label="Close tour"
        >
          <X size={18} />
        </button>

        {/* Progress bar */}
        <div className="h-1 bg-base-200">
          <div
            className="h-full transition-all duration-500 ease-out rounded-r-full"
            style={{
              width: `${((step + 1) / TOUR_STEPS.length) * 100}%`,
              backgroundColor: currentStep.color,
            }}
          />
        </div>

        {/* Content */}
        <div className="px-8 pt-8 pb-6">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300"
            style={{ backgroundColor: `${currentStep.color}15` }}
          >
            <Icon size={28} style={{ color: currentStep.color }} />
          </div>

          {/* Title */}
          <h2 className="text-xl font-black text-base-content mb-2 tracking-tight">
            {currentStep.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-base-content/70 leading-relaxed mb-6">
            {currentStep.description}
          </p>

          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step
                  ? 'w-6'
                  : i < step
                    ? 'w-1.5 opacity-60'
                    : 'w-1.5 opacity-30'
                  }`}
                style={{
                  backgroundColor:
                    i <= step ? currentStep.color : 'currentColor',
                }}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            {/* Left side: Skip or Back */}
            <div>
              {isFirst ? (
                <button
                  onClick={handleSkip}
                  className="text-xs font-semibold text-base-content/40 hover:text-base-content/70 transition-colors px-2 py-1.5"
                >
                  Skip Tour
                </button>
              ) : (
                <button
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-base-content/60 hover:text-base-content transition-colors px-2 py-1.5"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
              )}
            </div>

            {/* Right side: Next or Finish */}
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ backgroundColor: currentStep.color }}
            >
              {isLast ? (
                "Let's Go!"
              ) : (
                <>
                  Next
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step counter */}
        <div className="px-8 pb-4">
          <p className="text-[10px] font-medium text-base-content/30 text-center">
            {step + 1} of {TOUR_STEPS.length}
          </p>
        </div>
      </div>
    </div>
  );
}
