import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowLeft, Play, FileText, Terminal, Lock, CheckCircle2,
  Circle, ChevronDown, Clock, Save, Trophy, BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Confetti } from "@/components/Confetti";
import { checkAchievements } from "@/lib/achievements";
import { addNotification } from "@/lib/notifications";

// ============ DATA ============
type LessonType = "video" | "article" | "exercise";
type QuizQ = { question: string; options: string[]; correct: number };
type CLesson = {
  id: number; module: 1 | 2 | 3 | 4; title: string;
  duration: string; type: LessonType; xp: number;
  content: string; code?: string; quiz: QuizQ[];
};

const defaultQuiz = (topic: string): QuizQ[] => [
  { question: `ما الفائدة الأساسية من تعلم "${topic}"؟`,
    options: ["تحسين المهارات التقنية", "لا فائدة", "مضيعة للوقت", "للترفيه فقط"], correct: 0 },
  { question: "ما الخطوة الأولى عند مواجهة مشكلة تقنية؟",
    options: ["إعادة التشغيل عشواً", "تحديد المشكلة بدقة", "حذف كل شيء", "تجاهلها"], correct: 1 },
  { question: "أيٌّ من التالي ممارسة جيدة؟",
    options: ["التجربة العملية", "الحفظ دون فهم", "تخطّي الأساسيات", "النسخ الأعمى"], correct: 0 },
];

const richContent = (title: string, intro: string, points: string[]) =>
  `${intro}\n\n` + points.map((p, i) => `${i + 1}. ${p}`).join("\n") +
  `\n\nنصيحة: التطبيق العملي لما تعلمته في "${title}" هو السر الحقيقي للإتقان.`;

export const COMPUTER_LESSONS: CLesson[] = [
  // ===== Module 1: أساسيات الحاسوب =====
  { id: 1, module: 1, title: "مكونات الحاسوب الداخلية", duration: "18 دقيقة", type: "video", xp: 50,
    content: richContent("مكونات الحاسوب",
      "المعالج (CPU) هو عقل الحاسوب، يقوم بتنفيذ التعليمات والعمليات الحسابية. أما الذاكرة (RAM) فهي مكان مؤقت لتخزين البيانات قيد المعالجة.",
      ["CPU: السرعة تُقاس بالـ GHz وعدد الأنوية", "RAM: ذاكرة سريعة لكن مؤقتة (تُمحى عند الإطفاء)",
       "Motherboard: اللوحة الأم تربط جميع المكونات", "GPU: معالج رسومي للألعاب والمونتاج",
       "PSU: مزود الطاقة، اختر بحرص بحسب استهلاك القطع"]),
    quiz: [
      { question: "ما هو عقل الحاسوب؟", options: ["CPU", "RAM", "GPU", "SSD"], correct: 0 },
      { question: "أي من التالي ذاكرة مؤقتة؟", options: ["HDD", "RAM", "SSD", "USB"], correct: 1 },
      { question: "ما وظيفة GPU؟", options: ["معالجة الرسومات", "تخزين البيانات", "إدارة الطاقة", "الاتصال بالإنترنت"], correct: 0 },
    ] },
  { id: 2, module: 1, title: "أنواع التخزين (HDD vs SSD vs NVMe)", duration: "15 دقيقة", type: "article", xp: 50,
    content: richContent("التخزين", "اختيار وسيلة التخزين يؤثر بشكل مباشر على سرعة الجهاز.",
      ["HDD: تخزين تقليدي رخيص لكن بطيء", "SSD: أسرع بـ 5 مرات من HDD",
       "NVMe: أسرع نوع متاح، يتصل مباشرة بـ PCIe", "اختر NVMe للنظام و HDD للأرشيف"]),
    quiz: defaultQuiz("أنواع التخزين") },
  { id: 3, module: 1, title: "المنافذ والتوصيلات", duration: "12 دقيقة", type: "article", xp: 40,
    content: richContent("المنافذ", "كل منفذ له غرض محدد ومعدل نقل بيانات مختلف.",
      ["USB-A / USB-C: الأكثر شيوعاً", "HDMI: لنقل الصورة والصوت للشاشة",
       "DisplayPort: مناسب للشاشات عالية الـ Refresh Rate", "Thunderbolt: الأسرع، يدمج البيانات + الفيديو + الطاقة"]),
    quiz: defaultQuiz("المنافذ") },
  { id: 4, module: 1, title: "اختيار قطع الحاسوب المناسبة", duration: "20 دقيقة", type: "video", xp: 60,
    content: richContent("اختيار القطع", "كل استخدام له متطلبات مختلفة.",
      ["للألعاب: ركّز على GPU قوي + 16GB RAM", "للمونتاج: CPU متعدد الأنوية + 32GB RAM",
       "للعمل المكتبي: 8GB RAM وSSD يكفيان", "احرص على توافق المعالج مع المازر بورد"]),
    quiz: defaultQuiz("اختيار القطع") },
  { id: 5, module: 1, title: "تجميع حاسوب من الصفر", duration: "30 دقيقة", type: "exercise", xp: 80,
    content: richContent("تجميع الحاسوب", "اتبع الخطوات بترتيب لتفادي الأخطاء.",
      ["1) ثبّت المعالج في المازربورد", "2) ركّب الـ RAM في الفتحات الصحيحة",
       "3) ثبّت المازربورد داخل الكيس", "4) وصّل مزود الطاقة وكوابل البيانات", "5) شغّل الجهاز وادخل BIOS للتأكد"]),
    quiz: defaultQuiz("تجميع الحاسوب") },
  { id: 6, module: 1, title: "BIOS/UEFI: الإعدادات", duration: "18 دقيقة", type: "article", xp: 50,
    content: richContent("BIOS/UEFI", "أول برنامج يعمل عند تشغيل الجهاز، ويتحكم بالعتاد.",
      ["UEFI أحدث وأسرع من BIOS التقليدي", "Boot Order: ترتيب أقراص الإقلاع",
       "XMP: لتفعيل سرعة الـ RAM الكاملة", "احرص على عدم تعطيل Secure Boot دون سبب"]),
    quiz: defaultQuiz("BIOS") },
  { id: 7, module: 1, title: "ترقية القطع", duration: "15 دقيقة", type: "video", xp: 50,
    content: richContent("الترقية", "الترقية المدروسة أوفر من شراء جهاز جديد.",
      ["زيادة RAM أرخص ترقية وأكثرها فاعلية", "استبدال HDD بـ SSD يضاعف السرعة",
       "ترقية GPU تحتاج فحص مزود الطاقة أولاً", "تأكد من توافق Socket المعالج مع المازر"]),
    quiz: defaultQuiz("الترقية") },
  { id: 8, module: 1, title: "صيانة الحاسوب وتنظيفه", duration: "12 دقيقة", type: "article", xp: 40,
    content: richContent("الصيانة", "التنظيف الدوري يطيل عمر القطع ويحسّن الأداء.",
      ["نظّف المراوح من الغبار كل 3-6 أشهر", "أعد تطبيق المعجون الحراري سنوياً",
       "راقب درجات الحرارة باستخدام HWMonitor", "لا تستخدم مكنسة كهربائية — استخدم هواء مضغوط"]),
    quiz: defaultQuiz("الصيانة") },

  // ===== Module 2: أنظمة التشغيل =====
  { id: 9, module: 2, title: "مقدمة في أنظمة التشغيل", duration: "16 دقيقة", type: "video", xp: 50,
    content: richContent("أنظمة التشغيل", "النظام يدير الموارد ويوفر واجهة بين المستخدم والعتاد.",
      ["Windows: الأكثر شيوعاً، توافق واسع", "macOS: مغلق ومتميز للمونتاج",
       "Linux: مرن، مفتوح المصدر، خفيف على الموارد"]),
    quiz: defaultQuiz("أنظمة التشغيل") },
  { id: 10, module: 2, title: "تثبيت Windows 11 من الصفر", duration: "25 دقيقة", type: "exercise", xp: 70,
    content: richContent("Clean Install", "التثبيت النظيف يضمن نظاماً خالياً من المشاكل.",
      ["جهّز فلاشة USB ≥ 8GB", "استخدم Media Creation Tool من Microsoft",
       "غيّر Boot Order في BIOS لإقلاع USB", "اختر Custom Install وامسح الأقسام القديمة"]),
    code: `# إنشاء فلاشة باستخدام Rufus (موصى به)\n# 1. Download from rufus.ie\n# 2. Select ISO + USB drive\n# 3. Partition: GPT, Filesystem: NTFS`,
    quiz: defaultQuiz("Windows Install") },
  { id: 11, module: 2, title: "إعدادات Windows المتقدمة", duration: "20 دقيقة", type: "article", xp: 60,
    content: richContent("Registry & Group Policy", "أدوات قوية لتخصيص النظام بعمق.",
      ["regedit: محرر الـ Registry — احذر التعديل العشوائي", "gpedit.msc: Group Policy لإدارة السياسات",
       "خذ نسخة احتياطية قبل أي تعديل", "ابحث قبل التعديل في مصادر موثوقة"]),
    code: `# فتح Registry Editor\nWin + R → regedit\n\n# فتح Group Policy\nWin + R → gpedit.msc`,
    quiz: defaultQuiz("Windows Advanced") },
  { id: 12, module: 2, title: "موجه الأوامر (CMD)", duration: "22 دقيقة", type: "exercise", xp: 60,
    content: richContent("Command Prompt", "أداة قوية لإدارة النظام عبر الأوامر النصية.",
      ["ipconfig: عرض إعدادات الشبكة", "ping: اختبار الاتصال",
       "sfc /scannow: فحص ملفات النظام", "tasklist / taskkill: إدارة العمليات"]),
    code: `ipconfig /all\nping google.com\nsfc /scannow\ntasklist\ntaskkill /PID 1234 /F`,
    quiz: defaultQuiz("CMD") },
  { id: 13, module: 2, title: "PowerShell: سكربتات وأتمتة", duration: "25 دقيقة", type: "exercise", xp: 70,
    content: richContent("PowerShell", "بيئة برمجة كاملة لأتمتة المهام في Windows.",
      ["Get-Process: قائمة العمليات", "Get-Service: قائمة الخدمات",
       "يمكن كتابة سكربتات .ps1", "ينفّذ كمسؤول لمعظم المهام"]),
    code: `Get-Process | Where-Object {$_.CPU -gt 100}\nGet-Service | Where-Object {$_.Status -eq "Running"}\n\n# تشغيل سكربت\n.\\myscript.ps1`,
    quiz: defaultQuiz("PowerShell") },
  { id: 14, module: 2, title: "مقدمة في Linux", duration: "20 دقيقة", type: "video", xp: 60,
    content: richContent("Linux", "نظام تشغيل مفتوح المصدر يشغّل معظم الخوادم في العالم.",
      ["Terminal: قلب Linux", "apt / dnf / pacman: مديرو الحزم",
       "كل شيء في Linux ملف", "الصلاحيات تُدار عبر chmod / chown"]),
    code: `sudo apt update && sudo apt upgrade\nls -la\ncd /home\nchmod 755 script.sh`,
    quiz: defaultQuiz("Linux") },
  { id: 15, module: 2, title: "توزيعات Linux للمبتدئين", duration: "15 دقيقة", type: "article", xp: 40,
    content: richContent("توزيعات Linux", "كل توزيعة لها فلسفة واستخدام مختلف.",
      ["Ubuntu: الأشهر، مدعومة جيداً", "Linux Mint: شبيهة بـ Windows، سهلة",
       "Pop!_OS: مثالية للمطورين والـ Gaming", "Fedora: متقدمة وحديثة"]),
    quiz: defaultQuiz("توزيعات Linux") },
  { id: 16, module: 2, title: "Dual Boot: Windows + Linux", duration: "30 دقيقة", type: "exercise", xp: 80,
    content: richContent("Dual Boot", "تشغيل نظامين على نفس الجهاز.",
      ["ثبّت Windows أولاً ثم Linux", "اترك مساحة غير مخصصة لـ Linux",
       "GRUB سيتولى اختيار النظام عند الإقلاع", "خذ نسخة احتياطية قبل البدء"]),
    quiz: defaultQuiz("Dual Boot") },
  { id: 17, module: 2, title: "Virtual Machines", duration: "22 دقيقة", type: "video", xp: 60,
    content: richContent("VMs", "تشغيل نظام داخل نظام — مثالي للتجارب.",
      ["VirtualBox: مجاني ومفتوح المصدر", "VMware Workstation: احترافي ومدفوع",
       "خصّص ذاكرة كافية للـ VM (≥ 4GB)", "فعّل Virtualization في BIOS"]),
    quiz: defaultQuiz("VMs") },
  { id: 18, module: 2, title: "Docker: الحاويات والتطبيقات", duration: "28 دقيقة", type: "exercise", xp: 80,
    content: richContent("Docker", "تشغيل التطبيقات في بيئات معزولة وخفيفة.",
      ["Container: نسخة معزولة من تطبيق", "Image: قالب ثابت",
       "Dockerfile: تعليمات بناء Image", "docker-compose لإدارة عدة حاويات"]),
    code: `docker pull nginx\ndocker run -d -p 8080:80 nginx\ndocker ps\ndocker stop <id>`,
    quiz: defaultQuiz("Docker") },

  // ===== Module 3: الشبكات =====
  { id: 19, module: 3, title: "مفاهيم الشبكات الأساسية", duration: "20 دقيقة", type: "video", xp: 60,
    content: richContent("الشبكات", "فهم البروتوكولات هو أساس كل شيء.",
      ["IP: عنوان فريد لكل جهاز", "DNS: تحويل أسماء النطاقات لعناوين IP",
       "DHCP: توزيع عناوين IP تلقائياً", "Router vs Switch: الراوتر يربط الشبكات، السويتش الأجهزة"]),
    quiz: defaultQuiz("الشبكات") },
  { id: 20, module: 3, title: "إعداد Router منزلي", duration: "18 دقيقة", type: "article", xp: 50,
    content: richContent("Router Setup", "الإعدادات الافتراضية ليست دائماً الأفضل.",
      ["غيّر كلمة المرور الافتراضية فوراً", "استخدم WPA3 إن أمكن",
       "Port Forwarding: لفتح منافذ لخدمات معينة", "QoS: لإعطاء أولوية لأجهزة محددة"]),
    quiz: defaultQuiz("Router") },
  { id: 21, module: 3, title: "الشبكات اللاسلكية", duration: "16 دقيقة", type: "article", xp: 50,
    content: richContent("WiFi", "WiFi 6 و7 يحدثان فرقاً كبيراً في الأداء.",
      ["WiFi 6: سرعة أعلى وكفاءة أفضل", "WiFi 7: قفزة كبيرة في النطاق",
       "Mesh Networks: تغطية كاملة للمنزل الكبير", "5GHz أسرع لكن مدى أقصر من 2.4GHz"]),
    quiz: defaultQuiz("WiFi") },
  { id: 22, module: 3, title: "VPN: ما هو وكيف يعمل", duration: "20 دقيقة", type: "video", xp: 60,
    content: richContent("VPN", "يشفّر اتصالك ويخفي IP الحقيقي.",
      ["WireGuard: حديث وسريع", "OpenVPN: أكثر شيوعاً ومستقر",
       "VPN لا يجعلك مجهول الهوية بالكامل", "اختر مزوداً يلتزم بسياسة No-Logs"]),
    quiz: defaultQuiz("VPN") },
  { id: 23, module: 3, title: "أمان الشبكات", duration: "22 دقيقة", type: "article", xp: 60,
    content: richContent("Network Security", "الحماية تبدأ من حافة الشبكة.",
      ["Firewall: يفلتر حركة المرور", "IDS: نظام كشف اختراق",
       "IPS: نظام منع اختراق", "افصل شبكة الضيوف عن الرئيسية"]),
    quiz: defaultQuiz("أمان الشبكات") },
  { id: 24, module: 3, title: "مشاكل الشبكات الشائعة وحلولها", duration: "18 دقيقة", type: "exercise", xp: 50,
    content: richContent("Network Troubleshooting", "اتبع منهجاً منظماً لتشخيص المشاكل.",
      ["ابدأ بـ ping لاختبار الاتصال", "tracert لتتبع المسار",
       "أعد تشغيل الراوتر إذا فشلت الحلول", "تحقق من DNS باستخدام nslookup"]),
    code: `ping 8.8.8.8\ntracert google.com\nnslookup google.com\nipconfig /flushdns`,
    quiz: defaultQuiz("Troubleshooting") },
  { id: 25, module: 3, title: "Home Lab: بناء مختبر شبكات", duration: "30 دقيقة", type: "video", xp: 80,
    content: richContent("Home Lab", "أفضل طريقة للتعلم العملي.",
      ["جهاز قديم + Proxmox = بداية ممتازة", "ثبّت pfSense كـ Firewall",
       "جرّب Kubernetes في بيئة آمنة", "وثّق كل ما تتعلمه"]),
    quiz: defaultQuiz("Home Lab") },

  // ===== Module 4: الأدمن والأنظمة المتقدمة =====
  { id: 26, module: 4, title: "Active Directory", duration: "28 دقيقة", type: "video", xp: 80,
    content: richContent("AD", "العمود الفقري لإدارة المستخدمين في الشركات.",
      ["Domain: مجموعة من الأجهزة المُدارة مركزياً", "OU: وحدات تنظيمية للترتيب",
       "Group Policy: تطبيق إعدادات على مستخدمين/أجهزة", "نسخ احتياطية دورية للـ AD ضرورية"]),
    quiz: defaultQuiz("AD") },
  { id: 27, module: 4, title: "Windows Server: التثبيت والإعداد", duration: "25 دقيقة", type: "exercise", xp: 70,
    content: richContent("Windows Server", "نسخة متخصصة لإدارة الخدمات والمستخدمين.",
      ["Server Core: بدون واجهة، أخف وأأمن", "Roles & Features: حدد دور الخادم",
       "ثبّت آخر التحديثات فوراً", "فعّل Remote Desktop للإدارة عن بُعد"]),
    quiz: defaultQuiz("Windows Server") },
  { id: 28, module: 4, title: "Linux Server: LAMP Stack", duration: "30 دقيقة", type: "exercise", xp: 80,
    content: richContent("LAMP", "Linux + Apache + MySQL + PHP — مجموعة كاملة لاستضافة المواقع.",
      ["sudo apt install apache2 mysql-server php", "أمّن MySQL بـ mysql_secure_installation",
       "فعّل الجدار الناري ufw", "احصل على شهادة SSL مجانية من Let's Encrypt"]),
    code: `sudo apt update\nsudo apt install apache2 mysql-server php libapache2-mod-php\nsudo mysql_secure_installation\nsudo systemctl status apache2`,
    quiz: defaultQuiz("LAMP") },
  { id: 29, module: 4, title: "إدارة المستخدمين والصلاحيات", duration: "22 دقيقة", type: "article", xp: 60,
    content: richContent("Permissions & ACLs", "الصلاحيات الدقيقة أساس الأمان.",
      ["chmod 755: قراءة وتنفيذ للجميع، كتابة للمالك فقط", "chown: تغيير المالك",
       "ACL: قوائم تحكم وصول متقدمة", "مبدأ أقل صلاحيات (Least Privilege)"]),
    code: `chmod 755 file.sh\nchown user:group file.sh\nsetfacl -m u:alice:rw file.txt\ngetfacl file.txt`,
    quiz: defaultQuiz("Permissions") },
  { id: 30, module: 4, title: "النسخ الاحتياطي", duration: "20 دقيقة", type: "video", xp: 60,
    content: richContent("Backup", "قاعدة 3-2-1: 3 نسخ، 2 وسائط، 1 خارج الموقع.",
      ["Full / Incremental / Differential", "Rsync أداة قوية في Linux",
       "اختبر استرجاع النسخ دورياً", "خذ نسخة قبل أي تحديث كبير"]),
    code: `rsync -avz /source/ user@server:/backup/\ntar -czvf backup.tar.gz /important/`,
    quiz: defaultQuiz("Backup") },
  { id: 31, module: 4, title: "مراقبة الأداء", duration: "18 دقيقة", type: "article", xp: 50,
    content: richContent("Performance Monitoring", "ما لا يُقاس لا يُحسَّن.",
      ["top / htop في Linux", "Performance Monitor في Windows",
       "Prometheus + Grafana للمراقبة المتقدمة", "حدد عتبات تنبيه واضحة"]),
    code: `htop\nfree -h\ndf -h\niostat -x 2`,
    quiz: defaultQuiz("Monitoring") },
  { id: 32, module: 4, title: "أتمتة المهام", duration: "20 دقيقة", type: "exercise", xp: 60,
    content: richContent("Automation", "كل مهمة متكررة يجب أن تُؤتمت.",
      ["Task Scheduler في Windows", "Cron في Linux",
       "كتابة سكربتات Bash / PowerShell", "Ansible للأتمتة على نطاق واسع"]),
    code: `# Cron: تشغيل سكربت كل يوم 2 صباحاً\n0 2 * * * /home/user/backup.sh\n\n# قائمة المهام الحالية\ncrontab -l`,
    quiz: defaultQuiz("Automation") },
  { id: 33, module: 4, title: "استكشاف الأخطاء وإصلاحها", duration: "25 دقيقة", type: "video", xp: 70,
    content: richContent("Troubleshooting", "منهجية واضحة تختصر ساعات من البحث.",
      ["اقرأ logs أولاً: /var/log أو Event Viewer", "اعزل المشكلة (شبكة؟ نظام؟ تطبيق؟)",
       "غيّر متغيراً واحداً في كل مرة", "وثّق الحل لتفادي تكراره"]),
    quiz: defaultQuiz("Troubleshooting Advanced") },
];

const MODULES = [
  { id: 1, name: "أساسيات الحاسوب", desc: "المكونات، التخزين، التجميع" },
  { id: 2, name: "أنظمة التشغيل", desc: "Windows, Linux, VMs, Docker" },
  { id: 3, name: "الشبكات", desc: "IP, DNS, WiFi, VPN, Home Lab" },
  { id: 4, name: "الأدمن والأنظمة المتقدمة", desc: "AD, Servers, Automation" },
] as const;

// ============ STORAGE ============
const LESSONS_KEY = "ilearn-computer-lessons"; // completed ids: number[]
const NOTES_KEY = "ilearn-notes"; // { [lessonId]: string }
const XP_KEY = "ilearn-xp";

function getCompletedSet(): Set<number> {
  try { const r = localStorage.getItem(LESSONS_KEY); return new Set<number>(r ? JSON.parse(r) : []); }
  catch { return new Set(); }
}
function setCompletedSet(s: Set<number>) {
  try { localStorage.setItem(LESSONS_KEY, JSON.stringify(Array.from(s))); } catch { /* ignore */ }
}
function getNotes(): Record<number, string> {
  try { const r = localStorage.getItem(NOTES_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; }
}
function setNotes(m: Record<number, string>) {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(m)); } catch { /* ignore */ }
}
function getXP(): number {
  try { return parseInt(localStorage.getItem(XP_KEY) ?? "2450", 10) || 0; } catch { return 0; }
}
function setXP(n: number) { try { localStorage.setItem(XP_KEY, String(n)); } catch { /* ignore */ } }

// ============ ROUTE ============
type Search = { lesson?: number };

export const Route = createFileRoute("/courses/computer")({
  validateSearch: (raw: Record<string, unknown>): Search => {
    const r = raw.lesson;
    const lesson = typeof r === "number" ? r : typeof r === "string" && r ? Number(r) || undefined : undefined;
    return { lesson };
  },
  head: () => ({
    meta: [
      { title: "iLearn — الحاسوب والأنظمة" },
      { name: "description", content: "كورس متكامل: مكونات الحاسوب، أنظمة التشغيل، الشبكات، والإدارة المتقدمة" },
    ],
  }),
  component: CoursePage,
});

// ============ TOP-LEVEL HELPERS ============
const TYPE_META: Record<LessonType, { icon: string; label: string; color: string }> = {
  video: { icon: "🎥", label: "فيديو", color: "text-primary" },
  article: { icon: "📄", label: "مقال", color: "text-info" },
  exercise: { icon: "💻", label: "تمرين", color: "text-success" },
};

function CoursePage() {
  const { lesson: lessonIdParam } = Route.useSearch();
  const navigate = useNavigate({ from: "/courses/computer" });

  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [openModule, setOpenModule] = useState<number>(1);
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    setCompleted(getCompletedSet());
  }, []);

  // Module unlocking: 80% of previous completed
  const isModuleUnlocked = (mid: number): boolean => {
    if (mid === 1) return true;
    const prev = COMPUTER_LESSONS.filter((l) => l.module === mid - 1);
    const done = prev.filter((l) => completed.has(l.id)).length;
    return prev.length === 0 || done / prev.length >= 0.8;
  };

  const totalLessons = COMPUTER_LESSONS.length;
  const doneCount = COMPUTER_LESSONS.filter((l) => completed.has(l.id)).length;
  const progressPct = Math.round((doneCount / totalLessons) * 100);
  const totalXP = COMPUTER_LESSONS.reduce((s, l) => s + l.xp, 0);
  const earnedXP = COMPUTER_LESSONS.filter((l) => completed.has(l.id)).reduce((s, l) => s + l.xp, 0);
  const remainingMin = COMPUTER_LESSONS.filter((l) => !completed.has(l.id))
    .reduce((s, l) => s + (parseInt(l.duration) || 15), 0);

  const currentLesson = useMemo(
    () => (lessonIdParam ? COMPUTER_LESSONS.find((l) => l.id === lessonIdParam) ?? null : null),
    [lessonIdParam]
  );

  const handleComplete = (lesson: CLesson) => {
    if (completed.has(lesson.id)) return;
    const next = new Set(completed); next.add(lesson.id); setCompleted(next); setCompletedSet(next);
    setXP(getXP() + lesson.xp);
    setConfettiKey((k) => k + 1);
    toast.success(`🎉 +${lesson.xp} XP — أكملت "${lesson.title}"`);
    addNotification({ type: "lesson", title: "أكملت درساً بنجاح",
      description: `${lesson.title} — +${lesson.xp} XP`, link: "/courses/computer" });
    const newly = checkAchievements();
    newly.forEach((a) => {
      toast.success(`🏆 شارة جديدة: ${a.name}`);
      addNotification({ type: "achievement", title: "تهانينا! حصلت على شارة جديدة",
        description: `شارة: ${a.name} — ${a.desc}`, link: "/achievements" });
    });
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Confetti trigger={confettiKey} />

      {/* Header */}
      <div className="relative overflow-hidden border-b border-border"
        style={{ background: "linear-gradient(135deg,#4A3F9F 0%,#6C5CE7 60%,#00D2D3 130%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-sm mb-4">
            <ArrowRight className="w-4 h-4" /> العودة للوحة التحكم
          </Link>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">💻 الحاسوب والأنظمة</h1>
          <p className="text-white/85 mt-2 max-w-2xl text-sm sm:text-base">
            من الصفر إلى الأدمن — تعلم مكونات الحاسوب، أنظمة التشغيل، الشبكات، والإدارة المتقدمة.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { v: "33 درس" }, { v: "4 وحدات" }, { v: "12 ساعة" }, { v: "4 اختبارات" },
            ].map((s, i) => (
              <div key={i} className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold border border-white/20">
                {s.v}
              </div>
            ))}
          </div>
          <div className="mt-5 max-w-xl">
            <div className="flex justify-between text-xs text-white/80 mb-1">
              <span>تقدمك في القسم</span>
              <span>{progressPct}% ({doneCount}/{totalLessons})</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          {currentLesson ? (
            <LessonView
              lesson={currentLesson}
              completed={completed.has(currentLesson.id)}
              onClose={() => navigate({ search: {} })}
              onComplete={() => handleComplete(currentLesson)}
              onNavigate={(id) => navigate({ search: { lesson: id } })}
            />
          ) : (
            <div className="space-y-3 animate-fade-in">
              {MODULES.map((m) => {
                const unlocked = isModuleUnlocked(m.id);
                const lessons = COMPUTER_LESSONS.filter((l) => l.module === m.id);
                const mDone = lessons.filter((l) => completed.has(l.id)).length;
                const open = openModule === m.id;
                return (
                  <div key={m.id} className={`rounded-2xl border ${open ? "border-primary/40" : "border-border"} bg-card overflow-hidden transition-all`}>
                    <button
                      onClick={() => unlocked ? setOpenModule(open ? -1 : m.id) :
                        toast.error("أكمل 80% من الوحدة السابقة لفتح هذه الوحدة")}
                      className="w-full p-4 flex items-center gap-3 text-right hover:bg-accent/30 transition-colors"
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-extrabold text-white shrink-0 ${unlocked ? "" : "opacity-40"}`}
                        style={{ background: "var(--gradient-primary)" }}>
                        {unlocked ? m.id : <Lock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-foreground">الوحدة {m.id}: {m.name}</h3>
                          <span className="text-xs text-muted-foreground">({lessons.length} دروس · {mDone} مكتمل)</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && unlocked && (
                      <div className="border-t border-border divide-y divide-border animate-ilearn-slide-up">
                        {lessons.map((l) => {
                          const done = completed.has(l.id);
                          const meta = TYPE_META[l.type];
                          return (
                            <div key={l.id} className="p-3 sm:p-4 flex items-center gap-3 hover:bg-accent/30 transition-colors">
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${done ? "bg-success/20 text-success" : "bg-primary/15 text-primary"}`}>
                                {done ? <CheckCircle2 className="w-4 h-4" /> : l.id}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-foreground text-sm truncate">{l.title}</div>
                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {l.duration}</span>
                                  <span className={meta.color}>{meta.icon} {meta.label}</span>
                                  <span className="text-warning font-bold">+{l.xp} XP</span>
                                </div>
                              </div>
                              <button
                                onClick={() => navigate({ search: { lesson: l.id } })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${done ? "bg-muted text-muted-foreground hover:bg-muted/80" : "text-white hover:scale-105"}`}
                                style={done ? undefined : { background: "var(--gradient-primary)" }}
                              >
                                {done ? "مراجعة" : "ابدأ"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky Sidebar */}
        <aside className="lg:sticky lg:top-4 self-start space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground mb-1">التقدم الإجمالي</div>
            <div className="text-2xl font-extrabold text-foreground mb-2">{progressPct}%</div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%`, background: "var(--gradient-primary)" }} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              <div className="p-2 rounded-lg bg-accent/40">
                <div className="text-muted-foreground">XP</div>
                <div className="font-extrabold text-foreground">{earnedXP} / {totalXP}</div>
              </div>
              <div className="p-2 rounded-lg bg-accent/40">
                <div className="text-muted-foreground">الوقت المتبقي</div>
                <div className="font-extrabold text-foreground">~{Math.round(remainingMin / 60)} ساعة</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> الوحدات
            </div>
            <ul className="space-y-2">
              {MODULES.map((m) => {
                const lessons = COMPUTER_LESSONS.filter((l) => l.module === m.id);
                const mDone = lessons.filter((l) => completed.has(l.id)).length;
                const unlocked = isModuleUnlocked(m.id);
                return (
                  <li key={m.id}>
                    <button onClick={() => { setOpenModule(m.id); navigate({ search: {} }); }}
                      className={`w-full text-right flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors ${!unlocked ? "opacity-50" : ""}`}>
                      {unlocked ? <Circle className="w-3 h-3 text-primary" /> : <Lock className="w-3 h-3" />}
                      <span className="flex-1 text-xs font-medium text-foreground truncate">{m.name}</span>
                      <span className="text-[10px] text-muted-foreground">{mDone}/{lessons.length}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <Link to="/achievements" className="block rounded-2xl border border-border bg-card p-4 hover:bg-accent/30 transition-colors">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Trophy className="w-4 h-4 text-warning" /> الإنجازات
            </div>
            <p className="text-xs text-muted-foreground mt-1">تابع شاراتك المكتسبة</p>
          </Link>
        </aside>
      </div>
    </div>
  );
}

// ============ LESSON VIEW ============
function LessonView({
  lesson, completed, onClose, onComplete, onNavigate,
}: {
  lesson: CLesson; completed: boolean;
  onClose: () => void; onComplete: () => void;
  onNavigate: (id: number) => void;
}) {
  const [note, setNote] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const notes = getNotes();
    setNote(notes[lesson.id] ?? "");
    setAnswers({});
    setShowResult(false);
  }, [lesson.id]);

  const saveNote = () => {
    const all = getNotes();
    all[lesson.id] = note;
    setNotes(all);
    toast.success("📝 تم حفظ الملاحظة");
  };

  const allLessons = COMPUTER_LESSONS;
  const idx = allLessons.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? allLessons[idx - 1] : null;
  const next = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
  const related = allLessons.filter((l) => l.module === lesson.module && l.id !== lesson.id).slice(0, 4);

  const score = lesson.quiz.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0);
  const allAnswered = Object.keys(answers).length === lesson.quiz.length;
  const meta = TYPE_META[lesson.type];

  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={onClose} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="w-4 h-4" /> العودة لقائمة الدروس
      </button>

      {/* Video placeholder */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer group"
        style={{ background: "linear-gradient(135deg,#4A3F9F,#6C5CE7,#00D2D3)" }}>
        <button className="h-20 w-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
          <Play className="w-8 h-8 text-primary fill-current ms-1" />
        </button>
        <div className="absolute bottom-3 inset-x-3 text-white text-xs bg-black/30 backdrop-blur px-3 py-1.5 rounded-lg text-center">
          الفيديو قريباً — اقرأ المحتوى التعليمي بالأسفل
        </div>
      </div>

      {/* Title + meta */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-xs flex-wrap mb-2">
          <span className={`flex items-center gap-1 ${meta.color}`}>{meta.icon} {meta.label}</span>
          <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" /> {lesson.duration}</span>
          <span className="text-warning font-bold">+{lesson.xp} XP</span>
          {completed && <span className="px-2 py-0.5 rounded-full bg-success/15 text-success font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> مكتمل</span>}
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mb-3">{lesson.title}</h1>
        <div className="text-sm text-foreground/90 leading-loose whitespace-pre-line">{lesson.content}</div>

        {lesson.code && (
          <pre className="mt-4 p-4 rounded-xl bg-slate-950 text-slate-100 text-xs overflow-x-auto font-mono leading-relaxed" dir="ltr">
            <code>{lesson.code}</code>
          </pre>
        )}
      </div>

      {/* Notes */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> ملاحظاتك
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="اكتب ملاحظاتك هنا..."
          className="w-full min-h-[100px] p-3 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
        <button onClick={saveNote}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90">
          <Save className="w-3.5 h-3.5" /> حفظ الملاحظة
        </button>
      </div>

      {/* Quiz */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" /> اختبار سريع
        </div>
        <div className="space-y-4">
          {lesson.quiz.map((q, i) => (
            <div key={i}>
              <div className="text-sm font-bold text-foreground mb-2">{i + 1}. {q.question}</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {q.options.map((opt, oi) => {
                  const picked = answers[i] === oi;
                  const correct = showResult && oi === q.correct;
                  const wrong = showResult && picked && oi !== q.correct;
                  return (
                    <button key={oi} disabled={showResult}
                      onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                      className={`text-right text-xs sm:text-sm p-2.5 rounded-lg border transition-all ${
                        correct ? "bg-success/15 border-success text-success font-bold" :
                        wrong ? "bg-destructive/15 border-destructive text-destructive" :
                        picked ? "bg-primary/15 border-primary text-foreground" :
                        "bg-accent/30 border-border text-foreground hover:bg-accent"}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {!showResult ? (
          <button onClick={() => setShowResult(true)} disabled={!allAnswered}
            className="mt-4 w-full h-10 rounded-xl text-white font-bold text-sm disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}>
            تصحيح الإجابات
          </button>
        ) : (
          <div className="mt-4 p-3 rounded-xl bg-accent/40 text-center text-sm font-bold text-foreground">
            النتيجة: {score} / {lesson.quiz.length} — {score === lesson.quiz.length ? "🎉 ممتاز!" : "💪 راجع المحتوى وحاول مجدداً"}
          </div>
        )}
      </div>

      {/* Complete + navigation */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <button onClick={onComplete} disabled={completed}
          className="w-full h-12 rounded-xl text-white font-bold disabled:opacity-60"
          style={{ background: "var(--gradient-primary)" }}>
          {completed ? "✅ تم إكمال الدرس" : `إكمال الدرس (+${lesson.xp} XP)`}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => prev && onNavigate(prev.id)} disabled={!prev}
            className="h-10 rounded-xl bg-accent text-foreground text-xs font-bold hover:bg-accent/70 disabled:opacity-40 inline-flex items-center justify-center gap-1">
            <ArrowRight className="w-4 h-4" /> السابق
          </button>
          <button onClick={() => next && onNavigate(next.id)} disabled={!next}
            className="h-10 rounded-xl bg-accent text-foreground text-xs font-bold hover:bg-accent/70 disabled:opacity-40 inline-flex items-center justify-center gap-1">
            التالي <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="font-bold text-sm text-foreground mb-3">دروس ذات صلة</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {related.map((r) => (
              <button key={r.id} onClick={() => onNavigate(r.id)}
                className="text-right p-3 rounded-xl bg-accent/30 hover:bg-accent transition-colors">
                <div className="text-sm font-bold text-foreground truncate">{r.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{r.duration} · +{r.xp} XP</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}