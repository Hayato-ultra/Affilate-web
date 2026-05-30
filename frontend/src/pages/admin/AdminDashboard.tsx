import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getAdminAnalytics } from '../../api';

interface Stats {
  totalProducts: number;
  featured: number;
  outOfStock: number;
  clicks?: {
    total: number;
    unique_products: number;
    today: number;
    last7: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getAdminStats().catch(() => null),
      getAdminAnalytics().catch(() => null),
    ]).then(([s, a]) => {
      setStats(s);
      setAnalytics(a);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-8 h-8 border-2 border-outline border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Products', value: stats?.totalProducts ?? 0, icon: 'inventory_2', color: 'text-primary' },
    { label: 'Featured', value: stats?.featured ?? 0, icon: 'star', color: 'text-amber-500' },
    { label: 'Out of Stock', value: stats?.outOfStock ?? 0, icon: 'block', color: 'text-error' },
    { label: 'Total Clicks', value: stats?.clicks?.total ?? 0, icon: 'ads_click', color: 'text-green-600' },
    { label: 'Clicks Today', value: stats?.clicks?.today ?? 0, icon: 'today', color: 'text-blue-600' },
    { label: 'Clicks (7 days)', value: stats?.clicks?.last7 ?? 0, icon: 'date_range', color: 'text-purple-600' },
  ];

  return (
    <div>
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {cards.map(card => (
          <div
            key={card.label}
            className="bg-white border border-outline-variant/30 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => card.label !== 'Total Clicks' && card.label !== 'Clicks Today' && card.label !== 'Clicks (7 days)' && navigate('/admin/products')}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-3xl {card.color}">{card.icon}</span>
              <span className="text-3xl font-display-lg font-bold text-on-surface">{card.value}</span>
            </div>
            <p className="font-body-md text-on-surface-variant">{card.label}</p>
          </div>
        ))}
      </div>

      {analytics?.topProducts?.length > 0 && (
        <div className="bg-white border border-outline-variant/30 rounded-xl p-8 mb-8">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Top Clicked Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="pb-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Product ID</th>
                  <th className="pb-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Merchant</th>
                  <th className="pb-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Clicks</th>
                  <th className="pb-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Last Clicked</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProducts.slice(0, 5).map((p: any, i: number) => (
                  <tr key={i} className="border-b border-outline-variant/10">
                    <td className="py-3 font-body-md text-on-surface truncate max-w-[200px]">{p.product_id}</td>
                    <td className="py-3 font-body-md text-on-surface">{p.merchant}</td>
                    <td className="py-3 font-body-md font-semibold">{p.click_count}</td>
                    <td className="py-3 font-body-md text-on-surface-variant">{p.last_clicked_at ? new Date(p.last_clicked_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={() => navigate('/admin/products/new')} className="p-6 bg-white border border-outline-variant/30 rounded-xl text-left hover:shadow-md transition-all group">
          <span className="material-symbols-outlined text-3xl text-primary mb-3">add_circle</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 group-hover:text-primary transition-colors">Add New Product</h3>
          <p className="font-body-md text-on-surface-variant">Create a new product in the catalog.</p>
        </button>
        <button onClick={() => navigate('/admin/products')} className="p-6 bg-white border border-outline-variant/30 rounded-xl text-left hover:shadow-md transition-all group">
          <span className="material-symbols-outlined text-3xl text-primary mb-3">list_alt</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 group-hover:text-primary transition-colors">Manage Products</h3>
          <p className="font-body-md text-on-surface-variant">View, edit, or remove products.</p>
        </button>
        <button onClick={() => navigate('/admin/settings')} className="p-6 bg-white border border-outline-variant/30 rounded-xl text-left hover:shadow-md transition-all group">
          <span className="material-symbols-outlined text-3xl text-primary mb-3">settings</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 group-hover:text-primary transition-colors">Site Settings</h3>
          <p className="font-body-md text-on-surface-variant">Update hero content and site config.</p>
        </button>
      </div>
    </div>
  );
}
