import { SECTIONS, getCompleted } from "./sections-data";

export type Achievement = {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  gradient: string;
  condition: string;
  check: (ctx: AchievementCtx) => boolean;
};

export type AchievementCtx = {
  completed: Set<string>;
  xp: number;
  streak: number;
  searchCount: number;
  darkCount: number;
  commentsCount: number;
  shared: boolean;
  lessonsToday: number;
};

const SEARCH_KEY = "ilearn-search-count";
const DARK_KEY = "ilearn-dark-count";
const COMMENTS_KEY = "ilearn-comments-count";
const SHARED_KEY = "ilearn-shared";
const DAY_KEY = "ilearn-lessons-by-day";
const STREAK_KEY = "ilearn-streak";
const XP_KEY = "ilearn-xp";
const ACH_KEY = "ilearn-achievements";

function safeGet<T>(k: string, fb: T): T {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; }
}
function safeSet(k: string, v: unknown) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ }
}

export function getCounter(kind: "search" | "dark" | "comments"): number {
  const k = kind === "search" ? SEARCH_KEY : kind === "dark" ? DARK_KEY : COMMENTS_KEY;
  return safeGet<number>(k, 0);
}
export function bumpCounter(kind: "search" | "dark" | "comments"): number {
  const k = kind === "search" ? SEARCH_KEY : kind === "dark" ? DARK_KEY : COMMENTS_KEY;
  const n = getCounter(kind) + 1;
  safeSet(k, n);
  return n;
}
export function markShared() { safeSet(SHARED_KEY, true); }
export function isShared(): boolean { return safeGet<boolean>(SHARED_KEY, false); }

export function recordLessonToday() {
  const today = new Date().toDateString();
  const map = safeGet<Record<string, number>>(DAY_KEY, {});
  map[today] = (map[today] ?? 0) + 1;
  safeSet(DAY_KEY, map);
  return map[today];
}
export function getLessonsToday(): number {
  const today = new Date().toDateString();
  return safeGet<Record<string, number>>(DAY_KEY, {})[today] ?? 0;
}

export function getStreak(): number {
  const v = safeGet<{ date: string; streak: number } | null>(STREAK_KEY, null);
  return v?.streak ?? 0;
}
export function getXP(): number {
  try { return parseInt(localStorage.getItem(XP_KEY) ?? "2450", 10) || 0; } catch { return 0; }
}

export function getCtx(): AchievementCtx {
  return {
    completed: getCompleted(),
    xp: getXP(),
    streak: getStreak(),
    searchCount: getCounter("search"),
    darkCount: getCounter("dark"),
    commentsCount: getCounter("comments"),
    shared: isShared(),
    lessonsToday: getLessonsToday(),
  };
}

const sectionDone = (sectionId: string, completed: Set<string>) => {
  const s = SECTIONS.find((x) => x.id === sectionId);
  if (!s || s.lessons.length === 0) return false;
  return s.lessons.every((l) => completed.has(l.id));
};
const countInSection = (sectionId: string, completed: Set<string>) => {
  const s = SECTIONS.find((x) => x.id === sectionId);
  if (!s) return 0;
  return s.lessons.filter((l) => completed.has(l.id)).length;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_step", name: "أول خطوة", desc: "أكمل أول درس", condition: "أكمل درساً واحداً", emoji: "👣", gradient: "from-emerald-400 to-teal-600", check: (c) => c.completed.size >= 1 },
  { id: "active_learner", name: "متعلم نشط", desc: "تعلم 3 أيام متتالية", condition: "streak ≥ 3 أيام", emoji: "🔥", gradient: "from-orange-400 to-red-500", check: (c) => c.streak >= 3 },
  { id: "computer_master", name: "خبير الحاسوب", desc: "أكمل قسم الحاسوب", condition: "كل دروس الحاسوب", emoji: "💻", gradient: "from-indigo-500 to-purple-600", check: (c) => sectionDone("computer", c.completed) },
  { id: "phone_master", name: "سيد الهواتف", desc: "أكمل قسم الهواتف", condition: "كل دروس الهواتف", emoji: "📱", gradient: "from-cyan-400 to-teal-500", check: (c) => sectionDone("phones", c.completed) },
  { id: "coder_starter", name: "مبرمج مبتدئ", desc: "أكمل 5 دروس برمجة", condition: "5 دروس في قسم البرمجة", emoji: "👨‍💻", gradient: "from-orange-500 to-pink-600", check: (c) => countInSection("programming", c.completed) >= 5 },
  { id: "photo_pro", name: "مصور محترف", desc: "أكمل قسم التصوير", condition: "كل دروس التصوير", emoji: "📷", gradient: "from-green-400 to-emerald-600", check: (c) => sectionDone("photography", c.completed) },
  { id: "ai_scholar", name: "عالم AI", desc: "أكمل قسم الذكاء الاصطناعي", condition: "كل دروس AI", emoji: "🧠", gradient: "from-purple-500 to-fuchsia-600", check: (c) => sectionDone("ai", c.completed) },
  { id: "quick_learner", name: "سريع التعلم", desc: "أكمل 3 دروس في يوم", condition: "3 دروس في 24 ساعة", emoji: "⚡", gradient: "from-yellow-400 to-orange-500", check: (c) => c.lessonsToday >= 3 },
  { id: "persistent", name: "المثابر", desc: "7 أيام متتالية", condition: "streak ≥ 7", emoji: "📅", gradient: "from-rose-400 to-red-600", check: (c) => c.streak >= 7 },
  { id: "legend_streak", name: "الأسطورة", desc: "30 يوم متتالي", condition: "streak ≥ 30", emoji: "👑", gradient: "from-amber-400 to-yellow-600", check: (c) => c.streak >= 30 },
  { id: "xp_collector", name: "جامع XP", desc: "اجمع 5,000 XP", condition: "XP ≥ 5,000", emoji: "⭐", gradient: "from-yellow-400 to-amber-500", check: (c) => c.xp >= 5000 },
  { id: "xp_millionaire", name: "مليونير XP", desc: "اجمع 10,000 XP", condition: "XP ≥ 10,000", emoji: "💎", gradient: "from-cyan-400 to-blue-600", check: (c) => c.xp >= 10000 },
  { id: "top10", name: "المتصدر", desc: "ادخل top 10", condition: "ضمن أعلى 10 متعلمين", emoji: "🏆", gradient: "from-amber-400 to-orange-600", check: (c) => c.xp >= 3000 },
  { id: "top3", name: "المنافس", desc: "ادخل top 3", condition: "ضمن أعلى 3", emoji: "🥇", gradient: "from-yellow-500 to-amber-700", check: (c) => c.xp >= 5500 },
  { id: "teacher", name: "المعلم", desc: "علّق على 5 دروس", condition: "5 تعليقات", emoji: "💬", gradient: "from-blue-400 to-indigo-600", check: (c) => c.commentsCount >= 5 },
  { id: "searcher", name: "الباحث", desc: "استخدم البحث 10 مرات", condition: "10 عمليات بحث", emoji: "🔍", gradient: "from-sky-400 to-blue-600", check: (c) => c.searchCount >= 10 },
  { id: "dark_lover", name: "محب الظلام", desc: "استخدم Dark Mode 10 مرات", condition: "10 تبديلات للوضع الداكن", emoji: "🌙", gradient: "from-slate-600 to-slate-900", check: (c) => c.darkCount >= 10 },
  { id: "completionist", name: "المكتمل", desc: "أكمل 50 درس", condition: "50 درس مكتمل", emoji: "📚", gradient: "from-violet-500 to-purple-700", check: (c) => c.completed.size >= 50 },
  { id: "true_legend", name: "الأسطورة الحقيقية", desc: "أكمل كل الأقسام", condition: "كل الأقسام مكتملة", emoji: "🌟",
    gradient: "from-pink-500 via-purple-500 to-indigo-600",
    check: (c) => SECTIONS.filter((s) => s.lessons.length > 0).every((s) => sectionDone(s.id, c.completed)) },
  { id: "ilearn_friend", name: "صديق iLearn", desc: "شارك التطبيق", condition: "اضغط زر المشاركة", emoji: "📤", gradient: "from-teal-400 to-cyan-600", check: (c) => c.shared },
];

export function getEarned(): Record<string, number> {
  return safeGet<Record<string, number>>(ACH_KEY, {});
}
function setEarned(m: Record<string, number>) { safeSet(ACH_KEY, m); }

export function checkAchievements(onUnlock?: (a: Achievement) => void): Achievement[] {
  const ctx = getCtx();
  const earned = getEarned();
  const newly: Achievement[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!earned[a.id] && a.check(ctx)) {
      earned[a.id] = Date.now();
      newly.push(a);
      onUnlock?.(a);
    }
  }
  if (newly.length) setEarned(earned);
  return newly;
}

export function getLatestEarned(limit = 3): { ach: Achievement; at: number }[] {
  const earned = getEarned();
  return Object.entries(earned)
    .map(([id, at]) => ({ ach: ACHIEVEMENTS.find((a) => a.id === id), at }))
    .filter((x): x is { ach: Achievement; at: number } => !!x.ach)
    .sort((a, b) => b.at - a.at)
    .slice(0, limit);
}