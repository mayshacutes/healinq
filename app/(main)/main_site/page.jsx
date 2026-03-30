"use client";

import { useState, useEffect, useRef } from "react";

// ─── DATA ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: "konsultasi",
    emoji: "🧠",
    title: "Konsultasi",
    color: "pink",
    href: "/consultation",
    desc: "Fitur Konsultasi menyediakan layanan pendampingan bersama psikolog atau konselor profesional secara online. Pengguna dapat memilih jadwal sesi, menyampaikan keluhan secara privat, serta mendapatkan arahan dan strategi penanganan yang sesuai dengan kondisi mereka. Layanan ini dirancang untuk memberikan dukungan emosional yang aman, nyaman, dan rahasia.",
  },
  {
    id: "selfhealing",
    emoji: "🌿",
    title: "Self-Healing",
    color: "teal",
    href: "/journaling",
    desc: "Fitur Self-Healing Tools berupa journaling membantu pengguna mengekspresikan pikiran dan perasaan secara tertulis, mood tracker untuk memantau perubahan emosi harian, serta afirmasi positif. Fitur ini bertujuan membantu pengguna memahami emosi, mengurangi stres, dan membangun kesadaran diri secara mandiri.",
  },
  {
    id: "fyp",
    emoji: "✨",
    title: "FYP",
    color: "lav",
    href: "/fyp",
    desc: "Fitur FYP (Find Your Passion) membantu pengguna mengenali minat, potensi, dan tujuan hidup melalui tes minat, kuis refleksi diri, serta rekomendasi aktivitas yang sesuai dengan kepribadian mereka. Fitur ini dirancang untuk meningkatkan motivasi, rasa percaya diri, dan arah hidup yang lebih jelas sebagai bagian dari kesehatan mental yang menyeluruh.",
  },
];

const TESTIMONIALS = [
  { name: "Putri Ayu", role: "Mahasiswa, Jakarta", emoji: "🌸", color: "pink", stars: 5, text: "HealinQ benar-benar mengubah cara aku memandang kesehatan mental. Konsultasinya mudah dan psikolognya sangat membantu. Sekarang aku lebih bisa mengelola kecemasan sehari-hari." },
  { name: "Rizal Ahmad", role: "Karyawan, Surabaya", emoji: "🌿", color: "teal", stars: 5, text: "Fitur journaling dan mood tracker-nya luar biasa! Aku jadi lebih aware dengan perasaan sendiri. Booking konsultasinya juga super mudah, tinggal beberapa klik saja." },
  { name: "Sari Dewi", role: "Ibu Rumah Tangga, Bandung", emoji: "🌻", color: "lav", stars: 5, text: "Awalnya ragu, tapi setelah coba fitur FYP aku menemukan passion baru. HealinQ bukan sekadar platform kesehatan, tapi teman perjalanan hidup yang sesungguhnya." },
  { name: "Budi Santoso", role: "Wirausaha, Yogyakarta", emoji: "💙", color: "teal", stars: 5, text: "Platform yang sangat inklusif dan aman. Aku merasa nyaman berbagi tanpa takut dihakimi. Tim psikolognya profesional dan responsif. Sangat direkomendasikan!" },
];

const MISI = [
  "Memberikan Pertolongan Pertama Kesehatan Mental",
  "Meningkatkan Literasi Kesehatan Mental",
  "Mempermudah Akses Konsultasi Profesional",
  "Menciptakan Ruang Aman dan Suportif",
  "Mendukung Proses Pengembangan Diri",
];

// ─── STYLES ────────────────────────────────────────────────────────────────────

const css = `
   @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

  :root {
    --pink: #F9A8C9;
    --pink-light: #FDE8F3;
    --pink-mid: #F472B6;
    --pink-dark: #DB2777;
    --teal: #4ECDC4;
    --teal-light: #CFFAFA;
    --teal-dark: #2A9D8F;
    --lav: #E9D5FF;
    --lav-mid: #A855F7;
    --lav-dark: #7C3AED;
    --yellow: #FEF08A;
    --yellow-mid: #EAB308;
    --soft-bg: #F0F9FF;
    --soft-pink: #FFF5FB;
    --white: #FFFFFF;
    --text-dark: #1E293B;
    --text-mid: #64748B;
    --text-light: #94A3B8;
    --card-shadow: 0 8px 32px rgba(100,116,139,.10);
    --r: 24px;
    --r-sm: 14px;
  }

  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Poppins', sans-serif;
    background: var(--soft-bg);
    color: var(--text-dark);
    overflow-x: hidden;
  }

  /* ── NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(249,168,201,0.25);
    padding: 0 60px;
    display: flex; align-items: center; justify-content: space-between;
    height: 68px;
    transition: box-shadow 0.3s;
  }
  .nav.scrolled { box-shadow: 0 4px 24px rgba(244,114,182,0.10); }
  .nav-logo { height: 38px; width: auto; object-fit: contain; }
  .nav-links { display: flex; gap: 36px; list-style: none; }
  .nav-links a {
    text-decoration: none; font-weight: 700; font-size: 0.92rem;
    color: var(--text-mid); transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--pink-mid); }
  .nav-cta {
    background: linear-gradient(135deg, var(--pink-mid), #DB2777);
    color: white; border: none; border-radius: 50px; text-decoration: none;
    padding: 10px 26px; font-family: 'Poppins', sans-serif;
    font-weight: 700; font-size: 0.88rem; cursor: pointer;
    box-shadow: 0 4px 14px rgba(244,114,182,0.35);
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex; align-items: center; gap: 8px;
  }
  .nav-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(244,114,182,0.45); }

  /* ── HERO ── */
  .hero {
    min-height: 100vh;
    background: linear-gradient(160deg, #e0f2fe 0%, #fdf2f8 45%, #f0fdf4 100%);
    display: flex; align-items: center;
    padding: 100px 60px 60px;
    position: relative; overflow: hidden;
  }
  .hero-blob1 {
    position: absolute; top: -80px; right: -80px;
    width: 480px; height: 480px; border-radius: 50%;
    background: radial-gradient(circle, rgba(244,114,182,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-blob2 {
    position: absolute; bottom: -60px; left: -60px;
    width: 360px; height: 360px; border-radius: 50%;
    background: radial-gradient(circle, rgba(78,205,196,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-blob3 {
    position: absolute; top: 40%; left: 40%;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-inner {
    max-width: 1200px; margin: 0 auto; width: 100%;
    display: flex; align-items: center; gap: 60px;
    position: relative; z-index: 1;
  }
  .hero-text { flex: 1; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: white; border: 1.5px solid var(--pink-light);
    color: var(--pink-dark); border-radius: 50px;
    padding: 6px 16px; font-size: 0.78rem; font-weight: 700;
    margin-bottom: 28px;
    box-shadow: 0 2px 12px rgba(244,114,182,0.12);
  }
  .hero-badge .dot {
    width: 7px; height: 7px; background: var(--pink-mid);
    border-radius: 50%; animation: pulse 1.8s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.4)} }
  .hero-title {
    font-family: 'Nunito', sans-serif; font-weight: 900;
    font-size: 3.6rem; line-height: 1.08;
    color: var(--text-dark); margin-bottom: 22px;
  }
  .hero-title .hl-pink { color: var(--pink-mid); }
  .hero-title .hl-teal { color: var(--teal-dark); }
  .hero-desc {
    font-size: 1.05rem; color: var(--text-mid);
    line-height: 1.75; max-width: 500px; margin-bottom: 40px;
  }
  .hero-btns { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 48px; }
  .btn-primary {
    background: linear-gradient(135deg, var(--pink-mid), #DB2777);
    color: white; border: none; border-radius: 50px; text-decoration: none;
    padding: 14px 32px; font-family: 'Poppins', sans-serif;
    font-weight: 700; font-size: 1rem; cursor: pointer; display: inline-block;
    box-shadow: 0 6px 20px rgba(244,114,182,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(244,114,182,0.5); }
  .btn-outline {
    background: white; color: var(--teal-dark);
    border: 2px solid var(--teal); border-radius: 50px;
    padding: 13px 30px; font-family: 'Poppins', sans-serif;
    font-weight: 700; font-size: 1rem; cursor: pointer;
    transition: background 0.2s;
  }
  .btn-outline:hover { background: var(--teal-light); }
  .hero-stats { display: flex; gap: 32px; }
  .hstat { text-align: center; }
  .hstat-num {
    font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1.8rem;
    background: linear-gradient(135deg, var(--pink-mid), var(--teal-dark));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hstat-label { font-size: 0.78rem; color: var(--text-light); font-weight: 600; margin-top: 2px; }

  .hero-visual { flex: 0 0 420px; position: relative; }
  .hero-card-main {
    background: white; border-radius: var(--r);
    padding: 32px; box-shadow: 0 20px 60px rgba(244,114,182,0.15);
    position: relative; overflow: hidden;
    animation: float 5s ease-in-out infinite;
  }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  .hero-card-main::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px;
    background: linear-gradient(90deg, var(--pink-mid), var(--teal), var(--lav-mid));
  }
  .hcard-top { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
  .hcard-av {
    width: 56px; height: 56px; border-radius: 50%;
    background: linear-gradient(135deg, var(--pink-light), var(--teal-light));
    display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
    border: 3px solid white; box-shadow: 0 4px 14px rgba(244,114,182,0.2);
  }
  .hcard-name { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1rem; color: var(--text-dark); }
  .hcard-sub { font-size: 0.78rem; color: var(--text-light); font-weight: 600; }
  .hcard-mood {
    background: var(--soft-pink); border-radius: var(--r-sm);
    padding: 14px 16px; margin-bottom: 16px;
  }
  .hcard-mood-label { font-size: 0.72rem; font-weight: 700; color: var(--text-light); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .mood-dots { display: flex; gap: 8px; }
  .mood-dot {
    flex: 1; height: 8px; border-radius: 50px;
    transition: transform 0.3s;
  }
  .mood-dot:hover { transform: scaleY(2); }
  .hcard-tags { display: flex; gap: 8px; flex-wrap: wrap; }
  .hcard-tag {
    border-radius: 50px; padding: 4px 12px;
    font-size: 0.75rem; font-weight: 700;
  }
  .hcard-tag.pink { background: var(--pink-light); color: var(--pink-dark); }
  .hcard-tag.teal { background: var(--teal-light); color: var(--teal-dark); }
  .hcard-tag.lav  { background: var(--lav); color: var(--lav-dark); }

  .hero-floater {
    position: absolute; background: white; border-radius: 16px;
    padding: 10px 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.10);
    font-size: 0.78rem; font-weight: 700; color: var(--text-dark);
    display: flex; align-items: center; gap: 8px;
    animation: floatSmall 3s ease-in-out infinite;
  }
  @keyframes floatSmall { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  .hero-floater.f1 { top: -20px; right: -30px; animation-delay: 0.5s; }
  .hero-floater.f2 { bottom: 20px; left: -40px; animation-delay: 1.2s; }
  .floater-dot { width: 10px; height: 10px; border-radius: 50%; }

  /* ── SECTION COMMON ── */
  .section { padding: 100px 60px; }
  .section-inner { max-width: 1200px; margin: 0 auto; }
  .section-tag {
    display: inline-block;
    font-size: 0.75rem; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: var(--teal-dark);
    background: var(--teal-light); border-radius: 50px;
    padding: 4px 14px; margin-bottom: 16px;
  }
  .section-title {
    font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 2.4rem;
    color: var(--text-dark); line-height: 1.15; margin-bottom: 18px;
  }
  .section-title .hl { color: var(--pink-mid); }
  .section-desc { font-size: 1rem; color: var(--text-mid); line-height: 1.75; max-width: 580px; }

  /* ── ABOUT ── */
  .about { background: white; }
  .about-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: center;
  }
  .about-visual {
    position: relative;
  }
  .about-img-wrap {
    width: 100%; aspect-ratio: 1;
    background: linear-gradient(135deg, var(--pink-light) 0%, var(--teal-light) 100%);
    border-radius: 40px;
    display: flex; align-items: center; justify-content: center;
    font-size: 7rem; position: relative; overflow: hidden;
    box-shadow: 0 24px 60px rgba(244,114,182,0.15);
  }
  .about-img-wrap::before {
    content: ''; position: absolute;
    top: -40px; right: -40px;
    width: 180px; height: 180px;
    background: rgba(244,114,182,0.12); border-radius: 50%;
  }
  .about-img-wrap::after {
    content: ''; position: absolute;
    bottom: -30px; left: -30px;
    width: 130px; height: 130px;
    background: rgba(78,205,196,0.12); border-radius: 50%;
  }
  .about-logo-img { width: 65%; object-fit: contain; position: relative; z-index: 1; }
  .about-deco {
    position: absolute; background: white; border-radius: 16px;
    padding: 12px 16px; box-shadow: 0 8px 28px rgba(0,0,0,0.10);
    font-weight: 700; font-size: 0.82rem;
    display: flex; align-items: center; gap: 8px;
  }
  .about-deco.d1 { top: -16px; right: -16px; color: var(--teal-dark); }
  .about-deco.d2 { bottom: -16px; left: -16px; color: var(--pink-dark); }

  .about-text .section-tag { background: var(--pink-light); color: var(--pink-dark); }
  .vm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 32px; }
  .vm-card {
    border-radius: var(--r); padding: 24px;
    position: relative; overflow: hidden;
  }
  .vm-card.visi { background: linear-gradient(135deg, var(--teal-light), #e0f2fe); }
  .vm-card.misi { background: linear-gradient(135deg, var(--pink-light), var(--lav)); }
  .vm-title {
    font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1rem;
    letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px;
  }
  .vm-card.visi .vm-title { color: var(--teal-dark); }
  .vm-card.misi .vm-title { color: var(--pink-dark); }
  .vm-card.visi p { font-size: 0.88rem; color: var(--text-mid); line-height: 1.7; }
  .misi-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .misi-list li {
    display: flex; align-items: flex-start; gap: 8px;
    font-size: 0.82rem; color: var(--text-mid); font-weight: 600; line-height: 1.5;
  }
  .misi-num {
    flex-shrink: 0; width: 20px; height: 20px;
    background: var(--pink-mid); color: white;
    border-radius: 50%; font-size: 0.65rem; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    margin-top: 1px;
  }

  /* ── FEATURES ── */
  .features { background: linear-gradient(160deg, var(--soft-pink) 0%, #f0fdf4 100%); }
  .features-header { text-align: center; margin-bottom: 60px; }
  .features-header .section-desc { margin: 0 auto; }
  .feat-list { display: flex; flex-direction: column; gap: 28px; }
  .feat-row {
    background: white; border-radius: var(--r);
    padding: 40px 48px; box-shadow: var(--card-shadow);
    display: flex; align-items: flex-start; gap: 36px;
    transition: transform 0.3s, box-shadow 0.3s;
    position: relative; overflow: hidden;
    cursor: pointer;
  }
  .feat-row:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.10); }
  .feat-row::before {
    content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 5px;
  }
  .feat-row.pink::before { background: linear-gradient(180deg, var(--pink-mid), var(--pink)); }
  .feat-row.teal::before { background: linear-gradient(180deg, var(--teal-dark), var(--teal)); }
  .feat-row.lav::before  { background: linear-gradient(180deg, var(--lav-mid), var(--lav)); }
  .feat-icon-wrap {
    flex-shrink: 0; width: 72px; height: 72px; border-radius: 20px;
    display: flex; align-items: center; justify-content: center; font-size: 2.2rem;
  }
  .feat-icon-wrap.pink   { background: var(--pink-light); }
  .feat-icon-wrap.teal   { background: var(--teal-light); }
  .feat-icon-wrap.lav    { background: var(--lav); }
  .feat-content { flex: 1; }
  .feat-title {
    font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1.3rem;
    color: var(--text-dark); margin-bottom: 10px;
  }
  .feat-desc { font-size: 0.9rem; color: var(--text-mid); line-height: 1.75; margin-bottom: 18px; }
  .feat-btn {
    display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
    font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 0.85rem;
    border: none; border-radius: 50px; padding: 9px 22px; cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .feat-btn:hover { transform: translateX(4px); }
  .feat-btn.pink { background: var(--pink-light); color: var(--pink-dark); }
  .feat-btn.teal { background: var(--teal-light); color: var(--teal-dark); }
  .feat-btn.lav  { background: var(--lav); color: var(--lav-dark); }

  /* ── TESTIMONIALS ── */
  .testimonials { background: white; }
  .testi-header { text-align: center; margin-bottom: 52px; }
  .testi-header .section-desc { margin: 0 auto; }
  .testi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
  .testi-card {
    background: var(--soft-bg); border-radius: var(--r);
    padding: 28px 26px; border: 1.5px solid transparent;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
    cursor: pointer;
  }
  .testi-card:hover {
    border-color: var(--pink-light);
    box-shadow: 0 12px 36px rgba(244,114,182,0.12);
    transform: translateY(-3px);
  }
  .testi-stars { color: var(--yellow-mid); font-size: 0.85rem; margin-bottom: 14px; letter-spacing: 2px; }
  .testi-text {
    font-size: 0.92rem; color: var(--text-mid); line-height: 1.75;
    margin-bottom: 20px; font-style: italic;
  }
  .testi-text::before { content: '"'; font-size: 1.4rem; color: var(--pink); line-height: 0; vertical-align: -0.3em; margin-right: 2px; }
  .testi-text::after  { content: '"'; font-size: 1.4rem; color: var(--pink); line-height: 0; vertical-align: -0.3em; margin-left: 2px; }
  .testi-user { display: flex; align-items: center; gap: 12px; }
  .testi-av {
    width: 42px; height: 42px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
    flex-shrink: 0;
  }
  .testi-av.pink   { background: var(--pink-light); }
  .testi-av.teal   { background: var(--teal-light); }
  .testi-av.lav    { background: var(--lav); }
  .testi-name { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 0.9rem; color: var(--text-dark); }
  .testi-role { font-size: 0.75rem; color: var(--text-light); font-weight: 600; }

  /* ── CTA BANNER ── */
  .cta {
    background: linear-gradient(135deg, var(--pink-mid) 0%, #9333EA 50%, var(--teal-dark) 100%);
    padding: 80px 60px; text-align: center; color: white;
    position: relative; overflow: hidden;
  }
  .cta::before {
    content: ''; position: absolute; top: -80px; left: -80px;
    width: 300px; height: 300px;
    background: rgba(255,255,255,0.07); border-radius: 50%;
  }
  .cta::after {
    content: ''; position: absolute; bottom: -60px; right: -60px;
    width: 240px; height: 240px;
    background: rgba(255,255,255,0.05); border-radius: 50%;
  }
  .cta-inner { max-width: 680px; margin: 0 auto; position: relative; z-index: 1; }
  .cta-title {
    font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 2.6rem;
    line-height: 1.15; margin-bottom: 18px;
  }
  .cta-desc { font-size: 1rem; opacity: 0.9; line-height: 1.7; margin-bottom: 36px; }
  .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .btn-white {
    background: white; color: var(--pink-dark); text-decoration: none;
    border: none; border-radius: 50px; display: inline-block;
    padding: 14px 32px; font-family: 'Poppins', sans-serif;
    font-weight: 700; font-size: 1rem; cursor: pointer;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    transition: transform 0.2s;
  }
  .btn-white:hover { transform: translateY(-3px); }
  .btn-ghost-w {
    background: rgba(255,255,255,0.15); color: white;
    border: 2px solid rgba(255,255,255,0.5); border-radius: 50px;
    padding: 13px 30px; font-family: 'Poppins', sans-serif;
    font-weight: 700; font-size: 1rem; cursor: pointer;
    transition: background 0.2s;
  }
  .btn-ghost-w:hover { background: rgba(255,255,255,0.25); }

  /* ── FOOTER ── */
  .footer { background: #1E293B; color: white; padding: 56px 60px 32px; }
  .footer-inner { max-width: 1200px; margin: 0 auto; }
  .footer-simple {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 60px; margin-bottom: 40px; align-items: start;
  }
  .footer-logo { height: 36px; object-fit: contain; margin-bottom: 16px; filter: brightness(0) invert(1); display: block; }
  .footer-logo-text { font-family:'Nunito',sans-serif;font-weight:900;font-size:1.4rem;color:#F472B6;margin-bottom:14px; }
  .footer-tagline { font-size: 0.88rem; color: #94A3B8; line-height: 1.7; max-width: 320px; }
  .footer-col-title {
    font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 0.9rem;
    color: white; margin-bottom: 18px; text-transform: uppercase; letter-spacing: 1px;
  }
  .footer-socials-list { display: flex; flex-direction: column; gap: 12px; }
  .fsocial-row {
    display: flex; align-items: center; gap: 12px;
    text-decoration: none; color: #94A3B8; font-size: 0.88rem; font-weight: 600;
    transition: color 0.2s;
  }
  .fsocial-row:hover { color: white; }
  .fsocial-icon {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 1rem;
  }
  .footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  }
  .footer-copy { font-size: 0.82rem; color: #64748B; font-weight: 600; }
  .footer-badges { display: flex; gap: 8px; }
  .fbadge { background: rgba(255,255,255,0.06); border-radius: 50px; padding: 4px 12px; font-size: 0.72rem; font-weight: 700; color: #94A3B8; }

  /* ── SCROLL REVEAL ── */
  .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }
`;

// ─── COMPONENT ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const revealRefs = useRef([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRef = (el) => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); };

  const moodColors = ["#F472B6","#FB923C","#FBBF24","#34D399","#60A5FA","#A78BFA","#F472B6"];

  return (
    <>
      <style>{css}</style>

      {/* ── NAV ── */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <img src="/images/logo.png" alt="HealinQ" className="nav-logo" />
        <ul className="nav-links">
          <li><a href="#about">Tentang</a></li>
          <li><a href="#features">Layanan</a></li>
          <li><a href="#testimonials">Testimoni</a></li>
          <li><a href="#contact">Kontak</a></li>
        </ul>
        <a href="/auth/signup" className="nav-cta">
          <span></span> Log In / Sign Up
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-blob1" />
        <div className="hero-blob2" />
        <div className="hero-blob3" />
        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="dot" />
              Platform Kesehatan Mental #1 Indonesia
            </div>
            <h1 className="hero-title">
              Ruang Aman untuk<br />
              <span className="hl-pink">Tumbuh</span>,{" "}
              <span className="hl-teal">Sembuh</span>,<br />
              dan Berkembang 🌱
            </h1>
            <p className="hero-desc">
              HealinQ hadir sebagai pendamping digital kesehatan mental yang hangat, inklusif, dan terpercaya. Dari konsultasi profesional hingga self-healing tools — semua ada di sini.
            </p>
            <div className="hero-btns">
              <a href="/auth/signup" className="btn-primary">Mulai Sekarang ✨</a>
            </div>
            <div className="hero-stats">
              {[["10+","Psikolog & Konselor"],["98%","Tingkat Kepuasan"],["24/7","Layanan Tersedia"]].map(([num, lbl]) => (
                <div className="hstat" key={lbl}>
                  <div className="hstat-num">{num}</div>
                  <div className="hstat-label">{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card-main">
              <div className="hcard-top">
                <div className="hcard-av">🐰</div>
                <div>
                  <div className="hcard-name">Halo, Buddy! 👋</div>
                  <div className="hcard-sub">Bagaimana perasaanmu hari ini?</div>
                </div>
              </div>
              <div className="hcard-mood">
                <div className="hcard-mood-label">Mood Tracker Minggu Ini</div>
                <div className="mood-dots">
                  {moodColors.map((c, i) => (
                    <div key={i} className="mood-dot" style={{ background: c, height: `${20 + Math.sin(i * 1.2) * 12}px`, borderRadius: "4px" }} />
                  ))}
                </div>
              </div>
              <div className="hcard-tags">
                <span className="hcard-tag pink">😊 Journaling</span>
                <span className="hcard-tag teal">🧘 Meditasi</span>
                <span className="hcard-tag lav">💬 Konsultasi</span>
                <span className="hcard-tag pink">🍀 Happiness Jar</span>
              </div>
            </div>
            <div className="hero-floater f1">
              <div className="floater-dot" style={{background:"#22C55E"}} />
              Psikolog Online Sekarang
            </div>
            <div className="hero-floater f2">
              <span>🔥</span> 14 Hari Streak!
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="section about" id="about">
        <div className="section-inner">
          <div className="about-grid">
            <div className="about-visual" ref={addRef}>
              <div className="about-img-wrap reveal" ref={addRef}>
                <img src="/images/logo.png" alt="HealinQ" className="about-logo-img"
                  onError={e => { e.target.style.display='none'; e.target.parentNode.style.fontSize='6rem'; e.target.parentNode.innerHTML='🌸'; }}
                />
              </div>
            </div>

            <div className="about-text">
              <span className="section-tag">Tentang Kami</span>
              <h2 className="section-title reveal" ref={addRef}>
                Kami hadir untuk <span className="hl">mendampingi</span> perjalananmu
              </h2>
              <p className="section-desc reveal" ref={addRef}>
                HealinQ adalah platform digital pendamping kesehatan mental yang menyediakan layanan edukasi, konsultasi dengan psikolog, serta berbagai self-care tools interaktif. Website ini membantu pengguna mengenali, memahami, dan mengelola kondisi emosional mereka secara mandiri maupun dengan dukungan profesional, dalam ekosistem yang aman dan mudah diakses.
              </p>
              <div className="vm-grid reveal" ref={addRef}>
                <div className="vm-card visi">
                  <div className="vm-title">✦ Visi</div>
                  <p>Menjadi platform pendamping kesehatan mental terdepan yang menciptakan ekosistem digital aman dan suportif bagi setiap individu untuk tumbuh, memahami diri, dan meraih kesejahteraan emosional.</p>
                </div>
                <div className="vm-card misi">
                  <div className="vm-title">✦ Misi</div>
                  <ol className="misi-list">
                    {MISI.map((m, i) => (
                      <li key={i}><span className="misi-num">{i+1}</span>{m}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section features" id="features">
        <div className="section-inner">
          <div className="features-header">
            <span className="section-tag">Layanan Kami</span>
            <h2 className="section-title reveal" ref={addRef}>
              Semua yang kamu butuhkan,<br />ada di <span className="hl">HealinQ</span> 💫
            </h2>
            <p className="section-desc reveal" ref={addRef}>
              Tiga pilar layanan utama yang dirancang untuk mendampingi perjalanan kesehatan mentalmu secara holistik.
            </p>
          </div>
          <div className="feat-list">
            {FEATURES.map((f) => (
              <div key={f.id} className={`feat-row ${f.color} reveal`} ref={addRef}>
                <div className={`feat-icon-wrap ${f.color}`}>
                  {f.emoji}
                </div>
                <div className="feat-content">
                  <div className="feat-title">{f.title}</div>
                  <p className="feat-desc">{f.desc}</p>
                  <a href={f.href} className={`feat-btn ${f.color}`}>See More →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section testimonials" id="testimonials">
        <div className="section-inner">
          <div className="testi-header">
            <span className="section-tag">Cerita Pengguna</span>
            <h2 className="section-title reveal" ref={addRef}>
              Mereka sudah merasakan <span className="hl">manfaatnya</span> 🌟
            </h2>
            <p className="section-desc reveal" ref={addRef}>
              Para pengguna telah mempercayai HealinQ sebagai teman perjalanan kesehatan mental mereka.
            </p>
          </div>
          <div className="testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testi-card reveal" ref={addRef}>
                <div className="testi-stars">{"★".repeat(t.stars)}</div>
                <p className="testi-text">{t.text}</p>
                <div className="testi-user">
                  <div className={`testi-av ${t.color}`}>{t.emoji}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta" id="contact">
        <div className="cta-inner reveal" ref={addRef}>
          <h2 className="cta-title">Siap memulai perjalananmu menuju kesehatan mental yang lebih baik? 🚀</h2>
          <p className="cta-desc">
            Bergabung dengan pengguna yang sudah merasakan manfaat HealinQ. Daftar gratis sekarang dan mulai perjalananmu hari ini.
          </p>
          <div className="cta-btns">
            <a href="/auth/signup" className="btn-white">✨ Daftar Gratis</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-simple">
            <div className="footer-brand-wrap">
              <img src="/images/logo.png" alt="HealinQ" className="footer-logo"
                onError={e => { e.target.style.display='none'; e.target.insertAdjacentHTML('afterend','<div class="footer-logo-text">HealinQ</div>'); }}
              />
              <p className="footer-tagline">Platform digital pendamping kesehatan mental yang aman, inklusif, dan terpercaya untuk semua orang Indonesia.</p>
            </div>
            <div className="footer-contact-col">
              <div className="footer-col-title">Hubungi Kami</div>
              <div className="footer-socials-list">
                <a href="https://instagram.com/healinq" target="_blank" rel="noopener noreferrer" className="fsocial-row">
                  <span className="fsocial-icon" style={{background:"linear-gradient(135deg,#f472b6,#a855f7)"}}>📸</span>
                  <span>@healinq</span>
                </a>
                <a href="mailto:hello@healinq.id" className="fsocial-row">
                  <span className="fsocial-icon" style={{background:"linear-gradient(135deg,#4ecdc4,#2a9d8f)"}}>✉️</span>
                  <span>hello@healinq.id</span>
                </a>
                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="fsocial-row">
                  <span className="fsocial-icon" style={{background:"linear-gradient(135deg,#22c55e,#16a34a)"}}>💬</span>
                  <span>+62 812-3456-7890</span>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2024 HealinQ · Dibuat dengan 💗 untuk Indonesia</div>
            <div className="footer-badges">
              <span className="fbadge">🔒 SSL Secured</span>
              <span className="fbadge">🌿 Safe Space</span>
              <span className="fbadge">🏥 Verified Experts</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}