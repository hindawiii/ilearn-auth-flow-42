import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Lock, CheckCircle2, Moon, Sun, X, Share2 } from "lucide-react";
import { ACHIEVEMENTS, getEarned, type Achievement, checkAchievements, markShared } from "@/lib/achievements";
import { useTheme } from "@/hooks/use-theme";
import { useSound } from "@/hooks/use-sound";
import { Confetti } from "@/components/Confetti";
import { toast } from "sonner";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "iLearn — الإنجازات" },
      { name: "description", content: "تصفّح شارات إنجازاتك في iLearn" },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { isDark, toggle } = useTheme();
  const { play } = useSound();
  const [earned, setEarned] = useState<Record<string, number>>({});
  const [open, setOpen] = useState<Achievement | null>(null);
  const [confetti, setConfetti] = useState(0);

  useEffect(() => {
    const newly = checkAchievements();
    setEarned(getEarned());
    if (newly.length) {
      setConfetti((t) => t + 1);
      play("success");
      newly.forEach((a) => toast.success(`🎉 إنجاز جديد! ${a.name}`, { description: a.desc }));
    }
  }, [play]);

  const earnedCount = useMemo(() => Object.keys(earned).length, [earned]);
  const total = ACHIEVEMENTS.length;
  const percent = Math.round((earnedCount / total) * 100);

  const handleShare = () => {
    markShared();
    const newly = checkAchievements();
    setEarned(getEarned());
    if (newly.length) {
      setConfetti((t) => t + 1);
      play("success");
      newly.forEach((a) => toast.success(`🎉 إنجاز جديد! ${a.name}`));
    } else {
      toast("تمت المشاركة!", { description: "شكراً لدعمك iLearn" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Confetti trigger={confetti} />
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 md:px-8 h-16">
          <Link to="/dashboard" className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent">
            <ArrowRight className="w-4 h-4" />
          </Link>
          <h1 className="text-base md:text-lg font-extrabold text-foreground">الإنجازات</h1>
          <div className="ms-auto flex items-center gap-2">
            <button onClick={handleShare} className="h-10 px-3 rounded-xl bg-card border border-border text-xs font-bold flex items-center gap-1.5 hover:bg-accent">
              <Share2 className="w-4 h-4" /> مشاركة
            </button>
            <button onClick={toggle} className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-8">
        {/* Hero */}
        <section className="p-6 md:p-8 rounded-2xl border border-border relative overflow-hidden" style={{ background: "var(--gradient-primary)" }}>
          <div className="relative z-10 text-white">
            <div className="text-xs font-bold opacity-80">رحلتك في iLearn</div>
            <h2 className="text-2xl md:text-3xl font-extrabold mt-1">إنجازاتك</h2>
            <p className="text-sm opacity-90 mt-2">حصلت على {earnedCount} من أصل {total} شارة</p>
            <div className="mt-5 max-w-md">
              <div className="flex justify-between text-xs font-bold mb-1.5"><span>التقدم</span><span>{percent}%</span></div>
              <div className="h-2 rounded-full bg-white/25 overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {ACHIEVEMENTS.map((a, i) => {
            const got = !!earned[a.id];
            return (
              <button
                key={a.id}
                onClick={() => { play("click"); setOpen(a); }}
                className={`relative p-4 rounded-2xl border text-center transition-all ilearn-lift animate-ilearn-slide-up ${
                  got ? "bg-card border-primary/40" : "bg-card border-border opacity-60 hover:opacity-90"
                }`}
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "backwards" }}
              >
                <div
                  className={`relative h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-3xl shadow-lg transition-all ${
                    got ? "ilearn-badge-pop" : "grayscale"
                  }`}
                  style={got ? { boxShadow: "0 0 30px -5px currentColor" } : undefined}
                >
                  <span>{a.emoji}</span>
                  {!got && (
                    <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {got && (
                    <span className="absolute -top-1 -end-1 h-6 w-6 rounded-full bg-success text-white flex items-center justify-center shadow">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div className="mt-3 text-sm font-extrabold text-foreground line-clamp-1">{a.name}</div>
                <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-tight">{a.desc}</div>
              </button>
            );
          })}
        </section>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-ilearn-slide-up">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(null)} />
          <div className="relative bg-card rounded-2xl p-7 max-w-sm w-full text-center border border-border shadow-2xl">
            <button onClick={() => setOpen(null)} className="absolute top-3 end-3 h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
            <div className={`h-24 w-24 mx-auto rounded-2xl bg-gradient-to-br ${open.gradient} flex items-center justify-center text-5xl shadow-2xl ${earned[open.id] ? "ilearn-badge-pop" : "grayscale opacity-70"}`}>
              {open.emoji}
            </div>
            <h3 className="text-xl font-extrabold text-foreground mt-4">{open.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{open.desc}</p>
            <div className="mt-4 p-3 rounded-xl bg-accent text-xs">
              <div className="font-bold text-foreground mb-1">شرط الحصول</div>
              <div className="text-muted-foreground">{open.condition}</div>
            </div>
            {earned[open.id] ? (
              <div className="mt-3 text-xs text-success font-bold">
                ✓ حصلت عليها في {new Date(earned[open.id]).toLocaleDateString("ar")}
              </div>
            ) : (
              <div className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> مقفلة — أكمل الشرط لفتحها
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}