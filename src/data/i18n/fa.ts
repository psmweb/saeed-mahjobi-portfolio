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
    logIdle: "در انتظار",
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
};
