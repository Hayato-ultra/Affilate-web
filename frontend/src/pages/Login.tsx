import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/shop');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      <SEO title="Sign In" description="Sign in to your Lumina Commerce account." />
      {/* Branding Section */}
      <section className="hidden md:flex md:w-1/2 relative overflow-hidden bg-surface-charcoal">
        <div className="absolute inset-0 opacity-60">
          <img
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB29i3D5C1cP4u4_TD8CuCLy86_8_A5zYIQxS1vZOk0avaRjB7FEzIfPHG2NBp47KfRBhWhNls6_-kRee9ziLg74mgtpZ2lnkjf-0XhV093aU5YrcZ8N5OzRT6y9amzT0f1yaCUd9QkxVuJZcvTn0aw2A-aMy1BfA6yhOAbn6Jv6DGdfKkby1mvK6KCaOJmLjBlMUeOYvMo7IcOZC2tKfJLsC4_3AoOZyT1yeBovtbMaT_Ir0MaukA8PqMYo_sv-THdJy5fsa3qjc4Q"
            alt=""
          />
        </div>
        <div className="relative z-10 p-margin-desktop flex flex-col justify-between h-full w-full">
          <div>
            <h1 className="text-display-lg font-display-lg text-surface-bright tracking-tight">Lumina Commerce</h1>
            <p className="mt-4 text-surface-variant max-w-md font-body-lg text-body-lg">
              Curated excellence for the modern digital storefront.
            </p>
          </div>
          <div className="flex gap-bento-gap">
            <div className="glass-card p-4 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-fixed">verified_user</span>
              <span className="text-label-sm font-label-sm text-surface-bright">SECURE CHECKOUT</span>
            </div>
            <div className="glass-card p-4 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-fixed">local_shipping</span>
              <span className="text-label-sm font-label-sm text-surface-bright">GLOBAL DELIVERY</span>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-charcoal via-transparent to-transparent opacity-80" />
      </section>

      {/* Login Section */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface relative">
        <div className="absolute top-8 left-margin-mobile md:hidden">
          <span className="text-headline-md font-headline-md text-on-surface">Lumina Commerce</span>
        </div>
        <div className="w-full max-w-[440px] space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-display-lg-mobile md:text-headline-md font-headline-md text-on-surface">Welcome back</h2>
            <p className="text-on-surface-variant mt-2 font-body-md text-body-md">Please enter your details to access your account.</p>
          </div>

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-lg font-body-md">
              {error}
            </div>
          )}

          <div className="glass-card p-8 rounded-xl shadow-sm border border-outline-variant/30 space-y-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block" htmlFor="login-email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border-b border-outline-variant focus:border-primary-container focus:ring-0 transition-all outline-none text-body-md font-body-md"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="login-password">Password</label>
                  <a className="text-label-sm font-label-sm text-primary hover:underline transition-all" href="#">Forgot Password?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white/50 border-b border-outline-variant focus:border-primary-container focus:ring-0 transition-all outline-none text-body-md font-body-md"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input className="w-4 h-4 rounded-sm border-outline-variant text-primary focus:ring-primary-container" id="remember" type="checkbox" />
                <label className="text-body-md font-body-md text-on-surface-variant cursor-pointer" htmlFor="remember">Remember for 30 days</label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-container text-on-primary py-4 rounded-lg font-headline-md text-[16px] hover:bg-primary transition-all active:scale-[0.98] shadow-md shadow-primary-container/20 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-outline-variant/30" />
              <span className="flex-shrink mx-4 text-label-sm font-label-sm text-outline">OR CONTINUE WITH</span>
              <div className="flex-grow border-t border-outline-variant/30" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-label-sm font-label-sm text-on-surface">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.96.95-2.04 1.43-3.23 1.43-1.16 0-2.25-.45-3.26-1.35-1.02.9-2.14 1.35-3.37 1.35-1.1 0-2.13-.44-3.1-1.32C2.26 18.51 1.3 16.03 1.3 12.87c0-2.27.6-4.14 1.81-5.61 1.2-1.47 2.76-2.2 4.67-2.2.87 0 1.76.24 2.66.71.9.47 1.6.71 2.1.71.43 0 1.1-.25 2.01-.76.92-.51 1.88-.76 2.87-.76 1.76 0 3.2.62 4.31 1.87-.16.12-.4.32-.71.59-1.44 1.25-2.16 2.85-2.16 4.8 0 1.58.5 2.92 1.51 4.02.5.55 1.05.98 1.65 1.29-.35 1-.95 1.98-1.8 2.95h.03zM12.03 5.41c0 .06-.01.12-.02.18-.01.06-.02.12-.04.18.23-1.32.74-2.4 1.51-3.22.78-.82 1.75-1.27 2.91-1.36.01.13.01.27.01.41 0 1.25-.5 2.37-1.5 3.37-.99 1-2.1 1.5-3.32 1.5l-.55-.06z" />
                </svg>
                <span className="text-label-sm font-label-sm text-on-surface">Apple</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-body-md font-body-md text-on-surface-variant">
              Don't have an account?
              <Link to="/register" className="text-primary font-bold hover:underline ml-1">Register for free</Link>
            </p>
          </div>
          <div className="flex justify-center md:justify-start gap-4 text-outline pt-4">
            <a className="flex items-center gap-1 hover:text-on-surface transition-colors" href="#">
              <span className="material-symbols-outlined text-[18px]">help_outline</span>
              <span className="text-label-sm font-label-sm">Help Center</span>
            </a>
            <a className="flex items-center gap-1 hover:text-on-surface transition-colors" href="#">
              <span className="material-symbols-outlined text-[18px]">shield</span>
              <span className="text-label-sm font-label-sm">Privacy</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
