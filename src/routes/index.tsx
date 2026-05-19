import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { GraduationCap, ArrowLeft, Sparkles, BookOpen, Trophy } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AnimatedBackground />
      <ThemeToggle />

      <div className="max-w-2xl text-center space-y-8 animate-ilearn-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          منصة تعلّم تفاعلية
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-6xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
            iLearn
          </h1>
        </div>

        <p className="text-lg text-muted-foreground leading-relaxed">
          تعلّم بأسلوب ممتع وتفاعلي، اربح النقاط، واصعد المراتب مع آلاف الطلاب حول العالم.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl text-white font-bold hover:-translate-y-0.5 hover:shadow-lg transition-all"
            style={{ background: "var(--gradient-primary)" }}
          >
            ابدأ الآن
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-card border border-border text-foreground font-bold hover:border-primary transition-all"
          >
            معاينة لوحة التحكم
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8">
          {[
            { icon: BookOpen, label: "+200 درس تفاعلي" },
            { icon: Trophy, label: "نظام إنجازات" },
            { icon: Sparkles, label: "شهادات معتمدة" },
          ].map((f) => (
            <div key={f.label} className="p-4 rounded-xl bg-card border border-border flex flex-col items-center gap-2">
              <f.icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
