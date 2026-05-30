import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-charcoal w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter-desktop px-margin-mobile md:px-margin-desktop py-16 w-full max-w-[1440px] mx-auto">
        <div className="md:col-span-1">
          <span className="font-display-lg text-headline-md text-surface-container-lowest block mb-6">
            Lumina Commerce
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-tertiary-fixed-dim">
            Elevating your lifestyle through curated excellence. Crafted with modern authority.
          </p>
        </div>
        <div>
          <h5 className="font-label-sm text-label-sm text-on-primary mb-6 uppercase tracking-widest">Shop</h5>
          <ul className="space-y-4">
            <li><Link to="/shop" className="font-body-md text-body-md text-on-surface-variant hover:text-surface-bright transition-colors">New Arrivals</Link></li>
            <li><Link to="/shop" className="font-body-md text-body-md text-on-surface-variant hover:text-surface-bright transition-colors">Collections</Link></li>
            <li><Link to="/shop" className="font-body-md text-body-md text-on-surface-variant hover:text-surface-bright transition-colors">Store Locator</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-label-sm text-label-sm text-on-primary mb-6 uppercase tracking-widest">Support</h5>
          <ul className="space-y-4">
            <li><a className="font-body-md text-body-md text-on-surface-variant hover:text-surface-bright transition-colors" href="#">Shipping Info</a></li>
            <li><a className="font-body-md text-body-md text-on-surface-variant hover:text-surface-bright transition-colors" href="#">Returns</a></li>
            <li><a className="font-body-md text-body-md text-on-surface-variant hover:text-surface-bright transition-colors" href="#">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-label-sm text-label-sm text-on-primary mb-6 uppercase tracking-widest">Company</h5>
          <ul className="space-y-4">
            <li><a className="font-body-md text-body-md text-on-surface-variant hover:text-surface-bright transition-colors" href="#">Privacy Policy</a></li>
            <li><a className="font-body-md text-body-md text-on-surface-variant hover:text-surface-bright transition-colors" href="#">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="px-margin-mobile md:px-margin-desktop py-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          &copy; 2024 Lumina Commerce. Excellence in Every Detail.
        </span>
        <div className="flex gap-6">
          <span className="material-symbols-outlined text-surface-container-lowest cursor-pointer hover:scale-110 transition-transform">public</span>
          <span className="material-symbols-outlined text-surface-container-lowest cursor-pointer hover:scale-110 transition-transform">share</span>
          <span className="material-symbols-outlined text-surface-container-lowest cursor-pointer hover:scale-110 transition-transform">mail</span>
        </div>
      </div>
    </footer>
  );
}
