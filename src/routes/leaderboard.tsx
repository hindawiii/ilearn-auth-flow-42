import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search, X, Flame, BookOpen, Award } from "lucide-react";
import { getEarned, ACHIEVEMENTS } from "@/lib/achievements";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "iLearn — المتصدرون" },
      { name: "description", content: "تنافس مع آلاف المتعلمين واصعد في الترتيب" },
    ],
  }),
  component: LeaderboardPage,
});

type User = { id: number; name: string; xp: number; avatar: string; streak: number; lessons: number };

const MOCK: User[] = [
  { id: 1, name: "خالد العلي", xp: 5230, avatar: "خ", streak: 15, lessons: 45 },
  { id: 2, name: "سارة أحمد", xp: 4890, avatar: "س", streak: 12, lessons: 38 },
  { id: 3, name: "محمد السالم", xp: 4650, avatar: "م", streak: 20, lessons: 41 },
  { id: 4, name: "نورة الدوسري", xp: 4120, avatar: "ن", streak: 8, lessons: 35 },
  { id: 5, name: "فهد القحطاني", xp: 3890, avatar: "ف", streak: 10, lessons: 32 },
  { id: 6, name: "ليلى الحربي", xp: 3560, avatar: "ل", streak: 14, lessons: 29 },
  { id: 7, name: "عبدالله المطيري", xp: 3340, avatar: "ع", streak: 6, lessons: 27 },
  { id: 8, name: "ريم الشمري", xp: 3120, avatar: "ر", streak: 11, lessons: 25 },
  { id: 9, name: "يوسف الغامدي", xp: 2980, avatar: "ي", streak: 9, lessons: 24 },
  { id: 10, name: "هند البقمي", xp: 2750, avatar: "هـ", streak: 7, lessons: 22 },
  { id: 11, name: "سعد العتيبي", xp: 2640, avatar: "س", streak: 5, lessons: 21 },
  { id: 12, name: "منى الزهراني", xp: 2520, avatar: "م", streak: 13, lessons: 20 },
  { id: 13, name: "طلال الشهراني", xp: 2410, avatar: "ط", streak: 4, lessons: 19 },
  { id: 14, name: "أمل الرشيد", xp: 2300, avatar: "أ", streak: 8, lessons: 18 },
  { id: 15, name: "بندر الدوسري", xp: 2190, avatar: "ب", streak: 6, lessons: 17 },
  { id: 16, name: "جميلة القحطاني", xp: 2080, avatar: "ج", streak: 10, lessons: 16 },
  { id: 17, name: "راشد المالكي", xp: 1970, avatar: "ر", streak: 3, lessons: 15 },
  { id: 18, name: "دلال الحربي", xp: 1860, avatar: "د", streak: 7, lessons: 14 },
  { id: 19, name: "ماجد العنزي", xp: 1750, avatar: "م", streak: 5, lessons: 13 },
  { id: 20, name: "وفاء الشمري", xp: 1640, avatar: "و", streak: 9, lessons: 12 },
  { id: 21, name: "عمر السهلي", xp: 1530, avatar: "ع", streak: 4, lessons: 11 },
  { id: 22, name: "نادية العتيبي", xp: 1420, avatar: "ن", streak: 6, lessons: 10 },
  { id: 23, name: "سلطان المطيري", xp: 1310, avatar: "س", streak: 2, lessons: 9 },
  { id: 24, name: "هدى الزهراني", xp: 1200, avatar: "هـ", streak: 8, lessons: 8 },
  { id: 25, name: "فيصل الشهراني", xp: 1150, avatar: "ف", streak: 3, lessons: 8 },
  { id: 26, name: "بتول الرشيد", xp: 1090, avatar: "ب", streak: 5, lessons: 7 },
  { id: 27, name: "مشعل الدوسري", xp: 980, avatar: "م", streak: 4, lessons: 6 },
  { id: 28, name: "آلاء القحطاني", xp: 870, avatar: "آ", streak: 6, lessons: 6 },
  { id: 29, name: "تركي الحربي", xp: 760, avatar: "ت", streak: 2, lessons: 5 },
  { id: 30, name: "شيماء العنزي", xp: 650, avatar: "ش", streak: 7, lessons: 4 },
  { id: 31, name: "جابر المالكي", xp: 580, avatar: "ج", streak: 3, lessons: 4 },
  { id: 32, name: "عائشة السهلي", xp: 520, avatar: "ع", streak: 5, lessons: 3 },
  { id: 33, name: "ثامر الشمري", xp: 460, avatar: "ث", streak: 2, lessons: 3 },
  { id: 34, name: "رنا العتيبي", xp: 400, avatar: "ر", streak: 4, lessons: 2 },
  { id: 35, name: "مبارك الزهراني", xp: 350, avatar: "م", streak: 1, lessons: 2 },
  { id: 36, name: "لمى الشهراني", xp: 310, avatar: "ل", streak: 3, lessons: 2 },
  { id: 37, name: "ضاري الرشيد", xp: 270, avatar: "ض", streak: 2, lessons: 1 },
  { id: 38, name: "إيمان الدوسري", xp: 230, avatar: "إ", streak: 4, lessons: 1 },
  { id: 39, name: "خلف القحطاني", xp: 200, avatar: "خ", streak: 1, lessons: 1 },
  { id: 40, name: "مي الحربي", xp: 170, avatar: "م", streak: 2, lessons: 1 },
  { id: 41, name: "عادل العنزي", xp: 140, avatar: "ع", streak: 1, lessons: 1 },
  { id: 42, name: "أنت", xp: 120, avatar: "أ", streak: 1, lessons: 0 },
  { id: 43, name: "نواف المالكي", xp: 100, avatar: "ن", streak: 0, lessons: 0 },
  { id: 44, name: "هيفاء السهلي", xp: 90, avatar: "هـ", streak: 1, lessons: 0 },
  { id: 45, name: "يزيد الشمري", xp: 80, avatar: "ي", streak: 0, lessons: 0 },
  { id: 46, name: "وجدان العتيبي", xp: 70, avatar: "و", streak: 1, lessons: 0 },
  { id: 47, name: "صالح الزهراني", xp: 60, avatar: "ص", streak: 0, lessons: 0 },
  { id: 48, name: "غادة الشهراني", xp: 50, avatar: "غ", streak: 0, lessons: 0 },
  { id: 49, name: "فراس الرشيد", xp: 40, avatar: "ف", streak: 0, lessons: 0 },
  { id: 50, name: "مها الدوسري", xp: 30, avatar: "م", streak: 0, lessons: 0 },
];

type Range = "week" | "month" | "all";

function applyRange(users: User[], range: Range): User[] {
  const factor = range === "week" ? 0.18 : range === "month" ? 0.55 : 1;
  return users
    .map((u) => ({ ...u, xp: u.id === 42 ? u.xp : Math.round(u.xp * factor + (u.id * 7) % 50) }))
    .sort((a, b) => b.xp - a.xp);
}

function LeaderboardPage() {
  const [range, setRange] = useState<Range>("all");
  const [query, setQuery] = useState("");
  const [openUser, setOpenUser] = useState<User | null>(null);
  const [userXp, setUserXp] = useState(120);

  useEffect(() => {
    try {
      const v = parseInt(localStorage.getItem("ilearn-xp") ?? "120", 10);
      if (!Number.isNaN(v) && v > 0) setUserXp(v);
    } catch { /* ignore */ }
  }, []);

  const ranked = useMemo(() => {
    const base = MOCK.map((u) => (u.id === 42 ? { ...u, xp: userXp } : u));
    return applyRange(base, range);
  }, [range, userXp]);

  const youIndex = ranked.findIndex((u) => u.id === 42);
  const you = ranked[youIndex];
  const above = youIndex > 0 ? ranked[youIndex - 1] : null;
  const gap = above ? above.xp - you.xp : 0;

  const filtered = useMemo(
    () => ranked.filter((u) => !query.trim() || u.name.includes(query.trim())),
    [ranked, query]
  );

  const top3 = ranked.slice(0, 3);
  const rest = filtered.filter((u) => !top3.includes(u));

  const earnedBadges = useMemo(() => Object.keys(getEarned()).length, [openUser]);

  return (
    <div className="min-h-screen bg-background pb-32" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 md:px-8 h-16">
          <Link to="/dashboard" className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent">
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base md:text-lg font-extrabold text-foreground">🏆 المتصدرون</h1>
            <p className="text-xs text-muted-foreground">تنافس مع آلاف المتعلمين واصعد في الترتيب</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-8 animate-in fade-in duration-500">
        {/* Your quick stat */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold">#{youIndex + 1}</div>
            <div>
              <div className="text-xs text-muted-foreground">مركزك الحالي</div>
              <div className="text-sm font-bold text-foreground">من أصل {ranked.length}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">XP الخاص بك</div>
            <div className="text-lg font-extrabold text-primary tabular-nums">{you.xp.toLocaleString("en-US")}</div>
          </div>
          {above && (
            <div>
              <div className="text-xs text-muted-foreground">للوصول للمركز #{youIndex}</div>
              <div className="text-lg font-extrabold text-foreground tabular-nums">+{gap.toLocaleString("en-US")} XP</div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-muted p-1 rounded-xl">
            {([
              { id: "week", label: "الأسبوع" },
              { id: "month", label: "الشهر" },
              { id: "all", label: "الكل" },
            ] as { id: Range; label: string }[]).map((f) => (
              <button
                key={f.id}
                onClick={() => setRange(f.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  range === f.id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن متعلم..."
              className="w-full h-10 pr-10 pl-4 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Podium */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {[1, 0, 2].map((order, idx) => {
            const u = top3[order];
            if (!u) return <div key={idx} />;
            const place = order + 1;
            const cfg = place === 1
              ? { color: "from-amber-400 to-yellow-600", ring: "ring-amber-400/60", glow: "shadow-[0_0_40px_rgba(251,191,36,0.45)]", medal: "🥇", h: "sm:h-64" }
              : place === 2
              ? { color: "from-slate-300 to-slate-500", ring: "ring-slate-300/60", glow: "shadow-[0_0_30px_rgba(203,213,225,0.4)]", medal: "🥈", h: "sm:h-56" }
              : { color: "from-orange-400 to-amber-700", ring: "ring-orange-400/60", glow: "shadow-[0_0_30px_rgba(251,146,60,0.4)]", medal: "🥉", h: "sm:h-52" };
            return (
              <button
                key={u.id}
                onClick={() => setOpenUser(u)}
                className={`group relative rounded-2xl border border-border bg-card p-5 flex flex-col items-center justify-end ${cfg.h} ${cfg.glow} hover:-translate-y-1 transition-all animate-in zoom-in-95 duration-500`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="absolute -top-3 right-3 text-2xl">{cfg.medal}</div>
                <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${cfg.color} ring-4 ${cfg.ring} flex items-center justify-center text-3xl font-extrabold text-white mb-3`}>
                  {u.avatar}
                </div>
                <div className="text-sm font-bold text-foreground truncate max-w-full">{u.name}</div>
                <div className="text-xl font-extrabold text-primary tabular-nums mt-1">{u.xp.toLocaleString("en-US")} XP</div>
                <div className="text-xs text-muted-foreground mt-1">المركز #{place}</div>
              </button>
            );
          })}
        </section>

        {/* Ranking list */}
        <section className="rounded-2xl border border-border bg-card overflow-hidden">
          <ul className="divide-y divide-border">
            {rest.map((u) => {
              const rank = ranked.indexOf(u) + 1;
              const pct = Math.max(4, (u.xp / ranked[0].xp) * 100);
              const rankColor = rank <= 10 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground";
              const isYou = u.id === 42;
              return (
                <li
                  key={u.id}
                  onClick={() => setOpenUser(u)}
                  className={`flex items-center gap-3 p-3 md:p-4 cursor-pointer hover:bg-accent transition-colors ${isYou ? "bg-primary/5" : ""}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-extrabold tabular-nums ${rankColor}`}>
                    {rank}
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-[#00D2D3] text-white flex items-center justify-center font-extrabold">
                    {u.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{u.name}</div>
                    <div className="text-[11px] text-muted-foreground">{u.lessons} درس مكتمل</div>
                    <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-l from-primary to-[#00D2D3]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-sm font-extrabold text-primary tabular-nums shrink-0">{u.xp.toLocaleString("en-US")}</div>
                </li>
              );
            })}
            {rest.length === 0 && (
              <li className="p-8 text-center text-sm text-muted-foreground">لا توجد نتائج</li>
            )}
          </ul>
        </section>
      </main>

      {/* Sticky "you" row */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur-md border-t-2 border-dashed border-primary">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-3 bg-primary/10">
          <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
            #{youIndex + 1}
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-[#00D2D3] text-white flex items-center justify-center font-extrabold">
            {you.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-foreground">أنت</div>
            <div className="text-[11px] text-muted-foreground truncate">
              {above ? `+${gap.toLocaleString("en-US")} XP للمركز #${youIndex}` : "أنت في المقدمة! 🎉"}
            </div>
          </div>
          <div className="text-sm font-extrabold text-primary tabular-nums">{you.xp.toLocaleString("en-US")} XP</div>
        </div>
      </div>

      {/* User Modal */}
      {openUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in" onClick={() => setOpenUser(null)}>
          <div
            className="relative w-full max-w-sm rounded-2xl bg-card border border-border p-6 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setOpenUser(null)} className="absolute top-3 left-3 h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-[#00D2D3] text-white flex items-center justify-center text-4xl font-extrabold mb-3">
                {openUser.avatar}
              </div>
              <div className="text-lg font-extrabold text-foreground">{openUser.name}</div>
              <div className="text-xs text-muted-foreground">المركز #{ranked.indexOf(openUser) + 1}</div>
              <div className="grid grid-cols-3 gap-3 w-full mt-5">
                <div className="rounded-xl bg-muted p-3">
                  <div className="text-base font-extrabold text-primary tabular-nums">{openUser.xp.toLocaleString("en-US")}</div>
                  <div className="text-[10px] text-muted-foreground">XP</div>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <div className="flex items-center justify-center gap-1 text-base font-extrabold text-orange-500"><Flame className="w-4 h-4" />{openUser.streak}</div>
                  <div className="text-[10px] text-muted-foreground">يوم متتالي</div>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <div className="flex items-center justify-center gap-1 text-base font-extrabold text-foreground"><BookOpen className="w-4 h-4" />{openUser.lessons}</div>
                  <div className="text-[10px] text-muted-foreground">درس</div>
                </div>
              </div>
              <div className="mt-4 w-full rounded-xl border border-border p-3 flex items-center gap-2 justify-center">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  {openUser.id === 42
                    ? `${earnedBadges} / ${ACHIEVEMENTS.length} شارة`
                    : `${Math.min(ACHIEVEMENTS.length, Math.floor(openUser.xp / 300))} شارة مكتسبة`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}