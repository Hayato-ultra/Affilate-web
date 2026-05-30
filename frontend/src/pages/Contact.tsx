import SEO from '../components/SEO';

export default function Contact() {
  return (
    <main className="max-w-[1440px] mx-auto">
      <SEO title="Contact Us" description="Get in touch with Lumina Commerce." />
      {/* Hero Title */}
      <section className="px-margin-mobile md:px-margin-desktop pt-16 pb-8">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">Connect with Us</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-2xl">Our concierge team is here to assist with every detail of your Lumina experience, from product inquiries to order support.</p>
      </section>

      {/* Main Contact Section */}
      <section className="px-margin-mobile md:px-margin-desktop py-12 grid grid-cols-1 md:grid-cols-12 gap-gutter-desktop">
        {/* Form */}
        <div className="md:col-span-7 bg-white p-8 md:p-12 rounded-lg border border-outline-variant/30">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-8">Send a Message</h2>
          <form className="space-y-8" onSubmit={e => { e.preventDefault(); alert('Message sent successfully!'); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative group">
                <input className="peer w-full bg-transparent border-0 border-b-2 border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 transition-all outline-none" id="name" placeholder=" " type="text" />
                <label className="absolute left-0 top-2 font-label-sm text-label-sm text-outline-variant transition-all peer-focus:-top-4 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-4" htmlFor="name">FULL NAME</label>
              </div>
              <div className="relative group">
                <input className="peer w-full bg-transparent border-0 border-b-2 border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 transition-all outline-none" id="email" placeholder=" " type="email" />
                <label className="absolute left-0 top-2 font-label-sm text-label-sm text-outline-variant transition-all peer-focus:-top-4 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-4" htmlFor="email">EMAIL ADDRESS</label>
              </div>
            </div>
            <div className="relative group">
              <input className="peer w-full bg-transparent border-0 border-b-2 border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 transition-all outline-none" id="subject" placeholder=" " type="text" />
              <label className="absolute left-0 top-2 font-label-sm text-label-sm text-outline-variant transition-all peer-focus:-top-4 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-4" htmlFor="subject">SUBJECT</label>
            </div>
            <div className="relative group">
              <textarea className="peer w-full bg-transparent border-0 border-b-2 border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 transition-all outline-none resize-none" id="message" placeholder=" " rows={4} />
              <label className="absolute left-0 top-2 font-label-sm text-label-sm text-outline-variant transition-all peer-focus:-top-4 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-4" htmlFor="message">YOUR MESSAGE</label>
            </div>
            <button className="bg-primary text-on-primary px-10 py-4 font-body-md text-body-md font-semibold tracking-wide uppercase transition-all hover:bg-primary-container active:scale-95 shadow-lg shadow-primary/20" type="submit">
              Send Message
            </button>
          </form>
        </div>

        {/* Brand Contact Details */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-12 md:space-y-0 md:pl-12">
          <div>
            <h3 className="font-label-sm text-label-sm text-primary mb-4 tracking-widest uppercase">Headquarters</h3>
            <p className="font-headline-md text-headline-md text-on-surface leading-snug">
              745 Fifth Avenue<br />
              New York, NY 10151<br />
              United States
            </p>
          </div>
          <div className="space-y-8">
            <div className="group cursor-pointer">
              <h3 className="font-label-sm text-label-sm text-primary mb-2 tracking-widest uppercase">Direct Contact</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>phone_iphone</span>
                +1 (212) 555-0128
              </p>
            </div>
            <div className="group cursor-pointer">
              <h3 className="font-label-sm text-label-sm text-primary mb-2 tracking-widest uppercase">Inquiries</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                concierge@lumina.com
              </p>
            </div>
            <div className="group cursor-pointer">
              <h3 className="font-label-sm text-label-sm text-primary mb-2 tracking-widest uppercase">Office Hours</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                Mon – Fri, 9:00 AM – 6:00 PM EST
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <a className="w-12 h-12 flex items-center justify-center rounded-full border border-outline-variant hover:border-primary hover:text-primary transition-all" href="#">
              <span className="material-symbols-outlined">public</span>
            </a>
            <a className="w-12 h-12 flex items-center justify-center rounded-full border border-outline-variant hover:border-primary hover:text-primary transition-all" href="#">
              <span className="material-symbols-outlined">share</span>
            </a>
          </div>
        </div>
      </section>

      {/* Bento Grid: Visit Our Stores */}
      <section className="px-margin-mobile md:px-margin-desktop py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">Visit Our Stores</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Experience the Lumina collection in person at our global boutiques.</p>
          </div>
          <button className="flex items-center gap-2 font-label-sm text-label-sm text-primary hover:gap-4 transition-all">
            VIEW ALL LOCATIONS <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-bento-gap auto-rows-[320px]">
          {/* NY Flagship */}
          <div className="md:col-span-8 md:row-span-2 bento-card bg-white rounded-lg overflow-hidden border border-outline-variant/30 relative group">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLTDFZDHS5XNw47A14c91ZG24g0FVccOGHt3L4ICsFx67qhRxHmDxoSmqWbpTwCv4ahC1Enj4fPDP4CuiGG9ya14-xN-UX3DWX-qFbUbrTup1xqDQz3ryKGnJCC2rB3SojuPW3f3fcRIRNZyRUvbnatd9zfs76iYLXvzIulKTIOA65x-UPbIro9SOmpPkLCB6g4DyQD96hFPNRziueETEE09uiycDDd1H1jpUuAQB3ZpY9Skfqe6wIWlkH2JGoD0cS0kf5Xl6aPkf6" alt="New York Flagship" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 p-8 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <span className="font-label-sm text-label-sm text-primary-fixed block mb-2 tracking-widest">FLAGSHIP</span>
              <h3 className="font-display-lg text-headline-md mb-2">New York City, Fifth Ave</h3>
              <p className="font-body-md opacity-80">Our premier global location featuring the full collection and bespoke atelier.</p>
            </div>
          </div>
          {/* London */}
          <div className="md:col-span-4 bento-card bg-white rounded-lg overflow-hidden border border-outline-variant/30 relative group">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnJrDYYzp1zqZBrv4tDyUIRAvMDVudb1tWok48aS8YRF3QgNf9YEDhnqfSrlDBdMkn4tQc8aX5R69SEF74BviJMx_dIUTsaydD_PlARPCJWHl8f6ZfO5rJYOCaT_D4U-2JVUZYUWJGgLv5ymAf-odvsl8lM0D2lYRs-Gi_pO8LMmqRaKM6YKN3nrMWmdqXe_IbB8XUgM_wk_b4diNWe0zkB7eGb1r1qyt7rtrNvXF6wsp4y9MlojJMQV2JlGaTDSDkoS1WzF1R3dLZ" alt="London Boutique" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h3 className="font-headline-md text-headline-md">London, Bond St</h3>
              <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="font-label-sm">Mayfair District</span>
              </div>
            </div>
          </div>
          {/* Tokyo */}
          <div className="md:col-span-4 bento-card bg-white rounded-lg overflow-hidden border border-outline-variant/30 relative group">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIcxudzuiaNTZOy58_g_oTbWhMPJPkt6VsDwAxgEOSBV8a37UltLFQL3j1LvmbWXoFbl7ODLGMBfBhnmQZbkldzBvTX4EPNByhaynXZciUty00Sy0ku7WkN7ovYK8Dkj-uZ8MtTPA4TIwoBt3iUF_PPcmgo7FGXOj3e3ChsNgSTzfl5QqWY7btzh2nfru8aROo_Xc2OTNN3OyhZfGVB7Zu1tjuUg9hgSvPr7cSKlfmmUBgPCA3rEdZUeRk038jyThTe5iE-RK4gR5b" alt="Tokyo Ginza" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h3 className="font-headline-md text-headline-md">Tokyo, Ginza</h3>
              <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="font-label-sm">Chuo City</span>
              </div>
            </div>
          </div>
          {/* Paris */}
          <div className="md:col-span-4 bento-card bg-surface-container-low rounded-lg p-8 border border-outline-variant/30 flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary text-4xl">storefront</span>
              <div className="bg-primary text-on-primary text-[10px] px-2 py-1 rounded font-bold">OPENING SOON</div>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Paris, Le Marais</h3>
              <p className="font-body-md text-on-surface-variant">Our first European mainland boutique, coming Autumn 2024.</p>
            </div>
            <a className="font-label-sm text-primary flex items-center gap-2 hover:gap-3 transition-all" href="#">
              GET NOTIFIED <span className="material-symbols-outlined text-sm">notifications</span>
            </a>
          </div>
          {/* Map */}
          <div className="md:col-span-8 bento-card bg-surface-container-highest rounded-lg overflow-hidden relative border border-outline-variant/30">
            <div className="absolute inset-0 bg-[#e5e7eb] flex items-center justify-center">
              <div className="w-full h-full grayscale hover:grayscale-0 transition-all duration-1000">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgxWQC1W3I4ih6F-5VEwa6Bs5o-BrcWH3TUoqce4pdeUwYc9rp4XiRiIqC0CkHz-rb68KLkI3ZPF5lY9EYqGyFw4qWDOLoi6HwRUfG-bpwday4DbMJ3YfWOb1UjF32y_jh2yMKkg2f-RCMONCWo9WDJsFvWXUe6mygvheVFY_dWJpcD761fSds9wt8O1lMCk_IGDH3eV0f39_pxo4JRVLbqQdNNruOIaQIPDKalEc6C8z__5c_1FfpLIEug9X67Sc26pbKj6u2iIPd" alt="Location Map" />
              </div>
            </div>
            <div className="absolute top-4 right-4 glass-effect p-4 rounded-lg border border-white/50 shadow-lg">
              <p className="font-label-sm text-on-surface">CENTRAL HUB</p>
              <p className="font-body-md font-bold text-primary">New York HQ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-margin-mobile md:px-margin-desktop mb-24">
        <div className="bg-surface-charcoal text-white rounded-xl overflow-hidden relative py-20 px-margin-mobile md:px-margin-desktop">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[120px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 blur-[80px] -ml-24 -mb-24" />
          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-6">Join the Lumina List</h2>
            <p className="font-body-lg text-secondary-fixed-dim mb-10">Receive exclusive early access to new collections, boutique events, and editorial features.</p>
            <div className="flex w-full max-w-md gap-2">
              <input className="flex-1 bg-white/10 border-0 border-b border-white/30 focus:border-white focus:ring-0 px-4 py-4 font-body-md text-white placeholder:text-white/40" placeholder="Email Address" type="email" />
              <button className="bg-white text-surface-charcoal px-8 py-4 font-body-md font-bold hover:bg-primary-fixed transition-colors">SUBSCRIBE</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
