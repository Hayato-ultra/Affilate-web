import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProducts, deleteAdminProduct, toggleFeatureProduct, AdminProduct } from '../../api';

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const load = async (p = page, q = search) => {
    setLoading(true);
    try {
      const res = await getAdminProducts(q || undefined, p);
      setProducts(res.data);
      setTotal(res.pagination.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); load(1, search); };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteAdminProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setTotal(prev => prev - 1);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleFeature = async (id: string, current: boolean) => {
    try {
      const updated = await toggleFeatureProduct(id, !current);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, featured: updated.featured } : p));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Products</h1>
        <Link to="/admin/products/new" className="px-6 py-3 bg-primary text-on-primary rounded-lg font-body-md font-semibold hover:bg-cta-vibrant transition-all active:scale-95 inline-flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">add</span>
          Add Product
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search products..."
          className="flex-1 max-w-md px-4 py-3 border border-outline-variant rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary bg-white"
        />
        <button onClick={handleSearch} className="px-6 py-3 bg-surface-charcoal text-surface-bright rounded-lg font-body-md hover:opacity-90 transition-all">
          Search
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-outline border-t-primary rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl text-outline mb-4">inventory_2</span>
          <p className="text-on-surface-variant">No products found.</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low">
                  <th className="text-left px-4 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase w-10"></th>
                  <th className="text-left px-4 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Product</th>
                  <th className="text-left px-4 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase hidden md:table-cell">Price</th>
                  <th className="text-left px-4 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase hidden md:table-cell">Merchant</th>
                  <th className="text-right px-4 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleFeature(p.id, p.featured)}
                        className={`transition-colors ${p.featured ? 'text-amber-500' : 'text-outline hover:text-amber-400'}`}
                        title={p.featured ? 'Unfeature' : 'Feature'}
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-surface-container-low overflow-hidden shrink-0">
                          {p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-body-md font-semibold text-on-surface">{p.title}</p>
                          {!p.in_stock && <span className="text-[10px] text-error font-bold uppercase">Out of Stock</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-on-surface-variant hidden md:table-cell">
                      <span className="px-2 py-0.5 bg-surface-container-high rounded text-xs">{p.category || '-'}</span>
                    </td>
                    <td className="px-4 py-4 font-body-md hidden md:table-cell">
                      {p.currency_code} {p.price_current.toLocaleString()}
                      {p.price_original && <span className="text-on-surface-variant line-through ml-2 text-sm">{p.currency_code} {p.price_original.toLocaleString()}</span>}
                    </td>
                    <td className="px-4 py-4 text-on-surface-variant hidden md:table-cell">
                      <span className="capitalize">{p.merchant_name || p.merchant_platform}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/products/${p.id}/edit`} className="p-2 hover:bg-surface-container rounded-lg transition-all text-primary" title="Edit">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <button onClick={() => handleDelete(p.id, p.title)} className="p-2 hover:bg-error-container rounded-lg transition-all text-error" title="Delete">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-outline-variant rounded-lg font-body-md disabled:opacity-30 hover:bg-surface-container transition-all">
                Previous
              </button>
              <span className="font-body-md text-on-surface-variant">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border border-outline-variant rounded-lg font-body-md disabled:opacity-30 hover:bg-surface-container transition-all">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
