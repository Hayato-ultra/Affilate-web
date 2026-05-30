import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationRead, NotificationItem } from '../api';
import { getCurrencySymbol } from '../utils/images';

const ALERT_EMAIL_KEY = 'lumina_alert_email';
const POLL_INTERVAL = 60 * 1000;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!email) return;
    try {
      const res = await getNotifications(email);
      setNotifications(res.notifications);
      setUnread(res.unread);
    } catch {}
  }, [email]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ALERT_EMAIL_KEY);
      setEmail(saved || null);
    } catch {}
  }, []);

  useEffect(() => {
    if (!email) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [email, fetchNotifications]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: 1 } : n))
      );
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  if (!email) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative material-symbols-outlined text-primary hover:bg-surface-container-low p-2 rounded-full transition-all active:scale-95"
      >
        notifications
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-outline-variant/30 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50">
          <div className="p-3 border-b border-outline-variant/20">
            <p className="font-headline-md text-headline-md text-on-surface">Notifications</p>
          </div>
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-on-surface-variant font-body-md">
              No notifications yet. Set a price alert to get started.
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-green-600 text-lg mt-0.5">notifications_active</span>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${n.product_id}`}
                      onClick={() => { handleMarkRead(n.id); setOpen(false); }}
                      className="font-label-sm text-label-sm text-on-surface hover:text-primary line-clamp-2"
                    >
                      {n.product_title}
                    </Link>
                    <p className="font-body-md text-body-md text-green-700 mt-0.5">
                      Price dropped to {getCurrencySymbol(n.currency)}{n.current_price.toLocaleString()}
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                      Target was {getCurrencySymbol(n.currency)}{n.target_price.toLocaleString()}
                      <span className="ml-2">{new Date(n.created_at).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
