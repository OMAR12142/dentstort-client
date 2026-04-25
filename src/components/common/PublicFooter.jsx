import { Link } from 'react-router-dom';
import AppLogo from '../AppLogo';

export default function PublicFooter() {
  return (
    <footer className="bg-white dark:bg-[#252525] border-t border-[#E0DFDC] dark:border-[#3A3A3A] py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div className="flex items-center gap-2">
          <AppLogo size="sm" />
          <span className="text-sm text-[#666666] dark:text-gray-400">
            © {new Date().getFullYear()} All rights reserved.
          </span>
        </div>
        <div className="flex gap-6 text-[#0A66C2] font-medium text-sm">
          <a href="/#features" className="hover:text-[#0A66C2]/80 transition-colors">Features</a>
          <a href="/#pricing" className="hover:text-[#0A66C2]/80 transition-colors">Pricing</a>
          <a href="/#feedback" className="hover:text-[#0A66C2]/80 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
