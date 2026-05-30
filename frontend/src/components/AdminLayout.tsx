import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { label: 'Dashboard', icon: 'space_dashboard', href: '/admin' },
  { label: 'Products', icon: 'inventory_2', href: '/admin/products' },
  { label: 'Add Product', icon: 'add_box', href: '/admin/products/new' },
  { label: 'Settings', icon: 'settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="w-8 h-8 border-2 border-outline border-t-primary rounded-full animate-spin" /></div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col z-40">
        <div className="p-6 border-b border-outline-variant/20">
          <Link to="/admin" className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Lumina Admin</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(item => {
            const active = item.href === '/admin' ? loc.pathname === '/admin' : loc.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-body-md transition-all ${
                  active
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-outline-variant/20">
          <Link to="/" className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/20 px-8 py-4 flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface capitalize">
            {loc.pathname === '/admin' ? 'Dashboard' : loc.pathname.split('/').pop()?.replace(/^\//, '') || ''}
          </h2>
          <div className="flex items-center gap-4">
            <span className="font-body-md text-on-surface-variant">{user?.email}</span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">Admin</span>
          </div>
        </header>
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
