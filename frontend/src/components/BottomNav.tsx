import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { label: 'Home', icon: 'home', href: '/' },
  { label: 'Shop', icon: 'grid_view', href: '/shop' },
  { label: 'Cart', icon: 'shopping_cart', href: '/cart' },
  { label: 'Profile', icon: 'person', href: '/login' },
];

export default function BottomNav() {
  const loc = useLocation();

  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center md:hidden px-4 py-3 bg-surface/90 backdrop-blur-md border-t border-glass-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-xl">
      {TABS.map(tab => {
        const active = loc.pathname === tab.href || (tab.href !== '/' && loc.pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.label}
            to={tab.href}
            className={`flex flex-col items-center justify-center px-4 py-1 transition-colors ${
              active ? 'text-primary bg-primary-container/20 rounded-full' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined">{tab.icon}</span>
            <span className="font-label-sm text-label-sm">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
