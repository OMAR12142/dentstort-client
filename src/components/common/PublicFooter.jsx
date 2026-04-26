import { Link } from 'react-router-dom';
import AppLogo from '../AppLogo';
import { Mail, Shield, Globe, Terminal } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-white dark:bg-[#1A1A1A] border-t border-base-content/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">

          {/* Brand Column */}
          <div className="col-span-1 lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <AppLogo size="md" />
              <div className="h-6 w-px bg-base-content/10" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary"> Your Dental Story.</p>
            </div>
            <p className="text-sm text-[#666666] dark:text-gray-400 font-medium leading-relaxed max-w-xs">
              The professional ecosystem for modern dentists. Manage clinical cases, patient records, and grow your digital presence—all in one Place.            </p>
          </div>

          {/* Clinical Solution */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#191919] dark:text-white">Clinical Solution</h4>
            <ul className="space-y-4">
              <li><Link to="/#features" className="text-sm text-[#666666] dark:text-gray-400 hover:text-primary transition-colors font-bold">Dashboard Hub</Link></li>
              <li><Link to="/#features" className="text-sm text-[#666666] dark:text-gray-400 hover:text-primary transition-colors font-bold">Portfolio Builder</Link></li>
              <li><Link to="/#features" className="text-sm text-[#666666] dark:text-gray-400 hover:text-primary transition-colors font-bold">Clinical Sessions</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#191919] dark:text-white">Community</h4>
            <ul className="space-y-4">
              <li><Link to="/#pricing" className="text-sm text-[#666666] dark:text-gray-400 hover:text-primary transition-colors font-bold">Pricing Mission</Link></li>
              <li><Link to="/#feedback" className="text-sm text-[#666666] dark:text-gray-400 hover:text-primary transition-colors font-bold">Direct Support</Link></li>
              <li><a href="mailto:omarselema52@gmail.com" className="text-sm text-[#666666] dark:text-gray-400 hover:text-primary transition-colors font-bold">Partner Program</a></li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#191919] dark:text-white">Trust & Security</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-2 text-sm text-[#666666] dark:text-gray-400 font-medium">
                <Shield size={14} className="text-primary" /> Protected & Secure
              </li>
              <li className="flex items-center gap-2 text-sm text-[#666666] dark:text-gray-400 font-medium">
                <Globe size={14} className="text-primary" /> Access from Anywhere
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-base-content/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[10px] sm:text-xs text-[#666666] dark:text-gray-500 font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} DentStory. Designed by Dentists for Dentists.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
