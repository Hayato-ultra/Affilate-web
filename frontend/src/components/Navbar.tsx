import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const NAV_LINKS = [
  { label: 'Shop All', href: '/shop', match: '/shop' },
  { label: 'Featured', href: '/featured', match: '/featured' },
  { label: 'About', href: '/about', match: '/about' },
  { label: 'Contact', href: '/contact', match: '/contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const loc = useLocation();

  const isActive = (path: string) => {
    if (path.startsWith('/')) return loc.pathname === path;
    return loc.search.includes(path);
  };

  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-50 shadow-sm">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display-lg text-headline-md font-bold tracking-tight text-on-surface">
            Lumina Commerce
          </Link>
          <nav className="hidden md:flex gap-6">
            {NAV_LINKS.map(l => (
              <Link
                key={l.label}
                to={l.href}
                className={`font-body-md text-body-md transition-colors ${
                  isActive(l.href)
                    ? 'text-primary font-bold border-b-2 border-primary pb-1'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <Link to="/shop" className="material-symbols-outlined text-primary hover:bg-surface-container-low p-2 rounded-full transition-all active:scale-95">
            search
          </Link>
          {user ? (
            <>
              <Link to="/wishlist" className="material-symbols-outlined text-primary hover:bg-surface-container-low p-2 rounded-full transition-all active:scale-95">
                favorite
              </Link>
              <Link to="/cart" className="material-symbols-outlined text-primary hover:bg-surface-container-low p-2 rounded-full transition-all active:scale-95">
                shopping_bag
              </Link>
              <button
                onClick={logout}
                className="font-label-sm text-label-sm text-primary hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-body-md text-body-md text-primary hover:underline">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary text-on-primary px-5 py-2 rounded-lg font-label-sm hover:bg-cta-vibrant transition-all active:scale-95"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
