import { Link, useNavigate } from 'react-router-dom';
import { Users, PieChart, MessageCircle, AlertTriangle, CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LandingPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.accessToken);

  const handleCTA = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STICKY NAVBAR */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white border-b border-neutral-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-[#0A66C2]">
            DentStory
          </Link>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#191919] hover:text-[#0A66C2] transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-[#191919] hover:text-[#0A66C2] transition-colors font-medium">
              How It Works
            </a>
            <a href="#feedback" className="text-[#191919] hover:text-[#0A66C2] transition-colors font-medium">
              Feedback & Suggestions
            </a>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            {token ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-sm bg-[#0A66C2] text-white border-0 hover:bg-[#0A66C2]/90 shadow-none rounded-lg"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-sm btn-ghost text-[#0A66C2] hover:bg-[#0A66C2]/5 shadow-none border border-neutral-light rounded-lg"
                >
                  Log In
                </Link>
                <button
                  onClick={handleCTA}
                  className="btn btn-sm bg-[#0A66C2] text-white border-0 hover:bg-[#0A66C2]/90 shadow-none rounded-lg"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION & MOCKUP */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4 leading-tight">
            Your Dental Career, Organized.
          </h1>
          <p className="text-lg md:text-xl text-[#666666] leading-relaxed">
            Manage patients, track clinic commissions, and automate follow-ups.
          </p>
        </div>

        {/* CSS-Built Dashboard Mockup */}
        <div className="bg-white border border-neutral-light rounded-xl overflow-hidden shadow-sm">
          {/* Mac-Style Title Bar */}
          <div className="h-12 bg-[#F3F2EF] border-b border-neutral-light flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E74C3C]"></div>
            <div className="w-3 h-3 rounded-full bg-[#F5871E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#057642]"></div>
          </div>

          {/* Mockup Content */}
          <div className="flex h-96">
            {/* Left Sidebar */}
            <div className="w-48 bg-[#F3F2EF] border-r border-neutral-light p-4 hidden md:block">
              <div className="space-y-3">
                <div className="h-8 bg-white rounded border border-neutral-light"></div>
                <div className="h-6 bg-[#0A66C2]/10 rounded"></div>
                <div className="h-6 bg-white/50 rounded"></div>
                <div className="h-6 bg-white/50 rounded"></div>
                <div className="h-6 bg-white/50 rounded"></div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 md:p-8 overflow-auto">
              <h3 className="text-lg font-bold text-[#191919] mb-4">Patient Pipeline</h3>

              {/* Tabs */}
              <div className="flex gap-4 border-b border-neutral-light pb-3 mb-6">
                <button className="text-[#0A66C2] font-semibold border-b-2 border-[#0A66C2] pb-2">
                  Active
                </button>
                <button className="text-[#666666] font-medium hover:text-[#191919] transition-colors pb-2">
                  Completed
                </button>
              </div>

              {/* Mock Patient Card */}
              <div className="bg-[#F3F2EF] border border-neutral-light rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-[#191919] mb-2">Sarah Johnson</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                        <AlertTriangle size={12} className="mr-1" /> Diabetic
                      </span>
                    </div>
                    <p className="text-sm text-[#666666]">Root Canal Treatment</p>
                    <p className="text-xs text-[#666666] mt-1">Last visit: 3 days ago</p>
                  </div>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-green-600">
                    <MessageCircle size={20} />
                  </button>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="grid grid-cols-3 gap-3 mt-6 text-sm">
                <div className="text-center p-2 bg-white border border-neutral-light rounded">
                  <div className="font-bold text-[#191919]">12</div>
                  <div className="text-[#666666]">Active</div>
                </div>
                <div className="text-center p-2 bg-white border border-neutral-light rounded">
                  <div className="font-bold text-[#191919]">8</div>
                  <div className="text-[#666666]">On-Hold</div>
                </div>
                <div className="text-center p-2 bg-white border border-neutral-light rounded">
                  <div className="font-bold text-[#191919]">24</div>
                  <div className="text-[#666666]">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEATURES GRID */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#191919] mb-4">
              Everything we built for our dentists.
            </h2>
            <p className="text-lg text-[#666666]">
              Powerful features designed to streamline your practice and maximize your income.
            </p>
          </div>

          {/* Feature Cards Grid (5 cards) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Smart Pipeline */}
            <div className="bg-[#F3F2EF] border border-neutral-light rounded-lg p-6 hover:border-[#0A66C2] transition-colors">
              <div className="w-12 h-12 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center mb-4">
                <Users size={24} className="text-[#0A66C2]" />
              </div>
              <h3 className="text-xl font-bold text-[#191919] mb-2">Smart Pipeline</h3>
              <p className="text-[#666666] leading-relaxed">
                Track Active, On-Hold, and Completed treatments at a glance. Manage all your patients across multiple clinics seamlessly.
              </p>
            </div>

            {/* Card 2: Automated Commissions */}
            <div className="bg-[#F3F2EF] border border-neutral-light rounded-lg p-6 hover:border-[#0A66C2] transition-colors">
              <div className="w-12 h-12 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center mb-4">
                <PieChart size={24} className="text-[#0A66C2]" />
              </div>
              <h3 className="text-xl font-bold text-[#191919] mb-2">Automated Commissions</h3>
              <p className="text-[#666666] leading-relaxed">
                Never lose track of your money. Instantly calculate your cut for every shift based on exact clinic fee structures.
              </p>
            </div>

            {/* Card 3: One-Click WhatsApp */}
            <div className="bg-[#F3F2EF] border border-neutral-light rounded-lg p-6 hover:border-[#0A66C2] transition-colors">
              <div className="w-12 h-12 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle size={24} className="text-[#0A66C2]" />
              </div>
              <h3 className="text-xl font-bold text-[#191919] mb-2">One-Click WhatsApp</h3>
              <p className="text-[#666666] leading-relaxed">
                Send prescriptions, session summaries, and follow-ups directly to patients natively from the app context.
              </p>
            </div>

            {/* Card 4: Medical Alerts */}
            <div className="bg-[#F3F2EF] border border-neutral-light rounded-lg p-6 hover:border-[#0A66C2] transition-colors">
              <div className="w-12 h-12 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-[#0A66C2]" />
              </div>
              <h3 className="text-xl font-bold text-[#191919] mb-2">Medical Alerts</h3>
              <p className="text-[#666666] leading-relaxed">
                Bold warning badges for chronic diseases (BP, Diabetes) to ensure patient safety and informed decision-making.
              </p>
            </div>

            {/* Card 5: Quick File Closing */}
            <div className="bg-[#F3F2EF] border border-neutral-light rounded-lg p-6 hover:border-[#0A66C2] transition-colors">
              <div className="w-12 h-12 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 size={24} className="text-[#0A66C2]" />
              </div>
              <h3 className="text-xl font-bold text-[#191919] mb-2">Quick File Closing</h3>
              <p className="text-[#666666] leading-relaxed">
                One-click "Mark as Completed" to keep your dashboard clean and organized. Track closed cases with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-[#F3F2EF] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#191919] text-center mb-16">
            How It Works
          </h2>

          {/* Steps Pipeline */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex-1 bg-white border border-neutral-light rounded-lg p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-[#191919] mb-2">Add Patient</h3>
              <p className="text-sm text-[#666666]">Register their details and medical history once.</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:block text-[#0A66C2]">
              <ArrowRight size={32} />
            </div>

            {/* Step 2 */}
            <div className="flex-1 bg-white border border-neutral-light rounded-lg p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-[#191919] mb-2">Add Sessions & Expenses</h3>
              <p className="text-sm text-[#666666]">Record treatments, payments, and clinic splits.</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:block text-[#0A66C2]">
              <ArrowRight size={32} />
            </div>

            {/* Step 3 */}
            <div className="flex-1 bg-white border border-neutral-light rounded-lg p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-[#191919] mb-2">Auto-calculate Income</h3>
              <p className="text-sm text-[#666666]">Track your income and build patient loyalty.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEEDBACK & SUGGESTIONS */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="feedback" className="bg-white py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#191919] mb-4">
              Help us build the perfect tool for you.
            </h2>
            <p className="text-lg text-[#666666]">
              DentStory is in active development. Have a feature request or feedback? Reach out directly to the founder.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* WhatsApp Card */}
            <a
              href="https://wa.me/201019876800?text=Hello%20DentStory%20Team,%20I%20have%20a%20suggestion:"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white border border-neutral-light rounded-lg p-8 text-center hover:border-[#0A66C2] transition-all"
            >
              <div className="w-16 h-16 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0A66C2]/20 transition-colors">
                <MessageCircle size={32} className="text-[#0A66C2]" />
              </div>
              <h3 className="text-xl font-bold text-[#191919] mb-2">WhatsApp Us</h3>
              <p className="text-[#666666] text-sm">Chat with us directly on WhatsApp.</p>
              <div className="mt-4 inline-block px-4 py-2 bg-[#0A66C2]/10 text-[#0A66C2] rounded-lg font-semibold text-sm group-hover:bg-[#0A66C2] group-hover:text-white transition-all">
                Send Message
              </div>
            </a>

            {/* Email Card */}
            <a
              href="mailto:omarselema52@gmail.com?subject=DentStory%20Feedback%20and%20Suggestions"
              className="group bg-white border border-neutral-light rounded-lg p-8 text-center hover:border-[#0A66C2] transition-all"
            >
              <div className="w-16 h-16 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0A66C2]/20 transition-colors">
                <Mail size={32} className="text-[#0A66C2]" />
              </div>
              <h3 className="text-xl font-bold text-[#191919] mb-2">Email Us</h3>
              <p className="text-[#666666] text-sm">Reach out to us via email anytime.</p>
              <div className="mt-4 inline-block px-4 py-2 bg-[#0A66C2]/10 text-[#0A66C2] rounded-lg font-semibold text-sm group-hover:bg-[#0A66C2] group-hover:text-white transition-all">
                Send Email
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-[#F3F2EF] border-t border-neutral-light py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-[#666666]">© {new Date().getFullYear()} DentStory. All rights reserved.</p>
          <div className="flex gap-6 text-[#0A66C2] font-medium">
            <a href="#" className="hover:text-[#0A66C2]/80 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-[#0A66C2]/80 transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
