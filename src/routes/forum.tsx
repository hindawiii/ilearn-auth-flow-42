import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, MessageSquare, Plus, Search, Heart, Eye, MessageCircle,
  CheckCircle2, Circle, Share2, Flag, Send, X, Laptop, Smartphone, Code2,
  Camera, Brain, MessagesSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Confetti } from "@/components/Confetti";

// ============ TYPES ============
type Category = "computer" | "phones" | "programming" | "cameras" | "ai" | "general";

type Topic = {
  id: number;
  title: string;
  category: Category;
  author: string;
  avatar: string;
  time: string;
  replies: number;
  views: number;
  likes: number;
  solved: boolean;
  content: string;
  createdAt: number;
};

type Reply = {
  id: number;
  topicId: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
};

// ============ CATEGORIES ============
const CATEGORIES: {
  id: Category; name: string; desc: string; color: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "computer", name: "الحاسوب والأنظمة", desc: "مشاكل Windows، Linux، تجميعات، شبكات", color: "#6C5CE7", icon: Laptop },
  { id: "phones", name: "الهواتف", desc: "Android، iOS، صيانة، تطبيقات", color: "#00D2D3", icon: Smartphone },
  { id: "programming", name: "البرمجة", desc: "Backend، Frontend، أكواد، مشاريع", color: "#E17055", icon: Code2 },
  { id: "cameras", name: "الكاميرات والتصوير", desc: "تصوير، مونتاج، محتوى، إضاءة", color: "#00B894", icon: Camera },
  { id: "ai", name: "الذكاء الاصطناعي", desc: "أدوات AI، Prompt Engineering، أخبار", color: "#6C5CE7", icon: Brain },
  { id: "general", name: "عام", desc: "نقاشات عامة، اقتراحات، إعلانات", color: "#8A8AA8", icon: MessagesSquare },
];

const CAT_MAP: Record<Category, (typeof CATEGORIES)[number]> = CATEGORIES.reduce(
  (acc, c) => { acc[c.id] = c; return acc; },
  {} as Record<Category, (typeof CATEGORIES)[number]>,
);

// ============ MOCK DATA ============
const NOW = Date.now();
const MOCK_TOPICS: Topic[] = [
  { id: 1, title: "كيف أحل مشكلة البوت اللانهائي في Windows 11؟", category: "computer", author: "خالد العلي", avatar: "خ", time: "منذ ساعة", replies: 12, views: 245, likes: 8, solved: true, content: "جهازي يعيد التشغيل باستمرار بعد تحديث Windows 11 الأخير. جربت Safe Mode ولكن المشكلة مستمرة. هل من حل؟", createdAt: NOW - 3600_000 },
  { id: 2, title: "أفضل أدوات AI مجانية لتحرير الفيديو في 2026", category: "ai", author: "سارة أحمد", avatar: "س", time: "منذ 3 ساعات", replies: 8, views: 189, likes: 15, solved: false, content: "أبحث عن أدوات AI مجانية أو رخيصة لتحرير الفيديو تدعم اللغة العربية. شاركونا تجاربكم!", createdAt: NOW - 3 * 3600_000 },
  { id: 3, title: "شرح مفصل: كيفية عمل Root لهاتف Samsung Galaxy S25", category: "phones", author: "محمد السالم", avatar: "م", time: "منذ 5 ساعات", replies: 23, views: 567, likes: 32, solved: true, content: "دليل شامل لعمل Root لـ Galaxy S25 مع التحذيرات والنصائح. تابعوا الخطوات بعناية.", createdAt: NOW - 5 * 3600_000 },
  { id: 4, title: "مشروع: بناء متجر إلكتروني بـ React و Node.js", category: "programming", author: "نورة الدوسري", avatar: "ن", time: "أمس", replies: 45, views: 890, likes: 67, solved: false, content: "شاركوا رحلة بناء متجر إلكتروني كامل من الصفر. سأنشر الكود على GitHub تدريجياً.", createdAt: NOW - 26 * 3600_000 },
  { id: 5, title: "إعدادات الكاميرا المثالية للتصوير الليلي بدون تريبود", category: "cameras", author: "فهد القحطاني", avatar: "ف", time: "أمس", replies: 6, views: 134, likes: 11, solved: false, content: "ما هي أفضل إعدادات ISO و Shutter Speed للتصوير الليلي بدون تريبود؟", createdAt: NOW - 30 * 3600_000 },
  { id: 6, title: "مقارنة بين Claude 4 و GPT-5: أي نموذج أفضل للبرمجة؟", category: "ai", author: "ليلى الحربي", avatar: "ل", time: "منذ يومين", replies: 34, views: 1200, likes: 89, solved: false, content: "اختبرت النموذجين على عدة مهام برمجية. إليكم النتائج المفصلة...", createdAt: NOW - 48 * 3600_000 },
  { id: 7, title: "حل مشكلة بطء الأداء بعد تثبيت Kali Linux على VirtualBox", category: "computer", author: "عبدالله المطيري", avatar: "ع", time: "منذ يومين", replies: 9, views: 312, likes: 14, solved: true, content: "بعد تثبيت Kali Linux على VirtualBox أصبح النظام بطيئاً جداً. الحل في إعدادات VirtualBox.", createdAt: NOW - 50 * 3600_000 },
  { id: 8, title: "اقتراح: إضافة قسم خاص بالأمن السيبراني", category: "general", author: "ريم الشمري", avatar: "ر", time: "منذ 3 أيام", replies: 18, views: 456, likes: 42, solved: false, content: "أقترح إضافة قسم جديد للأمن السيبراني يشمل اختبار الاختراق والحماية.", createdAt: NOW - 72 * 3600_000 },
];

const MOCK_REPLIES: Reply[] = [
  { id: 1, topicId: 1, author: "يوسف الغامدي", avatar: "ي", time: "منذ 45 دقيقة", content: "جرب استخدام Media Creation Tool لإعادة تثبيت Windows 11 مع الاحتفاظ بالملفات. حلت المشكلة عندي.", likes: 5 },
  { id: 2, topicId: 1, author: "هند البقمي", avatar: "هـ", time: "منذ 30 دقيقة", content: "تحقق من تعريفات chipset الخاصة بلوحة الأم. التحديث الأخير غالباً يسبب تعارض في التعريفات.", likes: 3 },
  { id: 3, topicId: 3, author: "سعد العتيبي", avatar: "س", time: "منذ ساعتين", content: "تحذير: عمل Root يلغي الضمان وقد يسبب مشاكل في Samsung Pay والتطبيقات المصرفية.", likes: 12 },
];

// ============ STORAGE ============
const K_TOPICS = "ilearn-forum-topics";
const K_REPLIES = "ilearn-forum-replies";
const K_LIKES = "ilearn-forum-likes";

function loadTopics(): Topic[] {
  if (typeof window === "undefined") return MOCK_TOPICS;
  try {
    const raw = localStorage.getItem(K_TOPICS);
    if (!raw) return MOCK_TOPICS;
    const parsed = JSON.parse(raw) as Topic[];
    return Array.isArray(parsed) && parsed.length ? parsed : MOCK_TOPICS;
  } catch { return MOCK_TOPICS; }
}
function saveTopics(t: Topic[]) { try { localStorage.setItem(K_TOPICS, JSON.stringify(t)); } catch { /* noop */ } }

function loadReplies(): Reply[] {
  if (typeof window === "undefined") return MOCK_REPLIES;
  try {
    const raw = localStorage.getItem(K_REPLIES);
    if (!raw) return MOCK_REPLIES;
    const parsed = JSON.parse(raw) as Reply[];
    return Array.isArray(parsed) ? parsed : MOCK_REPLIES;
  } catch { return MOCK_REPLIES; }
}
function saveReplies(r: Reply[]) { try { localStorage.setItem(K_REPLIES, JSON.stringify(r)); } catch { /* noop */ } }

function loadLikes(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(K_LIKES) || "{}"); } catch { return {}; }
}
function saveLikes(l: Record<string, boolean>) { try { localStorage.setItem(K_LIKES, JSON.stringify(l)); } catch { /* noop */ } }

// ============ ROUTE ============
type ForumSearch = { topic?: number; category?: string };

export const Route = createFileRoute("/forum")({
  validateSearch: (raw: Record<string, unknown>): ForumSearch => {
    const topicRaw = raw.topic;
    const topic =
      typeof topicRaw === "number" ? topicRaw :
      typeof topicRaw === "string" && topicRaw ? Number(topicRaw) || undefined :
      undefined;
    const category = typeof raw.category === "string" ? raw.category : undefined;
    return { topic, category };
  },
  head: () => ({
    meta: [
      { title: "iLearn — منتدى المجتمع" },
      { name: "description", content: "شارك معرفتك واسأل وتعلم مع مجتمع iLearn" },
    ],
  }),
  component: ForumPage,
});

type Filter = "all" | "popular" | "newest" | "unanswered" | "solved";

function ForumPage() {
  const { topic: topicId, category: catFromUrl } = Route.useSearch();
  const navigate = useNavigate({ from: "/forum" });

  const [topics, setTopics] = useState<Topic[]>(() => loadTopics());
  const [replies, setReplies] = useState<Reply[]>(() => loadReplies());
  const [likes, setLikes] = useState<Record<string, boolean>>(() => loadLikes());
  const [filter, setFilter] = useState<Filter>("all");
  const [activeCat, setActiveCat] = useState<Category | null>(
    (catFromUrl as Category) && CAT_MAP[catFromUrl as Category] ? (catFromUrl as Category) : null,
  );
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => { saveTopics(topics); }, [topics]);
  useEffect(() => { saveReplies(replies); }, [replies]);
  useEffect(() => { saveLikes(likes); }, [likes]);

  // category counts
  const catStats = useMemo(() => {
    const m: Record<Category, { topics: number; replies: number; lastAt: number }> = {} as never;
    for (const c of CATEGORIES) m[c.id] = { topics: 0, replies: 0, lastAt: 0 };
    for (const t of topics) {
      m[t.category].topics += 1;
      m[t.category].replies += t.replies;
      m[t.category].lastAt = Math.max(m[t.category].lastAt, t.createdAt);
    }
    return m;
  }, [topics]);

  const filteredTopics = useMemo(() => {
    let list = topics.slice();
    if (activeCat) list = list.filter((t) => t.category === activeCat);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }
    switch (filter) {
      case "popular": list.sort((a, b) => b.views - a.views); break;
      case "newest": list.sort((a, b) => b.createdAt - a.createdAt); break;
      case "unanswered": list = list.filter((t) => t.replies === 0); break;
      case "solved": list = list.filter((t) => t.solved); break;
      default: list.sort((a, b) => b.createdAt - a.createdAt);
    }
    return list;
  }, [topics, activeCat, query, filter]);

  const totalTopics = topics.length;
  const activeToday = topics.filter((t) => Date.now() - t.createdAt < 24 * 3600_000).length;
  const memberCount = 1248;

  const currentTopic = topicId ? topics.find((t) => t.id === topicId) : undefined;
  const currentReplies = currentTopic ? replies.filter((r) => r.topicId === currentTopic.id) : [];
  const relatedTopics = currentTopic
    ? topics.filter((t) => t.category === currentTopic.category && t.id !== currentTopic.id).slice(0, 3)
    : [];

  // increase views when opening a topic
  useEffect(() => {
    if (!currentTopic) return;
    setTopics((prev) => prev.map((t) => t.id === currentTopic.id ? { ...t, views: t.views + 1 } : t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  const toggleTopicLike = (id: number) => {
    const key = `topic-${id}`;
    const liked = !!likes[key];
    setLikes({ ...likes, [key]: !liked });
    setTopics((prev) => prev.map((t) => t.id === id ? { ...t, likes: Math.max(0, t.likes + (liked ? -1 : 1)) } : t));
  };
  const toggleReplyLike = (id: number) => {
    const key = `reply-${id}`;
    const liked = !!likes[key];
    setLikes({ ...likes, [key]: !liked });
    setReplies((prev) => prev.map((r) => r.id === id ? { ...r, likes: Math.max(0, r.likes + (liked ? -1 : 1)) } : r));
  };

  const [replyText, setReplyText] = useState("");
  const submitReply = () => {
    if (!currentTopic || !replyText.trim()) return;
    const newReply: Reply = {
      id: Date.now(),
      topicId: currentTopic.id,
      author: "أحمد محمد",
      avatar: "أ",
      time: "الآن",
      content: replyText.trim(),
      likes: 0,
    };
    setReplies((prev) => [...prev, newReply]);
    setTopics((prev) => prev.map((t) => t.id === currentTopic.id ? { ...t, replies: t.replies + 1 } : t));
    setReplyText("");
    toast.success("تم نشر الرد");
  };

  const createTopic = (data: { title: string; category: Category; content: string }) => {
    const t: Topic = {
      id: Date.now(),
      title: data.title,
      category: data.category,
      author: "أحمد محمد",
      avatar: "أ",
      time: "الآن",
      replies: 0,
      views: 0,
      likes: 0,
      solved: false,
      content: data.content,
      createdAt: Date.now(),
    };
    setTopics((prev) => [t, ...prev]);
    setShowNew(false);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 1500);
    toast.success("تم نشر موضوعك بنجاح 🎉");
  };

  // ====== TOPIC DETAIL VIEW ======
  if (currentTopic) {
    const cat = CAT_MAP[currentTopic.category];
    const liked = !!likes[`topic-${currentTopic.id}`];
    return (
      <div className="min-h-screen bg-background text-foreground" dir="rtl">
        <div className="mx-auto max-w-5xl px-4 py-8 animate-fade-in">
          <button
            onClick={() => navigate({ search: { topic: undefined, category: activeCat ?? undefined } })}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="size-4" />
            رجوع للمنتدى
          </button>

          <article className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <Avatar letter={currentTopic.avatar} color={cat.color} size={56} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: `${cat.color}22`, color: cat.color }}>
                    {cat.name}
                  </span>
                  {currentTopic.solved ? (
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-success/15 text-success inline-flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> محلول
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-primary/15 text-primary inline-flex items-center gap-1">
                      <Circle className="size-3" /> مفتوح
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{currentTopic.title}</h1>
                <div className="text-sm text-muted-foreground">
                  بواسطة <span className="text-foreground font-medium">{currentTopic.author}</span> · المستوى 5 · {currentTopic.time}
                </div>
              </div>
            </div>

            <p className="mt-6 text-base leading-loose text-foreground/90 whitespace-pre-wrap">
              {currentTopic.content}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t">
              <button
                onClick={() => toggleTopicLike(currentTopic.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all hover:-translate-y-0.5 ${liked ? "bg-rose-500/15 border-rose-500/40 text-rose-500" : "bg-card hover:bg-accent"}`}
              >
                <Heart className={`size-4 ${liked ? "fill-current" : ""}`} /> {currentTopic.likes}
              </button>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("تم نسخ الرابط"); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-accent text-sm"
              >
                <Share2 className="size-4" /> مشاركة
              </button>
              <button
                onClick={() => toast.info("تم إرسال البلاغ")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-accent text-sm"
              >
                <Flag className="size-4" /> بلاغ
              </button>
              <div className="ms-auto flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Eye className="size-4" /> {currentTopic.views}</span>
                <span className="inline-flex items-center gap-1"><MessageCircle className="size-4" /> {currentTopic.replies}</span>
              </div>
            </div>
          </article>

          {/* Replies */}
          <section className="mt-8">
            <h2 className="text-xl font-bold mb-4">الردود ({currentReplies.length})</h2>
            <div className="space-y-3">
              {currentReplies.length === 0 ? (
                <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
                  لا توجد ردود بعد — كن أول من يجيب!
                </div>
              ) : currentReplies.map((r, i) => {
                const liked = !!likes[`reply-${r.id}`];
                return (
                  <div key={r.id} className="rounded-xl border bg-card p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-start gap-3">
                      <Avatar letter={r.avatar} color={cat.color} size={40} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold">{r.author}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{r.time}</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{r.content}</p>
                        <button
                          onClick={() => toggleReplyLike(r.id)}
                          className={`mt-3 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors ${liked ? "bg-rose-500/15 border-rose-500/40 text-rose-500" : "hover:bg-accent"}`}
                        >
                          <Heart className={`size-3.5 ${liked ? "fill-current" : ""}`} /> {r.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* New reply */}
            <div className="mt-6 rounded-xl border bg-card p-4">
              <h3 className="text-sm font-semibold mb-2">رد جديد</h3>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                placeholder="اكتب ردك هنا..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={submitReply}
                  disabled={!replyText.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="size-4" /> إرسال
                </button>
              </div>
            </div>
          </section>

          {/* Related */}
          {relatedTopics.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold mb-4">مواضيع ذات صلة</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {relatedTopics.map((t) => (
                  <Link
                    key={t.id}
                    to="/forum"
                    search={{ topic: t.id, category: activeCat ?? undefined }}
                    className="rounded-xl border bg-card p-4 hover:-translate-y-1 transition-transform"
                  >
                    <div className="text-xs mb-1" style={{ color: cat.color }}>{cat.name}</div>
                    <div className="text-sm font-semibold line-clamp-2">{t.title}</div>
                    <div className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-3">
                      <span className="inline-flex items-center gap-1"><MessageCircle className="size-3" />{t.replies}</span>
                      <span className="inline-flex items-center gap-1"><Eye className="size-3" />{t.views}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ====== FORUM HOME ======
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Confetti trigger={confetti} />
      <div className="mx-auto max-w-7xl px-4 py-8 animate-fade-in">
        {/* Back */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowRight className="size-4" /> الرئيسية
        </Link>

        {/* Header */}
        <header className="rounded-2xl bg-gradient-to-br from-primary to-secondary p-6 md:p-8 text-primary-foreground relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">💬 منتدى iLearn</h1>
              <p className="text-sm md:text-base opacity-90">شارك معرفتك، اسأل، تعلم مع مجتمع iLearn</p>
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur border border-white/30 font-semibold transition-all hover:-translate-y-0.5"
            >
              <Plus className="size-5" /> موضوع جديد
            </button>
          </div>
          <div className="relative z-10 mt-6 grid grid-cols-3 gap-3 max-w-xl">
            <Stat label="مواضيع" value={totalTopics} />
            <Stat label="أعضاء" value={memberCount} />
            <Stat label="نشط اليوم" value={activeToday} />
          </div>
        </header>

        {/* Categories */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">الأقسام</h2>
            {activeCat && (
              <button onClick={() => setActiveCat(null)} className="text-xs text-primary hover:underline">إلغاء التصفية</button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((c, i) => {
              const Icon = c.icon;
              const stats = catStats[c.id];
              const active = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(active ? null : c.id)}
                  className={`group text-right rounded-2xl border bg-card p-5 hover:-translate-y-1 hover:shadow-lg transition-all animate-slide-up ${active ? "ring-2 ring-primary" : ""}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="size-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${c.color}22`, color: c.color }}
                    >
                      <Icon className="size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base mb-1">{c.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{c.desc}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{stats.topics} موضوع · {stats.replies} رد</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filters + Search */}
        <section className="mt-8 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {([
              ["all", "الكل"],
              ["popular", "الأكثر زيارة"],
              ["newest", "الأحدث"],
              ["unanswered", "بدون رد"],
              ["solved", "محلول"],
            ] as [Filter, string][]).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`whitespace-nowrap text-sm px-4 py-2 rounded-lg border transition-colors ${filter === k ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative md:w-72">
            <Search className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث في المواضيع..."
              className="w-full rounded-lg border bg-card pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </section>

        {/* Topics */}
        <section className="mt-6 space-y-2">
          {filteredTopics.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
              لا توجد مواضيع مطابقة
            </div>
          ) : filteredTopics.map((t, i) => {
            const cat = CAT_MAP[t.category];
            return (
              <Link
                key={t.id}
                to="/forum"
                search={{ topic: t.id, category: activeCat ?? undefined }}
                className="block rounded-xl border bg-card p-4 hover:-translate-y-0.5 hover:shadow-md transition-all animate-fade-in"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  <Avatar letter={t.avatar} color={cat.color} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">{t.title}</h3>
                      {t.solved ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="size-3" /> محلول
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium inline-flex items-center gap-1">
                          <Circle className="size-3" /> مفتوح
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 rounded-full font-medium" style={{ background: `${cat.color}22`, color: cat.color }}>{cat.name}</span>
                      <span>·</span>
                      <span>{t.author}</span>
                      <span>·</span>
                      <span>{t.time}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0">
                    <span className="inline-flex items-center gap-1"><MessageCircle className="size-3.5" />{t.replies}</span>
                    <span className="inline-flex items-center gap-1"><Eye className="size-3.5" />{t.views}</span>
                    <span className="inline-flex items-center gap-1"><Heart className="size-3.5" />{t.likes}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </div>

      {showNew && <NewTopicModal onClose={() => setShowNew(false)} onCreate={createTopic} />}
    </div>
  );
}

// ============ HELPERS ============
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/15 backdrop-blur border border-white/20 px-3 py-2">
      <div className="text-xl font-bold">{value.toLocaleString("ar")}</div>
      <div className="text-[11px] opacity-90">{label}</div>
    </div>
  );
}

function Avatar({ letter, color, size = 40 }: { letter: string; color: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${color}, ${color}aa)`, fontSize: size * 0.4 }}
      aria-hidden
    >
      {letter}
    </div>
  );
}

function NewTopicModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (d: { title: string; category: Category; content: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("general");
  const [content, setContent] = useState("");

  const submit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("الرجاء تعبئة العنوان والمحتوى");
      return;
    }
    onCreate({ title: title.trim(), category, content: content.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-card border shadow-2xl p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">موضوع جديد</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-accent"><X className="size-5" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">عنوان الموضوع</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان واضح ومختصر..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">القسم</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">المحتوى</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="اشرح موضوعك بالتفصيل..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border bg-card hover:bg-accent text-sm">إلغاء</button>
          <button onClick={submit} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">نشر</button>
        </div>
      </div>
    </div>
  );
}