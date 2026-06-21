import { Router, Request, Response } from 'express';
import { getSupabaseAdmin, getSupabase } from '../db/supabase';
import { createScopedLogger } from '../utils/logger';
import { sanitizeHtml } from '../utils/xss';
import { safeErrorMessage } from '../utils/config';
import { authRegisterLimit, authLoginLimit, authMeLimit } from '../middleware/rateLimit';

const log = createScopedLogger('auth');
const router = Router();

router.post('/register', authRegisterLimit, async (req: Request, res: Response) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.replace(/<[^>]*>/g, '').trim().slice(0, 254) : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const name = typeof req.body.name === 'string' ? sanitizeHtml(req.body.name).trim().slice(0, 100) : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain uppercase, lowercase, and a number' });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || email.split('@')[0], role: 'user' },
    });

    if (error) {
      log.error({ error: error.message }, 'Registration failed');
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || email.split('@')[0],
        role: data.user.user_metadata?.role || 'user',
      },
    });
  } catch (err: any) {
    log.error({ error: err.message }, 'Register error');
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});

router.post('/login', authLoginLimit, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || email.split('@')[0],
        role: data.user.user_metadata?.role || 'user',
      },
      token: data.session.access_token,
    });
  } catch (err: any) {
    log.error({ error: err.message }, 'Login error');
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});

router.get('/me', authMeLimit, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.slice(7);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
        role: data.user.user_metadata?.role || 'user',
      },
      token,
    });
  } catch (err: any) {
    log.error({ error: err.message }, 'Get user error');
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const supabase = getSupabaseAdmin();
      await supabase.auth.admin.signOut(token);
    }
    res.json({ success: true });
  } catch {
    res.json({ success: true });
  }
});

export default router;
