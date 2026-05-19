import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  GraduationCap, Mail, Lock, User, Eye, EyeOff, Loader2,
} from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "iLearn — تسجيل الدخول" },
      { name: "description", content: "سجّل دخولك إلى منصة iLearn التعليمية" },
    ],
  }),
  component: AuthPage,
});

function passwordStrength(pw: string) {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z\d]/.test(pw)) s++;
  if (s <= 1) return { label: "ضعيفة", width: "33%", color: "var(--destructive)" };
  if (s <= 3) return { label: "متوسطة", width: "66%", color: "var(--warning)" };
  return { label: "قوية", width: "100%", color: "var(--secondary)" };
}

function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState<"in" | "up" | null>(null);

  // Sign in
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [showSi, setShowSi] = useState(false);

  // Sign up
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [showSu, setShowSu] = useState(false);

  const [shake, setShake] = useState<string | null>(null);
  const triggerShake = (id: string) => {
    setShake(id);
    setTimeout(() => setShake(null), 400);
  };

  const strength = passwordStrength(suPassword);

  const handleSignIn = (e: FormEvent) => {
    e.preventDefault();
    if (!siEmail || !siPassword) return toast.error("يرجى ملء جميع الحقول");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(siEmail)) {
      triggerShake("siEmail");
      return toast.error("يرجى إدخال بريد إلكتروني صحيح");
    }
    setLoading("in");
    setTimeout(() => {
      setLoading(null);
      toast.success("تم تسجيل الدخول بنجاح! مرحباً بك في iLearn 🎓");
      setTimeout(() => navigate({ to: "/dashboard" }), 700);
    }, 1200);
  };

  const handleSignUp = (e: FormEvent) => {
    e.preventDefault();
    if (!suName || !suEmail || !suPassword) return toast.error("يرجى ملء جميع الحقول");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suEmail)) {
      triggerShake("suEmail");
      return toast.error("يرجى إدخال بريد إلكتروني صحيح");
    }
    if (suPassword.length < 8) {
      triggerShake("suPassword");
      return toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    }
    setLoading("up");
    setTimeout(() => {
      setLoading(null);
      toast.success("تم إنشاء الحساب بنجاح! 🎉");
      setTimeout(() => setIsSignUp(false), 1200);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <ThemeToggle />
      <Toaster position="top-center" richColors />

      <div className="relative z-10 w-full max-w-[900px] min-h-[560px] bg-card rounded-3xl overflow-hidden shadow-[var(--shadow-elegant)] border border-border" style={{ opacity: 1 }}>
        {/* Mobile tabs (visible < md) */}
        <div className="md:hidden flex border-b border-border">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-4 font-bold transition-colors ${!isSignUp ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-4 font-bold transition-colors ${isSignUp ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
          >
            إنشاء حساب
          </button>
        </div>

        {/* Desktop grid layout */}
        <div className="relative md:grid md:grid-cols-2 md:min-h-[560px]">
          {/* Sign in form */}
          <FormPanel
            visible={!isSignUp}
            side="right"
            isSignUp={isSignUp}
          >
            <Brand />
            <h1 className="text-2xl font-extrabold text-foreground">تسجيل الدخول</h1>

            <SocialIcons />

            <Divider text="أو استخدم بريدك الإلكتروني" />

            <form onSubmit={handleSignIn} className="space-y-3">
              <InputField
                shake={shake === "siEmail"}
                icon={<Mail className="w-4 h-4" />}
                type="email"
                placeholder="البريد الإلكتروني"
                value={siEmail}
                onChange={setSiEmail}
              />
              <InputField
                shake={shake === "siPassword"}
                icon={<Lock className="w-4 h-4" />}
                type={showSi ? "text" : "password"}
                placeholder="كلمة المرور"
                value={siPassword}
                onChange={setSiPassword}
                trailing={
                  <button type="button" onClick={() => setShowSi((s) => !s)} className="text-muted-foreground hover:text-primary transition-colors">
                    {showSi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <div className="text-end">
                <button
                  type="button"
                  onClick={() => toast.info("سيتم تفعيل إعادة التعيين قريباً")}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <SubmitButton loading={loading === "in"}>تسجيل الدخول</SubmitButton>
            </form>

            <div className="md:hidden text-center text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <button onClick={() => setIsSignUp(true)} className="text-primary font-bold">سجل الآن</button>
            </div>
          </FormPanel>

          {/* Sign up form */}
          <FormPanel
            visible={isSignUp}
            side="left"
            isSignUp={isSignUp}
          >
            <Brand />
            <h1 className="text-2xl font-extrabold text-foreground">إنشاء حساب</h1>

            <SocialIcons />

            <Divider text="أو استخدم بريدك للتسجيل" />

            <form onSubmit={handleSignUp} className="space-y-3">
              <InputField
                shake={shake === "suName"}
                icon={<User className="w-4 h-4" />}
                type="text"
                placeholder="الاسم الكامل"
                value={suName}
                onChange={setSuName}
              />
              <InputField
                shake={shake === "suEmail"}
                icon={<Mail className="w-4 h-4" />}
                type="email"
                placeholder="البريد الإلكتروني"
                value={suEmail}
                onChange={setSuEmail}
              />
              <InputField
                shake={shake === "suPassword"}
                icon={<Lock className="w-4 h-4" />}
                type={showSu ? "text" : "password"}
                placeholder="كلمة المرور"
                value={suPassword}
                onChange={setSuPassword}
                trailing={
                  <button type="button" onClick={() => setShowSu((s) => !s)} className="text-muted-foreground hover:text-primary transition-colors">
                    {showSu ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              {strength && (
                <div className="space-y-1">
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{ width: strength.width, background: strength.color }}
                    />
                  </div>
                  <div className="text-xs text-end" style={{ color: strength.color }}>
                    {strength.label}
                  </div>
                </div>
              )}
              <SubmitButton loading={loading === "up"}>إنشاء حساب</SubmitButton>
            </form>

            <div className="md:hidden text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <button onClick={() => setIsSignUp(false)} className="text-primary font-bold">سجل دخول</button>
            </div>
          </FormPanel>

          {/* Sliding overlay panel (desktop only) */}
          <div
            className="hidden md:flex absolute top-0 h-full w-1/2 items-center justify-center p-10 text-center text-white transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] z-20"
            style={{
              background: "var(--gradient-primary)",
              right: isSignUp ? "50%" : "0%",
              borderRadius: isSignUp ? "0 150px 100px 0" : "150px 0 0 100px",
            }}
          >
            <div className="space-y-4 max-w-xs">
              <h2 className="text-3xl font-extrabold">
                {isSignUp ? "مرحباً بك!" : "أهلاً بك مجدداً!"}
              </h2>
              <p className="text-white/90 text-sm leading-relaxed">
                {isSignUp
                  ? "سجل معنا ببياناتك الشخصية لاستخدام جميع ميزات الموقع"
                  : "أدخل بياناتك الشخصية لاستخدام جميع ميزات الموقع"}
              </p>
              <button
                onClick={() => setIsSignUp((s) => !s)}
                className="mt-4 px-8 py-2.5 rounded-full border-2 border-white text-white font-bold hover:bg-white hover:text-primary transition-all duration-300"
              >
                {isSignUp ? "تسجيل الدخول" : "إنشاء حساب"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Sub-components ============

function Brand() {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
        <GraduationCap className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
        iLearn
      </span>
    </div>
  );
}

function FormPanel({
  children, visible, side, isSignUp,
}: { children: React.ReactNode; visible: boolean; side: "right" | "left"; isSignUp: boolean }) {
  const desktopOrder = side === "right" ? "md:order-1" : "md:order-2";
  return (
    <div
      className={`p-8 md:p-10 flex-col gap-4 ${desktopOrder} ${visible ? "flex" : "hidden md:flex"}`}
      style={{
        // Desktop: fade form on the side covered by the slider
        opacity: (side === "right" && isSignUp) || (side === "left" && !isSignUp) ? 0 : 1,
        transition: "opacity 0.4s ease",
        pointerEvents: (side === "right" && isSignUp) || (side === "left" && !isSignUp) ? "none" : "auto",
      }}
    >
      {children}
    </div>
  );
}

function SocialIcons() {
  // Google active; FB / GitHub / LinkedIn = placeholders (hidden, kept for later)
  return (
    <div className="flex gap-3 justify-center">
      <button
        type="button"
        onClick={() => toast.info("سيتم تفعيل تسجيل Google لاحقاً")}
        className="h-11 w-11 rounded-full border border-border flex items-center justify-center hover:border-primary hover:bg-accent hover:-translate-y-0.5 transition-all"
        aria-label="Google"
      >
        <GoogleIcon />
      </button>
      {/* Placeholders for Facebook / GitHub / LinkedIn — مخفية حالياً */}
      {/* <button aria-label="Facebook" /> */}
      {/* <button aria-label="GitHub" /> */}
      {/* <button aria-label="LinkedIn" /> */}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <div className="flex-1 h-px bg-border" />
      <span>{text}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function InputField({
  icon, type, placeholder, value, onChange, trailing, shake,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  trailing?: React.ReactNode;
  shake?: boolean;
}) {
  return (
    <div className={`relative ${shake ? "animate-ilearn-shake" : ""}`}>
      <span className="absolute inset-y-0 start-3 flex items-center text-muted-foreground pointer-events-none">
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 rounded-xl bg-[var(--input-bg)] border border-border ps-10 pe-10 text-sm font-medium text-foreground placeholder:text-[var(--input-placeholder)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />
      {trailing && (
        <span className="absolute inset-y-0 end-3 flex items-center">
          {trailing}
        </span>
      )}
    </div>
  );
}

function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition-all disabled:opacity-80 disabled:cursor-wait"
      style={{ background: "var(--gradient-primary)" }}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-ilearn-spin" /> : children}
    </button>
  );
}