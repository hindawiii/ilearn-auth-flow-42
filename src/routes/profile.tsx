import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Award, BookOpen, Camera, Flame, LogOut, Moon, Pencil, StickyNote, Sun, Trash2, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/use-theme";
import { SECTIONS, getCompleted, findLesson } from "@/lib/sections-data";
import { ACHIEVEMENTS, getEarned } from "@/lib/achievements";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "البروفايل — iLearn" },
      { name: "description", content: "ملفك الشخصي على iLearn: التقدم، الشارات، الملاحظات والإعدادات." },
    ],
  }),
  component: ProfilePage,
});

type Profile = { name: string; email: string; bio: string; avatar: string };
const PROFILE_KEY = "ilearn-profile";
const DEFAULT: Profile = {
  name: "أحمد محمد",
  email: "ahmed@ilearn.app",
  bio: "متعلم شغوف بالتقنية والذكاء الاصطناعي 🚀",
  avatar: "",
};

function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}
function saveProfile(p: Profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

type Note = { lessonId: string; title: string; section: string; text: string; updatedAt: number };
function collectNotes(): Note[] {
  const out: Note[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("ilearn-notes-")) continue;
      const text = localStorage.getItem(k) ?? "";
      if (!text.trim()) continue;
      const lessonId = k.replace("ilearn-notes-", "");
      const found = findLesson(lessonId);
      out.push({
        lessonId,
        title: found?.lesson.title ?? lessonId,
        section: found?.section.name ?? "",
        text,
        updatedAt: Date.now(),
      });
    }
  } catch { /* ignore */ }
  return out;
}

function levelFromXp(xp: number) {
  const per = 500;
  const level = Math.max(1, Math.floor(xp / per) + 1);
  const currentBase = (level - 1) * per;
  const next = level * per;
  const progress = Math.min(100, ((xp - currentBase) / per) * 100);
  return { level, currentBase, next, progress };
}

function ProfilePage() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const [profile, setProfile] = useState<Profile>(DEFAULT);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<Profile>(DEFAULT);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(12);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [earned, setEarned] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Note[]>([]);
  const [tab, setTab] = useState("courses");
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
    try { setXp(parseInt(localStorage.getItem("ilearn-xp") ?? "2450", 10) || 0); } catch { /* ignore */ }
    try {
      const s = JSON.parse(localStorage.getItem("ilearn-streak") ?? "null");
      if (s?.streak) setStreak(s.streak);
    } catch { /* ignore */ }
    setCompleted(getCompleted());
    setEarned(getEarned());
    setNotes(collectNotes());
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    if (["courses", "badges", "notes", "settings"].includes(hash)) setTab(hash);
  }, []);

  const lvl = levelFromXp(xp);
  const totalLessons = useMemo(() => SECTIONS.reduce((n, s) => n + s.lessons.length, 0), []);
  const totalSections = SECTIONS.filter((s) => s.lessons.length > 0).length;
  const completedSections = useMemo(
    () => SECTIONS.filter((s) => s.lessons.length > 0 && s.lessons.every((l) => completed.has(l.id))).length,
    [completed],
  );
  const hours = Math.round((completed.size * 25) / 60);
  const earnedList = useMemo(
    () => ACHIEVEMENTS.filter((a) => earned[a.id]).map((a) => ({ a, at: earned[a.id] })),
    [earned],
  );

  const openEdit = () => { setDraft(profile); setEditOpen(true); };
  const onSave = () => {
    setProfile(draft);
    saveProfile(draft);
    setEditOpen(false);
    toast.success("تم حفظ التغييرات بنجاح ✨");
  };
  const onDeleteNote = (lessonId: string) => {
    try { localStorage.removeItem(`ilearn-notes-${lessonId}`); } catch { /* ignore */ }
    setNotes((n) => n.filter((x) => x.lessonId !== lessonId));
    toast.success("تم حذف الملاحظة");
  };
  const onLogout = () => {
    toast.message("تم تسجيل الخروج");
    setTimeout(() => navigate({ to: "/auth" }), 400);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-tajawal" dir="rtl">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 animate-fade-in">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowRight className="w-4 h-4" /> رجوع إلى لوحة التحكم
          </Link>
        </div>

        {/* Header */}
        <Card className="overflow-hidden border-0 shadow-xl mb-6 animate-fade-in" style={{ background: "linear-gradient(135deg,#4A3F9F 0%,#6C5CE7 50%,#00D2D3 100%)" }}>
          <CardContent className="p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="w-[120px] h-[120px] border-4 border-white/30 shadow-2xl">
                  <AvatarFallback className="text-4xl font-bold bg-white/20 text-white">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={openEdit}
                  aria-label="تعديل الصورة"
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera className="w-7 h-7 text-white" />
                </button>
              </div>
              <div className="flex-1 text-center md:text-right">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{profile.name}</h1>
                <p className="text-white/80 mb-2">{profile.email}</p>
                <p className="text-white/90 max-w-xl">{profile.bio}</p>
              </div>
              <Button onClick={openEdit} className="bg-white text-[#6C5CE7] hover:bg-white/90 font-bold">
                <Pencil className="w-4 h-4 ml-1" /> تعديل البروفايل
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Level & Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="md:col-span-2 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#6C5CE7]" /> المستوى {lvl.level} — متعلم نشط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">XP: {xp.toLocaleString()} / {lvl.next.toLocaleString()}</span>
                <span className="font-bold text-[#6C5CE7]">{Math.round(lvl.progress)}%</span>
              </div>
              <Progress value={lvl.progress} className="h-3" />
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-[#6C5CE7]" /> <strong>{xp.toLocaleString()}</strong> XP الكلي</div>
                <div className="flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> <strong>{streak}</strong> يوم متتالي</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            <StatMini icon={<BookOpen className="w-5 h-5" />} label="الدروس" value={`${completed.size}`} />
            <StatMini icon={<Flame className="w-5 h-5" />} label="الساعات" value={`${hours}`} />
            <StatMini icon={<Trophy className="w-5 h-5" />} label="الأقسام" value={`${completedSections}/${totalSections}`} />
            <StatMini icon={<Award className="w-5 h-5" />} label="الشارات" value={`${earnedList.length}/${ACHIEVEMENTS.length}`} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="animate-fade-in">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto">
            <TabsTrigger value="courses" className="gap-2"><BookOpen className="w-4 h-4" /> الدورات</TabsTrigger>
            <TabsTrigger value="badges" className="gap-2"><Award className="w-4 h-4" /> الشارات</TabsTrigger>
            <TabsTrigger value="notes" className="gap-2"><StickyNote className="w-4 h-4" /> الملاحظات</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Pencil className="w-4 h-4" /> الإعدادات</TabsTrigger>
          </TabsList>

          {/* Courses */}
          <TabsContent value="courses" className="mt-6 space-y-6">
            {SECTIONS.filter((s) => s.lessons.length > 0).map((s) => {
              const done = s.lessons.filter((l) => completed.has(l.id));
              const pct = Math.round((done.length / s.lessons.length) * 100);
              return (
                <Card key={s.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="text-lg flex items-center gap-2" style={{ color: s.color }}>
                        <s.icon className="w-5 h-5" /> <span className="text-foreground">{s.name}</span>
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">{done.length}/{s.lessons.length} · {pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    {done.length === 0 ? (
                      <p className="text-sm text-muted-foreground">لم تكمل أي درس بعد في هذا القسم.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {done.map((l) => (
                          <Link key={l.id} to="/lesson/$id" params={{ id: l.id }} className="group block">
                            <div className="rounded-lg overflow-hidden border bg-card hover:shadow-md transition-all hover:-translate-y-1">
                              <div className="h-20" style={{ background: l.thumb }} />
                              <div className="p-3">
                                <p className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{l.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{s.name} · {l.duration} د</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {completed.size === 0 && (
              <Card><CardContent className="py-10 text-center text-muted-foreground">ابدأ بإكمال درسك الأول لتظهر دوراتك هنا.</CardContent></Card>
            )}
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges" className="mt-6">
            {earnedList.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-muted-foreground">
                لا توجد شارات بعد. <Link to="/achievements" className="text-primary underline">اكتشف الشارات المتاحة</Link>.
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {earnedList.map(({ a, at }) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedBadge(a.id)}
                    className="group p-4 rounded-xl bg-card border hover:shadow-xl transition-all hover:-translate-y-1 text-center"
                  >
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${a.gradient} flex items-center justify-center text-3xl shadow-lg mb-2`}>
                      {a.emoji}
                    </div>
                    <p className="font-bold text-sm">{a.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(at).toLocaleDateString("ar")}</p>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Notes */}
          <TabsContent value="notes" className="mt-6 space-y-3">
            {notes.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-muted-foreground">لا توجد ملاحظات محفوظة بعد.</CardContent></Card>
            ) : notes.map((n) => (
              <Card key={n.lessonId}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <Link to="/lesson/$id" params={{ id: n.lessonId }} className="font-bold hover:text-primary">{n.title}</Link>
                      {n.section && <Badge variant="secondary" className="mr-2">{n.section}</Badge>}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => onDeleteNote(n.lessonId)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{n.text}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardContent className="p-6 space-y-5 max-w-2xl">
                <div className="space-y-2">
                  <Label>الاسم</Label>
                  <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input value={profile.email} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>الصورة الشخصية</Label>
                  <Button variant="outline" type="button" disabled>تغيير الصورة (قريباً)</Button>
                </div>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    <span className="font-medium">الوضع الليلي</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={toggle}>{isDark ? "تشغيل النهاري" : "تشغيل الليلي"}</Button>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => { saveProfile(profile); toast.success("تم حفظ التغييرات"); }} className="bg-[#6C5CE7] hover:bg-[#6C5CE7]/90">
                    حفظ التغييرات
                  </Button>
                  <Button variant="destructive" onClick={onLogout}>
                    <LogOut className="w-4 h-4 ml-1" /> تسجيل الخروج
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl" className="font-tajawal">
          <DialogHeader>
            <DialogTitle>تعديل البروفايل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea rows={3} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>الصورة (placeholder)</Label>
              <Input value={draft.avatar} onChange={(e) => setDraft({ ...draft, avatar: e.target.value })} placeholder="رابط صورة..." />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
            <Button onClick={onSave} className="bg-[#6C5CE7] hover:bg-[#6C5CE7]/90">حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badge detail */}
      <Dialog open={!!selectedBadge} onOpenChange={(o) => !o && setSelectedBadge(null)}>
        <DialogContent dir="rtl" className="font-tajawal">
          {(() => {
            const a = ACHIEVEMENTS.find((x) => x.id === selectedBadge);
            if (!a) return null;
            const at = earned[a.id];
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-center">{a.name}</DialogTitle>
                </DialogHeader>
                <div className="text-center py-3">
                  <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${a.gradient} flex items-center justify-center text-5xl shadow-2xl mb-3`}>
                    {a.emoji}
                  </div>
                  <p className="text-muted-foreground">{a.desc}</p>
                  <p className="text-xs text-muted-foreground mt-2">الشرط: {a.condition}</p>
                  {at && <p className="text-xs mt-2">تم الحصول عليها في {new Date(at).toLocaleDateString("ar")}</p>}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatMini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">{icon}<span>{label}</span></div>
      <div className="text-2xl font-extrabold text-[#6C5CE7]">{value}</div>
    </div>
  );
}