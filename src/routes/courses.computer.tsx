import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, ChevronDown, Lock, CheckCircle2, Circle, Clock,
  Video, FileText, Terminal, Play, ArrowRight, ArrowLeft, Save, Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { Confetti } from "@/components/Confetti";
import { RippleButton } from "@/components/RippleButton";
import { checkAchievements } from "@/lib/achievements";
import { addNotification } from "@/lib/notifications";

// ============ TYPES ============
type LessonType = "video" | "article" | "practice";
type Quiz = { question: string; options: string[]; correct: number };
type CLesson = {
  id: number;
  module: number;
  title: string;
  duration: string;
  type: LessonType;
  content: string;
  code: string | null;
  quiz: Quiz[];
  xp: number;
};

// ============ DATA ============
const MODULES = [
  { id: 1, title: "أساسيات الحاسوب", subtitle: "المكونات والتجميع والصيانة" },
  { id: 2, title: "أنظمة التشغيل", subtitle: "Windows · Linux · Virtualization" },
  { id: 3, title: "الشبكات", subtitle: "IP · Routers · WiFi · Security" },
  { id: 4, title: "الأدمن والأنظمة المتقدمة", subtitle: "Server · AD · Automation" },
];

const sampleQuiz = (topic: string): Quiz[] => [
  { question: `ما الهدف الرئيسي من دراسة ${topic}؟`, options: ["الترفيه", "بناء أساس قوي وتطبيق عملي", "حفظ المصطلحات فقط", "لا شيء"], correct: 1 },
  { question: "أيٌّ من التالي ممارسة احترافية؟", options: ["تخمين الحلول", "التوثيق والاختبار", "تخطّي المراجع", "تجاهل الأخطاء"], correct: 1 },
  { question: "ما الخطوة الأولى عند مواجهة مشكلة تقنية؟", options: ["إعادة التشغيل عشواً", "تحديد المشكلة بدقة وقراءة السجل", "حذف الإعدادات", "تجاهلها"], correct: 1 },
];

const L = (id: number, module: number, title: string, duration: string, type: LessonType, content: string, code: string | null = null): CLesson => ({
  id, module, title, duration, type, content, code, quiz: sampleQuiz(title), xp: 50,
});

export const COMPUTER_LESSONS: CLesson[] = [
  // Module 1 - Basics (8)
  L(1, 1, "مكونات الحاسوب الداخلية", "18 دقيقة", "video",
    "المعالج (CPU) هو عقل الحاسوب ينفّذ العمليات الحسابية والمنطقية. تتكوّن أهم القطع الداخلية من: المعالج (CPU)، الذاكرة العشوائية (RAM) لتخزين البيانات مؤقتاً أثناء التشغيل، اللوحة الأم (Motherboard) التي تربط جميع القطع، كرت الشاشة (GPU) لمعالجة الرسوميات، ووحدات التخزين (SSD/HDD) لحفظ الملفات بشكل دائم. فهم كل قطعة ودورها يساعدك على اختيار جهاز مناسب أو ترقيته لاحقاً."),
  L(2, 1, "أنواع التخزين (HDD vs SSD vs NVMe)", "15 دقيقة", "article",
    "HDD أقراص ميكانيكية بسعات كبيرة وأسعار منخفضة وأبطأ. SSD أسرع بكثير وأكثر اعتمادية. NVMe أحدث تقنية تتصل عبر PCIe وتوفّر سرعات تفوق SSD التقليدي بأضعاف. القاعدة: نظام التشغيل والبرامج على NVMe/SSD، والملفات الكبيرة على HDD."),
  L(3, 1, "المنافذ والتوصيلات", "12 دقيقة", "article",
    "USB-A و USB-C للأجهزة الطرفية، HDMI و DisplayPort للشاشات، Thunderbolt لنقل البيانات والفيديو بسرعة عالية. تعلّم تمييز الإصدارات (USB 3.2, HDMI 2.1) لاختيار الكابل المناسب."),
  L(4, 1, "اختيار قطع الحاسوب المناسبة", "20 دقيقة", "article",
    "للألعاب: ركّز على GPU قوي و CPU متوازن. للعمل المكتبي: CPU متوسط و 16GB RAM يكفي. للمونتاج: ذاكرة 32GB+ و SSD سريع و GPU يدعم تسريع الترميز."),
  L(5, 1, "تجميع حاسوب من الصفر", "25 دقيقة", "practice",
    "ابدأ بتثبيت المعالج على اللوحة الأم، ثم RAM، ثم اللوحة في الصندوق، وصّل مزوّد الطاقة، ركّب التخزين والمبرد، أخيراً GPU. شغّل ثم ادخل BIOS للتحقق.",
    `# ترتيب التجميع المختصر\n1. CPU on Motherboard\n2. RAM Sticks (Dual Channel slots)\n3. Mount Motherboard in Case\n4. PSU + Cable Management\n5. Storage (M.2 / SATA)\n6. CPU Cooler\n7. GPU (last)\n8. Boot → BIOS → XMP/EXPO`),
  L(6, 1, "BIOS/UEFI: الإعدادات الأساسية والمتقدمة", "18 دقيقة", "video",
    "UEFI هو الواجهة الحديثة بديلاً عن BIOS التقليدي. أهم الإعدادات: تفعيل XMP/EXPO لسرعة الذاكرة، ضبط ترتيب الإقلاع، تفعيل Virtualization (VT-x/AMD-V)، وتحديث الـ Firmware عند الحاجة."),
  L(7, 1, "ترقية القطع (RAM, Storage, GPU)", "16 دقيقة", "article",
    "تحقّق من توافق RAM مع اللوحة (DDR4 vs DDR5)، تأكّد من مساحة GPU وقدرة PSU، واستنسخ القرص قبل الترقية لتجنّب فقدان البيانات."),
  L(8, 1, "صيانة الحاسوب وتنظيفه", "14 دقيقة", "practice",
    "نظّف المراوح والمبرد كل 6 أشهر بهواء مضغوط، استبدل المعجون الحراري كل سنتين، حدّث تعريفات GPU بانتظام، وراقب درجات الحرارة عبر HWiNFO."),

  // Module 2 - OS (10)
  L(9, 2, "مقدمة في أنظمة التشغيل", "15 دقيقة", "video",
    "نظام التشغيل وسيط بين العتاد والبرامج. Windows هو الأشهر للمكاتب والألعاب، macOS مغلق وممتاز للإنتاج الإبداعي، Linux مرن ومفتوح المصدر ومسيطر على الخوادم."),
  L(10, 2, "تثبيت Windows 11 من الصفر", "22 دقيقة", "practice",
    "حمّل أداة Media Creation Tool، أنشئ USB إقلاع، اضبط BIOS للإقلاع منه، اتبع المعالج وقسّم القرص، فعّل النسخة، ثم ثبّت التعريفات.",
    `# إنشاء USB إقلاع بأمر diskpart\nlist disk\nselect disk 1\nclean\ncreate partition primary\nformat fs=ntfs quick\nactive\nassign`),
  L(11, 2, "إعدادات Windows المتقدمة", "20 دقيقة", "article",
    "Registry Editor (regedit) لتعديل الإعدادات العميقة، Group Policy (gpedit.msc) لإدارة سياسات النظام، Task Scheduler لجدولة المهام، Services لإدارة الخدمات."),
  L(12, 2, "موجه الأوامر (Command Prompt)", "22 دقيقة", "practice",
    "CMD أداة قوية لإدارة النظام وحل المشاكل. تعلّم أساسيات أوامر الشبكة والملفات.",
    `ipconfig /all\nping google.com\nsfc /scannow\nchkdsk C: /f /r\ntasklist\nnetstat -ano`),
  L(13, 2, "PowerShell: سكربتات وأتمتة", "25 دقيقة", "practice",
    "PowerShell أقوى من CMD ويستخدم الكائنات. مثال: حذف ملفات أقدم من 30 يوماً.",
    `Get-ChildItem "C:\\Logs" -Recurse |\n  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |\n  Remove-Item -Force`),
  L(14, 2, "مقدمة في Linux", "20 دقيقة", "video",
    "Linux نظام تشغيل مفتوح المصدر. ابدأ بـ Ubuntu، تعلّم Terminal الأساسي وأوامر apt لإدارة الحزم."),
  L(15, 2, "توزيعات Linux للمبتدئين", "12 دقيقة", "article",
    "Ubuntu للمستخدم العام، Linux Mint للقادمين من Windows، Pop!_OS للمطورين والألعاب، Fedora للمحترفين."),
  L(16, 2, "Dual Boot: Windows + Linux", "18 دقيقة", "practice",
    "قلّص قرص Windows، أنشئ USB إقلاع Linux، ثبّت Linux في المساحة الفارغة، سيتولّى GRUB إدارة الإقلاع.",
    `# بعد التثبيت لإصلاح GRUB\nsudo update-grub\nsudo grub-install /dev/sda`),
  L(17, 2, "Virtual Machines", "16 دقيقة", "article",
    "VirtualBox مجاني ومناسب للتجربة، VMware احترافي. خصّص CPU و RAM مناسبة وفعّل Virtualization من BIOS."),
  L(18, 2, "Docker: الحاويات", "22 دقيقة", "practice",
    "Docker يعزل التطبيقات في حاويات خفيفة. تعلّم تشغيل أول حاوية وإدارتها.",
    `docker pull nginx\ndocker run -d -p 8080:80 --name web nginx\ndocker ps\ndocker logs web\ndocker stop web && docker rm web`),

  // Module 3 - Networks (7)
  L(19, 3, "مفاهيم الشبكات", "18 دقيقة", "video",
    "IP عنوان الجهاز، DNS يحوّل أسماء النطاقات إلى عناوين IP، DHCP يوزّع العناوين تلقائياً، Router يوجّه الحزم، Switch يربط أجهزة الشبكة المحلية."),
  L(20, 3, "إعداد Router منزلي", "20 دقيقة", "practice",
    "ادخل لوحة الراوتر (192.168.1.1)، غيّر كلمة المرور، اضبط WiFi، فعّل Port Forwarding للألعاب أو الخوادم، استخدم QoS لإعطاء أولوية للأجهزة المهمة."),
  L(21, 3, "الشبكات اللاسلكية", "15 دقيقة", "article",
    "WiFi 6 (802.11ax) أسرع وأكثر كفاءة، WiFi 6E يدعم 6GHz، WiFi 7 قادم بسرعات أعلى. شبكات Mesh تغطّي البيوت الكبيرة بإشارة قوية."),
  L(22, 3, "VPN: ما هو وكيف يعمل", "16 دقيقة", "video",
    "VPN ينشئ نفقاً مشفّراً بين جهازك والخادم. WireGuard أحدث وأسرع، OpenVPN أكثر استقراراً وتوافقاً."),
  L(23, 3, "أمان الشبكات", "20 دقيقة", "article",
    "Firewall يمنع الاتصالات غير المصرّح بها، IDS يكشف التطفّل، IPS يصدّه. حدّث Firmware باستمرار واستخدم WPA3 إن أمكن."),
  L(24, 3, "مشاكل الشبكات الشائعة", "14 دقيقة", "practice",
    "خطوات تشخيص أساسية لأي مشكلة اتصال.",
    `ipconfig /flushdns\nipconfig /release && ipconfig /renew\ntracert google.com\nnslookup google.com\nnetsh winsock reset`),
  L(25, 3, "Home Lab: مختبر شبكات منزلي", "25 دقيقة", "article",
    "ابدأ بـ Mini PC أو Raspberry Pi، ثبّت Proxmox، شغّل VMs لتجربة pfSense و Pi-hole و Home Assistant."),

  // Module 4 - Admin (8)
  L(26, 4, "Active Directory", "25 دقيقة", "video",
    "AD خدمة إدارة المستخدمين والأجهزة في بيئات Windows. تعلّم إنشاء OUs والمستخدمين والمجموعات وتطبيق Group Policies."),
  L(27, 4, "Windows Server: التثبيت والإعداد", "22 دقيقة", "practice",
    "ثبّت Windows Server بنفس خطوات Windows العادي، ثم ركّب أدوار مثل AD DS و DNS و DHCP عبر Server Manager.",
    `# PowerShell لتثبيت AD DS\nInstall-WindowsFeature AD-Domain-Services -IncludeManagementTools\nInstall-ADDSForest -DomainName "lab.local"`),
  L(28, 4, "Linux Server: LAMP Stack", "24 دقيقة", "practice",
    "Linux + Apache + MySQL + PHP. التثبيت على Ubuntu Server خطوة بخطوة.",
    `sudo apt update && sudo apt upgrade -y\nsudo apt install apache2 mysql-server php libapache2-mod-php -y\nsudo mysql_secure_installation\nsudo systemctl enable --now apache2 mysql`),
  L(29, 4, "إدارة المستخدمين والصلاحيات", "18 دقيقة", "article",
    "في Linux: chmod و chown و ACL. في Windows: NTFS Permissions و Share Permissions. تذكّر مبدأ أقل صلاحية ممكنة."),
  L(30, 4, "استراتيجيات النسخ الاحتياطي", "16 دقيقة", "article",
    "قاعدة 3-2-1: ثلاث نسخ على وسيطين مختلفين ونسخة خارج الموقع. اختبر الاستعادة دورياً."),
  L(31, 4, "مراقبة الأداء", "20 دقيقة", "practice",
    "أدوات مثل Prometheus و Grafana في Linux، Performance Monitor في Windows. راقب CPU و RAM و Disk I/O و Network.",
    `# Linux quick check\ntop\nhtop\nfree -h\ndf -h\niostat -x 1\nss -tulpn`),
  L(32, 4, "أتمتة المهام", "18 دقيقة", "practice",
    "Cron في Linux و Task Scheduler في Windows.",
    `# Linux crontab: نسخ احتياطي كل ليلة 2 صباحاً\n0 2 * * * /usr/local/bin/backup.sh\n\n# Windows schtasks\nschtasks /Create /SC DAILY /TN "Backup" /TR "C:\\backup.bat" /ST 02:00`),
  L(33, 4, "استكشاف الأخطاء وإصلاحها", "20 دقيقة", "article",
    "منهجية: حدّد المشكلة، اجمع البيانات، ضع فرضية، اختبر، طبّق الحل، وثّق. اقرأ السجلات: Event Viewer في Windows و journalctl في Linux."),
];

const LESSONS_BY_MODULE = MODULES.map((m) => ({
  ...m,
  lessons: COMPUTER_LESSONS.filter((l) => l.module === m.id),
}));

const TOTAL_XP = COMPUTER_LESSONS.reduce((s, l) => s + l.xp, 0);

// ============ STORAGE ============
const KEY_DONE = "ilearn-computer-progress";
const KEY_XP = "ilearn-xp";
const KEY_NOTES = "ilearn-notes";

function getDone(): Set<number> {
  try { return new Set<number>(JSON.parse(localStorage.getItem(KEY_DONE) || "[]")); } catch { return new Set(); }
}
function setDone(s: Set<number>) {
  try { localStorage.setItem(KEY_DONE, JSON.stringify([...s])); } catch {}
}
function addXp(delta: number) {
  try {
    const v = parseInt(localStorage.getItem(KEY_XP) || "0", 10) || 0;
    localStorage.setItem(KEY_XP, String(v + delta));
  } catch {}
}
function getNotes(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(KEY_NOTES) || "{}"); } catch { return {}; }
}
function setNote(id: number, txt: string) {
  const all = getNotes();
  all[`computer-${id}`] = txt;
  try { localStorage.setItem(KEY_NOTES, JSON.stringify(all)); } catch {}
}

// ============ ROUTE ============
export const Route = createFileRoute("/courses/computer")({
  validateSearch: (s: Record<string, unknown>) => ({
    lesson: typeof s.lesson === "string" || typeof s.lesson === "number" ? Number(s.lesson) || undefined : undefined,
  }),
  head: () => ({
    meta: [
      { title: "iLearn — الحاسوب والأنظمة" },
      { name: "description", content: "من الصفر إلى الأدمن — كورس متكامل في الحاسوب وأنظمة التشغيل والشبكات والإدارة." },
    ],
  }),
  component: CoursePage,
});

// ============ HELPERS ============
const TYPE_META: Record<LessonType, { icon: typeof Video; label: string }> = {
  video: { icon: Video, label: "فيديو" },
  article: { icon: FileText, label: "مقال" },
  practice: { icon: Terminal, label: "تمرين عملي" },
};

function moduleProgress(moduleId: number, done: Set<number>): number {
  const list = COMPUTER_LESSONS.filter((l) => l.module === moduleId);
  if (!list.length) return 0;
  const c = list.filter((l) => done.has(l.id)).length;
  return Math.round((c / list.length) * 100);
}

function isModuleUnlocked(moduleId: number, done: Set<number>): boolean {
  if (moduleId === 1) return true;
  return moduleProgress(moduleId - 1, done) >= 80;
}

// ============ MAIN COMPONENT ============
function CoursePage() {
  const { lesson: lessonParam } = Route.useSearch();
  const [done, setDoneState] = useState<Set<number>>(new Set());
  const [openModule, setOpenModule] = useState<number>(1);

  useEffect(() => { setDoneState(getDone()); }, []);

  const refreshDone = () => setDoneState(getDone());

  const overall = useMemo(() => Math.round((done.size / COMPUTER_LESSONS.length) * 100), [done]);
  const earnedXp = done.size * 50;
  const remainingMin = COMPUTER_LESSONS.filter((l) => !done.has(l.id))
    .reduce((s, l) => s + (parseInt(l.duration) || 15), 0);

  const activeLesson = lessonParam ? COMPUTER_LESSONS.find((l) => l.id === lessonParam) : undefined;

  if (activeLesson) {
    return <LessonView lesson={activeLesson} done={done} onComplete={refreshDone} />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      {/* Hero */}
      <header
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4A3F9F 0%, #6C5CE7 60%, #00D2D3 130%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-bold mb-5">
            <ChevronLeft className="w-4 h-4" /> الرئيسية
          </Link>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">💻 الحاسوب والأنظمة</h1>
          <p className="text-white/85 mt-3 text-sm sm:text-base max-w-2xl leading-relaxed">
            من الصفر إلى الأدمن — تعلم مكونات الحاسوب، أنظمة التشغيل، الشبكات، والإدارة المتقدمة.
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {[
              { k: "33", v: "درس" },
              { k: "4", v: "وحدات" },
              { k: "12", v: "ساعة" },
              { k: "4", v: "اختبارات" },
            ].map((s) => (
              <div key={s.v} className="bg-white/15 backdrop-blur rounded-xl px-3 py-2.5 border border-white/20">
                <div className="text-xl sm:text-2xl font-extrabold text-white">{s.k}</div>
                <div className="text-[11px] sm:text-xs text-white/80">{s.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 max-w-2xl">
            <div className="flex items-center justify-between text-xs text-white/85 mb-1.5">
              <span className="font-bold">تقدمك في القسم</span>
              <span className="font-extrabold">{overall}%</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${overall}%` }} />
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Modules */}
        <section className="space-y-4">
          {LESSONS_BY_MODULE.map((m) => {
            const unlocked = isModuleUnlocked(m.id, done);
            const open = openModule === m.id;
            const prog = moduleProgress(m.id, done);
            return (
              <div
                key={m.id}
                className="border border-border rounded-2xl bg-card overflow-hidden animate-ilearn-fade-in"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!unlocked) {
                      toast.message("الوحدة مقفلة", { description: "أكمل 80% من الوحدة السابقة لفتح هذه الوحدة" });
                      return;
                    }
                    setOpenModule(open ? 0 : m.id);
                  }}
                  className="w-full flex items-center gap-3 p-4 sm:p-5 text-right hover:bg-accent/40 transition-colors cursor-pointer"
                >
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center font-extrabold text-white shrink-0 ${unlocked ? "" : "grayscale opacity-60"}`}
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {unlocked ? m.id : <Lock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-foreground text-sm sm:text-base">الوحدة {m.id}: {m.title}</h3>
                      <span className="text-[11px] text-muted-foreground">({m.lessons.length} دروس)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.subtitle}</p>
                    {unlocked && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${prog}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground">{prog}%</span>
                      </div>
                    )}
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
                </button>

                {open && unlocked && (
                  <ul className="divide-y divide-border border-t border-border animate-ilearn-slide-up">
                    {m.lessons.map((l) => {
                      const isDone = done.has(l.id);
                      const TypeIcon = TYPE_META[l.type].icon;
                      return (
                        <li key={l.id}>
                          <Link
                            to="/courses/computer"
                            search={{ lesson: l.id }}
                            className="flex items-center gap-3 p-3 sm:p-4 hover:bg-accent/40 transition-colors"
                          >
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${isDone ? "bg-success/20 text-success" : "bg-primary/15 text-primary"}`}>
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : l.id}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-bold truncate ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>{l.title}</div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-3 mt-0.5">
                                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {l.duration}</span>
                                <span className="inline-flex items-center gap-1"><TypeIcon className="w-3 h-3" /> {TYPE_META[l.type].label}</span>
                              </div>
                            </div>
                            <span className={`hidden sm:inline-flex text-[11px] font-bold px-3 h-8 items-center rounded-lg shrink-0 ${isDone ? "bg-muted text-muted-foreground" : "text-white"}`} style={!isDone ? { background: "var(--gradient-primary)" } : undefined}>
                              {isDone ? "أكمل" : "ابدأ"}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </section>

        {/* Sticky Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs text-muted-foreground font-bold mb-1">القسم</div>
              <div className="font-extrabold text-foreground mb-3">الحاسوب والأنظمة</div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">التقدم الكلي</span>
                <span className="font-extrabold text-primary">{overall}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${overall}%`, background: "var(--gradient-primary)" }} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-accent p-2">
                  <div className="text-sm font-extrabold text-foreground">{earnedXp}</div>
                  <div className="text-[10px] text-muted-foreground">/ {TOTAL_XP} XP</div>
                </div>
                <div className="rounded-xl bg-accent p-2">
                  <div className="text-sm font-extrabold text-foreground">{Math.round(remainingMin / 60)}h</div>
                  <div className="text-[10px] text-muted-foreground">الوقت المتبقي</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-bold text-muted-foreground mb-3">الوحدات</div>
              <ul className="space-y-2">
                {LESSONS_BY_MODULE.map((m) => {
                  const unlocked = isModuleUnlocked(m.id, done);
                  const p = moduleProgress(m.id, done);
                  return (
                    <li key={m.id}>
                      <button
                        onClick={() => unlocked && setOpenModule(m.id)}
                        disabled={!unlocked}
                        className="w-full text-right flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <span className="h-6 w-6 rounded-md bg-primary/15 text-primary text-[11px] font-extrabold flex items-center justify-center">
                          {unlocked ? m.id : <Lock className="w-3 h-3" />}
                        </span>
                        <span className="text-xs font-bold text-foreground flex-1 truncate">{m.title}</span>
                        <span className="text-[10px] text-muted-foreground">{p}%</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

// ============ LESSON VIEW ============
function LessonView({ lesson, done, onComplete }: { lesson: CLesson; done: Set<number>; onComplete: () => void }) {
  const navigate = useNavigate();
  const isDone = done.has(lesson.id);
  const [note, setNoteState] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const TypeIcon = TYPE_META[lesson.type].icon;

  useEffect(() => {
    setNoteState(getNotes()[`computer-${lesson.id}`] || "");
    setAnswers({});
    setQuizSubmitted(false);
    window.scrollTo({ top: 0 });
  }, [lesson.id]);

  const related = COMPUTER_LESSONS.filter((l) => l.module === lesson.module && l.id !== lesson.id).slice(0, 4);
  const idx = COMPUTER_LESSONS.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? COMPUTER_LESSONS[idx - 1] : null;
  const next = idx < COMPUTER_LESSONS.length - 1 ? COMPUTER_LESSONS[idx + 1] : null;

  const correctCount = lesson.quiz.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0);

  const handleComplete = () => {
    if (isDone) {
      toast.message("هذا الدرس مكتمل بالفعل");
      return;
    }
    const set = getDone();
    set.add(lesson.id);
    setDone(set);
    addXp(lesson.xp);
    setConfetti((n) => n + 1);
    toast.success(`🎉 أحسنت! +${lesson.xp} XP`, { description: `أكملت: ${lesson.title}` });
    addNotification({
      type: "lesson",
      title: "أكملت درساً جديداً",
      description: lesson.title,
      icon: "🎓",
      link: `/courses/computer?lesson=${lesson.id}`,
    });
    try {
      const newly = checkAchievements();
      newly.forEach((a) => {
        toast.success(`🏆 شارة جديدة: ${a.name}`, { description: a.desc });
        addNotification({ type: "achievement", title: "حصلت على شارة!", description: a.name, icon: a.emoji, link: "/achievements" });
      });
    } catch {}
    onComplete();
  };

  const handleSaveNote = () => {
    setNote(lesson.id, note);
    toast.success("تم حفظ الملاحظات");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <Confetti trigger={confetti} />
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link to="/courses/computer" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" /> رجوع للقسم
          </Link>
          <div className="ms-auto text-[11px] text-muted-foreground">الدرس {lesson.id} / {COMPUTER_LESSONS.length}</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-ilearn-fade-in">
        <div>
          <div className="text-xs text-primary font-bold mb-1.5">
            الوحدة {lesson.module} · {MODULES.find((m) => m.id === lesson.module)?.title}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground leading-snug">{lesson.title}</h1>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
            <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" /> {lesson.duration}</span>
            <span className="inline-flex items-center gap-1.5"><TypeIcon className="w-4 h-4" /> {TYPE_META[lesson.type].label}</span>
            <span className="inline-flex items-center gap-1.5 text-warning"><Trophy className="w-4 h-4" /> {lesson.xp} XP</span>
          </div>
        </div>

        {/* Video placeholder */}
        <div
          className="relative aspect-video rounded-2xl overflow-hidden flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#4A3F9F,#6C5CE7,#00D2D3)" }}
        >
          <button type="button" className="h-20 w-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
            <Play className="w-8 h-8 text-primary fill-current ms-1" />
          </button>
          <div className="absolute bottom-3 inset-x-0 text-center text-white/85 text-xs font-bold">الفيديو قريباً</div>
        </div>

        {/* Content */}
        <article className="prose prose-invert max-w-none">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 leading-loose text-sm sm:text-base text-foreground/90 whitespace-pre-wrap">
            {lesson.content}
          </div>
        </article>

        {/* Code */}
        {lesson.code && (
          <div className="rounded-2xl overflow-hidden border border-border bg-[#0b1020]">
            <div className="px-4 py-2 text-[11px] font-bold text-cyan-300 border-b border-white/10 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" /> Code
            </div>
            <pre dir="ltr" className="p-4 text-[12.5px] leading-relaxed text-cyan-100 overflow-x-auto font-mono"><code>{lesson.code}</code></pre>
          </div>
        )}

        {/* Quiz */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-foreground mb-4">اختبار سريع</h2>
          <ul className="space-y-5">
            {lesson.quiz.map((q, qi) => (
              <li key={qi}>
                <div className="text-sm font-bold text-foreground mb-2">{qi + 1}. {q.question}</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[qi] === oi;
                    const showRight = quizSubmitted && oi === q.correct;
                    const showWrong = quizSubmitted && selected && oi !== q.correct;
                    return (
                      <button
                        type="button"
                        key={oi}
                        onClick={() => !quizSubmitted && setAnswers((a) => ({ ...a, [qi]: oi }))}
                        className={`text-right text-sm px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                          showRight ? "border-success bg-success/10 text-success" :
                          showWrong ? "border-destructive bg-destructive/10 text-destructive" :
                          selected ? "border-primary bg-primary/10 text-foreground" :
                          "border-border bg-background hover:border-primary/50 text-foreground"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <RippleButton
              onClick={() => {
                if (Object.keys(answers).length < lesson.quiz.length) {
                  toast.message("أجب على جميع الأسئلة أولاً");
                  return;
                }
                setQuizSubmitted(true);
              }}
              disabled={quizSubmitted}
              className="h-10 px-5 rounded-xl text-white font-bold text-sm disabled:opacity-50 cursor-pointer"
              style={{ background: "var(--gradient-primary)" }}
            >
              تصحيح الإجابات
            </RippleButton>
            {quizSubmitted && (
              <span className="text-sm font-bold text-foreground">
                نتيجتك: {correctCount} / {lesson.quiz.length}
              </span>
            )}
          </div>
        </section>

        {/* Notes */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-foreground mb-3">ملاحظاتي</h2>
          <textarea
            value={note}
            onChange={(e) => setNoteState(e.target.value)}
            placeholder="اكتب ملاحظاتك هنا..."
            className="w-full min-h-[120px] rounded-xl border border-border bg-background p-3 text-sm focus:outline-none focus:border-primary resize-y"
          />
          <button type="button" onClick={handleSaveNote} className="mt-3 inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-accent hover:bg-accent/70 text-foreground text-xs font-bold cursor-pointer">
            <Save className="w-3.5 h-3.5" /> حفظ الملاحظات
          </button>
        </section>

        {/* Complete + Nav */}
        <div className="flex flex-col sm:flex-row gap-3">
          <RippleButton
            onClick={handleComplete}
            className={`flex-1 h-12 rounded-xl font-extrabold text-sm shadow-lg cursor-pointer ${isDone ? "bg-muted text-muted-foreground" : "text-white"}`}
            style={!isDone ? { background: "var(--gradient-primary)" } : undefined}
          >
            {isDone ? "✅ مكتمل" : `إكمال الدرس (+${lesson.xp} XP)`}
          </RippleButton>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!prev}
              onClick={() => prev && navigate({ to: "/courses/computer", search: { lesson: prev.id } })}
              className="h-12 px-4 rounded-xl border border-border bg-card text-foreground text-sm font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/50 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" /> السابق
            </button>
            <button
              type="button"
              disabled={!next}
              onClick={() => next && navigate({ to: "/courses/computer", search: { lesson: next.id } })}
              className="h-12 px-4 rounded-xl border border-border bg-card text-foreground text-sm font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/50 cursor-pointer"
            >
              التالي <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="pt-2">
            <h3 className="text-sm font-extrabold text-foreground mb-3">دروس ذات صلة</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map((r) => {
                const rDone = done.has(r.id);
                const RI = TYPE_META[r.type].icon;
                return (
                  <Link
                    key={r.id}
                    to="/courses/computer"
                    search={{ lesson: r.id }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
                  >
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${rDone ? "bg-success/20 text-success" : "bg-primary/15 text-primary"}`}>
                      {rDone ? <CheckCircle2 className="w-4 h-4" /> : r.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{r.title}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {r.duration}</span>
                        <span className="inline-flex items-center gap-1"><RI className="w-3 h-3" /> {TYPE_META[r.type].label}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}