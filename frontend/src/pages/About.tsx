import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const team = [
  {
    name: 'Marcus Chen',
    role: 'CHIEF CREATIVE OFFICER',
    bio: 'Leading our visual identity and brand ethos with over 15 years of luxury sector experience.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC21N2oToH5mGB7ju_8gJieNVAQWeBkj-L59EemNFJFMhZXalUfBhT_kvgd0wyP_GmSAt410aqlRqLsU7f65FwItiVu96arTrVwnSqQ73JCrACn23PR5DyxDRKXqyaaiwzyFlP1BlQVjuPQ7HBm85gJ4jrYrRDYLWaI4MJbQx69ZIVHrn-1ZAJpiA1Ehku-EAk8KoAEcw0kHo3hqtAS16-3j1U-_aYw_sgJbUO0FEB7_dP0elMMTZEiikx7VeUArccY0Uy08JLT94T_',
  },
  {
    name: 'Elena Rossi',
    role: 'HEAD OF SUSTAINABILITY',
    bio: 'Championing circular economy practices and ethical supply chain management across four continents.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTvRhx3sxr7w0zgc_1chJocWu--z_urVyvyQv1cxBbgEras3zJyQ7nERKtcNitWKnLZ8XMF3GwISyLNDe1syw_WhkE_W7k6QLNmUM6ZG-bgr_Inqxyv8NOZqTK7QpPzoHy4zLru-zjhEEHyxD0FmCnTNdNPrpHR993-Ofd2BORdiAuXmeGOjYB8jBOZRvbMeDpNTzw_nmiu7ctc7f3W9iq0Emd_08ca6xPLVtzVQ7vLp9wIoED-KTVJ4jdHxIestPyp6fawuF5bO6W',
  },
  {
    name: 'David Thorne',
    role: 'VP OF TECHNOLOGY',
    bio: 'Architecting the seamless digital infrastructure that powers the Lumina global experience.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcz-1BQChom05hXzr9683NBOS3y1l8zphe7jmcRCGm1AXFEmD2TpIDKd_VknYmHZTbGUAlkUvIR5igViKNDfwfBouvjvtDIi5YPaax_pP0hfeGE0JKA5mu92qV6lMrkIAJHvnmnAmo5PRCS7YTB0CrqGg3zLdp7-qtXnzUHWm5_mIfrQ8OOj6Ecv7uwFqjah4ezJ8XSYWMpa04jEx7ab0D4Fv8rKqRqVmu6xocTmS47wGNrzu8OoEvnqUYz0g4CEgDoyhjXJK3vQB2',
  },
];

export default function About() {
  return (
    <main className="max-w-[1440px] mx-auto overflow-hidden">
      <SEO title="About Us" description="Learn about Lumina Commerce." />
      {/* Hero */}
      <section className="relative h-[819px] min-h-[600px] flex items-center px-margin-mobile md:px-margin-desktop overflow-hidden">
        <div className="absolute inset-0 z-0 scale-105">
          <img
            className="w-full h-full object-cover brightness-[0.85]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjHI85OtbkrfXEG_XJLESucN5u523jb6NHPNtbgEI6mqhH5UswH8nPmXUUjmLg2eE2tfOUbGWg164RKXH2IeUp7-CKsdfyiUdou32pZyZX0DDhsioH8PeFVg3P7lb5t-PA3mxNKeyvxD_h6oV2EW4F8oDAVJ6NsxkG4bnwmqs4rkuffmbqk3onR28hcA79FhWhb-O6rXWqRT0BlR_lZOaHxS81kPXzNIjqzc08uZOv0x8i1ogV5_62sxh_nQ4oEw2oVu10WfXU5qMo"
            alt=""
          />
        </div>
        <div className="relative z-10 max-w-2xl text-white">
          <span className="font-label-sm text-label-sm tracking-[0.2em] uppercase mb-4 block text-surface-container-lowest">Est. 2024</span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-6 leading-tight">Excellence in Every Detail.</h1>
          <p className="font-body-lg text-body-lg mb-8 text-surface-variant/90 leading-relaxed">
            We believe that true luxury lies in the unseen details. Lumina Commerce was founded on the principle that modern commerce should be as deliberate as the craftsmanship of a heritage timepiece.
          </p>
          <div className="flex gap-4">
            <Link to="/shop" className="bg-primary hover:bg-cta-vibrant text-white px-8 py-4 rounded transition-all active:scale-95 font-body-md font-semibold inline-block">
              Explore Collections
            </Link>
            <a href="#story" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded transition-all active:scale-95 font-body-md font-semibold inline-block">
              Our Process
            </a>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-display-lg text-display-lg-mobile md:text-headline-md text-on-surface mb-8">The Lumina Ethos</h2>
            <div className="space-y-6">
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Lumina Commerce began as a small collective of designers and artisans who felt the digital shopping experience had lost its soul. In a world of fast-paced consumption, we chose a different path: the path of intentionality.
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Every item in our collection is vetted through a rigorous three-stage process of quality, ethics, and aesthetic longevity. We don't just sell products; we curate experiences that respect both the creator and the consumer.
              </p>
            </div>
            <div className="mt-12 flex gap-12">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">12k+</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Global Partners</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Carbon Neutral</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNNmvj_K8lBYQkF4Cvact49jFRJi-FDNYufblM41EQesap_iFQahuFtGO0NIi7KONp19mAUTU8XXdK_aoYjZk-iyoYgT5VJWXpuLhtPrBWdxmmAOjTMF5FhB9ETT1Vde--MGJhsqpdMnQ86ALMLHaeZHairvbQGfAlStDA5bNfmp1EbZpPhYI4G-Fndhi0IrG7w71nFTrF4_f1ipd29bYWaVyLWIhtOWv0amqFBXZZfoy7nRDcprB7p_cur30H87rvtjEDvxX74T5G"
                alt=""
              />
            </div>
            <div className="absolute -bottom-6 -left-6 glass-card p-6 rounded-xl shadow-xl max-w-[240px]">
              <p className="font-body-md italic text-on-surface leading-snug">&ldquo;Quality is not an act, it is a habit that we practice every single day.&rdquo;</p>
              <p className="mt-4 font-label-sm font-bold text-primary">&mdash; Sarah J., Founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Bentogrid */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="font-label-sm text-label-sm tracking-widest uppercase text-primary mb-4 block">Our DNA</span>
          <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Built on Core Values</h2>
        </div>
        <div className="grid grid-cols-12 gap-bento-gap min-h-[600px]">
          <div className="col-span-12 md:col-span-8 bg-surface-container-highest rounded-xl overflow-hidden relative group transition-all duration-300 hover:shadow-lg">
            <img
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6guBmvqsXAC3DO4rZlPbT5zPdqd60WWMrz8p7i2GHO2PEMrbC1PKmT0rpnXk2lKMq0MHOKHJLIhcuVM4cGYdh9tsmZWlRoZvqHHKEH_qBCfSrAHPJQotssgK2CKxnmm5fwOU37FFA9ZbXQ3jsswy9DhMjrnQdcsqyGRhYd8vYVtmHo2lefdCbfTZrEw1891MX87BhxrOcZx6SDw-1g293GFBTT5tCp1M0lZaiulcvzrwR0gr6NX7aoy1jyYxzHEDHMg2EMyOfi1kP"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-charcoal/80 to-transparent p-12 flex flex-col justify-end text-white">
              <h3 className="font-headline-md text-headline-md mb-4">Precision Craft</h3>
              <p className="max-w-md font-body-md text-surface-container-low">Every edge, seam, and pixel is measured against the highest standards of international design and engineering.</p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 bg-primary text-white rounded-xl p-12 flex flex-col justify-between">
            <span className="material-symbols-outlined text-5xl opacity-40" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
            <div>
              <h3 className="font-headline-md text-headline-md mb-4">Ethical Sourcing</h3>
              <p className="font-body-md text-on-primary-container/80">We maintain direct relationships with every manufacturer, ensuring fair wages globally.</p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 glass-card rounded-xl p-12 flex flex-col justify-center border-primary/10">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Sustainability</h3>
            <p className="font-body-md text-on-surface-variant">From compostable packaging to circular product design.</p>
          </div>
          <div className="col-span-12 md:col-span-8 bg-surface-charcoal rounded-xl overflow-hidden relative">
            <img
              className="absolute inset-0 w-full h-full object-cover opacity-40"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuASl6_1sNib7-GKBhb3EtNbfPGc6UDWaLVA06nZCJ7hu-Sq6CJM_DxCawMcreYX7tMiZ-FmrjskpqwNOU18zPyechTm85BHBAM-2xqUsxWWlaAo26OpzlAGOXy7_OcTajzlENmqeLg15tG_IXsOzz3Jm_SWSJv9QvTcVnXCIB5BnmUfHcJgLEak_wiLyYuh0IPmW5L_9XXbOy0Is8LcJVm_AAoXIDHNKNDDTTrWVKAn-TgnSK_VMEwXxZfviCXJURuwEWsyDmtLsXTF"
              alt=""
            />
            <div className="relative z-10 p-12 text-white h-full flex flex-col justify-between">
              <h3 className="font-headline-md text-headline-md">Technological Edge</h3>
              <div className="flex flex-wrap gap-4 mt-8">
                <span className="px-4 py-2 border border-white/20 rounded-full font-label-sm text-label-sm bg-white/5">AI-Powered Curation</span>
                <span className="px-4 py-2 border border-white/20 rounded-full font-label-sm text-label-sm bg-white/5">Global Logistics Hub</span>
                <span className="px-4 py-2 border border-white/20 rounded-full font-label-sm text-label-sm bg-white/5">Blockchain Transparency</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <span className="font-label-sm text-label-sm tracking-widest uppercase text-primary mb-4 block">The Visionaries</span>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Meet the Minds Shaping the Future.</h2>
          </div>
          <a className="flex items-center gap-2 font-body-md font-semibold text-primary group border-b-2 border-transparent hover:border-primary transition-all" href="#">
            View Career Openings
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map(member => (
            <div key={member.name} className="group">
              <div className="aspect-square rounded-xl overflow-hidden mb-6 relative">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={member.img} alt={member.name} />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl cursor-pointer">share</span>
                </div>
              </div>
              <h4 className="font-headline-md text-headline-md text-on-surface mb-1">{member.name}</h4>
              <p className="font-label-sm text-label-sm text-primary mb-3">{member.role}</p>
              <p className="font-body-md text-on-surface-variant line-clamp-2">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop">
        <div className="bg-surface-charcoal rounded-2xl p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cta-vibrant/20 blur-[100px] translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-8">Join the Excellence Collective.</h2>
            <p className="font-body-lg text-body-lg text-surface-container-low mb-12">Receive exclusive access to new collections, behind-the-scenes stories, and private events.</p>
            <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto" onSubmit={e => { e.preventDefault(); alert('Subscribed!'); }}>
              <input className="flex-grow bg-white/10 border-white/20 rounded px-6 py-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-body-md" placeholder="Your Email Address" type="email" required />
              <button className="bg-primary hover:bg-cta-vibrant text-white px-8 py-4 rounded font-body-md font-semibold transition-all active:scale-95" type="submit">Subscribe</button>
            </form>
            <p className="mt-6 font-label-sm text-[10px] text-white/40 tracking-widest uppercase">We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
