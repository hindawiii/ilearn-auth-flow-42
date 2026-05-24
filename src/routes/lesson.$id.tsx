import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ChevronRight, ChevronLeft, Play, CheckCircle2, Clock, Menu,
  FileText, ExternalLink, Moon, Sun, X,
} from "lucide-react";
import { findLesson, getCompleted, markCompleted, LEVEL_LABEL, LEVEL_COLOR, type SectionData } from "@/lib/sections-data";
import { useTheme } from "@/hooks/use-theme";
import { useSound } from "@/hooks/use-sound";
import { Confetti } from "@/components/Confetti";
import { RippleButton } from "@/components/RippleButton";
import { toast } from "sonner";
import { checkAchievements, recordLessonToday } from "@/lib/achievements";
import { addNotification } from "@/lib/notifications";

export const Route = createFileRoute("/lesson/$id")({
  head: () => ({ meta: [{ title: "iLearn — درس" }] }),
  component: LessonPage,
});

const NOTES_PREFIX = "ilearn-notes-";
const XP_KEY = "ilearn-xp";

function LessonPage() {
  const { id } = useParams({ from: "/lesson/$id" });
  const navigate = useNavigate();
  const found = findLesson(id);
  const { isDark, toggle } = useTheme();
  const { play } = useSound();

  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [playing, setPlaying] = useState(false);
  const [notes, setNotes] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [confettiTick, setConfettiTick] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setCompleted(getCompleted()); }, []);
  useEffect(() => {
    try {
      const n = localStorage.getItem(NOTES_PREFIX + id);
      setNotes(n ?? "");
    } catch { /* ignore */ }
    setAnswers({}); setSubmitted(false); setPlaying(false);
  }, [id]);

  useEffect(() => {
    try { localStorage.setItem(NOTES_PREFIX + id, notes); } catch { /* ignore */ }
  }, [notes, id]);

  if (!found) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-foreground">الدرس غير موجود</h1>
          <Link to="/dashboard" className="inline-block mt-4 px-5 h-11 leading-[2.75rem] rounded-xl text-white font-bold" style={{ background: "var(--gradient-primary)" }}>
            رجوع للوحة التحكم
          </Link>
        </div>
      </div>
    );
  }

  const { section, lesson, index } = found;
  const prev = index > 0 ? section.lessons[index - 1] : null;
  const next = index < section.lessons.length - 1 ? section.lessons[index + 1] : null;
  const isDone = completed.has(lesson.id);

  const correctCount = useMemo(
    () => lesson.quiz.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0),
    [answers, lesson]
  );
  const allAnswered = Object.keys(answers).length === lesson.quiz.length;
  const quizPassed = submitted && correctCount === lesson.quiz.length;
  const canComplete = quizPassed || isDone;

  const handleComplete = () => {
    markCompleted(lesson.id);
    setCompleted((s) => new Set([...s, lesson.id]));
    try {
      const cur = parseInt(localStorage.getItem(XP_KEY) ?? "2450", 10);
      localStorage.setItem(XP_KEY, String(cur + 50));
    } catch { /* ignore */ }
    recordLessonToday();
    setConfettiTick((t) => t + 1);
    play("success");
    toast.success("🎉 أحسنت! +50 XP", { description: "تم إكمال الدرس بنجاح" });
    addNotification({
      type: "lesson",
      title: "أكملت درساً بنجاح",
      description: `درس: ${lesson.title} — +50 XP`,
      link: `/lesson/${lesson.id}`,
    });
    // Check for newly unlocked achievements
    setTimeout(() => {
      const newly = checkAchievements();
      newly.forEach((a) =>
        toast.success(`🏆 إنجاز جديد! ${a.name}`, { description: a.desc, duration: 5000 })
      );
      newly.forEach((a) =>
        addNotification({
          type: "achievement",
          title: "تهانينا! حصلت على شارة جديدة",
          description: `شارة: ${a.name} — ${a.desc}`,
          link: "/achievements",
        })
      );
      if (newly.length) setConfettiTick((t) => t + 1);
    }, 300);
    if (next) setTimeout(() => navigate({ to: "/lesson/$id", params: { id: next.id } }), 1500);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Confetti trigger={confettiTick} />

      {/* Sidebar — desktop */}
      <LessonSidebar
        section={section}
        currentId={lesson.id}
        completed={completed}
        className="hidden lg:flex w-72 sticky top-0 h-screen"
      />

      {/* Sidebar — mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute end-0 top-0 h-full w-72 bg-card border-s border-border flex flex-col animate-ilearn-slide-up">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="font-extrabold text-foreground">دروس {section.name}</span>
              <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <LessonSidebar section={section} currentId={lesson.id} completed={completed} embed />
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-md border-b border-border">
          <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 md:px-8 h-16">
            <Link to="/section/$id" params={{ id: section.id }} className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent">
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="text-[11px] text-primary font-bold">{section.name}</div>
              <h1 className="text-sm md:text-base font-extrabold text-foreground truncate">{lesson.title}</h1>
            </div>
            <div className="ms-auto flex items-center gap-2">
              <button onClick={toggle} className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center">
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
          {/* Player */}
          <section
            className="relative aspect-video w-full rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer shadow-lg animate-ilearn-slide-up"
            style={{ background: lesson.thumb }}
            onClick={() => setPlaying((p) => !p)}
          >
            <button className="h-20 w-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-primary fill-current ms-1" />
            </button>
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
              <div className="text-xs">{playing ? "يعمل الآن…" : "اضغط للتشغيل"}</div>
            </div>
          </section>

          {/* Nav buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {prev ? (
              <Link to="/lesson/$id" params={{ id: prev.id }} className="px-4 h-10 rounded-xl bg-card border border-border text-sm font-bold inline-flex items-center gap-1 hover:bg-accent">
                <ChevronRight className="w-4 h-4" /> الدرس السابق
              </Link>
            ) : <div />}
            <Link to="/section/$id" params={{ id: section.id }} className="px-4 h-10 rounded-xl bg-card border border-border text-sm font-bold inline-flex items-center gap-1 hover:bg-accent">
              قائمة الدروس
            </Link>
            {next && (
              <Link to="/lesson/$id" params={{ id: next.id }} className="ms-auto px-4 h-10 rounded-xl bg-card border border-border text-sm font-bold inline-flex items-center gap-1 hover:bg-accent">
                الدرس التالي <ChevronLeft className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Meta */}
          <section className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${LEVEL_COLOR[lesson.level]}`}>{LEVEL_LABEL[lesson.level]}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.duration} دقيقة</span>
            {isDone && <span className="text-xs font-bold text-success flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> مكتمل</span>}
          </section>

          {/* Description */}
          <section className="p-5 rounded-2xl bg-card border border-border">
            <h2 className="font-extrabold text-foreground mb-2">وصف الدرس</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{lesson.description}</p>
          </section>

          {/* Notes */}
          <section className="p-5 rounded-2xl bg-card border border-border">
            <h2 className="font-extrabold text-foreground mb-3">ملاحظاتي</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب ملاحظاتك هنا (تُحفظ تلقائياً)..."
              className="w-full min-h-[120px] p-3 rounded-xl bg-background border border-border text-sm outline-none focus:border-primary resize-y"
            />
            <div className="text-[11px] text-muted-foreground mt-2">يتم الحفظ تلقائياً في متصفحك</div>
          </section>

          {/* Resources */}
          {lesson.resources && lesson.resources.length > 0 && (
            <section className="p-5 rounded-2xl bg-card border border-border">
              <h2 className="font-extrabold text-foreground mb-3">موارد إضافية</h2>
              <ul className="space-y-2">
                {lesson.resources.map((r, i) => (
                  <li key={i}>
                    <a href={r.url} className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="flex-1 text-sm font-medium text-foreground">{r.label}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Quiz */}
          <section className="p-5 rounded-2xl bg-card border border-border">
            <h2 className="font-extrabold text-foreground mb-4">اختبار قصير</h2>
            <div className="space-y-5">
              {lesson.quiz.map((q, qi) => (
                <div key={qi}>
                  <div className="text-sm font-bold text-foreground mb-2">{qi + 1}. {q.q}</div>
                  <div className="grid gap-2">
                    {q.options.map((opt, oi) => {
                      const picked = answers[qi] === oi;
                      const isCorrect = submitted && oi === q.answer;
                      const isWrong = submitted && picked && oi !== q.answer;
                      return (
                        <button
                          key={oi}
                          disabled={submitted}
                          onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                          className={`text-start text-sm p-3 rounded-xl border transition-all ${
                            isCorrect ? "border-success bg-success/10 text-success" :
                            isWrong ? "border-destructive bg-destructive/10 text-destructive" :
                            picked ? "border-primary bg-primary/10 text-foreground" :
                            "border-border bg-background text-foreground hover:border-primary"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3 flex-wrap">
              {!submitted ? (
                <RippleButton
                  disabled={!allAnswered}
                  onClick={() => { setSubmitted(true); play(correctCount === lesson.quiz.length ? "success" : "click"); }}
                  className="h-11 px-6 rounded-xl text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  تصحيح الإجابات
                </RippleButton>
              ) : (
                <>
                  <div className={`text-sm font-bold ${quizPassed ? "text-success" : "text-warning"}`}>
                    {correctCount} / {lesson.quiz.length} إجابة صحيحة
                  </div>
                  {!quizPassed && (
                    <button
                      onClick={() => { setSubmitted(false); setAnswers({}); }}
                      className="h-10 px-4 rounded-xl bg-card border border-border text-sm font-bold hover:bg-accent"
                    >
                      إعادة المحاولة
                    </button>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Complete */}
          <RippleButton
            disabled={!canComplete}
            onClick={handleComplete}
            className="w-full h-14 rounded-2xl text-white font-extrabold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isDone ? "✓ تم إكمال هذا الدرس" : canComplete ? "🎉 إكمال الدرس" : "أكمل الاختبار لتفعيل الإكمال"}
          </RippleButton>

          <div className="h-10" />
        </div>
      </main>
    </div>
  );
}

function LessonSidebar({
  section: sec, currentId, completed, className, embed,
}: {
  section: SectionData;
  currentId: string;
  completed: Set<string>;
  className?: string;
  embed?: boolean;
}) {
  return (
    <aside className={`flex-col bg-card border-l border-border ${className ?? ""} ${embed ? "flex flex-1 overflow-hidden" : ""}`}>
      {!embed && (
        <div className="p-4 border-b border-border">
          <Link to="/section/$id" params={{ id: sec.id }} className="text-xs text-primary font-bold">رجوع للقسم</Link>
          <div className="mt-1 font-extrabold text-foreground">{sec.name}</div>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {sec.lessons.map((l, i) => {
          const isCurrent = l.id === currentId;
          const done = completed.has(l.id);
          return (
            <Link
              key={l.id}
              to="/lesson/$id"
              params={{ id: l.id }}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all ${
                isCurrent ? "text-white shadow-md" : "text-foreground hover:bg-accent"
              }`}
              style={isCurrent ? { background: "var(--gradient-primary)" } : undefined}
            >
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                done ? "bg-success/20 text-success" : isCurrent ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold truncate ${isCurrent ? "text-white" : ""}`}>{l.title}</div>
                <div className={`text-[11px] ${isCurrent ? "text-white/80" : "text-muted-foreground"}`}>{l.duration} دقيقة</div>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}