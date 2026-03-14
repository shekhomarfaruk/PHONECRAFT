import { useState, useRef, useEffect } from "react";
import Icons from "../Icons.jsx";
import { PLANS } from "../data.jsx";
import { convertCurrency } from "../currency.js";
import PwaInstallGuideModal from "../components/PwaInstallGuideModal.jsx";

// ── Manufacturing YouTube video slider ──────────────────────────────────────
// Replace video IDs with actual YouTube manufacturing video IDs as needed
const VIDEOS = [
  {
    src: '/VEDIO/Slider1.mp4',
    title: 'Smartphone Assembly Line',
    subtitle: 'Inside a world-class phone factory',
  },
  {
    src: '/VEDIO/Slider2.mp4',
    title: 'PCB Manufacturing Process',
    subtitle: 'Precision circuit board production',
  },
  {
    src: '/VEDIO/Slider3.mp4',
    title: 'Quality Control Testing',
    subtitle: 'Every device passes 94+ tests',
  },
  {
    src: '/VEDIO/Slider4.mp4',
    title: 'Factory Mass Production',
    subtitle: 'Thousands of phones built daily',
  },
];

// ── Legal document content ──────────────────────────────────────────────────
const LEGAL = {
  terms: {
    title: 'Terms of Service',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: 'By accessing or using PhoneCraft ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Platform. These terms apply to all users, including visitors, registered members, and plan subscribers.',
      },
      {
        heading: '2. Platform Description',
        body: 'PhoneCraft is an online smartphone manufacturing platform where users earn real money by completing manufacturing tasks. Earnings are accumulated as platform balance and are fully withdrawable per the withdrawal policy.',
      },
      {
        heading: '3. Account Registration',
        body: 'To access platform features, you must create an account. You must provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials. A valid referral code is required for registration. Each person is permitted one account only.',
      },
      {
        heading: '4. Plan Subscription',
        body: 'PhoneCraft offers paid subscription plans (BASIC, PREMIUM, GOLD, PLATINUM). Plan fees are non-refundable once activated. Each plan provides a defined number of daily tasks and earning potential. Plan upgrades are available at any time. Downgrades or cancellations do not entitle refunds.',
      },
      {
        heading: '5. Earning & Withdrawals',
        body: 'Users earn credits by completing daily manufacturing tasks. Withdrawal requests are processed within 3–7 business days. Minimum withdrawal thresholds apply per plan. The platform reserves the right to withhold payments for accounts suspected of fraudulent activity, multi-accounting, or violation of these terms.',
      },
      {
        heading: '6. Referral Program',
        body: 'Users may earn referral commissions by inviting new members. Commission rates are defined by your active plan tier and apply to Level 1, Level 2, and Level 3 referrals. Referral abuse, self-referral using multiple accounts, or artificial inflation of referral networks will result in permanent account suspension.',
      },
      {
        heading: '7. Prohibited Activities',
        body: 'You may not: use automated bots or scripts; create multiple accounts; attempt to manipulate task completion systems; engage in money laundering; share account credentials; or use the platform for any illegal purpose. Violation results in immediate account termination without refund.',
      },
      {
        heading: '8. Limitation of Liability',
        body: 'PhoneCraft is not liable for any indirect, incidental, or consequential damages. The platform makes no guarantees of income. Earnings depend on plan level, task completion, and referral activity. We reserve the right to modify plan rates and task structures at any time with notice.',
      },
      {
        heading: '9. Governing Law',
        body: 'These terms are governed by applicable laws. Any disputes shall be resolved through binding arbitration. By using the platform, you waive any right to participate in class-action lawsuits against PhoneCraft.',
      },
      {
        heading: '10. Modifications',
        body: 'We reserve the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the revised Terms. We will notify users of significant changes via in-app notification.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: '1. Information We Collect',
        body: 'We collect: account information (name, email/phone, password hash); usage data (tasks completed, login times, device info); financial data (plan purchases, withdrawal requests); referral network information; and communication records with support.',
      },
      {
        heading: '2. How We Use Your Information',
        body: 'Your data is used to: provide and improve platform services; process transactions and withdrawals; prevent fraud and enforce Terms; send service notifications; calculate referral commissions; and comply with legal obligations.',
      },
      {
        heading: '3. Data Sharing',
        body: 'We do not sell your personal data to third parties. We may share data with: payment processors for withdrawal transactions; legal authorities when required by law; service providers who assist in platform operations under strict confidentiality agreements.',
      },
      {
        heading: '4. Data Security',
        body: 'We implement industry-standard security measures including: encrypted password storage; HTTPS encryption for all data transmission; secure database access controls; and regular security audits. However, no system is 100% secure and we cannot guarantee absolute security.',
      },
      {
        heading: '5. Data Retention',
        body: 'Account data is retained while your account is active. Upon account deletion, personal data is removed within 30 days, except where retention is required for legal or financial compliance purposes.',
      },
      {
        heading: '6. Your Rights',
        body: 'You have the right to: access your personal data; correct inaccurate data; request data deletion; withdraw consent for data processing; and receive a copy of your data in portable format. Contact support to exercise these rights.',
      },
      {
        heading: '7. Cookies',
        body: 'We use essential cookies for session management and authentication. We do not use third-party tracking cookies or advertising cookies. You may disable cookies in your browser, but this may affect platform functionality.',
      },
      {
        heading: '8. Children\'s Privacy',
        body: 'PhoneCraft is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If we discover a minor has registered, the account will be immediately terminated.',
      },
      {
        heading: '9. Contact',
        body: 'For privacy-related requests or questions, contact our Data Protection Officer through the in-app Support channel. We respond to all privacy inquiries within 72 hours.',
      },
    ],
  },
};

// ── Bilingual landing text ───────────────────────────────────────────────────
const LD_TEXT = {
  en: {
    login: 'LOGIN', signup: 'JOIN',
    badge: 'VIRTUAL MANUFACTURING PLATFORM',
    headline1: 'Earn Real Money by',
    headline2: 'Manufacturing Phones',
    desc: 'Join thousands of members earning daily by completing virtual phone manufacturing tasks. The more you build, the more you earn.',
    cta_start: 'Start Earning Today',
    cta_member: 'Already a Member?',
    stat_members: 'Active Members',
    stat_task: 'Per Task Earned',
    stat_world: 'Worldwide',
    vid_title: 'Manufacturing Process',
    vid_live: 'LIVE FACTORY',
    how_title: 'How It Works',
    steps: [
      { step:'01', icon:'🔐', title:'Create Account',   desc:'Sign up with a referral code & choose your manufacturing plan' },
      { step:'02', icon:'⚙️', title:'Build Phones',     desc:'Complete daily virtual manufacturing tasks on your shift' },
      { step:'03', icon:'💰', title:'Earn & Withdraw',  desc:'Collect your earnings and withdraw to your mobile banking' },
    ],
    plans_title: 'Investment Plans',
    plans_sub: 'Choose the plan that fits your earning goal',
    plan_basic_badge:   'STARTER PLAN',
    plan_premium_badge: '⭐ MOST POPULAR',
    plan_gold_badge:    '🏆 RECOMMENDED',
    plan_plat_badge:    '💎 POWER USER',
    popular_ribbon: 'POPULAR',
    one_time: 'one-time investment',
    act_basic: 'Activate BASIC', act_premium: 'Activate PREMIUM',
    act_gold:  'Activate GOLD',  act_plat:    'Activate PLATINUM',
    trust_title: 'Why Trust PhoneCraft',
    trust_badges: [
      { icon:'🔒', title:'Secure Platform',    desc:'256-bit AES encrypted data & secure payments' },
      { icon:'📄', title:'Legal Documents',    desc:'Full Terms of Service & Privacy Policy' },
      { icon:'⚡', title:'Daily Payouts',      desc:'Earnings credited instantly after task completion' },
      { icon:'🌍', title:'Global Members',     desc:'Trusted by 84,000+ users across 20 countries' },
      { icon:'🎯', title:'Transparent Rates',  desc:'Fixed plan rates, no hidden fees' },
      { icon:'💬', title:'24/7 Support',       desc:'Dedicated support team always available' },
    ],
    legal_title:   'Legal Documents',
    legal_heading: 'Official Legal Terms',
    legal_body: 'PhoneCraft operates under comprehensive legal terms. All financial transactions, membership agreements, and platform usage are governed by our legally binding documents.',
    terms_btn: '📄 Terms of Service',
    privacy_btn: '🔒 Privacy Policy',
    disclaimer: 'PhoneCraft is a real earning platform. Earnings are based on completing in-app manufacturing tasks. Income varies by plan and daily performance. Investment in any plan carries risk. Please read all legal documents before registering.',
    cta_title: 'Ready to Start Earning?',
    cta_body: 'Join 84,000+ members who earn daily from the comfort of their home. Registration requires a referral code.',
    cta_btn: 'Create Account Now',
    install_banner_title: 'PhoneCraft App',
    install_banner_sub: 'Install for the best experience — works offline too!',
    install_btn: '⬇ Install',
    install_guide_title: 'Install App on Your Phone',
    install_guide_sub: 'Add PhoneCraft to your home screen in seconds — works like a native app, no Play Store or App Store needed.',
    install_tab_android: 'Android',
    install_tab_ios: 'iPhone / iPad',
    install_android_steps: [
      { num: '01', icon: '⋮', title: 'Open Browser Menu', desc: 'Tap the three-dot (⋮) menu button at the top-right corner of Chrome browser' },
      { num: '02', icon: '📲', title: 'Add to Home Screen', desc: 'Find and tap \'Add to Home Screen\' or \'Install App\' from the dropdown menu' },
      { num: '03', icon: '✅', title: 'Confirm & Launch', desc: 'Tap \'Add\' or \'Install\' in the popup — the PhoneCraft icon will appear on your home screen' },
    ],
    install_ios_steps: [
      { num: '01', icon: '📤', title: 'Tap the Share Button', desc: 'Tap the Share icon (rectangle with an arrow pointing up) at the bottom toolbar of Safari' },
      { num: '02', icon: '📲', title: 'Add to Home Screen', desc: 'Scroll down in the share menu and tap \'Add to Home Screen\'' },
      { num: '03', icon: '✅', title: 'Confirm & Launch', desc: 'Tap \'Add\' in the top-right corner — the PhoneCraft icon will appear on your home screen' },
    ],
    install_note: 'Once installed, open PhoneCraft from your home screen for the full app experience — fast, offline-ready, and no browser bar.',
    footer_terms: 'Terms of Service',
    footer_privacy: 'Privacy Policy',
    footer_copy: '© 2026 PhoneCraft. All rights reserved.',
  },
  bn: {
    login: 'লগইন', signup: 'যোগ দিন',
    badge: 'ভার্চুয়াল ম্যানুফ্যাকচারিং প্ল্যাটফর্ম',
    headline1: 'বাস্তব অর্থ উপার্জন করুন',
    headline2: 'ফোন তৈরি করে',
    desc: 'হাজারো সদস্যের সাথে যোগ দিন যারা প্রতিদিন ভার্চুয়াল ফোন ম্যানুফ্যাকচারিং টাস্ক সম্পন্ন করে আয় করছে। যত বেশি বানাবেন, তত বেশি আয়।',
    cta_start: 'আজই আয় শুরু করুন',
    cta_member: 'ইতিমধ্যে সদস্য?',
    stat_members: 'সক্রিয় সদস্য',
    stat_task: 'প্রতি টাস্কে আয়',
    stat_world: 'বিশ্বজুড়ে',
    vid_title: 'ম্যানুফ্যাকচারিং প্রক্রিয়া',
    vid_live: 'লাইভ ফ্যাক্টরি',
    how_title: 'কিভাবে কাজ করে',
    steps: [
      { step:'০১', icon:'🔐', title:'অ্যাকাউন্ট তৈরি',  desc:'রেফারেল কোড দিয়ে সাইন আপ করুন ও আপনার ম্যানুফ্যাকচারিং প্ল্যান বেছে নিন' },
      { step:'০২', icon:'⚙️', title:'ফোন তৈরি করুন',   desc:'আপনার শিফটে প্রতিদিনের ভার্চুয়াল ম্যানুফ্যাকচারিং টাস্ক সম্পন্ন করুন' },
      { step:'০৩', icon:'💰', title:'আয় ও উইথড্র',    desc:'আপনার আয় সংগ্রহ করুন এবং মোবাইল ব্যাংকিংয়ে উইথড্র করুন' },
    ],
    plans_title: 'বিনিয়োগ পরিকল্পনা',
    plans_sub: 'আপনার আয়ের লক্ষ্য অনুযায়ী প্ল্যান বেছে নিন',
    plan_basic_badge:   'স্টার্টার প্ল্যান',
    plan_premium_badge: '⭐ সবচেয়ে জনপ্রিয়',
    plan_gold_badge:    '🏆 প্রস্তাবিত',
    plan_plat_badge:    '💎 পাওয়ার ইউজার',
    popular_ribbon: 'জনপ্রিয়',
    one_time: 'একবারের বিনিয়োগ',
    act_basic: 'BASIC সক্রিয় করুন', act_premium: 'PREMIUM সক্রিয় করুন',
    act_gold:  'GOLD সক্রিয় করুন',  act_plat:    'PLATINUM সক্রিয় করুন',
    trust_title: 'কেন ফোনক্রাফট বিশ্বাসযোগ্য',
    trust_badges: [
      { icon:'🔒', title:'নিরাপদ প্ল্যাটফর্ম',  desc:'২৫৬-বিট AES এনক্রিপ্টেড ডেটা ও নিরাপদ পেমেন্ট' },
      { icon:'📄', title:'আইনি দলিল',           desc:'সম্পূর্ণ সেবার শর্তাবলী ও গোপনীয়তা নীতি' },
      { icon:'⚡', title:'দৈনিক পেআউট',         desc:'টাস্ক সম্পন্নের সাথে সাথে আয় যোগ হয়' },
      { icon:'🌍', title:'বৈশ্বিক সদস্য',        desc:'২০ দেশে ৮৪,০০০+ ব্যবহারকারীর বিশ্বাস' },
      { icon:'🎯', title:'স্বচ্ছ রেট',           desc:'নির্ধারিত প্ল্যান রেট, কোনো লুকানো ফি নেই' },
      { icon:'💬', title:'২৪/৭ সাপোর্ট',        desc:'সর্বদা উপলব্ধ ডেডিকেটেড সাপোর্ট টিম' },
    ],
    legal_title:   'আইনি দলিল',
    legal_heading: 'অফিশিয়াল আইনি শর্তাবলী',
    legal_body: 'ফোনক্রাফট ব্যাপক আইনি শর্তাবলীর অধীনে পরিচালিত হয়। সমস্ত আর্থিক লেনদেন, সদস্যপদ চুক্তি এবং প্ল্যাটফর্ম ব্যবহার আমাদের আইনত বাধ্যকর দলিল দ্বারা পরিচালিত হয়।',
    terms_btn: '📄 সেবার শর্তাবলী',
    privacy_btn: '🔒 গোপনীয়তা নীতি',
    disclaimer: 'ফোনক্রাফট একটি বাস্তব আয়ের প্ল্যাটফর্ম। আয় ইন-অ্যাপ ম্যানুফ্যাকচারিং টাস্ক সম্পন্নের উপর নির্ভর করে। আয় প্ল্যান ও দৈনিক কর্মক্ষমতা অনুযায়ী পরিবর্তিত হয়। যেকোনো প্ল্যানে বিনিয়োগে ঝুঁকি রয়েছে। নিবন্ধনের আগে সকল আইনি দলিল পড়ুন।',
    cta_title: 'আয় শুরু করতে প্রস্তুত?',
    cta_body: '৮৪,০০০+ সদস্যের সাথে যোগ দিন যারা প্রতিদিন ঘরে বসে আয় করছেন। নিবন্ধনের জন্য রেফারেল কোড প্রয়োজন।',
    cta_btn: 'এখনই অ্যাকাউন্ট তৈরি করুন',
    install_banner_title: 'ফোনক্রাফট অ্যাপ',
    install_banner_sub: 'সেরা অভিজ্ঞতার জন্য ইনস্টল করুন — অফলাইনেও চলে!',
    install_btn: '⬇ ইনস্টল',
    install_guide_title: 'ফোনে অ্যাপ ইনস্টল করুন',
    install_guide_sub: 'মাত্র কয়েক সেকেন্ডে ফোনক্রাফট হোম স্ক্রিনে যোগ করুন — Play Store বা App Store ছাড়াই native app-এর মতো চলবে।',
    install_tab_android: 'অ্যান্ড্রয়েড',
    install_tab_ios: 'আইফোন / আইপ্যাড',
    install_android_steps: [
      { num: '০১', icon: '⋮', title: 'ব্রাউজার মেনু খুলুন', desc: 'Chrome ব্রাউজারের উপরের ডান কোণে তিন-ডট (⋮) মেনু বাটনে ট্যাপ করুন' },
      { num: '০২', icon: '📲', title: 'হোম স্ক্রিনে যোগ করুন', desc: 'ড্রপডাউন মেনু থেকে \'Add to Home Screen\' বা \'Install App\' খুঁজে ট্যাপ করুন' },
      { num: '০৩', icon: '✅', title: 'নিশ্চিত করুন ও চালু করুন', desc: 'পপআপে \'Add\' বা \'Install\' ট্যাপ করুন — হোম স্ক্রিনে ফোনক্রাফট আইকন যোগ হয়ে যাবে' },
    ],
    install_ios_steps: [
      { num: '০১', icon: '📤', title: 'শেয়ার বাটন চাপুন', desc: 'Safari ব্রাউজারের নিচের টুলবারে Share আইকনে (উপরে তীর সহ আয়তক্ষেত্র) ট্যাপ করুন' },
      { num: '০২', icon: '📲', title: 'হোম স্ক্রিনে যোগ করুন', desc: 'শেয়ার মেনু স্ক্রল করে \'Add to Home Screen\' খুঁজে ট্যাপ করুন' },
      { num: '০৩', icon: '✅', title: 'নিশ্চিত করুন ও চালু করুন', desc: 'উপরের ডান কোণে \'Add\' ট্যাপ করুন — হোম স্ক্রিনে ফোনক্রাফট আইকন যোগ হয়ে যাবে' },
    ],
    install_note: 'একবার ইনস্টল করলে হোম স্ক্রিন থেকে সরাসরি খুলুন — দ্রুত, অফলাইন-রেডি, ব্রাউজার বার ছাড়াই।',
    footer_terms: 'সেবার শর্তাবলী',
    footer_privacy: 'গোপনীয়তা নীতি',
    footer_copy: '© ২০২৬ ফোনক্রাফট। সর্বস্বত্ব সংরক্ষিত।',
  },
};

// ── Bilingual Legal content ──────────────────────────────────────────────────
const LEGAL_BN = {
  terms: {
    title: 'সেবার শর্তাবলী',
    sections: [
      { heading: '১. শর্তাবলী গ্রহণ', body: 'ফোনক্রাফট ("প্ল্যাটফর্ম") অ্যাক্সেস বা ব্যবহার করে আপনি এই সেবার শর্তাবলী মেনে নিচ্ছেন। যদি আপনি এই শর্তাবলীতে সম্মত না হন, তাহলে আপনি এই প্ল্যাটফর্ম ব্যবহার করতে পারবেন না। এই শর্তাবলী দর্শনার্থী, নিবন্ধিত সদস্য ও প্ল্যান গ্রাহকসহ সকল ব্যবহারকারীর ক্ষেত্রে প্রযোজ্য।' },
      { heading: '২. প্ল্যাটফর্ম পরিচিতি', body: 'ফোনক্রাফট একটি অনলাইন স্মার্টফোন ম্যানুফ্যাকচারিং প্ল্যাটফর্ম যেখানে ব্যবহারকারীরা ম্যানুফ্যাকচারিং টাস্ক সম্পন্ন করে বাস্তব অর্থ আয় করতে পারেন। উইথড্রেল নীতি অনুযায়ী আয় সম্পূর্ণরূপে উত্তোলনযোগ্য।' },
      { heading: '৩. অ্যাকাউন্ট নিবন্ধন', body: 'প্ল্যাটফর্ম ফিচার ব্যবহার করতে আপনাকে একটি অ্যাকাউন্ট তৈরি করতে হবে। আপনাকে সঠিক ও সম্পূর্ণ তথ্য প্রদান করতে হবে। নিবন্ধনের জন্য একটি বৈধ রেফারেল কোড প্রয়োজন। প্রতিটি ব্যক্তি শুধুমাত্র একটি অ্যাকাউন্ট রাখতে পারবেন।' },
      { heading: '৪. প্ল্যান সাবস্ক্রিপশন', body: 'ফোনক্রাফট পেইড সাবস্ক্রিপশন প্ল্যান (BASIC, PREMIUM, GOLD, PLATINUM) অফার করে। প্ল্যান সক্রিয় হওয়ার পর ফি ফেরতযোগ্য নয়। প্রতিটি প্ল্যান একটি নির্দিষ্ট সংখ্যক দৈনিক টাস্ক ও আয়ের সুযোগ প্রদান করে। যেকোনো সময় প্ল্যান আপগ্রেড করা যায়।' },
      { heading: '৫. আয় ও উইথড্রেল', body: 'ব্যবহারকারীরা দৈনিক ম্যানুফ্যাকচারিং টাস্ক সম্পন্ন করে ক্রেডিট আয় করেন। উইথড্রেল রিকোয়েস্ট ৩–৭ কার্যদিবসের মধ্যে প্রক্রিয়া করা হয়। প্রতিটি প্ল্যানে ন্যূনতম উইথড্রেল সীমা প্রযোজ্য। জালিয়াতি বা শর্ত লঙ্ঘনের সন্দেহে পেমেন্ট আটকানোর অধিকার প্ল্যাটফর্ম সংরক্ষণ করে।' },
      { heading: '৬. রেফারেল প্রোগ্রাম', body: 'ব্যবহারকারীরা নতুন সদস্য আনয়ন করে রেফারেল কমিশন আয় করতে পারেন। কমিশন হার আপনার সক্রিয় প্ল্যান স্তর দ্বারা নির্ধারিত হয় এবং লেভেল ১, ২ ও ৩ রেফারেলে প্রযোজ্য। রেফারেল অপব্যবহার বা মাল্টি-অ্যাকাউন্ট করলে স্থায়ী অ্যাকাউন্ট বাতিল হবে।' },
      { heading: '৭. নিষিদ্ধ কার্যক্রম', body: 'আপনি করতে পারবেন না: স্বয়ংক্রিয় বট বা স্ক্রিপ্ট ব্যবহার; একাধিক অ্যাকাউন্ট তৈরি; টাস্ক সিস্টেম ম্যানিপুলেশন; অর্থ পাচার; অ্যাকাউন্ট শেয়ার; বা কোনো অবৈধ উদ্দেশ্যে প্ল্যাটফর্ম ব্যবহার। লঙ্ঘনে অবিলম্বে অ্যাকাউন্ট বাতিল হবে।' },
      { heading: '৮. দায়বদ্ধতার সীমা', body: 'ফোনক্রাফট কোনো পরোক্ষ বা আনুষঙ্গিক ক্ষতির জন্য দায়ী নয়। প্ল্যাটফর্ম কোনো আয়ের গ্যারান্টি দেয় না। আয় প্ল্যান স্তর, টাস্ক সম্পন্ন এবং রেফারেল কার্যক্রমের উপর নির্ভর করে।' },
      { heading: '৯. পরিচালনা আইন', body: 'এই শর্তাবলী প্রযোজ্য আইন দ্বারা পরিচালিত হয়। যেকোনো বিরোধ বাধ্যতামূলক সালিশির মাধ্যমে সমাধান করা হবে। প্ল্যাটফর্ম ব্যবহার করে আপনি ক্লাস-অ্যাকশন মামলায় অংশগ্রহণের অধিকার ছেড়ে দিচ্ছেন।' },
      { heading: '১০. পরিবর্তন', body: 'আমরা যেকোনো সময় এই শর্তাবলী আপডেট করার অধিকার সংরক্ষণ করি। পরিবর্তনের পরেও প্ল্যাটফর্ম ব্যবহার অব্যাহত রাখা মানে সংশোধিত শর্তাবলী গ্রহণ করা। গুরুত্বপূর্ণ পরিবর্তনের জন্য ইন-অ্যাপ নোটিফিকেশনের মাধ্যমে জানানো হবে।' },
    ],
  },
  privacy: {
    title: 'গোপনীয়তা নীতি',
    sections: [
      { heading: '১. আমরা যা তথ্য সংগ্রহ করি', body: 'আমরা সংগ্রহ করি: অ্যাকাউন্ট তথ্য (নাম, ইমেইল/ফোন, পাসওয়ার্ড হ্যাশ); ব্যবহারের ডেটা (সম্পন্ন টাস্ক, লগইন সময়, ডিভাইস তথ্য); আর্থিক ডেটা (প্ল্যান কেনা, উইথড্রেল রিকোয়েস্ট); রেফারেল নেটওয়ার্ক তথ্য; এবং সাপোর্টের সাথে যোগাযোগের রেকর্ড।' },
      { heading: '২. আমরা কীভাবে তথ্য ব্যবহার করি', body: 'আপনার ডেটা ব্যবহার করা হয়: প্ল্যাটফর্ম সেবা প্রদান ও উন্নত করতে; লেনদেন ও উইথড্রেল প্রক্রিয়া করতে; প্রতারণা প্রতিরোধ ও শর্তাবলী প্রয়োগ করতে; সেবা বিজ্ঞপ্তি পাঠাতে; রেফারেল কমিশন গণনা করতে; এবং আইনি বাধ্যবাধকতা পূরণ করতে।' },
      { heading: '৩. ডেটা শেয়ারিং', body: 'আমরা আপনার ব্যক্তিগত ডেটা তৃতীয় পক্ষের কাছে বিক্রি করি না। আমরা শুধুমাত্র শেয়ার করতে পারি: উইথড্রেল লেনদেনের জন্য পেমেন্ট প্রসেসরের সাথে; আইন দ্বারা প্রয়োজন হলে আইনি কর্তৃপক্ষের সাথে; কঠোর গোপনীয়তা চুক্তির আওতায় সেবা প্রদানকারীদের সাথে।' },
      { heading: '৪. ডেটা নিরাপত্তা', body: 'আমরা শিল্পমান নিরাপত্তা ব্যবস্থা বাস্তবায়ন করি: এনক্রিপ্টেড পাসওয়ার্ড স্টোরেজ; সমস্ত ডেটা ট্রান্সমিশনে HTTPS এনক্রিপশন; নিরাপদ ডেটাবেস অ্যাক্সেস নিয়ন্ত্রণ; এবং নিয়মিত নিরাপত্তা অডিট। তবে কোনো সিস্টেম ১০০% নিরাপদ নয়।' },
      { heading: '৫. ডেটা সংরক্ষণ', body: 'অ্যাকাউন্ট সক্রিয় থাকাকালীন ডেটা সংরক্ষণ করা হয়। অ্যাকাউন্ট মুছে ফেলার পর ৩০ দিনের মধ্যে ব্যক্তিগত ডেটা মুছে ফেলা হয়, তবে আইনি বা আর্থিক সম্মতির জন্য প্রয়োজনীয় ডেটা রাখা হতে পারে।' },
      { heading: '৬. আপনার অধিকার', body: 'আপনার অধিকার আছে: আপনার ব্যক্তিগত ডেটা অ্যাক্সেস করার; ভুল ডেটা সংশোধন করার; ডেটা মুছে ফেলার অনুরোধ করার; ডেটা প্রক্রিয়াকরণে সম্মতি প্রত্যাহার করার; এবং পোর্টেবল ফরম্যাটে আপনার ডেটার কপি পাওয়ার।' },
      { heading: '৭. কুকিজ', body: 'আমরা সেশন ম্যানেজমেন্ট ও প্রমাণীকরণের জন্য অপরিহার্য কুকিজ ব্যবহার করি। আমরা তৃতীয় পক্ষের ট্র্যাকিং বা বিজ্ঞাপন কুকিজ ব্যবহার করি না। আপনি ব্রাউজারে কুকিজ নিষ্ক্রিয় করতে পারেন, তবে এটি প্ল্যাটফর্মের কার্যকারিতা প্রভাবিত করতে পারে।' },
      { heading: '৮. শিশুদের গোপনীয়তা', body: 'ফোনক্রাফট ১৮ বছরের কম বয়সী ব্যবহারকারীদের জন্য নয়। আমরা জ্ঞাতসারে নাবালকদের কাছ থেকে ব্যক্তিগত তথ্য সংগ্রহ করি না। কোনো নাবালক নিবন্ধিত হলে সেই অ্যাকাউন্ট অবিলম্বে বাতিল করা হবে।' },
      { heading: '৯. যোগাযোগ', body: 'গোপনীয়তা সংক্রান্ত অনুরোধ বা প্রশ্নের জন্য ইন-অ্যাপ সাপোর্ট চ্যানেলের মাধ্যমে আমাদের ডেটা প্রটেকশন অফিসারের সাথে যোগাযোগ করুন। আমরা সকল গোপনীয়তা জিজ্ঞাসার উত্তর ৭২ ঘন্টার মধ্যে দিই।' },
    ],
  },
};

// ── Video Card ──────────────────────────────────────────────────────────────
function VideoCard({ video, isActive }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!isActive && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  return (
      <div style={{ width: '100%', borderRadius: 16, overflow: 'hidden',
        background: '#0a0c10', border: '1px solid rgba(35,175,145,0.25)',
        boxShadow: isActive ? '0 8px 32px rgba(35,175,145,0.18)' : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', overflow: 'hidden' }}>
          <style>{`
            @keyframes gridPulse { 0%,100%{opacity:.18} 50%{opacity:.32} }
            .vid-grid {
              position:absolute; inset:0;
              background-image:
                linear-gradient(rgba(35,175,145,.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(35,175,145,.15) 1px, transparent 1px);
              background-size: 28px 28px;
              animation: gridPulse 3s ease-in-out infinite;
            }
          `}</style>
          <video
            ref={videoRef}
            src={video.src}
            controls
            playsInline
            preload="none"
            style={{ position:'absolute', inset:0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <div style={{ padding: '10px 16px 13px' }}>
          <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:'clamp(13px,2vw,16px)', color:'#EAECEF', marginBottom:2 }}>{video.title}</div>
          <div style={{ fontSize:'clamp(11px,1.5vw,13px)', color:'rgba(112,122,138,0.9)' }}>{video.subtitle}</div>
        </div>
      </div>
  );
}

// ── Video Slider ────────────────────────────────────────────────────────────
function VideoSlider() {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const resetTimer = (idx) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(p => (p + 1) % VIDEOS.length);
    }, 7000);
    if (idx !== undefined) setActive(idx);
  };

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, []);

  return (
    <div>
      <VideoCard video={VIDEOS[active]} isActive={true} key={active} />
      {/* Dots */}
      <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:12 }}>
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            onClick={() => resetTimer(i)}
            style={{
              width: active === i ? 24 : 8, height: 8,
              borderRadius: 4, border:'none', cursor:'pointer',
              background: active === i ? '#23AF91' : 'rgba(112,122,138,0.35)',
              transition: 'all .28s ease', padding:0,
            }}
          />
        ))}
      </div>
      {/* Slide labels row */}
      <div style={{ display:'flex', gap:6, marginTop:10, overflowX:'auto', paddingBottom:2, scrollbarWidth:'none' }}>
        {VIDEOS.map((v, i) => (
          <button
            key={i}
            onClick={() => resetTimer(i)}
            style={{
              flexShrink:0, padding:'5px 12px', borderRadius:20,
              border: `1px solid ${active===i ? '#23AF91' : 'rgba(43,49,57,0.9)'}`,
              background: active===i ? 'rgba(35,175,145,0.12)' : 'transparent',
              color: active===i ? '#23AF91' : 'rgba(112,122,138,0.8)',
              fontSize:13, fontFamily:'Space Grotesk', fontWeight:600,
              cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s',
            }}
          >
            {v.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Legal Modal ─────────────────────────────────────────────────────────────
function LegalModal({ doc, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)',
        display:'flex', alignItems:'flex-end', justifyContent:'center',
        padding:'0 0 0 0',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:'100%', maxWidth:520, maxHeight:'82vh',
          background:'#161A25', borderRadius:'20px 20px 0 0',
          border:'1px solid rgba(43,49,57,0.9)',
          borderBottom:'none',
          display:'flex', flexDirection:'column',
          boxShadow:'0 -8px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px 14px', borderBottom:'1px solid rgba(43,49,57,0.9)', flexShrink:0 }}>
          <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:18, color:'#EAECEF' }}>{doc.title}</div>
          <button onClick={onClose} style={{ background:'rgba(43,49,57,0.6)', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', color:'#707A8A', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>
        {/* Content */}
        <div style={{ overflowY:'auto', padding:'16px 20px 24px', flex:1 }}>
          <p style={{ fontSize:13, color:'#707A8A', marginBottom:16, lineHeight:1.6 }}>
            Last updated: March 6, 2026 &nbsp;·&nbsp; Effective immediately
          </p>
          {doc.sections.map((s, i) => (
            <div key={i} style={{ marginBottom:18 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#23AF91', marginBottom:6 }}>{s.heading}</div>
              <p style={{ fontSize:13, color:'rgba(234,236,239,0.75)', lineHeight:1.75 }}>{s.body}</p>
            </div>
          ))}
          <div style={{ marginTop:24, padding:'12px 16px', background:'rgba(35,175,145,0.06)', border:'1px solid rgba(35,175,145,0.2)', borderRadius:10 }}>
            <p style={{ fontSize:13, color:'rgba(35,175,145,0.85)', lineHeight:1.7 }}>
              By creating an account or using PhoneCraft, you acknowledge that you have read, understood, and agree to be bound by these terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = '', prefix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        start = Math.min(start + step, target);
        setVal(Math.floor(start));
        if (start >= target) clearInterval(timer);
      }, 16);
    });
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ── Main LandingScreen ───────────────────────────────────────────────────────
export default function LandingScreen({ isDark, onGetStarted, onLogin, lang = 'en', setLang }) {
  const [legalDoc, setLegalDoc] = useState(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try { return !!localStorage.getItem('pwa-banner-dismissed'); } catch { return false; }
  });
  const [installTab, setInstallTab] = useState('android');
  const isIOS = /iphone|ipad|ipod/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const isInstalled = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') { setDeferredPrompt(null); setBannerDismissed(true); }
  };

  const dismissBanner = () => {
    setBannerDismissed(true);
    try { localStorage.setItem('pwa-banner-dismissed', '1'); } catch (_) {}
  };

  const t = LD_TEXT[lang] || LD_TEXT.en;
  const legalData = lang === 'bn' ? LEGAL_BN : LEGAL;

  return (
    <>
      <PwaInstallGuideModal open={showInstallGuide} onClose={() => setShowInstallGuide(false)} lang={lang} />
      <style>{`
        @keyframes landingFadeUp { from{ opacity:0; transform:translateY(22px); } to{ opacity:1; transform:translateY(0); } }
        @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-8px) scale(1.03)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes ringRotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse2 { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.7;transform:scale(1.04)} }
        .ld-fade { animation: landingFadeUp .55s ease both; }
        .ld-fade-1 { animation-delay:.05s; }
        .ld-fade-2 { animation-delay:.12s; }
        .ld-fade-3 { animation-delay:.20s; }
        .ld-fade-4 { animation-delay:.28s; }
        .ld-fade-5 { animation-delay:.38s; }
        .ld-fade-6 { animation-delay:.48s; }

        /* ── Responsive container ── */
        .ld-wrap {
          width:100%; max-width:1400px; margin:0 auto;
          padding:0 clamp(16px,4vw,72px);
          box-sizing:border-box;
        }
        .ld-section {
          padding-bottom: clamp(32px,5vw,64px);
        }

        /* ── Section title ── */
        .ld-sec-head {
          display:flex; align-items:center; gap:10px; margin-bottom:clamp(16px,2.5vw,28px);
        }
        .ld-sec-title {
          font-family:'Space Grotesk',sans-serif; font-weight:700;
          font-size:clamp(17px,2.2vw,28px);
        }

        /* ── Plans grid: auto-fill so cards never get too narrow ── */
        .ld-plans-grid {
          display:grid;
          grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
          gap:clamp(12px,2vw,22px);
        }
        @media(min-width:1100px) { .ld-plans-grid { grid-template-columns:repeat(4,1fr); } }

        /* ── How it works: 1-col mobile → 3-col desktop ── */
        .ld-steps-grid {
          display:grid;
          grid-template-columns:1fr;
          gap:clamp(10px,1.5vw,18px);
        }
        @media(min-width:600px)  { .ld-steps-grid { grid-template-columns:repeat(3,1fr); } }

        /* ── Stats row ── */
        .ld-stats-row {
          display:flex; justify-content:center;
          gap:clamp(20px,5vw,72px); margin-top:clamp(24px,4vw,40px); flex-wrap:wrap;
        }

        .ld-hero-ring {
          position:absolute; border-radius:50%;
          border:1px solid rgba(35,175,145,0.18);
          animation: ringRotate 14s linear infinite;
        }
        .ld-hero-ring2 {
          position:absolute; border-radius:50%;
          border:1px dashed rgba(99,102,241,0.15);
          animation: ringRotate 22s linear infinite reverse;
        }

        .ld-plan-card {
          padding:clamp(16px,2vw,24px) clamp(14px,1.6vw,20px); border-radius:14px;
          border:1px solid rgba(43,49,57,0.9);
          background:rgba(22,26,37,0.85);
          transition: border-color .22s, transform .22s, box-shadow .22s;
          cursor:pointer;
        }
        .ld-plan-card:hover { transform:translateY(-3px); }
        .ld-plan-card.popular {
          border-color: rgba(99,102,241,0.5);
          background:rgba(99,102,241,0.07);
        }

        .ld-step-line {
          position:absolute; top:20px; left:calc(50% + 20px);
          width: calc(100% - 40px); height:1px;
          background: linear-gradient(90deg, rgba(35,175,145,.4), rgba(99,102,241,.2));
        }

        .ld-trust-badge {
          display:flex; align-items:center; gap:10px;
          padding:12px 16px; border-radius:10px;
          border:1px solid rgba(43,49,57,0.9);
          background:rgba(22,26,37,.5);
          font-size:13px; color:rgba(234,236,239,0.8);
        }
        .ld-legal-btn {
          background:none; border:1px solid rgba(43,49,57,0.9);
          color:#707A8A; cursor:pointer; border-radius:8px;
          padding:9px 16px; font-size:13px; font-family:Inter,sans-serif;
          transition: border-color .2s, color .2s;
          text-decoration:none; display:inline-block; text-align:center;
        }
        .ld-legal-btn:hover { border-color:rgba(35,175,145,.4); color:#23AF91; }
      `}</style>

      {/* ── PWA INSTALL BANNER ── */}
      {!bannerDismissed && !isInstalled && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(10,12,16,0.97), rgba(22,26,37,0.97))',
          borderBottom: '1px solid rgba(35,175,145,.3)',
          padding: '10px clamp(16px,4vw,56px)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(35,175,145,.2), rgba(35,175,145,.08))',
            border: '1px solid rgba(35,175,145,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            <img src="/logo.png" alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} onError={e => { e.target.style.display='none'; }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, color: '#EAECEF', lineHeight: 1.2 }}>{t.install_banner_title}</div>
            <div style={{ fontSize: 12, color: '#707A8A', marginTop: 2, lineHeight: 1.3 }}>{t.install_banner_sub}</div>
          </div>
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#23AF91,#1a8f75)', color: '#fff', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 2px 12px rgba(35,175,145,.35)' }}
            >{t.install_btn}</button>
          )}
          <button
            onClick={dismissBanner}
            style={{ background: 'none', border: '1px solid rgba(43,49,57,.8)', color: '#707A8A', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0, padding: '4px 8px', borderRadius: 6, transition: 'all .2s' }}
            onMouseEnter={e => { e.target.style.borderColor='rgba(35,175,145,.4)'; e.target.style.color='#23AF91'; }}
            onMouseLeave={e => { e.target.style.borderColor='rgba(43,49,57,.8)'; e.target.style.color='#707A8A'; }}
          >✕</button>
        </div>
      )}

      <div
        onClick={() => setShowInstallGuide(true)}
        style={{
          cursor: 'pointer',
          background: 'linear-gradient(90deg, rgba(35,175,145,.2), rgba(99,102,241,.14))',
          borderBottom: '1px solid rgba(35,175,145,.28)',
          padding: '10px clamp(16px,4vw,56px)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(10,12,16,.45)',
          border: '1px solid rgba(35,175,145,.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          flexShrink: 0,
        }}>
          <img src="/logo.png" alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: 800, color: '#EAECEF' }}>
            {lang === 'bn' ? 'অ্যাপ ইনস্টল গাইড দেখুন' : 'Open App Install Guide'}
          </div>
          <div style={{ fontSize: 11, color: '#9AA4B2', marginTop: 1 }}>
            {lang === 'bn' ? 'Android ও iPhone-এ হোম স্ক্রিনে যোগ করার ধাপ' : 'Step-by-step Android & iPhone home screen install'}
          </div>
        </div>
        <span style={{ color: '#23AF91', fontSize: 17, fontWeight: 900, flexShrink: 0 }}>›</span>
      </div>

      <div style={{ minHeight:'100dvh', background:'transparent', color:'#EAECEF', fontFamily:'Inter,sans-serif', paddingBottom:60, overflowX:'hidden' }}>

        {/* ── TOP NAV ── */}
        <nav style={{
          position:'sticky', top:0, zIndex:100,
          background:'rgba(11,14,17,0.92)', backdropFilter:'blur(16px)',
          borderBottom:'1px solid rgba(43,49,57,0.7)',
        }}>
          <div className="ld-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px clamp(16px,3.5vw,56px)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <img src="/logo.png" alt="PhoneCraft" style={{ width:30, height:30, objectFit:'contain' }} onError={e=>{e.target.style.display='none'}} />
            <span style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:'clamp(18px,4vw,22px)', letterSpacing:.5 }}>
              PHONE<span style={{ color:'#23AF91' }}>CRAFT</span>
            </span>
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <button
              onClick={onLogin}
              style={{ padding:'8px 18px', borderRadius:8, border:'1px solid rgba(35,175,145,.4)', background:'transparent', color:'#23AF91', fontFamily:'Space Grotesk', fontWeight:600, fontSize:14, cursor:'pointer', transition:'all .2s' }}
              onMouseEnter={e=>{ e.target.style.background='rgba(35,175,145,.1)'; }}
              onMouseLeave={e=>{ e.target.style.background='transparent'; }}
            >{t.login}</button>
            <button
              onClick={onGetStarted}
              style={{ padding:'8px 18px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#23AF91,#1a8f75)', color:'#fff', fontFamily:'Space Grotesk', fontWeight:700, fontSize:14, cursor:'pointer', boxShadow:'0 2px 12px rgba(35,175,145,.3)' }}
            >{t.signup}</button>
          </div>
          </div>{/* end ld-wrap */}
        </nav>

        {/* ── HERO ── */}
        <div style={{ textAlign:'center', padding:'clamp(36px,6vw,72px) 0 clamp(28px,4vw,52px)', position:'relative', overflow:'hidden' }}>
          <div className="ld-wrap" style={{ position:'relative', zIndex:1 }}>
          {/* Background rings */}
          <div className="ld-hero-ring" style={{ width:260, height:260, top:'50%', left:'50%', marginTop:-130, marginLeft:-130 }} />
          <div className="ld-hero-ring2" style={{ width:360, height:360, top:'50%', left:'50%', marginTop:-180, marginLeft:-180 }} />
          {/* Glow orb */}
          <div style={{ position:'absolute', top:20, left:'50%', transform:'translateX(-50%)', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(35,175,145,.12) 0%, transparent 70%)', pointerEvents:'none' }} />

          {/* Logo - Animated Portal */}
          <div className="ld-fade ld-fade-1 auth-logo-wrap" style={{ marginBottom:4, paddingTop:0, paddingBottom:0 }}>
            <div className="auth-logo-portal">
              <div className="auth-logo-ring" />
              <div className="auth-logo-ring2" />
              <div className="auth-logo-glow" />
              <div className="auth-logo-svg">
                <img src="/logo.png" alt="PhoneCraft" style={{ width:110, height:110, objectFit:'contain' }} onError={e=>{ e.target.style.display='none'; e.target.parentElement.innerHTML='📱'; }} />
              </div>
              <span className="auth-orbit-dot" />
              <span className="auth-orbit-dot" />
              <span className="auth-orbit-dot" />
              <span className="auth-orbit-dot" />
            </div>
          </div>

          {/* Badge */}
          <div className="ld-fade ld-fade-1" style={{ display:'inline-block', padding:'5px 16px', borderRadius:20, background:'rgba(35,175,145,.1)', border:'1px solid rgba(35,175,145,.3)', fontSize:12, color:'#23AF91', fontFamily:'Space Grotesk', fontWeight:700, letterSpacing:2, marginBottom:16 }}>
            {t.badge}
          </div>

          {/* Headline */}
          <h1 className="ld-fade ld-fade-2" style={{ fontFamily:'Space Grotesk', fontSize:'clamp(28px,4vw,56px)', fontWeight:900, lineHeight:1.18, marginBottom:14, position:'relative' }}>
            {t.headline1}<br />
            <span style={{ background:'linear-gradient(90deg,#23AF91,#6366F1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              {t.headline2}
            </span>
          </h1>

          <p className="ld-fade ld-fade-3" style={{ fontSize:'clamp(14px,1.3vw,18px)', color:'rgba(112,122,138,0.9)', maxWidth:460, margin:'0 auto 28px', lineHeight:1.75 }}>
            {t.desc}
          </p>

          {/* CTA buttons */}
          <div className="ld-fade ld-fade-3" style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button
              onClick={onGetStarted}
              style={{
                padding:'14px 36px', borderRadius:12, border:'none',
                background:'linear-gradient(135deg,#23AF91,#1a8f75)',
                color:'#fff', fontFamily:'Space Grotesk', fontWeight:700, fontSize:16,
                cursor:'pointer', boxShadow:'0 4px 20px rgba(35,175,145,.35)',
                transition:'transform .18s, box-shadow .18s',
              }}
              onMouseEnter={e=>{ e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 6px 24px rgba(35,175,145,.45)'; }}
              onMouseLeave={e=>{ e.target.style.transform='none'; e.target.style.boxShadow='0 4px 20px rgba(35,175,145,.35)'; }}
            >
              {t.cta_start}
            </button>
            <button
              onClick={onLogin}
              style={{ padding:'14px 32px', borderRadius:12, border:'1px solid rgba(35,175,145,.3)', background:'rgba(35,175,145,.05)', color:'#23AF91', fontFamily:'Space Grotesk', fontWeight:600, fontSize:16, cursor:'pointer', transition:'all .18s' }}
            >
              {t.cta_member}
            </button>
          </div>

          {/* Stats row */}
          <div className="ld-fade ld-fade-4 ld-stats-row">
            {[
              { val:84000, suffix:'+', label: t.stat_members },
              { val:20, prefix:'৳', suffix:'–৳100', label: t.stat_task },
              { val:20, suffix: lang==='bn' ? '+' : ' Countries', label: t.stat_world },
            ].map((s, i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(22px,3vw,36px)', fontWeight:900, color:'#23AF91' }}>
                  {i === 1
                    ? <>{convertCurrency(20, lang)}–{convertCurrency(100, lang)}</>
                    : <Counter target={s.val} suffix={s.suffix} prefix={s.prefix||''} />
                  }
                </div>
                <div style={{ fontSize:12, color:'#707A8A', marginTop:2, letterSpacing:.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
          </div>{/* end ld-wrap */}
        </div>

        {/* ── VIDEO SLIDER ── */}
        <section className="ld-fade ld-fade-4 ld-section">
          <div className="ld-wrap">
          <div className="ld-sec-head">
            <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#23AF91,#6366F1)', display:'inline-block' }} />
            <span className="ld-sec-title">{t.vid_title}</span>
            <span style={{ marginLeft:'auto', fontSize:10, color:'#23AF91', background:'rgba(35,175,145,.1)', border:'1px solid rgba(35,175,145,.2)', borderRadius:10, padding:'2px 8px', fontFamily:'Space Grotesk', fontWeight:600 }}>{t.vid_live}</span>
          </div>
          <div style={{ maxWidth:760, margin:'0 auto' }}>
            <VideoSlider />
          </div>
          </div>{/* end ld-wrap */}
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="ld-fade ld-fade-4 ld-section">
          <div className="ld-wrap">
          <div className="ld-sec-head">
            <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#23AF91,#6366F1)', display:'inline-block' }} />
            <span className="ld-sec-title">{t.how_title}</span>
          </div>
          <div className="ld-steps-grid">
            {t.steps.map((s, i) => (
              <div key={i} style={{ textAlign:'center', padding:'clamp(16px,2.5vw,24px) clamp(10px,2vw,18px)', borderRadius:14, border:'1px solid rgba(43,49,57,0.9)', background:'rgba(22,26,37,.7)' }}>
                <div style={{ fontSize:'clamp(26px,3.5vw,38px)', marginBottom:8 }}>{s.icon}</div>
                <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(10px,0.9vw,13px)', fontWeight:700, color:'#23AF91', letterSpacing:1.5, marginBottom:6 }}>STEP {s.step}</div>
                <div style={{ fontWeight:700, fontSize:'clamp(13px,1.4vw,17px)', marginBottom:6 }}>{s.title}</div>
                <div style={{ fontSize:'clamp(12px,1.1vw,15px)', color:'#707A8A', lineHeight:1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          </div>{/* end ld-wrap */}
        </section>

        {/* ── PLANS ── */}
        <section className="ld-fade ld-fade-5 ld-section">
          <div className="ld-wrap">
          <div className="ld-sec-head">
            <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#23AF91,#6366F1)', display:'inline-block' }} />
            <span className="ld-sec-title">{t.plans_title}</span>
          </div>
          <p style={{ fontSize:'clamp(13px,1.2vw,16px)', color:'#707A8A', marginBottom:20 }}>{t.plans_sub}</p>

          <style>{`
            .pcard { border-radius:18px; padding:clamp(18px,2.2vw,28px) clamp(16px,1.8vw,24px) clamp(16px,2vw,22px); transition:transform .22s, box-shadow .22s; cursor:pointer; position:relative; overflow:hidden; }
            .pcard:hover { transform:translateY(-4px); }
            .pcard-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:20px; font-size:clamp(10px,1vw,13px); font-family:'Space Grotesk',sans-serif; font-weight:700; letter-spacing:1.2px; margin-bottom:12px; }
            .pcard-feat { display:flex; align-items:center; gap:8px; padding:5px 0; font-size:clamp(12px,1.1vw,14px); color:rgba(234,236,239,.85); }
            .pcard-feat-sep { height:1px; background:rgba(255,255,255,.07); margin:10px 0; }
            .pcard-old-price { text-decoration:line-through; color:#707A8A; font-size:clamp(12px,1vw,14px); font-weight:500; }
            .pcard-save { font-size:clamp(9px,.9vw,11px); font-weight:700; padding:3px 9px; border-radius:10px; margin-left:6px; }
            @keyframes shimmerPlan { 0%{opacity:.6} 50%{opacity:1} 100%{opacity:.6} }
            .pcard-glow { position:absolute; pointer-events:none; border-radius:50%; filter:blur(40px); opacity:.12; }
          `}</style>

          <div className="ld-plans-grid">

            {/* BASIC */}
            <div className="pcard" onClick={onGetStarted}
              style={{ background:'linear-gradient(145deg,#0f1e1a,#111820)', border:'1px solid rgba(35,175,145,.3)' }}
              onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 10px 32px rgba(35,175,145,.2)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow='none'; }}
            >
              <div className="pcard-glow" style={{ width:160, height:160, background:'#23AF91', top:-40, right:-40 }} />
              <div style={{ marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <div className="pcard-badge" style={{ background:'rgba(35,175,145,.15)', border:'1px solid rgba(35,175,145,.3)', color:'#23AF91' }}>
                    {t.plan_basic_badge}
                  </div>
                  <span className="pcard-save" style={{ background:'rgba(35,175,145,.15)', color:'#23AF91' }}>SAVE {convertCurrency(2200, lang)}</span>
                </div>
                <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(20px,1.8vw,26px)', fontWeight:900, lineHeight:1, marginBottom:6 }}>BASIC</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'Space Grotesk', fontSize:'clamp(24px,2vw,30px)', fontWeight:900, color:'#23AF91', lineHeight:1 }}>{convertCurrency(12800, lang)}</span>
                  <span className="pcard-old-price">{convertCurrency(15000, lang)}</span>
                </div>
                <div style={{ fontSize:11, color:'#707A8A', marginTop:2 }}>{t.one_time}</div>
              </div>
              <div className="pcard-feat-sep" />
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {[
                  `10 Tasks/day · ${convertCurrency(20, lang)} per task`,
                  `${convertCurrency(200, lang)} daily earning`,
                  '3-Level referral',
                  'Standard withdrawal',
                  'Email support',
                ].map((f,i)=>(
                  <div key={i} className="pcard-feat">
                    <span style={{ width:16, height:16, borderRadius:'50%', background:'rgba(35,175,145,.15)', border:'1px solid rgba(35,175,145,.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="8" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#23AF91" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
                    </span>
                    {f}
                  </div>
                ))}
              </div>
              <button onClick={onGetStarted} style={{ width:'100%', marginTop:16, padding:'12px', borderRadius:10, border:'1.5px solid rgba(35,175,145,.5)', background:'rgba(35,175,145,.08)', color:'#23AF91', fontFamily:'Space Grotesk', fontWeight:700, fontSize:15, cursor:'pointer', transition:'background .2s' }}
                onMouseEnter={e=>{ e.target.style.background='rgba(35,175,145,.18)'; }}
                onMouseLeave={e=>{ e.target.style.background='rgba(35,175,145,.08)'; }}
              >{t.act_basic}</button>
            </div>

            {/* PREMIUM */}
            <div className="pcard" onClick={onGetStarted}
              style={{ background:'linear-gradient(145deg,#0e1022,#111626)', border:'2px solid rgba(99,102,241,.55)' }}
              onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 10px 36px rgba(99,102,241,.28)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow='none'; }}
            >
              <div className="pcard-glow" style={{ width:180, height:180, background:'#6366F1', top:-50, right:-50 }} />
              {/* MOST POPULAR ribbon */}
              <div style={{ position:'absolute', top:14, right:-28, background:'linear-gradient(135deg,#6366F1,#818CF8)', color:'#fff', fontSize:9, fontFamily:'Space Grotesk', fontWeight:700, padding:'4px 36px', transform:'rotate(35deg)', letterSpacing:1.2, boxShadow:'0 2px 8px rgba(99,102,241,.4)' }}>
                {t.popular_ribbon}
              </div>
              <div style={{ marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <div className="pcard-badge" style={{ background:'rgba(99,102,241,.15)', border:'1px solid rgba(99,102,241,.4)', color:'#818CF8' }}>
                    {t.plan_premium_badge}
                  </div>
                  <span className="pcard-save" style={{ background:'rgba(99,102,241,.15)', color:'#818CF8' }}>SAVE {convertCurrency(4500, lang)}</span>
                </div>
                <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(20px,1.8vw,26px)', fontWeight:900, lineHeight:1, marginBottom:6 }}>PREMIUM</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'Space Grotesk', fontSize:'clamp(24px,2vw,30px)', fontWeight:900, color:'#818CF8', lineHeight:1 }}>{convertCurrency(25500, lang)}</span>
                  <span className="pcard-old-price">{convertCurrency(30000, lang)}</span>
                </div>
                <div style={{ fontSize:11, color:'#707A8A', marginTop:2 }}>{t.one_time}</div>
              </div>
              <div className="pcard-feat-sep" />
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {[
                  `10 Tasks/day · ${convertCurrency(42, lang)} per task`,
                  `${convertCurrency(420, lang)} daily earning`,
                  '3-Level referral',
                  'Priority withdrawal',
                  'Team dashboard · Advanced stats',
                  'Priority support',
                ].map((f,i)=>(
                  <div key={i} className="pcard-feat">
                    <span style={{ width:16, height:16, borderRadius:'50%', background:'rgba(99,102,241,.15)', border:'1px solid rgba(99,102,241,.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="8" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#818CF8" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
                    </span>
                    {f}
                  </div>
                ))}
              </div>
              <button onClick={onGetStarted} style={{ width:'100%', marginTop:16, padding:'12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#6366F1,#818CF8)', color:'#fff', fontFamily:'Space Grotesk', fontWeight:700, fontSize:15, cursor:'pointer', boxShadow:'0 4px 16px rgba(99,102,241,.35)' }}>
                {t.act_premium}
              </button>
            </div>

            {/* GOLD */}
            <div className="pcard" onClick={onGetStarted}
              style={{ background:'linear-gradient(145deg,#171208,#131009)', border:'1px solid rgba(252,213,53,.35)' }}
              onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 10px 36px rgba(252,213,53,.18)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow='none'; }}
            >
              <div className="pcard-glow" style={{ width:180, height:180, background:'#FCD535', top:-50, right:-50 }} />
              <div style={{ marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <div className="pcard-badge" style={{ background:'rgba(252,213,53,.12)', border:'1px solid rgba(252,213,53,.35)', color:'#FCD535' }}>
                    {t.plan_gold_badge}
                  </div>
                  <span className="pcard-save" style={{ background:'rgba(252,213,53,.12)', color:'#FCD535' }}>SAVE {convertCurrency(12000, lang)}</span>
                </div>
                <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(20px,1.8vw,26px)', fontWeight:900, lineHeight:1, marginBottom:6 }}>GOLD</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'Space Grotesk', fontSize:'clamp(24px,2vw,30px)', fontWeight:900, color:'#FCD535', lineHeight:1 }}>{convertCurrency(50000, lang)}</span>
                  <span className="pcard-old-price">{convertCurrency(62000, lang)}</span>
                </div>
                <div style={{ fontSize:11, color:'#707A8A', marginTop:2 }}>{t.one_time}</div>
              </div>
              <div className="pcard-feat-sep" />
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {[
                  `12 Tasks/day · ${convertCurrency(75, lang)} per task`,
                  `${convertCurrency(900, lang)} daily earning`,
                  '3-Level referral',
                  'Fast withdrawal',
                  'Team dashboard · Bonus slots',
                  'Priority support',
                ].map((f,i)=>(
                  <div key={i} className="pcard-feat">
                    <span style={{ width:16, height:16, borderRadius:'50%', background:'rgba(252,213,53,.12)', border:'1px solid rgba(252,213,53,.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="8" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#FCD535" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
                    </span>
                    {f}
                  </div>
                ))}
              </div>
              <button onClick={onGetStarted} style={{ width:'100%', marginTop:16, padding:'12px', borderRadius:10, border:'1.5px solid rgba(252,213,53,.5)', background:'rgba(252,213,53,.08)', color:'#FCD535', fontFamily:'Space Grotesk', fontWeight:700, fontSize:15, cursor:'pointer', transition:'background .2s' }}
                onMouseEnter={e=>{ e.target.style.background='rgba(252,213,53,.16)'; }}
                onMouseLeave={e=>{ e.target.style.background='rgba(252,213,53,.08)'; }}
              >{t.act_gold}</button>
            </div>

            {/* PLATINUM */}
            <div className="pcard" onClick={onGetStarted}
              style={{ background:'linear-gradient(145deg,#13100a,#161209)', border:'2px solid rgba(240,185,11,.45)' }}
              onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 10px 40px rgba(240,185,11,.25)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow='none'; }}
            >
              <div className="pcard-glow" style={{ width:200, height:200, background:'#F0B90B', top:-60, right:-60 }} />
              <div style={{ marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <div className="pcard-badge" style={{ background:'rgba(240,185,11,.12)', border:'1px solid rgba(240,185,11,.45)', color:'#F0B90B' }}>
                    {t.plan_plat_badge}
                  </div>
                  <span className="pcard-save" style={{ background:'rgba(240,185,11,.12)', color:'#F0B90B' }}>SAVE {convertCurrency(20000, lang)}</span>
                </div>
                <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(20px,1.8vw,26px)', fontWeight:900, lineHeight:1, marginBottom:6 }}>PLATINUM</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'Space Grotesk', fontSize:'clamp(24px,2vw,30px)', fontWeight:900, color:'#F0B90B', lineHeight:1 }}>{convertCurrency(80000, lang)}</span>
                  <span className="pcard-old-price">{convertCurrency(100000, lang)}</span>
                </div>
                <div style={{ fontSize:11, color:'#707A8A', marginTop:2 }}>{t.one_time}</div>
              </div>
              <div className="pcard-feat-sep" />
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {[
                  `16 Tasks/day · ${convertCurrency(100, lang)} per task`,
                  `${convertCurrency(1600, lang)} daily earning`,
                  '3-Level referral · Max commission',
                  'VIP withdrawal · VIP support',
                  'All bonus features',
                  'Exclusive benefits',
                ].map((f,i)=>(
                  <div key={i} className="pcard-feat">
                    <span style={{ width:16, height:16, borderRadius:'50%', background:'rgba(240,185,11,.12)', border:'1px solid rgba(240,185,11,.45)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="8" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#F0B90B" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
                    </span>
                    {f}
                  </div>
                ))}
              </div>
              <button onClick={onGetStarted} style={{ width:'100%', marginTop:16, padding:'12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#F0B90B,#D4970A)', color:'#0a0800', fontFamily:'Space Grotesk', fontWeight:800, fontSize:15, cursor:'pointer', boxShadow:'0 4px 18px rgba(240,185,11,.35)' }}>
                {t.act_plat}
              </button>
            </div>

          </div>{/* end ld-plans-grid */}
          </div>{/* end ld-wrap */}
        </section>

        {/* ── TRUST SECTION ── */}
        <section className="ld-fade ld-fade-5 ld-section">
          <div className="ld-wrap">
          <div className="ld-sec-head">
            <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#23AF91,#6366F1)', display:'inline-block' }} />
            <span className="ld-sec-title">{t.trust_title}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
            {t.trust_badges.map((b, i) => (
              <div key={i} className="ld-trust-badge">
                <span style={{ fontSize:18, flexShrink:0 }}>{b.icon}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:'clamp(13px,1.2vw,16px)' }}>{b.title}</div>
                  <div style={{ fontSize:'clamp(12px,1vw,14px)', color:'#707A8A', marginTop:2, lineHeight:1.5 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
          </div>{/* end ld-wrap */}
        </section>

        {/* ── LEGAL DOCUMENTS ── */}
        <section className="ld-fade ld-fade-6 ld-section">
          <div className="ld-wrap">
          <div className="ld-sec-head">
            <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#23AF91,#6366F1)', display:'inline-block' }} />
            <span className="ld-sec-title">{t.legal_title}</span>
          </div>
          <div style={{ borderRadius:14, border:'1px solid rgba(43,49,57,0.9)', background:'rgba(22,26,37,.7)', padding:'16px 16px 12px', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
              <span style={{ fontSize:24, flexShrink:0 }}>📋</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{t.legal_heading}</div>
                <p style={{ fontSize:13, color:'#707A8A', lineHeight:1.7, marginBottom:12 }}>
                  {t.legal_body}
                </p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button className="ld-legal-btn" onClick={() => setLegalDoc(legalData.terms)} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid rgba(43,49,57,0.9)', background:'none', color:'#707A8A', cursor:'pointer', fontSize:11, fontFamily:'Inter,sans-serif', transition:'all .2s' }}
                    onMouseEnter={e=>{ e.target.style.borderColor='rgba(35,175,145,.4)'; e.target.style.color='#23AF91'; }}
                    onMouseLeave={e=>{ e.target.style.borderColor='rgba(43,49,57,0.9)'; e.target.style.color='#707A8A'; }}
                  >
                    {t.terms_btn}
                  </button>
                  <button className="ld-legal-btn" onClick={() => setLegalDoc(legalData.privacy)} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid rgba(43,49,57,0.9)', background:'none', color:'#707A8A', cursor:'pointer', fontSize:11, fontFamily:'Inter,sans-serif', transition:'all .2s' }}
                    onMouseEnter={e=>{ e.target.style.borderColor='rgba(35,175,145,.4)'; e.target.style.color='#23AF91'; }}
                    onMouseLeave={e=>{ e.target.style.borderColor='rgba(43,49,57,0.9)'; e.target.style.color='#707A8A'; }}
                  >
                    {t.privacy_btn}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Disclaimer */}
          <div style={{ padding:'12px 14px', borderRadius:10, background:'rgba(240,185,11,.04)', border:'1px solid rgba(240,185,11,.15)' }}>
            <div style={{ fontSize:12, color:'rgba(240,185,11,.7)', lineHeight:1.75 }}>
              <strong style={{ color:'rgba(240,185,11,.9)' }}>⚠️ Disclaimer:</strong> {t.disclaimer}
            </div>
          </div>
          </div>{/* end ld-wrap */}
        </section>

        {/* ── INSTALL APP GUIDE ── */}
        <section className="ld-fade ld-fade-5 ld-section">
          <div className="ld-wrap">
          <div className="ld-sec-head">
            <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#23AF91,#6366F1)', display:'inline-block' }} />
            <span className="ld-sec-title">{t.install_guide_title}</span>
          </div>

          {/* Top row: phone mockup + info */}
          <div style={{ display:'flex', gap:'clamp(20px,4vw,56px)', flexWrap:'wrap', alignItems:'center', marginBottom:28, justifyContent:'center' }}>

            {/* Phone frame mockup */}
            <div style={{ flexShrink:0, position:'relative' }}>
              <div style={{
                width:130, height:230, borderRadius:28,
                border:'3px solid rgba(35,175,145,.45)',
                background:'linear-gradient(160deg,#0d1117,#0a0c10)',
                padding:'12px 8px 16px', display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:8,
                position:'relative', overflow:'hidden',
                boxShadow:'0 0 48px rgba(35,175,145,.15), inset 0 0 24px rgba(35,175,145,.04)',
              }}>
                {/* Status bar */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:26, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px' }}>
                  <span style={{ fontSize:8, color:'rgba(234,236,239,.4)', fontFamily:'Space Grotesk', fontWeight:600 }}>9:41</span>
                  <div style={{ width:30, height:8, borderRadius:4, background:'rgba(35,175,145,.2)', border:'1px solid rgba(35,175,145,.3)' }} />
                  <span style={{ fontSize:8, color:'rgba(234,236,239,.4)' }}>▮▮▮</span>
                </div>
                {/* Screen content */}
                <div style={{ marginTop:8, width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,rgba(35,175,145,.15),rgba(99,102,241,.08))', border:'1px solid rgba(35,175,145,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <img src="/logo.png" alt="PhoneCraft" style={{ width:36, height:36, objectFit:'contain' }} onError={e => { e.target.style.display='none'; }} />
                </div>
                <div style={{ fontFamily:'Space Grotesk', fontWeight:800, fontSize:9, color:'#23AF91', letterSpacing:1.5, textAlign:'center' }}>PHONECRAFT</div>
                <div style={{ width:70, height:1, background:'rgba(35,175,145,.15)' }} />
                <div style={{ width:'80%', height:6, borderRadius:3, background:'rgba(35,175,145,.12)' }} />
                <div style={{ width:'60%', height:6, borderRadius:3, background:'rgba(35,175,145,.07)' }} />
                <div style={{ width:'70%', height:6, borderRadius:3, background:'rgba(35,175,145,.07)' }} />
                {/* Home bar */}
                <div style={{ position:'absolute', bottom:6, left:'50%', transform:'translateX(-50%)', width:44, height:3, borderRadius:2, background:'rgba(35,175,145,.25)' }} />
              </div>
              {/* Glow ring */}
              <div style={{ position:'absolute', inset:-12, borderRadius:36, border:'1px solid rgba(35,175,145,.1)', pointerEvents:'none' }} />
            </div>

            {/* Info block */}
            <div style={{ flex:1, minWidth:220, maxWidth:500 }}>
              <div style={{ fontFamily:'Space Grotesk', fontWeight:900, fontSize:'clamp(17px,2vw,24px)', marginBottom:10, lineHeight:1.25 }}>{t.install_guide_title}</div>
              <div style={{ fontSize:'clamp(13px,1.2vw,15px)', color:'#707A8A', lineHeight:1.8, marginBottom:18 }}>{t.install_guide_sub}</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', background:'rgba(35,175,145,.08)', border:'1px solid rgba(35,175,145,.2)', borderRadius:20 }}>
                  <span style={{ fontSize:13 }}>📱</span>
                  <span style={{ fontSize:12, color:'#23AF91', fontFamily:'Space Grotesk', fontWeight:600 }}>Android Chrome</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', background:'rgba(99,102,241,.08)', border:'1px solid rgba(99,102,241,.2)', borderRadius:20 }}>
                  <span style={{ fontSize:13 }}>🍎</span>
                  <span style={{ fontSize:12, color:'#818cf8', fontFamily:'Space Grotesk', fontWeight:600 }}>Safari (iOS)</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', background:'rgba(35,175,145,.06)', border:'1px solid rgba(35,175,145,.15)', borderRadius:20 }}>
                  <span style={{ fontSize:13 }}>⚡</span>
                  <span style={{ fontSize:12, color:'#707A8A', fontFamily:'Space Grotesk', fontWeight:600 }}>No Store Needed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
            {['android','ios'].map(tab => (
              <button key={tab} onClick={() => setInstallTab(tab)} style={{
                padding: '10px 24px', borderRadius: 10,
                border: installTab !== tab ? '1px solid rgba(35,175,145,.2)' : 'none',
                cursor: 'pointer', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13,
                transition: 'all .2s',
                background: installTab === tab ? 'linear-gradient(135deg,#23AF91,#1a8f75)' : 'rgba(35,175,145,.07)',
                color: installTab === tab ? '#fff' : '#23AF91',
                boxShadow: installTab === tab ? '0 4px 16px rgba(35,175,145,.3)' : 'none',
              }}>
                {tab === 'android' ? `📱 ${t.install_tab_android}` : `🍎 ${t.install_tab_ios}`}
              </button>
            ))}
          </div>

          {/* Step cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:14, marginBottom:16 }}>
            {(installTab === 'android' ? t.install_android_steps : t.install_ios_steps).map((step, i) => (
              <div key={i} style={{
                borderRadius:14, padding:'clamp(16px,2vw,22px)',
                border:'1px solid rgba(43,49,57,.9)',
                background:'rgba(22,26,37,.7)',
                position:'relative', overflow:'hidden',
              }}>
                {/* Top accent line */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#23AF91,#6366F1)', opacity:0.7 }} />
                {/* Step number */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <span style={{ fontFamily:'Space Grotesk', fontSize:10, fontWeight:700, color:'#23AF91', letterSpacing:2 }}>STEP {step.num}</span>
                  <span style={{ width:28, height:28, borderRadius:8, background:'rgba(35,175,145,.1)', border:'1px solid rgba(35,175,145,.2)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{step.icon}</span>
                </div>
                <div style={{ fontWeight:700, fontSize:'clamp(13px,1.3vw,16px)', marginBottom:8, color:'#EAECEF' }}>{step.title}</div>
                <div style={{ fontSize:'clamp(12px,1.1vw,14px)', color:'#707A8A', lineHeight:1.7 }}>{step.desc}</div>
              </div>
            ))}
          </div>

          {/* Tip note */}
          <div style={{ padding:'12px 18px', borderRadius:12, background:'rgba(35,175,145,.05)', border:'1px solid rgba(35,175,145,.15)', display:'flex', alignItems:'flex-start', gap:12 }}>
            <span style={{ fontSize:20, flexShrink:0, marginTop:2 }}>💡</span>
            <span style={{ fontSize:13, color:'rgba(112,122,138,.9)', lineHeight:1.7 }}>{t.install_note}</span>
          </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="ld-section">
          <div className="ld-wrap">
          <div style={{ borderRadius:18, background:'linear-gradient(135deg, rgba(35,175,145,.1), rgba(99,102,241,.08))', border:'1px solid rgba(35,175,145,.2)', padding:'clamp(20px,4vw,40px) clamp(20px,4vw,48px)', textAlign:'center' }}>
            <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(20px,4vw,28px)', fontWeight:900, marginBottom:10 }}>
              {t.cta_title}
            </div>
            <p style={{ fontSize:'clamp(13px,1.5vw,15px)', color:'#707A8A', marginBottom:20, lineHeight:1.7, maxWidth:480, margin:'0 auto 20px' }}>
              {t.cta_body}
            </p>
            <button
              onClick={onGetStarted}
              style={{ padding:'14px 48px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#23AF91,#1a8f75)', color:'#fff', fontFamily:'Space Grotesk', fontWeight:700, fontSize:'clamp(14px,2vw,16px)', cursor:'pointer', boxShadow:'0 4px 24px rgba(35,175,145,.4)' }}
            >
              {t.cta_btn}
            </button>
          </div>
          </div>{/* end ld-wrap */}
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop:'1px solid rgba(43,49,57,.7)', padding:'20px 0 16px' }}>
          <div className="ld-wrap" style={{ textAlign:'center' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10 }}>
              <img src="/logo.png" alt="" style={{ width:20, height:20, objectFit:'contain' }} onError={e=>{e.target.style.display='none'}} />
              <span style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:15 }}>PHONE<span style={{color:'#23AF91'}}>CRAFT</span></span>
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:16, marginBottom:12 }}>
              <button className="ld-legal-btn" onClick={() => setLegalDoc(legalData.terms)} style={{ padding:'4px 0', border:'none', background:'none', color:'#707A8A', cursor:'pointer', fontSize:13, fontFamily:'Inter,sans-serif' }}>{t.footer_terms}</button>
              <span style={{ color:'rgba(43,49,57,.9)' }}>|</span>
              <button className="ld-legal-btn" onClick={() => setLegalDoc(legalData.privacy)} style={{ padding:'4px 0', border:'none', background:'none', color:'#707A8A', cursor:'pointer', fontSize:13, fontFamily:'Inter,sans-serif' }}>{t.footer_privacy}</button>
            </div>
            {setLang && (
              <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:12 }}>
                <button onClick={()=>setLang('en')} style={{ padding:'5px 14px', borderRadius:6, border:'none', background: lang==='en' ? '#23AF91' : 'rgba(35,175,145,.12)', color: lang==='en' ? '#fff' : '#23AF91', fontFamily:'Space Grotesk', fontWeight:700, fontSize:11, cursor:'pointer', transition:'all .2s' }}>EN</button>
                <button onClick={()=>setLang('bn')} style={{ padding:'5px 14px', borderRadius:6, border:'none', background: lang==='bn' ? '#23AF91' : 'rgba(35,175,145,.12)', color: lang==='bn' ? '#fff' : '#23AF91', fontFamily:'Space Grotesk', fontWeight:700, fontSize:11, cursor:'pointer', transition:'all .2s' }}>বাং</button>
              </div>
            )}
            <div style={{ fontSize:12, color:'rgba(112,122,138,.5)' }}>
              {t.footer_copy}
            </div>
          </div>
        </footer>

      </div>

      {/* ── Legal Modal ── */}
      {legalDoc && <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />}
    </>
  );
}
