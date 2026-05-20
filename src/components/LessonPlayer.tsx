import { useEffect, useState } from "react";
import { Play, X, CheckCircle2, Clock } from "lucide-react";
import { RippleButton } from "./RippleButton";

export type Lesson = {
  title: string;
  section: string;
  description: string;
};

const SUB_LESSONS = [
  { title: "مقدمة وأهداف الدرس", done: true },
  { title: "الشرح النظري", done: true },
  { title: "تطبيق عملي", done: false },
  { title: "اختبار قصير", done: false },
];

export function LessonPlayer({
  lesson,
  onClose,
  onComplete,
}: {
  lesson: Lesson | null;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setProgress(0);
    setPlaying(false);
    setCompleted(false);
  }, [lesson]);

  useEffect(() => {
    if (!playing || completed) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const n = Math.min(100, p + 2);
        return n;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, completed]);

  if (!lesson) return null;

  const canComplete = progress >= 10 && !completed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-ilearn-slide-up">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-border">
        <button onClick={onClose} className="absolute top-3 end-3 z-10 h-9 w-9 rounded-lg bg-card/80 backdrop-blur border border-border flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>

        {/* Video placeholder */}
        <div
          className="relative aspect-video w-full flex items-center justify-center cursor-pointer"
          style={{ background: "linear-gradient(135deg,#4A3F9F,#6C5CE7,#00D2D3)" }}
          onClick={() => setPlaying((p) => !p)}
        >
          <button className="h-20 w-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-primary fill-current ms-1" />
          </button>
          <div className="absolute bottom-0 inset-x-0 p-4">
            <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-white text-xs mt-1.5 flex justify-between">
              <span>{playing ? "يعمل الآن" : "اضغط للتشغيل"}</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <div className="text-xs text-primary font-bold mb-1">{lesson.section}</div>
            <h2 className="text-2xl font-extrabold text-foreground">{lesson.title}</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{lesson.description}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 25 دقيقة</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> 2 من 4 مكتمل</span>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-bold text-foreground">الدروس الفرعية</div>
            <ul className="space-y-2">
              {SUB_LESSONS.map((s, i) => (
                <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-accent">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${s.done ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                    {s.done ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <span className={`flex-1 text-sm ${s.done ? "text-muted-foreground line-through" : "text-foreground font-medium"}`}>{s.title}</span>
                </li>
              ))}
            </ul>
          </div>

          <RippleButton
            disabled={!canComplete}
            onClick={() => {
              setCompleted(true);
              setProgress(100);
              onComplete();
              setTimeout(onClose, 1200);
            }}
            className="w-full h-12 rounded-xl text-white font-bold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--gradient-primary)" }}
          >
            {completed ? "🎉 تم الإكمال!" : canComplete ? "إكمال الدرس" : `شاهد لـ ${Math.max(0, 10 - progress)}% أكثر`}
          </RippleButton>
        </div>
      </div>
    </div>
  );
}