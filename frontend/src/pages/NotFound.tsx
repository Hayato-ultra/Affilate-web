import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center relative overflow-hidden bento-grid-bg min-h-screen">
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." />
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary-container/20 rounded-full blur-3xl" />
      <div className="relative z-10 w-full max-w-[1440px] px-margin-mobile md:px-margin-desktop py-20 flex flex-col items-center text-center">
        <div className="mb-12">
          <h1 className="font-display-lg text-[120px] md:text-[240px] font-extrabold leading-none tracking-tighter text-on-surface/5 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            404
          </h1>
          <div className="relative">
            <span className="font-label-sm text-label-sm uppercase text-primary tracking-widest mb-4 block">Error Code: 404</span>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6">Lost in Style?</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
              Even the most curated collections have their limits. The page you're looking for has either moved out of season or never existed in our catalog.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-bento-gap w-full max-w-4xl">
          <Link to="/shop" className="md:col-span-8 group relative overflow-hidden bg-surface-container-lowest border border-outline-variant p-8 flex flex-col justify-between items-start text-left transition-all duration-300 hover:shadow-lg hover:border-primary active:scale-[0.98]">
            <div className="flex justify-between w-full items-start">
              <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_forward</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-6">Return to Storefront</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">Start your journey from the beginning with our featured selections.</p>
            </div>
          </Link>
          <Link to="/shop" className="md:col-span-4 group relative overflow-hidden bg-primary text-on-primary p-8 flex flex-col justify-between items-start text-left transition-all duration-300 hover:bg-cta-vibrant active:scale-[0.98]">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>new_releases</span>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-primary mt-6">New Season</h3>
              <p className="font-body-md text-body-md text-primary-fixed-dim mt-2">Explore the latest drops.</p>
            </div>
          </Link>

          <div className="md:col-span-6 bg-surface-container-low border border-outline-variant p-8 flex flex-col items-start text-left">
            <h4 className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-4">Quick Search</h4>
            <div className="relative w-full">
              <input
                className="w-full bg-surface-container-lowest border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-3 font-body-md transition-all"
                placeholder="Search for products..."
                type="text"
              />
              <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-outline">search</span>
            </div>
          </div>
          <a className="md:col-span-6 glass-card border border-white/40 p-8 flex items-center justify-between transition-all duration-300 hover:bg-white active:scale-[0.98]" href="#">
            <div className="flex items-center gap-4">
              <div className="bg-surface-container-highest p-3 rounded-full">
                <span className="material-symbols-outlined text-on-surface">support_agent</span>
              </div>
              <div>
                <h4 className="font-headline-md text-headline-md text-on-surface leading-tight">Need Help?</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">Our concierge is here to assist you.</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline">open_in_new</span>
          </a>
        </div>
      </div>
    </main>
  );
}
