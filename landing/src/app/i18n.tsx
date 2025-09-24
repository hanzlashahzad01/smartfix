"use client";
import React, { createContext, useContext, useMemo, useState } from "react";

type Locale = "en" | "ur";

type Dict = Record<string, string>;

const en: Dict = {
  brand: "SmartFix",
  nav_features: "Features",
  nav_demo: "Demo",
  nav_download: "Download",
  nav_faq: "FAQ",
  nav_contact: "Contact",
  toggle_label: "EN / اردو",
  hero_title: "Fast Repairs, Happy Customers",
  hero_sub: "Manage jobs, technicians, and customer updates in one place—simple and powerful.",
  get_app: "Get the App",
  watch_demo: "Watch Demo",
  why_title: "Why SmartFix?",
  why_1_t: "Faster Turnaround",
  why_1_d: "Assign jobs instantly and track progress in real-time.",
  why_2_t: "Happier Customers",
  why_2_d: "Automatic notifications keep customers informed.",
  why_3_t: "Better Insights",
  why_3_d: "Dashboards reveal performance and trends.",
  why_4_t: "Scale Confidently",
  why_4_d: "Built on modern, secure infrastructure.",
  core_title: "Core Features",
  f1_t: "Job Management",
  f1_d: "Create, assign, and monitor repair jobs.",
  f2_t: "Notifications",
  f2_d: "Real-time updates through in-app and push.",
  f3_t: "Analytics",
  f3_d: "Track KPIs and performance trends.",
  demo_title: "SmartFix Demo",
  dl_title: "Download the App",
  dl_sub: "Available on your favorite app stores soon.",
  play: "Google Play",
  appstore: "App Store",
  faq_title: "Frequently Asked Questions",
  faq_q1: "What is SmartFix?",
  faq_a1: "A platform to manage repair jobs and updates.",
  faq_q2: "Is it free to try?",
  faq_a2: "We offer a free pilot for qualified teams.",
  faq_q3: "How do notifications work?",
  faq_a3: "In-app WebSocket and push via FCM.",
  what_users: "What our users say",
  contact_title: "Contact Us",
  contact_name: "Name",
  contact_email: "Email",
  contact_msg: "Message",
  contact_send: "Send",
  footer: "All rights reserved.",
};

const ur: Dict = {
  brand: "اسمارٹ فکس",
  nav_features: "خصوصیات",
  nav_demo: "ڈیمو",
  nav_download: "ڈاؤن لوڈ",
  nav_faq: "سوالات",
  nav_contact: "رابطہ",
  toggle_label: "EN / اردو",
  hero_title: "تیز مرمت، خوش گاہک",
  hero_sub: "نوکریاں، ٹیکنیشن اور اپڈیٹس ایک جگہ—سادہ اور طاقتور۔",
  get_app: "ایپ حاصل کریں",
  watch_demo: "ڈیمو دیکھیں",
  why_title: "کیوں اسمارٹ فکس؟",
  why_1_t: "تیز رفتار",
  why_1_d: "فوراً اسائن کریں اور ریئل ٹائم میں ٹریک کریں۔",
  why_2_t: "خوش گاہک",
  why_2_d: "خودکار نوٹیفکیشنز گاہکوں کو باخبر رکھتے ہیں۔",
  why_3_t: "بہتر بصیرت",
  why_3_d: "ڈیش بورڈ کارکردگی دکھاتے ہیں۔",
  why_4_t: "اعتماد کے ساتھ وسعت",
  why_4_d: "جدید اور محفوظ انفراسٹرکچر پر مبنی۔",
  core_title: "اہم خصوصیات",
  f1_t: "جاب مینجمنٹ",
  f1_d: "مرمت کی نوکریاں بنائیں، اسائن کریں، مانیٹر کریں۔",
  f2_t: "نوٹیفکیشنز",
  f2_d: "ایپ اور پوش کے ذریعے ریئل ٹائم اپڈیٹس۔",
  f3_t: "تجزیات",
  f3_d: "کے پی آئیز اور رجحانات دیکھیں۔",
  demo_title: "اسمارٹ فکس ڈیمو",
  dl_title: "ایپ ڈاؤن لوڈ کریں",
  dl_sub: "جلد ہی آپ کے پسندیدہ اسٹورز پر دستیاب۔",
  play: "گوگل پلے",
  appstore: "ایپ اسٹور",
  faq_title: "عمومی سوالات",
  faq_q1: "اسمارٹ فکس کیا ہے؟",
  faq_a1: "مرمت نوکریوں اور اپڈیٹس کی مینجمنٹ کا پلیٹ فارم۔",
  faq_q2: "کیا آزمانا مفت ہے؟",
  faq_a2: "اہل ٹیموں کے لیے مفت پائلٹ۔",
  faq_q3: "نوٹیفکیشنز کیسے کام کرتے ہیں؟",
  faq_a3: "ایپ کے اندر اور ایف سی ایم کے ذریعے۔",
  what_users: "ہمارے صارفین کیا کہتے ہیں",
  contact_title: "ہم سے رابطہ کریں",
  contact_name: "نام",
  contact_email: "ای میل",
  contact_msg: "پیغام",
  contact_send: "بھیجیں",
  footer: "جملہ حقوق محفوظ ہیں۔",
};

const dict: Record<Locale, Dict> = { en, ur };

const I18nContext = createContext<{ locale: Locale; setLocale: (l: Locale) => void; t: (k: string) => string; }>({
  locale: "en",
  setLocale: () => {},
  t: (k) => k,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>("en");
  const t = useMemo(() => (key: string) => dict[locale][key] ?? en[key] ?? key, [locale]);
  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
