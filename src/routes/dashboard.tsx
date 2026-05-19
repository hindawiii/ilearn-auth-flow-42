import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraduationCap, LayoutDashboard, BookOpen, Trophy, Users, MessageSquare,
  Settings, LogOut, Bell, Search, Flame, Zap, Target, Award, ChevronLeft,
  Play, Clock, TrendingUp, Menu, X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "iLearn — لوحة التحكم" },
      { name: "description", content: "لوحة تحكم iLearn — تابع تقدّمك في التعلّم" },
    ],
  }),
  component: Dashboard,
});

// ============ MOCK DATA ============
const USER = { name: "أحمد", avatar: "أ", level: 7, xp: 2450, xpToNext: 3000, streak: 12 };

const STATS = [
  { label: "نقاط الخبرة (XP)", value: "2,450", icon: Zap, color: "text-primary", trend: "+12% هذا الأسبوع" },
  { label: "الدروس المكتملة", value: "47", icon: BookOpen, color: "text-secondary", trend: "+3 هذا الأسبوع" },
  { label: "أيام متتالية", value: "12", icon: Flame, color: "text-warning", trend: "أفضل سلسلة!" },
  { label: "المركز العالمي", value: "#284", icon: Trophy, color: "text-primary-light", trend: "▲ 23 مركز" },
];

const COURSES = [
  { title: "أساسيات البرمجة بـ Python", lessons: 24, progress: 75, category: "برمجة", duration: "6 ساعات" },
  { title: "تصميم واجهات المستخدم UI/UX", lessons: 18, progress: 40, category: "تصميم", duration: "4 ساعات" },
  { title: "الرياضيات للمطورين", lessons: 32, progress: 90, category: "رياضيات", duration: "8 ساعات" },
  { title: "اللغة الإنجليزية التقنية", lessons: 15, progress: 25, category: "لغات", duration: "3 ساعات" },
];

const ACHIEVEMENTS = [
  { icon: Flame, name: "أسبوع كامل", earned: true },
  { icon: Zap, name: "100 XP", earned: true },
  { icon: Target, name: "إتمام درس", earned: true },
  { icon: Award, name: "متفوّق", earned: false },
];

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "لوحة التحكم", active: true },
  { icon: BookOpen, label: "دروسي" },
  { icon: Trophy, label: "الإنجازات" },
  { icon: Users, label: "المجتمع" },
  { icon: MessageSquare, label: "الرسائل" },
  { icon: Settings, label: "الإعدادات" },
];

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const xpPercent = (USER.xp / USER.xpToNext) * 100;

  return (
    <div className="min-h-screen bg-background flex">
      <ThemeToggle />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-card border-l border-border z-40 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 flex items-center gap-2 border-b border-border">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
            iLearn
          </span>
          <button onClick={() => setSidebarOpen(false)} className="ms-auto md:hidden text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                item.active
                  ? "text-white shadow-md"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              style={item.active ? { background: "var(--gradient-primary)" } : undefined}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            to="/auth"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-4 px-4 md:px-8 h-16">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-foreground">
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden md:flex flex-1 max-w-md relative">
              <Search className="absolute inset-y-0 start-3 my-auto w-4 h-4 text-muted-foreground" />
              <input
                placeholder="ابحث عن درس، مدرّس، أو موضوع..."
                className="w-full h-10 rounded-xl bg-card border border-border ps-10 pe-3 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 ms-auto">
              <button className="relative h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-primary transition-colors">
                <Bell className="w-4 h-4 text-foreground" />
                <span className="absolute top-2 end-2 w-2 h-2 rounded-full bg-destructive" />
              </button>
              <div className="flex items-center gap-2 h-10 ps-2 pe-3 rounded-xl bg-card border border-border">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: "var(--gradient-primary)" }}>
                  {USER.avatar}
                </div>
                <span className="text-sm font-bold text-foreground hidden sm:inline">{USER.name}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6">
          {/* Welcome banner */}
          <section
            className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            <div className="relative z-10 max-w-xl space-y-3">
              <p className="text-white/80 text-sm">أهلاً بك مجدداً 👋</p>
              <h1 className="text-2xl md:text-3xl font-extrabold">مرحباً {USER.name}, مستعد لمتابعة التعلّم؟</h1>
              <p className="text-white/85 text-sm leading-relaxed">
                لقد أكملت ٧٥٪ من درس Python اليوم. تبقى ٥٥٠ XP فقط لتصل إلى المستوى {USER.level + 1}!
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white text-primary font-bold text-sm hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 fill-current" />
                  متابعة الدرس
                </button>
                <div className="flex items-center gap-1.5 text-sm font-bold">
                  <Flame className="w-4 h-4" />
                  {USER.streak} يوم متتالي
                </div>
              </div>
            </div>

            {/* Level progress */}
            <div className="mt-6 relative z-10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold">المستوى {USER.level}</span>
                <span>{USER.xp.toLocaleString("ar-EG")} / {USER.xpToNext.toLocaleString("ar-EG")} XP</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>

            {/* decorative blob */}
            <div className="absolute -top-10 -end-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          </section>

          {/* Stats grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="p-5 rounded-2xl bg-card border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <div className="text-2xl font-extrabold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                <div className="text-[11px] text-secondary font-medium mt-2">{s.trend}</div>
              </div>
            ))}
          </section>

          {/* Two columns */}
          <section className="grid lg:grid-cols-3 gap-6">
            {/* Courses */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-foreground">دروسي الحالية</h2>
                <button className="text-sm text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  عرض الكل <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {COURSES.map((c) => (
                  <div key={c.title} className="p-5 rounded-2xl bg-card border border-border hover:border-primary hover:shadow-lg transition-all group cursor-pointer">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                        {c.category}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {c.duration}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">{c.lessons} درساً</p>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">التقدّم</span>
                        <span className="font-bold text-foreground">{c.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${c.progress}%`, background: "var(--gradient-primary)" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements + leaderboard */}
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-card border border-border">
                <h2 className="text-lg font-extrabold text-foreground mb-4">إنجازاتي</h2>
                <div className="grid grid-cols-4 gap-3">
                  {ACHIEVEMENTS.map((a) => (
                    <div key={a.name} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                          a.earned ? "text-white" : "bg-muted text-muted-foreground grayscale"
                        }`}
                        style={a.earned ? { background: "var(--gradient-primary)" } : undefined}
                      >
                        <a.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] text-center text-muted-foreground leading-tight">{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border">
                <h2 className="text-lg font-extrabold text-foreground mb-4">المتصدّرون هذا الأسبوع</h2>
                <ul className="space-y-3">
                  {[
                    { name: "سارة م.", xp: "3,890", rank: 1 },
                    { name: "محمد ع.", xp: "3,210", rank: 2 },
                    { name: "أحمد (أنت)", xp: "2,450", rank: 3, you: true },
                    { name: "ليلى ك.", xp: "2,100", rank: 4 },
                  ].map((u) => (
                    <li key={u.name} className={`flex items-center gap-3 p-2 rounded-lg ${u.you ? "bg-accent" : ""}`}>
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                        u.rank === 1 ? "bg-warning text-foreground" :
                        u.rank === 2 ? "bg-muted-foreground/30 text-foreground" :
                        u.rank === 3 ? "bg-secondary/30 text-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        {u.rank}
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground">{u.name}</span>
                      <span className="text-xs font-bold text-primary">{u.xp} XP</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}