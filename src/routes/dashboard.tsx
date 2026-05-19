import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  GraduationCap, LayoutDashboard, BookOpen, TrendingUp, Trophy, FileText,
  BarChart3, LogOut, Bell, MessageSquare, Search, ChevronLeft,
  Monitor, Smartphone, Code2, Camera, Brain, Wrench, Lock, Play, Clock, Flame,
  Star, CheckCircle2, Award, MessageCircle, Bot, Send, X, Moon, Sun,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

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
const USER = { name: "أحمد محمد", avatar: "أ", level: "المستوى 7" };

const MAIN_NAV = [
  { icon: LayoutDashboard, label: "الرئيسية", active: true },
  { icon: BookOpen, label: "دوراتي", badge: "8" },
  { icon: TrendingUp, label: "تقدمي" },
  { icon: Trophy, label: "الإنجازات", badge: "12" },
];

const SECTIONS_NAV = [
  { icon: Monitor, label: "الحاسوب", progress: 45 },
  { icon: Smartphone, label: "الهواتف", progress: 20 },
  { icon: Code2, label: "البرمجة", progress: 60 },
  { icon: Camera, label: "التصوير", progress: 10 },
  { icon: Brain, label: "الذكاء الاصطناعي", tag: "جديد" },
  { icon: Wrench, label: "الصيانة", tag: "قريباً", disabled: true },
];

const COMMUNITY_NAV = [
  { icon: MessageSquare, label: "المنتدى" },
  { icon: FileText, label: "المدونة" },
  { icon: BarChart3, label: "المتصدرون" },
];

const STATS = [
  { label: "دروس مكتملة", value: "24", change: "+12%", up: true, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
  { label: "ساعات تعلم", value: "156", change: "+8%", up: true, icon: Clock, color: "text-secondary", bg: "bg-secondary/10" },
  { label: "أيام متتالية", value: "7", change: "+25%", up: true, icon: Flame, color: "text-warning", bg: "bg-warning/10" },
  { label: "نقاط XP", value: "2,450", change: "-5%", up: false, icon: Star, color: "text-primary-light", bg: "bg-primary-light/10" },
];

const SECTIONS = [
  { name: "الحاسوب", desc: "كل ما يخص أجهزة الحاسوب وأنظمة التشغيل", icon: Monitor, color: "#6C5CE7", bgClass: "from-[#4A3F9F] to-[#6C5CE7]", lessons: 42, quizzes: 12, progress: 45, status: "active" },
  { name: "الهواتف", desc: "صيانة وبرمجة وتطبيقات الهواتف الذكية", icon: Smartphone, color: "#00D2D3", bgClass: "from-[#008B8B] to-[#00D2D3]", lessons: 28, quizzes: 8, progress: 20, status: "active" },
  { name: "البرمجة", desc: "تعلم لغات البرمجة من الصفر إلى الاحتراف", icon: Code2, color: "#E17055", bgClass: "from-[#C75B39] to-[#E17055]", lessons: 64, quizzes: 18, progress: 60, status: "active" },
  { name: "التصوير", desc: "فن التصوير الفوتوغرافي وتحرير الصور", icon: Camera, color: "#00B894", bgClass: "from-[#008B6B] to-[#00B894]", lessons: 32, quizzes: 10, progress: 10, status: "active" },
  { name: "الذكاء الاصطناعي", desc: "استكشف عالم AI وتعلم الآلة", icon: Brain, color: "#6C5CE7", bgClass: "from-[#4A3F9F] to-[#008B8B]", lessons: 38, quizzes: 14, progress: 15, status: "new" },
  { name: "الصيانة", desc: "صيانة الأجهزة الإلكترونية المتقدمة", icon: Wrench, color: "#E84393", bgClass: "from-[#C0396B] to-[#E84393]", lessons: 0, quizzes: 0, progress: 0, status: "locked" },
];

const ACTIVITIES = [
  { icon: CheckCircle2, color: "text-success", title: "أكملت درس: مقدمة في Python", time: "منذ ساعتين", xp: "+50 XP" },
  { icon: Award, color: "text-warning", title: "نجحت في اختبار: HTML & CSS", time: "منذ 5 ساعات", xp: "+100 XP" },
  { icon: Trophy, color: "text-primary", title: "حصلت على شارة: مبرمج مبتدئ", time: "أمس", xp: "+200 XP" },
  { icon: MessageCircle, color: "text-secondary", title: "علّقت في منتدى البرمجة", time: "أمس", xp: "+10 XP" },
];

const LEADERBOARD = [
  { rank: 1, name: "سارة المحمدي", xp: "5,890" },
  { rank: 2, name: "خالد الزهراني", xp: "5,210" },
  { rank: 3, name: "نورا العتيبي", xp: "4,750" },
  { rank: 4, name: "محمد السالم", xp: "4,320" },
  { rank: 5, name: "ريم الحربي", xp: "3,980" },
];

function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState("all");
  const { isDark, toggle } = useTheme();

  // Auto-collapse sidebar on tablet (768-1279px)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1279px)");
    const apply = () => setCollapsed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* ============ SIDEBAR (desktop) ============ */}
      <aside
        className={`${collapsed ? "w-20" : "w-72"} hidden lg:flex flex-col bg-card border-l border-border transition-all duration-300 sticky top-0 h-screen`}
      >
        {/* Collapse button — sits on the left edge (facing main content in RTL), centered vertically */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute top-1/2 -translate-y-1/2 -end-[15px] z-30 h-[30px] w-[30px] rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="طي الشريط"
        >
          <ChevronLeft
            className="w-4 h-4 transition-transform duration-300"
            style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        {/* Logo */}
        <div className="relative p-5 border-b border-border flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-primary)" }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
              iLearn
            </span>
          )}
        </div>

        {/* Mini profile */}
        <div className={`p-4 border-b border-border flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="h-11 w-11 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: "var(--gradient-primary)" }}>
            {USER.avatar}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-bold text-foreground truncate">{USER.name}</div>
              <div className="text-xs text-primary">{USER.level}</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {MAIN_NAV.map((item) => (
            <NavButton key={item.label} item={item} collapsed={collapsed} />
          ))}

          {!collapsed && <div className="px-3 pt-4 pb-2 text-[11px] font-bold text-muted-foreground uppercase">الأقسام</div>}
          {collapsed && <div className="my-3 mx-3 border-t border-border" />}
          {SECTIONS_NAV.map((item) => (
            <NavButton key={item.label} item={item} collapsed={collapsed} />
          ))}

          {!collapsed && <div className="px-3 pt-4 pb-2 text-[11px] font-bold text-muted-foreground uppercase">المجتمع</div>}
          {collapsed && <div className="my-3 mx-3 border-t border-border" />}
          {COMMUNITY_NAV.map((item) => (
            <NavButton key={item.label} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <Link
            to="/auth"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>تسجيل الخروج</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute end-0 top-0 h-full w-72 bg-card border-s border-border flex flex-col animate-ilearn-slide-up">
            <div className="p-5 border-b border-border flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>iLearn</span>
              <button onClick={() => setMobileOpen(false)} className="ms-auto text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {MAIN_NAV.map((item) => <NavButton key={item.label} item={item} collapsed={false} />)}
              <div className="px-3 pt-4 pb-2 text-[11px] font-bold text-muted-foreground uppercase">الأقسام</div>
              {SECTIONS_NAV.map((item) => <NavButton key={item.label} item={item} collapsed={false} />)}
              <div className="px-3 pt-4 pb-2 text-[11px] font-bold text-muted-foreground uppercase">المجتمع</div>
              {COMMUNITY_NAV.map((item) => <NavButton key={item.label} item={item} collapsed={false} />)}
            </nav>
          </aside>
        </div>
      )}

      {/* ============ MAIN ============ */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3 px-4 md:px-8 h-20">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-11 w-11 rounded-xl bg-card border border-border flex items-center justify-center text-foreground"
              aria-label="القائمة"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-extrabold text-foreground">لوحة التحكم</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">مرحباً {USER.name}، إليك ملخص نشاطك اليوم</p>
            </div>

            <div className="flex-1 max-w-md mx-auto hidden md:block relative">
              <Search className="absolute inset-y-0 start-3 my-auto w-4 h-4 text-muted-foreground" />
              <input
                placeholder="البحث في الدورات..."
                className="w-full h-11 rounded-xl bg-card border border-border ps-10 pe-4 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 ms-auto">
              <IconBtn onClick={toggle} aria-label="تبديل الوضع">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </IconBtn>
              <IconBtn aria-label="إشعارات">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 end-2 w-2 h-2 rounded-full bg-destructive" />
              </IconBtn>
              <IconBtn aria-label="رسائل">
                <MessageSquare className="w-4 h-4" />
              </IconBtn>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          {/* Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="p-5 rounded-2xl bg-card border border-border hover:shadow-lg hover:-translate-y-1 transition-all animate-ilearn-slide-up"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <span className={`text-xs font-bold ${s.up ? "text-success" : "text-destructive"}`}>{s.change}</span>
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </section>

          {/* Sections grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-foreground">الأقسام التعليمية</h2>
              <button className="text-sm text-primary font-bold hover:gap-2 flex items-center gap-1 transition-all">
                عرض الكل <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {SECTIONS.map((sec, i) => (
                <div
                  key={sec.name}
                  className={`relative rounded-2xl bg-card border border-border overflow-hidden group transition-all animate-ilearn-slide-up ${
                    sec.status === "locked" ? "opacity-60" : "hover:shadow-xl hover:-translate-y-1 hover:border-primary"
                  }`}
                  style={{ animationDelay: `${i * 70}ms`, animationFillMode: "backwards" }}
                >
                  {/* Color header */}
                  <div className={`h-24 bg-gradient-to-br ${sec.bgClass} relative flex items-center justify-center`}>
                    <sec.icon className="w-12 h-12 text-white" />
                    {sec.status === "new" && (
                      <span className="absolute top-3 end-3 text-[10px] font-bold px-2 py-1 rounded-full bg-white text-primary">جديد</span>
                    )}
                    {sec.status === "locked" && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-extrabold text-foreground">{sec.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{sec.desc}</p>
                    </div>

                    {sec.status !== "locked" ? (
                      <>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {sec.lessons} درس</span>
                          <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {sec.quizzes} اختبار</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">التقدم</span>
                            <span className="font-bold text-foreground">{sec.progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${sec.progress}%`, backgroundColor: sec.color }} />
                          </div>
                        </div>
                        <button className="w-full h-10 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ background: "var(--gradient-primary)" }}>
                          <Play className="w-4 h-4 fill-current" /> متابعة التعلم
                        </button>
                      </>
                    ) : (
                      <button disabled className="w-full h-10 rounded-xl bg-muted text-muted-foreground text-sm font-bold cursor-not-allowed">
                        قريباً
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Two columns: Activity + Leaderboard */}
          <section className="grid lg:grid-cols-3 gap-6">
            {/* Activity */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="text-lg font-extrabold text-foreground">النشاط الأخير</h2>
                <div className="flex gap-1 bg-muted p-1 rounded-lg">
                  {[
                    { id: "all", label: "الكل" },
                    { id: "lessons", label: "دروس" },
                    { id: "quizzes", label: "اختبارات" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActivityFilter(f.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        activityFilter === f.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <ul className="space-y-3">
                {ACTIVITIES.map((a, i) => (
                  <li key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent transition-colors">
                    <div className={`h-10 w-10 rounded-xl bg-accent flex items-center justify-center ${a.color}`}>
                      <a.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.time}</div>
                    </div>
                    <span className="text-xs font-bold text-primary shrink-0">{a.xp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Leaderboard */}
            <div className="p-5 rounded-2xl bg-card border border-border">
              <h2 className="text-lg font-extrabold text-foreground mb-5">المتصدّرون</h2>
              <ul className="space-y-2">
                {LEADERBOARD.map((u) => (
                  <li key={u.rank} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <RankBadge rank={u.rank} />
                    <span className="flex-1 text-sm font-medium text-foreground truncate">{u.name}</span>
                    <span className="text-xs font-bold text-primary">{u.xp} XP</span>
                  </li>
                ))}
                <li className="mt-3 pt-3 border-t border-border flex items-center gap-3 p-2 rounded-lg bg-primary/5">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-extrabold bg-primary/20 text-primary">
                    42
                  </div>
                  <span className="flex-1 text-sm font-bold text-foreground">أنت ({USER.name})</span>
                  <span className="text-xs font-bold text-primary">2,450 XP</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      {/* ============ AI ASSISTANT FAB ============ */}
      <AIAssistant open={chatOpen} setOpen={setChatOpen} />
    </div>
  );
}

// ============ HELPERS ============
function NavButton({
  item,
  collapsed,
}: {
  item: { icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean; badge?: string; tag?: string; progress?: number; disabled?: boolean };
  collapsed: boolean;
}) {
  return (
    <button
      disabled={item.disabled}
      title={collapsed ? item.label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        item.active
          ? "text-white shadow-md"
          : item.disabled
            ? "text-muted-foreground/60 cursor-not-allowed"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
      } ${collapsed ? "justify-center" : ""}`}
      style={item.active ? { background: "var(--gradient-primary)" } : undefined}
    >
      <item.icon className="w-5 h-5 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 text-start">{item.label}</span>
          {item.badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.active ? "bg-white/25 text-white" : "bg-primary/15 text-primary"}`}>
              {item.badge}
            </span>
          )}
          {item.tag && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.tag === "جديد" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
              {item.tag}
            </span>
          )}
          {typeof item.progress === "number" && (
            <div className="w-10 h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${item.progress}%`, background: "var(--gradient-primary)" }} />
            </div>
          )}
        </>
      )}
    </button>
  );
}

function IconBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="relative h-11 w-11 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
    >
      {children}
    </button>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const styles =
    rank === 1 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white" :
    rank === 2 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white" :
    rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white" :
    "bg-muted text-muted-foreground";
  return <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-extrabold ${styles}`}>{rank}</div>;
}

// ============ AI ASSISTANT ============
type ChatMsg = { from: "bot" | "user"; text: string };

function AIAssistant({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { from: "bot", text: "مرحباً أحمد 👋 أنا مساعدك الذكي. كيف أقدر أساعدك اليوم؟" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    const t = input.trim();
    if (!t) return;
    setMessages((m) => [...m, { from: "user", text: t }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: "تمام! سأساعدك في ذلك قريباً ✨" }]);
    }, 600);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="المساعد الذكي"
        className="fixed bottom-6 start-6 z-40 h-[60px] w-[60px] max-sm:h-[50px] max-sm:w-[50px] rounded-full text-white flex items-center justify-center hover:scale-110 transition-transform animate-ilearn-pulse"
        style={{ background: "var(--gradient-primary)" }}
      >
        <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "var(--gradient-primary)" }} />
        {open ? <X className="w-6 h-6 relative" /> : <Bot className="w-6 h-6 relative" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 start-6 z-40 w-[90vw] max-w-sm h-[60vh] max-h-[500px] rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden animate-ilearn-slide-up">
          <div className="p-4 text-white flex items-center gap-3" style={{ background: "var(--gradient-primary)" }}>
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">مساعد iLearn</div>
              <div className="text-[11px] text-white/80">متصل الآن</div>
            </div>
            <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-lg hover:bg-white/15 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    m.from === "user"
                      ? "text-white rounded-tr-sm"
                      : "bg-accent text-foreground rounded-tl-sm"
                  }`}
                  style={m.from === "user" ? { background: "var(--gradient-primary)" } : undefined}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="p-3 border-t border-border flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب رسالتك..."
              className="flex-1 h-10 rounded-xl bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button type="submit" className="h-10 w-10 rounded-xl text-white flex items-center justify-center hover:opacity-90" style={{ background: "var(--gradient-primary)" }}>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}