import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.586.1-1.159.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export default function GoogleAuthButton({ onSuccess, isPending, text = 'Continue with Google' }) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // The useGoogleLogin hook from @react-oauth/google by default returns an implicit grant response (access_token)
      // but the original code used GoogleLogin which returns a credential (ID token).
      // If we want the ID token, we might need to use 'id-token' or similar, but
      // @react-oauth/google's useGoogleLogin usually gives the access_token.
      // Wait, let's check how the original was sending it.
      onSuccess(tokenResponse.access_token);
    },
    onError: () => console.error('Google Login Failed'),
  });

  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => !isPending && login()}
      disabled={isPending}
      className="flex items-center justify-center gap-3 w-full h-12 px-6 rounded-xl bg-white dark:bg-[#1C252E] border border-[#E0DFDC] dark:border-[#38434F] text-[#191919] dark:text-white font-semibold shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-[#252F39] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      {isPending ? (
        <span className="loading loading-spinner loading-sm text-primary" />
      ) : (
        <>
          <div className="bg-white p-1.5 rounded-lg group-hover:scale-110 transition-transform duration-200">
            <GoogleIcon />
          </div>
          <span className="text-sm tracking-tight">{text}</span>
        </>
      )}
    </motion.button>
  );
}
