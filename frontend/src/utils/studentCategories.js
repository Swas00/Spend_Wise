import {
  Utensils,
  Car,
  GraduationCap,
  Home,
  Smartphone,
  Film,
  ShoppingBag,
  HeartPulse,
  Laptop,
  PartyPopper,
  FolderMinus
} from "lucide-react";

export const STUDENT_CATEGORIES = {
  Food: {
    label: "Food & Canteen",
    emoji: "🍔",
    icon: Utensils,
    barColor: "bg-amber-500",
    textColor: "text-amber-700 dark:text-amber-400",
    bgLight: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-300 dark:border-amber-800/50",
    colorHex: "#f59e0b",
    desc: "Mess fees, campus canteen, tea & snacks, Swiggy, Zomato & dhabas"
  },
  Transport: {
    label: "Transport & Commute",
    emoji: "🛺",
    icon: Car,
    barColor: "bg-blue-600",
    textColor: "text-blue-700 dark:text-blue-400",
    bgLight: "bg-blue-50 dark:bg-blue-950/40",
    borderColor: "border-blue-300 dark:border-blue-800/50",
    colorHex: "#2563eb",
    desc: "Auto, Metro, city bus pass, Rapido, Ola/Uber & bike fuel"
  },
  Education: {
    label: "College & Academics",
    emoji: "📚",
    icon: GraduationCap,
    barColor: "bg-emerald-600",
    textColor: "text-emerald-700 dark:text-emerald-400",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "border-emerald-300 dark:border-emerald-800/50",
    colorHex: "#059669",
    desc: "Photocopy/Xerox, stationery, semester books, assignments & exam fees"
  },
  "Hostel & Rent": {
    label: "Hostel & PG",
    emoji: "🏠",
    icon: Home,
    barColor: "bg-indigo-600",
    textColor: "text-indigo-700 dark:text-indigo-400",
    bgLight: "bg-indigo-50 dark:bg-indigo-950/40",
    borderColor: "border-indigo-300 dark:border-indigo-800/50",
    colorHex: "#4f46e5",
    desc: "Hostel dues, PG rent, room maintenance, domestic help & electricity bill"
  },
  "Mobile & Wi-Fi": {
    label: "Mobile & Data",
    emoji: "📱",
    icon: Smartphone,
    barColor: "bg-cyan-600",
    textColor: "text-cyan-700 dark:text-cyan-400",
    bgLight: "bg-cyan-50 dark:bg-cyan-950/40",
    borderColor: "border-cyan-300 dark:border-cyan-800/50",
    colorHex: "#0891b2",
    desc: "Jio / Airtel / Vi recharge, PG Wi-Fi & data booster packs"
  },
  Entertainment: {
    label: "Outings & Leisure",
    emoji: "🎬",
    icon: Film,
    barColor: "bg-rose-600",
    textColor: "text-rose-700 dark:text-rose-400",
    bgLight: "bg-rose-50 dark:bg-rose-950/40",
    borderColor: "border-rose-300 dark:border-rose-800/50",
    colorHex: "#e11d48",
    desc: "Cinema, campus hangouts, weekend cafes, gaming & street food"
  },
  Shopping: {
    label: "Shopping & Market",
    emoji: "🛍️",
    icon: ShoppingBag,
    barColor: "bg-purple-600",
    textColor: "text-purple-700 dark:text-purple-400",
    bgLight: "bg-purple-50 dark:bg-purple-950/40",
    borderColor: "border-purple-300 dark:border-purple-800/50",
    colorHex: "#9333ea",
    desc: "Myntra, Flipkart, local market, street shopping & apparel"
  },
  Health: {
    label: "Medical & Health",
    emoji: "💊",
    icon: HeartPulse,
    barColor: "bg-red-500",
    textColor: "text-red-700 dark:text-red-400",
    bgLight: "bg-red-50 dark:bg-red-950/40",
    borderColor: "border-red-300 dark:border-red-800/50",
    colorHex: "#ef4444",
    desc: "Pharmacy, medicines, doctor visits, gym membership & fitness"
  },
  Subscriptions: {
    label: "OTT & Subscriptions",
    emoji: "💻",
    icon: Laptop,
    barColor: "bg-violet-600",
    textColor: "text-violet-700 dark:text-violet-400",
    bgLight: "bg-violet-50 dark:bg-violet-950/40",
    borderColor: "border-violet-300 dark:border-violet-800/50",
    colorHex: "#7c3aed",
    desc: "Spotify Student, YouTube Premium, Netflix, Prime, Hotstar & ChatGPT"
  },
  "College Events": {
    label: "Fests & Events",
    emoji: "🎓",
    icon: PartyPopper,
    barColor: "bg-amber-600",
    textColor: "text-amber-700 dark:text-amber-400",
    bgLight: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-300 dark:border-amber-800/50",
    colorHex: "#d97706",
    desc: "College annual fest, freshers party, department farewell & club dues"
  },
  Other: {
    label: "Other / Misc",
    emoji: "📦",
    icon: FolderMinus,
    barColor: "bg-slate-600",
    textColor: "text-slate-700 dark:text-slate-400",
    bgLight: "bg-slate-50 dark:bg-slate-800/60",
    borderColor: "border-slate-300 dark:border-slate-700",
    colorHex: "#475569",
    desc: "Miscellaneous emergency expenses & petty cash"
  }
};

export const STUDENT_CATEGORY_LIST = Object.keys(STUDENT_CATEGORIES);

export const PAYMENT_METHODS = [
  "UPI (GPay / PhonePe / Paytm)",
  "Cash",
  "Debit Card (ATM / RuPay)",
  "Credit Card",
  "Net Banking / IMPS",
  "College Wallet / Campus Card"
];

export const INCOME_SOURCES = [
  "Pocket Money / Monthly Allowance",
  "Internship Stipend",
  "Part-Time Job / Tutoring",
  "College / Govt Scholarship",
  "Freelance / Project Gigs",
  "Gifts / Birthday Cash / Relatives",
  "Other Inflows"
];
