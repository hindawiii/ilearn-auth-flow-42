import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowLeft, Play, FileText, Terminal, Lock, CheckCircle2,
  Circle, ChevronDown, Clock, Save, Trophy, BookOpen, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Confetti } from "@/components/Confetti";
import { checkAchievements } from "@/lib/achievements";
import { addNotification } from "@/lib/notifications";

// ============ DATA ============
type LessonType = "video" | "article" | "practical";
type QuizQ = { question: string; options: string[]; correct: number };
type PLesson = {
  id: number; module: 1 | 2 | 3 | 4; title: string;
  duration: string; type: LessonType; xp: number;
  content: string; code?: string; steps?: string[]; warnings?: string[];
  quiz: QuizQ[];
};

const dq = (topic: string): QuizQ[] => [
  { question: `لماذا من المهم تعلم "${topic}"؟`,
    options: ["لرفع كفاءتك التقنية", "لا فائدة منه", "للترفيه فقط", "مضيعة للوقت"], correct: 0 },
  { question: "ما الخطوة الأولى عند مواجهة عطل في الهاتف؟",
    options: ["إعادة التشغيل عشوائياً", "تشخيص العطل بدقة", "فتح الجهاز فوراً", "إهماله"], correct: 1 },
  { question: "أي ممارسة آمنة للعمل على الهواتف؟",
    options: ["العمل بدون إطفاء الجهاز", "العمل العشوائي", "اتباع دليل رسمي + احتياطي", "الاستعجال"], correct: 2 },
];

const rc = (intro: string, points: string[]) =>
  `${intro}\n\n` + points.map((p, i) => `${i + 1}. ${p}`).join("\n") +
  `\n\nنصيحة: التطبيق العملي والقراءة المستمرة لمصادر موثوقة هما مفتاح الإتقان.`;

export const PHONES_LESSONS: PLesson[] = [
  // ===== Module 1: أساسيات الهواتف الذكية =====
  { id: 1, module: 1, title: "تاريخ الهواتف الذكية", duration: "15 دقيقة", type: "video", xp: 50,
    content: rc("بدأت رحلة الهواتف الذكية عام 1992 مع IBM Simon، أول هاتف يجمع بين الاتصالات وميزات الحاسوب. لاحقاً قلب iPhone (2007) قواعد اللعبة، ثم انطلق Android (2008) ليوسّع المنافسة.",
      ["1992: IBM Simon — أول هاتف ذكي حقيقي", "2007: iPhone — شاشة لمس متعددة وثورة في التصميم",
       "2008: HTC Dream — أول هاتف Android", "اليوم: شاشات OLED مرنة، 5G، AI داخل الجهاز"]),
    quiz: [
      { question: "أول هاتف ذكي في العالم؟", options: ["iPhone", "IBM Simon", "Nokia 3310", "BlackBerry"], correct: 1 },
      { question: "متى أُطلق iPhone الأول؟", options: ["2005", "2007", "2009", "2010"], correct: 1 },
      { question: "أول هاتف يعمل بنظام Android؟", options: ["Galaxy S", "HTC Dream", "Pixel 1", "Nexus One"], correct: 1 },
    ] },
  { id: 2, module: 1, title: "مكونات الهاتف الداخلية", duration: "18 دقيقة", type: "article", xp: 50,
    content: rc("هاتفك ليس مجرد شاشة — بداخله نظام متكامل من المعالج والذاكرة وحساسات متعددة.",
      ["SoC: يجمع المعالج والـ GPU والـ Modem في شريحة واحدة", "RAM: ذاكرة عمل سريعة (8-16GB حالياً)",
       "Storage: UFS 3.1/4.0 أسرع بكثير من eMMC القديمة", "Display: من LCD إلى LTPO OLED",
       "Battery + سعرات Wh، وحساسات (Gyro, Accelerometer, NFC)"]),
    quiz: dq("مكونات الهاتف") },
  { id: 3, module: 1, title: "أنواع الشاشات (LCD/OLED/AMOLED/LTPO)", duration: "12 دقيقة", type: "article", xp: 40,
    content: rc("جودة الشاشة تحدد تجربتك اليومية مع الهاتف.",
      ["LCD: ألوان جيدة لكن أسود غير عميق", "OLED: كل بكسل ينير بنفسه — أسود مثالي",
       "AMOLED: نسخة محسّنة من OLED بـ Active Matrix", "LTPO: تردد تحديث متغير 1-120Hz لتوفير البطارية"]),
    quiz: dq("الشاشات") },
  { id: 4, module: 1, title: "تقنيات الشحن (Fast/Wireless/Reverse)", duration: "14 دقيقة", type: "video", xp: 50,
    content: rc("الشحن السريع أصبح معياراً — لكن لكل تقنية فلسفتها وحدودها.",
      ["Fast Charging: 25W حتى 240W في بعض هواتف Android", "Wireless Qi: 5-15W، أبطأ لكن مريح",
       "Reverse Wireless: شحن السماعات من ظهر الهاتف", "احذر شواحن مجهولة المصدر — قد تتلف البطارية"]),
    quiz: dq("الشحن") },
  { id: 5, module: 1, title: "Android vs iOS: أيهما يناسبك؟", duration: "20 دقيقة", type: "article", xp: 60,
    content: rc("الاختيار ليس صحيحاً أو خاطئاً، بل يعتمد على احتياجاتك.",
      ["Android: تخصيص واسع، تنوع في الأسعار، انفتاح", "iOS: ثبات، تحديثات طويلة الأمد، تكامل مع أجهزة Apple",
       "Android أفضل للتطوير والتجربة", "iOS أفضل للخصوصية والسهولة من الصندوق"]),
    quiz: dq("Android vs iOS") },
  { id: 6, module: 1, title: "اختيار الهاتف المناسب", duration: "15 دقيقة", type: "video", xp: 50,
    content: rc("لا تشترِ الأغلى بل الأنسب لاستخدامك.",
      ["حدد ميزانيتك أولاً", "للألعاب: ركّز على SoC قوي (Snapdragon 8 Gen 3 / A17)",
       "للتصوير: استشر مراجعات DXOMARK و GSMArena", "للاستخدام العادي: 8GB RAM وبطارية ≥ 4500mAh"]),
    quiz: dq("اختيار الهاتف") },

  // ===== Module 2: Android المتقدم =====
  { id: 7, module: 2, title: "Developer Options المخفية", duration: "12 دقيقة", type: "article", xp: 50,
    content: rc("خيارات المطور تفتح لك تحكماً عميقاً في النظام.",
      ["اضغط 7 مرات على Build Number لتفعيلها", "USB Debugging: يفتح الباب لـ ADB",
       "Animation Scale: قلّلها لـ 0.5x لشعور أسرع", "Force GPU Rendering لتحسين أداء التطبيقات"]),
    quiz: dq("Developer Options") },
  { id: 8, module: 2, title: "ADB: أوامر سريعة للتحكم بالهاتف", duration: "20 دقيقة", type: "practical", xp: 60,
    content: rc("ADB (Android Debug Bridge) جسر تواصل بين الحاسوب والهاتف عبر USB.",
      ["adb devices: التأكد من اتصال الجهاز", "adb install: تثبيت APK من الحاسوب",
       "adb pull/push: نقل ملفات بين الهاتف والحاسوب", "adb shell: دخول طرفية الهاتف مباشرة"]),
    code: `adb devices\nadb install app.apk\nadb pull /sdcard/file.txt ./\nadb push ./file.txt /sdcard/\nadb shell pm list packages\nadb logcat`,
    steps: [
      "تفعيل Developer Options من إعدادات الهاتف",
      "تفعيل USB Debugging داخل خيارات المطور",
      "توصيل الهاتف بالحاسوب عبر كابل بيانات (ليس شحن فقط)",
      "تشغيل Terminal/CMD وكتابة adb devices",
      "الموافقة على رسالة الاعتماد في الهاتف",
    ],
    warnings: ["⚠️ لا تستخدم ADB إلا إذا كنت تعرف ما تفعله", "⚠️ بعض الأوامر قد تسبب فقدان البيانات"],
    quiz: dq("ADB") },
  { id: 9, module: 2, title: "Fastboot: استعادة النظام", duration: "22 دقيقة", type: "practical", xp: 70,
    content: rc("Fastboot يسمح بفلاش النظام والـ Recovery على مستوى منخفض.",
      ["يدخل بضغط أزرار محددة عند الإقلاع", "fastboot flash لتثبيت أقسام النظام",
       "fastboot oem unlock لفتح Bootloader", "احذر: فتح Bootloader يمسح البيانات"]),
    code: `adb reboot bootloader\nfastboot devices\nfastboot flashing unlock\nfastboot flash recovery twrp.img\nfastboot reboot`,
    steps: [
      "خذ نسخة احتياطية كاملة قبل أي خطوة",
      "نزّل ملفات الفلاش من المصدر الرسمي فقط",
      "أدخل وضع Fastboot (غالباً Power + Volume Down)",
      "نفّذ أوامر fastboot من Terminal",
    ],
    warnings: ["⚠️ خطأ في الفلاش قد يحوّل الجهاز إلى \"تابوت\" (Bricked)", "⚠️ فتح Bootloader يلغي الضمان عادةً"],
    quiz: dq("Fastboot") },
  { id: 10, module: 2, title: "عمل Root للهاتف (Magisk/KernelSU)", duration: "25 دقيقة", type: "practical", xp: 80,
    content: rc("Root يمنحك صلاحيات النظام الكاملة — قوة كبيرة بمسؤولية كبيرة.",
      ["Magisk: الأشهر، يخفي الـ Root عن التطبيقات", "KernelSU: حديث، يعمل على مستوى الكيرنل",
       "بعض التطبيقات (Banking) لن تعمل مع Root", "يمكن إخفاء الـ Root عبر Zygisk"]),
    code: `# تثبيت Magisk\n# 1. fastboot flash boot magisk_patched.img\n# 2. reboot\n# 3. install Magisk Manager APK`,
    steps: [
      "ابحث عن طريقة Root خاصة بطراز هاتفك بالضبط",
      "افتح Bootloader أولاً (يمسح البيانات)",
      "احصل على boot.img للإصدار الحالي",
      "عدّلها بـ Magisk Manager ثم flash",
    ],
    warnings: ["⚠️ Root يلغي ضمان الشركة", "⚠️ تطبيقات البنوك وGoogle Pay قد تتوقف", "⚠️ خطأ في العملية = جهاز معطّل"],
    quiz: dq("Root") },
  { id: 11, module: 2, title: "تثبيت ROM مخصص (Custom ROMs)", duration: "30 دقيقة", type: "practical", xp: 80,
    content: rc("ROMs المخصصة تمنحك تجربة Android نقية أو مميزات لا توجد في النسخة الرسمية.",
      ["LineageOS: الأكثر دعماً وأماناً", "Pixel Experience: واجهة Pixel على أي هاتف",
       "crDroid: مرونة عالية في التخصيص", "تحقق دائماً من دعم جهازك في xda-developers"]),
    steps: [
      "افتح Bootloader",
      "ثبّت Custom Recovery (TWRP/OrangeFox)",
      "خذ نسخة احتياطية Nandroid",
      "امسح الأقسام (Wipe) ثم flash ROM + GApps",
    ],
    warnings: ["⚠️ لا تثبّت ROM لجهاز آخر — قد يدمّر الذاكرة", "⚠️ خذ Nandroid قبل أي شيء"],
    quiz: dq("Custom ROMs") },
  { id: 12, module: 2, title: "استرجاع الهاتف من Bootloop", duration: "18 دقيقة", type: "article", xp: 60,
    content: rc("Bootloop = الهاتف يعيد التشغيل عند الشعار ولا يدخل النظام.",
      ["جرّب Wipe Cache من Recovery أولاً", "إذا فشل، Factory Reset (يمسح البيانات)",
       "آخر حل: فلاش الـ Stock Firmware عبر Fastboot/Odin", "تأكد من بطارية فوق 50% قبل أي عملية"]),
    quiz: dq("Bootloop") },
  { id: 13, module: 2, title: "تطبيقات Android للمحترفين", duration: "15 دقيقة", type: "article", xp: 40,
    content: rc("هذه التطبيقات ترفع إنتاجيتك بشكل ملحوظ.",
      ["Termux: Linux كامل داخل هاتفك", "KWGT: ودجتس مخصصة بالكامل",
       "Bromite/Mull: متصفحات تركّز على الخصوصية", "Aurora Store: بديل آمن لـ Play Store"]),
    quiz: dq("تطبيقات احترافية") },
  { id: 14, module: 2, title: "أتمتة المهام (Tasker/MacroDroid)", duration: "22 دقيقة", type: "practical", xp: 70,
    content: rc("الأتمتة توفّر ساعات أسبوعياً من المهام المتكررة.",
      ["Tasker: الأقوى لكن منحنى تعلم حاد", "MacroDroid: واجهة أبسط للمبتدئين",
       "أمثلة: فتح Wi-Fi عند الوصول للبيت", "تشغيل Do Not Disturb عند بدء اجتماع"]),
    steps: [
      "حدد المهمة المتكررة التي تريد أتمتتها",
      "اختر Trigger (موقع/وقت/تطبيق)",
      "اختر Action (تشغيل/إيقاف/إرسال)",
      "اختبر السيناريو قبل الاعتماد عليه",
    ],
    quiz: dq("الأتمتة") },

  // ===== Module 3: iOS و Apple =====
  { id: 15, module: 3, title: "إعدادات iOS المتقدمة (Shortcuts)", duration: "20 دقيقة", type: "practical", xp: 60,
    content: rc("Shortcuts في iOS تعادل قوة Tasker على Android.",
      ["معرض Shortcuts الجاهزة نقطة انطلاق ممتازة", "Automations: تشغيل اختصارات تلقائياً",
       "يمكن ربط NFC Tags باختصارات", "تكامل عميق مع Siri والمنزل الذكي"]),
    steps: [
      "افتح تطبيق Shortcuts",
      "اختر Gallery لاستعراض الجاهز",
      "اضغط + لإنشاء اختصار من الصفر",
      "اربطه بـ Automation أو Home Screen",
    ],
    quiz: dq("Shortcuts") },
  { id: 16, module: 3, title: "Jailbreak: الفوائد والمخاطر", duration: "18 دقيقة", type: "article", xp: 60,
    content: rc("Jailbreak يفتح iOS لتعديلات عميقة — لكنه ليس بلا ثمن.",
      ["Cydia/Sileo: متاجر بدائل", "Tweaks تعدّل سلوك النظام والتطبيقات",
       "يلغي الضمان ويعطّل Apple Pay غالباً", "إصدارات iOS الحديثة صعب جداً jailbreak"]),
    warnings: ["⚠️ يعرّض جهازك لاختراقات أمنية", "⚠️ التحديث الرسمي قد يكسر الـ Jailbreak"],
    quiz: dq("Jailbreak") },
  { id: 17, module: 3, title: "iCloud وإدارة البيانات", duration: "16 دقيقة", type: "article", xp: 50,
    content: rc("iCloud عمود فقري لنظام Apple البيئي.",
      ["نسخة احتياطية تلقائية كل ليلة عند الشحن", "iCloud Drive لمزامنة الملفات",
       "iCloud Photos: مكتبة موحّدة عبر الأجهزة", "Advanced Data Protection للتشفير من طرف لطرف"]),
    quiz: dq("iCloud") },
  { id: 18, module: 3, title: "نقل البيانات بين Android و iOS", duration: "14 دقيقة", type: "practical", xp: 50,
    content: rc("الانتقال بين الأنظمة لم يعد معقداً كما كان.",
      ["Move to iOS: تطبيق رسمي من Apple", "Switch to Android: متوفر عبر USB-C",
       "Google Drive: نقل صور + جهات اتصال + تقويم", "WhatsApp يدعم النقل الرسمي بين النظامين"]),
    steps: [
      "خذ نسخة احتياطية كاملة من الجهاز القديم",
      "ثبّت التطبيق الرسمي للنقل",
      "اربط الجهازين على نفس الشبكة",
      "اختر البيانات المراد نقلها وانتظر",
    ],
    quiz: dq("نقل البيانات") },
  { id: 19, module: 3, title: "صيانة iPhone: البطارية والشاشة", duration: "22 دقيقة", type: "practical", xp: 70,
    content: rc("صيانة iPhone تحتاج أدوات دقيقة وصبراً.",
      ["iPhone مغلق بشدة — تحتاج Pentalobe screwdriver", "Face ID قد يتعطّل عند فك الشاشة بدون أداة معايرة",
       "استخدم قطع OEM لتفادي رسائل التحذير", "البطارية ملصوقة بشرائط Adhesive — استخدم كحول isopropyl"]),
    steps: [
      "أطفئ الهاتف تماماً",
      "افك براغي Pentalobe بجانب منفذ Lightning",
      "افتح الشاشة بـ Suction Cup بحذر",
      "افصل البطارية أولاً قبل أي شيء آخر",
    ],
    warnings: ["⚠️ فك الشاشة بدون أداة معايرة قد يعطّل True Tone", "⚠️ ثقب البطارية يسبب حريقاً — احذر"],
    quiz: dq("صيانة iPhone") },

  // ===== Module 4: صيانة الهواتف =====
  { id: 20, module: 4, title: "أدوات الصيانة الأساسية", duration: "15 دقيقة", type: "article", xp: 50,
    content: rc("الأدوات الصحيحة تفرق بين إصلاح ناجح وكارثة.",
      ["Precision Screwdrivers: مجموعة Pentalobe + Tri-point + Phillips", "Heat Gun/Hairdryer: لإذابة الـ Adhesive",
       "Suction Cup: لرفع الشاشة دون كسر", "Spudger + Plastic Picks: لفك المكونات دون خدش",
       "ESD Strap: لتفريغ الكهرباء الساكنة"]),
    quiz: dq("أدوات الصيانة") },
  { id: 21, module: 4, title: "استبدال شاشة الهاتف خطوة بخطوة", duration: "25 دقيقة", type: "practical", xp: 75,
    content: rc("استبدال الشاشة من أكثر الإصلاحات طلباً — وأخطرها على البطارية.",
      ["جهّز مساحة عمل نظيفة ومضاءة جيداً", "ضع البراغي في صحن مغناطيسي مرتّب",
       "صوّر كل خطوة لتجميع الهاتف لاحقاً", "اختبر الشاشة قبل تثبيتها نهائياً"]),
    steps: [
      "إطفاء الهاتف وإخراج شريحة SIM",
      "تسخين الحواف بـ Heat Gun (60-80 درجة)",
      "استخدام Suction Cup لرفع الشاشة برفق",
      "فك البراغي الداخلية بـ Precision Screwdriver",
      "فصل موصل الشاشة (Ribbon Cable) بحذر",
      "تركيب الشاشة الجديدة وإعادة البراغي",
      "اختبار اللمس والعرض قبل إغلاق الجهاز",
    ],
    warnings: ["⚠️ احترس من البطارية — لا تثقبها", "⚠️ لا تستخدم قوة زائدة مع الـ Ribbon Cable", "⚠️ تأكد من إطفاء الهاتف تماماً"],
    quiz: dq("استبدال الشاشة") },
  { id: 22, module: 4, title: "استبدال بطارية الهاتف", duration: "22 دقيقة", type: "practical", xp: 70,
    content: rc("البطارية تستهلك دورات شحن — استبدالها يعيد الحياة للهاتف.",
      ["استخدم بطارية أصلية أو OEM موثوق", "افصل كابل البطارية أولاً قبل أي مكون آخر",
       "استخدم Adhesive Strips جديدة للتثبيت", "اشحن البطارية الجديدة كاملاً قبل أول استخدام"]),
    steps: [
      "فك الشاشة كما في الدرس السابق",
      "فصل كابل البطارية من المازر",
      "سحب شرائط Adhesive من تحت البطارية بهدوء",
      "إن لزم، استخدم كحول isopropyl 90%+ لإذابة اللاصق",
      "تركيب البطارية الجديدة + شرائط جديدة",
    ],
    warnings: ["⚠️ ثني البطارية أو ثقبها يسبب حريقاً", "⚠️ لا تستخدم أداة معدنية تحت البطارية", "⚠️ إذا انتفخت البطارية، تخلّص منها بأمان فوراً"],
    quiz: dq("استبدال البطارية") },
  { id: 23, module: 4, title: "تنظيف منفذ الشحن والسماعات", duration: "10 دقيقة", type: "article", xp: 40,
    content: rc("معظم مشاكل الشحن سببها غبار محشور وليس عطل!",
      ["استخدم عود أسنان خشبي — ليس معدنياً", "هواء مضغوط لطرد الغبار من السماعات",
       "تجنّب الماء أو السوائل في المنافذ", "تنظيف دوري كل شهر يمنع 80% من المشاكل"]),
    quiz: dq("التنظيف") },
  { id: 24, module: 4, title: "مشاكل الشبكة والواي فاي وحلولها", duration: "18 دقيقة", type: "article", xp: 50,
    content: rc("معظم مشاكل الاتصال حلولها بسيطة قبل اللجوء للصيانة.",
      ["جرّب Airplane Mode لمدة 10 ثوان", "احذف الشبكة وأضفها مجدداً",
       "إعادة ضبط إعدادات الشبكة (لا يمسح بياناتك)", "تحديث ملف APN يحل مشاكل البيانات الخلوية"]),
    quiz: dq("مشاكل الشبكة") },
  { id: 25, module: 4, title: "استرجاع بيانات من هاتف معطّل", duration: "20 دقيقة", type: "practical", xp: 70,
    content: rc("هاتف معطّل لا يعني فقدان البيانات بالضرورة.",
      ["إذا كانت الشاشة فقط معطلة: استخدم OTG + Mouse", "Android: ADB Backup إن كان USB Debugging مفعّلاً",
       "iPhone: استخدم آخر iCloud Backup", "للحالات الصعبة: متاجر متخصصة بـ JTAG/Chip-Off"]),
    steps: [
      "حدد طبيعة العطل (شاشة فقط/إقلاع/ذاكرة)",
      "جرّب الحلول البرمجية أولاً (ADB/iTunes)",
      "إن فشل، انقل الذاكرة الداخلية لجهاز مماثل",
      "آخر حل: متخصص استرجاع بيانات",
    ],
    warnings: ["⚠️ لا تشغّل هاتفاً غُمر في الماء قبل تجفيفه 48 ساعة", "⚠️ كل محاولة فاشلة قد تقلل فرصة الاسترجاع"],
    quiz: dq("استرجاع البيانات") },
];

const MODULES = [
  { id: 1, name: "أساسيات الهواتف الذكية", desc: "تاريخ، مكونات، شاشات، شحن" },
  { id: 2, name: "Android المتقدم", desc: "ADB, Fastboot, Root, ROMs" },
  { id: 3, name: "iOS و Apple", desc: "Shortcuts, Jailbreak, iCloud" },
  { id: 4, name: "صيانة الهواتف", desc: "شاشة، بطارية، شبكة، استرجاع" },
] as const;

// ============ STORAGE ============
const LESSONS_KEY = "ilearn-phones-lessons";
const PROGRESS_KEY = "ilearn-phones-progress";
const NOTES_KEY = "ilearn-notes";
const XP_KEY = "ilearn-xp";

function getCompletedSet(): Set<number> {
  try { const r = localStorage.getItem(LESSONS_KEY); return new Set<number>(r ? JSON.parse(r) : []); }
  catch { return new Set(); }
}
function setCompletedSet(s: Set<number>) {
  try {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(Array.from(s)));
    const pct = Math.round((s.size / PHONES_LESSONS.length) * 100);
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

export const Route = createFileRoute("/courses/phones")({
  validateSearch: (raw: Record<string, unknown>): Search => {
    const r = raw.lesson;
    const lesson = typeof r === "number" ? r : typeof r === "string" && r ? Number(r) || undefined : undefined;
    return { lesson };
  },
  head: () => ({
    meta: [
      { title: "iLearn — الهواتف الذكية" },
      { name: "description", content: "Android, iOS, صيانة — من الصفر إلى الاحتراف" },
    ],
  }),
  component: CoursePage,
});

const TYPE_META: Record<LessonType, { icon: string; label: string; color: string }> = {
  video: { icon: "🎥", label: "فيديو", color: "text-info" },
  article: { icon: "📄", label: "مقال", color: "text-primary" },
  practical: { icon: "🔧", label: "تمرين عملي", color: "text-success" },
};

const HEADER_GRADIENT = "linear-gradient(135deg,#008B8B 0%,#00D2D3 60%,#6C5CE7 130%)";

function CoursePage() {
  const { lesson: lessonIdParam } = Route.useSearch();
  const navigate = useNavigate({ from: "/courses/phones" });

  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [openModule, setOpenModule] = useState<number>(1);
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => { setCompleted(getCompletedSet()); }, []);

  const isModuleUnlocked = (mid: number): boolean => {
    if (mid === 1) return true;
    const prev = PHONES_LESSONS.filter((l) => l.module === mid - 1);
    const done = prev.filter((l) => completed.has(l.id)).length;
    return prev.length === 0 || done / prev.length >= 0.8;
  };

  const totalLessons = PHONES_LESSONS.length;
  const doneCount = PHONES_LESSONS.filter((l) => completed.has(l.id)).length;
  const progressPct = Math.round((doneCount / totalLessons) * 100);
  const totalXP = PHONES_LESSONS.reduce((s, l) => s + l.xp, 0);
  const earnedXP = PHONES_LESSONS.filter((l) => completed.has(l.id)).reduce((s, l) => s + l.xp, 0);
  const remainingMin = PHONES_LESSONS.filter((l) => !completed.has(l.id))
    .reduce((s, l) => s + (parseInt(l.duration) || 15), 0);

  const currentLesson = useMemo(
    () => (lessonIdParam ? PHONES_LESSONS.find((l) => l.id === lessonIdParam) ?? null : null),
    [lessonIdParam]
  );

  const handleComplete = (lesson: PLesson) => {
    if (completed.has(lesson.id)) return;
    const next = new Set(completed); next.add(lesson.id); setCompleted(next); setCompletedSet(next);
    setXP(getXP() + lesson.xp);
    setConfettiKey((k) => k + 1);
    toast.success(`🎉 +${lesson.xp} XP — أكملت "${lesson.title}"`);
    addNotification({ type: "lesson", title: "أكملت درساً بنجاح",
      description: `${lesson.title} — +${lesson.xp} XP`, link: "/courses/phones" });
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
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">📱 الهواتف الذكية</h1>
          <p className="text-white/85 mt-2 max-w-2xl text-sm sm:text-base">
            Android، iOS، وصيانة — من الصفر إلى الاحتراف.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {[{ v: "25 درس" }, { v: "4 وحدات" }, { v: "10 ساعات" }, { v: "3 اختبارات" }].map((s, i) => (
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
                const lessons = PHONES_LESSONS.filter((l) => l.module === m.id);
                const mDone = lessons.filter((l) => completed.has(l.id)).length;
                const open = openModule === m.id;
                return (
                  <div key={m.id} className={`rounded-2xl border ${open ? "border-info/40" : "border-border"} bg-card overflow-hidden transition-all`}>
                    <button
                      onClick={() => unlocked ? setOpenModule(open ? -1 : m.id) :
                        toast.error("أكمل 80% من الوحدة السابقة لفتح هذه الوحدة")}
                      className="w-full p-4 flex items-center gap-3 text-right hover:bg-accent/30 transition-colors"
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-extrabold text-white shrink-0 ${unlocked ? "" : "opacity-40"}`}
                        style={{ background: "linear-gradient(135deg,#008B8B,#00D2D3)" }}>
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
                                style={done ? undefined : { background: "linear-gradient(135deg,#008B8B,#00D2D3)" }}>
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
                                style={done ? undefined : { background: "linear-gradient(135deg,#008B8B,#00D2D3)" }}
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
                style={{ width: `${progressPct}%`, background: "linear-gradient(135deg,#008B8B,#00D2D3)" }} />
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
              <BookOpen className="w-4 h-4 text-info" /> الوحدات
            </div>
            <ul className="space-y-2">
              {MODULES.map((m) => {
                const lessons = PHONES_LESSONS.filter((l) => l.module === m.id);
                const mDone = lessons.filter((l) => completed.has(l.id)).length;
                const unlocked = isModuleUnlocked(m.id);
                return (
                  <li key={m.id}>
                    <button onClick={() => { setOpenModule(m.id); navigate({ search: {} }); }}
                      className={`w-full text-right flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors ${!unlocked ? "opacity-50" : ""}`}>
                      {unlocked ? <Circle className="w-3 h-3 text-info" /> : <Lock className="w-3 h-3" />}
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

function LessonView({
  lesson, completed, onClose, onComplete, onNavigate,
}: {
  lesson: PLesson; completed: boolean;
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

  const all = PHONES_LESSONS;
  const idx = all.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;
  const related = all.filter((l) => l.module === lesson.module && l.id !== lesson.id).slice(0, 4);

  const score = lesson.quiz.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0);
  const allAnswered = Object.keys(answers).length === lesson.quiz.length;
  const meta = TYPE_META[lesson.type];

  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={onClose} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="w-4 h-4" /> العودة لقائمة الدروس
      </button>

      <div className="relative aspect-video w-full rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer group"
        style={{ background: HEADER_GRADIENT }}>
        <button className="h-20 w-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
          <Play className="w-8 h-8 text-info fill-current ms-1" />
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

        {lesson.code && (
          <pre className="mt-4 p-4 rounded-xl bg-slate-950 text-slate-100 text-xs overflow-x-auto font-mono leading-relaxed" dir="ltr">
            <code>{lesson.code}</code>
          </pre>
        )}

        {lesson.steps && lesson.steps.length > 0 && (
          <div className="mt-4">
            <div className="font-bold text-sm text-foreground mb-2">خطوات عملية</div>
            <ol className="space-y-2">
              {lesson.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="h-6 w-6 rounded-full bg-info/15 text-info text-xs font-extrabold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {lesson.warnings && lesson.warnings.length > 0 && (
          <div className="mt-4 space-y-2">
            {lesson.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{w.replace(/^⚠️\s*/, "")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-info" /> ملاحظاتك
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="اكتب ملاحظاتك هنا..."
          className="w-full min-h-[100px] p-3 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-info/40" />
        <button onClick={saveNote}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#008B8B,#00D2D3)" }}>
          <Save className="w-3.5 h-3.5" /> حفظ الملاحظة
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-info" /> اختبار سريع
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
                        picked ? "bg-info/15 border-info text-foreground" :
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
            style={{ background: "linear-gradient(135deg,#008B8B,#00D2D3)" }}>
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
          style={{ background: "linear-gradient(135deg,#008B8B,#00D2D3)" }}>
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