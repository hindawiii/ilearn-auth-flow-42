import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, ArrowLeft, Play, FileText, Terminal, Lock, CheckCircle2,
  Circle, ChevronDown, Clock, Save, Trophy, BookOpen, Rocket, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Confetti } from "@/components/Confetti";
import { checkAchievements } from "@/lib/achievements";
import { addNotification } from "@/lib/notifications";

// ============ TYPES ============
type LessonType = "video" | "article" | "practical" | "project";
type PLang = "python" | "javascript";
type QuizQ = { question: string; options: string[]; correct: number };
type PLesson = {
  id: number; module: 1 | 2 | 3 | 4; title: string;
  duration: string; type: LessonType; xp: number;
  content: string;
  code?: string;
  playground?: { lang: PLang; starter: string } | null;
  projectSteps?: string[];
  quiz: QuizQ[];
};

// ============ HELPERS ============
const dq = (topic: string): QuizQ[] => [
  { question: `ما الفائدة الأهم من تعلّم "${topic}"؟`,
    options: ["لا فائدة", "بناء مشاريع حقيقية وحل مشاكل", "للترفيه فقط", "للحفظ بدون فهم"], correct: 1 },
  { question: "ما أفضل طريقة لإتقان البرمجة؟",
    options: ["القراءة فقط", "الكتابة العملية المستمرة", "تجاهل الأخطاء", "نسخ الأكواد دون فهم"], correct: 1 },
  { question: "ما أهمية قراءة الـ Documentation؟",
    options: ["لا أهمية", "مرجع أساسي ودقيق", "مضيعة وقت", "للمبتدئين فقط"], correct: 1 },
];

const rc = (intro: string, points: string[]) =>
  `${intro}\n\n` + points.map((p, i) => `${i + 1}. ${p}`).join("\n") +
  `\n\nنصيحة: ابنِ مشروعاً صغيراً بعد كل درس — التطبيق هو ما يثبّت المفاهيم.`;

// ============ DATA — 40 LESSONS ============
export const PROGRAMMING_LESSONS: PLesson[] = [
  // ===== Module 1: أساسيات البرمجة =====
  { id: 1, module: 1, title: "ما هي البرمجة؟", duration: "15 دقيقة", type: "video", xp: 50,
    content: rc("البرمجة هي فن إعطاء تعليمات دقيقة للحاسوب لتنفيذ مهمة. تبدأ بفكرة، ثم خوارزمية (Algorithm)، ثم مخطط تدفقي (Flowchart)، ثم كود.",
      ["Algorithm: خطوات منظمة لحل مشكلة", "Flowchart: تمثيل بصري للخوارزمية",
       "Pseudocode: كتابة المنطق بلغة طبيعية قبل الكود", "كل لغة برمجة أداة — اختر الأنسب للمهمة"]),
    quiz: [
      { question: "ما هي لغة البرمجة الأكثر شيوعاً اليوم؟", options: ["COBOL", "Python", "Pascal", "Fortran"], correct: 1 },
      { question: "ما هو Algorithm؟", options: ["برنامج كامل", "خطوات حل مشكلة", "قاعدة بيانات", "موقع ويب"], correct: 1 },
      { question: "ما الفرق بين Pseudocode والكود الحقيقي؟", options: ["لا فرق", "Pseudocode بلغة طبيعية لتوضيح المنطق", "Pseudocode أسرع", "Pseudocode أصعب"], correct: 1 },
    ] },
  { id: 2, module: 1, title: "لغة Python: من الصفر إلى الاحتراف", duration: "25 دقيقة", type: "article", xp: 60,
    content: rc("Python لغة سهلة القراءة، قوية، وتُستخدم في الويب، الذكاء الاصطناعي، تحليل البيانات، والأتمتة.",
      ["تثبيت Python من python.org", "استخدم بيئة افتراضية venv لكل مشروع",
       "IDE موصى به: VS Code أو PyCharm", "ابدأ بـ print() وتعرف على REPL"]),
    code: `# أول برنامج Python\nprint("Hello, iLearn!")\n\nname = "أحمد"\nage = 25\nprint(f"اسمي {name} وعمري {age}")`,
    playground: { lang: "python", starter: `print("مرحباً بك في iLearn")\nname = "Lovable"\nprint(f"أهلاً {name}!")` },
    quiz: [
      { question: "كيف تطبع نصاً في Python؟", options: ["echo()", "print()", "console.log()", "printf()"], correct: 1 },
      { question: "ما هو f-string؟", options: ["نوع متغير", "تنسيق نصوص ديناميكي", "دالة جاهزة", "مكتبة"], correct: 1 },
      { question: "أفضل أداة لعزل مكتبات المشروع؟", options: ["pip فقط", "venv", "git", "VS Code"], correct: 1 },
    ] },
  { id: 3, module: 1, title: "المتغيرات وأنواع البيانات والعمليات", duration: "20 دقيقة", type: "practical", xp: 55,
    content: rc("المتغيرات حاويات للبيانات. Python تستنتج النوع تلقائياً (Dynamic Typing).",
      ["int, float, str, bool, list, dict, tuple", "Type Casting: int(\"5\")، str(10)",
       "العمليات الحسابية: + - * / // % **", "العمليات المنطقية: and, or, not"]),
    code: `x = 10\ny = 3\nprint(x + y, x - y, x * y)\nprint(x / y)   # قسمة عشرية\nprint(x // y)  # قسمة صحيحة\nprint(x % y)   # باقي القسمة\nprint(x ** y)  # أس`,
    playground: { lang: "python", starter: `a = 5\nb = 2\nprint("الجمع:", a + b)\nprint("الأس:", a ** b)` },
    quiz: dq("المتغيرات") },
  { id: 4, module: 1, title: "الجمل الشرطية (if, else, elif)", duration: "18 دقيقة", type: "practical", xp: 55,
    content: rc("الجمل الشرطية تتيح للبرنامج اتخاذ قرارات بناءً على ظروف.",
      ["if للشرط الرئيسي", "elif لشروط بديلة", "else لكل ما تبقى", "يمكن تداخل الشروط (Nested)"]),
    code: `age = 20\nif age < 13:\n    print("طفل")\nelif age < 18:\n    print("مراهق")\nelse:\n    print("بالغ")`,
    playground: { lang: "python", starter: `x = 15\nif x > 10:\n    print("كبير")\nelse:\n    print("صغير")` },
    quiz: dq("الجمل الشرطية") },
  { id: 5, module: 1, title: "الحلقات التكرارية (for, while)", duration: "20 دقيقة", type: "practical", xp: 55,
    content: rc("الحلقات تنفّذ كوداً عدة مرات — أساس كل خوارزمية تقريباً.",
      ["for للتكرار على متتاليات", "while للتكرار بشرط", "break للخروج المبكر",
       "continue لتخطّي الدورة الحالية"]),
    code: `for i in range(5):\n    print("رقم:", i)\n\nn = 0\nwhile n < 3:\n    print("while:", n)\n    n += 1`,
    playground: { lang: "python", starter: `for i in range(1, 6):\n    print(i, "×", i, "=", i*i)` },
    quiz: dq("الحلقات") },
  { id: 6, module: 1, title: "الدوال والبرمجة الوظيفية", duration: "22 دقيقة", type: "practical", xp: 60,
    content: rc("الدوال (Functions) تجمّع كوداً قابلاً لإعادة الاستخدام — مفتاح التنظيم.",
      ["def لتعريف الدالة", "return لإرجاع قيمة", "Default Args و *args و **kwargs",
       "lambda للدوال السريعة", "map, filter, reduce: مفاهيم وظيفية"]),
    code: `def greet(name, greeting="مرحباً"):\n    return f"{greeting} {name}"\n\nprint(greet("أحمد"))\nprint(greet("سارة", greeting="أهلاً"))`,
    playground: { lang: "python", starter: `def square(x):\n    return x * x\n\nfor i in range(1, 5):\n    print(square(i))` },
    quiz: dq("الدوال") },
  { id: 7, module: 1, title: "القوائم والقواميس (Lists, Dictionaries)", duration: "20 دقيقة", type: "practical", xp: 55,
    content: rc("هياكل البيانات الأساسية في Python.",
      ["List: مرتّبة، قابلة للتعديل [1,2,3]", "Dict: مفتاح-قيمة {\"name\":\"أحمد\"}",
       "Tuple: مرتّبة، غير قابلة للتعديل (1,2)", "Set: مجموعة فريدة بدون تكرار"]),
    code: `nums = [1, 2, 3, 4]\nnums.append(5)\nprint(sum(nums))\n\nuser = {"name": "أحمد", "age": 25}\nprint(user["name"])\nuser["email"] = "a@b.com"\nprint(user)`,
    playground: { lang: "python", starter: `cart = ["تفاح", "موز", "خبز"]\nfor item in cart:\n    print("-", item)` },
    quiz: dq("القوائم والقواميس") },
  { id: 8, module: 1, title: "التعامل مع الملفات (File I/O)", duration: "15 دقيقة", type: "article", xp: 50,
    content: rc("قراءة وكتابة الملفات أساس كل تطبيق حقيقي.",
      ["open(path, mode): r, w, a, rb", "استخدم with لإغلاق آمن",
       "json.dump/load لحفظ بيانات منظمة", "احذر مسارات الملفات النسبية"]),
    code: `with open("data.txt", "w", encoding="utf-8") as f:\n    f.write("مرحباً iLearn")\n\nwith open("data.txt", "r", encoding="utf-8") as f:\n    print(f.read())`,
    quiz: dq("الملفات") },
  { id: 9, module: 1, title: "البرمجة كائنية التوجه (OOP)", duration: "30 دقيقة", type: "article", xp: 70,
    content: rc("OOP تنظّم الكود حول كائنات (Objects) تحمل بيانات وسلوكاً.",
      ["Class: قالب", "Object: نسخة من الكلاس",
       "Inheritance: وراثة بين الكلاسات", "Encapsulation, Polymorphism, Abstraction"]),
    code: `class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return f"{self.name} يصدر صوتاً"\n\nclass Dog(Animal):\n    def speak(self):\n        return f"{self.name} ينبح"\n\nd = Dog("ريكس")\nprint(d.speak())`,
    quiz: dq("OOP") },
  { id: 10, module: 1, title: "مكتبات Python الأساسية", duration: "20 دقيقة", type: "article", xp: 55,
    content: rc("المكتبات تختصر آلاف أسطر الكود.",
      ["NumPy: حسابات رقمية ومصفوفات", "Pandas: تحليل بيانات جدولية",
       "Requests: استدعاء APIs بسهولة", "Matplotlib/Seaborn: رسومات بيانية"]),
    code: `import requests\nr = requests.get("https://api.github.com")\nprint(r.status_code)\nprint(r.json().get("current_user_url"))`,
    quiz: dq("مكتبات Python") },

  // ===== Module 2: Frontend =====
  { id: 11, module: 2, title: "HTML5: بناء هيكل الصفحة", duration: "20 دقيقة", type: "practical", xp: 55,
    content: rc("HTML هيكل أي صفحة ويب — العظام التي تبنى عليها الواجهة.",
      ["العناصر الدلالية: header, nav, main, footer", "النماذج (Forms): input, select, textarea",
       "الوسائط: img, video, audio", "إمكانية الوصول (a11y): alt, aria-*"]),
    code: `<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n  <head><meta charset="UTF-8"><title>iLearn</title></head>\n  <body>\n    <header><h1>مرحباً بك</h1></header>\n    <main><p>أول صفحة لي</p></main>\n  </body>\n</html>`,
    quiz: dq("HTML5") },
  { id: 12, module: 2, title: "CSS3: التصميم والتنسيق (Flexbox, Grid)", duration: "25 دقيقة", type: "practical", xp: 60,
    content: rc("CSS يكسو الهيكل بالألوان والتخطيطات.",
      ["Selectors و Specificity", "Box Model: margin, border, padding, content",
       "Flexbox: تخطيط أحادي البعد", "Grid: تخطيط ثنائي البعد قوي جداً"]),
    code: `.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}\n.card { padding: 16px; background: #fff; border-radius: 12px; }`,
    quiz: dq("CSS3") },
  { id: 13, module: 2, title: "JavaScript: الأساسيات والمتقدم (ES6+)", duration: "30 دقيقة", type: "practical", xp: 70,
    content: rc("JavaScript تُحرّك الصفحة وتجعلها تفاعلية.",
      ["let, const, var — استخدم let/const", "Arrow Functions: () => {}",
       "Destructuring و Spread", "Promises و async/await"]),
    code: `const users = [{name:"أحمد"},{name:"سارة"}];\nconst names = users.map(u => u.name);\nconsole.log(names.join(" - "));`,
    playground: { lang: "javascript", starter: `const nums = [1,2,3,4,5];\nconst doubled = nums.map(n => n * 2);\nconsole.log(doubled);` },
    quiz: dq("JavaScript") },
  { id: 14, module: 2, title: "DOM Manipulation والأحداث", duration: "22 دقيقة", type: "practical", xp: 60,
    content: rc("DOM هو تمثيل JavaScript للصفحة — يمكنك قراءته وتعديله.",
      ["querySelector / querySelectorAll", "addEventListener('click', fn)",
       "createElement و appendChild", "احذر التعديل المباشر المتكرر — استخدم Fragments"]),
    code: `document.querySelector("#btn").addEventListener("click", () => {\n  document.querySelector("#out").textContent = "تم النقر!";\n});`,
    playground: { lang: "javascript", starter: `const arr = ["تفاح","موز","خبز"];\narr.forEach(x => console.log("-", x));` },
    quiz: dq("DOM") },
  { id: 15, module: 2, title: "Responsive Design (Mobile-First)", duration: "18 دقيقة", type: "article", xp: 55,
    content: rc("اليوم 60% من الزيارات من الموبايل — صمّم لها أولاً.",
      ["Mobile-First: ابدأ بأصغر شاشة", "Media Queries: @media (min-width: 768px)",
       "rem/em أفضل من px", "اختبر على أجهزة حقيقية"]),
    code: `@media (min-width: 768px) {\n  .grid { grid-template-columns: repeat(3, 1fr); }\n}`,
    quiz: dq("Responsive Design") },
  { id: 16, module: 2, title: "Tailwind CSS / Bootstrap", duration: "20 دقيقة", type: "article", xp: 55,
    content: rc("أطر CSS تختصر وقت التصميم بشكل كبير.",
      ["Tailwind: utility-first، تخصيص واسع", "Bootstrap: مكونات جاهزة سريعة",
       "Tailwind أنسب للمشاريع الحديثة", "استخدم @apply لتجميع classes متكررة"]),
    code: `<button class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">\n  زر Tailwind\n</button>`,
    quiz: dq("Tailwind") },
  { id: 17, module: 2, title: "React.js: المكونات والحالة", duration: "30 دقيقة", type: "practical", xp: 75,
    content: rc("React مكتبة لبناء واجهات المستخدم عبر مكونات قابلة لإعادة الاستخدام.",
      ["Component: دالة ترجع JSX", "Props: بيانات من الأب",
       "State: بيانات داخلية تتغيّر", "إعادة الرسم تلقائية عند تغيير State"]),
    code: `import { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <h1>العداد: {count}</h1>\n      <button onClick={() => setCount(count + 1)}>زيادة</button>\n    </div>\n  );\n}`,
    playground: { lang: "javascript", starter: `// محاكاة منطق المكون\nlet count = 0;\nfunction increment() { count++; console.log("العداد:", count); }\nincrement(); increment(); increment();` },
    quiz: dq("React") },
  { id: 18, module: 2, title: "React Hooks (useState, useEffect, useContext)", duration: "28 دقيقة", type: "practical", xp: 70,
    content: rc("الـ Hooks تسمح باستخدام الحالة والـ Lifecycle داخل المكونات الدالة.",
      ["useState: حالة محلية", "useEffect: عند التركيب/التحديث",
       "useContext: مشاركة بيانات عبر شجرة المكونات", "useMemo, useCallback للأداء"]),
    code: `useEffect(() => {\n  const id = setInterval(() => setTime(Date.now()), 1000);\n  return () => clearInterval(id);\n}, []);`,
    quiz: dq("React Hooks") },
  { id: 19, module: 2, title: "React Router وإدارة التنقل", duration: "20 دقيقة", type: "article", xp: 60,
    content: rc("التنقل بين الصفحات بدون إعادة تحميل = SPA حقيقي.",
      ["BrowserRouter, Routes, Route", "Link بدلاً من <a>",
       "useNavigate للتنقل البرمجي", "Nested Routes للتخطيطات"]),
    code: `<Routes>\n  <Route path="/" element={<Home/>} />\n  <Route path="/about" element={<About/>} />\n</Routes>`,
    quiz: dq("React Router") },
  { id: 20, module: 2, title: "مشروع: بناء Portfolio Website", duration: "40 دقيقة", type: "project", xp: 120,
    content: rc("اجمع كل ما تعلّمته في موقع Portfolio شخصي.",
      ["تصميم Mobile-First مع Tailwind", "React + Router للصفحات (Home, About, Projects, Contact)",
       "نموذج اتصال يحفظ في localStorage", "النشر على Vercel أو Netlify"]),
    projectSteps: [
      "تجهيز Vite + React + Tailwind",
      "بناء مكون Header مع التنقل",
      "صفحة Home بـ Hero Section",
      "صفحة Projects بشبكة Grid",
      "نموذج Contact مع validation",
      "النشر على Vercel بأمر واحد",
    ],
    code: `npm create vite@latest portfolio -- --template react\ncd portfolio\nnpm install\nnpm run dev`,
    quiz: dq("مشروع Portfolio") },

  // ===== Module 3: Backend =====
  { id: 21, module: 3, title: "Node.js و Express.js: الخادم", duration: "28 دقيقة", type: "practical", xp: 70,
    content: rc("Node.js يشغّل JavaScript خارج المتصفح، و Express أشهر إطار خادم.",
      ["تثبيت Node من nodejs.org", "npm init -y لبدء مشروع",
       "express() ينشئ تطبيق خادم", "app.listen(3000) لبدء الاستماع"]),
    code: `const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => res.send('مرحباً من iLearn'));\n\napp.listen(3000, () => console.log('Server: http://localhost:3000'));`,
    playground: { lang: "javascript", starter: `// محاكاة استجابة API\nconst response = { status: 200, data: { msg: "مرحباً" } };\nconsole.log(JSON.stringify(response, null, 2));` },
    quiz: dq("Node.js") },
  { id: 22, module: 3, title: "قواعد البيانات SQL", duration: "30 دقيقة", type: "article", xp: 70,
    content: rc("SQL لغة الاستعلام عن قواعد البيانات العلائقية.",
      ["SELECT, INSERT, UPDATE, DELETE", "JOIN لربط الجداول",
       "PRIMARY KEY و FOREIGN KEY", "الفهارس (Indexes) لتسريع الاستعلامات"]),
    code: `CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  email VARCHAR(255) UNIQUE\n);\n\nINSERT INTO users (name, email) VALUES ('أحمد', 'a@b.com');\nSELECT * FROM users WHERE name = 'أحمد';`,
    quiz: dq("SQL") },
  { id: 23, module: 3, title: "قواعد البيانات NoSQL (MongoDB)", duration: "25 دقيقة", type: "article", xp: 65,
    content: rc("MongoDB قاعدة بيانات وثائقية مرنة — جيدة للبيانات غير المنتظمة.",
      ["Documents (JSON-like) داخل Collections", "Mongoose: ODM لـ Node.js",
       "تصاميم Embedded vs Referenced", "Aggregation Pipeline للاستعلامات المتقدمة"]),
    code: `const userSchema = new mongoose.Schema({\n  name: String,\n  email: { type: String, unique: true },\n  createdAt: { type: Date, default: Date.now }\n});\nconst User = mongoose.model('User', userSchema);`,
    quiz: dq("MongoDB") },
  { id: 24, module: 3, title: "RESTful APIs: التصميم والتنفيذ", duration: "28 دقيقة", type: "practical", xp: 70,
    content: rc("REST نمط معماري شائع — استخدم الأفعال HTTP بشكل صحيح.",
      ["GET للقراءة، POST للإنشاء", "PUT/PATCH للتحديث، DELETE للحذف",
       "Status Codes: 200, 201, 400, 401, 404, 500", "إرجاع JSON دائماً مع رؤوس صحيحة"]),
    code: `app.get('/api/users', (req, res) => res.json(users));\napp.post('/api/users', (req, res) => {\n  const user = req.body;\n  users.push(user);\n  res.status(201).json(user);\n});`,
    quiz: dq("REST APIs") },
  { id: 25, module: 3, title: "Authentication (JWT, OAuth, Sessions)", duration: "30 دقيقة", type: "article", xp: 75,
    content: rc("التوثيق يحدد من المستخدم — أساس أي تطبيق آمن.",
      ["Sessions: حالة على الخادم + cookie", "JWT: token موقّع بدون حالة",
       "OAuth 2.0 للتسجيل عبر Google/GitHub", "خزّن كلمات المرور دائماً بـ bcrypt"]),
    code: `const jwt = require('jsonwebtoken');\nconst token = jwt.sign({ userId: 123 }, process.env.JWT_SECRET, { expiresIn: '7d' });\nconst payload = jwt.verify(token, process.env.JWT_SECRET);`,
    quiz: dq("Authentication") },
  { id: 26, module: 3, title: "Middleware وإدارة الطلبات", duration: "20 دقيقة", type: "article", xp: 55,
    content: rc("Middleware دوال تعالج الطلب قبل/بعد الـ handler.",
      ["app.use(middleware)", "express.json() لقراءة body",
       "cors() للسماح بطلبات من نطاقات أخرى", "اكتب middleware للـ logging والـ auth"]),
    code: `function logger(req, res, next) {\n  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.path}\`);\n  next();\n}\napp.use(logger);`,
    quiz: dq("Middleware") },
  { id: 27, module: 3, title: "WebSockets: التواصل الفوري", duration: "22 دقيقة", type: "article", xp: 60,
    content: rc("WebSockets تتيح اتصالاً مفتوحاً ثنائي الاتجاه — مثالي للدردشة والإشعارات الفورية.",
      ["Socket.io أشهر مكتبة", "io.on('connection', ...) للاتصال الجديد",
       "socket.emit للإرسال، io.emit للبث", "Rooms لتجميع المستخدمين"]),
    code: `io.on('connection', (socket) => {\n  socket.on('message', (msg) => {\n    io.emit('message', msg);\n  });\n});`,
    quiz: dq("WebSockets") },
  { id: 28, module: 3, title: "نشر التطبيق (Deployment)", duration: "20 دقيقة", type: "article", xp: 55,
    content: rc("التطبيق ليس حقيقياً حتى يصل للمستخدم.",
      ["Vercel/Netlify للـ Frontend", "Render/Railway للـ Backend",
       "متغيرات البيئة (.env) — لا ترفعها لـ Git", "HTTPS مجاناً عبر Let's Encrypt"]),
    code: `# Vercel deploy\nnpm i -g vercel\nvercel --prod\n\n# متغيرات البيئة في لوحة Vercel`,
    quiz: dq("Deployment") },
  { id: 29, module: 3, title: "بناء API كامل (CRUD)", duration: "30 دقيقة", type: "practical", xp: 80,
    content: rc("CRUD = Create, Read, Update, Delete — أساس أي API.",
      ["POST /items — إنشاء", "GET /items و GET /items/:id — قراءة",
       "PUT /items/:id — تحديث", "DELETE /items/:id — حذف"]),
    code: `app.put('/items/:id', (req, res) => {\n  const item = items.find(i => i.id === req.params.id);\n  if (!item) return res.status(404).json({ error: 'Not found' });\n  Object.assign(item, req.body);\n  res.json(item);\n});`,
    quiz: dq("CRUD") },
  { id: 30, module: 3, title: "مشروع: تطبيق تواصل اجتماعي بسيط", duration: "45 دقيقة", type: "project", xp: 150,
    content: rc("اجمع Node + Express + MongoDB في تطبيق ميني-تويتر.",
      ["Auth بـ JWT", "نشر منشورات (Posts)",
       "إعجابات وتعليقات", "Feed مرتّب بالأحدث"]),
    projectSteps: [
      "إعداد مشروع Express + Mongoose",
      "نموذج User و Post",
      "Routes للتسجيل وتسجيل الدخول",
      "CRUD للمنشورات مع حماية بـ JWT",
      "إضافة Likes/Comments",
      "نشر الـ API على Render",
    ],
    code: `// نموذج Post\nconst postSchema = new mongoose.Schema({\n  author: { type: ObjectId, ref: 'User' },\n  content: { type: String, maxlength: 280 },\n  likes: [{ type: ObjectId, ref: 'User' }],\n  createdAt: { type: Date, default: Date.now }\n});`,
    quiz: dq("مشروع تواصل") },

  // ===== Module 4: أكواد جاهزة ومشاريع =====
  { id: 31, module: 4, title: "سكربت أتمتة إعادة تسمية الملفات", duration: "15 دقيقة", type: "practical", xp: 60,
    content: rc("أتمتة المهام المتكررة هي أعظم هدية يقدمها لك Python.",
      ["os.listdir لاستعراض المجلد", "os.rename لإعادة التسمية",
       "استخدم datetime للترقيم الزمني", "اختبر دائماً على نسخة احتياطية"]),
    code: `import os\nfolder = "./photos"\nfor i, name in enumerate(sorted(os.listdir(folder)), 1):\n    src = os.path.join(folder, name)\n    ext = os.path.splitext(name)[1]\n    dst = os.path.join(folder, f"photo_{i:03d}{ext}")\n    os.rename(src, dst)\nprint("تم")`,
    quiz: dq("أتمتة الملفات") },
  { id: 32, module: 4, title: "سكربت تنزيل فيديوهات YouTube", duration: "12 دقيقة", type: "practical", xp: 55,
    content: rc("yt-dlp مكتبة قوية وقانونية لتحميل الفيديوهات (للاستخدام الشخصي).",
      ["pip install yt-dlp", "اختر الجودة بـ format",
       "احترم حقوق النشر دائماً", "للصوت فقط: extractaudio"]),
    code: `import yt_dlp\nopts = { 'format': 'bestvideo+bestaudio/best', 'outtmpl': '%(title)s.%(ext)s' }\nwith yt_dlp.YoutubeDL(opts) as ydl:\n    ydl.download(['https://youtube.com/watch?v=VIDEO_ID'])`,
    quiz: dq("yt-dlp") },
  { id: 33, module: 4, title: "بوت Telegram بسيط", duration: "20 دقيقة", type: "practical", xp: 70,
    content: rc("بوتات Telegram أسهل بكثير مما تظن.",
      ["اطلب توكن من @BotFather", "pip install python-telegram-bot",
       "CommandHandler للأوامر", "MessageHandler للرسائل العادية"]),
    code: `from telegram.ext import Application, CommandHandler\n\nasync def start(update, ctx):\n    await update.message.reply_text("مرحباً من iLearn Bot 👋")\n\napp = Application.builder().token("YOUR_TOKEN").build()\napp.add_handler(CommandHandler("start", start))\napp.run_polling()`,
    quiz: dq("Telegram Bot") },
  { id: 34, module: 4, title: "سكربت إرسال رسائل واتساب", duration: "15 دقيقة", type: "article", xp: 55,
    content: rc("pywhatkit يستخدم WhatsApp Web لإرسال الرسائل.",
      ["pip install pywhatkit", "حدد الوقت بدقة (24h)",
       "احذر من الإزعاج — احترم رغبة المستلم", "للأعمال: استخدم WhatsApp Business API الرسمي"]),
    code: `import pywhatkit\npywhatkit.sendwhatmsg("+9665XXXXXXXX", "مرحباً من iLearn!", 14, 30)`,
    quiz: dq("واتساب أوتوماتيك") },
  { id: 35, module: 4, title: "أداة تحويل PDF إلى Word", duration: "12 دقيقة", type: "practical", xp: 55,
    content: rc("pdf2docx مكتبة بسيطة وفعّالة للتحويل.",
      ["pip install pdf2docx", "تعمل بسطر واحد",
       "احتفظ بالتنسيق الأصلي قدر الإمكان", "للملفات الممسوحة: استخدم OCR (Tesseract)"]),
    code: `from pdf2docx import Converter\ncv = Converter('input.pdf')\ncv.convert('output.docx')\ncv.close()\nprint("تم التحويل")`,
    quiz: dq("PDF to Word") },
  { id: 36, module: 4, title: "سكربت نسخ احتياطي تلقائي", duration: "15 دقيقة", type: "practical", xp: 60,
    content: rc("بياناتك ثمينة — اجعل النسخ الاحتياطي عادة.",
      ["shutil لنسخ المجلدات", "ضغط zip لتوفير المساحة",
       "أضف datetime للأسماء", "جدوله بـ cron أو Task Scheduler"]),
    code: `import shutil, datetime\nstamp = datetime.datetime.now().strftime("%Y%m%d_%H%M")\nshutil.make_archive(f"backup_{stamp}", 'zip', "./important_data")\nprint("تم النسخ:", stamp)`,
    quiz: dq("Backup") },
  { id: 37, module: 4, title: "موقع Weather App (API + Frontend)", duration: "25 دقيقة", type: "project", xp: 90,
    content: rc("استدعِ OpenWeatherMap API واعرض النتيجة بشكل جميل.",
      ["احصل على API key مجاني", "fetch() لاستدعاء الـ API",
       "اعرض الحرارة والوصف بشكل واضح", "أضف أيقونات حسب حالة الطقس"]),
    projectSteps: [
      "تسجيل حساب في openweathermap.org",
      "إنشاء HTML/CSS بسيط مع input للمدينة",
      "استدعاء API بـ fetch()",
      "عرض النتائج وتنسيقها",
      "النشر على Netlify",
    ],
    code: `async function getWeather(city) {\n  const key = 'YOUR_API_KEY';\n  const url = \`https://api.openweathermap.org/data/2.5/weather?q=\${city}&appid=\${key}&units=metric&lang=ar\`;\n  const r = await fetch(url);\n  return r.json();\n}`,
    quiz: dq("Weather App") },
  { id: 38, module: 4, title: "To-Do List App كامل (MERN)", duration: "40 دقيقة", type: "project", xp: 120,
    content: rc("MERN = MongoDB + Express + React + Node — أكثر Stack شعبية.",
      ["Backend: Express + Mongoose", "Frontend: React + Tailwind",
       "ربط الواجهتين بـ fetch/axios", "إضافة Authentication بـ JWT"]),
    projectSteps: [
      "إعداد Server بـ Express + MongoDB",
      "نموذج Todo (title, done, userId)",
      "API: GET/POST/PUT/DELETE /todos",
      "Frontend React مع useState و useEffect",
      "تكامل كامل + اختبار",
      "نشر Backend على Render و Frontend على Vercel",
    ],
    code: `// React side\nuseEffect(() => {\n  fetch('/api/todos')\n    .then(r => r.json())\n    .then(setTodos);\n}, []);`,
    quiz: dq("MERN Todo") },
  { id: 39, module: 4, title: "Chat App بسيط (Socket.io)", duration: "35 دقيقة", type: "project", xp: 110,
    content: rc("دردشة فورية في وقت قياسي مع Socket.io.",
      ["Server: Express + socket.io", "Client: React + socket.io-client",
       "Broadcast الرسائل للجميع", "Rooms للمحادثات الخاصة"]),
    projectSteps: [
      "إعداد Express + socket.io",
      "React Client يتصل بالخادم",
      "نموذج إدخال الاسم والرسالة",
      "بث الرسائل لكل المتصلين",
      "إضافة مؤشر 'يكتب الآن...'",
    ],
    code: `// Server\nio.on('connection', socket => {\n  socket.on('chat', msg => io.emit('chat', msg));\n});\n\n// Client\nsocket.emit('chat', { user, text });\nsocket.on('chat', msg => addMessage(msg));`,
    quiz: dq("Chat App") },
  { id: 40, module: 4, title: "مشروع نهائي: متجر إلكتروني كامل", duration: "60 دقيقة", type: "project", xp: 200,
    content: rc("اجمع كل ما تعلّمته في متجر إلكتروني MERN كامل.",
      ["كتالوج منتجات + بحث وفلترة", "سلة شراء وحفظ في الـ State",
       "Authentication بـ JWT", "بوابة دفع تجريبية + لوحة إدارة"]),
    projectSteps: [
      "إعداد بيئة العمل (Node, MongoDB, VS Code)",
      "Backend: Models (Product, User, Order) + Routes",
      "Frontend: React + Tailwind + Router",
      "ربط Frontend مع Backend عبر fetch/axios",
      "Authentication بـ JWT + Protected Routes",
      "Cart + Checkout + لوحة Admin",
      "نشر التطبيق (Frontend → Vercel, Backend → Render)",
    ],
    code: `/ecommerce-app\n  /client (React + Tailwind)\n    /src\n      /pages    (Home, Product, Cart, Checkout, Admin)\n      /components\n      /context  (AuthContext, CartContext)\n  /server (Node + Express)\n    /models   (Product, User, Order)\n    /routes\n    /middleware`,
    quiz: dq("متجر إلكتروني") },
];

const MODULES = [
  { id: 1, name: "أساسيات البرمجة", desc: "Python, Logic, OOP" },
  { id: 2, name: "تطوير Frontend", desc: "HTML, CSS, JS, React" },
  { id: 3, name: "تطوير Backend", desc: "Node, DB, APIs, Auth" },
  { id: 4, name: "أكواد ومشاريع جاهزة", desc: "Scripts, Bots, Projects" },
] as const;

// ============ STORAGE ============
const LESSONS_KEY = "ilearn-programming-lessons";
const PROGRESS_KEY = "ilearn-programming-progress";
const NOTES_KEY = "ilearn-notes";
const XP_KEY = "ilearn-xp";

function getCompletedSet(): Set<number> {
  try { const r = localStorage.getItem(LESSONS_KEY); return new Set<number>(r ? JSON.parse(r) : []); }
  catch { return new Set(); }
}
function setCompletedSet(s: Set<number>) {
  try {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(Array.from(s)));
    const pct = Math.round((s.size / PROGRAMMING_LESSONS.length) * 100);
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

export const Route = createFileRoute("/courses/programming")({
  validateSearch: (raw: Record<string, unknown>): Search => {
    const r = raw.lesson;
    const lesson = typeof r === "number" ? r : typeof r === "string" && r ? Number(r) || undefined : undefined;
    return { lesson };
  },
  head: () => ({
    meta: [
      { title: "iLearn — البرمجة" },
      { name: "description", content: "Backend, Frontend, أكواد جاهزة — من الصفر إلى المشاريع الكاملة" },
    ],
  }),
  component: CoursePage,
});

const TYPE_META: Record<LessonType, { icon: string; label: string; color: string }> = {
  video: { icon: "🎥", label: "فيديو", color: "text-info" },
  article: { icon: "📄", label: "مقال", color: "text-primary" },
  practical: { icon: "💻", label: "تمرين عملي", color: "text-success" },
  project: { icon: "🚀", label: "مشروع", color: "text-warning" },
};

const HEADER_GRADIENT = "linear-gradient(135deg,#B8472E 0%,#E17055 60%,#FDA47A 130%)";
const ACCENT_GRADIENT = "linear-gradient(135deg,#B8472E,#E17055)";

function CoursePage() {
  const { lesson: lessonIdParam } = Route.useSearch();
  const navigate = useNavigate({ from: "/courses/programming" });

  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [openModule, setOpenModule] = useState<number>(1);
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => { setCompleted(getCompletedSet()); }, []);

  const isModuleUnlocked = (mid: number): boolean => {
    if (mid === 1) return true;
    const prev = PROGRAMMING_LESSONS.filter((l) => l.module === mid - 1);
    const done = prev.filter((l) => completed.has(l.id)).length;
    return prev.length === 0 || done / prev.length >= 0.8;
  };

  const totalLessons = PROGRAMMING_LESSONS.length;
  const doneCount = PROGRAMMING_LESSONS.filter((l) => completed.has(l.id)).length;
  const progressPct = Math.round((doneCount / totalLessons) * 100);
  const totalXP = PROGRAMMING_LESSONS.reduce((s, l) => s + l.xp, 0);
  const earnedXP = PROGRAMMING_LESSONS.filter((l) => completed.has(l.id)).reduce((s, l) => s + l.xp, 0);
  const remainingMin = PROGRAMMING_LESSONS.filter((l) => !completed.has(l.id))
    .reduce((s, l) => s + (parseInt(l.duration) || 20), 0);
  const totalProjects = PROGRAMMING_LESSONS.filter((l) => l.type === "project").length;
  const doneProjects = PROGRAMMING_LESSONS.filter((l) => l.type === "project" && completed.has(l.id)).length;

  const currentLesson = useMemo(
    () => (lessonIdParam ? PROGRAMMING_LESSONS.find((l) => l.id === lessonIdParam) ?? null : null),
    [lessonIdParam]
  );

  const handleComplete = (lesson: PLesson) => {
    if (completed.has(lesson.id)) return;
    const next = new Set(completed); next.add(lesson.id); setCompleted(next); setCompletedSet(next);
    setXP(getXP() + lesson.xp);
    setConfettiKey((k) => k + 1);
    toast.success(`🎉 +${lesson.xp} XP — أكملت "${lesson.title}"`);
    addNotification({ type: "lesson", title: "أكملت درساً بنجاح",
      description: `${lesson.title} — +${lesson.xp} XP`, link: "/courses/programming" });
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
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">💻 البرمجة</h1>
          <p className="text-white/90 mt-2 max-w-2xl text-sm sm:text-base">
            Backend، Frontend، وأكواد جاهزة — من الصفر إلى المشاريع الكاملة.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {[{ v: "40 درس" }, { v: "4 وحدات" }, { v: "20 ساعة" }, { v: "6 اختبارات" }].map((s, i) => (
              <div key={i} className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold border border-white/20">
                {s.v}
              </div>
            ))}
          </div>
          <div className="mt-5 max-w-xl">
            <div className="flex justify-between text-xs text-white/90 mb-1">
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
                const lessons = PROGRAMMING_LESSONS.filter((l) => l.module === m.id);
                const mDone = lessons.filter((l) => completed.has(l.id)).length;
                const open = openModule === m.id;
                return (
                  <div key={m.id} className={`rounded-2xl border ${open ? "border-warning/40" : "border-border"} bg-card overflow-hidden transition-all`}>
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
              <div className="p-2 rounded-lg bg-accent/40 col-span-2 flex items-center gap-2">
                <Rocket className="w-3.5 h-3.5 text-warning" />
                <div className="text-muted-foreground">مشاريع:</div>
                <div className="font-extrabold text-foreground">{doneProjects} / {totalProjects}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-warning" /> الوحدات
            </div>
            <ul className="space-y-2">
              {MODULES.map((m) => {
                const lessons = PROGRAMMING_LESSONS.filter((l) => l.module === m.id);
                const mDone = lessons.filter((l) => completed.has(l.id)).length;
                const unlocked = isModuleUnlocked(m.id);
                return (
                  <li key={m.id}>
                    <button onClick={() => { setOpenModule(m.id); navigate({ search: {} }); }}
                      className={`w-full text-right flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors ${!unlocked ? "opacity-50" : ""}`}>
                      {unlocked ? <Circle className="w-3 h-3 text-warning" /> : <Lock className="w-3 h-3" />}
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

// ============ CODE PLAYGROUND ============
function runPython(src: string): string {
  const out: string[] = [];
  const vars: Record<string, unknown> = {};
  const lines = src.split("\n");
  const evalExpr = (expr: string): unknown => {
    const e = expr.trim();
    if (!e) return "";
    // string literal
    const sm = e.match(/^(['"])([\s\S]*)\1$/);
    if (sm) return sm[2];
    // f-string
    const fm = e.match(/^f(['"])([\s\S]*)\1$/);
    if (fm) return fm[2].replace(/\{([^{}]+)\}/g, (_, inner) => String(evalExpr(inner)));
    // number
    if (/^-?\d+(\.\d+)?$/.test(e)) return Number(e);
    // simple arithmetic / variables
    try {
      const expr2 = e.replace(/\bx\b|\by\b|\bz\b|[a-zA-Z_]\w*/g, (m) =>
        Object.prototype.hasOwnProperty.call(vars, m) ? JSON.stringify(vars[m]) : m
      );
      // eslint-disable-next-line no-new-func
      return new Function(`return (${expr2})`)();
    } catch { return e; }
  };
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    i++;
    if (!line || line.startsWith("#")) continue;
    // assignment
    const a = line.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
    if (a && !line.startsWith("def ") && !line.startsWith("for ") && !line.startsWith("while ") && !line.startsWith("if ")) {
      vars[a[1]] = evalExpr(a[2]);
      continue;
    }
    // print
    const p = line.match(/^print\((.*)\)$/);
    if (p) {
      const args = splitArgs(p[1]);
      out.push(args.map((x) => String(evalExpr(x))).join(" "));
      continue;
    }
    // for i in range(...)
    const fr = line.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\(([^)]*)\):$/);
    if (fr) {
      const args = splitArgs(fr[2]).map((x) => Number(evalExpr(x)));
      const [start, end, step] = args.length === 1 ? [0, args[0], 1] : args.length === 2 ? [args[0], args[1], 1] : args;
      // collect indented body
      const body: string[] = [];
      while (i < lines.length && (lines[i].startsWith("    ") || lines[i].startsWith("\t") || lines[i].trim() === "")) {
        if (lines[i].trim()) body.push(lines[i].replace(/^(    |\t)/, ""));
        i++;
      }
      for (let k = start; (step > 0 ? k < end : k > end); k += step || 1) {
        vars[fr[1]] = k;
        out.push(runPython(body.join("\n")));
      }
      continue;
    }
    // unsupported — best effort skip
  }
  return out.filter(Boolean).join("\n");
}

function splitArgs(s: string): string[] {
  const out: string[] = []; let depth = 0; let cur = ""; let q: string | null = null;
  for (const c of s) {
    if (q) { cur += c; if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === "(" || c === "[" || c === "{") depth++;
    if (c === ")" || c === "]" || c === "}") depth--;
    if (c === "," && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim());
}

function runJavaScript(src: string): string {
  const out: string[] = [];
  const fakeConsole = {
    log: (...args: unknown[]) => out.push(args.map((a) =>
      typeof a === "string" ? a : JSON.stringify(a, null, 2)).join(" ")),
  };
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("console", `"use strict";\n${src}`);
    fn(fakeConsole);
  } catch (e) {
    return `❌ خطأ: ${(e as Error).message}`;
  }
  return out.join("\n") || "(لا ناتج)";
}

function Playground({ lang, starter }: { lang: PLang; starter: string }) {
  const [code, setCode] = useState(starter);
  const [out, setOut] = useState<string>("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const run = () => {
    try {
      const result = lang === "python" ? runPython(code) : runJavaScript(code);
      setOut(result || "(لا ناتج)");
    } catch (e) {
      setOut(`❌ خطأ: ${(e as Error).message}`);
    }
  };
  const reset = () => { setCode(starter); setOut(""); taRef.current?.focus(); };

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-border" dir="ltr">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 text-slate-200 text-xs">
        <span className="font-mono uppercase tracking-wide opacity-80">{lang} playground</span>
        <div className="flex gap-2">
          <button onClick={reset} className="px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-[11px] inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <button onClick={run} className="px-3 py-1 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold inline-flex items-center gap-1">
            <Play className="w-3 h-3 fill-current" /> Run
          </button>
        </div>
      </div>
      <textarea ref={taRef} value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false}
        className="w-full min-h-[160px] p-3 bg-slate-950 text-slate-100 text-xs font-mono leading-relaxed focus:outline-none resize-y" />
      <div className="px-3 py-2 bg-black text-emerald-300 text-xs font-mono whitespace-pre-wrap min-h-[60px] border-t border-slate-800">
        {out ? out : "// النتيجة ستظهر هنا بعد الضغط على Run"}
      </div>
    </div>
  );
}

// ============ LESSON VIEW ============
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

  const all = PROGRAMMING_LESSONS;
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
          <Play className="w-8 h-8 fill-current ms-1" style={{ color: "#E17055" }} />
        </button>
        <div className="absolute bottom-3 inset-x-3 text-white text-xs bg-black/30 backdrop-blur px-3 py-1.5 rounded-lg text-center">
          الفيديو قريباً — اقرأ المحتوى وجرّب الكود بالأسفل
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

        {lesson.playground && (
          <Playground lang={lesson.playground.lang} starter={lesson.playground.starter} />
        )}

        {lesson.projectSteps && lesson.projectSteps.length > 0 && (
          <div className="mt-4">
            <div className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-warning" /> خطوات المشروع
            </div>
            <ol className="space-y-2">
              {lesson.projectSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="h-6 w-6 rounded-full bg-warning/15 text-warning text-xs font-extrabold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-warning" /> ملاحظاتك
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="اكتب ملاحظاتك هنا..."
          className="w-full min-h-[100px] p-3 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-warning/40" />
        <button onClick={saveNote}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold hover:opacity-90"
          style={{ background: ACCENT_GRADIENT }}>
          <Save className="w-3.5 h-3.5" /> حفظ الملاحظة
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-warning" /> اختبار سريع
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
                        picked ? "bg-warning/15 border-warning text-foreground" :
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