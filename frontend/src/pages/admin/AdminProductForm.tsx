import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createAdminProduct, updateAdminProduct, getAdminProducts, uploadImage, scrapeProductUrl, AdminProduct } from '../../api';

const PLATFORMS = ['amazon', 'flipkart', 'ebay', 'meesho', 'croma'];
const CATEGORIES = ['Apparel', 'Footwear', 'Accessories', 'Electronics', 'Home', 'Fitness', 'Food & Drink', 'Beauty'];
const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP'];

interface FormData {
  title: string;
  description: string;
  price_current: string;
  price_original: string;
  currency_code: string;
  merchant_platform: string;
  thumbnail_url: string;
  category: string;
  brand: string;
  model_number: string;
  upc: string;
  ean: string;
  asin: string;
  sku: string;
  affiliate_url: string;
  featured: boolean;
  in_stock: boolean;
}

const emptyForm: FormData = {
  title: '',
  description: '',
  price_current: '',
  price_original: '',
  currency_code: 'USD',
  merchant_platform: 'amazon',
  thumbnail_url: '',
  category: '',
  brand: '',
  model_number: '',
  upc: '',
  ean: '',
  asin: '',
  sku: '',
  affiliate_url: '',
  featured: false,
  in_stock: true,
};

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await getAdminProducts();
        const product = res.data.find(p => p.id === id);
        if (product) {
          setForm({
            title: product.title,
            description: product.description || '',
            price_current: String(product.price_current),
            price_original: product.price_original ? String(product.price_original) : '',
            currency_code: product.currency_code,
            merchant_platform: product.merchant_platform,
            thumbnail_url: product.thumbnail_url || '',
            category: product.category || '',
            brand: product.brand || '',
            model_number: product.model_number || '',
            upc: product.upc || '',
            ean: product.ean || '',
            asin: product.asin || '',
            sku: product.sku || '',
            affiliate_url: product.affiliate_url || '',
            featured: product.featured,
            in_stock: product.in_stock,
          });
        }
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) return;
    setScraping(true);
    try {
      const data = await scrapeProductUrl(scrapeUrl.trim());
      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        price_current: data.price_current ? String(data.price_current) : prev.price_current,
        price_original: data.price_original ? String(data.price_original) : prev.price_original,
        currency_code: data.currency_code || prev.currency_code,
        merchant_platform: data.merchant_platform || prev.merchant_platform,
        thumbnail_url: data.thumbnail_url || prev.thumbnail_url,
        brand: data.brand || prev.brand,
        sku: data.sku || prev.sku,
        category: data.category || prev.category,
        model_number: data.model_number || prev.model_number,
        upc: data.upc || prev.upc,
        ean: data.ean || prev.ean,
        asin: data.asin || prev.asin,
        affiliate_url: data.affiliate_url || prev.affiliate_url,
      }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setScraping(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price_current: parseFloat(form.price_current) || 0,
        price_original: form.price_original ? parseFloat(form.price_original) : null,
      };

      if (isEdit) {
        await updateAdminProduct(id!, payload);
      } else {
        await createAdminProduct(payload);
      }
      navigate('/admin/products');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file);
      setForm(prev => ({ ...prev, thumbnail_url: result.url }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-8 h-8 border-2 border-outline border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const labelClass = 'block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2';
  const inputClass = 'w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary bg-white transition-all';
  const fieldClass = 'flex-1 min-w-0';

  return (
    <div className="max-w-3xl">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-8">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      {/* Scrape from URL */}
      <div className="bg-white border border-primary/20 rounded-xl p-8 space-y-6 mb-8">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">link</span>
          <h2 className="font-headline-md text-headline-md text-on-surface">Import from URL</h2>
        </div>
        <p className="font-body-md text-on-surface-variant">Paste a product link from any store to auto-fill the form.</p>
        <div className="flex gap-3">
          <input
            value={scrapeUrl}
            onChange={e => setScrapeUrl(e.target.value)}
            className={inputClass}
            placeholder="https://www.amazon.in/dp/..."
          />
          <button type="button" onClick={handleScrape} disabled={scraping} className="shrink-0 px-6 py-3 bg-primary text-on-primary rounded-lg font-body-md hover:bg-cta-vibrant transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
            {scraping ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              <span className="material-symbols-outlined text-lg">download</span>
            )}
            {scraping ? 'Fetching...' : 'Fetch Details'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-8 space-y-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">Basic Information</h2>
          <div className={fieldClass}>
            <label className={labelClass}>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required className={inputClass} placeholder="Product name" />
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className={inputClass} rows={4} placeholder="Product description" />
          </div>
          <div className="flex gap-6 flex-wrap">
            <div className={fieldClass}>
              <label className={labelClass}>Price *</label>
              <input name="price_current" value={form.price_current} onChange={handleChange} required type="number" step="0.01" className={inputClass} placeholder="29.99" />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Original Price</label>
              <input name="price_original" value={form.price_original} onChange={handleChange} type="number" step="0.01" className={inputClass} placeholder="39.99" />
            </div>
            <div className="w-32">
              <label className={labelClass}>Currency</label>
              <select name="currency_code" value={form.currency_code} onChange={handleChange} className={inputClass}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Merchant */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-8 space-y-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">Merchant</h2>
          <div className="flex gap-6 flex-wrap">
            <div className={fieldClass}>
              <label className={labelClass}>Platform</label>
              <select name="merchant_platform" value={form.merchant_platform} onChange={handleChange} className={inputClass}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Affiliate Link</label>
            <input name="affiliate_url" value={form.affiliate_url} onChange={handleChange} className={inputClass} placeholder="https://amazon.in/dp/B0XXX?tag=affiliate-21" />
          </div>
        </div>

        {/* Media */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-8 space-y-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">Media</h2>
          <div className={fieldClass}>
            <label className={labelClass}>Thumbnail URL</label>
            <div className="flex gap-3">
              <input name="thumbnail_url" value={form.thumbnail_url} onChange={handleChange} className={inputClass} placeholder="https://images.unsplash.com/..." />
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="shrink-0 px-5 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body-md hover:bg-surface-container transition-all disabled:opacity-50">
                {uploading ? (
                  <span className="w-5 h-5 border-2 border-outline border-t-primary rounded-full animate-spin inline-block" />
                ) : 'Upload'}
              </button>
            </div>
            {form.thumbnail_url && (
              <div className="mt-3 w-24 h-24 rounded-lg overflow-hidden bg-surface-container-low">
                <img src={form.thumbnail_url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>
        </div>

        {/* Categorization */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-8 space-y-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">Categorization</h2>
          <div className="flex gap-6 flex-wrap">
            <div className={fieldClass}>
              <label className={labelClass}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange} className={inputClass} placeholder="Brand name" />
            </div>
          </div>
        </div>

        {/* Identifiers */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-8 space-y-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">Identifiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className={labelClass}>Model Number</label><input name="model_number" value={form.model_number} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>UPC</label><input name="upc" value={form.upc} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>EAN</label><input name="ean" value={form.ean} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>ASIN</label><input name="asin" value={form.asin} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>SKU</label><input name="sku" value={form.sku} onChange={handleChange} className={inputClass} /></div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-8 space-y-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">Status</h2>
          <div className="flex gap-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" />
              <span className="font-body-md text-on-surface">Featured product</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="in_stock" checked={form.in_stock} onChange={handleChange} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" />
              <span className="font-body-md text-on-surface">In stock</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pb-12">
          <button
            type="submit"
            disabled={saving}
            className="px-10 py-4 bg-primary text-on-primary rounded-lg font-body-md font-semibold hover:bg-cta-vibrant transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="px-10 py-4 border border-outline-variant text-on-surface rounded-lg font-body-md hover:bg-surface-container transition-all">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
