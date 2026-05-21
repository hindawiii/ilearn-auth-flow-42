import { Monitor, Smartphone, Code2, Camera, Brain, Wrench } from "lucide-react";
import type { ComponentType } from "react";

export type Level = "beginner" | "intermediate" | "advanced";

export type LessonData = {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  level: Level;
  thumb: string; // gradient css
  resources?: { label: string; url: string }[];
  quiz: { q: string; options: string[]; answer: number }[];
};

export type SectionData = {
  id: string;
  name: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bgClass: string;
  status: "active" | "new" | "locked";
  lessons: LessonData[];
};

const sampleQuiz = (topic: string) => [
  {
    q: `ما هو الهدف الرئيسي من ${topic}؟`,
    options: ["تحسين المظهر فقط", "فهم الأساسيات وتطبيقها", "حذف الملفات", "لا شيء مما سبق"],
    answer: 1,
  },
  {
    q: "أيٌّ من التالي يُعتبر ممارسة جيدة؟",
    options: ["تجاهل التعليمات", "التطبيق العملي المستمر", "النسخ دون فهم", "الإسراع دون مراجعة"],
    answer: 1,
  },
  {
    q: "ما الخطوة الأولى عند مواجهة مشكلة؟",
    options: ["إعادة التشغيل عشوائياً", "تحديد المشكلة بدقة", "حذف كل شيء", "تجاهلها"],
    answer: 1,
  },
];

const grads = [
  "linear-gradient(135deg,#4A3F9F,#6C5CE7)",
  "linear-gradient(135deg,#008B8B,#00D2D3)",
  "linear-gradient(135deg,#C75B39,#E17055)",
  "linear-gradient(135deg,#008B6B,#00B894)",
  "linear-gradient(135deg,#6C5CE7,#00D2D3)",
];

function makeLessons(prefix: string, titles: { t: string; d: string; level: Level; min: number }[]): LessonData[] {
  return titles.map((x, i) => ({
    id: `${prefix}-${i + 1}`,
    title: x.t,
    description: x.d,
    duration: x.min,
    level: x.level,
    thumb: grads[i % grads.length],
    resources: [
      { label: "ملف PDF للدرس", url: "#" },
      { label: "تمارين إضافية", url: "#" },
    ],
    quiz: sampleQuiz(x.t),
  }));
}

export const SECTIONS: SectionData[] = [
  {
    id: "computer",
    name: "الحاسوب",
    desc: "كل ما يخص أجهزة الحاسوب وأنظمة التشغيل",
    icon: Monitor,
    color: "#6C5CE7",
    bgClass: "from-[#4A3F9F] to-[#6C5CE7]",
    status: "active",
    lessons: makeLessons("computer", [
      { t: "مقدمة في الحاسوب", d: "تعرّف على مكونات الحاسوب الأساسية ووظائفها.", level: "beginner", min: 15 },
      { t: "أساسيات نظام Windows", d: "تعلم التعامل مع نظام التشغيل Windows بكفاءة.", level: "beginner", min: 25 },
      { t: "موجّه الأوامر CMD", d: "أوامر سطر الأوامر الأساسية والمتقدمة.", level: "intermediate", min: 30 },
      { t: "إدارة الملفات والمجلدات", d: "تنظيم الملفات بطريقة احترافية.", level: "intermediate", min: 20 },
      { t: "حل مشاكل الحاسوب", d: "تشخيص وإصلاح الأعطال الشائعة.", level: "advanced", min: 40 },
    ]),
  },
  {
    id: "phones",
    name: "الهواتف",
    desc: "صيانة وبرمجة وتطبيقات الهواتف الذكية",
    icon: Smartphone,
    color: "#00D2D3",
    bgClass: "from-[#008B8B] to-[#00D2D3]",
    status: "active",
    lessons: makeLessons("phones", [
      { t: "أنواع الهواتف الذكية", d: "الفرق بين أندرويد وiOS.", level: "beginner", min: 12 },
      { t: "إعدادات الهاتف الأساسية", d: "تخصيص الهاتف لاحتياجاتك.", level: "beginner", min: 18 },
      { t: "حماية الهاتف من الاختراق", d: "أفضل الممارسات الأمنية.", level: "intermediate", min: 25 },
      { t: "صيانة بطارية الهاتف", d: "إطالة عمر البطارية.", level: "advanced", min: 30 },
    ]),
  },
  {
    id: "programming",
    name: "البرمجة",
    desc: "تعلم لغات البرمجة من الصفر إلى الاحتراف",
    icon: Code2,
    color: "#E17055",
    bgClass: "from-[#C75B39] to-[#E17055]",
    status: "active",
    lessons: makeLessons("programming", [
      { t: "ما هي البرمجة؟", d: "مدخل إلى عالم البرمجة وتطبيقاتها.", level: "beginner", min: 20 },
      { t: "متغيرات وأنواع البيانات", d: "أساسيات تخزين البيانات.", level: "beginner", min: 25 },
      { t: "الجمل الشرطية والحلقات", d: "التحكم في تدفق البرنامج.", level: "intermediate", min: 30 },
      { t: "الدوال (Functions)", d: "إعادة استخدام الكود بفاعلية.", level: "intermediate", min: 28 },
      { t: "البرمجة كائنية التوجه", d: "مفاهيم OOP المتقدمة.", level: "advanced", min: 45 },
    ]),
  },
  {
    id: "photography",
    name: "التصوير",
    desc: "فن التصوير الفوتوغرافي وتحرير الصور",
    icon: Camera,
    color: "#00B894",
    bgClass: "from-[#008B6B] to-[#00B894]",
    status: "active",
    lessons: makeLessons("photography", [
      { t: "أساسيات التصوير", d: "قواعد التكوين الفني.", level: "beginner", min: 22 },
      { t: "الإضاءة في التصوير", d: "كيف تستخدم الضوء لصورة مثالية.", level: "intermediate", min: 28 },
      { t: "تحرير الصور", d: "أدوات وتقنيات التحرير الاحترافي.", level: "advanced", min: 35 },
    ]),
  },
  {
    id: "ai",
    name: "الذكاء الاصطناعي",
    desc: "استكشف عالم AI وتعلم الآلة",
    icon: Brain,
    color: "#6C5CE7",
    bgClass: "from-[#4A3F9F] to-[#008B8B]",
    status: "new",
    lessons: makeLessons("ai", [
      { t: "ما هو الذكاء الاصطناعي؟", d: "مفاهيم AI الأساسية.", level: "beginner", min: 18 },
      { t: "تعلم الآلة Machine Learning", d: "أنواع التعلم وتطبيقاته.", level: "intermediate", min: 35 },
      { t: "الشبكات العصبية", d: "بنية الشبكات وكيفية عملها.", level: "advanced", min: 50 },
    ]),
  },
  {
    id: "maintenance",
    name: "الصيانة",
    desc: "صيانة الأجهزة الإلكترونية المتقدمة",
    icon: Wrench,
    color: "#E84393",
    bgClass: "from-[#C0396B] to-[#E84393]",
    status: "locked",
    lessons: [],
  },
];

export function getSection(id: string): SectionData | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function findLesson(lessonId: string): { section: SectionData; lesson: LessonData; index: number } | undefined {
  for (const s of SECTIONS) {
    const idx = s.lessons.findIndex((l) => l.id === lessonId);
    if (idx >= 0) return { section: s, lesson: s.lessons[idx], index: idx };
  }
  return undefined;
}

// ===== Progress (localStorage) =====
const DONE_KEY = "ilearn-completed-lessons";

export function getCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(DONE_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function markCompleted(lessonId: string) {
  const set = getCompleted();
  set.add(lessonId);
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify(Array.from(set)));
  } catch { /* ignore */ }
}

export function isCompleted(lessonId: string): boolean {
  return getCompleted().has(lessonId);
}

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

export const LEVEL_COLOR: Record<Level, string> = {
  beginner: "bg-success/15 text-success",
  intermediate: "bg-warning/15 text-warning",
  advanced: "bg-destructive/15 text-destructive",
};