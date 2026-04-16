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
export const LEGAL = {
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
        body: 'These Terms of Service are governed by and construed in accordance with the laws of England and Wales. Any disputes arising out of or in connection with these terms or the use of the PhoneCraft platform shall be subject to the exclusive jurisdiction of the courts of England and Wales. By using the platform, you agree to submit to the personal jurisdiction of the courts located in England and Wales.',
      },
      {
        heading: '10. Modifications',
        body: 'We reserve the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the revised Terms. We will notify users of significant changes via in-app notification.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    companyNote: 'PhoneCraft Ltd · Company No. 15234567 · Registered in England & Wales · ICO No. ZB456789',
    sections: [
      {
        heading: '1. Company Information',
        body: 'PhoneCraft Ltd is a company registered in England and Wales. Company Number: 15234567. Registered Office: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ. Contact Email: support@phonecraft.com. We are committed to protecting your personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.',
      },
      {
        heading: '2. Information We Collect',
        body: 'We may collect and process the following categories of personal data: (a) Account Information — full name, email address, phone number, encrypted password; (b) Usage Data — login activity, device information (IP, browser type), app interactions; (c) Financial Information — transaction history, subscription or plan purchases, withdrawal requests; (d) Communication Data — messages with customer support.',
      },
      {
        heading: '3. Legal Basis for Processing',
        body: 'We process your personal data under the following lawful bases: Contractual Necessity — to provide our services; Legal Obligation — to comply with UK laws; Legitimate Interest — fraud prevention and service improvement; Consent — where required by law.',
      },
      {
        heading: '4. How We Use Your Data',
        body: 'Your data is used to: provide and maintain our platform; process payments and withdrawals securely; detect and prevent fraud or abuse; communicate important updates; and improve user experience.',
      },
      {
        heading: '5. Data Sharing',
        body: 'We do not sell your personal data. We may share data with: licensed payment processors; legal authorities (if required by law); trusted service providers (under strict contracts). All third parties are required to be GDPR-compliant.',
      },
      {
        heading: '6. International Transfers',
        body: 'If your data is transferred outside the UK, we ensure appropriate safeguards are in place such as Standard Contractual Clauses (SCCs) approved by the ICO, to ensure your data is protected to the same standard.',
      },
      {
        heading: '7. Data Retention',
        body: 'Data is retained while your account is active. After account deletion, personal data is removed within 30 days. Some data may be retained longer for legal or financial compliance purposes as required by applicable UK law.',
      },
      {
        heading: '8. Your Rights (UK GDPR)',
        body: 'Under UK GDPR you have the right to: access your personal data; correct inaccurate data; request deletion (Right to Erasure); restrict or object to processing; withdraw consent; and data portability. To exercise your rights, contact: support@phonecraft.com. We will respond within 30 days.',
      },
      {
        heading: '9. Security Measures',
        body: 'We implement industry-standard security measures including: HTTPS encryption for all data transmission; secure database storage with access controls; encrypted password storage; and regular security audits. However, no system is 100% secure and we cannot guarantee absolute security.',
      },
      {
        heading: '10. Cookies',
        body: 'We use cookies for authentication and session management only. We do not use third-party advertising or tracking cookies. You may disable cookies in your browser settings, but this may affect platform functionality.',
      },
      {
        heading: '11. Children\'s Privacy',
        body: 'Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal data from minors. If we discover a minor has registered, the account will be immediately terminated and all data deleted.',
      },
      {
        heading: '12. Regulatory Compliance',
        body: 'PhoneCraft Ltd complies with the UK GDPR and the Data Protection Act 2018. We are registered with the UK Information Commissioner\'s Office (ICO) — Registration No. ZB456789.',
      },
      {
        heading: '13. Contact Us',
        body: 'For any privacy-related questions or to exercise your rights: Email: support@phonecraft.com — Address: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ. We respond within 48–72 hours.',
      },
      {
        heading: '14. Updates to This Policy',
        body: 'We may update this Privacy Policy from time to time. Users will be notified of significant changes via in-app notification. Continued use of PhoneCraft after changes constitutes acceptance of the updated policy.',
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
      { step:'01', iconKey:'ShieldLock', title:'Create Account',   desc:'Sign up with a referral code & choose your manufacturing plan' },
      { step:'02', iconKey:'Cpu',        title:'Build Phones',     desc:'Complete daily virtual manufacturing tasks on your shift' },
      { step:'03', iconKey:'Dollar',     title:'Earn & Withdraw',  desc:'Collect your earnings and withdraw to your mobile banking' },
    ],
    plans_title: 'Investment Plans',
    plans_sub: 'Choose the plan that fits your earning goal',
    plan_basic_badge:   'STARTER PLAN',
    plan_premium_badge: 'MOST POPULAR',
    plan_gold_badge:    'RECOMMENDED',
    plan_plat_badge:    'POWER USER',
    popular_ribbon: 'POPULAR',
    one_time: 'one-time investment',
    act_basic: 'Activate BASIC', act_premium: 'Activate PREMIUM',
    act_gold:  'Activate GOLD',  act_plat:    'Activate PLATINUM',
    trust_title: 'Why Trust PhoneCraft',
    trust_badges: [
      { iconKey:'Shield', title:'Secure Platform',         desc:'256-bit AES encrypted data & secure payments' },
      { iconKey:'Document', title:'Legal Documents',         desc:'Full Terms of Service & Privacy Policy' },
      { iconKey:'Zap', title:'Daily Payouts',           desc:'Earnings credited instantly after task completion' },
      { iconKey:'Globe', title:'UK Registered Company',  desc:'Companies House No. 15234567 · England & Wales' },
      { iconKey:'Target', title:'ICO Registered',         desc:'UK GDPR & Data Protection Act 2018 · No. ZB456789' },
      { iconKey:'Headset', title:'24/7 Support',            desc:'Dedicated support team always available' },
    ],
    legal_title:   'Legal Documents',
    legal_heading: 'Official Legal Terms',
    legal_body: 'PhoneCraft operates under comprehensive legal terms. All financial transactions, membership agreements, and platform usage are governed by our legally binding documents.',
    terms_btn: 'Terms of Service',
    privacy_btn: 'Privacy Policy',
    disclaimer: 'PhoneCraft Ltd is a real earning platform registered in England & Wales (Company No. 15234567). Earnings are based on completing in-app manufacturing tasks. Income varies by plan and daily performance. Investment in any plan carries risk. Please read all legal documents before registering.',
    cta_title: 'Ready to Start Earning?',
    cta_body: 'Join 84,000+ members who earn daily from the comfort of their home. Registration requires a referral code.',
    cta_btn: 'Create Account Now',
    install_banner_title: 'PhoneCraft App',
    install_banner_sub: 'Install for the best experience — works offline too!',
    install_btn: 'Install',
    install_guide_title: 'Install App on Your Phone',
    install_guide_sub: 'Add PhoneCraft to your home screen in seconds — works like a native app, no Play Store or App Store needed.',
    install_tab_android: 'Android',
    install_tab_ios: 'iPhone / iPad',
    install_android_steps: [
      { num: '01', iconKey: 'MoreVertical', title: 'Open Browser Menu', desc: 'Tap the three-dot (⋮) menu button at the top-right corner of Chrome browser' },
      { num: '02', iconKey: 'Download', title: 'Add to Home Screen', desc: 'Find and tap \'Add to Home Screen\' or \'Install App\' from the dropdown menu' },
      { num: '03', iconKey: 'CheckCircle', title: 'Confirm & Launch', desc: 'Tap \'Add\' or \'Install\' in the popup — the PhoneCraft icon will appear on your home screen' },
    ],
    install_ios_steps: [
      { num: '01', iconKey: 'Upload', title: 'Tap the Share Button', desc: 'Tap the Share icon (rectangle with an arrow pointing up) at the bottom toolbar of Safari' },
      { num: '02', iconKey: 'Download', title: 'Add to Home Screen', desc: 'Scroll down in the share menu and tap \'Add to Home Screen\'' },
      { num: '03', iconKey: 'CheckCircle', title: 'Confirm & Launch', desc: 'Tap \'Add\' in the top-right corner — the PhoneCraft icon will appear on your home screen' },
    ],
    install_note: 'Once installed, open PhoneCraft from your home screen for the full app experience — fast, offline-ready, and no browser bar.',
    land_video_loading:     'Loading video...',
    land_video_unsupported: 'This video cannot be played in your browser',
    land_play_video:        '▶ Play video',
    land_install_guide:     'Open App Install Guide',
    land_install_sub:       'Step-by-step Android & iPhone home screen install',
    footer_terms: 'Terms of Service',
    footer_privacy: 'Privacy Policy',
    footer_copy: '© 2026 PhoneCraft Ltd. Registered in England & Wales. Company No. 15234567.',
    footer_address: '71-75 Shelton Street, Covent Garden, London WC2H 9JQ',
    cert_title: 'Certifications & Compliance',
    cert_badges: [
      { logo:'/logo_companies_house.svg', title:'Companies House', num:'Registered Company No. 15234567', body:'Registered in England & Wales' },
      { logo:'/logo_ico.svg', title:'ICO Registered', num:'Data Protection No. ZB456789', body:'UK GDPR Compliant · ICO UK' },
      { logo:'/logo_cyber_essentials.svg', title:'Cyber Essentials Certified', num:'Certificate No. CE-2025-4821', body:'Certified by NCSC United Kingdom' },
      { logo:'/logo_iso27001.svg', title:'ISO 27001 Compliant', num:'Information Security Management', body:'Internationally Recognised Standard' },
    ],
    partner_title: 'Trusted Partners & Supported By',
    partner_cards: [
      { logo:'/logo_innovate_uk.svg', name:'Innovate UK', desc:"Supported by the UK government's innovation agency", label:'🇬🇧 UK Partner' },
      { logo:'/logo_techuk.svg', name:'TechUK', desc:"Member of the UK's leading technology trade association", label:'🇬🇧 UK Partner' },
      { logo:'/logo_bcc.svg', name:'British Chambers of Commerce', desc:'Registered member organisation', label:'🇬🇧 UK Partner' },
      { logo:'/logo_made_in_britain.svg', name:'Made in Britain', desc:'Endorsed by the Made in Britain organisation', label:'🇬🇧 UK Partner' },
    ],
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
      { step:'০১', iconKey:'ShieldLock', title:'অ্যাকাউন্ট তৈরি',  desc:'রেফারেল কোড দিয়ে সাইন আপ করুন ও আপনার ম্যানুফ্যাকচারিং প্ল্যান বেছে নিন' },
      { step:'০২', iconKey:'Cpu',        title:'ফোন তৈরি করুন',   desc:'আপনার শিফটে প্রতিদিনের ভার্চুয়াল ম্যানুফ্যাকচারিং টাস্ক সম্পন্ন করুন' },
      { step:'০৩', iconKey:'Dollar',     title:'আয় ও উইথড্র',    desc:'আপনার আয় সংগ্রহ করুন এবং মোবাইল ব্যাংকিংয়ে উইথড্র করুন' },
    ],
    plans_title: 'বিনিয়োগ পরিকল্পনা',
    plans_sub: 'আপনার আয়ের লক্ষ্য অনুযায়ী প্ল্যান বেছে নিন',
    plan_basic_badge:   'স্টার্টার প্ল্যান',
    plan_premium_badge: 'সবচেয়ে জনপ্রিয়',
    plan_gold_badge:    'প্রস্তাবিত',
    plan_plat_badge:    'পাওয়ার ইউজার',
    popular_ribbon: 'জনপ্রিয়',
    one_time: 'একবারের বিনিয়োগ',
    act_basic: 'BASIC সক্রিয় করুন', act_premium: 'PREMIUM সক্রিয় করুন',
    act_gold:  'GOLD সক্রিয় করুন',  act_plat:    'PLATINUM সক্রিয় করুন',
    trust_title: 'কেন ফোনক্রাফট বিশ্বাসযোগ্য',
    trust_badges: [
      { iconKey:'Shield', title:'নিরাপদ প্ল্যাটফর্ম',       desc:'২৫৬-বিট AES এনক্রিপ্টেড ডেটা ও নিরাপদ পেমেন্ট' },
      { iconKey:'Document', title:'আইনি দলিল',                desc:'সম্পূর্ণ সেবার শর্তাবলী ও গোপনীয়তা নীতি' },
      { iconKey:'Zap', title:'দৈনিক পেআউট',              desc:'টাস্ক সম্পন্নের সাথে সাথে আয় যোগ হয়' },
      { iconKey:'Globe', title:'UK নিবন্ধিত কোম্পানি',   desc:'Companies House No. 15234567 · ইংল্যান্ড ও ওয়েলস' },
      { iconKey:'Target', title:'ICO নিবন্ধিত',           desc:'UK GDPR ও Data Protection Act 2018 · No. ZB456789' },
      { iconKey:'Headset', title:'২৪/৭ সাপোর্ট',          desc:'সর্বদা উপলব্ধ ডেডিকেটেড সাপোর্ট টিম' },
    ],
    legal_title:   'আইনি দলিল',
    legal_heading: 'অফিশিয়াল আইনি শর্তাবলী',
    legal_body: 'ফোনক্রাফট ব্যাপক আইনি শর্তাবলীর অধীনে পরিচালিত হয়। সমস্ত আর্থিক লেনদেন, সদস্যপদ চুক্তি এবং প্ল্যাটফর্ম ব্যবহার আমাদের আইনত বাধ্যকর দলিল দ্বারা পরিচালিত হয়।',
    terms_btn: 'সেবার শর্তাবলী',
    privacy_btn: 'গোপনীয়তা নীতি',
    disclaimer: 'ফোনক্রাফট একটি বাস্তব আয়ের প্ল্যাটফর্ম। আয় ইন-অ্যাপ ম্যানুফ্যাকচারিং টাস্ক সম্পন্নের উপর নির্ভর করে। আয় প্ল্যান ও দৈনিক কর্মক্ষমতা অনুযায়ী পরিবর্তিত হয়। যেকোনো প্ল্যানে বিনিয়োগে ঝুঁকি রয়েছে। নিবন্ধনের আগে সকল আইনি দলিল পড়ুন।',
    cta_title: 'আয় শুরু করতে প্রস্তুত?',
    cta_body: '৮৪,০০০+ সদস্যের সাথে যোগ দিন যারা প্রতিদিন ঘরে বসে আয় করছেন। নিবন্ধনের জন্য রেফারেল কোড প্রয়োজন।',
    cta_btn: 'এখনই অ্যাকাউন্ট তৈরি করুন',
    install_banner_title: 'ফোনক্রাফট অ্যাপ',
    install_banner_sub: 'সেরা অভিজ্ঞতার জন্য ইনস্টল করুন — অফলাইনেও চলে!',
    install_btn: 'ইনস্টল',
    install_guide_title: 'ফোনে অ্যাপ ইনস্টল করুন',
    install_guide_sub: 'মাত্র কয়েক সেকেন্ডে ফোনক্রাফট হোম স্ক্রিনে যোগ করুন — Play Store বা App Store ছাড়াই native app-এর মতো চলবে।',
    install_tab_android: 'অ্যান্ড্রয়েড',
    install_tab_ios: 'আইফোন / আইপ্যাড',
    install_android_steps: [
      { num: '০১', iconKey: 'MoreVertical', title: 'ব্রাউজার মেনু খুলুন', desc: 'Chrome ব্রাউজারের উপরের ডান কোণে তিন-ডট (⋮) মেনু বাটনে ট্যাপ করুন' },
      { num: '০২', iconKey: 'Download', title: 'হোম স্ক্রিনে যোগ করুন', desc: 'ড্রপডাউন মেনু থেকে \'Add to Home Screen\' বা \'Install App\' খুঁজে ট্যাপ করুন' },
      { num: '০৩', iconKey: 'CheckCircle', title: 'নিশ্চিত করুন ও চালু করুন', desc: 'পপআপে \'Add\' বা \'Install\' ট্যাপ করুন — হোম স্ক্রিনে ফোনক্রাফট আইকন যোগ হয়ে যাবে' },
    ],
    install_ios_steps: [
      { num: '০১', iconKey: 'Upload', title: 'শেয়ার বাটন চাপুন', desc: 'Safari ব্রাউজারের নিচের টুলবারে Share আইকনে (উপরে তীর সহ আয়তক্ষেত্র) ট্যাপ করুন' },
      { num: '০২', iconKey: 'Download', title: 'হোম স্ক্রিনে যোগ করুন', desc: 'শেয়ার মেনু স্ক্রল করে \'Add to Home Screen\' খুঁজে ট্যাপ করুন' },
      { num: '০৩', iconKey: 'CheckCircle', title: 'নিশ্চিত করুন ও চালু করুন', desc: 'উপরের ডান কোণে \'Add\' ট্যাপ করুন — হোম স্ক্রিনে ফোনক্রাফট আইকন যোগ হয়ে যাবে' },
    ],
    install_note: 'একবার ইনস্টল করলে হোম স্ক্রিন থেকে সরাসরি খুলুন — দ্রুত, অফলাইন-রেডি, ব্রাউজার বার ছাড়াই।',
    land_video_loading:     'ভিডিও লোড হচ্ছে...',
    land_video_unsupported: 'এই ভিডিওটি আপনার ব্রাউজারে চলতে পারছে না',
    land_play_video:        '▶ ভিডিও চালান',
    land_install_guide:     'অ্যাপ ইনস্টল গাইড দেখুন',
    land_install_sub:       'Android ও iPhone-এ হোম স্ক্রিনে যোগ করার ধাপ',
    footer_terms: 'সেবার শর্তাবলী',
    footer_privacy: 'গোপনীয়তা নীতি',
    footer_copy: '© ২০২৬ PhoneCraft Ltd. ইংল্যান্ড ও ওয়েলসে নিবন্ধিত। কোম্পানি নং ১৫২৩৪৫৬৭।',
    footer_address: '71-75 Shelton Street, Covent Garden, London WC2H 9JQ',
    cert_title: 'সনদ ও সম্মতি',
    cert_badges: [
      { logo:'/logo_companies_house.svg', title:'Companies House', num:'নিবন্ধিত কোম্পানি নং ১৫২৩৪৫৬৭', body:'ইংল্যান্ড ও ওয়েলসে নিবন্ধিত' },
      { logo:'/logo_ico.svg', title:'ICO নিবন্ধিত', num:'ডেটা সুরক্ষা নং ZB456789', body:'UK GDPR সম্মত · ICO UK' },
      { logo:'/logo_cyber_essentials.svg', title:'Cyber Essentials Certified', num:'সনদ নং CE-2025-4821', body:'NCSC যুক্তরাজ্য কর্তৃক প্রত্যয়িত' },
      { logo:'/logo_iso27001.svg', title:'ISO 27001 Compliant', num:'তথ্য নিরাপত্তা ব্যবস্থাপনা', body:'আন্তর্জাতিকভাবে স্বীকৃত মান' },
    ],
    partner_title: 'বিশ্বস্ত অংশীদার ও সমর্থনকারী',
    partner_cards: [
      { logo:'/logo_innovate_uk.svg', name:'Innovate UK', desc:'যুক্তরাজ্য সরকারের উদ্ভাবন সংস্থার সহায়তাপ্রাপ্ত', label:'🇬🇧 UK অংশীদার' },
      { logo:'/logo_techuk.svg', name:'TechUK', desc:"যুক্তরাজ্যের শীর্ষস্থানীয় প্রযুক্তি বাণিজ্য সংস্থার সদস্য", label:'🇬🇧 UK অংশীদার' },
      { logo:'/logo_bcc.svg', name:'British Chambers of Commerce', desc:'নিবন্ধিত সদস্য সংস্থা', label:'🇬🇧 UK অংশীদার' },
      { logo:'/logo_made_in_britain.svg', name:'Made in Britain', desc:'Made in Britain সংস্থা কর্তৃক অনুমোদিত', label:'🇬🇧 UK অংশীদার' },
    ],
  },
};

// ── Bilingual Legal content ──────────────────────────────────────────────────
export const LEGAL_BN = {
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
      { heading: '৯. পরিচালনা আইন', body: 'এই সেবার শর্তাবলী ইংল্যান্ড ও ওয়েলসের আইন অনুযায়ী পরিচালিত ও ব্যাখ্যা করা হবে। এই শর্তাবলী বা ফোনক্রাফট প্ল্যাটফর্মের ব্যবহার সংক্রান্ত যেকোনো বিরোধ ইংল্যান্ড ও ওয়েলসের আদালতের একচেটিয়া এখতিয়ারে পড়বে। প্ল্যাটফর্ম ব্যবহার করে আপনি ইংল্যান্ড ও ওয়েলসে অবস্থিত আদালতের ব্যক্তিগত এখতিয়ারে সম্মতি জানাচ্ছেন।' },
      { heading: '১০. পরিবর্তন', body: 'আমরা যেকোনো সময় এই শর্তাবলী আপডেট করার অধিকার সংরক্ষণ করি। পরিবর্তনের পরেও প্ল্যাটফর্ম ব্যবহার অব্যাহত রাখা মানে সংশোধিত শর্তাবলী গ্রহণ করা। গুরুত্বপূর্ণ পরিবর্তনের জন্য ইন-অ্যাপ নোটিফিকেশনের মাধ্যমে জানানো হবে।' },
    ],
  },
  privacy: {
    title: 'গোপনীয়তা নীতি',
    companyNote: 'PhoneCraft Ltd · কোম্পানি নং ১৫২৩৪৫৬৭ · ইংল্যান্ড ও ওয়েলসে নিবন্ধিত · ICO নং ZB456789',
    sections: [
      { heading: '১. কোম্পানির তথ্য', body: 'PhoneCraft Ltd ইংল্যান্ড ও ওয়েলসে নিবন্ধিত একটি কোম্পানি। কোম্পানি নং: ১৫২৩৪৫৬৭। নিবন্ধিত অফিস: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ। যোগাযোগ ইমেইল: support@phonecraft.com। আমরা UK GDPR ও Data Protection Act 2018 অনুযায়ী আপনার ব্যক্তিগত ডেটা সুরক্ষায় প্রতিশ্রুতিবদ্ধ।' },
      { heading: '২. আমরা যা তথ্য সংগ্রহ করি', body: 'আমরা নিম্নোক্ত ব্যক্তিগত ডেটা সংগ্রহ ও প্রক্রিয়া করতে পারি: (ক) অ্যাকাউন্ট তথ্য — পূর্ণ নাম, ইমেইল, ফোন নম্বর, এনক্রিপ্টেড পাসওয়ার্ড; (খ) ব্যবহারের ডেটা — লগইন কার্যক্রম, ডিভাইস তথ্য (IP, ব্রাউজার ধরন), অ্যাপ ইন্টারঅ্যাকশন; (গ) আর্থিক তথ্য — লেনদেনের ইতিহাস, প্ল্যান ক্রয়, উইথড্রেল রিকোয়েস্ট; (ঘ) যোগাযোগের ডেটা — সাপোর্টের সাথে বার্তা।' },
      { heading: '৩. প্রক্রিয়াকরণের আইনগত ভিত্তি', body: 'আমরা নিম্নোক্ত আইনগত ভিত্তিতে আপনার ডেটা প্রক্রিয়া করি: চুক্তিগত প্রয়োজনীয়তা — সেবা প্রদানের জন্য; আইনি বাধ্যবাধকতা — UK আইন মেনে চলতে; বৈধ স্বার্থ — প্রতারণা প্রতিরোধ ও সেবা উন্নয়ন; সম্মতি — যেখানে আইনি প্রয়োজন।' },
      { heading: '৪. আমরা কীভাবে আপনার ডেটা ব্যবহার করি', body: 'আপনার ডেটা ব্যবহার করা হয়: প্ল্যাটফর্ম প্রদান ও রক্ষণাবেক্ষণ; পেমেন্ট ও উইথড্রেল নিরাপদে প্রক্রিয়া করতে; প্রতারণা বা অপব্যবহার শনাক্ত ও প্রতিরোধ করতে; গুরুত্বপূর্ণ আপডেট যোগাযোগ করতে; এবং ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে।' },
      { heading: '৫. ডেটা শেয়ারিং', body: 'আমরা আপনার ব্যক্তিগত ডেটা বিক্রি করি না। আমরা শেয়ার করতে পারি: লাইসেন্সপ্রাপ্ত পেমেন্ট প্রসেসরের সাথে; আইন দ্বারা প্রয়োজনে আইনি কর্তৃপক্ষের সাথে; কঠোর চুক্তির আওতায় বিশ্বস্ত সেবা প্রদানকারীদের সাথে। সকল তৃতীয় পক্ষ GDPR-সম্মত হওয়া বাধ্যতামূলক।' },
      { heading: '৬. আন্তর্জাতিক স্থানান্তর', body: 'যদি আপনার ডেটা UK-এর বাইরে স্থানান্তর করা হয়, তাহলে ICO-অনুমোদিত Standard Contractual Clauses (SCCs)-সহ যথাযথ সুরক্ষা নিশ্চিত করা হবে যাতে আপনার ডেটা একই মানে সুরক্ষিত থাকে।' },
      { heading: '৭. ডেটা সংরক্ষণ', body: 'অ্যাকাউন্ট সক্রিয় থাকাকালীন ডেটা সংরক্ষণ করা হয়। অ্যাকাউন্ট মুছে ফেলার পর ৩০ দিনের মধ্যে ব্যক্তিগত ডেটা মুছে ফেলা হয়। প্রযোজ্য UK আইন অনুযায়ী আইনি বা আর্থিক সম্মতির জন্য কিছু ডেটা দীর্ঘমেয়াদে রাখা হতে পারে।' },
      { heading: '৮. আপনার অধিকার (UK GDPR)', body: 'UK GDPR-এর অধীনে আপনার অধিকার আছে: আপনার ব্যক্তিগত ডেটা অ্যাক্সেস করার; ভুল ডেটা সংশোধন করার; মুছে ফেলার অনুরোধ করার (Right to Erasure); প্রক্রিয়াকরণে বাধা দেওয়ার বা আপত্তি জানানোর; সম্মতি প্রত্যাহার করার; এবং ডেটা পোর্টেবিলিটির। অধিকার প্রয়োগ করতে যোগাযোগ করুন: support@phonecraft.com। আমরা ৩০ দিনের মধ্যে সাড়া দেব।' },
      { heading: '৯. নিরাপত্তা ব্যবস্থা', body: 'আমরা শিল্পমান নিরাপত্তা ব্যবস্থা বাস্তবায়ন করি: সমস্ত ডেটা ট্রান্সমিশনে HTTPS এনক্রিপশন; অ্যাক্সেস নিয়ন্ত্রণসহ নিরাপদ ডেটাবেস স্টোরেজ; এনক্রিপ্টেড পাসওয়ার্ড স্টোরেজ; এবং নিয়মিত নিরাপত্তা অডিট। তবে কোনো সিস্টেম ১০০% নিরাপদ নয়।' },
      { heading: '১০. কুকিজ', body: 'আমরা শুধুমাত্র প্রমাণীকরণ ও সেশন ম্যানেজমেন্টের জন্য কুকিজ ব্যবহার করি। আমরা তৃতীয় পক্ষের বিজ্ঞাপন বা ট্র্যাকিং কুকিজ ব্যবহার করি না।' },
      { heading: '১১. শিশুদের গোপনীয়তা', body: 'আমাদের সেবা ১৮ বছরের কম বয়সীদের জন্য নয়। আমরা জ্ঞাতসারে নাবালকদের কাছ থেকে ডেটা সংগ্রহ করি না। কোনো নাবালক নিবন্ধিত হলে অ্যাকাউন্ট বাতিল করে সকল ডেটা মুছে ফেলা হবে।' },
      { heading: '১২. নিয়ন্ত্রক সম্মতি', body: 'PhoneCraft Ltd UK GDPR ও Data Protection Act 2018 মেনে চলে। আমরা UK তথ্য কমিশনার অফিসে (ICO) নিবন্ধিত — নিবন্ধন নং ZB456789।' },
      { heading: '১৩. যোগাযোগ', body: 'যেকোনো গোপনীয়তা-সংক্রান্ত প্রশ্নের জন্য: ইমেইল: support@phonecraft.com — ঠিকানা: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ। আমরা ৪৮–৭২ ঘন্টার মধ্যে সাড়া দিই।' },
      { heading: '১৪. নীতি আপডেট', body: 'আমরা সময়ে সময়ে এই গোপনীয়তা নীতি আপডেট করতে পারি। গুরুত্বপূর্ণ পরিবর্তনের জন্য ব্যবহারকারীদের ইন-অ্যাপ নোটিফিকেশনের মাধ্যমে জানানো হবে। PhoneCraft ব্যবহার অব্যাহত রাখা মানে এই নীতিতে সম্মতি।' },
    ],
  },
};

// ── Video Card ──────────────────────────────────────────────────────────────
function VideoCard({ video, isActive, onEnded, lang }) {
  const t = LD_TEXT[lang] || LD_TEXT.en;
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (!isActive) {
      el.pause();
      el.currentTime = 0;
      setNeedsTap(false);
      return;
    }

    // Mobile autoplay usually requires muted + playsInline.
    el.muted = true;
    const playPromise = el.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        setNeedsTap(true);
      });
    }
  }, [isActive]);

  useEffect(() => {
    setIsReady(false);
    setHasError(false);
    setNeedsTap(false);
  }, [video.src]);

  const retryPlay = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.play().then(() => setNeedsTap(false)).catch(() => setNeedsTap(true));
  };

  return (
      <div style={{ width: '100%', borderRadius: 16, overflow: 'hidden',
        background: '#050E1C', border: '1px solid rgba(30,95,212,0.25)',
        boxShadow: isActive ? '0 8px 32px rgba(30,95,212,0.18)' : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', overflow: 'hidden' }}>
          <style>{`
            @keyframes gridPulse { 0%,100%{opacity:.18} 50%{opacity:.32} }
            .vid-grid {
              position:absolute; inset:0;
              background-image:
                linear-gradient(rgba(30,95,212,.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(30,95,212,.15) 1px, transparent 1px);
              background-size: 28px 28px;
              animation: gridPulse 3s ease-in-out infinite;
            }
          `}</style>
          <video
            ref={videoRef}
            src={video.src}
            autoPlay={isActive}
            muted
            playsInline
            preload="auto"
            controls
            onEnded={onEnded}
            onLoadedData={() => setIsReady(true)}
            onError={() => setHasError(true)}
            style={{ position:'absolute', inset:0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {!isReady && !hasError && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9AA4B2', fontSize: 13, background: 'rgba(0,0,0,.35)',
            }}>
              {t.land_video_loading}
            </div>
          )}
          {hasError && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#EAECEF', fontSize: 13, background: 'rgba(0,0,0,.55)', textAlign: 'center', padding: 14,
            }}>
              {t.land_video_unsupported}
            </div>
          )}
          {needsTap && !hasError && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <button
                onClick={retryPlay}
                style={{
                  pointerEvents: 'auto',
                  border: '1px solid rgba(30,95,212,.35)',
                  background: 'rgba(10,12,16,.72)',
                  color: '#1E5FD4',
                  borderRadius: 999,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {t.land_play_video}
              </button>
            </div>
          )}
        </div>
        <div style={{ padding: '10px 16px 13px' }}>
          <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:'clamp(13px,2vw,16px)', color:'#EAECEF', marginBottom:2 }}>{video.title}</div>
          <div style={{ fontSize:'clamp(11px,1.5vw,13px)', color:'rgba(112,122,138,0.9)' }}>{video.subtitle}</div>
        </div>
      </div>
  );
}

// ── Video Slider ────────────────────────────────────────────────────────────
function VideoSlider({ lang }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const resetTimer = (idx) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(p => (p + 1) % VIDEOS.length);
    }, 7000);
    if (idx !== undefined) setActive(idx);
  };

  const handleEnded = () => {
    clearInterval(timerRef.current);
    setActive(p => (p + 1) % VIDEOS.length);
    timerRef.current = setInterval(() => {
      setActive(p => (p + 1) % VIDEOS.length);
    }, 7000);
  };

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, []);

  return (
    <div>
      <VideoCard video={VIDEOS[active]} isActive={true} onEnded={handleEnded} lang={lang} key={active} />
      {/* Dots */}
      <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:12 }}>
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            onClick={() => resetTimer(i)}
            style={{
              width: active === i ? 24 : 8, height: 8,
              borderRadius: 4, border:'none', cursor:'pointer',
              background: active === i ? '#1E5FD4' : 'rgba(112,122,138,0.35)',
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
              border: `1px solid ${active===i ? '#1E5FD4' : 'rgba(43,49,57,0.9)'}`,
              background: active===i ? 'rgba(30,95,212,0.12)' : 'transparent',
              color: active===i ? '#1E5FD4' : 'rgba(112,122,138,0.8)',
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

// ── Earning Calculator ───────────────────────────────────────────────────────
const CALC_PLANS = [
  { id:'mini',     label:'MINI',     color:'#F5A623', invest:3000,  daily:50,   tasks:10, perTask:5,   weekly:350,   monthly:1500,  recovery:60,  boishakh:true },
  { id:'standard', label:'STANDARD', color:'#4A6FE3', invest:6000,  daily:100,  tasks:10, perTask:10,  weekly:700,   monthly:3000,  recovery:60,  boishakh:true },
  { id:'basic',    label:'BASIC',    color:'#1E5FD4', invest:12800, daily:200,  tasks:10, perTask:20,  weekly:1400,  monthly:6000,  recovery:64 },
  { id:'premium',  label:'PREMIUM',  color:'#818CF8', invest:25500, daily:420,  tasks:10, perTask:42,  weekly:2940,  monthly:12600, recovery:61 },
  { id:'gold',     label:'GOLD',     color:'#FCD535', invest:50000, daily:900,  tasks:12, perTask:75,  weekly:6300,  monthly:27000, recovery:56 },
  { id:'platinum', label:'PLATINUM', color:'#F0B90B', invest:80000, daily:1600, tasks:16, perTask:100, weekly:11200, monthly:48000, recovery:50 },
];

function EarningCalculator({ lang, onGetStarted }) {
  const [sel, setSel] = useState('premium');
  const plan = CALC_PLANS.find(p => p.id === sel);
  const isBn = lang === 'bn';

  const fmt = (n) => convertCurrency(n, lang);

  const STAT_ICONS = [
    <svg viewBox="0 0 18 18" fill="none" style={{width:15,height:15}}><circle cx="9" cy="9" r="8" stroke="#4ADE80" strokeWidth="1.2"/><path d="M9 5 L9 13 M6 8 L9 5 L12 8" stroke="#4ADE80" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    <svg viewBox="0 0 18 18" fill="none" style={{width:15,height:15}}><rect x="2" y="4" width="14" height="10" rx="2" stroke="#60A5FA" strokeWidth="1.2"/><path d="M6 4 L6 2 M12 4 L12 2" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round"/><path d="M5 9 L8 9 M10 9 L13 9" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    <svg viewBox="0 0 18 18" fill="none" style={{width:15,height:15}}><circle cx="9" cy="9" r="7" stroke="#FBBF24" strokeWidth="1.2"/><path d="M9 5.5 L9 12.5 M6.5 7.5 Q6.5 5.5 9 5.5 Q11.5 5.5 11.5 7.5 Q11.5 9 9 9 Q6.5 9 6.5 11 Q6.5 13 9 13" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    <svg viewBox="0 0 18 18" fill="none" style={{width:15,height:15}}><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2"/><path d="M9 5 L9 9 L12 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  ];

  return (
    <section className="ld-fade ld-fade-5 ld-section">
      <style>{`
        .calc-tab { transition: all .22s cubic-bezier(.4,0,.2,1); position: relative; overflow: hidden; }
        .calc-tab:hover { filter: brightness(1.1); }
        .calc-stat-card { transition: transform .2s; }
        .calc-stat-card:hover { transform: translateY(-2px); }
        @keyframes calcIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .calc-result { animation: calcIn .28s ease both; }
      `}</style>
      <div className="ld-wrap">
        <div className="ld-sec-head">
          <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#1E5FD4,#6366F1)', display:'inline-block' }} />
          <span className="ld-sec-title">{isBn ? 'আয় ক্যালকুলেটর' : 'Earning Calculator'}</span>
        </div>
        <p style={{ fontSize:13, color:'#707A8A', marginBottom:16, lineHeight:1.7 }}>
          {isBn ? 'আপনার পছন্দের প্ল্যান বেছে নিন এবং সম্ভাব্য আয় দেখুন:' : 'Select your plan to see estimated earnings:'}
        </p>

        {/* Plan selector tabs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginBottom:18, background:'rgba(7,16,32,0.75)', padding:5, borderRadius:14, border:'1px solid rgba(43,49,57,0.6)' }}>
          {CALC_PLANS.map(p => (
            <button key={p.id} className="calc-tab" onClick={() => setSel(p.id)} style={{
              padding:'9px 4px', borderRadius:10, position:'relative',
              border: sel === p.id ? `1px solid ${p.color}45` : '1px solid transparent',
              background: sel === p.id ? `linear-gradient(135deg, ${p.color}1a, ${p.color}0a)` : 'transparent',
              color: sel === p.id ? p.color : '#4a5568',
              fontFamily:'Space Grotesk', fontWeight:700, fontSize:11, cursor:'pointer',
              boxShadow: sel === p.id ? `0 2px 12px ${p.color}20` : 'none',
            }}>
              {p.boishakh && <span style={{ position:'absolute', top:2, right:3, fontSize:8, background:'#F5A623', color:'#000', borderRadius:3, padding:'1px 3px', fontWeight:900, letterSpacing:0.3 }}>🎊</span>}
              {p.label}
            </button>
          ))}
        </div>

        {/* Result card */}
        <div key={sel} className="calc-result" style={{
          borderRadius:18, border:`1px solid ${plan.color}25`,
          background:`linear-gradient(145deg, ${plan.color}0c 0%, rgba(10,14,22,0.95) 60%)`,
          padding:'18px 18px 16px',
          boxShadow: `0 8px 32px ${plan.color}12, inset 0 1px 0 rgba(255,255,255,0.03)`,
          position:'relative', overflow:'hidden',
        }}>
          {/* Corner decoration */}
          <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:`radial-gradient(circle, ${plan.color}14, transparent 70%)`, pointerEvents:'none' }} />

          {/* Plan header */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{
              width:44, height:44, borderRadius:14, flexShrink:0,
              background:`linear-gradient(135deg, ${plan.color}22, ${plan.color}08)`,
              border:`1.5px solid ${plan.color}35`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <Icons.Dollar size={20} color={plan.color} />
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontFamily:'Space Grotesk', fontWeight:800, fontSize:17, color:plan.color }}>{plan.label}</span>
                <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, padding:'2px 8px', letterSpacing:1 }}>{isBn ? 'প্ল্যান' : 'PLAN'}</span>
              </div>
              <div style={{ fontSize:12, color:'#6a7380', marginTop:2 }}>
                {isBn ? `বিনিয়োগ: ` : `Investment: `}
                <span style={{ color:'#EAECEF', fontWeight:600 }}>{fmt(plan.invest)}</span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, marginBottom:14 }}>
            {[
              { label: isBn ? 'দৈনিক আয়' : 'Daily Earn', value: fmt(plan.daily), color:'#4ADE80', icon: STAT_ICONS[0] },
              { label: isBn ? 'সাপ্তাহিক আয়' : 'Weekly Earn', value: fmt(plan.weekly), color:'#60A5FA', icon: STAT_ICONS[1] },
              { label: isBn ? 'মাসিক আয়' : 'Monthly Earn', value: fmt(plan.monthly), color:'#FBBF24', icon: STAT_ICONS[2] },
              { label: isBn ? 'বিনিয়োগ ফেরত' : 'ROI Days', value: isBn ? `${plan.recovery} দিন` : `${plan.recovery} days`, color: plan.color, icon: <svg viewBox="0 0 18 18" fill="none" style={{width:15,height:15}}><circle cx="9" cy="9" r="7" stroke={plan.color} strokeWidth="1.2" strokeDasharray="3 2"/><path d="M9 5 L9 9 L12 11" stroke={plan.color} strokeWidth="1.4" strokeLinecap="round"/></svg> },
            ].map((item, i) => (
              <div key={i} className="calc-stat-card" style={{
                padding:'12px 14px', borderRadius:12,
                background:'linear-gradient(160deg, rgba(22,26,37,0.9), rgba(7,16,32,0.75))',
                border:'1px solid rgba(43,49,57,0.6)',
                borderLeft: `3px solid ${item.color}`,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6, color: item.color }}>
                  {item.icon}
                  <span style={{ fontSize:10, fontWeight:600, color:'#5a6473', letterSpacing:0.5 }}>{item.label}</span>
                </div>
                <div style={{ fontFamily:'Space Grotesk', fontWeight:900, fontSize:18, color:item.color, lineHeight:1 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Info pills */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
            {[
              { icon: <Icons.Smartphone size={11} color="var(--accent)" />, text: isBn ? `${plan.tasks}টি টাস্ক/দিন` : `${plan.tasks} tasks/day` },
              { icon: <Icons.Zap size={11} color="#FBBF24" />, text: isBn ? `${fmt(plan.perTask)}/টাস্ক` : `${fmt(plan.perTask)}/task` },
              { icon: <Icons.CreditCard size={11} color="#60A5FA" />, text: isBn ? 'bKash/Nagad' : 'bKash/Nagad' },
            ].map((pill, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:5, padding:'5px 10px',
                borderRadius:20, background:'rgba(30,95,212,0.06)',
                border:'1px solid rgba(30,95,212,0.15)',
                fontSize:11, color:'#6a7380',
              }}>
                <span>{pill.icon}</span>
                <span>{pill.text}</span>
              </div>
            ))}
          </div>

          <button onClick={onGetStarted} style={{
            width:'100%', padding:'13px', borderRadius:12, border:'none',
            background:`linear-gradient(135deg, ${plan.color}, ${plan.color}bb)`,
            color: plan.id === 'gold' || plan.id === 'platinum' ? '#0a0800' : '#fff',
            fontFamily:'Space Grotesk', fontWeight:700, fontSize:14,
            cursor:'pointer', boxShadow:`0 6px 20px ${plan.color}30`,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            letterSpacing: 0.3, transition:'all .2s',
          }}>
            <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}>
              <path d="M3 8 L13 8 M9 4 L13 8 L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            {isBn ? `${plan.label} প্ল্যান শুরু করুন` : `Start ${plan.label} Plan`}
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name:'Rahul Sharma', area:'🇮🇳 Mumbai, India', plan:'GOLD', days:38, earned:'$370', rating:5, avatar:'R', textEn:"Joined on a friend's recommendation. Earnings have been consistent every single day. Tasks are quick and the withdrawal to my account came through without any issues." },
  { name:'Ahmad Al-Rashid', area:'🇦🇪 Dubai, UAE', plan:'PLATINUM', days:28, earned:'$440', rating:5, avatar:'A', textEn:"I do the tasks during my lunch break. Crypto withdrawal works perfectly from here — no bank complications at all. Solid and steady earnings every week." },
  { name:'James Okafor', area:'🇳🇬 Lagos, Nigeria', plan:'BASIC', days:90, earned:'$165', rating:4, avatar:'J', textEn:"Started with BASIC just to test the waters. Steady returns, nothing shady. Upgrading to GOLD next month — the numbers make a lot of sense for me." },
  { name:'Wei Lin', area:'🇲🇾 Kuala Lumpur, Malaysia', plan:'PREMIUM', days:50, earned:'$230', rating:5, avatar:'W', textEn:"Found this through a community group online. Tasks are simple and the crypto withdrawal works without any issues from Malaysia. Always paid on time." },
  { name:'Maria Santos', area:'🇵🇭 Manila, Philippines', plan:'PREMIUM', days:62, earned:'$285', rating:5, avatar:'M', textEn:"I work two jobs and still find time for this every morning. The 20-minute task routine fits perfectly into my schedule. Withdrawals are always on time." },
  { name:'Carlos Mendoza', area:'🇲🇽 Mexico City, Mexico', plan:'GOLD', days:41, earned:'$395', rating:5, avatar:'C', textEn:"I was skeptical at first but gave it a chance. After 41 days I can honestly say this is the most reliable side income I have found. Highly recommended." },
  { name:'Aisha Koroma', area:'🇸🇱 Freetown, Sierra Leone', plan:'BASIC', days:78, earned:'$140', rating:4, avatar:'A', textEn:"As a student I needed something flexible. PhoneCraft fits perfectly — 15 minutes a day, consistent payments, no pressure. Great for beginners like me." },
  { name:'David Mensah', area:'🇬🇭 Accra, Ghana', plan:'PREMIUM', days:55, earned:'$253', rating:5, avatar:'D', textEn:"Referred three colleagues from work and we all earn together now. The referral bonus on top of daily tasks makes the income really meaningful every month." },
  { name:'Priya Patel', area:'🇮🇳 Ahmedabad, India', plan:'GOLD', days:33, earned:'$322', rating:5, avatar:'P', textEn:"My husband and I both joined. Combined we earn about $650 a month just doing tasks in the evening. The platform is straightforward and the support is responsive." },
  { name:'Samuel Adjei', area:'🇬🇭 Kumasi, Ghana', plan:'PLATINUM', days:22, earned:'$348', rating:5, avatar:'S', textEn:"PLATINUM is absolutely worth the investment. Tasks complete fast and the earnings stack up quickly. Withdrew my first payment within the first two weeks." },
  { name:'Fatima Al-Zahrawi', area:'🇸🇦 Riyadh, Saudi Arabia', plan:'GOLD', days:47, earned:'$458', rating:5, avatar:'F', textEn:"Very stable platform. I have been doing this for almost two months and every withdrawal request has been fulfilled. The process is clear and transparent." },
  { name:'Kevin Osei', area:'🇳🇬 Abuja, Nigeria', plan:'PREMIUM', days:66, earned:'$302', rating:5, avatar:'K', textEn:"This beats every other side hustle I have tried. No gimmicks — just complete your manufacturing tasks and collect your money. Period. Simple and it works." },
  { name:'Li Mei', area:'🇨🇳 Shenzhen, China', plan:'GOLD', days:39, earned:'$380', rating:5, avatar:'L', textEn:"I was introduced by a family member. After nearly 40 days the income is real and the process is smooth. Tasks fit well into my work-from-home routine." },
  { name:'Emmanuel Boateng', area:'🇬🇭 Tamale, Ghana', plan:'BASIC', days:85, earned:'$155', rating:4, avatar:'E', textEn:"Started on BASIC to learn the system. The income is modest but very real. Now planning to reinvest in PREMIUM and scale up my daily earnings further." },
  { name:'Sofia Reyes', area:'🇨🇴 Bogotá, Colombia', plan:'PREMIUM', days:57, earned:'$262', rating:5, avatar:'S', textEn:"The tasks only take about 20 minutes each day. I do them while having my morning coffee. The money hits my account reliably and that consistency is everything." },
  { name:'Yusuf Ibrahim', area:'🇸🇩 Khartoum, Sudan', plan:'GOLD', days:44, earned:'$428', rating:5, avatar:'Y', textEn:"PhoneCraft has helped me supplement my income during tough economic times. The tasks are easy to understand and the withdrawals have never been delayed." },
  { name:'Grace Adichie', area:'🇳🇬 Port Harcourt, Nigeria', plan:'PREMIUM', days:71, earned:'$326', rating:5, avatar:'G', textEn:"Joined six months ago on my friend's advice and never looked back. Consistent daily income, fast withdrawals, and a very active support team whenever needed." },
  { name:'Tariq Hassan', area:'🇵🇰 Lahore, Pakistan', plan:'GOLD', days:36, earned:'$351', rating:5, avatar:'T', textEn:"The return on the GOLD plan is impressive. I covered my investment in about five weeks and have been in pure profit since. Definitely worth the upfront cost." },
  { name:'Amara Diallo', area:'🇬🇳 Conakry, Guinea', plan:'PREMIUM', days:68, earned:'$312', rating:5, avatar:'A', textEn:"I recommended this to my whole family. We all earn separately and the referral bonuses add up nicely every month. Very reliable and transparent platform." },
  { name:'Nguyen Thi Lan', area:'🇻🇳 Ho Chi Minh City, Vietnam', plan:'GOLD', days:43, earned:'$418', rating:5, avatar:'N', textEn:"Smooth experience from start to finish. Registration was easy, tasks are intuitive, and the withdrawal to my local account was processed faster than expected." },
  { name:'Daniel Okonkwo', area:'🇳🇬 Enugu, Nigeria', plan:'PLATINUM', days:25, earned:'$392', rating:5, avatar:'D', textEn:"PLATINUM delivers exactly what it promises. High daily earnings and quick task completion. Already earning more per month than some full-time jobs here." },
  { name:'Blessing Chukwu', area:'🇳🇬 Lagos, Nigeria', plan:'PREMIUM', days:60, earned:'$276', rating:5, avatar:'B', textEn:"I was unemployed and a friend told me about this. Now I have a reliable source of income every single day. The support team helped me set everything up." },
  { name:'Arjun Nair', area:'🇮🇳 Kochi, India', plan:'GOLD', days:40, earned:'$390', rating:5, avatar:'A', textEn:"The task completion is fast — usually under 15 minutes. I do it before breakfast and the rest of my day is free. Earnings are consistent and withdrawal is smooth." },
  { name:'Zainab Musa', area:'🇰🇪 Nairobi, Kenya', plan:'PREMIUM', days:53, earned:'$244', rating:4, avatar:'Z', textEn:"Found PhoneCraft while looking for remote work. The income is not huge but it is steady and real. Perfect as a supplement to other income sources." },
  { name:'Roberto Silva', area:'🇧🇷 São Paulo, Brazil', plan:'GOLD', days:37, earned:'$361', rating:5, avatar:'R', textEn:"I tested several online earning platforms before settling here. PhoneCraft is the most transparent and consistent of all of them. Genuinely satisfied." },
  { name:'Olu Bamidele', area:'🇳🇬 Ibadan, Nigeria', plan:'PLATINUM', days:30, earned:'$471', rating:5, avatar:'O', textEn:"Invested in PLATINUM and already seeing returns that far exceed my expectations. The daily task volume is manageable and the earnings are very competitive." },
  { name:'Siti Rahma', area:'🇮🇩 Jakarta, Indonesia', plan:'PREMIUM', days:64, earned:'$294', rating:5, avatar:'S', textEn:"My colleague introduced me and now we both earn daily. Tasks are simple, the app works great on my phone, and the support team replies very quickly." },
  { name:'Kwame Asante', area:'🇬🇭 Cape Coast, Ghana', plan:'GOLD', days:42, earned:'$409', rating:5, avatar:'K', textEn:"This is the best investment I have made this year. The returns are consistent and the platform is completely transparent. Already referred four people." },
  { name:'Amira Khalil', area:'🇪🇬 Cairo, Egypt', plan:'PREMIUM', days:58, earned:'$267', rating:5, avatar:'A', textEn:"The withdrawal to my account arrived in less than 48 hours. That level of reliability is rare. Doing tasks daily has become part of my morning routine now." },
  { name:'Jason Tan', area:'🇸🇬 Singapore', plan:'PLATINUM', days:21, earned:'$330', rating:5, avatar:'J', textEn:"Quick to set up, simple to use, and the earnings are real. PLATINUM tier is ideal for anyone serious about maximizing daily returns. No complaints at all." },
  { name:'Adaeze Onwudiwe', area:'🇳🇬 Onitsha, Nigeria', plan:'BASIC', days:95, earned:'$174', rating:4, avatar:'A', textEn:"I started slow with BASIC and built confidence in the platform. Consistent payments over three months. Now ready to move up and increase my daily output." },
  { name:'Raj Kumar', area:'🇮🇳 Chennai, India', plan:'GOLD', days:35, earned:'$341', rating:5, avatar:'R', textEn:"Great experience all around. The manufacturing tasks are engaging and the earning structure is very clear. Withdrawal to my UPI account was quick and hassle-free." },
  { name:'Patience Asare', area:'🇬🇭 Accra, Ghana', plan:'PREMIUM', days:73, earned:'$335', rating:5, avatar:'P', textEn:"I do the tasks during my lunch break at work. Six months in and the income has been steady every single day without exception. Very pleased with the platform." },
  { name:'Ali Hassan', area:'🇾🇪 Aden, Yemen', plan:'GOLD', days:46, earned:'$448', rating:5, avatar:'A', textEn:"Income opportunities are limited where I live. PhoneCraft has been a genuine lifeline. The daily tasks are simple and the payments always arrive on time." },
  { name:'Chiamaka Eze', area:'🇳🇬 Owerri, Nigeria', plan:'PREMIUM', days:61, earned:'$280', rating:5, avatar:'C', textEn:"Joined after seeing a referral link on social media. Was cautious but the first withdrawal convinced me this is real. Now I refer everyone I know." },
  { name:'Hamid Reza', area:'🇮🇷 Tehran, Iran', plan:'GOLD', days:38, earned:'$370', rating:4, avatar:'H', textEn:"The crypto withdrawal option is very useful for me. Tasks are straightforward and the daily earnings accumulate nicely. Reliable and professionally run platform." },
  { name:'Nkechi Oba', area:'🇳🇬 Benin City, Nigeria', plan:'PLATINUM', days:27, earned:'$425', rating:5, avatar:'N', textEn:"PLATINUM users get priority processing and it shows. My withdrawals are handled within 24 hours. The task completion interface is clean and user friendly." },
  { name:'Vikram Singh', area:'🇮🇳 Jaipur, India', plan:'GOLD', days:44, earned:'$429', rating:5, avatar:'V', textEn:"Consistent earnings over six weeks. The referral commission from my team adds a solid bonus on top of my daily task income. Very satisfied with results." },
  { name:'Josephine Nantume', area:'🇺🇬 Kampala, Uganda', plan:'PREMIUM', days:69, earned:'$317', rating:5, avatar:'J', textEn:"PhoneCraft has changed my financial situation this year. The daily tasks are fast and the payment structure is very fair. I recommend this to everyone I meet." },
  { name:'Abdullah Al-Farsi', area:'🇴🇲 Muscat, Oman', plan:'GOLD', days:34, earned:'$331', rating:5, avatar:'A', textEn:"Excellent platform with genuine returns. Tasks are simple and the earning timeline is exactly as described. First withdrawal was approved within two days." },
  { name:'Chidi Okeke', area:'🇳🇬 Asaba, Nigeria', plan:'BASIC', days:88, earned:'$161', rating:4, avatar:'C', textEn:"Slow and steady on BASIC. Every week the money comes in reliably. Not huge amounts but it is real and consistent. Planning to upgrade before the year ends." },
  { name:'Lakshmi Devi', area:'🇮🇳 Hyderabad, India', plan:'PREMIUM', days:54, earned:'$248', rating:5, avatar:'L', textEn:"The platform is very easy to use even for someone not very tech-savvy like me. My daughter helped me set it up and now I earn independently every day." },
  { name:'Moussa Coulibaly', area:'🇨🇮 Abidjan, Ivory Coast', plan:'GOLD', days:48, earned:'$468', rating:5, avatar:'M', textEn:"Very impressed with the consistency. Almost 50 days and not a single missed payment. The GOLD plan is worth every cent of the initial investment." },
  { name:'Tina Boakye', area:'🇬🇭 Sunyani, Ghana', plan:'PREMIUM', days:76, earned:'$349', rating:5, avatar:'T', textEn:"Joined through my church group's WhatsApp chat. The onboarding was smooth and the income has been steady. Withdrawals process in less than 48 hours." },
  { name:'Omar Farouk', area:'🇸🇩 Omdurman, Sudan', plan:'GOLD', days:40, earned:'$390', rating:5, avatar:'O', textEn:"Reliable, transparent, and worth the investment. Daily tasks take about 15 minutes and the earnings are credited immediately. Very professional operation." },
  { name:'Irene Wanjiru', area:'🇰🇪 Mombasa, Kenya', plan:'PREMIUM', days:65, earned:'$299', rating:5, avatar:'I', textEn:"I was looking for something to do during school holidays and this turned into a permanent income stream. Fast tasks, fair pay, and very responsive support team." },
  { name:'Babatunde Adeyemi', area:'🇳🇬 Abeokuta, Nigeria', plan:'PLATINUM', days:23, earned:'$362', rating:5, avatar:'B', textEn:"Went straight to PLATINUM after researching the plans and it was the right call. Maximum daily tasks and best earnings per cycle. Return on investment is excellent." },
  { name:'Ananya Das', area:'🇮🇳 Kolkata, India', plan:'GOLD', days:37, earned:'$361', rating:5, avatar:'A', textEn:"Simple tasks, real money, on-time payments. That is all I needed to know. Three months later and I have no complaints whatsoever. Highly recommend GOLD plan." },
  { name:'Frank Asiedu', area:'🇬🇭 Tema, Ghana', plan:'PREMIUM', days:59, earned:'$271', rating:5, avatar:'F', textEn:"PhoneCraft is part of my daily routine now. Morning coffee, tasks done in 15 minutes, money credited. It genuinely works and the support team is always helpful." },
  { name:'Habib Diagne', area:'🇸🇳 Dakar, Senegal', plan:'GOLD', days:43, earned:'$419', rating:5, avatar:'H', textEn:"This platform has given me financial independence I did not have before. Every task I complete adds to my income and every withdrawal arrives without fail." },
  { name:'James Whitfield', area:'🇬🇧 London, United Kingdom', plan:'GOLD', days:38, earned:'$371', rating:5, avatar:'J', textEn:"Found PhoneCraft through a mate at work. Brilliant platform — tasks are dead simple, takes about 15 minutes each morning. Withdrawal landed in my account within 48 hours, no bother at all. Proper reliable." },
  { name:'Sophie Cartwright', area:'🇬🇧 Birmingham, United Kingdom', plan:'PREMIUM', days:54, earned:'$248', rating:5, avatar:'S', textEn:"I was a bit sceptical at first but gave it a go. Six weeks in and I can honestly say it's been fantastic. Fits nicely around my full-time job. Really chuffed with the results and the support team are ever so helpful." },
  { name:'Liam Ashworth', area:'🇬🇧 Manchester, United Kingdom', plan:'PLATINUM', days:26, earned:'$409', rating:5, avatar:'L', textEn:"Went straight to PLATINUM after doing my research. Top-tier daily tasks, cracking earnings, and the payout hit my account faster than expected. Absolutely worth every penny of the investment. Highly recommend." },
];

const PLAN_COLORS = { BASIC:'#1E5FD4', PREMIUM:'#818CF8', GOLD:'#FCD535', PLATINUM:'#F97316' };

function StarRating({ count }) {
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} viewBox="0 0 12 12" style={{width:11,height:11}}>
          <path d="M6 1 L7.18 4.09 L10.5 4.41 L8.1 6.52 L8.84 9.76 L6 8.05 L3.16 9.76 L3.9 6.52 L1.5 4.41 L4.82 4.09 Z" fill={i <= count ? '#FCD535' : 'rgba(43,49,57,0.6)'} />
        </svg>
      ))}
    </div>
  );
}

const AVATAR_COLORS = ['#1E5FD4','#818CF8','#F97316','#60A5FA','#FCD535','#F472B6'];

function TestimonialsSection({ lang }) {
  const [startIdx, setStartIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const isBn = lang === 'bn';
  const visible = 2;

  const prev = () => setStartIdx(i => Math.max(0, i - 1));
  const next = () => setStartIdx(i => Math.min(TESTIMONIALS.length - visible, i + 1));

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setStartIdx(i => i >= TESTIMONIALS.length - visible ? 0 : i + 1);
    }, 4000);
    return () => clearInterval(id);
  }, [paused]);

  const shown = TESTIMONIALS.slice(startIdx, startIdx + visible);

  return (
    <section className="ld-fade ld-fade-5 ld-section">
      <style>{`
        @keyframes tCardIn { from{opacity:0;transform:translateY(10px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        .t-card { animation: tCardIn .3s cubic-bezier(.22,.68,0,1.1) both; transition: box-shadow .25s, transform .25s; }
        .t-card:hover { transform: translateY(-3px); }
        .t-nav-btn { transition: all .2s; }
        .t-nav-btn:hover:not(:disabled) { background: rgba(30,95,212,0.15) !important; border-color: rgba(30,95,212,0.4) !important; color: #1E5FD4 !important; }
      `}</style>
      <div className="ld-wrap">
        <div className="ld-sec-head">
          <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#1E5FD4,#6366F1)', display:'inline-block' }} />
          <span className="ld-sec-title">{isBn ? 'সফল সদস্যদের গল্প' : 'Member Success Stories'}</span>
          <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
            <button className="t-nav-btn" onClick={prev} disabled={startIdx === 0} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} style={{ width:32, height:32, borderRadius:10, border:'1px solid rgba(43,49,57,0.7)', background:'rgba(7,16,32,0.68)', color: startIdx === 0 ? '#2B3139' : '#9AA4B2', cursor: startIdx === 0 ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg viewBox="0 0 14 14" fill="none" style={{width:12,height:12}}><path d="M9 3 L5 7 L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <button className="t-nav-btn" onClick={next} disabled={startIdx >= TESTIMONIALS.length - visible} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} style={{ width:32, height:32, borderRadius:10, border:'1px solid rgba(43,49,57,0.7)', background:'rgba(7,16,32,0.68)', color: startIdx >= TESTIMONIALS.length - visible ? '#2B3139' : '#9AA4B2', cursor: startIdx >= TESTIMONIALS.length - visible ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg viewBox="0 0 14 14" fill="none" style={{width:12,height:12}}><path d="M5 3 L9 7 L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
        {/* Progress dots */}
        <div style={{ display:'flex', gap:5, marginBottom:14 }}>
          {Array.from({ length: TESTIMONIALS.length - visible + 1 }).map((_, i) => (
            <div key={i} onClick={() => setStartIdx(i)} style={{
              height:3, borderRadius:2, cursor:'pointer', transition:'all .35s',
              flex: i === startIdx ? 2 : 1,
              background: i === startIdx ? '#1E5FD4' : 'rgba(43,49,57,0.6)',
            }} />
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(320px,100%),1fr))', gap:12 }}>
          {shown.map((t, i) => {
            const planColor = PLAN_COLORS[t.plan] || '#1E5FD4';
            const avatarBg = AVATAR_COLORS[(startIdx + i) % AVATAR_COLORS.length];
            const initials = t.name.charAt(0);
            return (
              <div key={startIdx + i} className="t-card" style={{
                borderRadius:16,
                border:`1px solid ${planColor}20`,
                borderLeft:`3px solid ${planColor}`,
                background:'linear-gradient(150deg, rgba(8,18,38,0.95), rgba(5,12,28,0.92))',
                padding:'16px 18px',
                boxShadow: `0 4px 24px rgba(0,0,0,0.2), 0 0 0 1px ${planColor}08`,
                position:'relative', overflow:'hidden',
              }}>
                {/* Background glow */}
                <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:`radial-gradient(circle, ${planColor}0c, transparent 70%)`, pointerEvents:'none' }} />

                {/* Header row */}
                <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 }}>
                  {/* Avatar */}
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <div style={{
                      width:46, height:46, borderRadius:14,
                      background:`linear-gradient(135deg, ${avatarBg}30, ${avatarBg}10)`,
                      border:`1.5px solid ${avatarBg}50`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:20, fontWeight:700, color:avatarBg,
                      fontFamily:'Space Grotesk',
                    }}>
                      {t.avatar}
                    </div>
                    {t.rating === 5 && (
                      <div style={{ position:'absolute', bottom:-4, right:-4, width:16, height:16, borderRadius:'50%', background:'linear-gradient(135deg,#FCD535,#F0B90B)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8 }}>✓</div>
                    )}
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'#EAECEF', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.name}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#5a6473', marginBottom:5 }}>
                      <svg viewBox="0 0 12 12" fill="none" style={{width:10,height:10}}><path d="M6 1 C3.79 1 2 2.79 2 5 C2 8 6 11 6 11 C6 11 10 8 10 5 C10 2.79 8.21 1 6 1Z" stroke="#1E5FD4" strokeWidth="1" fill="rgba(30,95,212,0.15)"/><circle cx="6" cy="5" r="1.5" fill="#1E5FD4"/></svg>
                      {t.area}
                    </div>
                    <StarRating count={t.rating} />
                  </div>

                  {/* Earnings badge */}
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{
                      display:'inline-block', fontFamily:'Space Grotesk', fontSize:10, fontWeight:700,
                      color: planColor, background:`${planColor}10`,
                      border:`1px solid ${planColor}30`, borderRadius:6,
                      padding:'2px 8px', marginBottom:5, letterSpacing:0.8,
                    }}>{t.plan}</div>
                    <div style={{ fontSize:15, color:'#4ADE80', fontWeight:800, fontFamily:'Space Grotesk', lineHeight:1 }}>{t.earned}</div>
                    <div style={{ fontSize:10, color:'#5a6473', marginTop:3 }}>{isBn ? `${t.days} দিনে` : `in ${t.days} days`}</div>
                  </div>
                </div>

                {/* Quote */}
                <div style={{ position:'relative', paddingLeft:16 }}>
                  <div style={{ position:'absolute', left:0, top:0, bottom:0, width:2, borderRadius:1, background:`linear-gradient(180deg, ${planColor}60, transparent)` }} />
                  <p style={{ fontSize:12.5, color:'#8A95A3', lineHeight:1.8, margin:0, fontStyle:'italic' }}>
                    "{isBn ? (t.textBn || t.textEn) : t.textEn}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust note */}
        <div style={{ marginTop:14, padding:'10px 14px', borderRadius:10, background:'rgba(30,95,212,0.04)', border:'1px solid rgba(30,95,212,0.1)', fontSize:11.5, color:'#5a6473', textAlign:'center', lineHeight:1.6, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <svg viewBox="0 0 14 14" fill="none" style={{width:12,height:12,flexShrink:0}}><path d="M7 1 L8.4 4.8 L12.4 5.1 L9.5 7.6 L10.4 11.5 L7 9.3 L3.6 11.5 L4.5 7.6 L1.6 5.1 L5.6 4.8 Z" stroke="#1E5FD4" strokeWidth="1" fill="rgba(30,95,212,0.1)"/></svg>
          {isBn ? 'বাস্তব সদস্যদের অভিজ্ঞতা। আয় প্ল্যান, কার্যকলাপ ও রেফারেল অনুযায়ী পরিবর্তিত হতে পারে।' : 'Real member experiences. Earnings may vary by plan, activity, and referrals.'}
        </div>
      </div>
    </section>
  );
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'টাকা কীভাবে তুলব (উইথড্র করব)?',
    a: 'অ্যাপের ওয়ালেট সেকশনে যান → উইথড্র ট্যাব বেছে নিন → আপনার bKash/Nagad/রকেট নম্বর ও পরিমাণ দিন → রিকোয়েস্ট করুন। অ্যাডমিন ২৪ ঘন্টার মধ্যে প্রক্রিয়া করে দেবেন।',
  },
  {
    q: 'বিনিয়োগ কি নিরাপদ?',
    a: 'PhoneCraft একটি প্রতিষ্ঠিত প্ল্যাটফর্ম। তবে যেকোনো অনলাইন বিনিয়োগে ঝুঁকি থাকে। আমাদের পরামর্শ — শুধুমাত্র সেই পরিমাণ বিনিয়োগ করুন যা আপনি সামলাতে পারবেন। রেজিস্ট্রেশনের আগে সকল আইনি শর্তাবলী পড়ুন।',
  },
  {
    q: 'প্রতিদিন কতটি কাজ করতে পারব?',
    a: 'প্ল্যান অনুযায়ী: BASIC = ১০টি, PREMIUM = ১০টি, GOLD = ১২টি, PLATINUM = ১৬টি। প্রতিটি টাস্ক মাত্র ২ মিনিট সময় নেয়।',
  },
  {
    q: 'রেজিস্ট্রেশনের জন্য কী কী দরকার?',
    a: 'আপনার পুরো নাম, মোবাইল নম্বর বা ইমেইল, একটি পাসওয়ার্ড, এবং একটি বৈধ রেফারেল কোড প্রয়োজন। রেফারেল কোড ছাড়া নিবন্ধন করা যাবে না।',
  },
  {
    q: 'রেফারেল সিস্টেম কীভাবে কাজ করে?',
    a: 'আপনার রেফারেল কোড শেয়ার করুন। কেউ আপনার কোড দিয়ে নিবন্ধন ও প্ল্যান কিনলে আপনি লেভেল ১ এ তাদের প্ল্যান মূল্যের ২০% কমিশন পাবেন। লেভেল ২ এ ৪% এবং লেভেল ৩ এ ১% পাবেন।',
  },
  {
    q: 'কত দিনে বিনিয়োগ ফেরত পাব?',
    a: 'প্ল্যান অনুযায়ী ৫০-৬৪ দিনের মধ্যে বিনিয়োগ পুনরুদ্ধার সম্ভব (শুধুমাত্র ম্যানুফ্যাকচারিং থেকে, রেফারেল ছাড়া)। রেফারেল থেকে আয় হলে আরও দ্রুত ফেরত পাবেন।',
  },
  {
    q: 'ন্যূনতম উইথড্র কত?',
    a: 'প্রতিটি প্ল্যানের জন্য ন্যূনতম উইথড্র সীমা আলাদা। সঠিক তথ্যের জন্য অ্যাপের ওয়ালেট সেকশন বা সাপোর্ট টিমের সাথে যোগাযোগ করুন।',
  },
  {
    q: 'কাজের সময় কখন?',
    a: 'বাংলাদেশ সময় সকাল ৯টা থেকে রাত ১০টা পর্যন্ত ওয়ার্ক স্ক্রিন সক্রিয় থাকে। এই সময়ের মধ্যে যেকোনো সময় আপনার দৈনিক টাস্ক সম্পন্ন করতে পারবেন।',
  },
  {
    q: 'একটি ডিভাইস থেকে একাধিক অ্যাকাউন্ট করা যাবে?',
    a: 'না। প্রতি ব্যক্তির জন্য শুধুমাত্র একটি অ্যাকাউন্ট অনুমোদিত। একাধিক অ্যাকাউন্ট তৈরি করলে সব অ্যাকাউন্ট স্থায়ীভাবে বাতিল করা হবে।',
  },
  {
    q: 'সাপোর্টের সাথে কীভাবে যোগাযোগ করব?',
    a: 'অ্যাপের সাপোর্ট সেকশনে সরাসরি মেসেজ করুন। আমাদের টিম ২৪/৭ সক্রিয় থাকে এবং দ্রুত সাড়া দেয়।',
  },
];

const FAQ_ICONS = [
  <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}><rect x="2" y="3" width="12" height="10" rx="2" stroke="#1E5FD4" strokeWidth="1.2"/><path d="M5 7 L11 7 M5 10 L8 10" stroke="#1E5FD4" strokeWidth="1.1" strokeLinecap="round"/></svg>,
  <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}><path d="M8 2 L14 5 L14 9 C14 12.5 11 14.5 8 15.5 C5 14.5 2 12.5 2 9 L2 5 Z" stroke="#1E5FD4" strokeWidth="1.2" fill="rgba(30,95,212,0.08)"/><path d="M5.5 8 L7 9.5 L10.5 6" stroke="#1E5FD4" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}><rect x="2" y="2" width="12" height="12" rx="2" stroke="#1E5FD4" strokeWidth="1.2"/><path d="M5 8 L7 10 L11 6" stroke="#1E5FD4" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}><circle cx="8" cy="6" r="3" stroke="#1E5FD4" strokeWidth="1.2"/><path d="M2 14 C2 11 4.7 9 8 9 C11.3 9 14 11 14 14" stroke="#1E5FD4" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}><path d="M8 2 L10 6 L14 6.5 L11 9.5 L11.5 14 L8 12 L4.5 14 L5 9.5 L2 6.5 L6 6 Z" stroke="#1E5FD4" strokeWidth="1" fill="rgba(30,95,212,0.1)"/></svg>,
  <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}><circle cx="8" cy="8" r="6" stroke="#1E5FD4" strokeWidth="1.2"/><path d="M8 5 L8 9 M8 11 L8 11.5" stroke="#1E5FD4" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}><rect x="2" y="4" width="12" height="9" rx="1.5" stroke="#1E5FD4" strokeWidth="1.2"/><path d="M5 4 L5 3 C5 2 6 1.5 8 1.5 C10 1.5 11 2 11 3 L11 4" stroke="#1E5FD4" strokeWidth="1.1"/></svg>,
  <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}><circle cx="8" cy="8" r="6" stroke="#1E5FD4" strokeWidth="1.2"/><path d="M8 4 L8 8 L11 10" stroke="#1E5FD4" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}><path d="M3 8 C3 5 5 3 8 3 C11 3 13 5 13 8 C13 11 11 13 8 13 C5 13 3 11 3 8Z" stroke="#1E5FD4" strokeWidth="1.2"/><path d="M6 6 L10 10 M10 6 L6 10" stroke="#1E5FD4" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}><path d="M13 10.5 C13 12 12 13 10.5 13 L5.5 13 C4 13 3 12 3 10.5 L3 5.5 C3 4 4 3 5.5 3 L10.5 3 C12 3 13 4 13 5.5 Z" stroke="#1E5FD4" strokeWidth="1.2"/><path d="M6 8 L10 8 M8 6 L10 8 L8 10" stroke="#1E5FD4" strokeWidth="1.2" strokeLinecap="round"/></svg>,
];

function FAQSection({ lang }) {
  const [openIdx, setOpenIdx] = useState(null);
  const isBn = lang === 'bn';

  const enItems = [
    { q:'How do I withdraw money?', a:'Go to Wallet → Withdraw tab → Enter your bKash/Nagad number & amount → Submit. Admin processes within 24 hours.' },
    { q:'Is my investment safe?', a:'PhoneCraft is an established platform. However, all online investments carry risk. Only invest what you can afford. Read all legal terms before registering.' },
    { q:'How many tasks can I do per day?', a:'By plan: BASIC = 10, PREMIUM = 10, GOLD = 12, PLATINUM = 16. Each task takes only 2 minutes.' },
    { q:'What do I need to register?', a:'Your full name, mobile/email, password, and a valid referral code. Registration is not possible without a referral code.' },
    { q:'How does the referral system work?', a:'Share your referral code. When someone registers with your code and buys a plan, you earn 20% commission (Level 1). Level 2 earns 4%, Level 3 earns 1%.' },
    { q:'When will I recover my investment?', a:'Within 50–64 days depending on your plan (from manufacturing only). With referrals, you can recover faster.' },
    { q:'What is the minimum withdrawal?', a:'Minimum withdrawal varies by plan. Check the Wallet section in-app or contact support for exact limits.' },
    { q:'What are the work hours?', a:'The Work Screen is active from 9 AM to 10 PM Bangladesh Time. Complete your daily tasks anytime within this window.' },
    { q:'Can I have multiple accounts?', a:'No. Each person is allowed only one account. Creating multiple accounts results in permanent ban of all accounts.' },
    { q:'How do I contact support?', a:'Message directly through the Support section in-app. Our team is active 24/7 and responds quickly.' },
  ];

  const items = isBn ? FAQ_ITEMS : enItems;

  return (
    <section className="ld-fade ld-fade-5 ld-section">
      <style>{`
        @keyframes faqFade { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .faq-item { transition: border-color .2s, box-shadow .2s; }
        .faq-item:hover { border-color: rgba(30,95,212,0.25) !important; }
        .faq-item.open { border-color: rgba(30,95,212,0.3) !important; box-shadow: 0 4px 20px rgba(30,95,212,0.06); }
        .faq-btn { transition: background .2s; }
        .faq-btn:hover { background: rgba(30,95,212,0.04) !important; }
      `}</style>
      <div className="ld-wrap">
        <div className="ld-sec-head">
          <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#1E5FD4,#6366F1)', display:'inline-block' }} />
          <span className="ld-sec-title">{isBn ? 'প্রশ্ন ও উত্তর' : 'FAQ'}</span>
          <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700, color:'#1E5FD4', background:'rgba(30,95,212,0.1)', border:'1px solid rgba(30,95,212,0.2)', borderRadius:10, padding:'2px 8px', fontFamily:'Space Grotesk', letterSpacing:0.8 }}>{items.length} {isBn ? 'প্রশ্ন' : 'Q&As'}</span>
        </div>
        <p style={{ fontSize:13, color:'#707A8A', marginBottom:16 }}>
          {isBn ? 'সাধারণ প্রশ্নের উত্তর এখানে পাবেন:' : 'Find answers to common questions:'}
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {items.map((item, i) => (
            <div
              key={i}
              className={`faq-item${openIdx === i ? ' open' : ''}`}
              style={{
                borderRadius:14,
                border:`1px solid ${openIdx === i ? 'rgba(30,95,212,0.25)' : 'rgba(43,49,57,0.7)'}`,
                background: openIdx === i ? 'linear-gradient(135deg, rgba(30,95,212,0.05), rgba(5,12,28,0.92))' : 'rgba(7,16,32,0.75)',
                overflow:'hidden',
              }}
            >
              <button
                className="faq-btn"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:12,
                  padding:'13px 16px', background:'none', border:'none',
                  cursor:'pointer', textAlign:'left', fontFamily:'Inter, sans-serif',
                }}
              >
                {/* Icon */}
                <div style={{
                  width:30, height:30, borderRadius:9, flexShrink:0,
                  background: openIdx === i ? 'rgba(30,95,212,0.12)' : 'rgba(22,26,37,0.8)',
                  border:`1px solid ${openIdx === i ? 'rgba(30,95,212,0.3)' : 'rgba(43,49,57,0.6)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all .2s',
                }}>
                  {FAQ_ICONS[i] || FAQ_ICONS[0]}
                </div>

                {/* Question */}
                <span style={{ flex:1, fontSize:13.5, fontWeight:600, color: openIdx === i ? '#EAECEF' : '#B0BAC8', lineHeight:1.5 }}>
                  {item.q}
                </span>

                {/* Chevron */}
                <div style={{
                  width:24, height:24, borderRadius:7, flexShrink:0,
                  background: openIdx === i ? 'rgba(30,95,212,0.12)' : 'transparent',
                  border: openIdx === i ? '1px solid rgba(30,95,212,0.25)' : '1px solid rgba(43,49,57,0.5)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all .25s',
                }}>
                  <svg viewBox="0 0 12 12" fill="none" style={{ width:10, height:10, transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0)', transition:'transform .25s cubic-bezier(.4,0,.2,1)' }}>
                    <path d="M2 4 L6 8 L10 4" stroke={openIdx === i ? '#1E5FD4' : '#5a6473'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>

              {openIdx === i && (
                <div style={{ padding:'0 16px 14px 58px', animation:'faqFade .2s ease both' }}>
                  <div style={{ height:1, background:'rgba(30,95,212,0.12)', marginBottom:12 }} />
                  <p style={{ fontSize:13, color:'#8A95A3', lineHeight:1.85, margin:0 }}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Legal Modal ─────────────────────────────────────────────────────────────
export function LegalModal({ doc, onClose }) {
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
          {/* UK Company Header */}
          <div style={{ marginBottom:14, padding:'10px 14px', borderRadius:10, background:'rgba(30,95,212,0.06)', border:'1px solid rgba(30,95,212,0.18)' }}>
            <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:14, color:'#1E5FD4', marginBottom:2 }}>PhoneCraft Ltd</div>
            <div style={{ fontSize:11, color:'#707A8A', lineHeight:1.6 }}>
              Registered in England &amp; Wales &nbsp;·&nbsp; Company No. 15234567<br/>
              71-75 Shelton Street, Covent Garden, London WC2H 9JQ
            </div>
          </div>
          <p style={{ fontSize:13, color:'#707A8A', marginBottom:16, lineHeight:1.6 }}>
            Last updated: March 6, 2026 &nbsp;·&nbsp; Effective immediately
          </p>
          {doc.sections.map((s, i) => (
            <div key={i} style={{ marginBottom:18 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#1E5FD4', marginBottom:6 }}>{s.heading}</div>
              <p style={{ fontSize:13, color:'rgba(234,236,239,0.75)', lineHeight:1.75 }}>{s.body}</p>
            </div>
          ))}
          <div style={{ marginTop:24, padding:'12px 16px', background:'rgba(30,95,212,0.06)', border:'1px solid rgba(30,95,212,0.2)', borderRadius:10 }}>
            <p style={{ fontSize:13, color:'rgba(30,95,212,0.85)', lineHeight:1.7 }}>
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
  const isBn = lang === 'bn';
  const legalData = isBn ? LEGAL_BN : LEGAL;

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
          border:1px solid rgba(30,95,212,0.18);
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
          background: linear-gradient(90deg, rgba(30,95,212,.4), rgba(99,102,241,.2));
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
        .ld-legal-btn:hover { border-color:rgba(30,95,212,.4); color:#1E5FD4; }
      `}</style>

      {/* ── PWA INSTALL BANNER ── */}
      {!bannerDismissed && !isInstalled && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(10,12,16,0.97), rgba(22,26,37,0.97))',
          borderBottom: '1px solid rgba(30,95,212,.3)',
          padding: '10px clamp(16px,4vw,56px)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(30,95,212,.2), rgba(30,95,212,.08))',
            border: '1px solid rgba(30,95,212,.3)',
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
              style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#1E5FD4,#1a8f75)', color: '#fff', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 2px 12px rgba(30,95,212,.35)' }}
            >{t.install_btn}</button>
          )}
          <button
            onClick={dismissBanner}
            style={{ background: 'none', border: '1px solid rgba(43,49,57,.8)', color: '#707A8A', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0, padding: '4px 8px', borderRadius: 6, transition: 'all .2s' }}
            onMouseEnter={e => { e.target.style.borderColor='rgba(30,95,212,.4)'; e.target.style.color='#1E5FD4'; }}
            onMouseLeave={e => { e.target.style.borderColor='rgba(43,49,57,.8)'; e.target.style.color='#707A8A'; }}
          ><Icons.X size={14} /></button>
        </div>
      )}

      <div
        onClick={() => setShowInstallGuide(true)}
        style={{
          cursor: 'pointer',
          background: 'linear-gradient(90deg, rgba(30,95,212,.2), rgba(99,102,241,.14))',
          borderBottom: '1px solid rgba(30,95,212,.28)',
          padding: '10px clamp(16px,4vw,56px)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(10,12,16,.45)',
          border: '1px solid rgba(30,95,212,.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          flexShrink: 0,
        }}>
          <img src="/logo.png" alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: 800, color: '#EAECEF' }}>
            {t.land_install_guide}
          </div>
          <div style={{ fontSize: 11, color: '#9AA4B2', marginTop: 1 }}>
            {t.land_install_sub}
          </div>
        </div>
        <span style={{ color: '#1E5FD4', fontSize: 17, fontWeight: 900, flexShrink: 0 }}>›</span>
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
              PHONE<span style={{ color:'#1E5FD4' }}>CRAFT</span>
            </span>
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <button
              onClick={onLogin}
              style={{ padding:'8px 18px', borderRadius:8, border:'1px solid rgba(30,95,212,.4)', background:'transparent', color:'#1E5FD4', fontFamily:'Space Grotesk', fontWeight:600, fontSize:14, cursor:'pointer', transition:'all .2s' }}
              onMouseEnter={e=>{ e.target.style.background='rgba(30,95,212,.1)'; }}
              onMouseLeave={e=>{ e.target.style.background='transparent'; }}
            >{t.login}</button>
            <button
              onClick={onGetStarted}
              style={{ padding:'8px 18px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#1E5FD4,#1a8f75)', color:'#fff', fontFamily:'Space Grotesk', fontWeight:700, fontSize:14, cursor:'pointer', boxShadow:'0 2px 12px rgba(30,95,212,.3)' }}
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
          <div style={{ position:'absolute', top:20, left:'50%', transform:'translateX(-50%)', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(30,95,212,.12) 0%, transparent 70%)', pointerEvents:'none' }} />

          {/* Logo - Animated Portal */}
          <div className="ld-fade ld-fade-1 auth-logo-wrap" style={{ marginBottom:4, paddingTop:0, paddingBottom:0 }}>
            <div className="auth-logo-portal">
              <div className="auth-logo-ring" />
              <div className="auth-logo-ring2" />
              <div className="auth-logo-glow" />
              <div className="auth-logo-svg">
                <img src="/logo.png" alt="PhoneCraft" style={{ width:110, height:110, objectFit:'contain' }} onError={e=>{ e.target.style.display='none'; }} />
              </div>
              <span className="auth-orbit-dot" />
              <span className="auth-orbit-dot" />
              <span className="auth-orbit-dot" />
              <span className="auth-orbit-dot" />
            </div>
          </div>

          {/* UK Trust Badges */}
          <div className="ld-fade ld-fade-1" style={{ display:'flex', gap:8, alignItems:'center', justifyContent:'center', flexWrap:'wrap', marginBottom:16 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 14px', borderRadius:20, background:'rgba(30,95,212,.12)', border:'1px solid rgba(30,95,212,.38)', fontSize:11, color:'#7EB4FF', fontFamily:'Space Grotesk', fontWeight:700, letterSpacing:1.5 }}>
              🇬🇧 UK REGISTERED PLATFORM
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 14px', borderRadius:20, background:'rgba(201,168,76,.10)', border:'1px solid rgba(201,168,76,.35)', fontSize:11, color:'#C9A84C', fontFamily:'Space Grotesk', fontWeight:700, letterSpacing:1.5 }}>
              ✦ {t.badge}
            </div>
          </div>

          {/* Headline */}
          <h1 className="ld-fade ld-fade-2" style={{ fontFamily:'Space Grotesk', fontSize:'clamp(28px,4vw,56px)', fontWeight:900, lineHeight:1.18, marginBottom:14, position:'relative' }}>
            {t.headline1}<br />
            <span style={{ background:'linear-gradient(90deg,#4B9EFF,#C9A84C)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              {t.headline2}
            </span>
          </h1>

          <p className="ld-fade ld-fade-3" style={{ fontSize:'clamp(14px,1.3vw,18px)', color:'rgba(112,122,138,0.9)', maxWidth:460, margin:'0 auto 28px', lineHeight:1.75 }}>
            {t.desc}
          </p>

          {/* CTA buttons */}
          <div className="ld-fade ld-fade-3" style={{ display:'flex', flexDirection:'column', gap:12, alignItems:'center', width:'100%', maxWidth:400, margin:'0 auto' }}>
            <button
              onClick={onGetStarted}
              style={{
                width:'100%', padding:'15px 36px', borderRadius:12, border:'none',
                background:'linear-gradient(135deg,#1E5FD4,#1A4AB8)',
                color:'#fff', fontFamily:'Space Grotesk', fontWeight:700, fontSize:16,
                cursor:'pointer', boxShadow:'0 4px 24px rgba(30,95,212,.40), inset 0 1px 0 rgba(255,255,255,.15)',
                transition:'transform .18s, box-shadow .18s',
                letterSpacing:0.3,
              }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(30,95,212,.50), inset 0 1px 0 rgba(255,255,255,.15)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 24px rgba(30,95,212,.40), inset 0 1px 0 rgba(255,255,255,.15)'; }}
            >
              🇬🇧 {t.cta_start}
            </button>
            <button
              onClick={onLogin}
              style={{ width:'100%', padding:'14px 32px', borderRadius:12, border:'1px solid rgba(30,95,212,.45)', background:'transparent', color:'#7EB4FF', fontFamily:'Space Grotesk', fontWeight:600, fontSize:15, cursor:'pointer', transition:'all .18s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background='rgba(30,95,212,.10)'; e.currentTarget.style.borderColor='rgba(30,95,212,.7)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(30,95,212,.45)'; }}
            >
              {t.cta_member}
            </button>
          </div>

          {/* UK Company Trust Strip */}
          <div className="ld-fade ld-fade-4" style={{ marginTop:20, padding:'9px 16px', borderRadius:12, background:'rgba(30,95,212,.06)', border:'1px solid rgba(30,95,212,.18)', display:'flex', alignItems:'center', justifyContent:'center', gap:6, flexWrap:'wrap', textAlign:'center' }}>
            <span style={{ fontSize:10, color:'#5A7499', fontFamily:'Space Grotesk', fontWeight:600, letterSpacing:0.5 }}>
              🏛️ {isBn ? 'ইংল্যান্ড ও ওয়েলসে নিবন্ধিত · কোম্পানি নং ১৫২৩৪৫৬৭' : 'Registered in England & Wales · Company No. 15234567'} &nbsp;·&nbsp;
              🔒 {isBn ? 'ICO নং ZB456789 · UK GDPR সম্মত' : 'ICO No. ZB456789 · UK GDPR Compliant'} &nbsp;·&nbsp;
              ⚖️ {isBn ? 'ইংল্যান্ডের আইনে পরিচালিত' : 'Governed by English Law'}
            </span>
          </div>

          {/* Stats row */}
          <div className="ld-fade ld-fade-4 ld-stats-row" style={{ marginTop:24 }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(22px,3vw,36px)', fontWeight:900, color:'#E8EFF9' }}>
                <Counter target={84000} suffix="+" />
              </div>
              <div style={{ fontSize:12, color:'#6B80A0', marginTop:2, letterSpacing:.5 }}>{t.stat_members}</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(22px,3vw,36px)', fontWeight:900, color:'#E8EFF9' }}>
                {lang === 'bn' ? <>{convertCurrency(0.16, lang)}–{convertCurrency(0.81, lang)}</> : '$0.16–$0.81'}
              </div>
              <div style={{ fontSize:12, color:'#6B80A0', marginTop:2, letterSpacing:.5 }}>{t.stat_task}</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(22px,3vw,36px)', fontWeight:900, color:'#E8EFF9' }}>
                {lang === 'bn' ? '২০ দেশ' : '20 Countries'}
              </div>
              <div style={{ fontSize:12, color:'#6B80A0', marginTop:2, letterSpacing:.5 }}>{t.stat_world}</div>
            </div>
          </div>
          </div>{/* end ld-wrap */}
        </div>

        {/* ── BOISHAKHI ANNOUNCEMENT POSTER ── */}
        <section className="ld-fade ld-fade-4 ld-section" style={{ padding:'8px 0 0' }}>
          <div className="ld-wrap">
            <style>{`
              @keyframes boiPulseBtn { 0%,100%{box-shadow:0 0 0 0 rgba(192,57,43,.5)} 60%{box-shadow:0 0 0 14px rgba(192,57,43,0)} }
              @keyframes boiDiyaFlame { 0%,100%{transform:scaleY(1) skewX(0deg)} 33%{transform:scaleY(1.1) skewX(-4deg)} 66%{transform:scaleY(.95) skewX(3deg)} }
              @keyframes boiMedSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
              .boi-pulse-btn { animation:boiPulseBtn 2.4s ease-in-out infinite; }
              .boi-flame { transform-origin:center bottom; animation:boiDiyaFlame 1.6s ease-in-out infinite; }
              .boi-med-ring { transform-origin:center; animation:boiMedSpin 18s linear infinite; }
            `}</style>

            {/* ── POSTER CARD ── */}
            <div style={{
              borderRadius:20, overflow:'hidden', position:'relative',
              background:'linear-gradient(160deg,#FFF5DC,#FFF0CC,#FFEACC)',
              border:'3px solid #C0392B',
              boxShadow:'0 8px 40px rgba(192,57,43,.22), 0 2px 12px rgba(0,0,0,.18), inset 0 0 0 6px rgba(192,57,43,.08)',
            }}>

              {/* ── TOP BORDER STRIP ── */}
              <div style={{ height:8, background:'repeating-linear-gradient(90deg,#C0392B 0,#C0392B 10px,#F4C430 10px,#F4C430 20px,#196F3D 20px,#196F3D 30px,#C0392B 30px,#C0392B 40px)' }}/>

              {/* ── CORNER ORNAMENTS ── */}
              {/* Top-left */}
              <svg width="90" height="90" viewBox="0 0 90 90" fill="none" style={{ position:'absolute', top:8, left:0, pointerEvents:'none' }}>
                <path d="M0 0 Q45 0 45 45 Q0 45 0 0Z" fill="#C0392B" opacity=".12"/>
                <circle cx="10" cy="10" r="6" stroke="#C0392B" strokeWidth="1.5" fill="none" opacity=".7"/>
                <circle cx="10" cy="10" r="2.5" fill="#C0392B" opacity=".5"/>
                <path d="M18 5 Q40 5 40 28" stroke="#C0392B" strokeWidth="1.2" fill="none" opacity=".4" strokeDasharray="3 3"/>
                <path d="M5 18 Q5 40 28 40" stroke="#C0392B" strokeWidth="1.2" fill="none" opacity=".4" strokeDasharray="3 3"/>
                <circle cx="28" cy="28" r="4" stroke="#F4C430" strokeWidth="1.2" fill="none" opacity=".6"/>
                <circle cx="22" cy="8" r="2" fill="#C0392B" opacity=".4"/>
                <circle cx="8" cy="22" r="2" fill="#C0392B" opacity=".4"/>
                <path d="M14 4 Q14 14 4 14" stroke="#C0392B" strokeWidth="1" fill="none" opacity=".5"/>
              </svg>
              {/* Top-right */}
              <svg width="90" height="90" viewBox="0 0 90 90" fill="none" style={{ position:'absolute', top:8, right:0, transform:'scaleX(-1)', pointerEvents:'none' }}>
                <path d="M0 0 Q45 0 45 45 Q0 45 0 0Z" fill="#C0392B" opacity=".12"/>
                <circle cx="10" cy="10" r="6" stroke="#C0392B" strokeWidth="1.5" fill="none" opacity=".7"/>
                <circle cx="10" cy="10" r="2.5" fill="#C0392B" opacity=".5"/>
                <path d="M18 5 Q40 5 40 28" stroke="#C0392B" strokeWidth="1.2" fill="none" opacity=".4" strokeDasharray="3 3"/>
                <path d="M5 18 Q5 40 28 40" stroke="#C0392B" strokeWidth="1.2" fill="none" opacity=".4" strokeDasharray="3 3"/>
                <circle cx="28" cy="28" r="4" stroke="#F4C430" strokeWidth="1.2" fill="none" opacity=".6"/>
                <circle cx="22" cy="8" r="2" fill="#C0392B" opacity=".4"/>
                <circle cx="8" cy="22" r="2" fill="#C0392B" opacity=".4"/>
                <path d="M14 4 Q14 14 4 14" stroke="#C0392B" strokeWidth="1" fill="none" opacity=".5"/>
              </svg>
              {/* Bottom-left */}
              <svg width="90" height="90" viewBox="0 0 90 90" fill="none" style={{ position:'absolute', bottom:8, left:0, transform:'scaleY(-1)', pointerEvents:'none' }}>
                <path d="M0 0 Q45 0 45 45 Q0 45 0 0Z" fill="#C0392B" opacity=".12"/>
                <circle cx="10" cy="10" r="6" stroke="#C0392B" strokeWidth="1.5" fill="none" opacity=".7"/>
                <circle cx="10" cy="10" r="2.5" fill="#C0392B" opacity=".5"/>
                <path d="M18 5 Q40 5 40 28" stroke="#C0392B" strokeWidth="1.2" fill="none" opacity=".4" strokeDasharray="3 3"/>
                <path d="M5 18 Q5 40 28 40" stroke="#C0392B" strokeWidth="1.2" fill="none" opacity=".4" strokeDasharray="3 3"/>
                <circle cx="28" cy="28" r="4" stroke="#F4C430" strokeWidth="1.2" fill="none" opacity=".6"/>
              </svg>
              {/* Bottom-right */}
              <svg width="90" height="90" viewBox="0 0 90 90" fill="none" style={{ position:'absolute', bottom:8, right:0, transform:'scale(-1,-1)', pointerEvents:'none' }}>
                <path d="M0 0 Q45 0 45 45 Q0 45 0 0Z" fill="#C0392B" opacity=".12"/>
                <circle cx="10" cy="10" r="6" stroke="#C0392B" strokeWidth="1.5" fill="none" opacity=".7"/>
                <circle cx="10" cy="10" r="2.5" fill="#C0392B" opacity=".5"/>
                <path d="M18 5 Q40 5 40 28" stroke="#C0392B" strokeWidth="1.2" fill="none" opacity=".4" strokeDasharray="3 3"/>
                <path d="M5 18 Q5 40 28 40" stroke="#C0392B" strokeWidth="1.2" fill="none" opacity=".4" strokeDasharray="3 3"/>
                <circle cx="28" cy="28" r="4" stroke="#F4C430" strokeWidth="1.2" fill="none" opacity=".6"/>
              </svg>

              {/* ── BODY ── */}
              <div style={{ padding:'clamp(16px,3vw,28px) clamp(16px,4vw,32px)', textAlign:'center', position:'relative' }}>

                {/* Hanging Diya at top */}
                <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}>
                  <svg width="48" height="58" viewBox="0 0 48 58" fill="none">
                    {/* string */}
                    <line x1="24" y1="0" x2="24" y2="12" stroke="#C0392B" strokeWidth="1.2" strokeDasharray="2 2"/>
                    {/* flame */}
                    <g className="boi-flame">
                      <ellipse cx="24" cy="18" rx="4" ry="7" fill="#F97316" opacity=".9"/>
                      <ellipse cx="24" cy="16" rx="2" ry="4" fill="#FDE68A"/>
                      <ellipse cx="24" cy="19" rx="1" ry="2.5" fill="#fff" opacity=".6"/>
                    </g>
                    {/* diya body */}
                    <path d="M10 32 Q8 40 14 42 L34 42 Q40 40 38 32 Q33 26 24 25 Q15 26 10 32Z" fill="#E8880A"/>
                    <path d="M10 32 Q8 40 14 42 L34 42 Q40 40 38 32 Q33 26 24 25 Q15 26 10 32Z" fill="url(#diyaGrad)" opacity=".6"/>
                    <path d="M12 36 Q11 40 14 41 L34 41 Q37 40 36 36 Q31 31 24 30 Q17 31 12 36Z" fill="#C0392B" opacity=".25"/>
                    {/* oil pool */}
                    <ellipse cx="24" cy="30" rx="8" ry="2.5" fill="#F4C430" opacity=".7"/>
                    {/* spout */}
                    <path d="M34 33 Q40 30 42 32 Q41 36 36 36" fill="#E8880A"/>
                    <defs>
                      <linearGradient id="diyaGrad" x1="10" y1="25" x2="38" y2="42" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FDE68A"/>
                        <stop offset="100%" stopColor="#C0392B"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* "Pohela" script */}
                <div style={{
                  fontFamily:"Georgia, 'Times New Roman', serif",
                  fontSize:'clamp(14px,2.5vw,20px)',
                  fontStyle:'italic', color:'#8B1A1A',
                  letterSpacing:2, marginBottom:2, opacity:.85,
                }}>
                  Pohela
                </div>

                {/* BOISHAKH big heading */}
                <div style={{
                  fontFamily:"'Space Grotesk', sans-serif",
                  fontSize:'clamp(28px,6vw,48px)',
                  fontWeight:900, letterSpacing:4,
                  color:'#C0392B',
                  textShadow:'2px 2px 0 rgba(192,57,43,.18)',
                  lineHeight:1, marginBottom:4,
                }}>
                  BOISHAKH
                </div>

                {/* Gold underline */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:16 }}>
                  <div style={{ height:2, width:40, background:'linear-gradient(90deg,transparent,#F4C430)' }}/>
                  <svg width="16" height="16" viewBox="0 0 16 16"><polygon points="8,1 10,6 15,6 11,10 13,15 8,11 3,15 5,10 1,6 6,6" fill="#F4C430"/></svg>
                  <div style={{ fontSize:9, fontWeight:800, letterSpacing:3, color:'#8B1A1A', textTransform:'uppercase' }}>Special Offer</div>
                  <svg width="16" height="16" viewBox="0 0 16 16"><polygon points="8,1 10,6 15,6 11,10 13,15 8,11 3,15 5,10 1,6 6,6" fill="#F4C430"/></svg>
                  <div style={{ height:2, width:40, background:'linear-gradient(90deg,#F4C430,transparent)' }}/>
                </div>

                {/* Central mandala medallion */}
                <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
                  <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
                    {/* Outer slow-spinning ring */}
                    <g className="boi-med-ring">
                      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg,i)=>(
                        <g key={i} transform={`rotate(${deg} 55 55)`}>
                          <ellipse cx="55" cy="12" rx="3.5" ry="6" fill="#C0392B" opacity=".35"/>
                        </g>
                      ))}
                    </g>
                    {/* Middle ring */}
                    <circle cx="55" cy="55" r="38" stroke="#C0392B" strokeWidth="1.2" fill="none" opacity=".35"/>
                    <circle cx="55" cy="55" r="32" stroke="#F4C430" strokeWidth="1.5" fill="none" opacity=".5"/>
                    {/* Alpona petals */}
                    {[0,45,90,135,180,225,270,315].map((deg,i)=>(
                      <g key={i} transform={`rotate(${deg} 55 55)`}>
                        <path d="M55 23 Q61 38 55 43 Q49 38 55 23Z" fill="#C0392B" opacity=".5"/>
                      </g>
                    ))}
                    {/* Inner circle */}
                    <circle cx="55" cy="55" r="22" fill="rgba(192,57,43,.1)" stroke="#C0392B" strokeWidth="1.5"/>
                    <circle cx="55" cy="55" r="16" fill="rgba(244,196,48,.18)" stroke="#F4C430" strokeWidth="1"/>
                    {/* Center dot */}
                    <circle cx="55" cy="55" r="6" fill="#C0392B" opacity=".75"/>
                    <circle cx="55" cy="55" r="2.5" fill="#F4C430"/>
                    {/* Inner dots */}
                    {[0,60,120,180,240,300].map((deg,i)=>(
                      <g key={i} transform={`rotate(${deg} 55 55)`}>
                        <circle cx="55" cy="40" r="2" fill="#C0392B" opacity=".5"/>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Plan price cards */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                  {/* MINI */}
                  <div style={{
                    borderRadius:14, padding:'14px 10px',
                    background:'rgba(192,57,43,.08)',
                    border:'1.5px solid rgba(192,57,43,.4)',
                    position:'relative', overflow:'hidden',
                  }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#C0392B,#F4C430)' }}/>
                    <div style={{ fontSize:8, fontWeight:800, letterSpacing:2, color:'#8B1A1A', marginBottom:4, textTransform:'uppercase' }}>Starter</div>
                    <div style={{ fontFamily:'Space Grotesk', fontWeight:900, fontSize:15, color:'#C0392B', marginBottom:5 }}>MINI</div>
                    <div style={{ fontFamily:'Space Grotesk', fontWeight:900, fontSize:'clamp(18px,4vw,24px)', color:'#1a0800', lineHeight:1 }}>{convertCurrency(3000, lang)}</div>
                    <div style={{ fontSize:10, color:'#8B4513', marginTop:5, fontWeight:600 }}>{convertCurrency(50,lang)} daily</div>
                  </div>
                  {/* STANDARD */}
                  <div style={{
                    borderRadius:14, padding:'14px 10px',
                    background:'rgba(232,136,10,.1)',
                    border:'1.5px solid rgba(232,136,10,.5)',
                    position:'relative', overflow:'hidden',
                  }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#E8880A,#C0392B)' }}/>
                    <div style={{ fontSize:8, fontWeight:800, letterSpacing:2, color:'#8B4513', marginBottom:4, textTransform:'uppercase' }}>Popular</div>
                    <div style={{ fontFamily:'Space Grotesk', fontWeight:900, fontSize:15, color:'#E8880A', marginBottom:5 }}>STANDARD</div>
                    <div style={{ fontFamily:'Space Grotesk', fontWeight:900, fontSize:'clamp(18px,4vw,24px)', color:'#1a0800', lineHeight:1 }}>{convertCurrency(6000, lang)}</div>
                    <div style={{ fontSize:10, color:'#8B4513', marginTop:5, fontWeight:600 }}>{convertCurrency(100,lang)} daily</div>
                  </div>
                </div>

                {/* Blessing text */}
                <div style={{
                  fontSize:'clamp(11px,1.1vw,13px)',
                  color:'#8B1A1A', lineHeight:1.7,
                  marginBottom:18, fontStyle:'italic',
                  opacity:.8,
                }}>
                  May this new year bring happiness, prosperity, and endless success to you.
                  <br/>
                  <span style={{ fontStyle:'normal', fontWeight:700, color:'#C0392B', opacity:1 }}>
                    The more you invest, the more you earn — daily from home.
                  </span>
                </div>

                {/* CTA button */}
                <button className="boi-pulse-btn" onClick={onGetStarted} style={{
                  padding:'13px 44px', borderRadius:40, border:'none', cursor:'pointer',
                  background:'linear-gradient(135deg,#C0392B,#8B1A1A)',
                  color:'#FFF5DC', fontFamily:'Space Grotesk', fontWeight:900,
                  fontSize:'clamp(14px,1.5vw,17px)', letterSpacing:.8,
                  boxShadow:'0 4px 20px rgba(192,57,43,.4)',
                }}>
                  Get Started Now
                </button>

                {/* Bottom flower-pot SVG */}
                <div style={{ display:'flex', justifyContent:'flex-start', marginTop:16 }}>
                  <svg width="56" height="48" viewBox="0 0 56 48" fill="none" opacity=".55">
                    {/* pot */}
                    <path d="M16 30 Q14 44 20 46 L36 46 Q42 44 40 30Z" fill="#E8880A"/>
                    <path d="M14 28 Q13 32 16 32 L40 32 Q43 30 42 28Z" fill="#C0392B"/>
                    <path d="M20 28 Q22 20 28 16 Q34 20 36 28Z" fill="#196F3D"/>
                    <path d="M24 24 Q23 14 18 10 Q20 18 24 24Z" fill="#196F3D" opacity=".7"/>
                    <path d="M32 22 Q33 12 38 8 Q36 16 32 22Z" fill="#196F3D" opacity=".7"/>
                    <circle cx="28" cy="15" r="5" fill="#C0392B" opacity=".7"/>
                    <circle cx="28" cy="15" r="2.5" fill="#F4C430" opacity=".9"/>
                    <circle cx="20" cy="10" r="3" fill="#C0392B" opacity=".5"/>
                    <circle cx="36" cy="9" r="3" fill="#E8880A" opacity=".6"/>
                  </svg>
                </div>
              </div>

              {/* ── BOTTOM BORDER STRIP ── */}
              <div style={{ height:8, background:'repeating-linear-gradient(90deg,#196F3D 0,#196F3D 10px,#F4C430 10px,#F4C430 20px,#C0392B 20px,#C0392B 30px,#196F3D 30px,#196F3D 40px)' }}/>
            </div>
          </div>
        </section>

        {/* ── VIDEO SLIDER ── */}
        <section className="ld-fade ld-fade-4 ld-section">
          <div className="ld-wrap">
          <div className="ld-sec-head">
            <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#1E5FD4,#6366F1)', display:'inline-block' }} />
            <span className="ld-sec-title">{t.vid_title}</span>
            <span style={{ marginLeft:'auto', fontSize:10, color:'#1E5FD4', background:'rgba(30,95,212,.1)', border:'1px solid rgba(30,95,212,.2)', borderRadius:10, padding:'2px 8px', fontFamily:'Space Grotesk', fontWeight:600 }}>{t.vid_live}</span>
          </div>
          <div style={{ maxWidth:760, margin:'0 auto' }}>
            <VideoSlider lang={lang} />
          </div>
          </div>{/* end ld-wrap */}
        </section>

        {/* ── HOW IT WORKS (Enhanced 6-step) ── */}
        <section className="ld-fade ld-fade-4 ld-section">
          <div className="ld-wrap">
          <div className="ld-sec-head">
            <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#1E5FD4,#6366F1)', display:'inline-block' }} />
            <span className="ld-sec-title">{t.how_title}</span>
          </div>
          <style>{`
            .ld-6steps { display:grid; grid-template-columns:1fr; gap:10px; }
            @media(min-width:540px) { .ld-6steps { grid-template-columns:repeat(2,1fr); } }
            @media(min-width:900px) { .ld-6steps { grid-template-columns:repeat(3,1fr); } }
            .ld-step-card { transition: transform .22s, box-shadow .22s; }
            .ld-step-card:hover { transform: translateY(-3px); }
          `}</style>
          <div className="ld-6steps">
            {(lang === 'bn' ? [
              { step:'০১', icon: <svg viewBox="0 0 24 24" fill="none" style={{width:22,height:22}}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.3"/><path d="M8 12 L11 15 L16 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>, title:'রেফারেল কোড সংগ্রহ', desc:'আপনার রেফারারের কাছ থেকে একটি বৈধ রেফারেল কোড নিন। রেফারেল কোড ছাড়া নিবন্ধন সম্ভব নয়।', color:'#1E5FD4' },
              { step:'০২', icon: <svg viewBox="0 0 24 24" fill="none" style={{width:22,height:22}}><rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.3"/><path d="M8 8 L16 8 M8 12 L16 12 M8 16 L12 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>, title:'অ্যাকাউন্ট তৈরি', desc:'আপনার নাম, মোবাইল নম্বর/ইমেইল, পাসওয়ার্ড ও রেফারেল কোড দিয়ে মাত্র ২ মিনিটে নিবন্ধন করুন।', color:'#6366F1' },
              { step:'০৩', icon: <svg viewBox="0 0 24 24" fill="none" style={{width:22,height:22}}><rect x="2" y="6" width="20" height="13" rx="3" stroke="currentColor" strokeWidth="1.3"/><path d="M2 10 L22 10" stroke="currentColor" strokeWidth="1.3"/><circle cx="7" cy="15" r="1.5" fill="currentColor"/><path d="M11 15 L17 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>, title:'প্ল্যান বিনিয়োগ', desc:'BASIC থেকে PLATINUM পর্যন্ত আপনার বাজেট অনুযায়ী প্ল্যান বেছে নিন এবং bKash/Nagad-এ পেমেন্ট করুন।', color:'#FCD535' },
              { step:'০৪', icon: <svg viewBox="0 0 24 24" fill="none" style={{width:22,height:22}}><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5 L8 3 M16 5 L16 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M7 12 L10 15 L17 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'ভার্চুয়াল ফোন তৈরি', desc:'প্রতিদিন আপনার ড্যাশবোর্ডে লগইন করুন এবং ভার্চুয়াল ম্যানুফ্যাকচারিং টাস্ক শুরু করুন। প্রতিটি টাস্ক মাত্র ২ মিনিট!', color:'#F97316' },
              { step:'০৫', icon: <svg viewBox="0 0 24 24" fill="none" style={{width:22,height:22}}><path d="M4 20 L4 10 L8 10 L8 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 20 L10 6 L14 6 L14 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M16 20 L16 13 L20 13 L20 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M2 20 L22 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>, title:'মার্কেটপ্লেসে বিক্রি', desc:'আপনার তৈরি ভার্চুয়াল ফোন স্বয়ংক্রিয়ভাবে মার্কেটপ্লেসে পোস্ট হয় এবং ৩০ মিনিটের মধ্যে বিক্রি হয়।', color:'#A78BFA' },
              { step:'০৬', icon: <svg viewBox="0 0 24 24" fill="none" style={{width:22,height:22}}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.3"/><path d="M12 7 L12 17 M9 9.5 Q9 7 12 7 Q15 7 15 9.5 Q15 12 12 12 Q9 12 9 14.5 Q9 17 12 17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>, title:'আয় উইথড্র করুন', desc:'আপনার আয় সরাসরি bKash, Nagad বা ব্যাংক অ্যাকাউন্টে উইথড্র করুন। ২৪ ঘন্টার মধ্যে প্রক্রিয়া করা হয়।', color:'#4ADE80' },
            ] : [
              { step:'01', icon: <svg viewBox="0 0 24 24" fill="none" style={{width:22,height:22}}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.3"/><path d="M8 12 L11 15 L16 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>, title:'Get Referral Code', desc:'Obtain a valid referral code from your referrer. Registration requires a referral code.', color:'#1E5FD4' },
              { step:'02', icon: <svg viewBox="0 0 24 24" fill="none" style={{width:22,height:22}}><rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.3"/><path d="M8 8 L16 8 M8 12 L16 12 M8 16 L12 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>, title:'Create Account', desc:'Register in 2 minutes with your name, mobile/email, password and referral code.', color:'#6366F1' },
              { step:'03', icon: <svg viewBox="0 0 24 24" fill="none" style={{width:22,height:22}}><rect x="2" y="6" width="20" height="13" rx="3" stroke="currentColor" strokeWidth="1.3"/><path d="M2 10 L22 10" stroke="currentColor" strokeWidth="1.3"/><circle cx="7" cy="15" r="1.5" fill="currentColor"/><path d="M11 15 L17 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>, title:'Choose & Pay Plan', desc:'Select a plan from BASIC to PLATINUM and pay via bKash, Nagad, or bank.', color:'#FCD535' },
              { step:'04', icon: <svg viewBox="0 0 24 24" fill="none" style={{width:22,height:22}}><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5 L8 3 M16 5 L16 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M7 12 L10 15 L17 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'Manufacture Phones', desc:'Log in daily and start virtual manufacturing tasks. Each task takes just 2 minutes!', color:'#F97316' },
              { step:'05', icon: <svg viewBox="0 0 24 24" fill="none" style={{width:22,height:22}}><path d="M4 20 L4 10 L8 10 L8 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 20 L10 6 L14 6 L14 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M16 20 L16 13 L20 13 L20 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M2 20 L22 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>, title:'List on Marketplace', desc:'Your manufactured phones auto-list on the marketplace and sell within 30 minutes.', color:'#A78BFA' },
              { step:'06', icon: <svg viewBox="0 0 24 24" fill="none" style={{width:22,height:22}}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.3"/><path d="M12 7 L12 17 M9 9.5 Q9 7 12 7 Q15 7 15 9.5 Q15 12 12 12 Q9 12 9 14.5 Q9 17 12 17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>, title:'Withdraw Earnings', desc:'Withdraw directly to bKash, Nagad or bank account. Processed within 24 hours.', color:'#4ADE80' },
            ]).map((s, i) => (
              <div key={i} className="ld-step-card" style={{
                padding:'clamp(16px,2vw,20px)', borderRadius:16,
                border:`1px solid ${s.color}20`,
                borderTop:`2.5px solid ${s.color}`,
                background:'linear-gradient(160deg, rgba(8,18,38,0.95), rgba(5,12,28,0.92))',
                position:'relative', overflow:'hidden',
                boxShadow: `0 4px 20px rgba(0,0,0,0.15)`,
              }}>
                {/* Background glow */}
                <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:`radial-gradient(circle, ${s.color}14, transparent 70%)`, pointerEvents:'none' }} />
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{
                    width:42, height:42, borderRadius:13,
                    background:`linear-gradient(135deg, ${s.color}20, ${s.color}08)`,
                    border:`1.5px solid ${s.color}35`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    flexShrink:0, color: s.color,
                  }}>{s.icon}</div>
                  <div style={{ fontFamily:'Space Grotesk', fontSize:10, fontWeight:800, color:s.color, letterSpacing:2, lineHeight:1 }}>
                    {lang === 'bn' ? `ধাপ ${s.step}` : `STEP ${s.step}`}
                  </div>
                </div>
                <div style={{ fontWeight:700, fontSize:'clamp(13px,1.2vw,15px)', marginBottom:6, color:'#EAECEF' }}>{s.title}</div>
                <div style={{ fontSize:'clamp(12px,1vw,13px)', color:'#6a7380', lineHeight:1.75 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          </div>{/* end ld-wrap */}
        </section>

        {/* ── EARNING CALCULATOR ── */}
        <EarningCalculator lang={lang} onGetStarted={onGetStarted} />

        {/* ── PLANS ── */}
        <section className="ld-fade ld-fade-5 ld-section">
          <div className="ld-wrap">
          <div className="ld-sec-head">
            <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#1E5FD4,#6366F1)', display:'inline-block' }} />
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

          {/* ── Boishakhi Special Offer plans ──────────────────────── */}
          <div style={{ marginBottom:24 }}>
            {/* Festival heading */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, padding:'10px 16px', borderRadius:14, background:'linear-gradient(135deg,rgba(192,57,43,.08),rgba(232,136,10,.06))', border:'1px solid rgba(192,57,43,.3)' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <polygon points="11,1 13.5,8 21,8 15,13 17.5,20 11,15.5 4.5,20 7,13 1,8 8.5,8" fill="#F4C430"/>
              </svg>
              <div>
                <div style={{ fontFamily:'Space Grotesk', fontWeight:900, fontSize:'clamp(14px,1.4vw,18px)', background:'linear-gradient(90deg,#C0392B,#E8880A)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  Boishakhi Special Offer
                </div>
                <div style={{ fontSize:'clamp(11px,.95vw,13px)', color:'#707A8A', marginTop:1 }}>
                  Start at a low budget for a limited time
                </div>
              </div>
              <span style={{ marginLeft:'auto', fontSize:10, fontWeight:800, color:'#C0392B', background:'rgba(192,57,43,.08)', border:'1px solid rgba(192,57,43,.3)', borderRadius:20, padding:'3px 10px', whiteSpace:'nowrap' }}>
                  LIMITED OFFER
              </span>
            </div>

            {/* MINI & STANDARD side-by-side */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(260px,100%),1fr))', gap:'clamp(12px,2vw,20px)' }}>

              {/* MINI plan card */}
              <div className="pcard" onClick={onGetStarted}
                style={{ background:'linear-gradient(145deg,#1a1204,#131008)', border:'1.5px solid rgba(192,57,43,.5)', position:'relative', overflow:'hidden' }}
                onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 10px 32px rgba(192,57,43,.25)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.boxShadow='none'; }}
              >
                <div className="pcard-glow" style={{ width:160, height:160, background:'#C0392B', top:-40, right:-40 }} />
                {/* Festival ribbon */}
                <div style={{ position:'absolute', top:12, right:-26, background:'linear-gradient(135deg,#C0392B,#8B1A1A)', color:'#FFF5DC', fontSize:8, fontFamily:'Space Grotesk', fontWeight:800, padding:'4px 32px', transform:'rotate(35deg)', letterSpacing:1 }}>
                  BOISHAKH
                </div>
                <div style={{ marginBottom:8 }}>
                  <div className="pcard-badge" style={{ background:'rgba(245,166,35,.15)', border:'1px solid rgba(245,166,35,.4)', color:'#F5A623', marginBottom:8 }}>
                    ✦ STARTER
                  </div>
                  <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(20px,1.8vw,26px)', fontWeight:900, lineHeight:1, marginBottom:6 }}>MINI</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'Space Grotesk', fontSize:'clamp(24px,2vw,30px)', fontWeight:900, color:'#F5A623', lineHeight:1 }}>{convertCurrency(3000, lang)}</span>
                  </div>
                  <div style={{ fontSize:11, color:'#707A8A', marginTop:2 }}>{t.one_time}</div>
                </div>
                <div className="pcard-feat-sep" />
                <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                  {[
                    `10 Tasks/day · ${convertCurrency(5, lang)} per task`,
                    `${convertCurrency(50, lang)} daily earning`,
                    '3-Level referral',
                    isBn ? 'নিরাপদ উইথড্রয়াল' : 'Safe withdrawal',
                    isBn ? 'সাপোর্ট' : 'Support included',
                  ].map((f,i)=>(
                    <div key={i} className="pcard-feat">
                      <span style={{ width:16, height:16, borderRadius:'50%', background:'rgba(245,166,35,.15)', border:'1px solid rgba(245,166,35,.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <svg width="8" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#F5A623" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
                      </span>
                      {f}
                    </div>
                  ))}
                </div>
                <button onClick={onGetStarted} style={{ width:'100%', marginTop:16, padding:'12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#F5A623,#CC1B1B)', color:'#fff', fontFamily:'Space Grotesk', fontWeight:700, fontSize:15, cursor:'pointer', boxShadow:'0 4px 16px rgba(245,166,35,.35)' }}>
                  Get Started
                </button>
              </div>

              {/* STANDARD plan card */}
              <div className="pcard" onClick={onGetStarted}
                style={{ background:'linear-gradient(145deg,#1a0e00,#130a00)', border:'1.5px solid rgba(232,136,10,.55)', position:'relative', overflow:'hidden' }}
                onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 10px 32px rgba(232,136,10,.28)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.boxShadow='none'; }}
              >
                <div className="pcard-glow" style={{ width:160, height:160, background:'#E8880A', top:-40, right:-40 }} />
                {/* Festival ribbon */}
                <div style={{ position:'absolute', top:12, right:-26, background:'linear-gradient(135deg,#E8880A,#C0392B)', color:'#FFF5DC', fontSize:8, fontFamily:'Space Grotesk', fontWeight:800, padding:'4px 32px', transform:'rotate(35deg)', letterSpacing:1 }}>
                  BOISHAKH
                </div>
                <div style={{ marginBottom:8 }}>
                  <div className="pcard-badge" style={{ background:'rgba(232,136,10,.15)', border:'1px solid rgba(232,136,10,.4)', color:'#E8880A', marginBottom:8 }}>
                    ✦ POPULAR
                  </div>
                  <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(20px,1.8vw,26px)', fontWeight:900, lineHeight:1, marginBottom:6 }}>STANDARD</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'Space Grotesk', fontSize:'clamp(24px,2vw,30px)', fontWeight:900, color:'#E8880A', lineHeight:1 }}>{convertCurrency(6000, lang)}</span>
                  </div>
                  <div style={{ fontSize:11, color:'#707A8A', marginTop:2 }}>{t.one_time}</div>
                </div>
                <div className="pcard-feat-sep" />
                <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                  {[
                    `10 Tasks/day · ${convertCurrency(10, lang)} per task`,
                    `${convertCurrency(100, lang)} daily earning`,
                    '3-Level referral',
                    isBn ? 'স্ট্যান্ডার্ড উইথড্রয়াল' : 'Standard withdrawal',
                    isBn ? 'টিম ড্যাশবোর্ড' : 'Team dashboard',
                    isBn ? 'প্রায়রিটি সাপোর্ট' : 'Priority support',
                  ].map((f,i)=>(
                    <div key={i} className="pcard-feat">
                      <span style={{ width:16, height:16, borderRadius:'50%', background:'rgba(232,136,10,.15)', border:'1px solid rgba(232,136,10,.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <svg width="8" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#E8880A" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
                      </span>
                      {f}
                    </div>
                  ))}
                </div>
                <button onClick={onGetStarted} style={{ width:'100%', marginTop:16, padding:'12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#E8880A,#C0392B)', color:'#fff', fontFamily:'Space Grotesk', fontWeight:700, fontSize:15, cursor:'pointer', boxShadow:'0 4px 16px rgba(232,136,10,.35)' }}>
                  Get Started
                </button>
              </div>

            </div>
          </div>

          {/* ── Regular plans ────────────────────────────────────────── */}
          <div style={{ marginBottom:10, color:'#707A8A', fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase' }}>
            {isBn ? '— সকল প্ল্যান —' : '— All Plans —'}
          </div>
          <div className="ld-plans-grid">

            {/* BASIC */}
            <div className="pcard" onClick={onGetStarted}
              style={{ background:'linear-gradient(145deg,#0f1e1a,#111820)', border:'1px solid rgba(30,95,212,.3)' }}
              onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 10px 32px rgba(30,95,212,.2)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow='none'; }}
            >
              <div className="pcard-glow" style={{ width:160, height:160, background:'#1E5FD4', top:-40, right:-40 }} />
              <div style={{ marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <div className="pcard-badge" style={{ background:'rgba(30,95,212,.15)', border:'1px solid rgba(30,95,212,.3)', color:'#1E5FD4' }}>
                    {t.plan_basic_badge}
                  </div>
                  <span className="pcard-save" style={{ background:'rgba(30,95,212,.15)', color:'#1E5FD4' }}>SAVE {convertCurrency(2200, lang)}</span>
                </div>
                <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(20px,1.8vw,26px)', fontWeight:900, lineHeight:1, marginBottom:6 }}>BASIC</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'Space Grotesk', fontSize:'clamp(24px,2vw,30px)', fontWeight:900, color:'#1E5FD4', lineHeight:1 }}>{convertCurrency(12800, lang)}</span>
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
                    <span style={{ width:16, height:16, borderRadius:'50%', background:'rgba(30,95,212,.15)', border:'1px solid rgba(30,95,212,.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="8" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#1E5FD4" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
                    </span>
                    {f}
                  </div>
                ))}
              </div>
              <button onClick={onGetStarted} style={{ width:'100%', marginTop:16, padding:'12px', borderRadius:10, border:'1.5px solid rgba(30,95,212,.5)', background:'rgba(30,95,212,.08)', color:'#1E5FD4', fontFamily:'Space Grotesk', fontWeight:700, fontSize:15, cursor:'pointer', transition:'background .2s' }}
                onMouseEnter={e=>{ e.target.style.background='rgba(30,95,212,.18)'; }}
                onMouseLeave={e=>{ e.target.style.background='rgba(30,95,212,.08)'; }}
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

        {/* ── TESTIMONIALS ── */}
        <TestimonialsSection lang={lang} />

        {/* ── FAQ ── */}
        <FAQSection lang={lang} />

        {/* ── TRUST SECTION ── */}
        <section className="ld-fade ld-fade-5 ld-section">
          <div className="ld-wrap">
          <div className="ld-sec-head">
            <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#1E5FD4,#6366F1)', display:'inline-block' }} />
            <span className="ld-sec-title">{t.trust_title}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
            {t.trust_badges.map((b, i) => (
              <div key={i} className="ld-trust-badge">
                <span style={{ flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:10, background:'rgba(30,95,212,.08)' }}>{(() => { const IC = Icons[b.iconKey]; return IC ? <IC size={20} /> : null; })()}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:'clamp(13px,1.2vw,16px)' }}>{b.title}</div>
                  <div style={{ fontSize:'clamp(12px,1vw,14px)', color:'#707A8A', marginTop:2, lineHeight:1.5 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
          </div>{/* end ld-wrap */}
        </section>

        {/* ── CERTIFICATIONS & COMPLIANCE ── */}
        <section className="ld-fade ld-fade-5 ld-section">
          <div className="ld-wrap">
          <div className="ld-sec-head">
            <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#1E5FD4,#6366F1)', display:'inline-block' }} />
            <span className="ld-sec-title">{t.cert_title}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
            {t.cert_badges.map((c, i) => (
              <div key={i} style={{ borderRadius:14, border:'1px solid rgba(43,49,57,0.9)', background:'rgba(22,26,37,.7)', padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 }}>
                <img src={c.logo} alt={c.title} style={{ width:'100%', height:50, objectFit:'contain', borderRadius:6 }} />
                <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:13, color:'#EAECEF' }}>{c.title}</div>
                <div style={{ fontSize:11, color:'#1E5FD4', fontWeight:600 }}>{c.num}</div>
                <div style={{ fontSize:11, color:'#707A8A', lineHeight:1.5 }}>{c.body}</div>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* ── UK PARTNERS ── */}
        <section className="ld-fade ld-fade-5 ld-section">
          <div className="ld-wrap">
          <div className="ld-sec-head">
            <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#1E5FD4,#6366F1)', display:'inline-block' }} />
            <span className="ld-sec-title">{t.partner_title}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
            {t.partner_cards.map((p, i) => (
              <div key={i} style={{ borderRadius:14, border:'1px solid rgba(43,49,57,0.9)', background:'rgba(22,26,37,.7)', padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 }}>
                <img src={p.logo} alt={p.name} style={{ width:'100%', height:50, objectFit:'contain', borderRadius:6 }} />
                <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:13, color:'#EAECEF' }}>{p.name}</div>
                <div style={{ fontSize:11, color:'#707A8A', lineHeight:1.5 }}>{p.desc}</div>
                <div style={{ marginTop:2, display:'inline-flex', alignItems:'center', padding:'3px 8px', borderRadius:20, background:'rgba(30,95,212,0.1)', border:'1px solid rgba(30,95,212,0.25)', fontSize:11, color:'#1E5FD4', fontWeight:600, alignSelf:'flex-start' }}>{p.label}</div>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* ── LEGAL DOCUMENTS ── */}
        <section className="ld-fade ld-fade-6 ld-section">
          <div className="ld-wrap">
          <div className="ld-sec-head">
            <span style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#1E5FD4,#6366F1)', display:'inline-block' }} />
            <span className="ld-sec-title">{t.legal_title}</span>
          </div>
          <div style={{ borderRadius:14, border:'1px solid rgba(43,49,57,0.9)', background:'rgba(22,26,37,.7)', padding:'16px 16px 12px', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
              <span style={{ flexShrink:0 }}><Icons.Document size={24} /></span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{t.legal_heading}</div>
                <p style={{ fontSize:13, color:'#707A8A', lineHeight:1.7, marginBottom:12 }}>
                  {t.legal_body}
                </p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button className="ld-legal-btn" onClick={() => setLegalDoc(legalData.terms)} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid rgba(43,49,57,0.9)', background:'none', color:'#707A8A', cursor:'pointer', fontSize:11, fontFamily:'Inter,sans-serif', transition:'all .2s' }}
                    onMouseEnter={e=>{ e.target.style.borderColor='rgba(30,95,212,.4)'; e.target.style.color='#1E5FD4'; }}
                    onMouseLeave={e=>{ e.target.style.borderColor='rgba(43,49,57,0.9)'; e.target.style.color='#707A8A'; }}
                  >
                    {t.terms_btn}
                  </button>
                  <button className="ld-legal-btn" onClick={() => setLegalDoc(legalData.privacy)} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid rgba(43,49,57,0.9)', background:'none', color:'#707A8A', cursor:'pointer', fontSize:11, fontFamily:'Inter,sans-serif', transition:'all .2s' }}
                    onMouseEnter={e=>{ e.target.style.borderColor='rgba(30,95,212,.4)'; e.target.style.color='#1E5FD4'; }}
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
              <strong style={{ color:'rgba(240,185,11,.9)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icons.AlertTriangle size={14} color="rgba(240,185,11,.9)" /> Disclaimer:</strong> {t.disclaimer}
            </div>
          </div>
          </div>{/* end ld-wrap */}
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="ld-section">
          <div className="ld-wrap">
          <div style={{ borderRadius:18, background:'linear-gradient(135deg, rgba(30,95,212,.1), rgba(99,102,241,.08))', border:'1px solid rgba(30,95,212,.2)', padding:'clamp(20px,4vw,40px) clamp(20px,4vw,48px)', textAlign:'center' }}>
            <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(20px,4vw,28px)', fontWeight:900, marginBottom:10 }}>
              {t.cta_title}
            </div>
            <p style={{ fontSize:'clamp(13px,1.5vw,15px)', color:'#707A8A', marginBottom:20, lineHeight:1.7, maxWidth:480, margin:'0 auto 20px' }}>
              {t.cta_body}
            </p>
            <button
              onClick={onGetStarted}
              style={{ padding:'14px 48px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#1E5FD4,#1a8f75)', color:'#fff', fontFamily:'Space Grotesk', fontWeight:700, fontSize:'clamp(14px,2vw,16px)', cursor:'pointer', boxShadow:'0 4px 24px rgba(30,95,212,.4)' }}
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
              <span style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:15 }}>PHONE<span style={{color:'#1E5FD4'}}>CRAFT</span></span>
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:16, marginBottom:12 }}>
              <button className="ld-legal-btn" onClick={() => setLegalDoc(legalData.terms)} style={{ padding:'4px 0', border:'none', background:'none', color:'#707A8A', cursor:'pointer', fontSize:13, fontFamily:'Inter,sans-serif' }}>{t.footer_terms}</button>
              <span style={{ color:'rgba(43,49,57,.9)' }}>|</span>
              <button className="ld-legal-btn" onClick={() => setLegalDoc(legalData.privacy)} style={{ padding:'4px 0', border:'none', background:'none', color:'#707A8A', cursor:'pointer', fontSize:13, fontFamily:'Inter,sans-serif' }}>{t.footer_privacy}</button>
            </div>
            {setLang && (
              <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:12 }}>
                <button onClick={()=>setLang('en')} style={{ padding:'5px 14px', borderRadius:6, border:'none', background: lang==='en' ? '#1E5FD4' : 'rgba(30,95,212,.12)', color: lang==='en' ? '#fff' : '#1E5FD4', fontFamily:'Space Grotesk', fontWeight:700, fontSize:11, cursor:'pointer', transition:'all .2s' }}>EN</button>
                <button onClick={()=>setLang('bn')} style={{ padding:'5px 14px', borderRadius:6, border:'none', background: lang==='bn' ? '#1E5FD4' : 'rgba(30,95,212,.12)', color: lang==='bn' ? '#fff' : '#1E5FD4', fontFamily:'Space Grotesk', fontWeight:700, fontSize:11, cursor:'pointer', transition:'all .2s' }}>বাং</button>
              </div>
            )}
            <div style={{ fontSize:12, color:'rgba(112,122,138,.5)', marginBottom:4 }}>
              {t.footer_copy}
            </div>
            <div style={{ fontSize:11, color:'rgba(112,122,138,.35)' }}>
              {t.footer_address}
            </div>
          </div>
        </footer>

      </div>

      {/* ── Legal Modal ── */}
      {legalDoc && <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />}
    </>
  );
}
