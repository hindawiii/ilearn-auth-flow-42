export type NotifType = "lesson" | "achievement" | "general" | "reminder";

export type AppNotification = {
  id: number;
  type: NotifType;
  title: string;
  description: string;
  createdAt: number;
  read: boolean;
  link?: string;
  icon: string;
};

const KEY = "ilearn-notifications";
const SEED_KEY = "ilearn-notifications-seeded";

const ICONS: Record<NotifType, string> = {
  lesson: "🎓",
  achievement: "🏆",
  general: "📢",
  reminder: "⚠️",
};

function read(): AppNotification[] {
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return [];
    const arr = JSON.parse(v) as AppNotification[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(list: AppNotification[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ }
  try { window.dispatchEvent(new CustomEvent("ilearn-notifications-changed")); } catch { /* ignore */ }
}

export function seedNotificationsOnce() {
  try {
    if (localStorage.getItem(SEED_KEY)) return;
    const now = Date.now();
    const m = 60_000;
    const h = 60 * m;
    const d = 24 * h;
    const seed: AppNotification[] = [
      { id: now - 1, type: "achievement", title: "تهانينا! حصلت على شارة جديدة", description: "شارة: أول درس — أكملت أول درس في التطبيق", createdAt: now - 5 * m, read: false, link: "/achievements", icon: ICONS.achievement },
      { id: now - 2, type: "lesson", title: "أكملت درساً بنجاح", description: "درس: مقدمة في التشريح — +50 XP", createdAt: now - 30 * m, read: false, link: "/dashboard", icon: ICONS.lesson },
      { id: now - 3, type: "general", title: "درس جديد متاح", description: "تم إضافة درس جديد في قسم الكيمياء العضوية", createdAt: now - 2 * h, read: true, link: "/dashboard", icon: ICONS.general },
      { id: now - 4, type: "reminder", title: "تذكير بالدراسة", description: "لم تدرس منذ يومين! عُد للتعلم للحفاظ على streak", createdAt: now - 5 * h, read: false, link: "/dashboard", icon: ICONS.reminder },
      { id: now - 5, type: "lesson", title: "أكملت درساً بنجاح", description: "درس: أنواع الدم — +30 XP", createdAt: now - 1 * d, read: true, link: "/dashboard", icon: ICONS.lesson },
      { id: now - 6, type: "achievement", title: "شارة جديدة!", description: "شارة: متعلم نشط — أكملت 5 دروس", createdAt: now - 1 * d - 2 * h, read: true, link: "/achievements", icon: ICONS.achievement },
      { id: now - 7, type: "general", title: "تحديث التطبيق", description: "تم إضافة قسم جديد: الرسم التشريحي", createdAt: now - 3 * d, read: true, link: "/dashboard", icon: ICONS.general },
      { id: now - 8, type: "reminder", title: "streak على وشك الانقطاع!", description: "درس اليوم لم يُكمل بعد! أكمل درساً للحفاظ على streak", createdAt: now - 4 * d, read: true, link: "/dashboard", icon: ICONS.reminder },
    ];
    write(seed);
    localStorage.setItem(SEED_KEY, "1");
  } catch { /* ignore */ }
}

export function getNotifications(): AppNotification[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getUnreadCount(): number {
  return read().filter((n) => !n.read).length;
}

let seq = 0;
export function addNotification(n: Omit<AppNotification, "id" | "createdAt" | "read" | "icon"> & { read?: boolean; icon?: string }) {
  const list = read();
  const item: AppNotification = {
    id: Date.now() + (++seq),
    createdAt: Date.now(),
    read: n.read ?? false,
    icon: n.icon ?? ICONS[n.type],
    type: n.type,
    title: n.title,
    description: n.description,
    link: n.link,
  };
  list.unshift(item);
  write(list.slice(0, 200));
  return item;
}

export function markRead(id: number) {
  const list = read().map((n) => (n.id === id ? { ...n, read: true } : n));
  write(list);
}

export function markAllRead() {
  write(read().map((n) => ({ ...n, read: true })));
}

export function removeNotification(id: number) {
  write(read().filter((n) => n.id !== id));
}

export function clearAll() {
  write([]);
}

export function timeAgo(ts: number, now: number = Date.now()): string {
  const diff = Math.max(0, Math.floor((now - ts) / 60000));
  if (diff < 1) return "الآن";
  if (diff < 60) return `منذ ${diff} دقيقة`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d === 1) return "أمس";
  return `منذ ${d} يوم`;
}

export function onNotificationsChange(handler: () => void): () => void {
  const fn = () => handler();
  window.addEventListener("ilearn-notifications-changed", fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener("ilearn-notifications-changed", fn);
    window.removeEventListener("storage", fn);
  };
}
