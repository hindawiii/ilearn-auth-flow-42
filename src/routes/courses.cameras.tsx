import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowLeft, Play, FileText, Lock, CheckCircle2, Circle,
  ChevronDown, Clock, Save, Trophy, BookOpen, Camera as CameraIcon,
  Copy, X as XIcon, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Confetti } from "@/components/Confetti";
import { checkAchievements } from "@/lib/achievements";
import { addNotification } from "@/lib/notifications";

// ============ TYPES ============
type LessonType = "video" | "article" | "practical" | "editing";
type QuizQ = { question: string; options: string[]; correct: number };
type SettingsRow = { scene: string; iso: string; shutter: string; aperture: string; focal: string };
type GalleryImg = { caption: string; gradient: string; beforeAfter?: boolean };
type AITool = { name: string; url: string; description: string };
type CLesson = {
  id: number;
  module: 1 | 2 | 3 | 4;
  title: string;
  duration: string;
  type: LessonType;
  xp: number;
  content: string;
  images?: GalleryImg[];
  settings?: { title: string; rows: SettingsRow[] };
  software?: string[];
  aiTools?: AITool[];
  quiz: QuizQ[];
};

// ============ HELPERS ============
const dq = (topic: string): QuizQ[] => [
  { question: `ما الأهم عند تعلم "${topic}"؟`,
    options: ["السرعة بدون فهم", "التطبيق العملي + الفهم", "النسخ فقط", "تجاهل التفاصيل"], correct: 1 },
  { question: "ما القاعدة الأشهر في تكوين الصورة؟",
    options: ["قاعدة الثلث", "قاعدة العشر", "قاعدة المنتصف", "لا توجد قواعد"], correct: 0 },
  { question: "أفضل تصرف قبل التصوير؟",
    options: ["الإسراع", "ضبط الإعدادات ومراجعة المشهد", "تجاهل الإضاءة", "التصوير عشوائياً"], correct: 1 },
];

const rc = (intro: string, points: string[]) =>
  `${intro}\n\n` + points.map((p, i) => `${i + 1}. ${p}`).join("\n") +
  `\n\nنصيحة: التصوير مهارة تُصقل بالممارسة — التقط يومياً، حلّل صورك، وادرس أعمال المحترفين.`;

const grads = [
  "linear-gradient(135deg,#008B6B,#00B894)",
  "linear-gradient(135deg,#00B894,#00D2D3)",
  "linear-gradient(135deg,#0F2027,#2C5364)",
  "linear-gradient(135deg,#F2994A,#F2C94C)",
  "linear-gradient(135deg,#6C5CE7,#00D2D3)",
  "linear-gradient(135deg,#C0392B,#8E44AD)",
];
const img = (caption: string, i: number, beforeAfter = false): GalleryImg =>
  ({ caption, gradient: grads[i % grads.length], beforeAfter });

// ============ DATA ============
export const CAMERAS_LESSONS: CLesson[] = [
  // ===== Module 1: أساسيات التصوير =====
  { id: 1, module: 1, title: "مقدمة في التصوير الرقمي", duration: "15 دقيقة", type: "video", xp: 50,
    content: rc("التصوير الرقمي يعتمد على مستشعر إلكتروني يحوّل الضوء الساقط إلى بيانات رقمية. فهم بنية الكاميرا الأساسية يساعدك في اتخاذ قرارات أفضل.",
      ["Sensor: قلب الكاميرا، الأحجام: Full Frame / APS-C / Micro 4/3",
       "Megapixel: عدد البكسلات — أكثر ≠ دائماً أفضل",
       "RAW: ملف خام يحتفظ بكل البيانات، مرن في التحرير",
       "JPEG: ملف مضغوط جاهز للاستخدام، يفقد بعض البيانات"]),
    images: [img("مخطط مستشعر الكاميرا", 0), img("مقارنة RAW vs JPEG", 1, true)],
    quiz: [
      { question: "ما الفرق بين RAW و JPEG؟", options: ["لا فرق", "RAW يحتفظ بكل البيانات", "JPEG أفضل جودة دائماً", "RAW أصغر حجماً"], correct: 1 },
      { question: "ما وحدة قياس دقة الكاميرا؟", options: ["Hz", "Megapixel", "GB", "DPI"], correct: 1 },
      { question: "أي مستشعر أكبر مساحة؟", options: ["Micro 4/3", "APS-C", "Full Frame", "1 inch"], correct: 2 },
    ] },
  { id: 2, module: 1, title: "فهم التعريض (Exposure Triangle)", duration: "20 دقيقة", type: "article", xp: 50,
    content: rc("مثلث التعريض يجمع ثلاثة عناصر: ISO، Shutter Speed، Aperture. تغيير أي منها يؤثر على السطوع وعلى مظهر الصورة.",
      ["ISO: حساسية المستشعر — كلما زاد، زاد التشويش",
       "Shutter Speed: مدة فتح الغالق — أبطأ = حركة ضبابية",
       "Aperture (f/): حجم الفتحة — أصغر رقم = عمق ميدان قليل",
       "تذكّر: أي تغيير في عنصر يحتاج تعويض في عنصر آخر"]),
    images: [img("مثلث التعريض", 2), img("أمثلة ISO مختلفة", 3), img("سرعات الغالق", 4)],
    settings: { title: "إعدادات التمرين لمشاهد مختلفة", rows: [
      { scene: "يوم مشمس", iso: "100", shutter: "1/500", aperture: "f/8", focal: "35mm" },
      { scene: "غروب الشمس", iso: "400", shutter: "1/125", aperture: "f/5.6", focal: "50mm" },
      { scene: "ليلاً بدون تريبود", iso: "3200", shutter: "1/30", aperture: "f/2.8", focal: "24mm" },
    ] },
    quiz: dq("التعريض") },
  { id: 3, module: 1, title: "أوضاع الكاميرا (Auto/Manual/A/S)", duration: "14 دقيقة", type: "article", xp: 40,
    content: rc("كل وضع له استخدامه — معرفة متى تستخدم كلاً منهم يميّز المحترف.",
      ["Auto: الكاميرا تختار كل شيء — للمبتدئين",
       "Aperture Priority (A/Av): تختار الفتحة والكاميرا تكمل الباقي",
       "Shutter Priority (S/Tv): تختار سرعة الغالق — للحركة",
       "Manual (M): تحكم كامل — للاحتراف"]),
    images: [img("قرص أوضاع الكاميرا", 5)],
    quiz: dq("أوضاع الكاميرا") },
  { id: 4, module: 1, title: "التركيز البؤري (Auto/Manual Focus)", duration: "12 دقيقة", type: "video", xp: 40,
    content: rc("صورة غير مركّزة = صورة فاشلة. اختيار نظام التركيز المناسب أهم من جودة الكاميرا.",
      ["AF-S (Single): للأهداف الثابتة",
       "AF-C (Continuous): للأهداف المتحركة",
       "Manual Focus: للماكرو والمشاهد الصعبة",
       "Focus Points: قلّل عددها للتركيز الدقيق"]),
    images: [img("شاشة التركيز", 0), img("Focus Points", 1)],
    quiz: dq("التركيز") },
  { id: 5, module: 1, title: "التكوين: قاعدة الثلث والخطوط", duration: "18 دقيقة", type: "article", xp: 60,
    content: rc("التكوين فن ترتيب العناصر داخل الإطار. قواعد بسيطة ترفع جودة صورك فوراً.",
      ["Rule of Thirds: قسّم الإطار 3×3 وضع الموضوع على التقاطعات",
       "Leading Lines: خطوط تقود عين المشاهد",
       "Symmetry: التماثل يخلق توازناً",
       "Negative Space: الفراغ يبرز الموضوع"]),
    images: [img("قاعدة الثلث", 2), img("Leading Lines", 3), img("Symmetry", 4)],
    quiz: dq("التكوين") },
  { id: 6, module: 1, title: "التصوير في الإضاءة المنخفضة", duration: "20 دقيقة", type: "practical", xp: 70,
    content: rc("التصوير ليلاً يتطلب فهماً عميقاً للتعريض ومعدات داعمة.",
      ["استخدم Tripod لتجنب الاهتزاز",
       "افتح Aperture لأقصى ما يمكن (f/1.8-f/2.8)",
       "ارفع ISO بحذر (1600-6400)",
       "صوّر بصيغة RAW دائماً"]),
    images: [img("صورة ليلية", 5), img("شارع ليلاً", 0, true)],
    settings: { title: "إعدادات Low Light", rows: [
      { scene: "شارع مضاء", iso: "1600", shutter: "1/60", aperture: "f/2.8", focal: "35mm" },
      { scene: "نجوم بدون قمر", iso: "3200", shutter: "20s", aperture: "f/2.8", focal: "14mm" },
      { scene: "حفلة داخلية", iso: "6400", shutter: "1/125", aperture: "f/1.8", focal: "50mm" },
    ] },
    quiz: dq("الإضاءة المنخفضة") },
  { id: 7, module: 1, title: "التصوير الرياضي والحركة", duration: "16 دقيقة", type: "practical", xp: 60,
    content: rc("تجميد الحركة يحتاج سرعة غالق عالية وعدسة مناسبة.",
      ["استخدم سرعة غالق ≥ 1/1000 لتجميد الحركة",
       "AF-C + Burst Mode لمتابعة الحركة",
       "Panning: حرّك الكاميرا مع الموضوع لخلفية ضبابية فنية",
       "العدسات المقربة (70-200mm) ضرورية"]),
    images: [img("لاعب كرة قدم", 1), img("Panning Effect", 2)],
    settings: { title: "إعدادات الحركة", rows: [
      { scene: "كرة قدم نهاراً", iso: "400", shutter: "1/2000", aperture: "f/4", focal: "200mm" },
      { scene: "سيارة سريعة (Panning)", iso: "100", shutter: "1/60", aperture: "f/11", focal: "85mm" },
      { scene: "طيور طائرة", iso: "800", shutter: "1/2500", aperture: "f/5.6", focal: "300mm" },
    ] },
    quiz: dq("التصوير الرياضي") },
  { id: 8, module: 1, title: "تصوير البورتريه", duration: "22 دقيقة", type: "practical", xp: 70,
    content: rc("البورتريه يحتاج تواصلاً مع الموديل وفهماً للإضاءة والعمق.",
      ["استخدم Aperture واسع (f/1.8-f/2.8) لخلفية ضبابية",
       "Focal Length 85mm-135mm مثالي للوجوه",
       "ضع التركيز على العين دائماً",
       "إضاءة جانبية ناعمة تبرز الملامح"]),
    images: [img("بورتريه طبيعي", 3, true), img("Bokeh جميل", 4), img("إضاءة Rembrandt", 5)],
    settings: { title: "إعدادات البورتريه", rows: [
      { scene: "خارجي نهاراً", iso: "100", shutter: "1/250", aperture: "f/2.0", focal: "85mm" },
      { scene: "استوديو بإضاءة", iso: "200", shutter: "1/200", aperture: "f/5.6", focal: "85mm" },
      { scene: "Golden Hour", iso: "400", shutter: "1/500", aperture: "f/1.8", focal: "135mm" },
    ] },
    quiz: dq("البورتريه") },

  // ===== Module 2: الكاميرات والمعدات =====
  { id: 9, module: 2, title: "أنواع الكاميرات (DSLR/Mirrorless)", duration: "18 دقيقة", type: "article", xp: 50,
    content: rc("اختيار الكاميرا يعتمد على ميزانيتك ونوع تصويرك.",
      ["DSLR: عدسات متنوعة، بطارية أطول، أكبر حجماً",
       "Mirrorless: أخف، EVF يعرض النتيجة قبل التصوير، مستقبل التصوير",
       "Compact: للسفر والاستخدام اليومي",
       "Action Cam: للرياضة والسفر المغامر"]),
    images: [img("DSLR vs Mirrorless", 0)],
    quiz: dq("أنواع الكاميرات") },
  { id: 10, module: 2, title: "اختيار العدسة المناسبة", duration: "20 دقيقة", type: "article", xp: 60,
    content: rc("العدسة أهم من جسم الكاميرا — استثمر فيها بحكمة.",
      ["Prime: ثابتة، جودة أعلى، أرخص (50mm f/1.8)",
       "Zoom: مرنة (24-70mm) لكن أغلى وأثقل",
       "Wide (14-35mm): للمناظر والعمارة",
       "Telephoto (70-200mm+): للرياضة والحياة البرية"]),
    images: [img("مجموعة عدسات", 1), img("Prime vs Zoom", 2)],
    quiz: dq("العدسات") },
  { id: 11, module: 2, title: "معدات أساسية (Tripod/Gimbal)", duration: "15 دقيقة", type: "article", xp: 50,
    content: rc("المعدات الجيدة لا تصنع المصور، لكنها تفتح إمكانيات جديدة.",
      ["Tripod: ضروري للتعريض الطويل والفيديو",
       "Gimbal: استقرار للفيديو أثناء الحركة",
       "Flash خارجي: تحكم احترافي في الإضاءة",
       "بطاريات إضافية + بطاقات ذاكرة سريعة"]),
    images: [img("Tripod احترافي", 3)],
    quiz: dq("المعدات") },
  { id: 12, module: 2, title: "كاميرا الهاتف: Pro Mode", duration: "14 دقيقة", type: "practical", xp: 50,
    content: rc("كاميرات الهواتف الحديثة تنافس DSLR — إذا عرفت كيف تستخدمها.",
      ["فعّل Pro Mode للتحكم اليدوي",
       "صوّر بـ RAW (DNG) إن كان متاحاً",
       "استخدم Gridlines لتطبيق قاعدة الثلث",
       "نظّف العدسة قبل كل جلسة!"]),
    settings: { title: "Pro Mode على الهاتف", rows: [
      { scene: "بورتريه نهاراً", iso: "50", shutter: "1/250", aperture: "—", focal: "26mm" },
      { scene: "Long Exposure مياه", iso: "50", shutter: "2s", aperture: "—", focal: "26mm" },
      { scene: "نجوم/ليلي", iso: "1600", shutter: "10s", aperture: "—", focal: "13mm" },
    ] },
    quiz: dq("Pro Mode") },
  { id: 13, module: 2, title: "GoPro vs DJI Action vs Insta360", duration: "16 دقيقة", type: "article", xp: 50,
    content: rc("Action Cameras صغيرة لكن قوية — كل علامة تجارية لها مميزاتها.",
      ["GoPro: المعيار، أفضل تطبيق، 5.3K@60fps",
       "DJI Action: شاشة أمامية، Mic أفضل",
       "Insta360: تصوير 360° وإعادة تأطير بالـ AI",
       "اختر حسب: السعر، نوع الرياضة، التحرير المطلوب"]),
    images: [img("Action Cameras", 4)],
    quiz: dq("Action Cameras") },

  // ===== Module 3: المونتاج والإنتاج =====
  { id: 14, module: 3, title: "مقدمة في المونتاج", duration: "25 دقيقة", type: "video", xp: 75,
    content: rc("المونتاج فن سرد القصة عبر تجميع اللقطات وإضافة الإيقاع والمشاعر.",
      ["Premiere Pro: المعيار الصناعي، اشتراك Adobe",
       "DaVinci Resolve: مجاني، أقوى في تصحيح الألوان",
       "CapCut: مجاني وسهل، مثالي للمحتوى السريع",
       "Final Cut Pro: للـ Mac فقط، أداء ممتاز"]),
    images: [img("واجهة Premiere Pro", 5), img("DaVinci Resolve", 0)],
    software: ["Adobe Premiere Pro", "DaVinci Resolve", "CapCut", "Final Cut Pro"],
    quiz: dq("المونتاج") },
  { id: 15, module: 3, title: "تقطيع وتجميع اللقطات", duration: "20 دقيقة", type: "editing", xp: 60,
    content: rc("اللقطة الجيدة تختار، السيئة تُحذف — لا ترحم في القص.",
      ["Cut on Action: قطّع أثناء الحركة",
       "J-Cut & L-Cut: تداخل الصوت لانتقال سلس",
       "Match Cut: اربط مشهدين متشابهين بصرياً",
       "Avoid Jump Cuts إلا للأسلوب المتعمّد"]),
    images: [img("Timeline", 1), img("Cuts Diagram", 2)],
    quiz: dq("التقطيع") },
  { id: 16, module: 3, title: "تصحيح الألوان (Color Grading)", duration: "22 دقيقة", type: "editing", xp: 75,
    content: rc("الألوان تخلق المزاج — الـ Color Grading يحوّل الفيديو العادي إلى سينمائي.",
      ["Color Correction: تصحيح Exposure & White Balance أولاً",
       "Color Grading: إضافة الطابع الفني (Teal & Orange)",
       "LUTs: فلاتر جاهزة توفر وقتاً",
       "Scopes (Waveform/Vectorscope) أدق من العين"]),
    images: [img("قبل التصحيح", 3, true), img("بعد التصحيح", 4)],
    quiz: dq("Color Grading") },
  { id: 17, module: 3, title: "النصوص والرسوم المتحركة", duration: "18 دقيقة", type: "editing", xp: 60,
    content: rc("Motion Graphics ترفع جودة الفيديو وتوصل المعلومة بصرياً.",
      ["Essential Graphics في Premiere للنصوص السريعة",
       "After Effects للرسوم المعقدة",
       "Keyframes: نقاط زمنية للتحريك",
       "Easing: حركة طبيعية بدلاً من خطية"]),
    images: [img("Motion Title", 5)],
    software: ["Adobe After Effects", "Premiere Pro"],
    quiz: dq("Motion Graphics") },
  { id: 18, module: 3, title: "المؤثرات الصوتية والموسيقى", duration: "16 دقيقة", type: "editing", xp: 50,
    content: rc("الصوت = نصف الفيديو. الجمهور يحتمل صورة سيئة لكن ليس صوتاً سيئاً.",
      ["وازن مستويات الحوار حول -12dB",
       "موسيقى خلفية: -25dB إلى -30dB",
       "أضف SFX (Whoosh, Click) للانتقالات",
       "مصادر مجانية: YouTube Audio Library, Pixabay"]),
    images: [img("Audio Mixer", 0)],
    quiz: dq("الصوت") },
  { id: 19, module: 3, title: "تصدير الفيديو بجودة عالية", duration: "12 دقيقة", type: "practical", xp: 50,
    content: rc("التصدير الخاطئ يدمر ساعات من العمل — اعرف الإعدادات المناسبة.",
      ["H.264 MP4: الأكثر توافقاً",
       "Bitrate: 8-12 Mbps لـ 1080p، 35-45 لـ 4K",
       "Frame Rate: نفس المصدر دائماً (24/30/60)",
       "YouTube: 1080p@8Mbps، Instagram: 1:1 أو 9:16"]),
    images: [img("نافذة التصدير", 1)],
    quiz: dq("التصدير") },
  { id: 20, module: 3, title: "محتوى YouTube/TikTok/Reels", duration: "20 دقيقة", type: "article", xp: 70,
    content: rc("كل منصة لها قواعدها — لا يمكنك نشر نفس الفيديو في كل مكان.",
      ["YouTube: 16:9، طويل، Hook في أول 10 ثوان",
       "TikTok: 9:16، 15-60 ثانية، نص على الشاشة",
       "Reels: 9:16، 30-90 ثانية، تأثيرات Instagram",
       "Shorts: نسخة YouTube من TikTok، 60s كحد أقصى"]),
    images: [img("نسب الشاشة المختلفة", 2)],
    quiz: dq("منصات المحتوى") },

  // ===== Module 4: الذكاء الاصطناعي في التصوير =====
  { id: 21, module: 4, title: "أدوات AI لتحسين الصور", duration: "18 دقيقة", type: "article", xp: 60,
    content: rc("الذكاء الاصطناعي يستخرج تفاصيل من صور قديمة أو منخفضة الدقة.",
      ["Topaz Gigapixel: تكبير 6x بدون فقدان",
       "Adobe Super Resolution: داخل Camera Raw",
       "Topaz DeNoise AI: يزيل التشويش الذكي",
       "Topaz Sharpen AI: استرجاع الحدّة"]),
    images: [img("قبل/بعد Gigapixel", 3, true)],
    aiTools: [
      { name: "Topaz Photo AI", url: "topazlabs.com", description: "تحسين شامل (تكبير + إزالة تشويش + حدة)" },
      { name: "Adobe Super Resolution", url: "adobe.com", description: "مدمج في Camera Raw، مجاني مع Lightroom" },
    ],
    quiz: dq("تحسين AI") },
  { id: 22, module: 4, title: "إزالة الخلفية بالذكاء الاصطناعي", duration: "12 دقيقة", type: "practical", xp: 50,
    content: rc("ما كان يحتاج ساعات في Photoshop أصبح ثواني مع AI.",
      ["Remove.bg: مجاني للويب، نتائج فورية",
       "Adobe Express: مع باقي أدوات Adobe",
       "Photoshop Select Subject: مدمج وذكي",
       "Canva BG Remover: للتصميم السريع"]),
    images: [img("قبل الإزالة", 4, true), img("بعد الإزالة", 5)],
    aiTools: [
      { name: "Remove.bg", url: "remove.bg", description: "الأشهر، API مجاني محدود" },
      { name: "Adobe Express", url: "adobe.com/express", description: "مدمج مع تصميم متكامل" },
    ],
    quiz: dq("إزالة الخلفية") },
  { id: 23, module: 4, title: "توليد الصور بالذكاء الاصطناعي", duration: "20 دقيقة", type: "article", xp: 75,
    content: rc("أدوات توليد الصور أحدثت ثورة — من نص إلى صورة احترافية في ثوانٍ.",
      ["Midjourney: أفضل جودة فنية، عبر Discord",
       "DALL-E 3: داخل ChatGPT، أفضل في فهم النص",
       "Stable Diffusion: مجاني ومفتوح المصدر، يعمل محلياً",
       "Adobe Firefly: مدرّب على محتوى مرخّص فقط"]),
    images: [img("صورة Midjourney", 0), img("صورة DALL-E", 1), img("صورة Stable Diffusion", 2)],
    aiTools: [
      { name: "Midjourney", url: "midjourney.com", description: "أفضل جودة للصور الفنية" },
      { name: "DALL-E 3", url: "openai.com/dall-e-3", description: "ممتاز لفهم الـ Prompts المعقدة" },
      { name: "Stable Diffusion", url: "stability.ai", description: "مجاني ومفتوح المصدر، تشغيل محلي" },
      { name: "Adobe Firefly", url: "firefly.adobe.com", description: "آمن قانونياً للاستخدام التجاري" },
    ],
    quiz: [
      { question: "أي أداة مفتوحة المصدر؟", options: ["Midjourney", "DALL-E", "Stable Diffusion", "Firefly"], correct: 2 },
      { question: "Midjourney يعمل عبر؟", options: ["موقع ويب", "Discord", "تطبيق سطح مكتب", "ChatGPT"], correct: 1 },
      { question: "أي أداة مدمجة مع ChatGPT؟", options: ["Midjourney", "DALL-E 3", "Stable Diffusion", "Firefly"], correct: 1 },
    ] },
  { id: 24, module: 4, title: "تحرير الفيديو بالذكاء الاصطناعي", duration: "16 دقيقة", type: "editing", xp: 60,
    content: rc("AI يدخل عالم الفيديو بقوة — من توليد لقطات إلى تحرير ذكي.",
      ["Runway ML: توليد فيديو من نص أو صورة",
       "Pika Labs: مشابه لـ Runway، نتائج سريعة",
       "Descript: تحرير الفيديو عبر تحرير النص",
       "CapCut AI: أدوات AI مجانية داخل المحرر"]),
    images: [img("Runway ML Interface", 3)],
    aiTools: [
      { name: "Runway ML", url: "runwayml.com", description: "Gen-3: توليد فيديو احترافي" },
      { name: "Pika Labs", url: "pika.art", description: "مجاني للبداية، تحريك صور" },
      { name: "Descript", url: "descript.com", description: "تحرير صوت/فيديو عبر تحرير النص" },
    ],
    quiz: dq("AI Video") },
  { id: 25, module: 4, title: "مستقبل التصوير مع الذكاء الاصطناعي", duration: "15 دقيقة", type: "article", xp: 60,
    content: rc("التصوير في 2030 سيكون مختلفاً جذرياً — كن مستعداً.",
      ["كاميرات بـ AI داخلية تحرّر الصور فورياً",
       "Computational Photography تتفوق على المستشعرات الكبيرة",
       "صور 3D و Volumetric Video للـ VR/AR",
       "تحدي الأصالة: كيف نميّز الصور الحقيقية من المولّدة؟"]),
    images: [img("مستقبل التصوير", 4), img("AR Photography", 5)],
    quiz: dq("مستقبل التصوير") },
];

const MODULES = [
  { id: 1, name: "أساسيات التصوير", desc: "Exposure، Composition، Focus" },
  { id: 2, name: "الكاميرات والمعدات", desc: "أنواع الكاميرات والعدسات" },
  { id: 3, name: "المونتاج والإنتاج", desc: "Premiere، DaVinci، CapCut" },
  { id: 4, name: "AI في التصوير", desc: "أدوات الذكاء الاصطناعي" },
] as const;

// ============ STORAGE ============
const LESSONS_KEY = "ilearn-cameras-lessons";
const PROGRESS_KEY = "ilearn-cameras-progress";
const NOTES_KEY = "ilearn-notes";
const XP_KEY = "ilearn-xp";

function getCompletedSet(): Set<number> {
  try { const r = localStorage.getItem(LESSONS_KEY); return new Set<number>(r ? JSON.parse(r) : []); }
  catch { return new Set(); }
}
function setCompletedSet(s: Set<number>) {
  try {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(Array.from(s)));
    const pct = Math.round((s.size / CAMERAS_LESSONS.length) * 100);
    localStorage.setItem(PROGRESS_KEY, String(pct));
  } catch { /* ignore */ }
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

export const Route = createFileRoute("/courses/cameras")({
  validateSearch: (raw: Record<string, unknown>): Search => {
    const r = raw.lesson;
    const lesson = typeof r === "number" ? r : typeof r === "string" && r ? Number(r) || undefined : undefined;
    return { lesson };
  },
  head: () => ({
    meta: [
      { title: "iLearn — الكاميرات والتصوير" },
      { name: "description", content: "تصوير، مونتاج، محتوى — من الصفر إلى الاحتراف" },
    ],
  }),
  component: CoursePage,
});

const TYPE_META: Record<LessonType, { icon: string; label: string; color: string }> = {
  video: { icon: "🎥", label: "فيديو", color: "text-info" },
  article: { icon: "📄", label: "مقال", color: "text-primary" },
  practical: { icon: "📸", label: "تمرين عملي", color: "text-success" },
  editing: { icon: "🎨", label: "تحرير", color: "text-warning" },
};

const HEADER_GRADIENT = "linear-gradient(135deg,#008B6B 0%,#00B894 60%,#6C5CE7 130%)";
const ACCENT_GRADIENT = "linear-gradient(135deg,#008B6B,#00B894)";

function CoursePage() {
  const { lesson: lessonIdParam } = Route.useSearch();
  const navigate = useNavigate({ from: "/courses/cameras" });

  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [openModule, setOpenModule] = useState<number>(1);
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => { setCompleted(getCompletedSet()); }, []);

  const isModuleUnlocked = (mid: number): boolean => {
    if (mid === 1) return true;
    const prev = CAMERAS_LESSONS.filter((l) => l.module === mid - 1);
    const done = prev.filter((l) => completed.has(l.id)).length;
    return prev.length === 0 || done / prev.length >= 0.8;
  };

  const totalLessons = CAMERAS_LESSONS.length;
  const doneCount = CAMERAS_LESSONS.filter((l) => completed.has(l.id)).length;
  const progressPct = Math.round((doneCount / totalLessons) * 100);
  const totalXP = CAMERAS_LESSONS.reduce((s, l) => s + l.xp, 0);
  const earnedXP = CAMERAS_LESSONS.filter((l) => completed.has(l.id)).reduce((s, l) => s + l.xp, 0);
  const remainingMin = CAMERAS_LESSONS.filter((l) => !completed.has(l.id))
    .reduce((s, l) => s + (parseInt(l.duration) || 15), 0);

  const currentLesson = useMemo(
    () => (lessonIdParam ? CAMERAS_LESSONS.find((l) => l.id === lessonIdParam) ?? null : null),
    [lessonIdParam]
  );

  const handleComplete = (lesson: CLesson) => {
    if (completed.has(lesson.id)) return;
    const next = new Set(completed); next.add(lesson.id); setCompleted(next); setCompletedSet(next);
    setXP(getXP() + lesson.xp);
    setConfettiKey((k) => k + 1);
    toast.success(`🎉 +${lesson.xp} XP — أكملت "${lesson.title}"`);
    addNotification({ type: "lesson", title: "أكملت درساً بنجاح",
      description: `${lesson.title} — +${lesson.xp} XP`, link: "/courses/cameras" });
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

      <div className="relative overflow-hidden border-b border-border" style={{ background: HEADER_GRADIENT }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-sm mb-4">
            <ArrowRight className="w-4 h-4" /> العودة للوحة التحكم
          </Link>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">📷 الكاميرات والتصوير</h1>
          <p className="text-white/85 mt-2 max-w-2xl text-sm sm:text-base">
            تصوير، مونتاج، محتوى — من الصفر إلى الاحتراف.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {[{ v: "25 درس" }, { v: "4 وحدات" }, { v: "12 ساعة" }, { v: "3 اختبارات" }].map((s, i) => (
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
                const lessons = CAMERAS_LESSONS.filter((l) => l.module === m.id);
                const mDone = lessons.filter((l) => completed.has(l.id)).length;
                const open = openModule === m.id;
                return (
                  <div key={m.id} className={`rounded-2xl border ${open ? "border-success/40" : "border-border"} bg-card overflow-hidden transition-all`}>
                    <button
                      onClick={() => unlocked ? setOpenModule(open ? -1 : m.id) :
                        toast.error("أكمل 80% من الوحدة السابقة لفتح هذه الوحدة")}
                      className="w-full p-4 flex items-center gap-3 text-right hover:bg-accent/30 transition-colors"
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-extrabold text-white shrink-0 ${unlocked ? "" : "opacity-40"}`}
                        style={{ background: ACCENT_GRADIENT }}>
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
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${done ? "bg-success/20 text-success" : "text-white"}`}
                                style={done ? undefined : { background: ACCENT_GRADIENT }}>
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
                                style={done ? undefined : { background: ACCENT_GRADIENT }}
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

        <aside className="lg:sticky lg:top-4 self-start space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground mb-1">التقدم الإجمالي</div>
            <div className="text-2xl font-extrabold text-foreground mb-2">{progressPct}%</div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%`, background: ACCENT_GRADIENT }} />
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
              <BookOpen className="w-4 h-4 text-success" /> الوحدات
            </div>
            <ul className="space-y-2">
              {MODULES.map((m) => {
                const lessons = CAMERAS_LESSONS.filter((l) => l.module === m.id);
                const mDone = lessons.filter((l) => completed.has(l.id)).length;
                const unlocked = isModuleUnlocked(m.id);
                return (
                  <li key={m.id}>
                    <button onClick={() => { setOpenModule(m.id); navigate({ search: {} }); }}
                      className={`w-full text-right flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors ${!unlocked ? "opacity-50" : ""}`}>
                      {unlocked ? <Circle className="w-3 h-3 text-success" /> : <Lock className="w-3 h-3" />}
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

// ============ Lightbox ============
function Lightbox({ image, onClose }: { image: GalleryImg | null; onClose: () => void }) {
  if (!image) return null;
  const [pos, setPos] = useState(50);
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <button className="absolute top-4 left-4 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center" onClick={onClose}>
        <XIcon className="w-5 h-5" />
      </button>
      <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        {image.beforeAfter ? (
          <div className="relative aspect-video rounded-2xl overflow-hidden select-none" style={{ background: image.gradient }}>
            <div className="absolute inset-0 flex items-center justify-center text-white/70 text-2xl font-extrabold">قبل</div>
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${pos}%)`, background: "linear-gradient(135deg,#16213e,#0f3460)" }}>
              <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-extrabold">بعد</div>
            </div>
            <div className="absolute inset-y-0 bg-white w-0.5" style={{ left: `${pos}%` }} />
            <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))}
              className="absolute inset-x-0 bottom-4 mx-auto w-3/4 accent-white" />
          </div>
        ) : (
          <div className="aspect-video rounded-2xl" style={{ background: image.gradient }} />
        )}
        <p className="text-center text-white mt-3 text-sm">{image.caption}</p>
      </div>
    </div>
  );
}

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
  const [lightbox, setLightbox] = useState<GalleryImg | null>(null);

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

  const copySettings = () => {
    if (!lesson.settings) return;
    const txt = lesson.settings.rows.map((r) =>
      `${r.scene}: ISO ${r.iso} | ${r.shutter} | ${r.aperture} | ${r.focal}`
    ).join("\n");
    navigator.clipboard.writeText(txt).then(() => toast.success("✅ تم نسخ الإعدادات"));
  };

  const all = CAMERAS_LESSONS;
  const idx = all.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;
  const related = all.filter((l) => l.module === lesson.module && l.id !== lesson.id).slice(0, 4);

  const score = lesson.quiz.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0);
  const allAnswered = Object.keys(answers).length === lesson.quiz.length;
  const meta = TYPE_META[lesson.type];

  return (
    <div className="space-y-4 animate-fade-in">
      <Lightbox image={lightbox} onClose={() => setLightbox(null)} />

      <button onClick={onClose} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="w-4 h-4" /> العودة لقائمة الدروس
      </button>

      <div className="relative aspect-video w-full rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer group"
        style={{ background: HEADER_GRADIENT }}>
        <button className="h-20 w-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
          <Play className="w-8 h-8 text-success fill-current ms-1" />
        </button>
        <div className="absolute bottom-3 inset-x-3 text-white text-xs bg-black/30 backdrop-blur px-3 py-1.5 rounded-lg text-center">
          الفيديو قريباً — اقرأ المحتوى التعليمي بالأسفل
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-xs flex-wrap mb-2">
          <span className={`flex items-center gap-1 ${meta.color}`}>{meta.icon} {meta.label}</span>
          <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" /> {lesson.duration}</span>
          <span className="text-warning font-bold">+{lesson.xp} XP</span>
          {completed && <span className="px-2 py-0.5 rounded-full bg-success/15 text-success font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> مكتمل</span>}
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mb-3">{lesson.title}</h1>
        <div className="text-sm text-foreground/90 leading-loose whitespace-pre-line">{lesson.content}</div>
      </div>

      {lesson.images && lesson.images.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <CameraIcon className="w-4 h-4 text-success" /> معرض الصور التوضيحي
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {lesson.images.map((im, i) => (
              <button key={i} onClick={() => setLightbox(im)}
                className="group relative aspect-video rounded-xl overflow-hidden hover:scale-[1.03] transition-transform"
                style={{ background: im.gradient }}>
                <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold">{im.caption}</span>
                </div>
                {im.beforeAfter && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur text-white text-[10px] font-bold">Before / After</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {lesson.settings && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="font-bold text-sm text-foreground">{lesson.settings.title}</div>
            <button onClick={copySettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-foreground text-xs font-bold hover:bg-accent/70">
              <Copy className="w-3.5 h-3.5" /> نسخ
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-right text-muted-foreground border-b border-border">
                  <th className="py-2 px-2 font-bold">المشهد</th>
                  <th className="py-2 px-2 font-bold">ISO</th>
                  <th className="py-2 px-2 font-bold">Shutter</th>
                  <th className="py-2 px-2 font-bold">Aperture</th>
                  <th className="py-2 px-2 font-bold">Focal</th>
                </tr>
              </thead>
              <tbody>
                {lesson.settings.rows.map((r, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="py-2 px-2 font-bold text-foreground">{r.scene}</td>
                    <td className="py-2 px-2 text-foreground/80">{r.iso}</td>
                    <td className="py-2 px-2 text-foreground/80">{r.shutter}</td>
                    <td className="py-2 px-2 text-foreground/80">{r.aperture}</td>
                    <td className="py-2 px-2 text-foreground/80">{r.focal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {lesson.software && lesson.software.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="font-bold text-sm text-foreground mb-2">برامج مقترحة</div>
          <div className="flex flex-wrap gap-2">
            {lesson.software.map((s, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-accent text-foreground text-xs font-bold">{s}</span>
            ))}
          </div>
        </div>
      )}

      {lesson.aiTools && lesson.aiTools.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> أدوات الذكاء الاصطناعي
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {lesson.aiTools.map((t, i) => (
              <a key={i} href={`https://${t.url}`} target="_blank" rel="noreferrer"
                className="p-3 rounded-xl bg-accent/30 hover:bg-accent transition-colors block">
                <div className="font-bold text-foreground text-sm">{t.name}</div>
                <div className="text-[11px] text-primary mt-0.5" dir="ltr">{t.url}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-success" /> ملاحظاتك
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="اكتب ملاحظاتك هنا..."
          className="w-full min-h-[100px] p-3 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-success/40" />
        <button onClick={saveNote}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold hover:opacity-90"
          style={{ background: ACCENT_GRADIENT }}>
          <Save className="w-3.5 h-3.5" /> حفظ الملاحظة
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="font-bold text-sm text-foreground mb-3">اختبار سريع</div>
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
                        picked ? "bg-success/15 border-success text-foreground" :
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
            style={{ background: ACCENT_GRADIENT }}>
            تصحيح الإجابات
          </button>
        ) : (
          <div className="mt-4 p-3 rounded-xl bg-accent/40 text-center text-sm font-bold text-foreground">
            النتيجة: {score} / {lesson.quiz.length} — {score === lesson.quiz.length ? "🎉 ممتاز!" : "💪 راجع المحتوى وحاول مجدداً"}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <button onClick={onComplete} disabled={completed}
          className="w-full h-12 rounded-xl text-white font-bold disabled:opacity-60"
          style={{ background: ACCENT_GRADIENT }}>
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