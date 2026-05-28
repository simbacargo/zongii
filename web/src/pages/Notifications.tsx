import { useEffect, useState } from 'react';
import { notificationAPI } from '../lib/api';

const TYPE_EMOJI: Record<string, string> = {
  low_stock:        '⚠️',
  order_created:    '🛒',
  order_picked:     '📦',
  order_verified:   '✅',
  order_dispatched: '🚚',
  order_rejected:   '❌',
  re_pick:          '🔄',
};

export default function Notifications() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await notificationAPI.list();
      setNotifs(res.data.results ?? res.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markRead(id: number) {
    try {
      await notificationAPI.markRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  }

  async function markAll() {
    setMarking(true);
    try {
      await notificationAPI.markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
    setMarking(false);
  }

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div>
      <div className="flex-between mb-16">
        <span className="text-muted">{unread} unread</span>
        {unread > 0 && (
          <button className="btn btn-ghost" onClick={markAll} disabled={marking}>
            {marking ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-loader"><div className="page-loader-inner" /></div>
      ) : notifs.length === 0 ? (
        <div className="empty-state"><div className="icon">🔔</div>No notifications yet</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {notifs.map(n => (
            <div
              key={n.id}
              className={`notif-item${!n.is_read ? ' unread' : ''}`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <div className={`notif-dot${n.is_read ? ' read' : ''}`} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span>{TYPE_EMOJI[n.notification_type] ?? '🔔'}</span>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{n.title}</span>
                </div>
                {n.message && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{n.message}</div>}
                <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>
                  {new Date(n.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
