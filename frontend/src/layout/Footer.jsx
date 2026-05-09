export default function Footer() {
  return (
    <footer className="px-10 py-10 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="size-5 text-gray-400">
            <svg viewBox="0 0 48 48" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            © 2026 Parliament of India (Sansad). All rights reserved.
          </p>
        </div>

        <nav className="flex gap-6 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-primary">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-primary">
            Terms of Service
          </a>
          <a href="#" className="hover:text-primary">
            Help Center
          </a>
        </nav>
      </div>
    </footer>
  );
}
