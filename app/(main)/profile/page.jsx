"use client";

import { useState } from "react";

// ── DATA ──────────────────────────────────────────────────────────────────────

const MISSIONS = {
  daily: [
    { id: 1, icon: "📔", color: "teal", title: "Tulis Jurnal Hari Ini", desc: "Ungkapkan perasaanmu dalam tulisan bebas minimal 50 kata", progress: 1, total: 1, xp: 50, status: "done" },
    { id: 2, icon: "🧘", color: "pink", title: "Sesi Meditasi 10 Menit", desc: "Luangkan waktu untuk bernapas dan hadir di momen ini", progress: 0, total: 1, xp: 30, status: "active" },
    { id: 3, icon: "🌞", color: "yellow", title: "Mood Check-in Pagi", desc: "Catat bagaimana perasaanmu di awal hari", progress: 1, total: 1, xp: 20, status: "done" },
  ],
  weekly: [
    { id: 4, icon: "💬", color: "lav", title: "Sesi Konsultasi Minggu Ini", desc: "Jadwalkan & hadiri sesi bersama psikiatermu", progress: 0, total: 1, xp: 150, status: "active" },
    { id: 5, icon: "🍀", color: "pink", title: "Tambah 3 Momen di Jar of Happiness", desc: "Simpan hal-hal kecil yang membuatmu bahagia minggu ini", progress: 2, total: 3, xp: 80, status: "active" },
    { id: 6, icon: "🔥", color: "teal", title: "Jaga Streak 7 Hari", desc: "Login dan lakukan aktivitas selama 7 hari berturut-turut", progress: 7, total: 7, xp: 200, status: "done" },
  ],
  special: [
    { id: 7, icon: "📚", color: "lav", title: "Baca 5 Artikel Kesehatan Mental", desc: "Perkaya pengetahuanmu lewat konten edukasi di HealinQ", progress: 3, total: 5, xp: 100, status: "active" },
    { id: 8, icon: "🔒", color: "grey", title: "Capai Level 15", desc: "Lanjutkan perjalananmu untuk membuka misi ini", progress: 0, total: 1, xp: 500, status: "locked" },
  ],
};

const REWARDS_INIT = [
  { id: 1, emoji: "🖼️", name: "Frame Profil Bunga", desc: "Hiasi profilmu dengan border bunga cherry blossom yang cantik", xp: 200, state: "claimed" },
  { id: 2, emoji: "🐰", name: "Avatar Kelinci Sakura", desc: "Avatar eksklusif kelinci dengan mahkota bunga sakura", xp: 300, state: "available" },
  { id: 3, emoji: "💊", name: "Diskon Konsultasi 20%", desc: "Dapatkan potongan harga 20% untuk sesi konsultasi berikutnya", xp: 500, state: "available" },
  { id: 4, emoji: "🌙", name: "Theme Malam Berbintang", desc: "Ubah tampilan aplikasi dengan tema gelap indigo dan bintang", xp: 400, state: "available" },
  { id: 5, emoji: "✨", name: "Afirmasi Premium", desc: "Akses 30 afirmasi positif eksklusif yang dikurasi psikolog", xp: 250, state: "available" },
  { id: 6, emoji: "👑", name: "Mahkota Legend", desc: "Badge eksklusif untuk pengguna yang mencapai Level 20", xp: null, state: "locked" },
];

const CONSULTATIONS = [
  { id: 1, day: 28, month: "March", doctor: "dr. Sari Dewi, Sp.KJ", time: "15:00 • 60 menit", type: "online",  status: "done",      note: "Teknik grounding & CBT" },
  { id: 2, day: 16, month: "March", doctor: "dr. Sari Dewi, Sp.KJ", time: "10:00 • 45 menit", type: "offline", status: "done",      note: "Evaluasi perkembangan" },
  { id: 3, day: 15, month: "March", doctor: "dr. Sari Dewi, Sp.KJ", time: "13:00 • 60 menit", type: "online",  status: "done",      note: "Manajemen kecemasan" },
  { id: 4, day: 14, month: "March", doctor: "dr. Budi Santoso, Sp.KJ", time: "09:00 • 30 menit", type: "online", status: "cancelled", note: "Dibatalkan pasien" },
  { id: 5, day: 13, month: "March", doctor: "dr. Sari Dewi, Sp.KJ", time: "14:00 • 60 menit", type: "offline", status: "done",      note: "Sesi relaksasi" },
  { id: 6, day: 12, month: "March", doctor: "dr. Sari Dewi, Sp.KJ", time: "11:00 • 45 menit", type: "online",  status: "done",      note: "Journal review" },
  { id: 7, day: 11, month: "March", doctor: "dr. Budi Santoso, Sp.KJ", time: "15:30 • 60 menit", type: "online", status: "done",    note: "Mindfulness & breathing" },
  { id: 8, day: 10, month: "March", doctor: "dr. Sari Dewi, Sp.KJ", time: "10:00 • 60 menit", type: "offline", status: "done",      note: "Sesi perdana" },
];

const BADGES = [
  { emoji: "📝", name: "First Word", earned: true, color: "pink" },
  { emoji: "🔥", name: "On Fire", earned: true, color: "teal" },
  { emoji: "💬", name: "Open Up", earned: true, color: "lav" },
  { emoji: "🌟", name: "Star Habit", earned: true, color: "yellow" },
  { emoji: "🧘", name: "Calm Mind", earned: true, color: "pink" },
  { emoji: "🍀", name: "Happy Jar", earned: true, color: "teal" },
  { emoji: "🌈", name: "Good Vibes", earned: true, color: "lav" },
  { emoji: "💪", name: "Resilient", earned: true, color: "yellow" },
  { emoji: "🦋", name: "Transform", earned: false },
  { emoji: "🌙", name: "Night Owl", earned: false },
  { emoji: "👑", name: "Legend", earned: false },
  { emoji: "🚀", name: "Max Level", earned: false },
];

// ── STYLES ────────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

  :root {
    --pink: #efb7d5;
    --pink-light: #fde8f3;
    --pink-mid: #ea1e8c;
    --pink-dark: #db2d8d;

    --teal: #8fd0ef;
    --teal-light: #dff4ff;
    --teal-dark: #0c72a6;

    --lav: #eef6ff;
    --lav-mid: #2086c4;

    --yellow: #fff1a8;
    --yellow-mid: #e2b93b;

    --orange: #ffd9c2;
    --orange-mid: #f28a50;

    --soft-bg: #d9edf8;
    --text-dark: #0c72a6;
    --text-mid: #2086c4;
    --text-light: #6eaed1;
    --text-neutral: #3f5f73;

    --card-shadow: 0 4px 18px rgba(0,0,0,0.08);
    --card-shadow-hover: 0 10px 28px rgba(0,0,0,0.12);

    --r: 20px;
    --r-sm: 12px;
  }

  * { margin:0; padding:0; box-sizing:border-box; }

  html, body {
    min-height: 100%;
  }

  body {
    font-family:'poppins',sans-serif;
    background: var(--soft-bg);
    color: var(--text-dark);
  }

  /* NAV */
  .nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255,255,255,.88);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid #dff4ff;
    padding: 0 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 62px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  }

  .nav-logo {
    height: 36px;
    width: auto;
    object-fit: contain;
  }

  /* MODAL OVERLAY */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(12,114,166,.22);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .modal {
    background: white;
    border-radius: var(--r);
    box-shadow: 0 24px 60px rgba(0,0,0,.18);
    width: 100%;
    max-width: 480px;
    overflow: hidden;
  }

  .modal-head {
    background: linear-gradient(135deg, var(--teal) 0%, var(--pink) 100%);
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-title {
    font-family:'poppins',sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    color: white;
  }

  .modal-close {
    background: rgba(255,255,255,.24);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    color: white;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .2s;
  }

  .modal-close:hover {
    background: rgba(255,255,255,.36);
  }

  .modal-body {
    padding: 24px;
  }

  .field {
    margin-bottom: 16px;
  }

  .field label {
    display: block;
    font-size: .8rem;
    font-weight: 700;
    color: var(--text-mid);
    margin-bottom: 6px;
  }

  .field input,
  .field textarea,
  .field select {
    width: 100%;
    border: 1.5px solid #cfe8f7;
    border-radius: var(--r-sm);
    padding: 10px 14px;
    font-family: 'poppins',sans-serif;
    font-size: .88rem;
    color: var(--text-neutral);
    background: #f8fcff;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
  }

  .field input:focus,
  .field textarea:focus,
  .field select:focus {
    border-color: var(--teal);
    box-shadow: 0 0 0 3px rgba(143,208,239,.18);
  }

  .field textarea {
    resize: vertical;
    min-height: 72px;
  }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .modal-footer {
    display: flex;
    gap: 10px;
    padding: 0 24px 24px;
  }

  .btn-save {
    flex: 1;
    background: linear-gradient(135deg, var(--teal), var(--pink));
    color: white;
    border: none;
    border-radius: 50px;
    padding: 11px;
    font-family:'poppins',sans-serif;
    font-weight: 700;
    font-size: .9rem;
    cursor: pointer;
    transition: box-shadow .2s, transform .2s;
  }

  .btn-save:hover {
    box-shadow: 0 6px 18px rgba(143,208,239,.35);
    transform: translateY(-1px);
  }

  .btn-cancel {
    flex: 0 0 auto;
    background: var(--pink-light);
    color: var(--pink-dark);
    border: none;
    border-radius: 50px;
    padding: 11px 20px;
    font-family:'poppins',sans-serif;
    font-weight: 700;
    font-size: .9rem;
    cursor: pointer;
    transition: background .2s;
  }

  .btn-cancel:hover {
    background: #f8d5e9;
  }

  /* LAYOUT */
  .page {
    max-width: 1160px;
    margin: 0 auto;
    padding: 28px 20px 60px;
    display: grid;
    grid-template-columns: 290px 1fr;
    gap: 22px;
  }

  /* LEFT */
  .left {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  /* Profile card */
  .pcard {
    background: white;
    border-radius: var(--r);
    box-shadow: var(--card-shadow);
    overflow: hidden;
  }

  .pbanner {
    height: 88px;
    background: linear-gradient(135deg, var(--teal) 0%, var(--pink) 100%);
    position: relative;
  }

  .pbanner::after {
    content:'🌸 🌿 ✨';
    position:absolute;
    bottom:8px;
    right:12px;
    font-size:.8rem;
    opacity:.45;
    letter-spacing:4px;
  }

  .pbody {
    padding: 0 22px 22px;
  }

  .av-wrap {
    margin-top: -30px;
    margin-bottom: 12px;
    position: relative;
    display: inline-block;
  }

  .av {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--pink-light), var(--teal-light));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.7rem;
    border: 3px solid white;
    box-shadow: 0 4px 14px rgba(143,208,239,.22);
  }

  .av-online {
    position: absolute;
    bottom: 3px;
    right: 3px;
    width: 13px;
    height: 13px;
    background: #22C55E;
    border-radius: 50%;
    border: 2px solid white;
  }

  .pname {
    font-family:'poppins',sans-serif;
    font-weight: 900;
    font-size: 1.15rem;
    color: var(--text-dark);
  }

  .phandle {
    font-size: .8rem;
    color: var(--text-light);
    font-weight: 600;
    margin: 2px 0 9px;
  }

  .pbio {
    font-size: .83rem;
    color: var(--text-mid);
    line-height: 1.6;
    margin-bottom: 14px;
  }

  .ptags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  .ptag {
    border-radius: 50px;
    padding: 3px 11px;
    font-size: .72rem;
    font-weight: 700;
  }

  .ptag-pink {
    background: var(--pink-light);
    color: var(--pink-dark);
  }

  .ptag-teal {
    background: var(--teal-light);
    color: var(--teal-dark);
  }

  .ptag-lav  {
    background: var(--lav);
    color: var(--lav-mid);
  }

  .pinfo {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .pinfo-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: .8rem;
    color: var(--text-mid);
  }

  .edit-btn {
    width: 100%;
    margin-top: 14px;
    background: var(--teal);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 10px;
    font-family:'poppins',sans-serif;
    font-weight: 700;
    font-size: .86rem;
    cursor: pointer;
    transition: background .2s, transform .2s;
  }

  .edit-btn:hover {
    background: #7bc4e7;
    transform: translateY(-1px);
  }

  /* Level card */
  .lcard {
    background: linear-gradient(135deg, #77c4e8 0%, #efb7d5 100%);
    border-radius: var(--r);
    padding: 22px;
    color: white;
    position: relative;
    overflow: hidden;
    box-shadow: var(--card-shadow);
  }

  .lcard::before {
    content:'';
    position:absolute;
    top:-40px;
    right:-40px;
    width:130px;
    height:130px;
    background: rgba(255,255,255,.14);
    border-radius:50%;
  }

  .lcard::after  {
    content:'';
    position:absolute;
    bottom:-30px;
    left:-30px;
    width:100px;
    height:100px;
    background: rgba(255,255,255,.12);
    border-radius:50%;
  }

  .ltop {
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:14px;
    position:relative;
    z-index:1;
  }

  .lbadge {
    display:flex;
    align-items:center;
    gap:8px;
  }

  .llabel {
    font-size:.7rem;
    opacity:.9;
    font-weight:700;
    text-transform:uppercase;
    letter-spacing:1px;
    color: rgba(255,255,255,.9);
  }

  .lname  {
    font-family:'poppins',sans-serif;
    font-weight:900;
    font-size:1.05rem;
    color: white;
  }

  .lnum   {
    font-family:'poppins',sans-serif;
    font-weight:900;
    font-size:2rem;
    color:#fff7d1;
    line-height:1;
    text-align:right;
  }

  .lsub   {
    font-size:.7rem;
    opacity:.85;
    text-align:right;
  }

  .xp-labels {
    display:flex;
    justify-content:space-between;
    font-size:.75rem;
    opacity:.95;
    margin-bottom:5px;
    position:relative;
    z-index:1;
  }

  .xp-bar {
    background: rgba(255,255,255,.25);
    border-radius:50px;
    height:10px;
    overflow:hidden;
    position:relative;
    z-index:1;
  }

  .xp-fill {
    height:100%;
    border-radius:50px;
    background: linear-gradient(90deg, #ffffff, #fff1a8);
    width:68%;
    position:relative;
  }

  .xp-fill::after {
    content:'';
    position:absolute;
    right:0;
    top:50%;
    transform:translate(50%,-50%);
    width:14px;
    height:14px;
    background:white;
    border-radius:50%;
    box-shadow:0 0 8px rgba(255,255,255,.7);
  }

  .xp-next {
    font-size:.72rem;
    opacity:.95;
    text-align:right;
    margin-top:6px;
    position:relative;
    z-index:1;
  }

  /* Stats grid */
  .sgrid {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
  }

  .smini {
    background:white;
    border-radius:var(--r-sm);
    padding:14px;
    box-shadow:var(--card-shadow);
    text-align:center;
  }

  .smini-icon {
    font-size:1.25rem;
    margin-bottom:4px;
  }

  .smini-val  {
    font-family:'poppins',sans-serif;
    font-weight:900;
    font-size:1.35rem;
    color:var(--text-dark);
  }

  .smini-lbl  {
    font-size:.7rem;
    color:var(--text-light);
    font-weight:600;
  }

  /* Badges */
  .bcard {
    background:white;
    border-radius:var(--r);
    padding:18px;
    box-shadow:var(--card-shadow);
  }

  .ctitle {
    font-family:'poppins',sans-serif;
    font-weight:800;
    font-size:.95rem;
    color:var(--text-dark);
    margin-bottom:12px;
  }

  .bgrid  {
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:8px;
  }

  .bitem  {
    aspect-ratio:1;
    border-radius:12px;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:3px;
    cursor:pointer;
    transition:transform .2s;
    position:relative;
  }

  .bitem:hover {
    transform:scale(1.08);
  }

  .bitem-earned-pink   { background:var(--pink-light); }
  .bitem-earned-teal   { background:var(--teal-light); }
  .bitem-earned-lav    { background:var(--lav); }
  .bitem-earned-yellow { background:#fff6cc; }
  .bitem-locked {
    background:#f4f7f9;
    opacity:.55;
    filter:grayscale(1);
  }

  .bitem-earned::after {
    content:'✓';
    position:absolute;
    top:4px;
    right:4px;
    width:12px;
    height:12px;
    background:var(--pink-mid);
    color:white;
    border-radius:50%;
    font-size:.52rem;
    display:flex;
    align-items:center;
    justify-content:center;
    line-height:12px;
    text-align:center;
  }

  .bemoji { font-size:1.3rem; }

  .bname  {
    font-size:.58rem;
    font-weight:700;
    color:var(--text-mid);
    text-align:center;
    line-height:1.2;
  }

  /* RIGHT */
  .right {
    display:flex;
    flex-direction:column;
    gap:18px;
  }

  /* Tabs */
  .tabs {
    display:flex;
    gap:5px;
    background:white;
    border-radius:50px;
    padding:5px;
    box-shadow:var(--card-shadow);
    width:fit-content;
  }

  .tab {
    padding:8px 22px;
    border-radius:50px;
    border:none;
    font-family:'poppins',sans-serif;
    font-weight:700;
    font-size:.86rem;
    cursor:pointer;
    transition:all .2s;
    color:var(--text-light);
    background:transparent;
  }

  .tab-active {
    background:linear-gradient(135deg,var(--teal),var(--pink));
    color:white;
    box-shadow:0 4px 14px rgba(143,208,239,.35);
  }

  /* Section header */
  .sec-head {
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:16px;
  }

  .sec-head h2 {
    font-family:'poppins',sans-serif;
    font-weight:900;
    font-size:1.15rem;
    color:var(--text-dark);
  }

  .score-chip {
    display:flex;
    align-items:center;
    gap:5px;
    background:linear-gradient(135deg,var(--teal),var(--pink));
    color:white;
    border-radius:50px;
    padding:6px 16px;
    font-family:'poppins',sans-serif;
    font-weight:800;
    font-size:.92rem;
    box-shadow: 0 4px 12px rgba(143,208,239,.28);
  }

  /* Mission */
  .mlist {
    display:flex;
    flex-direction:column;
    gap:10px;
  }

  .mlabel {
    font-size:.75rem;
    font-weight:700;
    color:var(--text-light);
    text-transform:uppercase;
    letter-spacing:1.5px;
    margin:12px 0 6px;
    padding-left:2px;
  }

  .mcard {
    background:white;
    border-radius:var(--r);
    padding:16px 18px;
    box-shadow:var(--card-shadow);
    display:flex;
    align-items:center;
    gap:14px;
    position:relative;
    overflow:hidden;
    transition:transform .2s,box-shadow .2s;
    cursor:pointer;
  }

  .mcard:hover {
    transform:translateX(4px);
    box-shadow:var(--card-shadow-hover);
  }

  .mcard::before {
    content:'';
    position:absolute;
    left:0;
    top:0;
    bottom:0;
    width:4px;
  }

  .mcard-done { opacity:.82; }
  .mcard-done::before   { background:linear-gradient(180deg,var(--teal),#b7e9fb); }
  .mcard-active::before { background:linear-gradient(180deg,var(--pink-mid),var(--pink)); }
  .mcard-locked::before { background:#d8e5ee; }

  .micon {
    width:46px;
    height:46px;
    border-radius:14px;
    flex-shrink:0;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:1.3rem;
  }

  .micon-pink   { background:var(--pink-light); }
  .micon-teal   { background:var(--teal-light); }
  .micon-lav    { background:var(--lav); }
  .micon-yellow { background:#fff6cc; }
  .micon-grey   { background:#f3f7fa; }

  .minfo { flex:1; }

  .mtitle {
    font-family:'poppins',sans-serif;
    font-weight:800;
    font-size:.93rem;
    color:var(--text-dark);
    margin-bottom:2px;
  }

  .mdesc  {
    font-size:.78rem;
    color:var(--text-mid);
    font-weight:600;
    margin-bottom:7px;
  }

  .mprog  {
    display:flex;
    align-items:center;
    gap:10px;
  }

  .pbar   {
    flex:1;
    background:#edf5fa;
    border-radius:50px;
    height:7px;
    overflow:hidden;
  }

  .pfill  {
    height:100%;
    border-radius:50px;
  }

  .pfill-pink   { background:linear-gradient(90deg,var(--pink-mid),#f4b7d6); }
  .pfill-teal   { background:linear-gradient(90deg,var(--teal-dark),var(--teal)); }
  .pfill-lav    { background:linear-gradient(90deg,var(--lav-mid),#7fbce2); }
  .pfill-yellow { background:linear-gradient(90deg,var(--yellow-mid),#f6dd78); }

  .ptext  {
    font-size:.7rem;
    font-weight:700;
    color:var(--text-light);
    white-space:nowrap;
  }

  .mright {
    display:flex;
    flex-direction:column;
    align-items:flex-end;
    gap:5px;
    flex-shrink:0;
  }

  .xpreward {
    display:flex;
    align-items:center;
    gap:4px;
    background:#fff4bf;
    color:#9b6b00;
    border-radius:50px;
    padding:3px 10px;
    font-size:.73rem;
    font-weight:800;
  }

  .mstatus {
    font-size:.7rem;
    font-weight:700;
    padding:3px 10px;
    border-radius:50px;
  }

  .mstatus-done   { background:#dff8ea; color:#1d7a50; }
  .mstatus-active { background:var(--pink-light); color:var(--pink-dark); }
  .mstatus-locked { background:#f1f5f8; color:#94a3b8; }

  /* Rewards */
  .rgrid {
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:14px;
  }

  .rcard {
    background:white;
    border-radius:var(--r);
    padding:20px 16px;
    box-shadow:var(--card-shadow);
    text-align:center;
    position:relative;
    overflow:hidden;
    cursor:pointer;
    transition:transform .25s,box-shadow .25s;
  }

  .rcard:hover {
    transform:translateY(-4px);
    box-shadow:var(--card-shadow-hover);
  }

  .rcard-claimed::before {
    content:'CLAIMED';
    position:absolute;
    top:10px;
    right:-18px;
    background:var(--teal-dark);
    color:white;
    font-size:.58rem;
    font-weight:800;
    letter-spacing:1px;
    padding:2px 24px;
    transform:rotate(35deg);
  }

  .rcard-locked { opacity:.58; }

  .remoji  {
    font-size:2.1rem;
    margin-bottom:8px;
    display:block;
  }

  .rname   {
    font-family:'poppins',sans-serif;
    font-weight:800;
    font-size:.88rem;
    color:var(--text-dark);
    margin-bottom:4px;
  }

  .rdesc   {
    font-size:.73rem;
    color:var(--text-mid);
    line-height:1.4;
    margin-bottom:10px;
  }

  .rcost   {
    display:inline-flex;
    align-items:center;
    gap:4px;
    background:#fff4bf;
    color:#9b6b00;
    border-radius:50px;
    padding:3px 13px;
    font-size:.75rem;
    font-weight:800;
  }

  .rcost-grey {
    background:#f1f5f8;
    color:#94a3b8;
  }

  .rbtn {
    width:100%;
    margin-top:10px;
    border:none;
    border-radius:50px;
    padding:8px;
    font-family:'poppins',sans-serif;
    font-weight:700;
    font-size:.8rem;
    cursor:pointer;
    transition:all .2s;
  }

  .rbtn-claim {
    background:linear-gradient(135deg,var(--teal),var(--pink));
    color:white;
  }

  .rbtn-claim:hover {
    box-shadow:0 4px 14px rgba(143,208,239,.35);
  }

  .rbtn-off {
    background:#f1f5f8;
    color:#94a3b8;
    cursor:not-allowed;
  }

  /* Consultation History */
  .ch-grid {
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:14px;
  }

  .ch-card {
    background:white;
    border-radius:var(--r);
    box-shadow:var(--card-shadow);
    padding:18px 16px 16px;
    cursor:pointer;
    position:relative;
    overflow:hidden;
    border:1.5px solid #d8ebf7;
    transition:transform .2s,box-shadow .2s,border-color .2s;
  }

  .ch-card:hover {
    transform:translateY(-4px);
    box-shadow:var(--card-shadow-hover);
    border-color:var(--teal);
  }

  .ch-card::before {
    content:'';
    position:absolute;
    left:0;
    top:0;
    bottom:0;
    width:4px;
    background:linear-gradient(180deg,var(--pink-mid),var(--pink));
  }

  .ch-card.ch-online::before {
    background:linear-gradient(180deg,var(--teal-dark),var(--teal));
  }

  .ch-card.ch-cancelled::before {
    background:#d8e5ee;
  }

  .ch-date-num {
    font-family:'poppins',sans-serif;
    font-weight:900;
    font-size:2rem;
    color:var(--pink-mid);
    line-height:1;
  }

  .ch-card.ch-online .ch-date-num { color:var(--teal-dark); }
  .ch-card.ch-cancelled .ch-date-num { color:#9fb6c8; }

  .ch-date-month {
    font-family:'poppins',sans-serif;
    font-weight:700;
    font-size:.85rem;
    color:var(--text-mid);
    margin-bottom:10px;
  }

  .ch-divider {
    height:1px;
    background:#dff0fa;
    margin:10px 0;
  }

  .ch-card.ch-online .ch-divider {
    background:#d1edf9;
  }

  .ch-doctor {
    font-family:'poppins',sans-serif;
    font-weight:800;
    font-size:.82rem;
    color:var(--text-dark);
    margin-bottom:3px;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }

  .ch-time {
    font-size:.75rem;
    color:var(--text-mid);
    font-weight:600;
    margin-bottom:8px;
  }

  .ch-badges {
    display:flex;
    gap:5px;
    flex-wrap:wrap;
  }

  .ch-badge {
    font-size:.65rem;
    font-weight:700;
    border-radius:50px;
    padding:2px 9px;
  }

  .ch-badge-pink { background:var(--pink-light); color:var(--pink-dark); }
  .ch-badge-teal { background:var(--teal-light); color:var(--teal-dark); }
  .ch-badge-grey { background:#f1f5f8; color:#6b8ba3; }

  .ch-see-all {
    display:flex;
    align-items:center;
    justify-content:center;
    background:white;
    border-radius:var(--r);
    box-shadow:var(--card-shadow);
    border:1.5px dashed var(--teal);
    padding:18px 16px;
    cursor:pointer;
    font-family:'poppins',sans-serif;
    font-weight:800;
    font-size:.88rem;
    color:var(--teal-dark);
    gap:6px;
    transition:background .2s;
  }

  .ch-see-all:hover {
    background:var(--teal-light);
  }

  /* Toast */
  @keyframes slideUp {
    from { transform:translateY(80px); opacity:0; }
    to { transform:translateY(0); opacity:1; }
  }

  .toast {
    position:fixed;
    bottom:28px;
    right:28px;
    z-index:999;
    background:linear-gradient(135deg,var(--teal-dark),var(--pink-dark));
    color:white;
    border-radius:16px;
    padding:13px 20px;
    display:flex;
    align-items:center;
    gap:10px;
    box-shadow:0 8px 30px rgba(0,0,0,.18);
    animation:slideUp .4s cubic-bezier(.34,1.56,.64,1);
  }

  .toast-text {
    font-family:'poppins',sans-serif;
    font-weight:700;
    font-size:.88rem;
  }

  /* Confetti */
  @keyframes fall {
    from { transform:translateY(-10px) rotate(0deg); opacity:1; }
    to { transform:translateY(100vh) rotate(720deg); opacity:0; }
  }

  .confpiece {
    position:fixed;
    width:8px;
    height:8px;
    border-radius:2px;
    pointer-events:none;
    z-index:998;
    animation:fall 2s ease-in forwards;
  }

  /* Responsive */
  @media (max-width: 980px) {
    .page {
      grid-template-columns: 1fr;
    }

    .ch-grid,
    .rgrid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .nav {
      padding: 0 18px;
    }

    .page {
      padding: 20px 14px 48px;
    }

    .field-row,
    .ch-grid,
    .rgrid,
    .sgrid {
      grid-template-columns: 1fr;
    }

    .tabs {
      width: 100%;
      flex-wrap: wrap;
      border-radius: 20px;
    }

    .tab {
      flex: 1 1 calc(33.333% - 4px);
      text-align: center;
      padding: 10px 12px;
    }

    .sec-head {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .mcard {
      flex-direction: column;
      align-items: flex-start;
    }

    .mright {
      width: 100%;
      align-items: flex-start;
    }
  }
`;

// ── HELPERS ───────────────────────────────────────────────────────────────────

function MissionCard({ m }) {
  const pct = m.total > 0 ? Math.round((m.progress / m.total) * 100) : 0;
  return (
    <div className={`mcard mcard-${m.status}`}>
      <div className={`micon micon-${m.color}`}>{m.icon}</div>
      <div className="minfo">
        <div className="mtitle">{m.title}</div>
        <div className="mdesc">{m.desc}</div>
        <div className="mprog">
          <div className="pbar">
            <div className={`pfill pfill-${m.color}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="ptext">
            {m.status === "done"
              ? `${m.total}/${m.total} ✓`
              : m.status === "locked"
              ? "Terkunci"
              : `${m.progress}/${m.total}`}
          </span>
        </div>
      </div>
      <div className="mright">
        <div className="xpreward">⚡ +{m.xp} XP</div>
        <div className={`mstatus mstatus-${m.status}`}>
          {m.status === "done"
            ? "✓ Selesai"
            : m.status === "active"
            ? pct > 0 && pct < 100
              ? "● Progress"
              : "● Belum"
            : "🔒 Terkunci"}
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("missions");
  const [rewards, setRewards] = useState(REWARDS_INIT);
  const [toast, setToast] = useState(null);
  const [confetti, setConfetti] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: "Arinda Putri",
    handle: "arindaputri",
    bio: "Sedang belajar lebih mengenal diri sendiri satu hari dalam satu waktu 🌱",
    location: "Surabaya, Jawa Timur",
    age: "22 tahun",
    occupation: "Mahasiswa Psikologi",
    doctor: "dr. Sari Dewi",
  });
  const [form, setForm] = useState(profile);

  const openEdit = () => {
    setForm(profile);
    setEditOpen(true);
  };

  const saveEdit = () => {
    setProfile(form);
    setEditOpen(false);
    showToast("✅ Profil berhasil diperbarui!");
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const launchConfetti = () => {
    const colors = ["#ea1e8c", "#8fd0ef", "#e2b93b", "#2086c4", "#f28a50", "#22C55E"];
    const pieces = Array.from({ length: 48 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 1.4,
      dur: 1.5 + Math.random(),
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 2800);
  };

  const claimReward = (id, name) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, state: "claimed" } : r))
    );
    launchConfetti();
    showToast(`🎉 "${name}" berhasil diklaim!`);
  };

  return (
    <>
      <style>{css}</style>

      {confetti.map((p) => (
        <div
          key={p.id}
          className="confpiece"
          style={{
            left: `${p.left}vw`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}

      {toast && (
        <div className="toast">
          <span style={{ fontSize: "1.2rem" }}>🎉</span>
          <div className="toast-text">{toast}</div>
        </div>
      )}

      

      <div className="page">
        <aside className="left">
          <div className="pcard">
            <div className="pbanner" />
            <div className="pbody">
              <div className="av-wrap">
                <div className="av">🐰</div>
                <div className="av-online" />
              </div>
              <div className="pname">{profile.name}</div>
              <div className="phandle">@{profile.handle} · Member sejak Jan 2024</div>
              <div className="pbio">{profile.bio}</div>
              <div className="ptags">
                <span className="ptag ptag-pink">😊 Anxiety</span>
                <span className="ptag ptag-teal">🧘 Meditasi</span>
                <span className="ptag ptag-lav">📝 Journaling</span>
              </div>
              <div className="pinfo">
                {[
                  ["📍", profile.location],
                  ["🎂", profile.age],
                  ["💼", profile.occupation],
                  ["🩺", profile.doctor + " (Psikiaterku)"],
                ].map(([icon, txt]) => (
                  <div className="pinfo-row" key={txt}>
                    <span>{icon}</span>
                    {txt}
                  </div>
                ))}
              </div>
              <button className="edit-btn" onClick={openEdit}>
                ✏️ Edit Profil
              </button>
            </div>
          </div>

          <div className="lcard">
            <div className="ltop">
              <div className="lbadge">
                <span style={{ fontSize: "1.7rem" }}>🌟</span>
                <div>
                  <div className="llabel">Level saat ini</div>
                  <div className="lname">Mind Explorer</div>
                </div>
              </div>
              <div>
                <div className="lnum">12</div>
                <div className="lsub">dari 50 level</div>
              </div>
            </div>
            <div className="xp-labels">
              <span>⚡ 2.400 XP</span>
              <span>Target: 3.500 XP</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" />
            </div>
            <div className="xp-next">1.100 XP lagi → Level 13: Soul Seeker ✨</div>
          </div>

          <div className="sgrid">
            {[
              ["📔", "47", "Hari Journaling"],
              ["🧠", "8", "Sesi Konsultasi"],
              ["🔥", "14", "Streak Hari Ini"],
              ["🏆", "9", "Badge Diraih"],
            ].map(([icon, val, lbl]) => (
              <div className="smini" key={lbl}>
                <div className="smini-icon">{icon}</div>
                <div className="smini-val">{val}</div>
                <div className="smini-lbl">{lbl}</div>
              </div>
            ))}
          </div>

          <div className="bcard">
            <div className="ctitle">🏅 Badge Koleksiku</div>
            <div className="bgrid">
              {BADGES.map((b, i) => (
                <div
                  key={i}
                  className={
                    b.earned
                      ? `bitem bitem-earned bitem-earned-${b.color}`
                      : "bitem bitem-locked"
                  }
                  title={b.name}
                >
                  <span className="bemoji">{b.emoji}</span>
                  <span className="bname">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="right">
          <div className="tabs">
            {[
              ["missions", "🎯 Misi"],
              ["rewards", "🎁 Reward"],
              ["history", "📋 Riwayat"],
            ].map(([id, label]) => (
              <button
                key={id}
                className={`tab ${activeTab === id ? "tab-active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "missions" && (
            <div>
              <div className="sec-head">
                <h2>Misi Aktif ⚡</h2>
                <div className="score-chip">⭐ 2.400 XP</div>
              </div>
              <div className="mlist">
                <div className="mlabel">🌅 Harian</div>
                {MISSIONS.daily.map((m) => (
                  <MissionCard key={m.id} m={m} />
                ))}
                <div className="mlabel">📅 Mingguan</div>
                {MISSIONS.weekly.map((m) => (
                  <MissionCard key={m.id} m={m} />
                ))}
                <div className="mlabel">🌠 Misi Spesial</div>
                {MISSIONS.special.map((m) => (
                  <MissionCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "rewards" && (
            <div>
              <div className="sec-head">
                <h2>Reward Tersedia 🎁</h2>
                <div className="score-chip">⭐ 2.400 XP</div>
              </div>
              <div className="rgrid">
                {rewards.map((r) => (
                  <div key={r.id} className={`rcard rcard-${r.state}`}>
                    <span className="remoji">{r.emoji}</span>
                    <div className="rname">{r.name}</div>
                    <div className="rdesc">{r.desc}</div>
                    <div className={r.state === "locked" ? "rcost rcost-grey" : "rcost"}>
                      {r.state === "locked" ? "🔒 Level 20" : `⚡ ${r.xp} XP`}
                    </div>
                    <button
                      className={`rbtn ${r.state === "available" ? "rbtn-claim" : "rbtn-off"}`}
                      disabled={r.state !== "available"}
                      onClick={() => r.state === "available" && claimReward(r.id, r.name)}
                    >
                      {r.state === "claimed"
                        ? "✓ Sudah Diklaim"
                        : r.state === "locked"
                        ? "Belum Terbuka"
                        : "Klaim Sekarang"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <div className="sec-head">
                <h2>Consultation History 🩺</h2>
                <span style={{ fontSize: ".8rem", color: "var(--text-light)", fontWeight: 700 }}>
                  {CONSULTATIONS.length} sesi total
                </span>
              </div>
              <div className="ch-grid">
                {CONSULTATIONS.map((c) => (
                  <div
                    key={c.id}
                    className={`ch-card ${c.type === "online" ? "ch-online" : ""} ${
                      c.status === "cancelled" ? "ch-cancelled" : ""
                    }`}
                  >
                    <div className="ch-date-num">{c.day}</div>
                    <div className="ch-date-month">{c.month}</div>
                    <div className="ch-divider" />
                    <div className="ch-doctor">🩺 {c.doctor}</div>
                    <div className="ch-time">🕐 {c.time}</div>
                    <div className="ch-badges">
                      <span className={`ch-badge ${c.type === "online" ? "ch-badge-teal" : "ch-badge-pink"}`}>
                        {c.type === "online" ? "💻 Online" : "🏥 Offline"}
                      </span>
                      <span className={`ch-badge ${c.status === "done" ? "ch-badge-teal" : "ch-badge-grey"}`}>
                        {c.status === "done" ? "✓ Selesai" : "✕ Batal"}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="ch-see-all">📋 Lihat Semua</div>
              </div>
            </div>
          )}
        </main>
      </div>

      {editOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setEditOpen(false)}
        >
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">✏️ Edit Profil</div>
              <button className="modal-close" onClick={() => setEditOpen(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="field-row">
                <div className="field">
                  <label>Nama Lengkap</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nama kamu"
                  />
                </div>
                <div className="field">
                  <label>Username</label>
                  <input
                    value={form.handle}
                    onChange={(e) => setForm({ ...form, handle: e.target.value })}
                    placeholder="username"
                  />
                </div>
              </div>
              <div className="field">
                <label>Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Ceritakan sedikit tentang dirimu..."
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Lokasi</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Kota, Provinsi"
                  />
                </div>
                <div className="field">
                  <label>Usia</label>
                  <input
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="cth: 22 tahun"
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Pekerjaan / Status</label>
                  <input
                    value={form.occupation}
                    onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                    placeholder="Pekerjaan atau status"
                  />
                </div>
                <div className="field">
                  <label>Nama Psikiater</label>
                  <input
                    value={form.doctor}
                    onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                    placeholder="dr. Nama, Sp.KJ"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditOpen(false)}>
                Batal
              </button>
              <button className="btn-save" onClick={saveEdit}>
                💾 Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}