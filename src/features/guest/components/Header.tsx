import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/ethics', label: 'Ethics & Privacy' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#319795]/20 text-[#319795]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1A202C]">
            AURA
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-[#319795] font-semibold'
                  : 'text-[#718096] hover:text-[#2C5282]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <button className="magnetic-btn inline-flex h-12 items-center justify-center rounded-lg bg-[var(--color-brand-primary)] px-6 text-base font-bold text-white hover:brightness-110 transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/30">
            Get Started
          </button>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-[#718096] hover:text-[#1A202C]">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
