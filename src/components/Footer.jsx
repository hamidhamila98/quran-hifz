import { Moon, Sun, Lightbulb } from 'lucide-react'
import { Link } from 'react-router-dom'

// Simple SVG icons for social media
const TelegramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
)

const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

export default function Footer({ darkMode, toggleDarkMode, isMobile }) {
  return (
    <footer className={`
      fixed bottom-0 left-0 w-screen z-30
      ${darkMode
        ? 'bg-slate-800 border-t border-slate-700/50'
        : 'bg-white border-t border-gray-200'
      }
    `}>
      {/* MyAdvice floating button - positioned above footer */}
      <Link
        to="/advice"
        className={`group absolute left-1/2 -translate-x-1/2 -top-5 flex items-center gap-0 px-3 py-2 rounded-full font-medium text-sm transition-all duration-300 hover:-top-6 hover:gap-2 hover:px-5 ${
          darkMode
            ? 'bg-slate-700 hover:bg-slate-600 text-amber-400 border border-slate-600 shadow-lg'
            : 'bg-white hover:bg-gray-50 text-amber-600 border border-gray-200 shadow-lg'
        }`}
      >
        <Lightbulb className="w-4 h-4" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-[100px]">MyAdvice</span>
      </Link>

      <div className={`grid items-center px-2 md:px-4 py-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {/* Left - Social links only on mobile, with text on desktop */}
        <div className="flex items-center gap-1 md:gap-2">
          <span className={`text-xs hidden lg:block ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Contact :
          </span>
          <div className="flex items-center gap-0.5 md:gap-1">
            <a
              href="https://t.me/abuzayd93"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1 md:p-1.5 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-slate-700 text-gray-400 hover:text-sky-400'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-sky-500'
              }`}
              title="Telegram"
            >
              <TelegramIcon className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com/citarappel"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1 md:p-1.5 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-slate-700 text-gray-400 hover:text-pink-400'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-pink-500'
              }`}
              title="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href="https://x.com/abuzayd93"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1 md:p-1.5 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-slate-700 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
              }`}
              title="X (Twitter)"
            >
              <TwitterIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Center - App branding (hidden on mobile) */}
        {!isMobile && (
          <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>MyIslamHub</span>
            {' '}By{' '}
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>AbuZayd93</span>
          </p>
        )}

        {/* Right - Dark mode toggle */}
        <div className="flex justify-end">
          <button
            onClick={toggleDarkMode}
            className={`p-1.5 md:p-2 rounded-lg transition-all ${
              darkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-amber-400'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </footer>
  )
}
