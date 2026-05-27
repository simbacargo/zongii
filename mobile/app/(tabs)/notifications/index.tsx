import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { notificationAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';

const TYPE_EMOJI: Record<string, string> = {
  low_stock:      '⚠️',
  order_created:  '🛒',
  order_picked:   '📦',
  order_verified: '✅',
  order_dispatched: '🚛',
  order_rejected: '❌',
  re_pick:        '🔄',
};

export default function NotificationsScreen() {
  const C = useColors();
  const styles = makeStyles(C);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await notificationAPI.list();
      setNotifications(res.data.results ?? res.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, []));

  async function markRead(id: number) {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
    setMarkingAll(false);
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading && notifications.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  return (
    <View style={styles.root}>
      {unreadCount > 0 && (
        <View style={styles.topBar}>
          <Text style={styles.unreadText}>{unreadCount} unread</Text>
          <TouchableOpacity onPress={markAllRead} disabled={markingAll}>
            <Text style={styles.markAllBtn}>{markingAll ? 'Marking…' : 'Mark all read'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.is_read && styles.cardUnread]}
            onPress={() => { if (!item.is_read) markRead(item.id); }}
            activeOpacity={item.is_read ? 1 : 0.7}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.emoji}>{TYPE_EMOJI[item.notification_type] ?? '🔔'}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.title, !item.is_read && styles.titleUnread]}>{item.title}</Text>
              {item.message ? <Text style={styles.message} numberOfLines={2}>{item.message}</Text> : null}
              <Text style={styles.time}>
                {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            {!item.is_read && <View style={styles.dot} />}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  unreadText:  { fontSize: 13, fontWeight: '700', color: C.text },
  markAllBtn:  { fontSize: 13, fontWeight: '600', color: C.primary },
  list:        { padding: 12, paddingBottom: 40, gap: 8 },
  card:        { backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardUnread:  { borderColor: C.primary, backgroundColor: C.primaryLight },
  cardLeft:    { paddingTop: 2 },
  emoji:       { fontSize: 22 },
  cardBody:    { flex: 1 },
  title:       { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 3 },
  titleUnread: { fontWeight: '800', color: C.text },
  message:     { fontSize: 12, color: C.textMuted, lineHeight: 17, marginBottom: 4 },
  time:        { fontSize: 11, color: C.textFaint },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary, marginTop: 4 },
  empty:       { alignItems: 'center', paddingTop: 80 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyText:   { fontSize: 15, fontWeight: '600', color: C.textMuted },
});
