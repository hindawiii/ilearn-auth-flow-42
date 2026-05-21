import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Lock, Play, Search } from "lucide-react";
import { getSection, getCompleted, LEVEL_LABEL, LEVEL_COLOR, type Level } from "@/lib/sections-data";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/section/$id")({
  head: () => ({ meta: [{ title: "iLearn — قسم" }] }),
  component: SectionPage,
});

function SectionPage() {
  const { id } = useParams({ from: "/section/$id" });
  const section = getSection(id);
  const { isDark, toggle } = useTheme();
  const [level, setLevel] = useState<Level | "all">("all");
  const [q, setQ] = useState("");
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => { setCompleted(getCompleted()); }, []);

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-foreground">القسم غير موجود</h1>
          <Link to="/dashboard" className="inline-block mt-4 px-5 h-11 leading-[2.75rem] rounded-xl text-white font-bold" style={{ background: "var(--gradient-primary)" }}>
            رجوع للوحة التحكم
          </Link>
        </div>
      </div>
    );
  }

  const Icon = section.icon;
  const totalLessons = section.lessons.length;
  const doneCount = section.lessons.filter((l) => completed.has(l.id)).length;
  const progress = totalLessons ? Math.round((doneCount / totalLessons) * 100) : 0;
  const remainingMin = section.lessons.filter((l) => !completed.has(l.id)).reduce((s, l) => s + l.duration, 0);

  const filtered = useMemo(() => {
    return section.lessons.filter((l) => {
      if (level !== "all" && l.level !== level) return false;
      if (q && !l.title.includes(q) && !l.description.includes(q)) return false;
      return true;
    });
  }, [section, level, q]);

  const nextLesson = section.lessons.find((l) => !completed.has(l.id)) ?? section.lessons[0];

  const isLocked = (idx: number) => {
    // advanced lessons locked until at least one earlier lesson completed
    const l = section.lessons[idx];
    if (l.level !== "advanced") return false;
    const prior = section.lessons.slice(0, idx);
    return !prior.some((p) => completed.has(p.id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 md:px-8 h-16">
          <Link to="/dashboard" className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent">
            <ArrowRight className="w-4 h-4" />
          </Link>
          <h1 className="text-base md:text-lg font-extrabold text-foreground truncate">{section.name}</h1>
          <button onClick={toggle} className="ms-auto h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Hero */}
        <section
          className={`rounded-3xl p-6 md:p-10 text-white shadow-xl bg-gradient-to-br ${section.bgClass} animate-ilearn-slide-up`}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
              <Icon className="w-12 h-12" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-3xl font-extrabold">{section.name}</h2>
              <p className="text-sm md:text-base text-white/85 mt-2 leading-relaxed">{section.desc}</p>
              <div className="mt-4 space-y-2 max-w-md">
                <div className="flex justify-between text-xs font-bold">
                  <span>التقدم في القسم</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
            {nextLesson && (
              <Link
                to="/lesson/$id"
                params={{ id: nextLesson.id }}
                className="self-start md:self-center px-6 h-12 leading-[3rem] rounded-xl bg-white text-foreground font-bold text-sm shadow-lg hover:scale-105 transition-transform inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> استمر في التعلم
              </Link>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard label="إجمالي الدروس" value={`${totalLessons}`} icon={BookOpen} />
          <StatCard label="المكتملة" value={`${doneCount}`} icon={CheckCircle2} />
          <StatCard label="المتبقية" value={`${totalLessons - doneCount}`} icon={Lock} />
          <StatCard label="وقت متبقّ" value={`${remainingMin} د`} icon={Clock} />
        </section>

        {/* Filters */}
        <section className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex flex-wrap gap-2 bg-card p-1.5 rounded-xl border border-border">
            {([
              { id: "all", label: "الكل" },
              { id: "beginner", label: "مبتدئ" },
              { id: "intermediate", label: "متوسط" },
              { id: "advanced", label: "متقدم" },
            ] as const).map((f) => (
              <button
                key={f.id}
                onClick={() => setLevel(f.id as Level | "all")}
                className={`px-4 h-9 rounded-lg text-xs font-bold transition-all ${
                  level === f.id ? "text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                style={level === f.id ? { background: "var(--gradient-primary)" } : undefined}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Search className="absolute inset-y-0 start-3 my-auto w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث في دروس القسم..."
              className="w-full h-11 rounded-xl bg-card border border-border ps-10 pe-4 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
        </section>

        {/* Lessons grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.length === 0 && (
            <div className="col-span-full p-10 text-center text-muted-foreground bg-card rounded-2xl border border-border">
              لا توجد دروس مطابقة
            </div>
          )}
          {filtered.map((l) => {
            const idx = section.lessons.findIndex((x) => x.id === l.id);
            const locked = isLocked(idx);
            const done = completed.has(l.id);
            const card = (
              <div
                className={`rounded-2xl bg-card border border-border overflow-hidden ilearn-lift animate-ilearn-slide-up ${
                  locked ? "opacity-60" : "hover:border-primary"
                }`}
                style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "backwards" }}
              >
                <div className="h-28 relative flex items-center justify-center text-white" style={{ background: l.thumb }}>
                  <Play className="w-10 h-10 fill-current opacity-90" />
                  {done && (
                    <span className="absolute top-3 end-3 bg-success text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> مكتمل
                    </span>
                  )}
                  {locked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Lock className="w-7 h-7" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${LEVEL_COLOR[l.level]}`}>{LEVEL_LABEL[l.level]}</span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {l.duration} د</span>
                  </div>
                  <h3 className="font-extrabold text-foreground text-sm leading-snug">{l.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{l.description}</p>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full transition-all duration-700" style={{ width: done ? "100%" : "0%", background: "var(--gradient-primary)" }} />
                  </div>
                </div>
              </div>
            );
            return locked ? (
              <div key={l.id} aria-disabled>{card}</div>
            ) : (
              <Link key={l.id} to="/lesson/$id" params={{ id: l.id }}>{card}</Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-extrabold text-foreground">{value}</div>
        </div>
      </div>
    </div>
  );
}