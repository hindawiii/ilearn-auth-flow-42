import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BellOff, CheckCheck, Trash2, GraduationCap, Trophy, Megaphone, AlertTriangle, X } from "lucide-react";
import {
  AppNotification, NotifType, clearAll, getNotifications, markAllRead, markRead,
  onNotificationsChange, removeNotification, seedNotificationsOnce, timeAgo,
} from "@/lib/notifications";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "iLearn — الإشعارات" },
      { name: "description", content: "مركز إشعارات iLearn" },
    ],
  }),
  component: NotificationsPage,
});

type FilterId = "all" | "unread" | "lesson" | "achievement";

const TYPE_STYLES: Record<NotifType, { icon: typeof GraduationCap; color: string; bg: string }> = {
  lesson: { icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
  achievement: { icon: Trophy, color: "text-warning", bg: "bg-warning/10" },
  general: { icon: Megaphone, color: "text-secondary", bg: "bg-secondary/10" },
  reminder: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
};

function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<FilterId>("all");
  const [now, setNow] = useState(Date.now());
  const [confirmClear, setConfirmClear] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    seedNotificationsOnce();
    setItems(getNotifications());
    const off = onNotificationsChange(() => setItems(getNotifications()));
    const tick = setInterval(() => setNow(Date.now()), 30000);
    return () => { off(); clearInterval(tick); };
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;
  const lessonCount = items.filter((n) => n.type === "lesson").length;
  const achievementCount = items.filter((n) => n.type === "achievement").length;

  const filtered = useMemo(() => {
    switch (filter) {
      case "unread": return items.filter((n) => !n.read);
      case "lesson": return items.filter((n) => n.type === "lesson");
      case "achievement": return items.filter((n) => n.type === "achievement");
      default: return items;
    }
  }, [items, filter]);

  const handleOpen = (n: AppNotification) => {
    if (!n.read) markRead(n.id);
    if (n.link) navigate({ to: n.link });
  };

  const handleDelete = (id: number) => {
    setRemoving(id);
    setTimeout(() => {
      removeNotification(id);
      setRemoving(null);
    }, 200);
  };

  const FILTERS: { id: FilterId; label: string; count: number }[] = [
    { id: "all", label: "الكل", count: items.length },
    { id: "unread", label: "غير مقروء", count: unreadCount },
    { id: "lesson", label: "الدروس", count: lessonCount },
    { id: "achievement", label: "الإنجازات", count: achievementCount },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 md:px-8 h-16">
          <Link to="/dashboard" className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent">
            <ArrowRight className="w-4 h-4" />
          </Link>
          <h1 className="text-base md:text-lg font-extrabold ilearn-gradient-text flex items-center gap-2">
            <span aria-hidden>🔔</span> الإشعارات
            {unreadCount > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-destructive text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <div className="ms-auto flex items-center gap-2">
            <button
              onClick={() => markAllRead()}
              disabled={unreadCount === 0}
              className="h-10 px-3 rounded-xl bg-card border border-border text-xs font-bold inline-flex items-center gap-1 hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCheck className="w-4 h-4" /> <span className="hidden sm:inline">تحديد الكل كمقروء</span>
            </button>
            <button
              onClick={() => setConfirmClear(true)}
              disabled={items.length === 0}
              className="h-10 px-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold inline-flex items-center gap-1 hover:bg-destructive/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">مسح الكل</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`h-10 px-4 rounded-xl text-sm font-bold border transition-all ${
                  active
                    ? "text-white border-transparent shadow-md"
                    : "bg-transparent border-border text-foreground hover:border-primary"
                }`}
                style={active ? { background: "var(--gradient-primary)" } : undefined}
              >
                {f.label} <span className={`text-[11px] ${active ? "text-white/80" : "text-muted-foreground"}`}>({f.count})</span>
              </button>
            );
          })}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-card border border-border rounded-2xl animate-ilearn-slide-up">
            <BellOff className="w-16 h-16 mx-auto text-muted-foreground/60" />
            <div className="mt-4 text-lg font-extrabold text-foreground">لا توجد إشعارات</div>
            <p className="text-sm text-muted-foreground mt-1">ستظهر إشعاراتك هنا عند توفرها</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center mt-5 h-11 px-6 rounded-xl text-white font-bold text-sm"
              style={{ background: "var(--gradient-primary)" }}
            >
              العودة للرئيسية
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((n, i) => {
              const style = TYPE_STYLES[n.type];
              const Icon = style.icon;
              const isRemoving = removing === n.id;
              return (
                <li
                  key={n.id}
                  className={`group relative rounded-2xl bg-card border border-border overflow-hidden transition-all ${
                    isRemoving ? "opacity-0 -translate-x-4" : "animate-ilearn-slide-up hover:border-primary"
                  } ${!n.read ? "border-s-4 border-s-primary" : ""}`}
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}
                >
                  <div className="flex items-start gap-3 p-4">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => handleOpen(n)}
                      className="flex-1 min-w-0 text-start"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none" aria-hidden>{n.icon}</span>
                        <span className={`text-sm font-extrabold ${n.read ? "text-foreground" : "text-foreground"}`}>
                          {n.title}
                        </span>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.description}</p>
                      <div className="text-[11px] text-muted-foreground mt-1.5">{timeAgo(n.createdAt, now)}</div>
                    </button>
                    <div className="flex flex-col items-end gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-[11px] font-bold text-primary hover:underline whitespace-nowrap"
                        >
                          تحديد كمقروء
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="h-7 w-7 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center"
                        aria-label="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Confirm clear modal */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmClear(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-ilearn-slide-up">
            <button onClick={() => setConfirmClear(false)} className="absolute top-3 end-3 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
            <div className="h-12 w-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground">مسح كل الإشعارات؟</h3>
            <p className="text-sm text-muted-foreground mt-1">سيتم حذف جميع الإشعارات نهائياً ولا يمكن التراجع.</p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 h-10 rounded-xl bg-card border border-border text-sm font-bold hover:bg-accent"
              >
                إلغاء
              </button>
              <button
                onClick={() => { clearAll(); setConfirmClear(false); }}
                className="flex-1 h-10 rounded-xl bg-destructive text-white text-sm font-bold hover:bg-destructive/90"
              >
                مسح الكل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
