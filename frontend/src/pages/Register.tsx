import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/shop');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row pt-[88px] md:pt-0">
      <SEO title="Create Account" description="Create your Lumina Commerce account." />
      {/* Image Section */}
      <section className="hidden md:block w-1/2 relative bg-surface-charcoal overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-on-background/60 to-transparent z-10" />
        <img
          className="absolute inset-0 w-full h-full object-cover grayscale-[20%]"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtTWj8gDIEgdF5aOLasw3HBVC4xBLTIVrm6qbbojdfR4CjGio-uCHqkE4orMZjK4VqtwhzLvvqYdX-I-b0HDpFyk-QQp7lFl2L9Cx_ydjuRoHJeOKTn3gZs930UIfXamrUcxL0E_AowLdEpg2uA7GLBeFhFKI8_J3MewjekygeSA211LYXAug5cum1CB-hHxS29NzMRKNJ-1jn0mcWq4rfN6Fp5rktl7Vog5EKA7a5qDEhgjtlVfdfm9ZTBxeusUP1QtRugc3pmJvl"
          alt=""
        />
        <div className="absolute bottom-20 left-margin-desktop z-20 max-w-md">
          <span className="text-label-sm font-label-sm text-surface-bright/80 uppercase tracking-widest mb-4 block">Crafting Excellence</span>
          <h2 className="text-display-lg font-display-lg text-surface-bright leading-tight mb-6">Excellence in Every Detail.</h2>
          <div className="h-1 w-12 bg-primary" />
        </div>
      </section>

      {/* Form Section */}
      <section className="w-full md:w-1/2 flex items-center justify-center py-12 px-margin-mobile md:px-16 bg-surface">
        <div className="w-full max-w-[480px]">
          <div className="mb-10">
            <h1 className="text-display-lg-mobile md:text-headline-md font-display-lg text-on-surface mb-2">Create your account</h1>
            <p className="text-on-surface-variant font-body-md">Join the Lumina ecosystem for an elevated shopping experience.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg font-body-md">
              {error}
            </div>
          )}

          {/* Social Signups */}
          <div className="grid grid-cols-2 gap-bento-gap mb-8">
            <button className="flex items-center justify-center gap-3 py-4 border border-outline-variant hover:bg-surface-container-low transition-all active:scale-[0.98] rounded-lg">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-label-sm font-label-sm">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 py-4 border border-outline-variant hover:bg-surface-container-low transition-all active:scale-[0.98] rounded-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>ios</span>
              <span className="text-label-sm font-label-sm">Apple</span>
            </button>
          </div>

          <div className="relative flex py-5 items-center mb-8">
            <div className="flex-grow border-t border-outline-variant/50" />
            <span className="flex-shrink mx-4 text-label-sm font-label-sm text-outline">OR CONTINUE WITH EMAIL</span>
            <div className="flex-grow border-t border-outline-variant/50" />
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative group">
              <input
                id="fullname"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="peer w-full bg-transparent border-0 border-b border-outline-variant pt-4 pb-2 focus:ring-0 focus:border-primary transition-all font-body-md outline-none"
                placeholder=" "
                required
              />
              <label htmlFor="fullname" className="absolute left-0 top-4 text-on-surface-variant font-body-md transition-all duration-200 pointer-events-none origin-left peer-focus:-top-1 peer-focus:text-sm peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:text-sm">
                Full Name
              </label>
            </div>
            <div className="relative group">
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="peer w-full bg-transparent border-0 border-b border-outline-variant pt-4 pb-2 focus:ring-0 focus:border-primary transition-all font-body-md outline-none"
                placeholder=" "
                required
              />
              <label htmlFor="reg-email" className="absolute left-0 top-4 text-on-surface-variant font-body-md transition-all duration-200 pointer-events-none origin-left peer-focus:-top-1 peer-focus:text-sm peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:text-sm">
                Email Address
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="peer w-full bg-transparent border-0 border-b border-outline-variant pt-4 pb-2 focus:ring-0 focus:border-primary transition-all font-body-md outline-none"
                  placeholder=" "
                  required
                />
                <label htmlFor="reg-password" className="absolute left-0 top-4 text-on-surface-variant font-body-md transition-all duration-200 pointer-events-none origin-left peer-focus:-top-1 peer-focus:text-sm peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:text-sm">
                  Password
                </label>
              </div>
              <div className="relative group">
                <input
                  id="confirm_password"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="peer w-full bg-transparent border-0 border-b border-outline-variant pt-4 pb-2 focus:ring-0 focus:border-primary transition-all font-body-md outline-none"
                  placeholder=" "
                  required
                />
                <label htmlFor="confirm_password" className="absolute left-0 top-4 text-on-surface-variant font-body-md transition-all duration-200 pointer-events-none origin-left peer-focus:-top-1 peer-focus:text-sm peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:text-sm">
                  Confirm Password
                </label>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-2">
              <input className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary/20" id="newsletter" type="checkbox" />
              <label className="text-label-sm font-label-sm text-on-surface-variant cursor-pointer" htmlFor="newsletter">
                Subscribe to newsletter for exclusive arrivals and insights.
              </label>
            </div>
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-surface-charcoal text-surface-bright py-4 font-body-md font-semibold tracking-wide hover:bg-on-background active:scale-[0.98] transition-all duration-200 shadow-md disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-body-md text-on-surface-variant">
              Already have an account?
              <Link to="/login" className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 ml-1">Login</Link>
            </p>
          </div>

          <div className="mt-16 text-center">
            <p className="text-label-sm font-label-sm text-outline leading-relaxed max-w-xs mx-auto">
              By creating an account, you agree to Lumina Commerce's
              <a className="underline mx-1" href="#">Terms of Service</a> and
              <a className="underline" href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
