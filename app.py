import os
from flask import Flask, render_template, jsonify, request, Response, session, redirect, url_for, flash, g
from dotenv import load_dotenv
from supabase import create_client, Client
from functools import wraps

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Mock data for initial layout testing
PRODUCTS = [
    {
        "id": "1",
        "name": "Sony WH-1000XM5",
        "description": "Industry-leading noise cancellation with two processors and 8 microphones for unprecedented sound quality.",
        "price": 348.00,
        "original_price": 399.99,
        "discount_badge": "13% OFF",
        "affiliate_url": "https://example.com/affiliate/sony-wh-1000xm5",
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAOH3bk7iDowmz3rhp__o5oi9pzoRRjmN-LCTFrXFxXjxDH9i7DRK4I56ba3GIeRwC4v_v5eJbA9xfz2v_lJj1rvse_ySX4CiZuPsjzlSS-DhfHxnWGZIfsTRqw6i5P_oAehTk4LGu2HYYU4zzOG1tby_ZcfeLonTxWy5-pc7YuKOIBbbWTkoS9FlTDiKvEBu68MmkpH6hTFcwXVLY0eUJedIwp3bM6JIcg2Hlqe2YSliLXiDkhOcimFOP6z-qFDlNAT9KmvCFrrXGL",
        "badges": ["In Stock"],
        "stock": 15,
        "category": "audio",
        "features": ["30-hour battery life", "Multipoint connection", "Speak-to-chat", "Premium leather headband"]
    },
    {
        "id": "2",
        "name": "MacBook Air M2",
        "description": "Strikingly thin design with the lightning-fast M2 chip, delivering exceptional speed and power efficiency.",
        "price": 999.00,
        "original_price": 1199.00,
        "discount_badge": "16% OFF",
        "affiliate_url": "https://example.com/affiliate/macbook-air-m2",
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBcivFmRWMIEqXgQkOR2ku2HVC7j_9izax4cXCMUKJ_6SirezviiCYwyFGpFxsZ_AQfez9oN-2rD7qV2UcmFJ1hy2RUmzMgQ2NXrR49Z4B05ic1gd2GHv6at0PK2dRt4pxgVuU6quSnZyLu_fq_4cqEPwLFybHYnzgegYQL7E1vtLUUt1Fb0WE4g1RGuixtd1r4V7qh4SWeVS8OtCPCWtYnE5Cx2-dKGCZ_F1ByK2f8v5bVAtQEfWDn6Km-PeS0GZO_QKoQUsVoUA5d",
        "badges": ["Top Choice"],
        "stock": 8,
        "category": "laptop",
        "features": ["M2 chip with 8-core CPU", "256GB SSD", "MagSafe charging", "Touch ID"]
    },
    {
        "id": "3",
        "name": "Studio Tablet 14\"",
        "description": "Ultra-thin form factor with Pro-X processor for creative powerhouses.",
        "price": 1299.00,
        "original_price": 1499.00,
        "discount_badge": "13% OFF",
        "affiliate_url": "https://example.com/affiliate/studio-tablet-14",
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDphuViyEidJ8vxymTbe6wEkbAeXdxLGdJYkE971HUKMPusE2-rQBzScM8zbqsOKv84yfd_4MFmp5K8Wwq1NsGuh6pVYt1Hd72d7bmywZ0L6ArZ79qSc3UxbfsddD4b9Am9wX_y81wGuR0-vu2OdKu2V0mlCXkIy9yjEvj5M1YF9Pc4zejrlR8mBhAkYDNnrgzMdlsad4KmXCNO42lSzdtSUEayIq3iervUL-MMooDf7W9yo9pT9lUhNFC3oN9iYxG0-wHNcqPRBY-Z",
        "badges": ["Elite Edition"],
        "stock": 5,
        "category": "laptop",
        "features": ["14\" OLED display", "Pro-X processor", "512GB SSD", " stylus support"]
    },
    {
        "id": "4",
        "name": "SonicFlow Gen-3",
        "description": "Adaptive Noise Cancellation with 60h battery life.",
        "price": 299.00,
        "original_price": 349.00,
        "discount_badge": "14% OFF",
        "affiliate_url": "https://example.com/affiliate/sonicflow-gen-3",
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuA3qqr4h2pjytyfpIq4dhfoOUV8nuSBxGsUlHLFMqSd7R7LQgl68-FZmqhmzy04-FyOEcI6CSWbmsPJRFb_4xDCMmkTM3DkU-lU94yxMqVChcBzEk3Cj4RoS0hleokAyexpJK1eM1jINtDiXrcvi1nil568WnZg8tA7FNY1YBYIIyk1pr1SvpC5zBpGOLPGfOG6joIcanrIkbNP8ztRiMHrnf3Nw90WkKYA80r5oOM-hBhhs0s5r4DaAOVTNHuDUe4QmozYIkf6k7HE",
        "badges": ["New"],
        "stock": 20,
        "category": "audio",
        "features": ["60-hour battery", "ANC Pro", "Multipoint", "Fast charge"]
    }
]

def _get_supabase() -> Client | None:
    """Get Supabase client if configured."""
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('SUPABASE_ANON_KEY')
    if not url or not key:
        return None
    try:
        return create_client(url, key)
    except Exception:
        return None


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin'):
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function


def login_required(f):
    """Decorator: redirect to login if user is not authenticated."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user'):
            flash('Please sign in to access this feature.', 'info')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


@app.before_request
def inject_user():
    """Make current user available to all templates via g.user."""
    g.user = session.get('user')


@app.context_processor
def utility_processor():
    """Inject user into all template contexts."""
    return dict(current_user=g.get('user'))


def _fetch_products():
    sb = _get_supabase()
    if not sb:
        return []
    try:
        res = sb.table('products').select('*').execute()
        return res.data or []
    except Exception:
        return []


# ═══════════════════════════════════════════════════════════════
#  PUBLIC ROUTES
# ═══════════════════════════════════════════════════════════════

@app.route('/')
def index():
    products = _fetch_products()
    return render_template('index.html', products=products, active_page="store")


@app.get("/favicon.ico")
def favicon():
    return Response(status=204)


@app.route('/alerts')
def alerts():
    alerts_list = []
    sb = _get_supabase()
    user = session.get('user')
    if sb:
        try:
            query = sb.table('price_alerts').select('*').order('created_at', desc=True)
            # If user is logged in, show only their alerts
            if user and user.get('email'):
                query = query.eq('email', user['email'])
            result = query.execute()
            alerts_list = result.data or []
        except Exception:
            alerts_list = []
    return render_template('alerts.html', active_page="alerts", alerts=alerts_list)


@app.route('/product/<product_id>')
def product(product_id):
    products = _fetch_products()
    p = next((p for p in products if str(p.get("id")) == str(product_id)), None)
    if not p:
        return "Product not found", 404
    return render_template('product.html', product=p, active_page="store")


# ═══════════════════════════════════════════════════════════════
#  USER AUTH ROUTES (Supabase Auth)
# ═══════════════════════════════════════════════════════════════

@app.route('/login', methods=['GET', 'POST'])
def login():
    if session.get('user'):
        return redirect(url_for('index'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')

        if not email or not password:
            flash('Email and password are required.', 'error')
            return render_template('login.html', active_page="login")

        sb = _get_supabase()
        if not sb:
            flash('Authentication service unavailable.', 'error')
            return render_template('login.html', active_page="login")

        try:
            res = sb.auth.sign_in_with_password({"email": email, "password": password})
            user_data = res.user
            session['user'] = {
                'id': user_data.id,
                'email': user_data.email,
                'name': (user_data.user_metadata or {}).get('name', email.split('@')[0]),
            }
            session['access_token'] = res.session.access_token
            flash(f'Welcome back, {session["user"]["name"]}!', 'success')
            return redirect(url_for('index'))
        except Exception as e:
            error_msg = str(e)
            if 'Invalid login' in error_msg or 'invalid' in error_msg.lower():
                flash('Invalid email or password.', 'error')
            else:
                flash('Sign in failed. Please try again.', 'error')

    return render_template('login.html', active_page="login")


@app.route('/register', methods=['GET', 'POST'])
def register():
    if session.get('user'):
        return redirect(url_for('index'))

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')

        if not email or not password:
            flash('Email and password are required.', 'error')
            return render_template('login.html', active_page="login", show_register=True)

        if len(password) < 6:
            flash('Password must be at least 6 characters.', 'error')
            return render_template('login.html', active_page="login", show_register=True)

        sb = _get_supabase()
        if not sb:
            flash('Authentication service unavailable.', 'error')
            return render_template('login.html', active_page="login", show_register=True)

        try:
            res = sb.auth.sign_up({
                "email": email,
                "password": password,
                "options": {"data": {"name": name or email.split('@')[0]}}
            })
            user_data = res.user
            if user_data:
                session['user'] = {
                    'id': user_data.id,
                    'email': user_data.email,
                    'name': name or email.split('@')[0],
                }
                if res.session:
                    session['access_token'] = res.session.access_token
                flash('Account created! Welcome aboard.', 'success')
                return redirect(url_for('index'))
            else:
                flash('Please check your email to confirm your account.', 'info')
                return redirect(url_for('login'))
        except Exception as e:
            error_msg = str(e)
            if 'already registered' in error_msg.lower() or 'already exists' in error_msg.lower():
                flash('An account with this email already exists.', 'error')
            else:
                flash('Registration failed. Please try again.', 'error')

    return render_template('login.html', active_page="login", show_register=True)


@app.route('/logout')
def logout():
    session.pop('user', None)
    session.pop('access_token', None)
    session.pop('admin', None)
    flash('You have been signed out.', 'info')
    return redirect(url_for('index'))


@app.route('/track')
@login_required
def track():
    sb = _get_supabase()
    user = session.get('user')
    stats = {
        "weekly_gains": "—",
        "active_alerts": 0,
        "recent_products": 0,
        "performance": "—"
    }
    recent_events = []

    if sb and user:
        try:
            # Count user's active alerts
            alerts_res = sb.table('price_alerts').select('*').eq('email', user['email']).execute()
            user_alerts = alerts_res.data or []
            stats["active_alerts"] = len(user_alerts)

            # Count unique tracked products
            tracked_ids = set(a.get('product_id') for a in user_alerts if a.get('product_id'))
            stats["recent_products"] = len(tracked_ids)

            # Build recent events from alerts
            for alert in user_alerts[:5]:
                recent_events.append({
                    "type": "Price Alert",
                    "text": f"{alert.get('product_name', 'Product')} — target ${alert.get('desired_price', 0):.2f}",
                    "status": "Active",
                    "status_color": "text-green-400"
                })
        except Exception:
            pass

    return render_template('track.html', active_page="track", stats=stats, events=recent_events)


@app.route('/account')
@login_required
def account():
    return render_template('account.html', active_page="account", user=session.get('user'))


# ═══════════════════════════════════════════════════════════════
#  ADMIN ROUTES
# ═══════════════════════════════════════════════════════════════

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        password = request.form.get('password')
        if password == ADMIN_PASSWORD:
            session['admin'] = True
            return redirect(url_for('admin'))
        else:
            flash('Invalid password', 'error')
    return render_template('admin_login.html', active_page="admin")

@app.route('/admin')
@admin_required
def admin():
    return render_template('admin.html', active_page="admin")

@app.route('/admin/products')
@admin_required
def admin_products():
    products = _fetch_products()
    return render_template('admin_products.html', products=products, active_page="admin")

@app.route('/admin/alerts')
@admin_required
def admin_alerts():
    sb = _get_supabase()
    alerts_list = []
    if sb:
        try:
            res = sb.table('price_alerts').select('*').order('created_at', desc=True).execute()
            if res.data is not None:
                alerts_list = res.data
        except Exception:
            pass
    return render_template('admin_alerts.html', alerts=alerts_list, active_page="admin")

@app.route('/admin/users')
@admin_required
def admin_users():
    return render_template('admin_users.html', active_page="admin")


# ═══════════════════════════════════════════════════════════════
#  API ROUTES
# ═══════════════════════════════════════════════════════════════

@app.get('/api/admin/products')
def api_admin_products():
    sb = _get_supabase()
    if not sb:
        return jsonify({"error": "Supabase not configured"}), 503
    try:
        res = sb.table('products').select('*').execute()
        return jsonify(res.data or [])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/seed-products', methods=['POST'])
@admin_required
def seed_products():
    sb = _get_supabase()
    if not sb:
        flash('Supabase not configured. Cannot seed product data.', 'error')
        return redirect(url_for('admin_products'))
    try:
        res = sb.table('products').insert(PRODUCTS).execute()
        if res.data:
            flash(f"Seeded {len(res.data)} product records into the database.", 'success')
        else:
            flash('Seed completed but no rows were returned.', 'warning')
    except Exception as e:
        flash(f'Failed to seed products: {e}', 'error')
    return redirect(url_for('admin_products'))

@app.post('/api/admin/products')
def api_create_product():
    data = request.get_json() or {}
    sb = _get_supabase()
    if not sb:
        return jsonify({"error": "Supabase not configured"}), 503
    try:
        res = sb.table('products').insert(data).execute()
        return jsonify(res.data[0]), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.put('/api/admin/products/<product_id>')
def api_update_product(product_id):
    data = request.get_json() or {}
    sb = _get_supabase()
    if not sb:
        return jsonify({"error": "Supabase not configured"}), 503
    try:
        res = sb.table('products').update(data).eq('id', product_id).execute()
        return jsonify(res.data[0])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.delete('/api/admin/products/<product_id>')
def api_delete_product(product_id):
    sb = _get_supabase()
    if not sb:
        return jsonify({"error": "Supabase not configured"}), 503
    try:
        sb.table('products').delete().eq('id', product_id).execute()
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.get('/api/admin/alerts')
def api_admin_alerts():
    sb = _get_supabase()
    if not sb:
        return jsonify({"error": "Supabase not configured"}), 503
    try:
        res = sb.table('price_alerts').select('*').order('created_at', desc=True).execute()
        return jsonify(res.data or [])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.delete('/api/admin/alerts/<alert_id>')
def api_delete_alert(alert_id):
    sb = _get_supabase()
    if sb:
        try:
            sb.table('price_alerts').delete().eq('id', alert_id).execute()
            return jsonify({"ok": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"ok": True})

@app.get('/api/admin/stats')
def api_admin_stats():
    sb = _get_supabase()
    if not sb:
        return jsonify({"error": "Supabase not configured"}), 503

    stats = {
        "products": 0,
        "alerts": 0,
        "views": 0
    }
    try:
        alerts = sb.table('price_alerts').select('id', count='exact').execute()
        stats["alerts"] = alerts.count or 0
    except:
        pass
    return jsonify(stats)


@app.post("/api/price-alerts")
def create_price_alert():
    payload = request.get_json(silent=True) or {}
    product_id = str(payload.get("product_id") or "").strip()
    product_name = str(payload.get("product_name") or "").strip()
    email = str(payload.get("email") or "").strip()
    desired_price = payload.get("desired_price")
    current_price = payload.get("current_price")

    # If user is logged in, use their email
    user = session.get('user')
    if not user:
        return jsonify({"ok": False, "error": "Authentication required"}), 401

    if user.get('email') and not email:
        email = user['email']

    errors = {}
    if not product_id:
        errors["product_id"] = "required"
    if not email or "@" not in email:
        errors["email"] = "invalid"
    try:
        desired_price = float(desired_price)
        if desired_price <= 0:
            raise ValueError()
    except Exception:
        errors["desired_price"] = "invalid"

    if errors:
        return jsonify({"ok": False, "errors": errors}), 400

    sb = _get_supabase()
    if not sb:
        return jsonify({"ok": False, "error": "Supabase not configured"}), 503

    try:
        res = (
            sb.table("price_alerts")
            .insert(
                {
                    "product_id": product_id,
                    "product_name": product_name or None,
                    "email": email,
                    "desired_price": desired_price,
                    "current_price": float(current_price) if current_price is not None else None,
                }
            )
            .execute()
        )
        return jsonify({"ok": True, "source": "supabase", "data": res.data}), 201
    except Exception as e:
        return jsonify({"ok": False, "source": "supabase", "error": str(e)}), 502

if __name__ == '__main__':
    #app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
    app.run(debug=True,port=5000)