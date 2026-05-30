import { useState, useEffect } from 'react';
import { getAdminSettings, updateAdminSettings } from '../../api';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminSettings()
      .then(data => {
        const flat: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => {
          flat[k] = typeof v === 'string' ? v.replace(/^"(.*)"$/, '$1') : String(v);
        });
        setSettings(flat);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      Object.entries(settings).forEach(([k, v]) => { payload[k] = v; });
      await updateAdminSettings(payload);
      alert('Settings saved!');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
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
  const inputClass = 'w-full max-w-lg px-4 py-3 border border-outline-variant rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary bg-white transition-all';

  return (
    <div className="max-w-3xl">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-8">Site Settings</h1>

      <div className="bg-white border border-outline-variant/30 rounded-xl p-8 space-y-6">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key}>
            <label className={labelClass}>{key.replace(/_/g, ' ')}</label>
            <input
              value={value}
              onChange={e => handleChange(key, e.target.value)}
              className={inputClass}
              placeholder={`Enter ${key.replace(/_/g, ' ')}`}
            />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-10 py-4 bg-primary text-on-primary rounded-lg font-body-md font-semibold hover:bg-cta-vibrant transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
