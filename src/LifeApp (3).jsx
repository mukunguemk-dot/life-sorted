// ═══════════════════════════════════════════════════════════════
// LIFE, SORTED — FIREBASE SETUP (5 steps, ~15 mins)
// ═══════════════════════════════════════════════════════════════
// 1. Go to console.firebase.google.com → Create project "life-sorted"
// 2. Add a Web app → copy the firebaseConfig object
// 3. Replace FIREBASE_CONFIG = null below with your config object
// 4. Go to Firestore Database → Create database → Start in test mode
// 5. Re-deploy to Netlify — all data now persists across sessions
//
// NETLIFY AI PROXY SETUP (2 steps, ~2 mins)
// 1. Add netlify-claude-function.js to your repo at:
//    netlify/functions/claude.js
// 2. Netlify dashboard → Site Settings → Environment Variables →
//    Add ANTHROPIC_API_KEY = your key from console.anthropic.com
// ═══════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from "react";
import {
  Home, Check, Plus, Mic, Square,
  BookOpen, ChevronDown, ChevronUp, ChevronLeft, MapPin, Link,
  Image as ImageIcon, Navigation, Bell, Sparkles, X, Music,
  Activity, BarChart2, Zap, Flame, Grid, ArrowRight
} from "lucide-react";

// ─────────────────────── FIREBASE PERSISTENCE ───────────────────────
// Fill in your Firebase config at console.firebase.google.com
// Leave as null to use local state only (preview mode)
const FIREBASE_CONFIG = null;
// Replace with your config object, e.g.:
// const FIREBASE_CONFIG = {
//   apiKey: "AIza...",
//   authDomain: "life-sorted-xxxx.firebaseapp.com",
//   projectId: "life-sorted-xxxx",
//   ...
// };

let _db = null;
let _firebaseReady = false;

async function initFirebase() {
  if (_firebaseReady || !FIREBASE_CONFIG) return;
  try {
    // Dynamic import — only loads if config is provided
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const { getFirestore, doc, getDoc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
    const app = initializeApp(FIREBASE_CONFIG);
    _db = getFirestore(app);
    _db._getDoc = getDoc;
    _db._setDoc = setDoc;
    _db._doc = doc;
    _firebaseReady = true;
  } catch(e) {
    console.warn("Firebase init failed:", e.message);
  }
}

// useStore: drop-in replacement for useState that persists to Firebase
// Falls back to plain useState when Firebase isn't configured
function useStore(key, initialValue) {
  const [value, setValue] = React.useState(initialValue);
  const [synced, setSynced] = React.useState(false);
  const USER = "default";

  React.useEffect(() => {
    if (!FIREBASE_CONFIG) { setSynced(true); return; }
    initFirebase().then(async () => {
      if (!_db) { setSynced(true); return; }
      try {
        const ref = _db._doc(_db, "users", USER, "data", key);
        const snap = await _db._getDoc(ref);
        if (snap.exists()) setValue(snap.data().v);
      } catch {}
      setSynced(true);
    });
  }, [key]);

  const setStoreValue = React.useCallback((updater) => {
    setValue(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (FIREBASE_CONFIG && _db && synced) {
        const ref = _db._doc(_db, "users", USER, "data", key);
        _db._setDoc(ref, { v: next }).catch(() => {});
      }
      return next;
    });
  }, [key, synced]);

  return [value, setStoreValue];
}


// ─────────────────────── COLOURS ───────────────────────
const C = {
  amber:"#D97706", amberLight:"#FEF3C7", amberDark:"#92400E",
  bg:"#FAFAF8", white:"#FFFFFF", border:"#F0EDEA",
  text:"#1C1917", muted:"#78716C", faint:"#A8A29E",
  green:"#059669", greenLight:"#D1FAE5",
  purple:"#7C3AED", purpleLight:"#EDE9FE",
  blue:"#1D4ED8", blueLight:"#DBEAFE",
  red:"#DC2626", redLight:"#FEE2E2",
  teal:"#0D9488", tealLight:"#CCFBF1",
};

const AVATAR_COLORS = [
  {bg:"#FEF3C7",text:"#92400E"},{bg:"#EDE9FE",text:"#5B21B6"},
  {bg:"#FFE4E6",text:"#9F1239"},{bg:"#CCFBF1",text:"#115E59"},
  {bg:"#DBEAFE",text:"#1E3A8A"},{bg:"#FEF9C3",text:"#713F12"},
  {bg:"#FCE7F3",text:"#9D174D"},{bg:"#F0FDF4",text:"#14532D"},
];

const ORIGIN_LABELS = {work:"Work",school:"School",uni:"Uni",other:"Other"};
const ORIGIN_COLORS = {
  work:[C.blueLight,C.blue], school:[C.greenLight,C.green],
  uni:[C.purpleLight,C.purple], other:["#F1F5F9","#475569"]
};
const MOODS = ["😊","🔥","😐","😔","😤","🙏"];

const SPOTIFY_MCP = "https://mcp-gateway-external-pilot.spotify.net/mcp";
const MUSIC_THEMES = {
  musicals:         {label:"Musicals",         bg:C.amberLight, color:C.amberDark},
  full_album:       {label:"Full Album",        bg:C.blueLight,  color:C.blue},
  best_of_artist:   {label:"Best of Artist",   bg:C.greenLight, color:C.green},
  songs_of_the_day: {label:"Songs of the Day", bg:C.purpleLight,color:C.purple},
  seasonal:         {label:"Seasonal Songs",   bg:C.greenLight, color:C.green},
  soundtrack:       {label:"Soundtrack",        bg:C.purpleLight,color:C.purple},
  genre_gateway:    {label:"Genre Gateway",    bg:C.redLight,   color:C.red},
  throwback_era:    {label:"Throwback Era",    bg:C.blueLight,  color:C.blue},
};
const HABIT_CATS = {
  health:    {label:"Health",    bg:"#D1FAE5",color:"#065F46"},
  mind:      {label:"Mind",      bg:"#EDE9FE",color:"#5B21B6"},
  creative:  {label:"Creative",  bg:"#FEF3C7",color:"#92400E"},
  social:    {label:"Social",    bg:"#DBEAFE",color:"#1E40AF"},
  discipline:{label:"Discipline",bg:"#FFE4E6",color:"#9F1239"},
};

// Sheet ID for the seasonal discoveries sheet
const DISCOVER_SHEET_ID = "1yBnR4mXZPqHXIaMRvLj2x2j2m-FjzhULQlAy452Mg6s";

function getSeasonInfo() {
  const now=new Date();
  const m=now.getMonth()+1;
  const y=now.getFullYear();
  let season;
  if(m>=3&&m<=5) season="Spring";
  else if(m>=6&&m<=8) season="Summer";
  else if(m>=9&&m<=11) season="Autumn";
  else season="Winter";
  const emoji={Spring:"🌸",Summer:"☀️",Autumn:"🍂",Winter:"❄️"}[season];
  return{season,year:y,label:`${season} ${y}`,emoji};
}
function getSeason(){return getSeasonInfo().season;}

function parseSheetCSV(text) {
  const rows=[];
  let cur="",inQuote=false,row=[];
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){inQuote=!inQuote;}
    else if(c===','&&!inQuote){row.push(cur.trim().replace(/^"|"$/g,""));cur="";}
    else if((c==='\n'||c==='\r')&&!inQuote){
      if(cur||row.length)row.push(cur.trim().replace(/^"|"$/g,""));
      if(row.length>1)rows.push(row);
      row=[];cur="";
    } else {cur+=c;}
  }
  if(cur||row.length){row.push(cur.trim().replace(/^"|"$/g,""));if(row.length>1)rows.push(row);}
  return rows;
}

async function fetchSeasonalData(sheetId) {
  const TABS=[["LOCATIONS","loc"],["ACTIVITIES","act"],["EVENTS","evt"]];
  const items=[];
  for(const[tabName,tabKey]of TABS){
    try{
      const url=`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
      const res=await fetch(url);
      if(!res.ok) continue;
      const text=await res.text();
      const rows=parseSheetCSV(text).slice(1); // skip header
      for(const r of rows){
        const name=r[2]?.trim();
        if(!name) continue;
        items.push({
          id:`live_${tabKey}_${items.length}`,
          tab:tabKey,
          type:r[0]||"Other",
          rec:(r[1]||"").toLowerCase().includes("recur"),
          name,
          area:r[3]||"All London",
          desc:r[5]||"",
          when:r[6]||"Check listing",
          price:r[8]||"See listing",
          station:r[9]||"",
        });
      }
    } catch{}
  }
  return items.length>0?items:null;
}
async function callClaude({system,messages,mcpServers}) {
  const res=await fetch("/.netlify/functions/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,system,messages,mcp_servers:mcpServers})});
  if(!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// ─────────────────────── SAMPLE DATA ───────────────────────
const TODAY = new Date().toISOString().slice(0,10);
const dStr=(n=0)=>{const d=new Date(TODAY);d.setDate(d.getDate()-n);return d.toISOString().slice(0,10)};

const INIT_FRIENDS = [
  {id:1,name:"Marcus",colorIdx:0,lastContact:21,cadence:14,birthday:"1990-05-08",origin:"uni",location:"london",notes:"Ask about new job",plans:"Glastonbury?"},
  {id:2,name:"Priya",colorIdx:1,lastContact:1,cadence:7,birthday:"1990-08-23",origin:"work",location:"london",notes:"Podcast partner ✨",plans:"Record ep5"},
  {id:3,name:"Jamie",colorIdx:2,lastContact:38,cadence:21,birthday:"1991-12-14",origin:"school",location:"longdistance",notes:"Haven't spoken in a while",plans:null},
  {id:4,name:"Chen",colorIdx:3,lastContact:8,cadence:14,birthday:"1988-07-02",origin:"work",location:"london",notes:"Recommended Dark Matter",plans:"Film night"},
  {id:5,name:"Aisha",colorIdx:4,lastContact:5,cadence:21,birthday:"1993-03-17",origin:"uni",location:"london",notes:"Starting her MBA",plans:null},
];
const INIT_WORKOUTS = [
  {id:1,type:"gym",date:"21/04",duration:60,notes:"Chest & back",verified:true},
  {id:2,type:"run",date:"19/04",duration:35,notes:"5.2km",verified:false},
  {id:3,type:"gym",date:"17/04",duration:55,notes:"Leg day",verified:true},
  {id:4,type:"run",date:"15/04",duration:40,notes:"6km",verified:false},
];
const INIT_WEIGHTS=[{id:1,date:"Apr 1",kg:94.2},{id:2,date:"Apr 7",kg:93.8},{id:3,date:"Apr 14",kg:93.1},{id:4,date:"Apr 21",kg:92.6}];
const INIT_WRITING=[
  {id:1,date:"Today",mins:45,words:800,verified:true,proof:{type:"link",value:"https://docs.google.com/doc/my-novel"}},
  {id:2,date:"Apr 20",mins:30,words:500,verified:false,proof:null},
  {id:3,date:"Apr 19",mins:60,words:1100,verified:true,proof:{type:"link",value:"https://docs.google.com/doc/chapter-3"}},
];
const INIT_PODCAST=[{id:1,ep:1,title:"Why We Started This",status:"published"},{id:2,ep:2,title:"The Joy of Failure",status:"published"},{id:3,ep:3,title:"Making Time",status:"published"},{id:4,ep:4,title:"On Friendship",status:"editing"},{id:5,ep:5,title:"Untitled",status:"planned"}];
const INIT_JOURNAL=[
  {id:1,date:"22 Apr 2026",mood:"🔥",transcript:"Feeling really motivated today. Got a solid writing session in before work. Starting to feel like the novel might actually get finished. Also need to reach out to Jamie.",words:34},
  {id:2,date:"18 Apr 2026",mood:"😊",transcript:"Good day overall. The run this morning cleared my head. Thinking about what the podcast could become — Priya and I need to be more intentional about the direction.",words:32},
  {id:3,date:"14 Apr 2026",mood:"😐",transcript:"Bit of a flat day. Didn't write, skipped the gym. Need to be kinder to myself but also hold myself accountable.",words:24},
  {id:4,date:"10 Apr 2026",mood:"🔥",transcript:"Incredible run today. Five kilometres felt easy for the first time ever. Finally cracked the structure of chapter four.",words:22},
];
const INIT_FUN=[
  {id:1,type:"location",title:"Brilliant Corners",area:"Dalston",icon:"🎷",done:false,friends:[1,4],date:"2026-05-10",notes:"Jazz bar"},
  {id:2,type:"location",title:"Berber & Q",area:"Exmouth Market",icon:"🍽️",done:false,friends:[2],date:null,notes:null},
  {id:3,type:"activity",title:"Weekend trip to Edinburgh",icon:"✈️",done:false,friends:[1,2,5],date:"2026-06-20",notes:null},
  {id:4,type:"activity",title:"Catch a comedy show",icon:"😂",done:false,friends:[],date:null,notes:null},
  {id:5,type:"location",title:"Tate Modern",area:"Bankside",icon:"🎨",done:false,friends:[5],date:null,notes:null},
  {id:6,type:"activity",title:"Dune Part 2",icon:"🎬",done:true,friends:[3],date:null,notes:null},
];
const INIT_HABITS=[
  {id:1,name:"Drink 8 glasses of water",icon:"💧",category:"health",freq:"daily",streak:6,completions:{[dStr(1)]:true,[dStr(2)]:true,[dStr(3)]:true,[dStr(4)]:true,[dStr(5)]:true,[dStr(6)]:true}},
  {id:2,name:"10 mins meditation",icon:"🧘",category:"mind",freq:"daily",streak:3,completions:{[dStr(1)]:true,[dStr(2)]:true,[dStr(3)]:true}},
  {id:3,name:"Read 20 pages",icon:"📚",category:"mind",freq:"daily",streak:2,completions:{[dStr(1)]:true,[dStr(2)]:true}},
  {id:4,name:"No alcohol on weekdays",icon:"🚫",category:"discipline",freq:"weekdays",streak:8,completions:{[dStr(1)]:true,[dStr(2)]:true,[dStr(3)]:true,[dStr(4)]:true,[dStr(5)]:true,[dStr(6)]:true,[dStr(7)]:true,[dStr(8)]:true}},
  {id:5,name:"Write morning pages",icon:"✍️",category:"creative",freq:"daily",streak:0,completions:{[dStr(2)]:true,[dStr(4)]:true}},
  {id:6,name:"Call a family member",icon:"📞",category:"social",freq:"weekly",streak:1,completions:{[dStr(3)]:true}},
];
const INIT_GYM={lat:51.5194,lng:-0.1270,name:"PureGym Bloomsbury"};
// ─────────────────────── GOALS DATA ───────────────────────
const GOAL_CATS = {
  fitness:  {label:"Fitness",   bg:"#DBEAFE",color:"#1D4ED8"},
  creative: {label:"Creative",  bg:"#EDE9FE",color:"#5B21B6"},
  mind:     {label:"Mind",      bg:"#CCFBF1",color:"#115E59"},
  finance:  {label:"Finance",   bg:"#D1FAE5",color:"#065F46"},
  social:   {label:"Social",    bg:"#FFE4E6",color:"#9F1239"},
  life:     {label:"Life",      bg:"#FEF3C7",color:"#92400E"},
};
const INIT_GOALS = [
  {id:1,title:"Run a 10k",cat:"fitness",targetDate:"2026-08-01",unit:"km",current:6,target:10,notes:"Comfortable at 6km now"},
  {id:2,title:"Read 24 books this year",cat:"mind",targetDate:"2026-12-31",unit:"books",current:6,target:24,notes:""},
  {id:3,title:"Save £1,000 for Edinburgh",cat:"finance",targetDate:"2026-06-20",unit:"£",current:200,target:1000,notes:""},
];

// London area → rough lat/lng centres for proximity
const LONDON_AREAS = {
  North:  {lat:51.5600,lng:-0.1400},
  South:  {lat:51.4700,lng:-0.0900},
  East:   {lat:51.5250,lng:-0.0200},
  West:   {lat:51.5000,lng:-0.2200},
  Central:{lat:51.5074,lng:-0.1278},
  Outside:{lat:51.4000,lng:-0.0700},
};

function geoDistKm(lat1,lng1,lat2,lng2) {
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function nearestArea(lat,lng) {
  let best="Central",bestDist=999;
  for(const[area,centre]of Object.entries(LONDON_AREAS)){
    const d=geoDistKm(lat,lng,centre.lat,centre.lng);
    if(d<bestDist){bestDist=d;best=area;}
  }
  return best;
}


// ─────────────────────── SUMMER 2026 DATA ───────────────────────
// Sourced from Ultimate Summer 2026 Google Sheet
const TYPE_ICONS = {
  "Pub":"🍺","Restaurant":"🍽️","Museum":"🏛️","Park":"🌳","Market":"🛒",
  "Music Venue":"🎵","Comedy Venue":"😂","Lido":"🏊","Day Trip":"🚂",
  "Film":"🎬","Exhibition":"🎨","Activity":"🏄","Festival":"🎪",
  "Play":"🎭","Silent Disco":"🎧","Club Night":"💃","Comedy":"😂",
};
const SUMMER_ITEMS = [
  // LOCATIONS
  {id:"L1",tab:"loc",type:"Pub",rec:true,name:"The Flask",area:"North",desc:"17th-century inn on Highgate Hill. Dick Turpin allegedly hid here. Garden, original fireplaces, excellent beer.",when:"Year-round",price:"~£6/pint",station:"Highgate"},
  {id:"L2",tab:"loc",type:"Pub",rec:true,name:"The Holly Bush",area:"North",desc:"Tucked up a cobbled lane in Hampstead — gas-lit, low-ceilinged, deeply atmospheric. Seek it out.",when:"Year-round",price:"~£6/pint",station:"Hampstead"},
  {id:"L3",tab:"loc",type:"Pub",rec:true,name:"The Spaniards Inn",area:"North",desc:"1585 highwayman's inn on the edge of Hampstead Heath. Dick Turpin, Keats and Byron were regulars. Garden perfect in summer.",when:"Year-round",price:"~£6/pint",station:"Golders Green"},
  {id:"L4",tab:"loc",type:"Pub",rec:true,name:"The Compton Arms",area:"North",desc:"George Orwell's local — tiny, unspoilt, exactly as it should be. One of London's last genuine free houses. No music.",when:"Year-round",price:"~£5/pint",station:"Highbury & Islington"},
  {id:"L5",tab:"loc",type:"Pub",rec:true,name:"The George Inn",area:"South",desc:"London's last surviving galleried coaching inn (1676). Now National Trust. Summer courtyard is extraordinary.",when:"Year-round",price:"~£6/pint",station:"London Bridge"},
  {id:"L6",tab:"loc",type:"Pub",rec:true,name:"Rake",area:"South",desc:"Borough Market's own tiny bar. Best craft beer selection near London Bridge — often queues on market days.",when:"Thu-Sat best",price:"~£7/pint",station:"London Bridge"},
  {id:"L7",tab:"loc",type:"Pub",rec:true,name:"The Mayflower",area:"South",desc:"Built 1620 on the dock from which the Mayflower sailed to America. Tiny, authentic, brilliant terrace over the Thames.",when:"Year-round",price:"~£6/pint",station:"Rotherhithe"},
  {id:"L8",tab:"loc",type:"Pub",rec:true,name:"The Cat & Mutton",area:"East",desc:"Victorian corner pub on Broadway Market. Excellent DJ nights Fri-Sat, great rooftop terrace.",when:"Year-round",price:"~£6/pint",station:"London Fields"},
  {id:"L9",tab:"loc",type:"Pub",rec:true,name:"The Old Blue Last",area:"East",desc:"Vice Magazine's Shoreditch pub-venue hybrid. Live music most evenings — cheap entry, reliably excellent.",when:"Year-round (eve)",price:"~£5/pint",station:"Shoreditch High St"},
  {id:"L10",tab:"loc",type:"Pub",rec:true,name:"The Dove",area:"West",desc:"Hammersmith's great Thames-side pub (1796). The smallest bar in the Guinness Book of Records. Terrace over the river.",when:"Year-round",price:"~£6/pint",station:"Ravenscourt Park"},
  {id:"L11",tab:"loc",type:"Pub",rec:true,name:"Windsor Castle",area:"West",desc:"Victorian Kensington pub with the finest back garden in London — pergolas, hedging, completely hidden. Summer essential.",when:"Year-round",price:"~£6/pint",station:"Holland Park"},
  {id:"L12",tab:"loc",type:"Restaurant",rec:true,name:"Dishoom King's Cross",area:"North",desc:"The most reliable restaurant in London. Bombay café food done perfectly. Breakfast, lunch and dinner. Queues but worth it.",when:"Year-round",price:"£25-40pp",station:"King's Cross"},
  {id:"L13",tab:"loc",type:"Restaurant",rec:true,name:"Padella",area:"South",desc:"Best fresh pasta in London for under £15. No reservations — join the queue. The cacio e pepe is transcendent.",when:"Year-round",price:"£12-20pp",station:"London Bridge"},
  {id:"L14",tab:"loc",type:"Restaurant",rec:true,name:"Kiln",area:"West",desc:"Thai wood-fire cooking in a tiny Soho counter restaurant. The black pig neck and grilled sea bass are extraordinary.",when:"Year-round",price:"£25-40pp",station:"Piccadilly Circus"},
  {id:"L15",tab:"loc",type:"Restaurant",rec:true,name:"Bao Soho",area:"West",desc:"The best bao buns in London. No reservations — queue or use the walk-in app. Confit pork, daikon and classic.",when:"Year-round",price:"£20-35pp",station:"Oxford Circus"},
  {id:"L16",tab:"loc",type:"Restaurant",rec:true,name:"Silo",area:"East",desc:"The world's first zero-waste restaurant in Hackney Wick. Everything is fermented, foraged or reimagined.",when:"Year-round",price:"£55-75pp",station:"Hackney Wick"},
  {id:"L17",tab:"loc",type:"Museum",rec:true,name:"British Library",area:"North",desc:"Magna Carta, Gutenberg Bible, handwritten Beatles lyrics. Free. The Treasures Gallery is one of the great rooms in London.",when:"Year-round",price:"Free",station:"King's Cross"},
  {id:"L18",tab:"loc",type:"Museum",rec:true,name:"Wellcome Collection",area:"North",desc:"Art, science, medicine and the human body. One of London's most intellectually stimulating free museums.",when:"Year-round",price:"Free",station:"Euston"},
  {id:"L19",tab:"loc",type:"Museum",rec:true,name:"Tate Modern",area:"South",desc:"Picasso, Rothko, Duchamp, Warhol. Free permanent collection plus extraordinary ticketed shows.",when:"Year-round",price:"Free/£15-20",station:"Blackfriars"},
  {id:"L20",tab:"loc",type:"Museum",rec:true,name:"V&A East Museum",area:"East",desc:"Brand new (opened April 2026). Free inaugural exhibition on Black British musical culture. The next chapter of the V&A.",when:"From Apr 2026",price:"Free",station:"Stratford"},
  {id:"L21",tab:"loc",type:"Museum",rec:true,name:"Barbican Arts Centre",area:"East",desc:"World-class arts complex: gallery, cinema, concert hall, theatre and the best free foyers in London. Brutalist architecture worth studying.",when:"Year-round",price:"Free (foyers)",station:"Barbican"},
  {id:"L22",tab:"loc",type:"Museum",rec:true,name:"Dulwich Picture Gallery",area:"South",desc:"The world's first purpose-built public art gallery (1817). Rembrandt, Rubens, Gainsborough. Free on Fridays.",when:"Year-round",price:"£14 (★ Free Fri)",station:"N/W Dulwich"},
  {id:"L23",tab:"loc",type:"Park",rec:true,name:"Hampstead Heath",area:"North",desc:"2,700 acres of ancient common land. Parliament Hill's panoramic view, woodland, ponds and wildflower meadows. London's greatest outdoor space.",when:"Year-round",price:"Free",station:"Hampstead"},
  {id:"L24",tab:"loc",type:"Park",rec:true,name:"Primrose Hill",area:"North",desc:"The finest panoramic view of central London from a short climb. Best at golden hour.",when:"Year-round",price:"Free",station:"Chalk Farm"},
  {id:"L25",tab:"loc",type:"Park",rec:true,name:"Brockwell Park",area:"South",desc:"Beautiful hill-top park with extraordinary views. Home to Brockwell Lido. Best park in South London.",when:"Year-round",price:"Free",station:"Herne Hill"},
  {id:"L26",tab:"loc",type:"Park",rec:true,name:"Victoria Park",area:"East",desc:"'The People's Park' — 213 acres. Boating lake, bandstand café, open meadows. Brilliant all summer.",when:"Year-round",price:"Free",station:"Mile End"},
  {id:"L27",tab:"loc",type:"Park",rec:true,name:"Holland Park & Kyoto Garden",area:"West",desc:"The Japanese Kyoto Garden — peacocks, koi carp and a waterfall — one of London's most unexpectedly beautiful spaces.",when:"Year-round",price:"Free",station:"Holland Park"},
  {id:"L28",tab:"loc",type:"Park",rec:true,name:"Kew Gardens",area:"West",desc:"The world's greatest botanical garden. Temperate House, Japanese pagoda, Water Lily House. Worth multiple summer visits.",when:"Year-round",price:"£22",station:"Kew Gardens"},
  {id:"L29",tab:"loc",type:"Market",rec:true,name:"Borough Market",area:"South",desc:"London's greatest food market. Cheese, bread, fish, produce, world street food. Never gets old.",when:"Mon-Sat",price:"Free",station:"London Bridge"},
  {id:"L30",tab:"loc",type:"Market",rec:true,name:"Columbia Road Flower Market",area:"East",desc:"London's most atmospheric Sunday market. Stalls piled with flowers, extraordinary cafes and independent shops. Arrive by 9am.",when:"Every Sunday",price:"Free",station:"Bethnal Green"},
  {id:"L31",tab:"loc",type:"Market",rec:true,name:"Broadway Market",area:"East",desc:"Saturday farmers' market on a beautiful tree-lined street. Walk to London Fields Lido after.",when:"Every Saturday",price:"Free",station:"London Fields"},
  {id:"L32",tab:"loc",type:"Music Venue",rec:true,name:"Ronnie Scott's",area:"West",desc:"London's legendary jazz club since 1959. Two shows nightly. Book ahead; walk-in for the 11pm late show.",when:"Year-round",price:"From £30",station:"Leicester Square"},
  {id:"L33",tab:"loc",type:"Music Venue",rec:true,name:"Jazz Café",area:"North",desc:"Camden's beloved soul, jazz, funk and hip-hop club. Friday and Saturday nights are the best.",when:"Year-round",price:"From £15",station:"Camden Town"},
  {id:"L34",tab:"loc",type:"Music Venue",rec:true,name:"The Roundhouse",area:"North",desc:"One of London's finest mid-size venues in a spectacular Grade II listed former engine shed.",when:"Year-round",price:"From £20",station:"Chalk Farm"},
  {id:"L35",tab:"loc",type:"Comedy Venue",rec:true,name:"Comedy Store",area:"West",desc:"London's legendary comedy club. Friday and Saturday shows (8pm and 11pm) are consistently brilliant.",when:"Fri-Sat",price:"From £20",station:"Piccadilly Circus"},
  {id:"L36",tab:"loc",type:"Comedy Venue",rec:true,name:"Bill Murray Comedy Club",area:"North",desc:"Beloved Islington pub comedy. Thursday through Saturday — walk-in usually possible mid-week.",when:"Thu-Sat",price:"From £8",station:"Angel"},
  {id:"L37",tab:"loc",type:"Lido",rec:true,name:"Parliament Hill Lido",area:"North",desc:"60m heated outdoor pool on the edge of Hampstead Heath. One of London's finest summer pleasures.",when:"May–Sep",price:"~£4",station:"Gospel Oak"},
  {id:"L38",tab:"loc",type:"Lido",rec:true,name:"Brockwell Lido",area:"South",desc:"Beautiful heated outdoor pool in Victorian park setting. Book online at weekends — sells out fast.",when:"May–Sep",price:"From £5",station:"Herne Hill"},
  {id:"L39",tab:"loc",type:"Lido",rec:true,name:"London Fields Lido",area:"East",desc:"The only heated outdoor 50m pool in London. Book weekends online. Calmer on weekday mornings.",when:"May–Sep",price:"~£5",station:"London Fields"},
  {id:"L40",tab:"loc",type:"Lido",rec:true,name:"Hampstead Ponds",area:"North",desc:"Three wild swimming ponds — men's, women's and mixed. Cold, beautiful, iconic.",when:"May–Sep",price:"~£4",station:"Hampstead"},
  {id:"L41",tab:"loc",type:"Day Trip",rec:false,name:"Brighton",area:"Outside",desc:"Still the greatest day trip. The Lanes, Royal Pavilion, pier, beach, brilliant food scene. 55 mins from Victoria.",when:"Any day",price:"Train ~£17-35",station:"Victoria → Brighton"},
  {id:"L42",tab:"loc",type:"Day Trip",rec:false,name:"Oxford",area:"Outside",desc:"Punt at Magdalen Bridge, visit the Bodleian, drink at The Turf Tavern. 56 mins from Paddington.",when:"Any day",price:"Train ~£30",station:"Paddington → Oxford"},
  {id:"L43",tab:"loc",type:"Day Trip",rec:false,name:"Edinburgh",area:"Outside",desc:"The greatest city in Britain for a weekend. Arthur's Seat, Old Town, the Fringe (August).",when:"Any long weekend",price:"Train ~£60-100",station:"King's Cross → Edinburgh"},
  {id:"L44",tab:"loc",type:"Day Trip",rec:false,name:"Bath",area:"Outside",desc:"The most complete Georgian city in England. Roman Baths, Thermae Spa, Pulteney Bridge. 1hr25 from Paddington.",when:"Any day",price:"Train ~£40-60",station:"Paddington → Bath Spa"},
  {id:"L45",tab:"loc",type:"Day Trip",rec:false,name:"Margate",area:"Outside",desc:"Turner Contemporary (free), Dreamland, Old Town, Shell Grotto. 1hr25 from St Pancras.",when:"Any day",price:"Train ~£30-45",station:"St Pancras → Margate"},
  {id:"L46",tab:"loc",type:"Day Trip",rec:false,name:"Whitstable",area:"Outside",desc:"Best oysters in England at The Company Shed. The Street appears at low tide. 1hr15 from St Pancras.",when:"Any day",price:"Train ~£30-38",station:"St Pancras → Whitstable"},
  // ACTIVITIES
  {id:"A1",tab:"act",type:"Film",rec:false,name:"The Odyssey",area:"All London",desc:"Christopher Nolan's mythic IMAX epic. Book IMAX tickets the moment they go on sale. The cinematic event of summer 2026.",when:"17 Jul onwards",price:"From £14 (IMAX £22)",station:"Any cinema"},
  {id:"A2",tab:"act",type:"Film",rec:false,name:"The Mandalorian & Grogu",area:"All London",desc:"The Disney+ space-western leaps to the big screen. Best experienced loud in IMAX.",when:"22 May onwards",price:"From £14 (IMAX £22)",station:"Any cinema"},
  {id:"A3",tab:"act",type:"Film",rec:false,name:"Toy Story 5",area:"All London",desc:"Pixar's long-awaited return of Woody and Buzz. A guaranteed emotional event for every generation.",when:"19 Jun onwards",price:"~£14",station:"Any cinema"},
  {id:"A4",tab:"act",type:"Exhibition",rec:false,name:"Zurbarán",area:"West",desc:"First major UK show for this Spanish master since 1994. Nearly 50 extraordinary paintings.",when:"2 May – 23 Aug",price:"~£25",station:"Charing Cross"},
  {id:"A5",tab:"act",type:"Exhibition",rec:false,name:"RA Summer Exhibition",area:"West",desc:"1,200+ works in every medium. The world's longest-running open-submission exhibition. Essential summer.",when:"16 Jun – 23 Aug",price:"From £22",station:"Green Park"},
  {id:"A6",tab:"act",type:"Exhibition",rec:false,name:"Wes Anderson: The Archives",area:"West",desc:"First UK showing of 600+ items from Anderson's films — storyboards, puppets, costumes. A genuine event.",when:"Summer 2026",price:"~£22",station:"High St Kensington"},
  {id:"A7",tab:"act",type:"Exhibition",rec:false,name:"Anish Kapoor",area:"West",desc:"First major UK Kapoor retrospective in 30 years. Disorientating mirror works and void installations.",when:"Jul – Oct 2026",price:"~£25",station:"Green Park"},
  {id:"A8",tab:"act",type:"Exhibition",rec:false,name:"Tracey Emin: A Second Life",area:"South",desc:"Four decades of Emin's raw work — My Bed, paintings, bronzes and neons. Her largest-ever retrospective.",when:"27 Feb – 31 Aug",price:"£20",station:"Blackfriars"},
  {id:"A9",tab:"act",type:"Exhibition",rec:false,name:"Liam Young: In Other Worlds",area:"East",desc:"Speculative CGI landscapes of humanity's most dramatic infrastructure. Cinematic, unsettling.",when:"21 May – 6 Sep",price:"£16",station:"Barbican"},
  {id:"A10",tab:"act",type:"Exhibition",rec:false,name:"Chelsea Flower Show",area:"West",desc:"World's most prestigious flower show. Public days 21–23 May. Must book ahead.",when:"21–23 May (public)",price:"From £107",station:"Sloane Square"},
  {id:"A11",tab:"act",type:"Activity",rec:true,name:"Hampstead Heath Ponds (swimming)",area:"North",desc:"Wild swimming in ancient ponds. Three ponds (men's/women's/mixed). Cold, beautiful, iconic.",when:"May–Sep",price:"~£4",station:"Hampstead"},
  {id:"A12",tab:"act",type:"Activity",rec:true,name:"Regent's Canal Walk",area:"North",desc:"London's finest 5km canal towpath walk past houseboats, cafes and gardens. Camden → Little Venice.",when:"Summer best",price:"Free",station:"Camden Town"},
  {id:"A13",tab:"act",type:"Activity",rec:false,name:"Wimbledon Queue",area:"South",desc:"Queue from early morning for ground tickets. Strawberries, Pimm's, brilliant tennis. The essential London summer experience.",when:"29 Jun – 12 Jul",price:"From ~£8",station:"Southfields"},
  {id:"A14",tab:"act",type:"Activity",rec:false,name:"SXSW London",area:"East",desc:"200+ artists across Shoreditch venues. Earl Sweatshirt, Pete Tong and much more.",when:"1–6 Jun 2026",price:"Day pass from £50",station:"Shoreditch High St"},
  {id:"A15",tab:"act",type:"Activity",rec:false,name:"Hackney Wick Open Studios",area:"East",desc:"Europe's largest creative community opens its studios. Ceramics, painting, print and textiles. Free.",when:"Jul–Aug 2026",price:"Free",station:"Hackney Wick"},
  // EVENTS
  {id:"E1",tab:"evt",type:"Festival",rec:false,name:"Mighty Hoopla",area:"South",desc:"Lily Allen headlines Saturday, Scissor Sisters close Sunday. South London's greatest summer day-and-night festival.",when:"30–31 May",price:"From £75",station:"Herne Hill"},
  {id:"E2",tab:"evt",type:"Festival",rec:false,name:"BST Hyde Park",area:"West",desc:"BST Hyde Park opens. Lewis Capaldi headlines. Day festival from noon.",when:"Sat 27 Jun",price:"From £95",station:"Hyde Park Corner"},
  {id:"E3",tab:"evt",type:"Festival",rec:false,name:"Kew the Music",area:"West",desc:"Annual picnic concerts in Kew's glorious gardens. Take a blanket, food and friends. Extraordinary at dusk.",when:"W/c 15 Jul",price:"From £45",station:"Kew Gardens"},
  {id:"E4",tab:"evt",type:"Play",rec:false,name:"Beetlejuice: The Musical",area:"West",desc:"Tim Burton's cult movie on stage — darkly funny, all-singing Broadway transfer. Most anticipated musical of 2026.",when:"20 May 2026–",price:"From £20",station:"Leicester Square"},
  {id:"E5",tab:"evt",type:"Play",rec:false,name:"Jesus Christ Superstar (Sam Ryder)",area:"West",desc:"Sam Ryder as Jesus. Limited season — book before it sells out.",when:"20 Jun – 5 Sep",price:"From £27.50",station:"Oxford Circus"},
  {id:"E6",tab:"evt",type:"Play",rec:false,name:"Cyrano de Bergerac (Adrian Lester)",area:"West",desc:"Adrian Lester and Susannah Fielding reprise their acclaimed RSC roles. A stone-cold classic.",when:"13 Jun – 5 Sep",price:"£15–£195",station:"Leicester Square"},
  {id:"E7",tab:"evt",type:"Play",rec:false,name:"Krapp's Last Tape (Gary Oldman)",area:"West",desc:"Gary Oldman designs, directs and stars in Beckett's monologue. His first London stage work in 37 years.",when:"8–30 May (limited)",price:"£15–£74.50",station:"Sloane Square"},
  {id:"E8",tab:"evt",type:"Play",rec:false,name:"Mother Courage (Globe)",area:"South",desc:"The Globe tackles Brecht for the first time. The harrowing anti-war masterpiece. From £5 as a Groundling.",when:"12 May – 11 Jul",price:"From £5",station:"Blackfriars"},
  {id:"E9",tab:"evt",type:"Play",rec:false,name:"A Midsummer Night's Dream (RPOA)",area:"North",desc:"Magical production with a beautiful folk score. Shakespeare outdoors at its best.",when:"20 Jun – 18 Jul",price:"From £30",station:"Regent's Park"},
  {id:"E10",tab:"evt",type:"Play",rec:false,name:"Death Note: The Musical",area:"East",desc:"After selling out in 2023, Death Note returns for six weeks at the Barbican. Book immediately.",when:"30 Jul – 12 Sep",price:"TBC",station:"Barbican"},
  {id:"E11",tab:"evt",type:"Play",rec:false,name:"Electra / Persona (Cate Blanchett)",area:"East",desc:"Cate Blanchett's first UK stage appearance in seven years. World premiere at the Barbican.",when:"30 Jul – 12 Sep",price:"TBC",station:"Barbican"},
  {id:"E12",tab:"evt",type:"Silent Disco",rec:false,name:"NHM Silent Disco — Hintze Hall",area:"West",desc:"Dance under the blue whale skeleton with three DJ channels. One of London's best recurring one-off nights. Book weeks ahead.",when:"16 May / 22 May / 26 Jun / 14 Aug",price:"£45 (£30 conc.)",station:"South Kensington"},
  {id:"E13",tab:"evt",type:"Silent Disco",rec:false,name:"ORNC Silent Disco — Painted Hall",area:"South",desc:"Dance inside 'Britain's Sistine Chapel' — the baroque Painted Hall. Three channels. Completely unforgettable.",when:"Sat 20 Jun",price:"£45 (£30 conc.)",station:"Cutty Sark"},
  {id:"E14",tab:"evt",type:"Club Night",rec:true,name:"Rouges Disco & Funk Night",area:"South",desc:"Non-stop 70s/80s disco and funk in London's last surviving 1950s ballroom. DJ Kobayashi to 2am. Magical.",when:"Every Friday",price:"£15",station:"Crofton Park"},
  {id:"E15",tab:"evt",type:"Club Night",rec:true,name:"Boogie Shoes Silent Disco Walk",area:"West",desc:"LED headphones, three channels, West End streets at night. London's original disco walking tour.",when:"Every Saturday",price:"£20",station:"Tottenham Court Rd"},
  {id:"E16",tab:"evt",type:"Play",rec:true,name:"White Rabbit Red Rabbit",area:"West",desc:"A different celebrity performs unrehearsed every night — Tennant, Ahmed, Whittaker and more. No director, no rehearsal.",when:"8 Jun – 2 Nov",price:"From £25",station:"Covent Garden"},
];

// ─────────────────────── ASTROPOLIS DATA ───────────────────────
const ASTROPOLIS_DEADLINE = "2026-09-30";
const ASTROPOLIS_COMPONENTS = [
  {id:"species",  label:"Species (8 races)",   icon:"🧬",color:"#EDE9FE",tc:"#5B21B6",pct:25,
   note:"Aesir · Androids · Anthromorphs · Humans · Martians · Merfolk · Mutants · Xenonians"},
  {id:"classes",  label:"Classes (15 classes)", icon:"⚡",color:"#DBEAFE",tc:"#1D4ED8",pct:40,
   note:"Avatar · Brawler · Cape · Champion · Cowl · Elemental · Inventor · Mage · Morph · Patriot · Psionic · Scientist · Speedster · Vigilante · Warrior"},
  {id:"powers",   label:"Power Pools (17)",     icon:"🌌",color:"#FEF3C7",tc:"#92400E",pct:10,
   note:"Animal · Cosmic · Chronal · Divine · Elastic · Elemental · Insect · Inventions · Plant · Psionic · Science · Spectral · Speed · Strength · Stunts · Technological · Weather"},
  {id:"cities",   label:"Cities & Locations",   icon:"🏙️",color:"#D1FAE5",tc:"#065F46",pct:20,
   note:"Astropolis · Dragsholm · New Lyons · Port Romeo · Sonar Sands"},
  {id:"identities",label:"Secret Identities (16)",icon:"🎭",color:"#FFE4E6",tc:"#9F1239",pct:5,
   note:"Academic · Artist · Athlete · Clergy · Criminal · Executive · Explorer · Journalist · Law Enforcement · Lawyer · Medic · Military · Nobility · Performer · Researcher · Student"},
  {id:"equipment",label:"Equipment",            icon:"⚔️",color:"#CCFBF1",tc:"#115E59",pct:5,
   note:"Armour · Kits · Tools · Weapons"},
  {id:"blog",     label:"Blog & Lore Writing",  icon:"✍️",color:"#F8F4FF",tc:"#7C3AED",pct:0,
   note:"Monthly blog posts + in-world fiction for each species, class and city"},
  {id:"playtest", label:"Playtesting",          icon:"🎲",color:"#ECFDF5",tc:"#059669",pct:0,
   note:"Internal → external → full campaign"},
];
const ASTROPOLIS_MILESTONES = [
  {id:"m1", label:"All 8 species fully designed", done:false},
  {id:"m2", label:"All 15 classes & subclasses complete", done:false},
  {id:"m3", label:"17 power pools written", done:false},
  {id:"m4", label:"16 secret identities written", done:false},
  {id:"m5", label:"All 5 cities detailed", done:false},
  {id:"m6", label:"Equipment system complete", done:false},
  {id:"m7", label:"Blog launched (first post live)", done:false},
  {id:"m8", label:"First adventure / scenario written", done:false},
  {id:"m9", label:"Internal playtest #1 complete", done:false},
  {id:"m10",label:"External playtest complete", done:false},
  {id:"m11",label:"Comic script started", done:false},
  {id:"m12",label:"Complete book ready to publish", done:false},
];


// ─────────────────────── STYLE HELPERS ───────────────────────
const base={fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif",fontSize:14,color:C.text};

// Haptic feedback helper — works on iOS/Android, silently ignored on desktop
function haptic(style="light") {
  try {
    if(navigator.vibrate) {
      navigator.vibrate(style==="light"?10:style==="medium"?20:[10,30,10]);
    }
  } catch {}
}

// PWA install prompt hook
function useInstallPrompt() {
  const [prompt,setPrompt]=React.useState(null);
  const [installed,setInstalled]=React.useState(false);
  React.useEffect(()=>{
    const handler=(e)=>{e.preventDefault();setPrompt(e);};
    window.addEventListener("beforeinstallprompt",handler);
    window.addEventListener("appinstalled",()=>setInstalled(true));
    return()=>window.removeEventListener("beforeinstallprompt",handler);
  },[]);
  const install=async()=>{
    if(!prompt)return;
    prompt.prompt();
    const{outcome}=await prompt.userChoice;
    if(outcome==="accepted")setInstalled(true);
    setPrompt(null);
  };
  return{canInstall:!!prompt&&!installed,install,installed};
}

// ─── Offline detection hook ───
function useOnline() {
  const [online,setOnline]=useState(navigator.onLine);
  useEffect(()=>{
    const on=()=>setOnline(true);
    const off=()=>setOnline(false);
    window.addEventListener("online",on);
    window.addEventListener("offline",off);
    return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off);};
  },[]);
  return online;
}
const mkCard=(x={})=>({background:C.white,borderRadius:16,padding:"14px 16px",border:`1px solid ${C.border}`,marginBottom:10,...x});
const mkBtn=(v="primary",x={})=>{
  const b={border:"none",borderRadius:10,padding:"10px 16px",fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6};
  if(v==="primary") return{...b,background:C.amber,color:"#fff",...x};
  if(v==="ghost")   return{...b,background:"transparent",color:C.amber,border:`1.5px solid ${C.amber}`,...x};
  if(v==="danger")  return{...b,background:C.redLight,color:C.red,...x};
  if(v==="green")   return{...b,background:C.greenLight,color:C.green,...x};
  if(v==="purple")  return{...b,background:C.purpleLight,color:C.purple,...x};
  if(v==="subtle")  return{...b,background:"#F5F5F4",color:C.text,...x};
  return b;
};
const mkInput=(x={})=>({width:"100%",padding:"10px 12px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",boxSizing:"border-box",background:"#fff",color:C.text,fontFamily:"inherit",...x});

// ─────────────────────── SHARED COMPONENTS ───────────────────────
function Avatar({name,colorIdx,size=44}) {
  const c=AVATAR_COLORS[colorIdx%AVATAR_COLORS.length];
  return <div style={{width:size,height:size,borderRadius:"50%",background:c.bg,color:c.text,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,flexShrink:0}}>{name.slice(0,2).toUpperCase()}</div>;
}
function Pill({bg,color,text}) {
  return <span style={{background:bg,color,borderRadius:8,padding:"3px 9px",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>{text}</span>;
}
function SectionLabel({text,style={}}) {
  return <p style={{fontSize:13,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 10px",...style}}>{text}</p>;
}
function InnerTabs({tabs,active,onChange}) {
  return (
    <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.white}}>
      {tabs.map(t=><button key={t} onClick={()=>onChange(t)} style={{flex:1,padding:"11px 0",fontSize:13,fontWeight:active===t?700:500,color:active===t?C.amber:C.muted,background:"transparent",border:"none",borderBottom:active===t?`2px solid ${C.amber}`:"2px solid transparent",cursor:"pointer"}}>{t}</button>)}
    </div>
  );
}
function StatCard({label,value,bg,textColor,sub}) {
  return (
    <div style={{background:bg,borderRadius:14,padding:"14px 16px"}}>
      <p style={{fontSize:11,color:textColor,margin:"0 0 4px",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",opacity:0.75}}>{label}</p>
      <p style={{fontSize:22,fontWeight:700,color:textColor,margin:0}}>{value}</p>
      {sub&&<p style={{fontSize:12,color:textColor,opacity:0.7,margin:"3px 0 0"}}>{sub}</p>}
    </div>
  );
}
function FriendAvatarRow({ids,friends,size=26}) {
  if(!ids||ids.length===0) return null;
  return <div style={{display:"flex",alignItems:"center",gap:4,marginTop:5}}>{ids.slice(0,4).map(id=>{const f=friends.find(fr=>fr.id===id);return f?<Avatar key={id} name={f.name} colorIdx={f.colorIdx} size={size}/>:null})}{ids.length>4&&<span style={{fontSize:11,color:C.faint}}>+{ids.length-4}</span>}</div>;
}

// Section header with back button
function SectionHeader({title,sub,onBack,action}) {
  return (
    <div style={{padding:"16px 20px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"flex-start",gap:10}}>
      <button onClick={onBack} style={{background:"#F5F5F4",border:"none",borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:2}}>
        <ChevronLeft size={18} color={C.text}/>
      </button>
      <div style={{flex:1}}>
        <h1 style={{fontSize:20,fontWeight:700,margin:0}}>{title}</h1>
        {sub&&<p style={{fontSize:13,color:C.muted,margin:"3px 0 0"}}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ─────────────────────── NAV DRAWER ───────────────────────
const SECTIONS=[
  {id:"friends", icon:"❤️",label:"Friends",      color:C.redLight,  tc:C.red},
  {id:"creative",icon:"✍️",label:"Creative",     color:C.purpleLight,tc:C.purple},
  {id:"fitness", icon:"🏋️",label:"Fitness",      color:C.blueLight, tc:C.blue},
  {id:"habits",  icon:"⚡",label:"Habits",       color:C.amberLight,tc:C.amberDark},
  {id:"goals",   icon:"🎯",label:"Goals",        color:"#ECFDF5",   tc:C.teal},
  {id:"fun",     icon:"🎉",label:"Fun",          color:C.greenLight,tc:C.green},
  {id:"finance", icon:"💰",label:"Finance",      color:"#FEF9C3",   tc:"#713F12"},
  {id:"music",   icon:"🎵",label:"Music",        color:"#1a1a1a",   tc:"#1DB954"},
  {id:"review",  icon:"📊",label:"Weekly review",color:"#F8F4FF",   tc:C.purple},
];

function NavDrawer({onNavigate,onClose}) {
  return (
    <div style={{position:"absolute",inset:0,zIndex:50,background:"rgba(0,0,0,0.45)",display:"flex",flexDirection:"column",justifyContent:"flex-end"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.bg,borderRadius:"20px 20px 0 0",padding:"12px 20px 32px",boxShadow:"0 -4px 24px rgba(0,0,0,0.12)"}}>
        <div style={{width:36,height:4,borderRadius:100,background:C.border,margin:"0 auto 20px"}}/>
        <p style={{fontSize:13,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 14px"}}>All sections</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {SECTIONS.map(s=>(
            <button key={s.id} onClick={()=>onNavigate(s.id)} style={{background:s.color,border:"none",borderRadius:14,padding:"14px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:22,flexShrink:0}}>{s.icon}</span>
              <span style={{fontSize:14,fontWeight:600,color:s.tc}}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────── FLOATING NAV ───────────────────────
function FloatingNav({screen,onHome,onDrawer}) {
  const onHome_=(screen!=="home");
  return (
    <div style={{padding:"12px 20px 20px",background:C.white,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:onHome_?"space-between":"center",flexShrink:0}}>
      {onHome_&&(
        <button onClick={onHome} style={{display:"flex",alignItems:"center",gap:6,background:C.bg,border:`1px solid ${C.border}`,borderRadius:20,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:600,color:C.text}}>
          <Home size={14}/> Home
        </button>
      )}
      <button onClick={onDrawer} style={{display:"flex",alignItems:"center",gap:8,background:onHome_?C.bg:C.amber,border:onHome_?`1px solid ${C.border}`:"none",borderRadius:20,padding:"8px 18px",cursor:"pointer",fontSize:13,fontWeight:600,color:onHome_?C.text:"#fff"}}>
        <Grid size={14}/> {onHome_?"Sections":"Explore sections"}
      </button>
    </div>
  );
}

// ─────────────────────── HOME INLINE CARDS ───────────────────────

// Computed daily brief from data
function computeBrief(friends,habits,writingSessions,funList) {
  const parts=[];
  const overdue=friends.filter(f=>f.lastContact>f.cadence);
  // Smart synthesis: friend + connected fun plan
  let smartSuggestion=null;
  for(const f of overdue.filter(f=>f.location==="london")) {
    const fun=funList.find(fi=>!fi.done&&fi.friends?.includes(f.id)&&fi.date);
    if(fun){smartSuggestion={friend:f,fun};break;}
  }
  if(smartSuggestion){
    const{friend:f,fun}=smartSuggestion;
    const d=new Date(fun.date).toLocaleDateString("en-GB",{day:"numeric",month:"short"});
    parts.push(`${f.name} is ${f.lastContact} days overdue — and ${fun.title} is coming up ${d}. Perfect time to confirm.`);
  } else if(overdue.length>0) {
    const names=overdue.slice(0,2).map(f=>f.name).join(" and ");
    parts.push(`${names} ${overdue.length>1?"are":"is"} overdue a catch-up.`);
  }
  const doneH=habits.filter(h=>h.completions[TODAY]).length;
  if(doneH===habits.length) parts.push("All habits done today — great work. 🎉");
  else parts.push(`${doneH} of ${habits.length} habits done today.`);
  const unverified=writingSessions.filter(w=>!w.verified);
  if(unverified.length>0) parts.push(`${unverified.length} writing session${unverified.length>1?"s":""} still need${unverified.length===1?"s":""} proof.`);
  return parts.join(" ");
}

function DailyBriefCard({friends,habits,writingSessions,funList,onNavigate}) {
  const [aiInsight,setAiInsight]=useState(null);
  const [loading,setLoading]=useState(false);
  const computed=computeBrief(friends,habits,writingSessions,funList);

  const generateAI=async()=>{
    setLoading(true);
    const overdue=friends.filter(f=>f.lastContact>f.cadence).map(f=>`${f.name} (${f.lastContact}d)`).join(", ");
    const doneH=habits.filter(h=>h.completions[TODAY]).length;
    const prompt=`You are a thoughtful daily assistant. Write a 2-sentence morning brief for this person — warm, specific, and honest. Do not use bullet points.\n\nData: Overdue friends: ${overdue||"none"}. Habits done: ${doneH}/${habits.length}. Unverified writing sessions: ${writingSessions.filter(w=>!w.verified).length}. Upcoming fun: ${funList.filter(f=>!f.done&&f.date).map(f=>f.title).join(", ")||"nothing planned"}.\n\nFocus on the single most important thing they should do today and why.`;
    try {
      const res=await fetch("/.netlify/functions/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:120,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setAiInsight(data.content?.[0]?.text);
    } catch{}
    setLoading(false);
  };

  return (
    <div style={{...mkCard({background:"#1C1917",border:"none"})}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <p style={{fontSize:12,fontWeight:700,color:"#A8A29E",textTransform:"uppercase",letterSpacing:"0.06em",margin:0}}>Today's brief</p>
        <button onClick={generateAI} disabled={loading} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:600,color:loading?"#666":"#FEF3C7",cursor:loading?"default":"pointer",display:"flex",alignItems:"center",gap:4}}>
          <Sparkles size={10}/>{loading?"Thinking…":"AI brief"}
        </button>
      </div>
      <p style={{fontSize:14,color:aiInsight?"#FEF3C7":"#E7E5E4",lineHeight:1.65,margin:0}}>
        {aiInsight||computed}
      </p>
    </div>
  );
}

function HabitsInlineCard({habits,setHabits,onNavigate}) {
  const done=habits.filter(h=>h.completions[TODAY]).length;
  const pending=habits.filter(h=>!h.completions[TODAY]);
  const pct=habits.length>0?Math.round((done/habits.length)*100):0;

  const calcStreak=(completions)=>{
    let s=0;
    const d=new Date(TODAY);
    while(s<365){const k=d.toISOString().slice(0,10);if(!completions[k])break;s++;d.setDate(d.getDate()-1);}
    return s;
  };
  const toggle=(id)=>setHabits(hs=>hs.map(h=>{
    if(h.id!==id) return h;
    const completions={...h.completions};
    if(completions[TODAY]) delete completions[TODAY];
    else completions[TODAY]=true;
    return{...h,completions,streak:calcStreak(completions)};
  }));

  return (
    <div style={mkCard()}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>⚡</span>
          <p style={{fontWeight:700,fontSize:15,margin:0}}>Habits</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:13,fontWeight:700,color:pct===100?C.green:C.amber}}>{done}/{habits.length}</span>
          <button onClick={()=>onNavigate("habits")} style={{background:"none",border:"none",cursor:"pointer",color:C.faint,display:"flex",alignItems:"center"}}><ArrowRight size={16}/></button>
        </div>
      </div>
      <div style={{background:"#F0EDEA",borderRadius:100,height:6,marginBottom:10,overflow:"hidden"}}>
        <div style={{background:pct===100?C.green:C.amber,height:"100%",width:`${pct}%`,borderRadius:100}}/>
      </div>
      {pct===100?(
        <p style={{fontSize:13,color:C.green,fontWeight:600,margin:0}}>🎉 All done for today!</p>
      ):(
        pending.slice(0,3).map(h=>(
          <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
            <button onClick={()=>{haptic("light");toggle(h.id);}} style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${C.border}`,background:"#fff",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {h.completions[TODAY]&&<Check size={11} color={C.green} strokeWidth={3}/>}
            </button>
            <span style={{fontSize:16,flexShrink:0}}>{h.icon}</span>
            <p style={{fontSize:13,fontWeight:500,margin:0,flex:1}}>{h.name}</p>
            {h.streak>0&&<span style={{fontSize:11,color:h.streak>=7?C.red:C.amber,fontWeight:700,display:"flex",alignItems:"center",gap:2}}><Flame size={10}/>{h.streak}d</span>}
          </div>
        ))
      )}
      {pending.length>3&&<p style={{fontSize:12,color:C.faint,margin:"8px 0 0"}}>+{pending.length-3} more → tap to see all</p>}
    </div>
  );
}

function FriendsInlineCard({friends,setFriends,onNavigate}) {
  const overdue=friends.filter(f=>f.lastContact>f.cadence).sort((a,b)=>(b.lastContact-b.cadence)-(a.lastContact-a.cadence));
  const logContact=id=>setFriends(fs=>fs.map(f=>f.id===id?{...f,lastContact:0}:f));
  const today=new Date(TODAY);
  const soonBday=friends.find(f=>{
    if(!f.birthday) return false;
    const b=new Date(f.birthday);b.setFullYear(new Date().getFullYear());
    const diff=(b-today)/86400000;
    return diff>=0&&diff<=7;
  });

  return (
    <div style={mkCard()}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>❤️</span>
          <p style={{fontWeight:700,fontSize:15,margin:0}}>Friends</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {overdue.length>0&&<span style={{background:C.redLight,color:C.red,borderRadius:8,padding:"2px 8px",fontSize:12,fontWeight:700}}>{overdue.length} overdue</span>}
          <button onClick={()=>onNavigate("friends")} style={{background:"none",border:"none",cursor:"pointer",color:C.faint}}><ArrowRight size={16}/></button>
        </div>
      </div>
      {soonBday&&<div style={{background:C.amberLight,borderRadius:10,padding:"8px 12px",marginBottom:8,fontSize:13,color:C.amberDark}}>🎂 {soonBday.name}'s birthday — {new Date(soonBday.birthday).toLocaleDateString("en-GB",{day:"numeric",month:"long"})}</div>}
      {overdue.slice(0,2).map(f=>(
        <div key={f.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
          <Avatar name={f.name} colorIdx={f.colorIdx} size={34}/>
          <div style={{flex:1}}>
            <p style={{fontWeight:600,fontSize:14,margin:"0 0 1px"}}>{f.name}</p>
            <p style={{fontSize:12,color:C.muted,margin:0}}>{f.lastContact}d · {f.location==="london"?"📍 London":"✈️ Long distance"}</p>
          </div>
          <button onClick={()=>logContact(f.id)} style={{...mkBtn("primary",{padding:"6px 12px",fontSize:12,borderRadius:8})}}>
            <Check size={11}/> Done
          </button>
        </div>
      ))}
      {overdue.length===0&&<p style={{fontSize:13,color:C.green,fontWeight:600,margin:0}}>✅ Everyone's heard from recently</p>}
    </div>
  );
}

function FitnessInlineCard({workouts,weights,onNavigate}) {
  const weekCount=workouts.length;
  const latest=weights[weights.length-1]?.kg;
  const lost=(weights[0]?.kg-latest).toFixed(1);
  return (
    <div style={mkCard()}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>🏋️</span>
          <p style={{fontWeight:700,fontSize:15,margin:0}}>Fitness</p>
        </div>
        <button onClick={()=>onNavigate("fitness")} style={{background:"none",border:"none",cursor:"pointer",color:C.faint}}><ArrowRight size={16}/></button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div style={{background:C.blueLight,borderRadius:12,padding:"10px 12px"}}>
          <p style={{fontSize:11,color:C.blue,fontWeight:700,textTransform:"uppercase",margin:"0 0 2px",opacity:0.8}}>This week</p>
          <p style={{fontSize:20,fontWeight:700,color:C.blue,margin:0}}>{weekCount}/4</p>
        </div>
        <div style={{background:C.greenLight,borderRadius:12,padding:"10px 12px"}}>
          <p style={{fontSize:11,color:C.green,fontWeight:700,textTransform:"uppercase",margin:"0 0 2px",opacity:0.8}}>Lost</p>
          <p style={{fontSize:20,fontWeight:700,color:C.green,margin:0}}>{lost}kg</p>
        </div>
      </div>
      <button onClick={()=>onNavigate("fitness")} style={{...mkBtn("ghost",{width:"100%",marginTop:10,fontSize:13,padding:"8px"})}}>
        <Plus size={13}/> Log a session
      </button>
    </div>
  );
}

function FinanceInlineCard({onNavigate,financeData}) {
  const income=financeData?.takeHome||2543;
  const savingsTarget=financeData?.savings?.target||(income*0.2);
  const spent=financeData?
    (financeData.needs?.spent||0)+(financeData.wants?.spent||0)
    :847;
  const pct=Math.round((spent/income)*100);
  return (
    <div style={mkCard()}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>💰</span>
          <p style={{fontWeight:700,fontSize:15,margin:0}}>Finance</p>
        </div>
        <button onClick={()=>onNavigate("finance")} style={{background:"none",border:"none",cursor:"pointer",color:C.faint}}><ArrowRight size={16}/></button>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
        <span style={{fontSize:13,color:C.muted}}>April spend</span>
        <span style={{fontSize:16,fontWeight:700,color:C.red}}>£{spent.toLocaleString()}</span>
      </div>
      <div style={{background:"#F0EDEA",borderRadius:100,height:6,marginBottom:6,overflow:"hidden"}}>
        <div style={{background:pct>80?C.red:pct>60?C.amber:C.green,height:"100%",width:`${pct}%`,borderRadius:100}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <span style={{fontSize:12,color:C.muted}}>{pct}% of £{income.toLocaleString()} income</span>
        <span style={{fontSize:12,color:C.red,fontWeight:600}}>Savings: £0 / £{savingsTarget} ⚠️</span>
      </div>
      <button onClick={()=>onNavigate("finance")} style={{...mkBtn("ghost",{width:"100%",marginTop:10,fontSize:13,padding:"8px"})}}>
        <Plus size={13}/> Log a spend
      </button>
    </div>
  );
}

function CreativeInlineCard({writingSessions,onNavigate}) {
  const totalWords=writingSessions.reduce((a,s)=>a+s.words,0);
  const unverified=writingSessions.filter(w=>!w.verified).length;
  return (
    <div style={mkCard()}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>✍️</span>
          <p style={{fontWeight:700,fontSize:15,margin:0}}>Creative</p>
        </div>
        <button onClick={()=>onNavigate("creative")} style={{background:"none",border:"none",cursor:"pointer",color:C.faint}}><ArrowRight size={16}/></button>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <div style={{flex:1,background:C.purpleLight,borderRadius:12,padding:"10px 12px"}}>
          <p style={{fontSize:11,color:C.purple,fontWeight:700,margin:"0 0 2px",opacity:0.8}}>Words this week</p>
          <p style={{fontSize:18,fontWeight:700,color:C.purple,margin:0}}>{totalWords.toLocaleString()}</p>
        </div>
        <div style={{flex:1,background:unverified>0?C.amberLight:C.greenLight,borderRadius:12,padding:"10px 12px"}}>
          <p style={{fontSize:11,color:unverified>0?C.amberDark:C.green,fontWeight:700,margin:"0 0 2px",opacity:0.8}}>Unverified</p>
          <p style={{fontSize:18,fontWeight:700,color:unverified>0?C.amberDark:C.green,margin:0}}>{unverified}</p>
        </div>
      </div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>onNavigate("creative")} style={{...mkBtn("subtle",{flex:1,fontSize:12,padding:"7px"})}}>✍️ Write</button>
        <button onClick={()=>onNavigate("creative")} style={{...mkBtn("subtle",{flex:1,fontSize:12,padding:"7px"})}}>🎙️ Journal</button>
        <button onClick={()=>onNavigate("creative")} style={{...mkBtn("subtle",{flex:1,fontSize:12,padding:"7px"})}}>🎙 Podcast</button>
      </div>
    </div>
  );
}

function FunInlineCard({funList,friends,onNavigate}) {
  const upcoming=funList.filter(f=>!f.done&&f.date).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,2);
  const incomplete=funList.filter(f=>!f.done&&((f.friends?.length>0&&!f.date)||(f.date&&!f.friends?.length)));
  return (
    <div style={mkCard()}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:upcoming.length?10:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>🎉</span>
          <p style={{fontWeight:700,fontSize:15,margin:0}}>Fun stuff</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {incomplete.length>0&&<span style={{background:C.amberLight,color:C.amberDark,borderRadius:8,padding:"2px 8px",fontSize:12,fontWeight:700}}>{incomplete.length} to plan</span>}
          <button onClick={()=>onNavigate("fun")} style={{background:"none",border:"none",cursor:"pointer",color:C.faint}}><ArrowRight size={16}/></button>
        </div>
      </div>
      {upcoming.map((item,i)=>(
        <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:i<upcoming.length-1?`1px solid ${C.border}`:"none"}}>
          <span style={{fontSize:20}}>{item.icon}</span>
          <div style={{flex:1}}>
            <p style={{fontWeight:600,fontSize:13,margin:"0 0 1px"}}>{item.title}</p>
            <p style={{fontSize:12,color:C.amber,margin:0,fontWeight:600}}>📅 {new Date(item.date).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</p>
          </div>
          <FriendAvatarRow ids={item.friends} friends={friends} size={22}/>
        </div>
      ))}
      {upcoming.length===0&&<p style={{fontSize:13,color:C.muted,margin:0}}>Nothing planned yet — <button onClick={()=>onNavigate("fun")} style={{background:"none",border:"none",color:C.amber,fontWeight:600,cursor:"pointer",padding:0,fontSize:13}}>add something fun</button></p>}
    </div>
  );
}

function MusicInlineCard({lastMusicPick,onNavigate}) {
  const t=lastMusicPick?MUSIC_THEMES[lastMusicPick.theme]:null;
  return (
    <button onClick={()=>onNavigate("music")} style={{...mkCard({cursor:"pointer",background:"#111",border:"none"}),display:"flex",alignItems:"center",gap:12,width:"100%",textAlign:"left"}}>
      <div style={{width:44,height:44,borderRadius:12,background:t?.bg||"#222",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <Music size={20} color={t?.color||"#1DB954"}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontWeight:700,fontSize:14,color:"#1DB954",margin:"0 0 2px"}}>{lastMusicPick?"Today's pick":"Music"}</p>
        <p style={{fontSize:13,color:"#888",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lastMusicPick?lastMusicPick.title:"Get today's Spotify recommendation →"}</p>
      </div>
      <ChevronDown size={16} color="#666" style={{flexShrink:0,transform:"rotate(-90deg)"}}/>
    </button>
  );
}



// ─────────────────────── CALENDAR ───────────────────────
// Token is set automatically when the OAuth flow completes.
// The app catches ?cal_token= from the redirect URL, stores it in
// localStorage, and this function reads it on every load.
function getCalToken() {
  try { return localStorage.getItem("ls_cal_token"); } catch { return null; }
}

function CalendarCard({onNavigate,funList,goals}) {
  const [token,setToken]=useState(getCalToken);
  const [events,setEvents]=useState(null);
  const [loading,setLoading]=useState(false);
  const [freeDays,setFreeDays]=useState([]);
  const [tokenError,setTokenError]=useState(false);

  const fetchCalendar=async(tkn)=>{
    if(!tkn) return;
    setLoading(true);
    setTokenError(false);
    try {
      const now=new Date();
      const end=new Date(now);end.setDate(end.getDate()+14);
      const url=`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime`;
      const res=await fetch(url,{headers:{Authorization:`Bearer ${tkn}`}});
      if(res.status===401){
        // Token expired — clear it, prompt re-auth
        try{localStorage.removeItem("ls_cal_token");}catch{}
        setToken(null);setTokenError(true);setLoading(false);return;
      }
      const data=await res.json();
      const items=data.items||[];
      setEvents(items);
      // Detect free days: no all-day or timed events
      const busy=new Set(items.map(e=>(e.start?.date||e.start?.dateTime||"").slice(0,10)));
      const freeList=[];
      for(let i=0;i<14;i++){
        const d=new Date(now);d.setDate(d.getDate()+i);
        const k=d.toISOString().slice(0,10);
        if(!busy.has(k)) freeList.push(k);
      }
      setFreeDays(freeList.slice(0,5));
    } catch{}
    setLoading(false);
  };

  useEffect(()=>{if(token)fetchCalendar(token);},[token]);

  // Cross-reference free days with fun list — prefer items with no date yet
  const suggestedFun=freeDays.length>0
    ? funList.filter(f=>!f.done&&!f.date).slice(0,3)
    : [];
  // Upcoming fun that lands on free days
  const funOnFreeDays=funList.filter(f=>!f.done&&f.date&&freeDays.includes(f.date));

  if(!token) {
    return (
      <div style={{...mkCard({background:"#F0FDF4",border:`1px solid #6EE7B7`})}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={{fontSize:18}}>📅</span>
          <p style={{fontWeight:700,fontSize:15,margin:0,color:C.green}}>Calendar</p>
        </div>
        <p style={{fontSize:13,color:C.green,margin:"0 0 12px",opacity:0.8}}>
          {tokenError?"Your calendar session expired — reconnect to continue.":"Connect Google Calendar to see free days and get smart fun suggestions."}
        </p>
        <a href="/.netlify/functions/auth" style={{...mkBtn("primary",{textDecoration:"none",fontSize:13,padding:"9px 16px"}),background:C.green}}>
          📅 {tokenError?"Reconnect Calendar":"Connect Google Calendar"}
        </a>
      </div>
    );
  }

  return (
    <div style={mkCard()}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>📅</span>
          <p style={{fontWeight:700,fontSize:15,margin:0}}>Calendar</p>
          <span style={{background:C.greenLight,color:C.green,borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:700}}>Connected</span>
        </div>
        <button onClick={()=>fetchCalendar(token)} style={{background:"none",border:"none",cursor:"pointer",color:C.faint,fontSize:12}}>🔄</button>
      </div>
      {loading&&<p style={{fontSize:13,color:C.muted,margin:0}}>Syncing calendar…</p>}
      {!loading&&freeDays.length>0&&(
        <>
          <p style={{fontSize:13,color:C.green,fontWeight:700,margin:"0 0 10px"}}>
            ✅ {freeDays.length} free day{freeDays.length>1?"s":""} in the next 2 weeks
          </p>
          {funOnFreeDays.length>0&&(
            <div style={{background:C.amberLight,borderRadius:10,padding:"8px 12px",marginBottom:8}}>
              <p style={{fontSize:12,color:C.amberDark,fontWeight:700,margin:"0 0 4px"}}>📌 Planned on a free day</p>
              {funOnFreeDays.map(f=>(
                <p key={f.id} style={{fontSize:13,margin:"2px 0",color:C.amberDark}}>{f.icon} {f.title} · {new Date(f.date).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</p>
              ))}
            </div>
          )}
          {suggestedFun.length>0&&(
            <>
              <p style={{fontSize:12,color:C.muted,margin:"0 0 6px",fontWeight:600}}>PLAN ON A FREE DAY</p>
              {suggestedFun.map(f=>(
                <div key={f.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:16}}>{f.icon}</span>
                  <p style={{fontSize:13,margin:0,flex:1}}>{f.title}</p>
                  <button onClick={()=>onNavigate("fun")} style={{fontSize:11,color:C.amber,fontWeight:600,background:"none",border:"none",cursor:"pointer"}}>Plan →</button>
                </div>
              ))}
            </>
          )}
        </>
      )}
      {!loading&&events&&events.length>0&&freeDays.length===0&&(
        <p style={{fontSize:13,color:C.muted,margin:0}}>Busy fortnight — no completely free days in the next 14 days.</p>
      )}
    </div>
  );
}

// ─────────────────────── MORNING CHECK-IN ───────────────────────
function MorningCheckIn({checkIns,setCheckIns}) {
  const today=new Date().toISOString().slice(0,10);
  const existing=checkIns[today];
  const [energy,setEnergy]=useState(null);
  const [mood,setMood]=useState(null);
  const [done,setDone]=useState(!!existing);

  const save=()=>{
    if(!energy||!mood) return;
    setCheckIns(c=>({...c,[today]:{energy,mood,time:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}}));
    setDone(true);
  };

  if(done||existing) {
    const data=existing||{energy,mood};
    return (
      <div style={{...mkCard({background:"#1C1917",border:"none",marginBottom:10}),display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:22}}>{data.mood}</span>
        <div style={{flex:1}}>
          <p style={{fontSize:13,color:"#E7E5E4",fontWeight:600,margin:"0 0 2px"}}>Today's check-in done</p>
          <div style={{display:"flex",gap:4}}>
            {[1,2,3,4,5].map(n=><div key={n} style={{width:16,height:6,borderRadius:3,background:n<=data.energy?"#FCD34D":"rgba(255,255,255,0.15)"}}/>)}
          </div>
        </div>
        <p style={{fontSize:11,color:"#666",margin:0}}>{data.time||""}</p>
      </div>
    );
  }

  return (
    <div style={mkCard({background:"#1C1917",border:"none",marginBottom:10})}>
      <p style={{fontSize:12,color:"#A8A29E",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 10px"}}>Morning check-in</p>
      <div style={{marginBottom:12}}>
        <p style={{fontSize:13,color:"#E7E5E4",margin:"0 0 8px"}}>Energy today</p>
        <div style={{display:"flex",gap:8}}>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>setEnergy(n)} style={{flex:1,height:28,borderRadius:6,border:"none",background:n<=energy?"#FCD34D":"rgba(255,255,255,0.1)",cursor:"pointer",transition:"background 0.15s"}}/>
          ))}
        </div>
      </div>
      <div style={{marginBottom:12}}>
        <p style={{fontSize:13,color:"#E7E5E4",margin:"0 0 8px"}}>Mood</p>
        <div style={{display:"flex",gap:6}}>
          {MOODS.map(m=><button key={m} onClick={()=>setMood(mood===m?null:m)} style={{fontSize:22,background:mood===m?"rgba(255,255,255,0.15)":"transparent",border:`1.5px solid ${mood===m?"rgba(255,255,255,0.4)":"transparent"}`,borderRadius:10,padding:"4px 6px",cursor:"pointer"}}>{m}</button>)}
        </div>
      </div>
      <button onClick={save} disabled={!energy||!mood} style={{...mkBtn("primary",{width:"100%",fontSize:13,padding:"9px"}),opacity:(!energy||!mood)?0.4:1}}>
        Save check-in
      </button>
    </div>
  );
}

// ─────────────────────── GOALS INLINE CARD ───────────────────────
function GoalInlineCard({goals,onNavigate}) {
  const today=new Date();
  const nearDeadline=goals.filter(g=>{
    const d=new Date(g.targetDate);
    const days=Math.ceil((d-today)/86400000);
    return days>=0&&days<=30;
  });
  const overallPct=goals.length>0?Math.round(goals.reduce((a,g)=>a+(g.current/g.target*100),0)/goals.length):0;
  return (
    <div style={mkCard()}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>🎯</span>
          <p style={{fontWeight:700,fontSize:15,margin:0}}>Goals</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {nearDeadline.length>0&&<span style={{background:C.redLight,color:C.red,borderRadius:8,padding:"2px 8px",fontSize:12,fontWeight:700}}>{nearDeadline.length} due soon</span>}
          <button onClick={()=>onNavigate("goals")} style={{background:"none",border:"none",cursor:"pointer",color:C.faint,display:"flex"}}><ArrowRight size={16}/></button>
        </div>
      </div>
      {goals.slice(0,3).map((g,i)=>{
        const pct=Math.round((g.current/g.target)*100);
        const days=Math.ceil((new Date(g.targetDate)-today)/86400000);
        const cat=GOAL_CATS[g.cat]||GOAL_CATS.life;
        return (
          <div key={g.id} style={{padding:"6px 0",borderBottom:i<Math.min(goals.length,3)-1?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <p style={{fontSize:13,fontWeight:600,margin:0}}>{g.title}</p>
              <span style={{fontSize:11,color:days<14?C.red:days<30?C.amber:C.faint,fontWeight:600}}>{days}d</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{flex:1,background:"#F0EDEA",borderRadius:100,height:5,overflow:"hidden"}}>
                <div style={{background:cat.color,height:"100%",width:`${Math.min(pct,100)}%`,borderRadius:100}}/>
              </div>
              <span style={{fontSize:11,color:C.muted,minWidth:40,textAlign:"right"}}>{g.current}/{g.target} {g.unit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────── NEARBY FUN ───────────────────────
function NearbyFun({funList,onNavigate}) {
  const [status,setStatus]=useState("idle"); // idle | checking | result | error
  const [area,setArea]=useState(null);
  const [nearby,setNearby]=useState([]);
  const [notifRegistered,setNotifRegistered]=useState(false);

  const SUMMER_SUBSET=SUMMER_ITEMS.filter(i=>!i.rec||i.rec); // all items

  const checkNearby=()=>{
    setStatus("checking");
    if(!navigator.geolocation){setStatus("error");return;}
    navigator.geolocation.getCurrentPosition(pos=>{
      const{latitude:lat,longitude:lng}=pos.coords;
      const foundArea=nearestArea(lat,lng);
      setArea(foundArea);
      // Find fun items in this area from both personal list and summer items
      const personalNearby=funList.filter(f=>!f.done&&(f.area===foundArea||f.area==="All London"));
      const summerNearby=SUMMER_SUBSET.filter(i=>i.area===foundArea||i.area==="All London").slice(0,4);
      setNearby([...personalNearby.slice(0,3),...summerNearby].slice(0,6));
      setStatus("result");
    },()=>setStatus("error"),{enableHighAccuracy:false,timeout:8000});
  };

  const registerEveningNotifs=async()=>{
    if(!("Notification" in window)) return;
    const perm=await Notification.requestPermission();
    if(perm==="granted"){
      setNotifRegistered(true);
      // In production this registers with the push server for 6pm daily alerts
      // For now, show a local notification as demo
      setTimeout(()=>{
        new Notification("Life, Sorted 🌆",{body:"Free evening? "+nearby.slice(0,2).map(n=>n.title||n.name).join(" · ")+" are nearby.",icon:"/icon-192.png"});
      },3000);
    }
  };

  return (
    <div style={mkCard()}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>📍</span>
          <p style={{fontWeight:700,fontSize:15,margin:0}}>What's nearby</p>
        </div>
        {status!=="idle"&&<button onClick={()=>{setStatus("idle");setNearby([]);}} style={{background:"none",border:"none",cursor:"pointer",color:C.faint,fontSize:12}}>Reset</button>}
      </div>

      {status==="idle"&&(
        <button onClick={checkNearby} style={{...mkBtn("ghost",{width:"100%",fontSize:13,padding:"9px"})}}>
          📍 Check what's fun near me now
        </button>
      )}
      {status==="checking"&&<p style={{fontSize:13,color:C.muted,textAlign:"center",padding:"8px 0"}}>📍 Finding your location…</p>}
      {status==="error"&&<p style={{fontSize:13,color:C.red,textAlign:"center",padding:"8px 0"}}>Location unavailable — allow access and try again</p>}
      {status==="result"&&(
        <>
          <p style={{fontSize:12,color:C.muted,margin:"0 0 10px"}}>You're in <strong>{area}</strong> London — {nearby.length} things nearby</p>
          {nearby.slice(0,4).map((item,i)=>(
            <div key={item.id||i} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0",borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
              <span style={{fontSize:18}}>{TYPE_ICONS[item.type]||item.icon||"📍"}</span>
              <div style={{flex:1}}>
                <p style={{fontSize:13,fontWeight:600,margin:"0 0 1px"}}>{item.title||item.name}</p>
                <p style={{fontSize:11,color:C.muted,margin:0}}>{item.type||""}{item.when?` · ${item.when}`:""}</p>
              </div>
            </div>
          ))}
          {nearby.length>0&&!notifRegistered&&(
            <button onClick={registerEveningNotifs} style={{...mkBtn("subtle",{width:"100%",marginTop:10,fontSize:12,padding:"8px"}),border:`1px solid ${C.border}`}}>
              🔔 Alert me at 6pm on free evenings nearby
            </button>
          )}
          {notifRegistered&&<p style={{fontSize:12,color:C.green,textAlign:"center",margin:"8px 0 0",fontWeight:600}}>✅ Evening alerts registered</p>}
        </>
      )}
    </div>
  );
}

// ─────────────────────── GOALS SECTION ───────────────────────
function Goals({goals,setGoals,onBack}) {
  const [adding,setAdding]=useState(false);
  const [logging,setLogging]=useState(null);
  const [newG,setNewG]=useState({title:"",cat:"life",targetDate:"",unit:"",current:0,target:100,notes:""});
  const [logVal,setLogVal]=useState("");
  const today=new Date();

  const addGoal=()=>{
    if(!newG.title.trim()||!newG.targetDate) return;
    setGoals(gs=>[...gs,{id:Date.now(),...newG,current:parseFloat(newG.current)||0,target:parseFloat(newG.target)||100}]);
    setNewG({title:"",cat:"life",targetDate:"",unit:"",current:0,target:100,notes:""});
    setAdding(false);
  };
  const logProgress=(id)=>{
    const val=parseFloat(logVal);
    if(isNaN(val)) return;
    setGoals(gs=>gs.map(g=>g.id===id?{...g,current:Math.min(val,g.target)}:g));
    setLogging(null);setLogVal("");
  };
  const deleteGoal=(id)=>setGoals(gs=>gs.filter(g=>g.id!==id));

  return (
    <>
      <SectionHeader title="Goals" sub="Longer-arc ambitions" onBack={onBack}/>
      <div style={{padding:"16px 20px"}}>
        {goals.map(g=>{
          const pct=Math.round((g.current/g.target)*100);
          const days=Math.ceil((new Date(g.targetDate)-today)/86400000);
          const cat=GOAL_CATS[g.cat]||GOAL_CATS.life;
          const urgent=days>=0&&days<14;
          return (
            <div key={g.id} style={mkCard()}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <p style={{fontWeight:700,fontSize:15,margin:0}}>{g.title}</p>
                    <span style={{background:cat.bg,color:cat.color,borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:700}}>{cat.label}</span>
                  </div>
                  <p style={{fontSize:13,color:urgent?C.red:C.muted,margin:"0 0 8px",fontWeight:urgent?700:400}}>
                    {days<0?"Past deadline":days===0?"Due today":`${days} days left`} · {new Date(g.targetDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
                  </p>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                    <div style={{flex:1,background:"#F0EDEA",borderRadius:100,height:8,overflow:"hidden"}}>
                      <div style={{background:pct>=100?C.green:cat.color,height:"100%",width:`${Math.min(pct,100)}%`,borderRadius:100}}/>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:cat.color,minWidth:40,textAlign:"right"}}>{pct}%</span>
                  </div>
                  <p style={{fontSize:12,color:C.muted,margin:0}}>{g.current} / {g.target} {g.unit}</p>
                  {g.notes&&<p style={{fontSize:12,color:C.faint,fontStyle:"italic",margin:"4px 0 0"}}>{g.notes}</p>}
                </div>
                <button onClick={()=>deleteGoal(g.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.faint,padding:"2px 4px",fontSize:16,flexShrink:0,marginLeft:8}}>×</button>
              </div>
              {logging===g.id?(
                <div style={{display:"flex",gap:8}}>
                  <input style={{...mkInput(),flex:1}} type="number" placeholder={`New total ${g.unit}`} value={logVal} onChange={e=>setLogVal(e.target.value)} autoFocus onKeyDown={e=>e.key==="Enter"&&logProgress(g.id)}/>
                  <button onClick={()=>logProgress(g.id)} style={{...mkBtn("primary",{flexShrink:0,padding:"10px 14px"})}}>Save</button>
                  <button onClick={()=>setLogging(null)} style={{...mkBtn("ghost",{flexShrink:0,padding:"10px 12px"})}}>✕</button>
                </div>
              ):(
                <button onClick={()=>{setLogging(g.id);setLogVal(String(g.current));}} style={{...mkBtn("subtle",{width:"100%",fontSize:13,padding:"8px"})}}>
                  <Plus size={13}/> Log progress
                </button>
              )}
            </div>
          );
        })}
        {adding?(
          <div style={mkCard()}>
            <p style={{fontWeight:700,margin:"0 0 12px"}}>New goal</p>
            <input style={{...mkInput(),marginBottom:8}} placeholder="What do you want to achieve?" value={newG.title} onChange={e=>setNewG(g=>({...g,title:e.target.value}))} autoFocus/>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input style={{...mkInput(),flex:1}} type="number" placeholder="Current" value={newG.current} onChange={e=>setNewG(g=>({...g,current:e.target.value}))}/>
              <input style={{...mkInput(),flex:1}} type="number" placeholder="Target" value={newG.target} onChange={e=>setNewG(g=>({...g,target:e.target.value}))}/>
              <input style={{...mkInput(),flex:1}} placeholder="Unit (km, books…)" value={newG.unit} onChange={e=>setNewG(g=>({...g,unit:e.target.value}))}/>
            </div>
            <input style={{...mkInput(),marginBottom:8}} type="date" value={newG.targetDate} onChange={e=>setNewG(g=>({...g,targetDate:e.target.value}))}/>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {Object.entries(GOAL_CATS).map(([k,v])=>(
                <button key={k} onClick={()=>setNewG(g=>({...g,cat:k}))} style={{padding:"5px 10px",borderRadius:8,border:`1.5px solid ${newG.cat===k?v.color:"transparent"}`,background:newG.cat===k?v.bg:"#F5F5F4",fontSize:12,fontWeight:600,color:newG.cat===k?v.color:C.text,cursor:"pointer"}}>{v.label}</button>
              ))}
            </div>
            <input style={{...mkInput(),marginBottom:10}} placeholder="Notes (optional)" value={newG.notes} onChange={e=>setNewG(g=>({...g,notes:e.target.value}))}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={addGoal} style={{...mkBtn("primary"),flex:1}}><Plus size={13}/> Add goal</button>
              <button onClick={()=>setAdding(false)} style={mkBtn("ghost")}>Cancel</button>
            </div>
          </div>
        ):(
          <button onClick={()=>setAdding(true)} style={{...mkBtn("ghost",{width:"100%"})}}><Plus size={13}/> Add a goal</button>
        )}
      </div>
    </>
  );
}
// ─────────────────────── HOME SCREEN ───────────────────────
function HomeScreen({friends,setFriends,habits,setHabits,workouts,weights,writingSessions,journalEntries,funList,goals,financeData,lastMusicPick,checkIns,setCheckIns,onNavigate,onWeeklyReview,notifStatus,requestNotifs}) {
  const today=new Date(TODAY);
  const todayStr=today.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
  return (
    <div style={{paddingBottom:100}}>
      {/* Header */}
      <div style={{padding:"24px 20px 16px",borderBottom:`1px solid ${C.border}`}}>
        <p style={{fontSize:12,color:C.faint,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 2px"}}>{todayStr}</p>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h1 style={{fontSize:26,fontWeight:700,margin:0}}>Life, Sorted</h1>
          <button onClick={onWeeklyReview} style={{...mkBtn("subtle",{padding:"7px 12px",fontSize:12,borderRadius:20})}}>
            <BarChart2 size={13}/> Review
          </button>
        </div>
      </div>

      <div style={{padding:"14px 20px 0"}}>
        {/* Notification prompt */}
        {notifStatus==="default"&&(
          <div style={{...mkCard({background:"#0D0D0D",border:"none"}),display:"flex",alignItems:"center",gap:12}}>
            <Bell size={18} color="#fff"/>
            <div style={{flex:1}}>
              <p style={{fontWeight:700,fontSize:13,color:"#fff",margin:"0 0 1px"}}>Get your morning brief</p>
              <p style={{fontSize:12,color:"#888",margin:0}}>Turn on notifications</p>
            </div>
            <button onClick={requestNotifs} style={{...mkBtn("primary",{padding:"7px 12px",fontSize:12,borderRadius:8,flexShrink:0})}}>Enable</button>
          </div>
        )}

        {/* Morning check-in */}
        <MorningCheckIn checkIns={checkIns} setCheckIns={setCheckIns}/>

        {/* Daily brief */}
        <DailyBriefCard friends={friends} habits={habits} writingSessions={writingSessions} funList={funList} onNavigate={onNavigate}/>

        {/* Calendar — live when OAuth connected */}
        <CalendarCard onNavigate={onNavigate} funList={funList} goals={goals}/>

        {/* Habits */}
        <HabitsInlineCard habits={habits} setHabits={setHabits} onNavigate={onNavigate}/>

        {/* Friends */}
        <FriendsInlineCard friends={friends} setFriends={setFriends} onNavigate={onNavigate}/>

        {/* Fitness */}
        <FitnessInlineCard workouts={workouts} weights={weights} onNavigate={onNavigate}/>

        {/* Finance */}
        <FinanceInlineCard onNavigate={onNavigate} financeData={financeData}/>

        {/* Creative */}
        <CreativeInlineCard writingSessions={writingSessions} onNavigate={onNavigate}/>

        {/* Fun */}
        <FunInlineCard funList={funList} friends={friends} onNavigate={onNavigate}/>

        {/* Music */}
        <MusicInlineCard lastMusicPick={lastMusicPick} onNavigate={onNavigate}/>

        {/* Goals */}
        <GoalInlineCard goals={goals} onNavigate={onNavigate}/>

        {/* Nearby */}
        <NearbyFun funList={funList} onNavigate={onNavigate}/>
      </div>
    </div>
  );
}

// ─────────────────────── FULL SECTION VIEWS ───────────────────────
// (All existing section components kept intact, with SectionHeader replacing PageHeader)

function Friends({friends,setFriends,onBack}) {
  const [adding,setAdding]=useState(false);
  const [expanded,setExpanded]=useState(null);
  const [newF,setNewF]=useState({name:"",origin:"work",location:"london",birthday:"",cadence:14,notes:""});
  const logContact=id=>setFriends(f=>f.map(fr=>fr.id===id?{...fr,lastContact:0}:fr));
  const addFriend=()=>{
    if(!newF.name.trim()) return;
    setFriends(f=>[...f,{id:Date.now(),name:newF.name,colorIdx:f.length%AVATAR_COLORS.length,lastContact:0,cadence:parseInt(newF.cadence)||14,birthday:newF.birthday||null,origin:newF.origin,location:newF.location,notes:newF.notes,plans:null}]);
    setNewF({name:"",origin:"work",location:"london",birthday:"",cadence:14,notes:""});setAdding(false);
  };
  const sorted=[...friends].sort((a,b)=>(b.lastContact-b.cadence)-(a.lastContact-a.cadence));
  return (
    <>
      <SectionHeader title="Friends" sub="Stay close to the people who matter" onBack={onBack}/>
      <div style={{padding:"16px 20px"}}>
        {sorted.map(f=>{
          const overdue=f.lastContact>f.cadence;
          const [origBg,origColor]=ORIGIN_COLORS[f.origin]||ORIGIN_COLORS.other;
          const open=expanded===f.id;
          return (
            <div key={f.id} style={mkCard()}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}} onClick={()=>setExpanded(open?null:f.id)}>
                <Avatar name={f.name} colorIdx={f.colorIdx}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
                    <p style={{fontWeight:700,fontSize:15,margin:0}}>{f.name}</p>
                    <Pill bg={origBg} color={origColor} text={ORIGIN_LABELS[f.origin]}/>
                    <Pill bg={f.location==="london"?C.greenLight:C.blueLight} color={f.location==="london"?C.green:C.blue} text={f.location==="london"?"📍 London":"✈️ Long distance"}/>
                  </div>
                  <p style={{fontSize:13,color:C.muted,margin:0}}>Last contact: {f.lastContact===0?"today 🎉":`${f.lastContact} days ago`}{overdue&&<span style={{color:f.lastContact-f.cadence>14?C.red:C.amber,fontWeight:700}}> · {f.lastContact-f.cadence}d overdue</span>}</p>
                  {f.birthday&&<p style={{fontSize:12,color:C.faint,margin:"2px 0 0"}}>🎂 {new Date(f.birthday).toLocaleDateString("en-GB",{day:"numeric",month:"long"})}</p>}
                </div>
                {open?<ChevronUp size={16} color={C.faint}/>:<ChevronDown size={16} color={C.faint}/>}
              </div>
              {open&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
                  {f.notes&&<p style={{fontSize:13,color:C.muted,fontStyle:"italic",margin:"0 0 8px"}}>{f.notes}</p>}
                  {f.plans&&<p style={{fontSize:13,color:C.amber,fontWeight:600,margin:"0 0 10px"}}>📌 {f.plans}</p>}
                  <p style={{fontSize:13,color:C.muted,margin:"0 0 10px"}}>💡 <em>{f.location==="london"?"In London — suggest meeting up":"Long distance — prioritise messages and calls"}</em></p>
                  {overdue&&<button onClick={()=>{logContact(f.id);setExpanded(null);}} style={{...mkBtn("primary",{width:"100%"})}}>
                    <Check size={14}/> Mark as contacted
                  </button>}
                </div>
              )}
            </div>
          );
        })}
        {adding?(
          <div style={mkCard()}>
            <p style={{fontWeight:700,fontSize:15,margin:"0 0 12px"}}>Add a friend</p>
            <input style={{...mkInput(),marginBottom:8}} placeholder="Name" value={newF.name} onChange={e=>setNewF(f=>({...f,name:e.target.value}))} autoFocus/>
            <p style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",margin:"8px 0 6px"}}>How do you know them?</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
              {Object.entries(ORIGIN_LABELS).map(([k,v])=>{const [bg,color]=ORIGIN_COLORS[k];return<button key={k} onClick={()=>setNewF(f=>({...f,origin:k}))} style={{padding:"8px",borderRadius:10,border:`1.5px solid ${newF.origin===k?color:"transparent"}`,background:newF.origin===k?bg:"#F5F5F4",cursor:"pointer",fontSize:13,fontWeight:600,color:newF.origin===k?color:C.text}}>{v}</button>;})}
            </div>
            <p style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",margin:"8px 0 6px"}}>Where are they?</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
              {[["london","📍 In London"],["longdistance","✈️ Long distance"]].map(([k,v])=>(
                <button key={k} onClick={()=>setNewF(f=>({...f,location:k}))} style={{padding:"8px",borderRadius:10,border:`1.5px solid ${newF.location===k?C.amber:"transparent"}`,background:newF.location===k?C.amberLight:"#F5F5F4",cursor:"pointer",fontSize:13,fontWeight:600,color:newF.location===k?C.amberDark:C.text}}>{v}</button>
              ))}
            </div>
            <input style={{...mkInput(),marginBottom:8}} type="date" value={newF.birthday} onChange={e=>setNewF(f=>({...f,birthday:e.target.value}))}/>
            <input style={{...mkInput(),marginBottom:10}} placeholder="Notes (optional)" value={newF.notes} onChange={e=>setNewF(f=>({...f,notes:e.target.value}))}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={addFriend} style={{...mkBtn("primary"),flex:1}}>Add friend</button>
              <button onClick={()=>setAdding(false)} style={mkBtn("ghost")}>Cancel</button>
            </div>
          </div>
        ):(
          <button onClick={()=>setAdding(true)} style={{...mkBtn("ghost",{width:"100%"})}}><Plus size={14}/> Add a friend</button>
        )}
      </div>
    </>
  );
}

function Habits({habits,setHabits,onBack}) {
  const [view,setView]=useState("today");
  const [adding,setAdding]=useState(false);
  const [newH,setNewH]=useState({name:"",icon:"⭐",category:"health",freq:"daily"});
  const ICONS=["💧","🧘","📚","🚫","✍️","📞","🏃","🥗","😴","💊","🌅","🎯","🙏","💪","🧠"];
  const toggle=(id)=>setHabits(hs=>hs.map(h=>{
    if(h.id!==id) return h;
    const completions={...h.completions};
    if(completions[TODAY]) delete completions[TODAY]; else completions[TODAY]=true;
    return{...h,completions};
  }));
  const addHabit=()=>{
    if(!newH.name.trim()) return;
    setHabits(hs=>[...hs,{id:Date.now(),name:newH.name,icon:newH.icon,category:newH.category,freq:newH.freq,streak:0,completions:{}}]);
    setNewH({name:"",icon:"⭐",category:"health",freq:"daily"});setAdding(false);
  };
  const done=habits.filter(h=>h.completions[TODAY]).length;
  const pct=habits.length>0?Math.round((done/habits.length)*100):0;
  const last7=Array.from({length:7},(_,i)=>{const d=new Date(TODAY);d.setDate(d.getDate()-6+i);return d.toISOString().slice(0,10);});
  const last7Labels=last7.map(d=>new Date(d).toLocaleDateString("en-GB",{weekday:"short"}));
  return (
    <>
      <SectionHeader title="Habits" sub="Small actions, every day" onBack={onBack} action={
        <div style={{display:"flex",gap:6,marginTop:2}}>
          <button onClick={()=>setView("today")} style={{padding:"5px 10px",borderRadius:8,border:"none",background:view==="today"?C.amber:"#F5F5F4",color:view==="today"?"#fff":C.muted,fontWeight:600,fontSize:12,cursor:"pointer"}}>Today</button>
          <button onClick={()=>setView("week")} style={{padding:"5px 10px",borderRadius:8,border:"none",background:view==="week"?C.amber:"#F5F5F4",color:view==="week"?"#fff":C.muted,fontWeight:600,fontSize:12,cursor:"pointer"}}>Week</button>
        </div>
      }/>
      <div style={{padding:"14px 20px 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{flex:1,background:"#F0EDEA",borderRadius:100,height:10,overflow:"hidden"}}><div style={{background:pct===100?C.green:C.amber,height:"100%",width:`${pct}%`,borderRadius:100}}/></div>
          <span style={{fontSize:13,fontWeight:700,color:pct===100?C.green:C.amber}}>{done}/{habits.length}</span>
        </div>
        {pct===100&&<p style={{fontSize:13,color:C.green,fontWeight:700,textAlign:"center",marginBottom:14}}>🎉 All habits done today!</p>}
        {view==="today"&&habits.map(h=>{
          const done_=!!h.completions[TODAY];
          const cat=HABIT_CATS[h.category]||HABIT_CATS.health;
          return(
            <div key={h.id} style={{...mkCard({marginBottom:8}),display:"flex",alignItems:"center",gap:12}}>
              <button onClick={()=>{haptic(done_?"light":"medium");toggle(h.id);}} style={{width:36,height:36,borderRadius:"50%",border:`2.5px solid ${done_?C.green:C.border}`,background:done_?C.green:"#fff",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {done_&&<Check size={16} color="#fff" strokeWidth={3}/>}
              </button>
              <span style={{fontSize:22}}>{h.icon}</span>
              <div style={{flex:1}}>
                <p style={{fontWeight:600,fontSize:14,margin:"0 0 3px",color:done_?C.muted:C.text,textDecoration:done_?"line-through":"none"}}>{h.name}</p>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{background:cat.bg,color:cat.color,borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:700}}>{cat.label}</span>
                  {h.streak>0&&<span style={{display:"flex",alignItems:"center",gap:2,fontSize:12,color:h.streak>=7?C.red:C.amber,fontWeight:700}}><Flame size={11}/>{h.streak}d</span>}
                </div>
              </div>
            </div>
          );
        })}
        {view==="week"&&(
          <div style={mkCard({padding:"12px 14px"})}>
            <div style={{display:"grid",gridTemplateColumns:"1fr repeat(7,28px)",gap:4,marginBottom:10}}>
              <span style={{fontSize:11,color:C.faint,fontWeight:700,textTransform:"uppercase"}}>Habit</span>
              {last7Labels.map((d,i)=><span key={i} style={{fontSize:10,color:last7[i]===TODAY?C.amber:C.faint,fontWeight:last7[i]===TODAY?700:500,textAlign:"center"}}>{d}</span>)}
            </div>
            {habits.map((h,hi)=>(
              <div key={h.id} style={{display:"grid",gridTemplateColumns:"1fr repeat(7,28px)",gap:4,alignItems:"center",padding:"6px 0",borderTop:hi>0?`1px solid ${C.border}`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:16}}>{h.icon}</span><span style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.name}</span></div>
                {last7.map((d,i)=>{
                  const done_=!!h.completions[d];
                  return <div key={i} onClick={()=>{if(d===TODAY){haptic("light");toggle(h.id);}}} style={{width:24,height:24,borderRadius:"50%",margin:"0 auto",background:done_?(d===TODAY?C.green:"#86EFAC"):"#F0EDEA",border:d===TODAY?`2px solid ${done_?C.green:C.amber}`:"none",cursor:d===TODAY?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.1s",active:{transform:"scale(0.9)"}}}>{done_&&<Check size={10} color="#fff" strokeWidth={3}/>}</div>;
                })}
              </div>
            ))}
          </div>
        )}
        {adding?(
          <div style={mkCard()}>
            <p style={{fontWeight:700,fontSize:15,margin:"0 0 12px"}}>New habit</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{ICONS.map(ic=><button key={ic} onClick={()=>setNewH(n=>({...n,icon:ic}))} style={{fontSize:20,background:newH.icon===ic?C.amberLight:"#F5F5F4",border:`1.5px solid ${newH.icon===ic?C.amber:"transparent"}`,borderRadius:8,padding:"4px 6px",cursor:"pointer"}}>{ic}</button>)}</div>
            <input style={{...mkInput(),marginBottom:10}} placeholder="Habit name" value={newH.name} onChange={e=>setNewH(n=>({...n,name:e.target.value}))} autoFocus/>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{Object.entries(HABIT_CATS).map(([k,v])=><button key={k} onClick={()=>setNewH(n=>({...n,category:k}))} style={{padding:"5px 10px",borderRadius:8,border:`1.5px solid ${newH.category===k?v.color:"transparent"}`,background:newH.category===k?v.bg:"#F5F5F4",fontSize:12,fontWeight:600,color:newH.category===k?v.color:C.text,cursor:"pointer"}}>{v.label}</button>)}</div>
            <div style={{display:"flex",gap:6,marginBottom:14}}>{[["daily","Daily"],["weekdays","Weekdays"],["weekends","Weekends"],["weekly","Weekly"]].map(([k,v])=><button key={k} onClick={()=>setNewH(n=>({...n,freq:k}))} style={{flex:1,padding:"7px 4px",borderRadius:8,border:`1.5px solid ${newH.freq===k?C.amber:"transparent"}`,background:newH.freq===k?C.amberLight:"#F5F5F4",fontSize:12,fontWeight:600,color:newH.freq===k?C.amberDark:C.text,cursor:"pointer"}}>{v}</button>)}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={addHabit} style={{...mkBtn("primary"),flex:1}}><Plus size={14}/> Add</button>
              <button onClick={()=>setAdding(false)} style={mkBtn("ghost")}>Cancel</button>
            </div>
          </div>
        ):(
          <button onClick={()=>setAdding(true)} style={{...mkBtn("ghost",{width:"100%",marginTop:4})}}><Plus size={14}/> Add a habit</button>
        )}
      </div>
    </>
  );
}

function Fitness({workouts,setWorkouts,weights,setWeights,gymLocation,setGymLocation,onBack}) {
  const [loggingType,setLoggingType]=useState(null);
  const [duration,setDuration]=useState("45");
  const [notes,setNotes]=useState("");
  const [newWeight,setNewWeight]=useState("");
  const [geoStatus,setGeoStatus]=useState(null);
  const [settingGym,setSettingGym]=useState(false);
  const [gymName,setGymName]=useState(gymLocation.name);
  const [stravaConnected,setStravaConnected]=useState(false);
  const checkGym=()=>{setGeoStatus("checking");if(!navigator.geolocation){setGeoStatus("error");return;}navigator.geolocation.getCurrentPosition(pos=>{const{latitude:lat,longitude:lng}=pos.coords;const R=6371000,dLat=(gymLocation.lat-lat)*Math.PI/180,dLng=(gymLocation.lng-lng)*Math.PI/180;const a=Math.sin(dLat/2)**2+Math.cos(lat*Math.PI/180)*Math.cos(gymLocation.lat*Math.PI/180)*Math.sin(dLng/2)**2;setGeoStatus(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))<=300?"near":"far");},()=>setGeoStatus("error"));};
  const logWorkout=(verified=false)=>{setWorkouts(w=>[{id:Date.now(),type:loggingType,date:"Today",duration:parseInt(duration)||45,notes,verified},...w]);setLoggingType(null);setNotes("");setDuration("45");setGeoStatus(null);};
  const latest=weights[weights.length-1]?.kg;
  const lost=(weights[0]?.kg-latest).toFixed(1);
  const TYPES=[{type:"gym",icon:"🏋️",label:"Gym"},{type:"run",icon:"🏃",label:"Run"},{type:"walk",icon:"🚶",label:"Walk"},{type:"other",icon:"⚡",label:"Other"}];
  return (
    <>
      <SectionHeader title="Fitness" sub="Track your progress" onBack={onBack}/>
      <div style={{padding:"16px 20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <StatCard label="Current weight" value={`${latest}kg`} bg={C.amberLight} textColor={C.amberDark}/>
          <StatCard label="Lost so far" value={`${lost}kg`} bg={C.greenLight} textColor={C.green}/>
        </div>
        <div style={{...mkCard({background:"#FC4C02",border:"none"}),display:"flex",alignItems:"center",gap:12}}>
          <Activity size={20} color="#fff"/>
          <div style={{flex:1}}><p style={{fontWeight:700,fontSize:14,color:"#fff",margin:"0 0 1px"}}>Strava</p><p style={{fontSize:12,color:"rgba(255,255,255,0.8)",margin:0}}>{stravaConnected?"Connected ✓":"Connect to auto-log runs"}</p></div>
          {!stravaConnected&&<button onClick={()=>setStravaConnected(true)} style={{fontSize:12,fontWeight:600,color:"#fff",background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer"}}>Connect</button>}
        </div>
        <div style={mkCard()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:settingGym?10:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><MapPin size={15} color={C.amber}/><p style={{fontWeight:700,margin:0,fontSize:14}}>{gymLocation.name}</p></div>
            <button onClick={()=>setSettingGym(!settingGym)} style={{fontSize:12,color:C.amber,background:"none",border:"none",cursor:"pointer"}}>Change</button>
          </div>
          {settingGym&&<div><input style={{...mkInput(),marginBottom:8}} placeholder="Gym name" value={gymName} onChange={e=>setGymName(e.target.value)}/><button onClick={()=>{setGymLocation(g=>({...g,name:gymName}));setSettingGym(false);}} style={{...mkBtn("primary",{width:"100%"})}}>Save</button></div>}
        </div>
        <div style={mkCard()}>
          <p style={{fontWeight:700,margin:"0 0 10px"}}>Log a session</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {TYPES.map(({type,icon,label})=><button key={type} onClick={()=>{setLoggingType(loggingType===type?null:type);setGeoStatus(null);}} style={{background:loggingType===type?C.amberLight:"#F5F5F4",border:`1.5px solid ${loggingType===type?C.amber:"transparent"}`,borderRadius:12,padding:"12px 8px",cursor:"pointer",textAlign:"center"}}><p style={{fontSize:22,margin:"0 0 4px"}}>{icon}</p><p style={{fontSize:13,fontWeight:600,margin:0,color:loggingType===type?C.amberDark:C.text}}>{label}</p></button>)}
          </div>
          {loggingType&&(
            <div style={{marginTop:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <input style={mkInput()} type="number" placeholder="Duration (mins)" value={duration} onChange={e=>setDuration(e.target.value)}/>
                <input style={mkInput()} placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)}/>
              </div>
              {loggingType==="gym"&&<div style={{marginBottom:10}}>
                {geoStatus===null&&<button onClick={checkGym} style={{...mkBtn("subtle",{width:"100%",border:`1.5px dashed ${C.border}`})}}><Navigation size={13}/> Verify I'm at the gym</button>}
                {geoStatus==="checking"&&<p style={{fontSize:13,color:C.muted,textAlign:"center",padding:"10px 0"}}>📍 Checking…</p>}
                {geoStatus==="near"&&<div style={{background:C.greenLight,borderRadius:10,padding:"10px",textAlign:"center"}}><p style={{color:C.green,fontWeight:700,fontSize:13,margin:0}}>✅ Verified at {gymLocation.name}!</p></div>}
                {geoStatus==="far"&&<div style={{background:C.amberLight,borderRadius:10,padding:"10px",textAlign:"center"}}><p style={{color:C.amberDark,fontSize:13,margin:0}}>Not nearby — logging manually</p></div>}
                {geoStatus==="error"&&<div style={{background:C.redLight,borderRadius:10,padding:"10px",textAlign:"center"}}><p style={{color:C.red,fontSize:13,margin:0}}>Location unavailable</p></div>}
              </div>}
              {geoStatus==="near"?<button onClick={()=>logWorkout(true)} style={{...mkBtn("green",{width:"100%"}),marginTop:4}}><Check size={14}/> Save verified</button>:<button onClick={()=>logWorkout(false)} style={{...mkBtn("primary",{width:"100%"}),marginTop:4}}>Save session</button>}
            </div>
          )}
        </div>
        <div style={mkCard()}>
          <p style={{fontWeight:700,margin:"0 0 10px"}}>Log weight</p>
          <div style={{display:"flex",gap:8}}><input style={{...mkInput(),flex:1}} type="number" step="0.1" placeholder="e.g. 92.4 kg" value={newWeight} onChange={e=>setNewWeight(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(setWeights(w=>[...w,{id:Date.now(),date:"Today",kg:parseFloat(newWeight)}]),setNewWeight(""))}/><button onClick={()=>{if(!newWeight)return;setWeights(w=>[...w,{id:Date.now(),date:"Today",kg:parseFloat(newWeight)}]);setNewWeight("");}} style={{...mkBtn("primary",{flexShrink:0})}}>Save</button></div>
          <div style={{marginTop:10}}>{weights.slice(-4).reverse().map(w=><div key={w.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:13,color:C.muted}}>{w.date}</span><span style={{fontSize:13,fontWeight:700}}>{w.kg}kg</span></div>)}</div>
        </div>
        <SectionLabel text="Recent sessions"/>
        {workouts.slice(0,5).map(w=><div key={w.id} style={{...mkCard({marginBottom:8}),display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:12,background:w.type==="gym"?C.blueLight:C.greenLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{w.type==="gym"?"🏋️":w.type==="run"?"🏃":"🚶"}</div>
          <div style={{flex:1}}><p style={{fontWeight:600,fontSize:14,margin:"0 0 2px"}}>{w.type==="gym"?"Gym":w.type==="run"?"Run":"Walk"}</p><p style={{fontSize:13,color:C.muted,margin:0}}>{w.duration} mins{w.notes?` · ${w.notes}`:""}</p></div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}><span style={{fontSize:11}}>{w.verified?"✅":"⏳"}</span><span style={{fontSize:12,color:C.faint}}>{w.date}</span></div>
        </div>)}
      </div>
    </>
  );
}

function Journal({entries,setEntries}) {
  const [recording,setRecording]=useState(false);
  const [transcript,setTranscript]=useState("");
  const [interim,setInterim]=useState("");
  const [mood,setMood]=useState(null);
  const [expanded,setExpanded]=useState(null);
  const [error,setError]=useState(null);
  const [pulse,setPulse]=useState(false);
  const [aiInsight,setAiInsight]=useState(null);
  const [loadingInsight,setLoadingInsight]=useState(false);
  const recRef=useRef(null);
  const pulseRef=useRef(null);
  useEffect(()=>{if(recording){pulseRef.current=setInterval(()=>setPulse(p=>!p),900);}else{clearInterval(pulseRef.current);setPulse(false);}return()=>clearInterval(pulseRef.current);},[recording]);
  const startRecording=()=>{setError(null);const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){setError("Voice recognition works in Chrome on Android. Type below instead.");return;}const rec=new SR();rec.continuous=true;rec.interimResults=true;rec.lang="en-GB";rec.onresult=e=>{let fin="",inter="";for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)fin+=e.results[i][0].transcript+" ";else inter+=e.results[i][0].transcript;}setTranscript(t=>t+fin);setInterim(inter);};rec.onerror=()=>{setError("Mic blocked.");setRecording(false);};rec.onend=()=>{setRecording(false);setInterim("");};rec.start();recRef.current=rec;setRecording(true);};
  const stopRecording=()=>{recRef.current?.stop();setRecording(false);setInterim("");};
  const saveEntry=()=>{if(!transcript.trim())return;setEntries(e=>[{id:Date.now(),date:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),mood,transcript:transcript.trim(),words:transcript.trim().split(/\s+/).length},...e]);setTranscript("");setMood(null);setAiInsight(null);};
  const getInsights=async()=>{setLoadingInsight(true);const allText=entries.map(e=>e.transcript).join("\n\n");try{const res=await fetch("/.netlify/functions/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:`Find 2-3 genuine patterns in these journal entries. Be specific and warm. 3 sentences max.\n\n${allText}`}]})});const data=await res.json();setAiInsight(data.content?.[0]?.text);}catch{setAiInsight("Couldn't connect.");}setLoadingInsight(false);};
  const hasContent=transcript.trim().length>0;
  return (
    <div style={{padding:"16px 20px"}}>
      {entries.length>=2&&(
        <div style={{...mkCard({background:C.purpleLight,border:"none",marginBottom:16})}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:aiInsight?10:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><Sparkles size={15} color={C.purple}/><p style={{fontWeight:700,fontSize:14,color:C.purple,margin:0}}>AI Insights</p></div>
            <button onClick={getInsights} disabled={loadingInsight} style={{...mkBtn("purple",{padding:"5px 12px",fontSize:12})}}>{loadingInsight?"Thinking…":aiInsight?"Refresh":"Analyse"}</button>
          </div>
          {aiInsight&&<p style={{fontSize:14,color:"#3B0764",lineHeight:1.65,margin:0}}>{aiInsight}</p>}
        </div>
      )}
      <div style={{textAlign:"center",padding:"20px 0 16px"}}>
        <p style={{fontSize:14,color:C.muted,margin:"0 0 20px"}}>{recording?"Listening…":hasContent?"Paused — continue or save":"Tap to start"}</p>
        <button onClick={recording?stopRecording:startRecording} style={{width:88,height:88,borderRadius:"50%",border:"none",cursor:"pointer",background:recording?(pulse?C.red:"#EF4444"):C.amber,display:"inline-flex",alignItems:"center",justifyContent:"center",transition:"all 0.25s",transform:recording&&pulse?"scale(1.07)":"scale(1)",boxShadow:recording?`0 0 0 ${pulse?"16px":"8px"} rgba(239,68,68,0.12)`:"none"}}>
          {recording?<Square size={30} color="#fff" fill="#fff"/>:<Mic size={30} color="#fff"/>}
        </button>
        {recording&&<p style={{fontSize:13,color:C.red,fontWeight:700,margin:"12px 0 0"}}>● Recording</p>}
      </div>
      {error&&<div style={{background:C.redLight,borderRadius:12,padding:"12px",marginBottom:12}}><p style={{fontSize:13,color:C.red,margin:0}}>{error}</p></div>}
      {(hasContent||interim)&&(
        <div style={mkCard()}>
          <SectionLabel text="Transcript"/>
          <textarea value={transcript+interim} onChange={e=>setTranscript(e.target.value)} rows={5} style={{...mkInput(),resize:"vertical",lineHeight:1.65}} placeholder="Your words appear here…"/>
          <p style={{fontSize:13,fontWeight:600,color:C.muted,margin:"12px 0 8px"}}>How are you feeling?</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>{MOODS.map(m=><button key={m} onClick={()=>setMood(mood===m?null:m)} style={{fontSize:24,background:mood===m?C.amberLight:"#F5F5F4",border:`1.5px solid ${mood===m?C.amber:"transparent"}`,borderRadius:10,padding:"6px 8px",cursor:"pointer"}}>{m}</button>)}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={saveEntry} style={{...mkBtn("primary"),flex:1}}><BookOpen size={13}/> Save</button>
            <button onClick={()=>{setTranscript("");setMood(null);setInterim("");}} style={mkBtn("danger")}>Discard</button>
          </div>
        </div>
      )}
      {!hasContent&&!recording&&!interim&&<div style={{textAlign:"center",paddingBottom:8}}><p style={{fontSize:13,color:C.faint,margin:"0 0 6px"}}>Prefer to type?</p><button onClick={()=>setTranscript(" ")} style={{fontSize:13,color:C.amber,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Open text entry</button></div>}
      {entries.length>0&&(
        <><SectionLabel text="Past entries" style={{marginTop:8}}/>
        {entries.map(entry=><div key={entry.id} style={mkCard()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}} onClick={()=>setExpanded(expanded===entry.id?null:entry.id)}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>{entry.mood&&<span style={{fontSize:22}}>{entry.mood}</span>}<div><p style={{fontWeight:600,fontSize:14,margin:0}}>{entry.date}</p><p style={{fontSize:12,color:C.faint,margin:"2px 0 0"}}>{entry.words} words</p></div></div>
            {expanded===entry.id?<ChevronUp size={16} color={C.faint}/>:<ChevronDown size={16} color={C.faint}/>}
          </div>
          {expanded===entry.id&&<p style={{fontSize:14,color:C.muted,lineHeight:1.7,margin:"12px 0 0",paddingTop:12,borderTop:`1px solid ${C.border}`}}>{entry.transcript}</p>}
        </div>)}</>
      )}
    </div>
  );
}

function Creative({writingSessions,setWritingSessions,podcastEps,journalEntries,setJournalEntries,astroSessions,setAstroSessions,astroMilestones,setAstroMilestones,astroComponents,setAstroComponents,onBack}) {
  const [innerTab,setInnerTab]=useState("Journal");
  const [logging,setLogging]=useState(false);
  const [mins,setMins]=useState("30");
  const [words,setWords]=useState("");
  const [proofType,setProofType]=useState(null);
  const [proofValue,setProofValue]=useState(""); // eslint-disable-line
  const logSession=()=>{const proof=proofType&&proofValue?{type:proofType,value:proofValue}:null;setWritingSessions(s=>[{id:Date.now(),date:"Today",mins:parseInt(mins)||30,words:parseInt(words)||0,verified:!!proof,proof},...s]);setLogging(false);setMins("30");setWords("");setProofType(null);setProofValue("");};
  const epStatus={published:[C.greenLight,C.green],editing:[C.amberLight,C.amberDark],planned:["#F1F5F9","#475569"]};
  const totalWords=writingSessions.reduce((a,s)=>a+s.words,0);
  const verified=writingSessions.filter(s=>s.verified).length;
  return (
    <>
      <SectionHeader title="Creative" sub="Writing, podcast & journal" onBack={onBack}/>
      <InnerTabs tabs={["Journal","Writing","Podcast","Astropolis"]} active={innerTab} onChange={setInnerTab}/>
      {innerTab==="Journal"&&<Journal entries={journalEntries} setEntries={setJournalEntries}/>}
      {innerTab==="Writing"&&(
        <div style={{padding:"16px 20px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <StatCard label="Sessions" value={`${writingSessions.length}/5`} bg={C.purpleLight} textColor={C.purple}/>
            <StatCard label="Verified" value={`${verified}/${writingSessions.length}`} bg={C.greenLight} textColor={C.green}/>
          </div>
          <div style={{background:C.purpleLight,borderRadius:100,height:8,marginBottom:14,overflow:"hidden"}}><div style={{background:C.purple,height:"100%",width:`${Math.min((writingSessions.length/5)*100,100)}%`,borderRadius:100}}/></div>
          {logging?(
            <div style={mkCard()}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}><input style={mkInput()} type="number" placeholder="Mins" value={mins} onChange={e=>setMins(e.target.value)}/><input style={mkInput()} type="number" placeholder="Words" value={words} onChange={e=>setWords(e.target.value)}/></div>
              <div style={{display:"flex",gap:8,marginBottom:proofType?8:10}}>
                <button onClick={()=>setProofType(proofType==="link"?null:"link")} style={{...mkBtn("subtle"),flex:1,background:proofType==="link"?C.purpleLight:"#F5F5F4",color:proofType==="link"?C.purple:C.text,border:`1.5px solid ${proofType==="link"?C.purple:"transparent"}`}}><Link size={12}/> Link</button>
                <button onClick={()=>setProofType(proofType==="image"?null:"image")} style={{...mkBtn("subtle"),flex:1,background:proofType==="image"?C.purpleLight:"#F5F5F4",color:proofType==="image"?C.purple:C.text,border:`1.5px solid ${proofType==="image"?C.purple:"transparent"}`}}><ImageIcon size={12}/> Photo</button>
              </div>
              {proofType==="link"&&<input style={{...mkInput(),marginBottom:10}} placeholder="https://docs.google.com/…" value={proofValue} onChange={e=>setProofValue(e.target.value)}/>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={logSession} style={{...mkBtn("primary"),flex:1}}>Save</button>
                <button onClick={()=>setLogging(false)} style={mkBtn("ghost")}>Cancel</button>
              </div>
            </div>
          ):(
            <button onClick={()=>setLogging(true)} style={{...mkBtn("primary",{width:"100%",background:C.purple,marginBottom:14})}}><Plus size={13}/> Log a session</button>
          )}
          <div style={mkCard()}>{writingSessions.slice(0,5).map((s,i)=><div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<4?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13}}>{s.verified?"✅":"⏳"}</span><span style={{fontWeight:600,fontSize:14}}>{s.mins} mins</span>{s.words>0&&<span style={{fontSize:13,color:C.muted}}>{s.words.toLocaleString()}w</span>}</div>
            <span style={{fontSize:12,color:C.faint}}>{s.date}</span>
          </div>)}</div>
        </div>
      )}
      {innerTab==="Podcast"&&(
        <div style={{padding:"16px 20px"}}>
          <div style={{background:"#FFFBEB",border:`1px solid #FCD34D`,borderRadius:14,padding:"12px 16px",marginBottom:12}}>
            <p style={{fontSize:14,color:C.amberDark,margin:0}}>🎙 3 published · Ep4 editing · Ep5 in progress</p>
          </div>
          {podcastEps.map(ep=>{const [bg,color]=epStatus[ep.status];return<div key={ep.id} style={{...mkCard({marginBottom:8}),display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:12,fontWeight:700,color:C.faint,minWidth:24}}>E{ep.ep}</span><p style={{flex:1,fontSize:14,fontWeight:ep.status==="planned"?400:600,color:ep.status==="planned"?C.faint:C.text,margin:0}}>{ep.title}</p><Pill bg={bg} color={color} text={ep.status}/></div>;})}
        </div>
      )}
      {innerTab==="Astropolis"&&<Astropolis astroSessions={astroSessions} setAstroSessions={setAstroSessions} astroMilestones={astroMilestones} setAstroMilestones={setAstroMilestones} astroComponents={astroComponents} setAstroComponents={setAstroComponents}/>}
    </>
  );
}


// ─────────────────────── ASTROPOLIS ───────────────────────
function Astropolis({astroSessions,setAstroSessions,astroMilestones,setAstroMilestones,astroComponents,setAstroComponents}) {
  const [logging,setLogging]=useState(false);
  const [selectedComp,setSelectedComp]=useState(null);
  const [mins,setMins]=useState("60");
  const [sessionNotes,setSessionNotes]=useState("");

  const today=new Date();
  const deadline=new Date(ASTROPOLIS_DEADLINE);
  const daysLeft=Math.max(0,Math.ceil((deadline-today)/86400000));
  const weeksLeft=Math.floor(daysLeft/7);
  const overallPct=Math.round(astroComponents.reduce((a,c)=>a+c.pct,0)/astroComponents.length);

  // Smart "what to focus on" suggestion — lowest % component that isn't 0 (started) 
  // or the most stuck one if all are started
  const started=astroComponents.filter(c=>c.pct>0);
  const notStarted=astroComponents.filter(c=>c.pct===0);
  const focusSuggestion=(()=>{
    if(notStarted.length>0) return {comp:notStarted[0],reason:"not started yet"};
    const sorted=[...started].sort((a,b)=>a.pct-b.pct);
    return {comp:sorted[0],reason:`only ${sorted[0].pct}% complete`};
  })();

  // Weekly pace needed
  const pctNeeded=100-overallPct;
  const pacePerWeek=weeksLeft>0?(pctNeeded/weeksLeft).toFixed(1):null;

  const recentSession=astroSessions[0];

  const logSession=()=>{
    if(!selectedComp||!mins) return;
    setAstroSessions(s=>[{id:Date.now(),comp:selectedComp,mins:parseInt(mins)||60,notes:sessionNotes,date:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short"})},...s]);
    setLogging(false);setMins("60");setSessionNotes("");setSelectedComp(null);
  };

  const toggleMilestone=(id)=>setAstroMilestones(ms=>ms.map(m=>m.id===id?{...m,done:!m.done}:m));

  const adjustPct=(id,delta)=>setAstroComponents(cs=>cs.map(c=>c.id===id?{...c,pct:Math.min(100,Math.max(0,c.pct+delta))}:c));

  const doneMilestones=astroMilestones.filter(m=>m.done).length;

  return (
    <div style={{padding:"16px 20px"}}>
      {/* Deadline + overall */}
      <div style={{...mkCard({background:"#1C1917",border:"none",marginBottom:14})}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <p style={{fontSize:12,color:"#A8A29E",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 4px"}}>Astropolis</p>
            <p style={{fontSize:22,fontWeight:700,color:"#FEF3C7",margin:"0 0 2px"}}>{overallPct}% complete</p>
            <p style={{fontSize:13,color:"#888",margin:0}}>September deadline</p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:28,fontWeight:700,color:daysLeft<60?"#FCA5A5":daysLeft<90?"#FCD34D":"#6EE7B7",margin:"0 0 2px"}}>{daysLeft}</p>
            <p style={{fontSize:12,color:"#888",margin:0}}>days left</p>
            <p style={{fontSize:11,color:"#666",margin:"2px 0 0"}}>{weeksLeft} weeks</p>
          </div>
        </div>
        <div style={{background:"rgba(255,255,255,0.1)",borderRadius:100,height:8,overflow:"hidden"}}>
          <div style={{background:overallPct>=80?"#6EE7B7":overallPct>=50?"#FCD34D":"#818CF8",height:"100%",width:`${overallPct}%`,borderRadius:100}}/>
        </div>
        <p style={{fontSize:12,color:"#666",margin:"6px 0 0"}}>{doneMilestones}/{astroMilestones.length} milestones · {astroSessions.length} sessions logged{astroSessions.length>0?` · ${astroSessions.reduce((a,s)=>a+s.mins,0)} mins total`:""}</p>
      </div>

      {/* Focus suggestion */}
      {focusSuggestion&&<div style={{...mkCard({marginBottom:14}),display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:44,height:44,borderRadius:12,background:focusSuggestion.comp.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{focusSuggestion.comp.icon}</div>
        <div style={{flex:1}}>
          <p style={{fontSize:12,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",margin:"0 0 2px"}}>Focus next</p>
          <p style={{fontSize:14,fontWeight:700,margin:"0 0 2px"}}>{focusSuggestion.comp.label.split("(")[0].trim()}</p>
          <p style={{fontSize:12,color:C.faint,margin:0}}>{focusSuggestion.reason}{pacePerWeek&&` · need +${pacePerWeek}% per week overall`}</p>
        </div>
        <button onClick={()=>{setSelectedComp(focusSuggestion.comp.id);setLogging(true);}} style={{...mkBtn("primary",{padding:"8px 14px",fontSize:12,borderRadius:8,flexShrink:0})}}>Log it</button>
      </div>}

      {/* Recent session recap */}
      {recentSession&&!logging&&(()=>{const c=astroComponents.find(c=>c.id===recentSession.comp);return(
        <div style={{background:"#F8F4FF",borderRadius:14,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>{c?.icon||"🎲"}</span>
          <p style={{fontSize:13,color:C.purple,margin:0}}>Last session: <strong>{c?.label?.split("(")[0].trim()||recentSession.comp}</strong> · {recentSession.mins} mins{recentSession.notes?` · "${recentSession.notes}"`:""}  <span style={{color:C.faint}}>({recentSession.date})</span></p>
        </div>
      );})()}

      {/* Components */}
      <SectionLabel text="Components"/>
      {astroComponents.map(c=>(
        <div key={c.id} style={{...mkCard({marginBottom:8})}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:c.note?6:8}}>
            <span style={{fontSize:20}}>{c.icon}</span>
            <div style={{flex:1}}>
              <p style={{fontWeight:600,fontSize:14,margin:"0 0 4px"}}>{c.label}</p>
              <div style={{background:"#F0EDEA",borderRadius:100,height:6,overflow:"hidden"}}>
                <div style={{background:c.tc,height:"100%",width:`${c.pct}%`,borderRadius:100,transition:"width 0.3s"}}/>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <button onClick={()=>adjustPct(c.id,-5)} style={{width:24,height:24,borderRadius:"50%",border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted}}>−</button>
              <span style={{fontSize:13,fontWeight:700,minWidth:34,textAlign:"center",color:c.tc}}>{c.pct}%</span>
              <button onClick={()=>adjustPct(c.id,5)} style={{width:24,height:24,borderRadius:"50%",border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted}}>+</button>
            </div>
          </div>
          {c.note&&<p style={{fontSize:11,color:C.faint,margin:"0 0 2px",lineHeight:1.5}}>{c.note}</p>}
        </div>
      ))}

      {/* Log a session */}
      {logging?(
        <div style={mkCard()}>
          <p style={{fontWeight:700,margin:"0 0 12px"}}>Log a game design session</p>
          <p style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",margin:"0 0 8px"}}>What did you work on?</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
            {astroComponents.map(c=>(
              <button key={c.id} onClick={()=>setSelectedComp(selectedComp===c.id?null:c.id)} style={{padding:"8px",borderRadius:10,border:`1.5px solid ${selectedComp===c.id?c.tc:"transparent"}`,background:selectedComp===c.id?c.color:"#F5F5F4",cursor:"pointer",display:"flex",alignItems:"center",gap:6,textAlign:"left"}}>
                <span style={{fontSize:16}}>{c.icon}</span><span style={{fontSize:12,fontWeight:600,color:selectedComp===c.id?c.tc:C.text}}>{c.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <input style={mkInput()} type="number" placeholder="Duration (mins)" value={mins} onChange={e=>setMins(e.target.value)}/>
            <input style={mkInput()} placeholder="Notes" value={sessionNotes} onChange={e=>setSessionNotes(e.target.value)}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={logSession} style={{...mkBtn("primary"),flex:1}}>Save session</button>
            <button onClick={()=>setLogging(false)} style={mkBtn("ghost")}>Cancel</button>
          </div>
        </div>
      ):(
        <button onClick={()=>setLogging(true)} style={{...mkBtn("primary",{width:"100%",marginBottom:16,background:C.purple})}}>
          <Plus size={13}/> Log a session
        </button>
      )}

      {/* Milestones */}
      <SectionLabel text="Milestones"/>
      {astroMilestones.map((m,i)=>(
        <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<astroMilestones.length-1?`1px solid ${C.border}`:"none"}}>
          <button onClick={()=>toggleMilestone(m.id)} style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${m.done?C.green:C.border}`,background:m.done?C.green:"#fff",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {m.done&&<Check size={12} color="#fff" strokeWidth={3}/>}
          </button>
          <p style={{fontSize:14,margin:0,color:m.done?C.muted:C.text,textDecoration:m.done?"line-through":"none"}}>{m.label}</p>
        </div>
      ))}

      {/* Recent sessions */}
      {astroSessions.length>0&&(
        <div style={{marginTop:16}}>
          <SectionLabel text="Recent sessions"/>
          {astroSessions.slice(0,4).map(s=>{
            const c=astroComponents.find(c=>c.id===s.comp);
            return(
              <div key={s.id} style={{...mkCard({marginBottom:8}),display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>{c?.icon||"🎲"}</span>
                <div style={{flex:1}}>
                  <p style={{fontWeight:600,fontSize:13,margin:"0 0 1px"}}>{c?.label||s.comp}</p>
                  <p style={{fontSize:12,color:C.muted,margin:0}}>{s.mins} mins{s.notes?` · ${s.notes}`:""}</p>
                </div>
                <span style={{fontSize:12,color:C.faint}}>{s.date}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ─────────────────────── SUMMER 2026 DISCOVERY ───────────────────────
const AREA_FILTERS=["All","North","South","East","West","Outside"];
const TAB_FILTERS=[
  {key:"all",label:"All"},
  {key:"loc",label:"📍 Locations"},
  {key:"act",label:"🎬 Activities"},
  {key:"evt",label:"🎭 Events"},
];
const TYPE_GROUPS=["Pub","Restaurant","Museum","Park","Market","Music Venue","Comedy Venue","Lido","Day Trip","Film","Exhibition","Activity","Festival","Play","Silent Disco","Club Night"];

function SummerDiscover({funList,setFunList,friends,onClose}) {
  const [tab,setTab]=useState("all");
  const [area,setArea]=useState("All");
  const [search,setSearch]=useState("");
  const [added,setAdded]=useState({});
  const [liveData,setLiveData]=useState(null);
  const [refreshing,setRefreshing]=useState(false);
  const [lastRefresh,setLastRefresh]=useState(null);

  const seasonInfo=getSeasonInfo();
  const displayData=liveData||SUMMER_ITEMS;

  const refresh=async()=>{
    setRefreshing(true);
    try{
      const data=await fetchSeasonalData(DISCOVER_SHEET_ID);
      if(data){setLiveData(data);setLastRefresh(new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}));}
    }catch{}
    setRefreshing(false);
  };

  const addToList=(item)=>{
    if(added[item.id]) return;
    setFunList(list=>[...list,{
      id:Date.now(),
      type:"activity",
      title:item.name,
      area:item.area,
      icon:TYPE_ICONS[item.type]||"⭐",
      done:false,
      friends:[],
      date:null,
      notes:`${item.type} · ${item.when} · ${item.price} · ${item.station}`,
    }]);
    setAdded(a=>({...a,[item.id]:true}));
  };

  const filtered=displayData.filter(i=>{
    if(tab!=="all"&&i.tab!==tab) return false;
    if(area!=="All"&&i.area!==area) return false;
    if(search&&!i.name.toLowerCase().includes(search.toLowerCase())&&!i.type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const alreadyInList=new Set(funList.map(f=>f.title));

  return (
    <div style={{position:"absolute",inset:0,background:C.bg,zIndex:55,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"16px 20px 12px",borderBottom:`1px solid ${C.border}`,background:C.white}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <button onClick={onClose} style={{background:"#F5F5F4",border:"none",borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
            <ChevronLeft size={18} color={C.text}/>
          </button>
          <div style={{flex:1}}>
            <h1 style={{fontSize:18,fontWeight:700,margin:0}}>{seasonInfo.emoji} {seasonInfo.label}</h1>
            <p style={{fontSize:12,color:C.muted,margin:0}}>{displayData.length} picks{liveData?" · live from sheet":" · embedded"}{lastRefresh?` · updated ${lastRefresh}`:""}</p>
          </div>
          <button onClick={refresh} disabled={refreshing} style={{background:C.amberLight,border:`1px solid #FCD34D`,borderRadius:10,padding:"6px 10px",cursor:refreshing?"default":"pointer",fontSize:12,fontWeight:700,color:C.amberDark,flexShrink:0}}>
            {refreshing?"⏳":liveData?"🔄 Sync":"🔄 Load live"}
          </button>
        </div>
        <input style={{...mkInput({padding:"8px 12px",fontSize:13}),marginBottom:10}} placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
        {/* Tab filter */}
        <div style={{display:"flex",gap:6,marginBottom:8,overflowX:"auto",paddingBottom:2}}>
          {TAB_FILTERS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} style={{padding:"5px 12px",borderRadius:20,border:"none",background:tab===t.key?C.amber:"#F5F5F4",color:tab===t.key?"#fff":C.muted,fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0}}>{t.label}</button>
          ))}
        </div>
        {/* Area filter */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
          {AREA_FILTERS.map(a=>(
            <button key={a} onClick={()=>setArea(a)} style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${area===a?C.amber:C.border}`,background:area===a?C.amberLight:"#fff",color:area===a?C.amberDark:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",flexShrink:0}}>{a}</button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{flex:1,overflowY:"auto",padding:"12px 20px"}}>
        <p style={{fontSize:12,color:C.faint,margin:"0 0 10px"}}>{filtered.length} results</p>
        {filtered.map(item=>{
          const isAdded=added[item.id]||alreadyInList.has(item.name);
          return(
            <div key={item.id} style={{...mkCard({marginBottom:8})}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{fontSize:24,flexShrink:0,marginTop:2}}>{TYPE_ICONS[item.type]||"⭐"}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:4}}>
                    <p style={{fontWeight:700,fontSize:14,margin:0}}>{item.name}</p>
                    <span style={{background:item.rec?C.greenLight:C.amberLight,color:item.rec?C.green:C.amberDark,borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:700}}>{item.rec?"Recurring":"One time"}</span>
                  </div>
                  <p style={{fontSize:13,color:C.muted,lineHeight:1.5,margin:"0 0 6px"}}>{item.desc}</p>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:C.faint}}>📍 {item.area}</span>
                    <span style={{fontSize:11,color:C.faint}}>🕐 {item.when}</span>
                    <span style={{fontSize:11,color:C.faint}}>💰 {item.price}</span>
                  </div>
                  {item.station&&<p style={{fontSize:11,color:C.faint,margin:"3px 0 0"}}>🚇 {item.station}</p>}
                </div>
              </div>
              <button onClick={()=>addToList(item)} disabled={isAdded} style={{...mkBtn(isAdded?"green":"ghost",{width:"100%",marginTop:10,fontSize:13,padding:"8px"}),opacity:isAdded?0.7:1}}>
                {isAdded?<><Check size={13}/> Added to your list</>:<><Plus size={13}/> Add to Fun list</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Fun({funList,setFunList,friends,onBack}) {
  const [innerTab,setInnerTab]=useState("Locations");
  const [adding,setAdding]=useState(false);
  const [showSummer,setShowSummer]=useState(false);
  const [newItem,setNewItem]=useState({title:"",area:"",icon:"⭐",notes:"",friends:[],date:""});
  const toggle=id=>setFunList(list=>list.map(i=>i.id===id?{...i,done:!i.done}:i));
  const addItem=()=>{if(!newItem.title.trim())return;setFunList(list=>[...list,{id:Date.now(),type:innerTab==="Locations"?"location":"activity",title:newItem.title,area:newItem.area,icon:newItem.icon,done:false,friends:newItem.friends,date:newItem.date||null,notes:newItem.notes||null}]);setNewItem({title:"",area:"",icon:"⭐",notes:"",friends:[],date:""});setAdding(false);};
  const toggleFriend=id=>setNewItem(n=>({...n,friends:n.friends.includes(id)?n.friends.filter(f=>f!==id):[...n.friends,id]}));
  const type=innerTab==="Locations"?"location":"activity";
  const todo=funList.filter(i=>!i.done&&i.type===type);
  const done=funList.filter(i=>i.done&&i.type===type);
  const ICONS=innerTab==="Locations"?["🍽️","🎷","🍸","🎨","🏛️","🌳","☕","🎭"]:["✈️","😂","🏄","🎬","🎮","🏕️","🎡","⭐"];
  return (
    <>
      {showSummer&&<SummerDiscover funList={funList} setFunList={setFunList} friends={friends} onClose={()=>setShowSummer(false)}/>}
      <SectionHeader title="Fun stuff" sub="Life isn't all goals" onBack={onBack} action={
        <button onClick={()=>setShowSummer(true)} style={{background:"#FFFBEB",border:`1px solid #FCD34D`,borderRadius:10,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:700,color:C.amberDark,display:"flex",alignItems:"center",gap:5,marginTop:2,flexShrink:0}}>
          {getSeasonInfo().emoji} {getSeasonInfo().season}
        </button>
      }/>
      <InnerTabs tabs={["Locations","Activities"]} active={innerTab} onChange={t=>{setInnerTab(t);setAdding(false);}}/>
      <div style={{padding:"16px 20px"}}>
        {todo.map(item=>{const missingDate=item.friends?.length>0&&!item.date;const missingFriends=item.date&&(!item.friends||!item.friends.length);return(
          <div key={item.id} style={mkCard()}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <button onClick={()=>toggle(item.id)} style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${C.border}`,background:"#fff",cursor:"pointer",flexShrink:0,marginTop:2}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:20}}>{item.icon}</span><p style={{fontWeight:600,fontSize:14,margin:0}}>{item.title}</p></div>
                {item.area&&<p style={{fontSize:13,color:C.muted,margin:"3px 0 0"}}>📍 {item.area}</p>}
                {item.date&&<p style={{fontSize:13,color:C.amber,margin:"3px 0 0",fontWeight:600}}>📅 {new Date(item.date).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</p>}
                <FriendAvatarRow ids={item.friends} friends={friends}/>
                {(missingDate||missingFriends)&&<p style={{fontSize:12,color:C.red,margin:"5px 0 0",fontWeight:600}}>⚠️ {missingDate?"Pick a date!":"Tag a friend!"}</p>}
                {item.friends?.length>0&&item.date&&(()=>{
                  const dateStr=new Date(item.date).toLocaleDateString("en-GB",{day:"numeric",month:"long"});
                  const msg=encodeURIComponent(`Hey! I've got ${item.title} booked for ${dateStr} — you in? 🎉`);
                  return(
                    <div style={{display:"flex",gap:6,marginTop:8}}>
                      <a href={`https://wa.me/?text=${msg}`} target="_blank" rel="noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"7px",borderRadius:8,background:"#DCF8C6",color:"#075E54",fontSize:12,fontWeight:600,textDecoration:"none"}}>📲 WhatsApp</a>
                      <a href={`sms:?body=${msg}`} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"7px",borderRadius:8,background:C.blueLight,color:C.blue,fontSize:12,fontWeight:600,textDecoration:"none"}}>💬 Message</a>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        );})}
        {adding?(
          <div style={mkCard()}>
            <p style={{fontWeight:700,margin:"0 0 12px"}}>Add a {innerTab==="Locations"?"location":"activity"}</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{ICONS.map(ic=><button key={ic} onClick={()=>setNewItem(n=>({...n,icon:ic}))} style={{fontSize:22,background:newItem.icon===ic?C.amberLight:"#F5F5F4",border:`1.5px solid ${newItem.icon===ic?C.amber:"transparent"}`,borderRadius:8,padding:"4px 6px",cursor:"pointer"}}>{ic}</button>)}</div>
            <input style={{...mkInput(),marginBottom:8}} placeholder={innerTab==="Locations"?"Place name":"Activity"} value={newItem.title} onChange={e=>setNewItem(n=>({...n,title:e.target.value}))} autoFocus/>
            {innerTab==="Locations"&&<input style={{...mkInput(),marginBottom:8}} placeholder="Area (e.g. Dalston)" value={newItem.area} onChange={e=>setNewItem(n=>({...n,area:e.target.value}))}/>}
            <input style={{...mkInput(),marginBottom:10}} type="date" value={newItem.date} onChange={e=>setNewItem(n=>({...n,date:e.target.value}))}/>
            <p style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",margin:"0 0 8px"}}>Who to bring?</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{friends.map(f=><button key={f.id} onClick={()=>toggleFriend(f.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:20,border:`1.5px solid ${newItem.friends.includes(f.id)?C.amber:C.border}`,background:newItem.friends.includes(f.id)?C.amberLight:"#fff",cursor:"pointer"}}><Avatar name={f.name} colorIdx={f.colorIdx} size={20}/><span style={{fontSize:12,fontWeight:600,color:newItem.friends.includes(f.id)?C.amberDark:C.text}}>{f.name}</span></button>)}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={addItem} style={{...mkBtn("primary"),flex:1}}>Add</button>
              <button onClick={()=>setAdding(false)} style={mkBtn("ghost")}>Cancel</button>
            </div>
          </div>
        ):(
          <button onClick={()=>setAdding(true)} style={{...mkBtn("ghost",{width:"100%",marginBottom:done.length?16:0})}}><Plus size={13}/> Add {innerTab==="Locations"?"a location":"an activity"}</button>
        )}
        {done.length>0&&<><SectionLabel text="Done ✓" style={{marginTop:8}}/>{done.map(item=><div key={item.id} style={{...mkCard({marginBottom:8,opacity:0.5}),display:"flex",alignItems:"center",gap:12}}><div style={{width:26,height:26,borderRadius:"50%",background:C.greenLight,border:`2px solid ${C.green}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Check size={12} color={C.green}/></div><span style={{fontSize:18}}>{item.icon}</span><p style={{flex:1,fontSize:14,color:C.muted,margin:0,textDecoration:"line-through"}}>{item.title}</p></div>)}</>}
      </div>
    </>
  );
}

function MusicTab({lastMusicPick,setLastMusicPick,onBack}) {
  const [innerTab,setInnerTab]=useState("Today");
  const [phase,setPhase]=useState(lastMusicPick?"result":"idle");
  const [rec,setRec]=useState(lastMusicPick);
  const [loadingStep,setLoadingStep]=useState(0);
  const [lastTheme,setLastTheme]=useState(null);
  const [history,setHistory]=useState([]);
  const [playlistStatus,setPlaylistStatus]=useState(null);
  const [emailStatus,setEmailStatus]=useState(null);
  const [error,setError]=useState("");
  const STEPS=["Scanning your Spotify library…","Reading your taste…","Selecting today's theme…","Assembling picks…"];
  useEffect(()=>{
    try{const lt=localStorage.getItem("ls_music_theme");if(lt)setLastTheme(lt);}catch{}
    try{const hist=localStorage.getItem("ls_music_history");if(hist)setHistory(JSON.parse(hist));}catch{}
  },[]);
  useEffect(()=>{if(phase!=="loading")return;const t=setInterval(()=>setLoadingStep(s=>(s+1)%STEPS.length),2200);return()=>clearInterval(t);},[phase]);
  async function generate(){setPhase("loading");setLoadingStep(0);setError("");setPlaylistStatus(null);setEmailStatus(null);const dateStr=new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});const season=getSeason();const noRepeat=lastTheme?`\nIMPORTANT: Last pick used theme "${lastTheme}". Choose a different theme.`:"";
  const system=`You are a sophisticated music curator for a UK listener. Today is ${dateStr}. Season: ${season}.${noRepeat}\nUse Spotify tools to explore the user's library. Pick the most compelling theme:\n- musicals, full_album, best_of_artist, songs_of_the_day, seasonal, soundtrack, genre_gateway, throwback_era\nReturn ONLY valid JSON: {"theme":"full_album","title":"...","artist":"...","tagline":"...","description":"...","tracks":[{"name":"...","artist":"...","uri":"spotify:track:..."}],"open_url":"https://open.spotify.com/...","mood_tags":["..."]}`;
  try{const data=await callClaude({system,messages:[{role:"user",content:"Generate my daily music recommendation."}],mcpServers:[{type:"url",url:SPOTIFY_MCP,name:"spotify"}]});const text=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");const parsed=JSON.parse(text.replace(/```json\n?|```/g,"").trim());const newHistory=[{...parsed,savedAt:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short"})},...history].slice(0,7);try{localStorage.setItem("ls_music_theme",parsed.theme);localStorage.setItem("ls_music_pick",JSON.stringify(parsed));localStorage.setItem("ls_music_history",JSON.stringify(newHistory));}catch{}setRec(parsed);setLastTheme(parsed.theme);setHistory(newHistory);setLastMusicPick(parsed);setPhase("result");}catch{setError("Couldn't reach Spotify. Make sure it's connected in Claude settings.");setPhase("error");}}
  const GMAIL_MCP_URL = "https://gmailmcp.googleapis.com/mcp/v1";
  async function saveToSpotify() {
    if(!rec||playlistStatus) return;
    setPlaylistStatus("saving");
    const uris=(rec.tracks||[]).map(t=>t.uri).filter(Boolean);
    try {
      await callClaude({system:"You are a Spotify assistant. Create playlists as requested.",messages:[{role:"user",content:`Create a Spotify playlist called "${rec.title}" with description "Curated by Life, Sorted" and add these tracks: ${uris.join(", ")}`}],mcpServers:[{type:"url",url:SPOTIFY_MCP,name:"spotify"}]});
      setPlaylistStatus("saved");
    } catch { setPlaylistStatus("error"); }
  }
  async function emailPick() {
    if(!rec||emailStatus) return;
    setEmailStatus("sending");
    const trackList=(rec.tracks||[]).map((t,i)=>`${i+1}. ${t.name} — ${t.artist}`).join("\n");
    const body=`Your Daily Music Pick\n\n${rec.title}\n"${rec.tagline}"\n\n${rec.description}\n\nTracklist:\n${trackList}${rec.open_url?`\n\nListen: ${rec.open_url}`:""}\n\n— Life, Sorted`;
    try {
      await callClaude({system:"You are a Gmail assistant. Find the authenticated user's email and send the email exactly as instructed.",messages:[{role:"user",content:`Send me an email with subject "🎵 Your Daily Music Pick: ${rec.title}" and body:\n\n${body}`}],mcpServers:[{type:"url",url:GMAIL_MCP_URL,name:"gmail"}]});
      setEmailStatus("sent");
    } catch { setEmailStatus("error"); }
  }
  const themeInfo=rec?MUSIC_THEMES[rec.theme]:null;
  return (
    <>
      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
      <SectionHeader title="Music" sub="Daily picks from your Spotify" onBack={onBack}/>
      <InnerTabs tabs={["Today","History"]} active={innerTab} onChange={setInnerTab}/>
      {innerTab==="Today"&&<div style={{padding:"16px 20px"}}>
        {phase==="idle"&&<div style={{textAlign:"center",padding:"32px 0 24px"}}><div style={{width:72,height:72,borderRadius:"50%",background:C.amberLight,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center"}}><Music size={32} color={C.amber}/></div><p style={{fontSize:15,fontWeight:700,margin:"0 0 6px"}}>Ready for today's pick?</p><p style={{fontSize:13,color:C.muted,margin:"0 0 24px",lineHeight:1.65}}>Claude scans your Spotify and curates one recommendation.</p><button onClick={generate} style={{...mkBtn("primary"),margin:"0 auto"}}>Get today's pick</button></div>}
        {phase==="loading"&&<div style={{...mkCard(),textAlign:"center",padding:"32px 20px",overflow:"hidden",position:"relative"}}><Music size={26} color={C.amber} style={{margin:"0 auto 16px",display:"block"}}/><p style={{fontWeight:700,fontSize:15,margin:"0 0 6px"}}>{STEPS[loadingStep]}</p><p style={{fontSize:13,color:C.muted,margin:"0 0 20px"}}>About 20 seconds</p><div style={{height:4,background:C.amberLight,borderRadius:100,overflow:"hidden",position:"relative"}}><div style={{position:"absolute",top:0,left:0,height:"100%",width:"40%",background:C.amber,borderRadius:100,animation:"shimmer 1.4s ease infinite"}}/></div></div>}
        {phase==="error"&&<div style={{...mkCard({background:C.redLight,border:"none"})}}><p style={{fontWeight:700,color:C.red,margin:"0 0 6px"}}>Something went wrong</p><p style={{fontSize:13,color:C.red,margin:"0 0 14px",opacity:0.85}}>{error}</p><button onClick={()=>setPhase("idle")} style={mkBtn("danger")}>Try again</button></div>}
        {phase==="result"&&rec&&<>
          <div style={{marginBottom:12}}><Pill bg={themeInfo?.bg} color={themeInfo?.color} text={themeInfo?.label}/></div>
          <div style={mkCard()}><div style={{display:"flex",gap:12,marginBottom:12}}><div style={{width:52,height:52,borderRadius:14,background:themeInfo?.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Music size={24} color={themeInfo?.color}/></div><div style={{flex:1}}><p style={{fontWeight:700,fontSize:17,margin:"0 0 2px"}}>{rec.title}</p>{rec.artist&&<p style={{fontSize:13,color:C.amber,fontWeight:600,margin:0}}>{rec.artist}</p>}</div></div>{rec.tagline&&<p style={{fontSize:14,color:C.muted,fontStyle:"italic",margin:"0 0 10px"}}>"{rec.tagline}"</p>}<p style={{fontSize:14,lineHeight:1.7,margin:0}}>{rec.description}</p></div>
          {rec.tracks?.length>0&&<div style={mkCard()}><SectionLabel text={`Tracklist · ${rec.tracks.length} songs`}/>{rec.tracks.map((t,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<rec.tracks.length-1?`1px solid ${C.border}`:"none"}}><span style={{fontSize:12,color:C.faint,minWidth:18,textAlign:"right"}}>{i+1}</span><div style={{flex:1,minWidth:0}}><p style={{margin:0,fontSize:14,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.name}</p><p style={{margin:0,fontSize:12,color:C.muted}}>{t.artist}</p></div></div>)}</div>}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {rec.open_url&&<a href={rec.open_url} target="_blank" rel="noreferrer" style={{...mkBtn("primary"),textDecoration:"none"}}><Music size={14}/> Open in Spotify</a>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={saveToSpotify} disabled={!!playlistStatus} style={{...mkBtn(playlistStatus==="saved"?"green":"ghost"),flex:1}}>
                {playlistStatus==="saving"?"Saving…":playlistStatus==="saved"?<><Check size={13}/> Saved!</>:playlistStatus==="error"?"Failed":<><Plus size={13}/> Save playlist</>}
              </button>
              <button onClick={emailPick} disabled={!!emailStatus} style={{...mkBtn("subtle"),flex:1,border:`1.5px solid ${C.border}`}}>
                {emailStatus==="sending"?"Sending…":emailStatus==="sent"?<><Check size={13}/> Sent!</>:emailStatus==="error"?"Failed":"Email me"}
              </button>
            </div>
            <button onClick={generate} style={{...mkBtn("subtle",{width:"100%",color:C.muted})}}>Get a different pick</button>
          </div>
        </>}
      </div>}
      {innerTab==="History"&&<div style={{padding:"16px 20px"}}>
        {history.length===0?<div style={{textAlign:"center",padding:"40px 0"}}><p style={{fontSize:28,margin:"0 0 8px"}}>🎵</p><p style={{fontSize:14,color:C.muted}}>Your last 7 picks appear here</p></div>:history.map((h,i)=>{const t=MUSIC_THEMES[h.theme];return<div key={i} style={{...mkCard({marginBottom:8}),display:"flex",alignItems:"center",gap:12}}><div style={{width:40,height:40,borderRadius:11,background:t?.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Music size={18} color={t?.color}/></div><div style={{flex:1,minWidth:0}}><p style={{fontWeight:600,fontSize:14,margin:"0 0 2px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.title}</p><div style={{display:"flex",alignItems:"center",gap:6}}><Pill bg={t?.bg} color={t?.color} text={t?.label}/>{h.savedAt&&<span style={{fontSize:11,color:C.faint}}>{h.savedAt}</span>}</div></div>{h.open_url&&<a href={h.open_url} target="_blank" rel="noreferrer" style={{color:C.amber,fontSize:18,textDecoration:"none"}}>›</a>}</div>;})}
      </div>}
    </>
  );
}

const BUDGET_SHEET_ID = "1cjt-b_RTC15YrCg8oz6kFt45zJpkzVlR-qmufGWzreA";

function Finance({onBack,onDataLoaded}) {
  const [innerTab,setInnerTab]=useState("Dashboard");
  const [rawAmount,setRawAmount]=useState("");
  const [selectedCat,setSelectedCat]=useState(null);
  const [notesVal,setNotesVal]=useState("");
  const [txList,setTxList]=useState([
    {id:1,name:"Tesco",cat:"Groceries",type:"Needs",amount:47.20,date:"Today",icon:"🛒"},
    {id:2,name:"Dishoom",cat:"Eating out",type:"Wants",amount:38.00,date:"Yesterday",icon:"🍽️"},
    {id:3,name:"Netflix",cat:"Subscriptions",type:"Wants",amount:17.99,date:"21 Apr",icon:"🎬"},
    {id:4,name:"PureGym",cat:"Gym",type:"Needs",amount:24.99,date:"20 Apr",icon:"🏋️"},
  ]);
  const [toast,setToast]=useState(false);
  const [sheetData,setSheetData]=useState(null);
  const [sheetLoading,setSheetLoading]=useState(false);
  const [sheetError,setSheetError]=useState(null);

  // Fetch real data from the budget Google Sheet
  const syncSheet=async()=>{
    setSheetLoading(true); setSheetError(null);
    try {
      const url=`https://docs.google.com/spreadsheets/d/${BUDGET_SHEET_ID}/gviz/tq?tqx=out:csv`;
      const res=await fetch(url);
      if(!res.ok) throw new Error("Sheet not accessible");
      const text=await res.text();
      const rows=parseSheetCSV(text);
      // Parse key values from the sheet structure
      const parsed={income:0,takeHome:0,debt:0,needs:{spent:0,target:0},wants:{spent:0,target:0},savings:{spent:0,target:0}};
      for(const row of rows){
        const label=(row[0]||"").trim();
        const val=parseFloat((row[1]||"").replace(/[£,]/g,""))||0;
        if(label.includes("Pre-Tax Salary"))         parsed.income=val;
        if(label.includes("Projected Take-Home (Monthly)")) parsed.takeHome=val;
        if(label.includes("Total Liabilities"))      parsed.debt=val;
        if(label==="Needs (Bills/Groceries/Debt)")   {parsed.needs.target=parseFloat((row[2]||"").replace(/[£,]/g,""))||0;parsed.needs.spent=parseFloat((row[3]||"").replace(/[£,]/g,""))||0;}
        if(label==="Wants (Daily/Subs/One-offs)")    {parsed.wants.target=parseFloat((row[2]||"").replace(/[£,]/g,""))||0;parsed.wants.spent=parseFloat((row[3]||"").replace(/[£,]/g,""))||0;}
        if(label==="Savings (Sinking Funds)")        {parsed.savings.target=parseFloat((row[2]||"").replace(/[£,]/g,""))||0;parsed.savings.spent=parseFloat((row[3]||"").replace(/[£,]/g,""))||0;}
      }
      setSheetData(parsed);
      if(onDataLoaded) onDataLoaded(parsed);
    } catch(e) {
      setSheetError("Couldn't reach sheet — showing estimates. Check sheet is publicly shared.");
    }
    setSheetLoading(false);
  };

  // Auto-sync on mount
  useEffect(()=>{syncSheet();},[]);

  const CATS=[{id:"groceries",icon:"🛒",name:"Groceries",type:"Needs"},{id:"transport",icon:"🚇",name:"Transport",type:"Needs"},{id:"eating-out",icon:"🍽️",name:"Eating out",type:"Wants"},{id:"entertainment",icon:"🎬",name:"Entertainment",type:"Wants"},{id:"subscriptions",icon:"📱",name:"Subscriptions",type:"Wants"},{id:"bills",icon:"📄",name:"Bills",type:"Needs"},{id:"savings",icon:"💰",name:"Savings",type:"Savings"},{id:"other",icon:"✦",name:"Other",type:"Wants"}];
  const typeColors={Needs:[C.redLight,C.red],Wants:[C.amberLight,C.amberDark],Savings:[C.greenLight,C.green]};

  // Use live sheet data if available, else fallback estimates
  const income=sheetData?.takeHome||2543;
  const debt=sheetData?.debt||3540;
  const needsSpent=sheetData?.needs?.spent||612;
  const wantsSpent=sheetData?.wants?.spent||235;
  const savingsSpent=sheetData?.savings?.spent||0;
  const needsTarget=sheetData?.needs?.target||(income*0.5);
  const wantsTarget=sheetData?.wants?.target||(income*0.3);
  const savingsTarget=sheetData?.savings?.target||(income*0.2);
  const spent=txList.reduce((a,t)=>a+t.amount,0);
  const numpad=(k)=>{if(k==="del"){setRawAmount(r=>r.slice(0,-1));}else if(k==="."&&rawAmount.includes(".")){return;}else if(rawAmount.split(".")[1]?.length>=2){return;}else{if(rawAmount===""&&k===".")setRawAmount("0.");else setRawAmount(r=>r+k);}};
  const logSpend=()=>{const amt=parseFloat(rawAmount);if(!amt||!selectedCat)return;const cat=CATS.find(c=>c.id===selectedCat);setTxList(t=>[{id:Date.now(),name:notesVal||cat.name,cat:cat.name,type:cat.type,amount:amt,date:"Today",icon:cat.icon},...t]);setRawAmount("");setSelectedCat(null);setNotesVal("");setToast(true);setTimeout(()=>setToast(false),2500);};
  const amtDisplay=rawAmount||"0.00";
  const canLog=parseFloat(rawAmount)>0&&selectedCat;
  return (
    <>
      <SectionHeader title="Finance" sub="April 2026 · £2,543 take-home" onBack={onBack}/>
      <InnerTabs tabs={["Dashboard","Log spend"]} active={innerTab} onChange={setInnerTab}/>
      {innerTab==="Dashboard"&&<div style={{padding:"16px 20px"}}>
        {sheetError&&<div style={{background:C.amberLight,borderRadius:10,padding:"8px 12px",marginBottom:10,fontSize:12,color:C.amberDark}}>{sheetError}</div>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <p style={{fontSize:12,color:C.muted,margin:0}}>{sheetData?"✅ Live from sheet":"📊 Estimated figures"}</p>
          <button onClick={syncSheet} disabled={sheetLoading} style={{fontSize:12,color:C.amber,background:"none",border:"none",cursor:"pointer",fontWeight:600}}>{sheetLoading?"Syncing…":"🔄 Sync sheet"}</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <StatCard label="Logged spend" value={`£${spent.toFixed(0)}`} sub={`of £${Math.round(income).toLocaleString()} income`} bg={C.redLight} textColor={C.red}/>
          <StatCard label="Left" value={`£${Math.round(income-spent).toLocaleString()}`} sub={`${new Date(new Date(new Date().getFullYear(),new Date().getMonth()+1,0)-new Date()).toFixed?.(0)||"~"}d left this month`} bg={C.greenLight} textColor={C.green}/>
        </div>
        <div style={mkCard()}>
          <SectionLabel text="50/30/20 rule"/>
          {[[" Needs",needsSpent,needsTarget,C.red,C.redLight],["🎉 Wants",wantsSpent,wantsTarget,C.amber,C.amberLight],["💰 Savings",savingsSpent,savingsTarget,C.green,C.greenLight]].map(([label,spent_,target,color,bg])=>{const pct=Math.round((spent_/target)*100);return<div key={label} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:13,fontWeight:600}}>{label}</span><span style={{fontSize:13,color:C.muted}}>£{spent_} / £{target}</span></div>
            <div style={{background:"#F0EDEA",borderRadius:100,height:7,overflow:"hidden"}}><div style={{background:color,height:"100%",width:`${Math.min(pct,100)}%`,borderRadius:100}}/></div>
            <p style={{fontSize:11,color:pct===0?C.red:C.green,margin:"4px 0 0",fontWeight:600}}>{pct===0?"Not started yet":`On track · ${pct}% used`}</p>
          </div>;})}
        </div>
        <div style={{...mkCard({background:C.blueLight,border:"none"})}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div><p style={{fontWeight:700,color:C.blue,fontSize:15,margin:"0 0 2px"}}>Debt tracker</p><p style={{fontSize:12,color:C.blue,opacity:0.8,margin:0}}>Monzo Flex + Overdraft</p></div>
            <div style={{textAlign:"right"}}><p style={{fontSize:20,fontWeight:700,color:C.red,margin:0}}>£{Math.round(debt).toLocaleString()}</p><p style={{fontSize:12,color:C.blue,margin:0}}>Debt-free Oct 2026</p></div>
          </div>
          <div style={{background:"rgba(255,255,255,0.4)",borderRadius:100,height:6,overflow:"hidden"}}><div style={{background:C.green,height:"100%",width:"12%",borderRadius:100}}/></div>
          <p style={{fontSize:11,color:C.blue,margin:"5px 0 0"}}>12% paid · keep paying £202/mo</p>
        </div>
        <SectionLabel text="Recent transactions"/>
        {txList.slice(0,4).map(tx=>{const [bg,tc]=typeColors[tx.type]||typeColors.Wants;return<div key={tx.id} style={{...mkCard({marginBottom:8}),display:"flex",alignItems:"center",gap:12}}><div style={{width:38,height:38,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{tx.icon}</div><div style={{flex:1}}><p style={{fontWeight:600,fontSize:14,margin:"0 0 1px"}}>{tx.name}</p><p style={{fontSize:12,color:C.muted,margin:0}}>{tx.cat} · {tx.date}</p></div><p style={{fontWeight:700,fontSize:14,color:C.red,margin:0}}>-£{tx.amount.toFixed(2)}</p></div>;})}
      </div>}
      {innerTab==="Log spend"&&<div style={{padding:"16px 20px"}}>
        {toast&&<div style={{background:C.green,borderRadius:10,padding:"10px 14px",marginBottom:10,textAlign:"center",fontSize:13,fontWeight:600,color:"#fff"}}>✓ Logged!</div>}
        <div style={{background:"#F5F5F4",borderRadius:14,padding:"20px",textAlign:"center",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:4}}>
            <span style={{fontSize:28,color:C.muted}}>£</span>
            <span style={{fontSize:52,fontWeight:700,color:parseFloat(rawAmount)>0?C.text:C.faint,letterSpacing:-1}}>{amtDisplay}</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
          {["1","2","3","4","5","6","7","8","9",".","0","del"].map(k=><button key={k} onClick={()=>numpad(k)} style={{borderRadius:10,padding:"14px",border:"none",background:"#F5F5F4",fontSize:18,fontWeight:600,cursor:"pointer",color:C.text}}>{k==="del"?"⌫":k}</button>)}
        </div>
        <SectionLabel text="Category"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {CATS.map(c=>{const sel=selectedCat===c.id;const [bg,tc]=typeColors[c.type]||typeColors.Wants;return<button key={c.id} onClick={()=>setSelectedCat(sel?null:c.id)} style={{borderRadius:10,padding:"10px 8px",border:`1.5px solid ${sel?tc:"transparent"}`,background:sel?bg:"#F5F5F4",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{c.icon}</span><span style={{fontSize:13,fontWeight:600,color:sel?tc:C.text,flex:1,textAlign:"left"}}>{c.name}</span><span style={{fontSize:10,fontWeight:700,background:sel?"rgba(255,255,255,0.5)":"#e5e5e5",color:tc,borderRadius:4,padding:"2px 5px"}}>{c.type}</span></button>;})}
        </div>
        <input style={{...mkInput(),marginBottom:10}} placeholder="Notes (optional)" value={notesVal} onChange={e=>setNotesVal(e.target.value)}/>
        <button onClick={logSpend} disabled={!canLog} style={{...mkBtn("primary",{width:"100%"}),opacity:canLog?1:0.4}}>Log spend → Google Sheet</button>
      </div>}
    </>
  );
}

function WeeklyReview({friends,workouts,writingSessions,journalEntries,funList,checkIns,onClose,weeklyReviews,setWeeklyReviews}) {
  const [intention,setIntention]=useState("");
  const [saved,setSaved]=useState(false);
  const [aiInsight,setAiInsight]=useState(null);
  const [loadingInsight,setLoadingInsight]=useState(false);
  const totalWords=writingSessions.reduce((a,s)=>a+s.words,0);
  const verifiedGym=workouts.filter(w=>w.verified).length;
  const contactedFriends=friends.filter(f=>f.lastContact<=7).length;
  const funDone=funList.filter(f=>f.done).length;
  const moodCounts=journalEntries.reduce((acc,e)=>{if(e.mood)acc[e.mood]=(acc[e.mood]||0)+1;return acc},{});
  const topMood=Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0]?.[0];

  // Check-in stats for this week
  const weekDates=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return d.toISOString().slice(0,10);});
  const weekCheckIns=weekDates.filter(d=>(checkIns||{})[d]).map(d=>(checkIns||{})[d]);
  const avgEnergy=weekCheckIns.length>0?Math.round(weekCheckIns.reduce((a,c)=>a+c.energy,0)/weekCheckIns.length*10)/10:null;
  const topCheckMood=weekCheckIns.length>0?(()=>{const mc={};weekCheckIns.forEach(c=>{mc[c.mood]=(mc[c.mood]||0)+1;});return Object.entries(mc).sort((a,b)=>b[1]-a[1])[0]?.[0];})():null;
  const getAiInsight=async()=>{setLoadingInsight(true);const prompt=`Supportive life coach reviewing someone's week. Data: Writing: ${writingSessions.length} sessions, ${totalWords} words. Workouts: ${workouts.length}, ${verifiedGym} gym-verified. Friends: ${contactedFriends}/${friends.length}. Fun done: ${funDone}. Mood: ${topMood||"not tracked"}. Average energy this week: ${avgEnergy||"not tracked"}/5. Journal: ${journalEntries.slice(0,2).map(e=>e.transcript).join(" | ")}. Give 2-3 warm, specific sentences and one concrete suggestion for next week.`;try{const res=await fetch("/.netlify/functions/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:prompt}]})});const data=await res.json();setAiInsight(data.content?.[0]?.text);}catch{setAiInsight("Couldn't connect.");}setLoadingInsight(false);};
  const saveReview=()=>{setWeeklyReviews(r=>[{id:Date.now(),date:"Week of 21 Apr",stats:{workouts:workouts.length,words:totalWords,friends:contactedFriends,mood:topMood},intention},...r]);setSaved(true);};
  return (
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",zIndex:60,display:"flex",alignItems:"flex-end"}}>
      <div style={{background:C.bg,borderRadius:"20px 20px 0 0",width:"100%",maxHeight:"90%",overflowY:"auto",padding:"20px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div><h2 style={{fontSize:20,fontWeight:700,margin:0}}>Weekly Review</h2><p style={{fontSize:13,color:C.muted,margin:"4px 0 0"}}>Week of 21 April 2026</p></div>
          <button onClick={onClose} style={{background:"#F5F5F4",border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={16}/></button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <StatCard label="Workouts" value={workouts.length} sub={`${verifiedGym} verified`} bg={C.blueLight} textColor={C.blue}/>
          <StatCard label="Words" value={totalWords.toLocaleString()} bg={C.purpleLight} textColor={C.purple}/>
          <StatCard label="Friends" value={`${contactedFriends}/${friends.length}`} bg={C.amberLight} textColor={C.amberDark}/>
          <StatCard label="Fun done" value={funDone} sub={topMood||""} bg={C.greenLight} textColor={C.green}/>
        </div>
        {(avgEnergy||topCheckMood)&&(
          <div style={{...mkCard({background:"#F8F4FF",border:"none",marginBottom:14}),display:"flex",gap:16}}>
            {avgEnergy&&<div style={{textAlign:"center"}}><p style={{fontSize:11,color:C.purple,fontWeight:700,textTransform:"uppercase",margin:"0 0 4px",opacity:0.75}}>Avg energy</p><p style={{fontSize:22,fontWeight:700,color:C.purple,margin:0}}>{avgEnergy}/5</p></div>}
            {topCheckMood&&<div style={{textAlign:"center"}}><p style={{fontSize:11,color:C.purple,fontWeight:700,textTransform:"uppercase",margin:"0 0 4px",opacity:0.75}}>Felt most</p><p style={{fontSize:28,margin:0}}>{topCheckMood}</p></div>}
            <div style={{flex:1}}><p style={{fontSize:11,color:C.purple,fontWeight:700,textTransform:"uppercase",margin:"0 0 4px",opacity:0.75}}>Check-ins</p><p style={{fontSize:22,fontWeight:700,color:C.purple,margin:0}}>{weekCheckIns.length}/7</p></div>
          </div>
        )}
        {!aiInsight?<button onClick={getAiInsight} disabled={loadingInsight} style={{...mkBtn("purple",{width:"100%",marginBottom:14})}}><Sparkles size={14}/>{loadingInsight?"Thinking…":"Get AI reflection"}</button>:<div style={{...mkCard({background:C.purpleLight,border:"none",marginBottom:14})}}><p style={{fontSize:14,color:"#3B0764",lineHeight:1.65,margin:0}}>{aiInsight}</p></div>}
        <p style={{fontWeight:700,fontSize:14,margin:"0 0 8px"}}>Intention for next week</p>
        <textarea value={intention} onChange={e=>setIntention(e.target.value)} rows={3} style={{...mkInput(),resize:"none",lineHeight:1.6,marginBottom:12}} placeholder="What's the one thing you want to focus on?"/>
        {saved?<div style={{...mkCard({background:C.greenLight,border:"none",textAlign:"center"})}}><p style={{color:C.green,fontWeight:700,margin:0}}>✅ Saved — see you next Sunday!</p></div>:<button onClick={saveReview} style={{...mkBtn("primary",{width:"100%"})}}>Save review</button>}
      </div>
    </div>
  );
}


// ─────────────────────── ONBOARDING ───────────────────────
function Onboarding({onComplete}) {
  const [step,setStep]=useState(0);
  const [name,setName]=useState("");
  const [firstFriend,setFirstFriend]=useState("");
  const [gymName,setGymName]=useState("");
  const [takeHome,setTakeHome]=useState("");
  const [firstHabit,setFirstHabit]=useState("");

  const STEPS=[
    {
      emoji:"👋",
      title:"Welcome to Life, Sorted",
      sub:"Your personal command centre. Let's set it up in 60 seconds.",
      content:null,
      cta:"Let's go",
    },
    {
      emoji:"😊",
      title:"What should I call you?",
      sub:"Just your first name is fine.",
      content:<input style={{...mkInput({fontSize:18,padding:"14px",textAlign:"center"}),marginBottom:4}} placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} autoFocus/>,
      cta:"Next",
      valid:name.trim().length>0,
    },
    {
      emoji:"❤️",
      title:"Add your first friend",
      sub:"Someone you want to stay close to. You can add more later.",
      content:<input style={{...mkInput({fontSize:16,padding:"12px",textAlign:"center"}),marginBottom:4}} placeholder="Their name" value={firstFriend} onChange={e=>setFirstFriend(e.target.value)} autoFocus/>,
      cta:"Next",
      valid:firstFriend.trim().length>0,
    },
    {
      emoji:"🏋️",
      title:"Name your gym",
      sub:"We'll use GPS to check you in automatically.",
      content:<input style={{...mkInput({fontSize:16,padding:"12px",textAlign:"center"}),marginBottom:4}} placeholder="e.g. PureGym Dalston" value={gymName} onChange={e=>setGymName(e.target.value)} autoFocus/>,
      cta:"Next",
      valid:gymName.trim().length>0,
    },
    {
      emoji:"💰",
      title:"Monthly take-home pay",
      sub:"Used for your 50/30/20 budget tracker.",
      content:(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span style={{fontSize:22,color:C.muted}}>£</span>
          <input style={{...mkInput({fontSize:22,padding:"12px",width:"160px",textAlign:"center"}),marginBottom:4}} type="number" placeholder="2543" value={takeHome} onChange={e=>setTakeHome(e.target.value)} autoFocus/>
        </div>
      ),
      cta:"Next",
      valid:parseFloat(takeHome)>0,
    },
    {
      emoji:"⚡",
      title:"One habit to start with",
      sub:"Something small and doable every day.",
      content:<input style={{...mkInput({fontSize:16,padding:"12px",textAlign:"center"}),marginBottom:4}} placeholder="e.g. Drink 8 glasses of water" value={firstHabit} onChange={e=>setFirstHabit(e.target.value)} autoFocus/>,
      cta:"Finish setup",
      valid:firstHabit.trim().length>0,
    },
  ];

  const step_=STEPS[step];
  const canNext=step_.valid===undefined?true:step_.valid;

  const next=()=>{
    if(step<STEPS.length-1){setStep(s=>s+1);}
    else{
      onComplete({name,firstFriend,gymName,takeHome:parseFloat(takeHome)||2543,firstHabit});
    }
  };

  return (
    <div style={{...{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"},minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",maxWidth:430,margin:"0 auto"}}>
      {/* Progress dots */}
      <div style={{display:"flex",gap:8,marginBottom:40}}>
        {STEPS.map((_,i)=>(
          <div key={i} style={{width:i===step?24:8,height:8,borderRadius:100,background:i<=step?C.amber:"#E7E5E4",transition:"all 0.3s"}}/>
        ))}
      </div>

      {/* Content */}
      <div style={{textAlign:"center",width:"100%"}}>
        <div style={{fontSize:64,marginBottom:20}}>{step_.emoji}</div>
        <h1 style={{fontSize:26,fontWeight:700,margin:"0 0 10px",color:C.text}}>{step_.title}</h1>
        <p style={{fontSize:16,color:C.muted,margin:"0 0 32px",lineHeight:1.6}}>{step_.sub}</p>
        {step_.content&&<div style={{marginBottom:32}}>{step_.content}</div>}
        <button
          onClick={next}
          disabled={!canNext}
          style={{...mkBtn("primary",{width:"100%",padding:"14px",fontSize:16,borderRadius:14}),opacity:canNext?1:0.4}}
          onKeyDown={e=>e.key==="Enter"&&canNext&&next()}
        >
          {step_.cta}
        </button>
        <div style={{display:"flex",justifyContent:"center",gap:24,marginTop:16}}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{background:"none",border:"none",color:C.faint,fontSize:14,cursor:"pointer"}}>← Back</button>}
          <button onClick={()=>onComplete({})} style={{background:"none",border:"none",color:C.faint,fontSize:13,cursor:"pointer",textDecoration:"underline"}}>Skip setup</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────── ROOT APP ───────────────────────
export default function App() {
  const [onboarded,setOnboarded]=useState(()=>{
    try{return localStorage.getItem("ls_onboarded")==="1";}catch{return false;}
  });
  const [screen,setScreen]=useState("home");
  const [drawerOpen,setDrawerOpen]=useState(false);
  const [showWeeklyReview,setShowWeeklyReview]=useState(false);
  const [friends,setFriends]=useStore("friends",INIT_FRIENDS);
  const [workouts,setWorkouts]=useStore("workouts",INIT_WORKOUTS);
  const [weights,setWeights]=useStore("weights",INIT_WEIGHTS);
  const [writingSessions,setWritingSessions]=useStore("writing",INIT_WRITING);
  const [podcastEps]=useState(INIT_PODCAST);
  const [journalEntries,setJournalEntries]=useStore("journal",INIT_JOURNAL);
  const [funList,setFunList]=useStore("fun",INIT_FUN);
  const [gymLocation,setGymLocation]=useState(INIT_GYM);
  const [weeklyReviews,setWeeklyReviews]=useStore("reviews",[]);
  const [habits,setHabits]=useStore("habits",INIT_HABITS);
  const [lastMusicPick,setLastMusicPick]=useState(null);
  const [astroSessions,setAstroSessions]=useStore("astro_sessions",[]);
  const [goals,setGoals]=useStore("goals",INIT_GOALS);
  const [checkIns,setCheckIns]=useStore("checkins",{});
  const [financeData,setFinanceData]=useState(null); // populated by Finance section on first open
  const [astroMilestones,setAstroMilestones]=useStore("astro_milestones",ASTROPOLIS_MILESTONES);
  const [astroComponents,setAstroComponents]=useStore("astro_components",ASTROPOLIS_COMPONENTS);
  const [notifStatus,setNotifStatus]=useState(typeof Notification!=="undefined"?Notification.permission:"denied");

  const {canInstall,install}=useInstallPrompt();

  useEffect(()=>{
    try{
      const lp=localStorage.getItem("ls_music_pick");
      if(lp) setLastMusicPick(JSON.parse(lp));
    }catch{}
  },[]);
  useEffect(()=>{if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js").catch(()=>{});}},[]);

  // Catch OAuth redirect: ?cal_token=xxx lands here after Netlify auth function
  useEffect(()=>{
    try {
      const params=new URLSearchParams(window.location.search);
      const calToken=params.get("cal_token");
      const calError=params.get("cal_error");
      if(calToken){
        localStorage.setItem("ls_cal_token",calToken);
        // Clean the URL so the token isn't visible
        window.history.replaceState({},"",window.location.pathname);
        // Force CalendarCard to re-read — it uses getCalToken() on mount
        // A quick page reload is the safest approach after token storage
        window.location.reload();
      }
      if(calError){
        window.history.replaceState({},"",window.location.pathname);
        console.warn("Calendar auth error:",calError);
      }
    } catch{}
  },[]);

  const requestNotifs=async()=>{if(typeof Notification==="undefined")return;const result=await Notification.requestPermission();setNotifStatus(result);};

  const completeOnboarding=({name,firstFriend,gymName,takeHome,firstHabit})=>{
    // Replace sample data with real user setup
    if(firstFriend) setFriends([{id:Date.now(),name:firstFriend,colorIdx:0,lastContact:0,cadence:14,birthday:null,origin:"other",location:"london",notes:"",plans:null}]);
    if(gymName) setGymLocation(g=>({...g,name:gymName}));
    if(firstHabit) setHabits([{id:Date.now(),name:firstHabit,icon:"⚡",category:"health",freq:"daily",streak:0,completions:{}}]);
    try{localStorage.setItem("ls_onboarded","1");}catch{}
    setOnboarded(true);
  };

  const navigate=(s)=>{
    if(s==="review"){setShowWeeklyReview(true);setDrawerOpen(false);return;}
    setScreen(s);setDrawerOpen(false);
  };
  const goHome=()=>setScreen("home");

  const online=useOnline();
  if(!onboarded) return <Onboarding onComplete={completeOnboarding}/>;

  return (
    <div style={{...base,background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto",position:"relative"}}>
      {!online&&<div style={{background:C.red,color:"#fff",fontSize:12,fontWeight:700,textAlign:"center",padding:"6px",position:"sticky",top:0,zIndex:99}}>📡 Offline — changes will sync when you reconnect</div>}
      {canInstall&&<div style={{background:"#1C1917",color:"#FEF3C7",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 16px",position:"sticky",top:0,zIndex:98}}>
        <span>📲 Add Life, Sorted to your home screen</span>
        <button onClick={install} style={{background:C.amber,border:"none",borderRadius:8,padding:"4px 12px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>Install</button>
      </div>}
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
        <style>{`
          @keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          .screen-enter{animation:fadeSlideUp 0.22s ease forwards}
          .screen-modal{animation:fadeIn 0.18s ease forwards}
          *{-webkit-tap-highlight-color:transparent}
          input,textarea,button{font-family:inherit}
          ::-webkit-scrollbar{display:none}
        `}</style>
        <div key={screen} className="screen-enter" style={{display:"contents"}}>
        {screen==="home"&&<HomeScreen friends={friends} setFriends={setFriends} habits={habits} setHabits={setHabits} workouts={workouts} weights={weights} writingSessions={writingSessions} journalEntries={journalEntries} funList={funList} goals={goals} financeData={financeData} lastMusicPick={lastMusicPick} checkIns={checkIns} setCheckIns={setCheckIns} onNavigate={navigate} onWeeklyReview={()=>setShowWeeklyReview(true)} notifStatus={notifStatus} requestNotifs={requestNotifs}/>}
        {screen==="friends"&&<Friends friends={friends} setFriends={setFriends} onBack={goHome}/>}
        {screen==="creative"&&<Creative writingSessions={writingSessions} setWritingSessions={setWritingSessions} podcastEps={podcastEps} journalEntries={journalEntries} setJournalEntries={setJournalEntries} astroSessions={astroSessions} setAstroSessions={setAstroSessions} astroMilestones={astroMilestones} setAstroMilestones={setAstroMilestones} astroComponents={astroComponents} setAstroComponents={setAstroComponents} onBack={goHome}/>}
        {screen==="fitness"&&<Fitness workouts={workouts} setWorkouts={setWorkouts} weights={weights} setWeights={setWeights} gymLocation={gymLocation} setGymLocation={setGymLocation} onBack={goHome}/>}
        {screen==="habits"&&<Habits habits={habits} setHabits={setHabits} onBack={goHome}/>}
        {screen==="goals"&&<Goals goals={goals} setGoals={setGoals} onBack={goHome}/>}
        {screen==="fun"&&<Fun funList={funList} setFunList={setFunList} friends={friends} onBack={goHome}/>}
        {screen==="music"&&<MusicTab lastMusicPick={lastMusicPick} setLastMusicPick={setLastMusicPick} onBack={goHome}/>}
        {screen==="finance"&&<Finance onBack={goHome} onDataLoaded={setFinanceData}/>}
        </div>
      </div>
      <FloatingNav screen={screen} onHome={goHome} onDrawer={()=>setDrawerOpen(true)}/>

      {drawerOpen&&<NavDrawer onNavigate={navigate} onClose={()=>setDrawerOpen(false)}/>}
      {showWeeklyReview&&<WeeklyReview friends={friends} workouts={workouts} writingSessions={writingSessions} journalEntries={journalEntries} funList={funList} checkIns={checkIns} onClose={()=>setShowWeeklyReview(false)} weeklyReviews={weeklyReviews} setWeeklyReviews={setWeeklyReviews}/>}
    </div>
  );
}
