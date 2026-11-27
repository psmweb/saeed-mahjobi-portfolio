import { DEMO_BADGE } from "../agents";
import type { Dictionary } from "./types";

export const fa: Dictionary = {
  meta: {
    title: "سعید محجوبی — ONE COMMAND",
    description:
      "نمونه‌کار دوزبانهٔ سعید محجوبی. شش محصول فعال، بایگانی 2020، و پنج ریگ عامل انسان‌نما.",
  },
  brand: {
    command: "ONE COMMAND",
    name: "سعید محجوبی",
  },
  profile: {
    english: "انگلیسی (روان / حرفه‌ای)",
    persian: "فارسی (زبان مادری)",
  },
  demoBadge: DEMO_BADGE.fa,
  nav: {
    aria: "پرده‌های نمونه‌کار",
    languageToggle: "تعویض زبان",
  },
  acts: {
    command: {
      kicker: "پرده ۰۱",
      title: "ONE COMMAND",
      body: "سعید محجوبی. انگلیسی (روان / حرفه‌ای). فارسی (زبان مادری).",
    },
    evolution: {
      kicker: "پرده ۰۲",
      title: "تکامل",
      body: "بایگانی 2020 تنها نشان تاریخ‌دار است. بقیهٔ فهرست بدون سال آمده است.",
    },
    ventures: {
      kicker: "پرده ۰۳",
      title: "سکوِ محصول‌ها",
      body: "شش محصول فعال.",
    },
    arena: {
      kicker: "پرده ۰۴",
      title: "میدان عامل‌ها",
      body: "پنج ریگ عامل انسان‌نما. هر چیزی که اینجا اجرا شود، شبیه‌سازی زنده و دمو است.",
    },
    finale: {
      kicker: "پرده ۰۵",
      title: "مرکز فرمان",
      body: "ONE COMMAND. جهت صفحه از زبان پیروی می‌کند.",
    },
  },
  lanes: {
    active: "فعال",
    catalog: "فهرست",
    archive: "بایگانی",
  },
  ventureNames: {
    "archive-2020": "بایگانی 2020",
    "mikham-miara": "Mikham + Miara",
    "battery-store": "Battery Store",
    "trader-bot": "Trader Bot",
    honarmarket: "Honarmarket",
    "yadaki-yar": "Yadaki Yar",
    "sandoq-yar": "Sandoq-Yar",
    xchange: "Xchange",
    "rap-historical": "Rap Historical",
  },
  metricLabels: {
    businesses: "کسب‌وکار",
    categories: "دسته",
    onlineServices: "سرویس آنلاین",
    frontend: "",
    backend: "",
    pullRequest: "",
    loc: "خط کد",
    language: "",
    ciTests: "تست CI",
    liveTrading: "",
    designs: "طرح",
    version: "",
    stack: "",
    form: "",
    year: "",
  },
  metricValues: {
    liveTrading: "معامله زنده به‌طور پیش‌فرض خاموش است",
    form: "وب‌اپ پیش‌روندهٔ صندوق فروش بارکد، آفلاین",
  },
  hud: {
    batteryLabel: "شارژ پیمایش",
    logTitle: "گزارش زندهٔ ساخت",
    logMark: "ONE COMMAND",
    logIdle: "در انتظار",
    brand: "سعید محجوبی",
    chapters: ["۰۱ فرمان", "۰۲ تکامل", "۰۳ محصول‌ها", "۰۴ عامل‌ها", "۰۵ استقرار"],
    logLines: [
      "▸ در انتظار فرمان…",
      "▸ build --ventures=6 --team=5-agents --verify",
      "✓ فرمان رسید · راوی اعزام شد",
      "▸ بارگذاری بایگانی · 2016 → 2020",
      "▸ تکامل پشته → next.js 15 · nestjs 10 · python",
      "▸ نصب محصول‌ها · 6 محصول",
      "✓ mikham · بیش از 400K کسب‌وکار · miara آنلاین",
      "✓ battery store v0.2.0 · تناسب خودرو آنلاین",
      "✓ trader bot · 886/886 تست CI موفق",
      "✓ honarmarket · بیش از 1,450 طرح قالب",
      "✓ yadaki yar v0.7.0 · ویندوز و اندروید همگام",
      "✓ sandoq-yar · صندوق بارکد آفلاین آماده",
      "▸ اعزام عامل‌ها 5/5 · شبیه‌سازی زنده · دمو",
      "▸ وظیفه افتاد: ship release v0.8 · دمو",
      "✓ انتشار v0.8 انجام شد · دمو",
      "▸ تعویض زبان → فارسی (RTL)",
      "▸ تأیید مالک: approve & deploy",
    ],
  },
  scene: {
    loading: "صحنهٔ ابسیدین در حال باز شدن است",
    unavailable: "صحنهٔ سه‌بعدی روی این دستگاه در دسترس نیست.",
  },
  arena: {
    skeletonNote: "اسکلت ریگ",
    slotLabel: "عامل",
  },
  emptyVentures: "محصول فعالی فهرست نشده است.",
  heroPrompt: "one --open portfolio",
  resume: {
    en: "رزومه (EN)",
    fa: "رزومه (FA)",
  },
  heroStage: {
    displayName: "سعید محجوبی",
    tagline: "بنیان‌گذار · معمار سیستم‌های فول‌استک و هوش مصنوعی",
    prompt: "one-command --deploy --all",
    pills: ["۱۰+ سال", "۶+ محصول زنده", "ناوگان عامل‌های هوش مصنوعی"],
  },
  evolutionStage: {
    items: [
      { year: "2016", title: "پایه‌ها و مهندسی وب" },
      { year: "2020", title: "بایگانی استودیو و برند" },
      { year: "2026", title: "بنیان‌گذار هوش مصنوعی و فرمان چندعاملی" },
    ],
  },
};
