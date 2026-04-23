import { useState, useRef, useEffect } from "react";
import { Home, Heart, Dumbbell, PenLine, Star, Check, Plus, Mic, Square, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

// ─────────────────────── SAMPLE DATA ───────────────────────
const COLORS = [
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#EDE9FE", text: "#5B21B6" },
  { bg: "#FFE4E6", text: "#9F1239" },
  { bg: "#CCFBF1", text: "#115E59" },
  { bg: "#DBEAFE", text: "#1E3A8A" },
];

const INIT_FRIENDS = [
  { id: 1, name: "Marcus", colorIdx: 0, lastContact: 21, cadence: 14, birthday: "2026-05-08", notes: "Ask about new job", plans: "Glastonbury?" },
  { id: 2, name: "Priya", colorIdx: 1, lastContact: 1, cadence: 7, birthday: "1990-08-23", notes: "Podcast partner ✨", plans: "Record ep5 this week" },
  { id: 3, name: "Jamie", colorIdx: 2, lastContact: 38, cadence: 21, birthday: "1991-12-14", notes: "Haven't spoken in a while", plans: null },
  { id: 4, name: "Chen", colorIdx: 3, lastContact: 8, cadence: 14, birthday: "1988-07-02", notes: "Recommended Dark Matter", plans: "Film night" },
  { id: 5, name: "Aisha", colorIdx: 4, lastContact: 5, cadence: 21, birthday: "1993-03-17", notes: "Starting her MBA", plans: null },
];

const INIT_WORKOUTS = [
  { id: 1, type: "gym", date: "21/04", duration: 60, notes: "Chest & back" },
  { id: 2, type: "run", date: "19/04", duration: 35, notes: "5.2km, felt strong" },
  { id: 3, type: "gym", date: "17/04", duration: 55, notes: "Leg day 🦵" },
  { id: 4, type: "run", date: "15/04", duration: 40, notes: "6km easy pace" },
];

const INIT_WEIGHTS = [
  { id: 1, date: "Apr 1", kg: 94.2 },
  { id: 2, date: "Apr 7", kg: 93.8 },
  { id: 3, date: "Apr 14", kg: 93.1 },
  { id: 4, date: "Apr 21", kg: 92.6 },
];

const INIT_WRITING = [
  { id: 1, date: "Today", mins: 45, words: 800 },
  { id: 2, date: "Apr 20", mins: 30, words: 500 },
  { id: 3, date: "Apr 19", mins: 60, words: 1100 },
  { id: 4, date: "Apr 18", mins: 20, words: 350 },
];

const INIT_PODCAST = [
  { id: 1, ep: 1, title: "Why We Started This", status: "published" },
  { id: 2, ep: 2, title: "The Joy of Failure", status: "published" },
  { id: 3, ep: 3, title: "Making Time", status: "published" },
  { id: 4, ep: 4, title: "On Friendship", status: "editing" },
  { id: 5, ep: 5, title: "Untitled", status: "planned" },
];

const INIT_JOURNAL = [
  { id: 1, date: "22 Apr 2026", mood: "🔥", transcript: "Feeling really motivated today. Got a solid writing session in before work, nearly a thousand words. Starting to feel like the novel might actually get finished. Also need to reach out to Jamie — it's been way too long and I keep putting it off.", words: 46 },
  { id: 2, date: "18 Apr 2026", mood: "😊", transcript: "Good day overall. The run this morning cleared my head. I've been thinking about what the podcast could become — I think Priya and I need to be more intentional about the direction. There's something there about creativity and fear that keeps coming up.", words: 44 },
];

const INIT_FUN = [
  { id: 1, title: "See a live jazz set", icon: "🎷", done: false },
  { id: 2, title: "Try that Ethiopian place in Brixton", icon: "🍽️", done: false },
  { id: 3, title: "Weekend trip to Edinburgh", icon: "✈️", done: false },
  { id: 4, title: "Catch a comedy show", icon: "😂", done: false },
  { id: 5, title: "Morning run in a new park", icon: "🏃", done: false },
  { id: 6, title: "Dune Part 2", icon: "🎬", done: true },
];

const MOODS = ["😊", "🔥", "😐", "😔", "😤", "🙏"];

// ─────────────────────── STYLES ───────────────────────
const C = {
  amber: "#D97706", amberLight: "#FEF3C7", amberDark: "#92400E",
  bg: "#FAFAF8", white: "#FFFFFF", border: "#F0EDEA",
  text: "#1C1917", muted: "#78716C", faint: "#A8A29E",
};

const base = { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif", fontSize: 14, color: C.text };

const mkCard = (extra = {}) => ({ background: C.white, borderRadius: 16, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 10, ...extra });

const mkBtn = (variant = "primary", extra = {}) => {
  const base = { border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 };
  if (variant === "primary") return { ...base, background: C.amber, color: "#fff", ...extra };
  if (variant === "ghost") return { ...base, background: "transparent", color: C.amber, border: `1.5px solid ${C.amber}`, ...extra };
  if (variant === "danger") return { ...base, background: "#FEE2E2", color: "#991B1B", ...extra };
  return base;
};

const mkInput = () => ({ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff", color: C.text, fontFamily: "inherit" });

// ─────────────────────── SHARED ───────────────────────
function Avatar({ name, colorIdx, size = 44 }) {
  const c = COLORS[colorIdx % COLORS.length];
  return <div style={{ width: size, height: size, borderRadius: "50%", background: c.bg, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 700, flexShrink: 0 }}>{name.slice(0, 2).toUpperCase()}</div>;
}

function Pill({ type, text }) {
  const map = { red: ["#FEE2E2","#991B1B"], amber: ["#FEF3C7","#92400E"], green: ["#D1FAE5","#065F46"], purple: ["#EDE9FE","#5B21B6"], gray: ["#F1F5F9","#475569"] };
  const [bg, color] = map[type] || map.gray;
  return <span style={{ background: bg, color, borderRadius: 8, padding: "3px 9px", fontSize: 12, fontWeight: 600 }}>{text}</span>;
}

function PageHeader({ title, sub }) {
  return (
    <div style={{ padding: "20px 20px 12px", borderBottom: `1px solid ${C.border}` }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{title}</h1>
      {sub && <p style={{ fontSize: 14, color: C.muted, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function StatCard({ label, value, bg, textColor }) {
  return (
    <div style={{ background: bg, borderRadius: 14, padding: "14px 16px" }}>
      <p style={{ fontSize: 11, color: textColor, margin: "0 0 4px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", opacity: 0.75 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: textColor, margin: 0 }}>{value}</p>
    </div>
  );
}

function SectionLabel({ text }) {
  return <p style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>{text}</p>;
}

function InnerTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: C.white }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{ flex: 1, padding: "11px 0", fontSize: 13, fontWeight: active === t ? 700 : 500, color: active === t ? C.amber : C.muted, background: "transparent", border: "none", borderBottom: active === t ? `2px solid ${C.amber}` : "2px solid transparent", cursor: "pointer" }}>
          {t}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────── DASHBOARD ───────────────────────
function Dashboard({ friends, workouts, writingSessions, journalEntries, setTab }) {
  const overdue = friends.filter(f => f.lastContact > f.cadence);
  const totalWords = writingSessions.reduce((a, s) => a + s.words, 0);
  const soonBirthday = friends.find(f => {
    if (!f.birthday) return false;
    const b = new Date(f.birthday); b.setFullYear(2026);
    return (b - new Date("2026-04-23")) / 86400000 >= 0 && (b - new Date("2026-04-23")) / 86400000 <= 14;
  });

  return (
    <>
      <div style={{ padding: "20px 20px 12px", borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 12, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Thursday, 23 April</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Your week 👋</h1>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {overdue.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionLabel text="Reach out" />
            {overdue.map(f => (
              <div key={f.id} style={{ ...mkCard({ marginBottom: 8 }), display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={f.name} colorIdx={f.colorIdx} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 2px" }}>{f.name}</p>
                  <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{f.lastContact} days since you spoke</p>
                </div>
                <Pill type={f.lastContact - f.cadence > 14 ? "red" : "amber"} text="Overdue" />
              </div>
            ))}
          </div>
        )}
        {soonBirthday && (
          <div style={{ background: C.amberLight, border: `1px solid #FCD34D`, borderRadius: 14, padding: "12px 16px", marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: C.amberDark, margin: 0 }}>🎂 <strong>{soonBirthday.name}'s</strong> birthday — {new Date(soonBirthday.birthday).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</p>
          </div>
        )}
        <SectionLabel text="This week" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <StatCard label="Workouts" value={workouts.slice(0,4).length} bg="#EFF6FF" textColor="#1E40AF" />
          <StatCard label="Words written" value={totalWords.toLocaleString()} bg="#F5F3FF" textColor="#5B21B6" />
          <StatCard label="Friends reached" value={friends.filter(f => f.lastContact <= 2).length} bg={C.amberLight} textColor={C.amberDark} />
          <StatCard label="Journal entries" value={journalEntries.length} bg="#ECFDF5" textColor="#065F46" />
        </div>
        <SectionLabel text="Quick actions" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[{ label: "Log a workout", tab: "fitness", icon: "🏋️" }, { label: "Voice journal", tab: "creative", icon: "🎙️" }, { label: "Check in with someone", tab: "friends", icon: "💬" }, { label: "Add something fun", tab: "fun", icon: "🎉" }].map(a => (
            <button key={a.label} onClick={() => setTab(a.tab)} style={{ ...mkCard({ margin: 0, cursor: "pointer", textAlign: "left" }) }}>
              <p style={{ fontSize: 20, margin: "0 0 6px" }}>{a.icon}</p>
              <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{a.label}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────── FRIENDS ───────────────────────
function Friends({ friends, setFriends }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const logContact = id => setFriends(f => f.map(fr => fr.id === id ? { ...fr, lastContact: 0 } : fr));
  const addFriend = () => {
    if (!name.trim()) return;
    setFriends(f => [...f, { id: Date.now(), name, colorIdx: f.length % 5, lastContact: 0, cadence: 14, birthday: null, notes: "", plans: null }]);
    setName(""); setAdding(false);
  };
  const sorted = [...friends].sort((a, b) => (b.lastContact - b.cadence) - (a.lastContact - a.cadence));
  return (
    <>
      <PageHeader title="Friends" sub="Stay close to the people who matter" />
      <div style={{ padding: "16px 20px" }}>
        {sorted.map(f => {
          const overdue = f.lastContact > f.cadence;
          return (
            <div key={f.id} style={mkCard()}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <Avatar name={f.name} colorIdx={f.colorIdx} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{f.name}</p>
                    <Pill type={overdue ? (f.lastContact - f.cadence > 14 ? "red" : "amber") : "green"} text={overdue ? `${f.lastContact - f.cadence}d late` : "On track"} />
                  </div>
                  <p style={{ fontSize: 13, color: C.muted, margin: "0 0 2px" }}>Last contact: {f.lastContact === 0 ? "today 🎉" : `${f.lastContact} days ago`}</p>
                  {f.notes && <p style={{ fontSize: 13, color: C.muted, margin: "2px 0", fontStyle: "italic" }}>{f.notes}</p>}
                  {f.plans && <p style={{ fontSize: 13, color: C.amber, margin: "4px 0 0", fontWeight: 600 }}>📌 {f.plans}</p>}
                </div>
              </div>
              {overdue && <button onClick={() => logContact(f.id)} style={{ ...mkBtn("primary"), width: "100%", marginTop: 12 }}><Check size={14} /> Logged a chat</button>}
            </div>
          );
        })}
        {adding ? (
          <div style={mkCard()}>
            <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 10px" }}>Add a friend</p>
            <input style={mkInput()} placeholder="Their name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && addFriend()} autoFocus />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={addFriend} style={{ ...mkBtn("primary"), flex: 1 }}>Add</button>
              <button onClick={() => setAdding(false)} style={mkBtn("ghost")}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={{ ...mkBtn("ghost"), width: "100%" }}><Plus size={14} /> Add a friend</button>
        )}
      </div>
    </>
  );
}

// ─────────────────────── FITNESS ───────────────────────
function Fitness({ workouts, setWorkouts, weights, setWeights }) {
  const [loggingType, setLoggingType] = useState(null);
  const [duration, setDuration] = useState("45");
  const [notes, setNotes] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const logWorkout = () => { setWorkouts(w => [{ id: Date.now(), type: loggingType, date: "Today", duration: parseInt(duration)||45, notes }, ...w]); setLoggingType(null); setNotes(""); setDuration("45"); };
  const logWeight = () => { if (!newWeight) return; setWeights(w => [...w, { id: Date.now(), date: "Today", kg: parseFloat(newWeight) }]); setNewWeight(""); };
  const latest = weights[weights.length-1]?.kg;
  const lost = (weights[0]?.kg - latest).toFixed(1);
  const TYPES = [{ type:"gym",icon:"🏋️",label:"Gym"},{type:"run",icon:"🏃",label:"Run"},{type:"walk",icon:"🚶",label:"Walk"},{type:"other",icon:"⚡",label:"Other"}];
  return (
    <>
      <PageHeader title="Fitness" sub="Track your progress" />
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <StatCard label="Current weight" value={`${latest}kg`} bg={C.amberLight} textColor={C.amberDark} />
          <StatCard label="Lost so far" value={`${lost}kg`} bg="#D1FAE5" textColor="#065F46" />
        </div>
        <div style={mkCard()}>
          <p style={{ fontWeight: 700, margin: "0 0 10px" }}>Log weight</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...mkInput(), flex: 1 }} type="number" step="0.1" placeholder="e.g. 92.4 kg" value={newWeight} onChange={e => setNewWeight(e.target.value)} onKeyDown={e => e.key==="Enter"&&logWeight()} />
            <button onClick={logWeight} style={{ ...mkBtn("primary"), flexShrink: 0 }}>Save</button>
          </div>
          <div style={{ marginTop: 12 }}>
            {weights.slice(-4).reverse().map(w => (
              <div key={w.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, color: C.muted }}>{w.date}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{w.kg}kg</span>
              </div>
            ))}
          </div>
        </div>
        <div style={mkCard()}>
          <p style={{ fontWeight: 700, margin: "0 0 10px" }}>Log a session</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {TYPES.map(({ type, icon, label }) => (
              <button key={type} onClick={() => setLoggingType(loggingType===type?null:type)} style={{ background: loggingType===type ? C.amberLight : "#F5F5F4", border: `1.5px solid ${loggingType===type ? C.amber : "transparent"}`, borderRadius: 12, padding: "12px 8px", cursor: "pointer", textAlign: "center" }}>
                <p style={{ fontSize: 22, margin: "0 0 4px" }}>{icon}</p>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: loggingType===type ? C.amberDark : C.text }}>{label}</p>
              </button>
            ))}
          </div>
          {loggingType && (
            <div style={{ marginTop: 12 }}>
              <input style={{ ...mkInput(), marginBottom: 8 }} type="number" placeholder="Duration (mins)" value={duration} onChange={e => setDuration(e.target.value)} />
              <input style={{ ...mkInput(), marginBottom: 10 }} placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
              <button onClick={logWorkout} style={{ ...mkBtn("primary"), width: "100%" }}>Save session</button>
            </div>
          )}
        </div>
        <SectionLabel text="Recent sessions" />
        {workouts.slice(0,5).map(w => (
          <div key={w.id} style={{ ...mkCard({ marginBottom: 8 }), display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: w.type==="gym"?"#EFF6FF":"#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {w.type==="gym"?"🏋️":w.type==="run"?"🏃":"🚶"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 2px" }}>{w.type==="gym"?"Gym":w.type==="run"?"Run":w.type==="walk"?"Walk":"Session"}</p>
              <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{w.duration} mins{w.notes?` · ${w.notes}`:""}</p>
            </div>
            <span style={{ fontSize: 12, color: C.faint }}>{w.date}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ─────────────────────── JOURNAL ───────────────────────
function Journal({ entries, setEntries }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [mood, setMood] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState(null);
  const [pulse, setPulse] = useState(false);
  const recRef = useRef(null);
  const pulseRef = useRef(null);

  useEffect(() => {
    if (recording) { pulseRef.current = setInterval(() => setPulse(p => !p), 900); }
    else { clearInterval(pulseRef.current); setPulse(false); }
    return () => clearInterval(pulseRef.current);
  }, [recording]);

  const startRecording = () => {
    setError(null);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Voice recognition works in Chrome on Android. You can type below instead."); return; }
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-GB";
    rec.onresult = e => {
      let fin = "", inter = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) fin += e.results[i][0].transcript + " ";
        else inter += e.results[i][0].transcript;
      }
      setTranscript(t => t + fin);
      setInterim(inter);
    };
    rec.onerror = () => { setError("Microphone access blocked — please allow mic permissions and try again."); setRecording(false); };
    rec.onend = () => { setRecording(false); setInterim(""); };
    rec.start();
    recRef.current = rec;
    setRecording(true);
  };

  const stopRecording = () => { recRef.current?.stop(); setRecording(false); setInterim(""); };

  const saveEntry = () => {
    if (!transcript.trim()) return;
    setEntries(e => [{ id: Date.now(), date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), mood, transcript: transcript.trim(), words: transcript.trim().split(/\s+/).length }, ...e]);
    setTranscript(""); setMood(null);
  };

  const hasContent = transcript.trim().length > 0;

  return (
    <div style={{ padding: "16px 20px" }}>
      {/* Big mic button */}
      <div style={{ textAlign: "center", padding: "20px 0 16px" }}>
        <p style={{ fontSize: 14, color: C.muted, margin: "0 0 20px" }}>
          {recording ? "Listening… speak naturally" : hasContent ? "Recording paused — continue or save" : "Tap to start your voice journal"}
        </p>
        <button onClick={recording ? stopRecording : startRecording} style={{ width: 90, height: 90, borderRadius: "50%", border: "none", cursor: "pointer", background: recording ? (pulse ? "#DC2626" : "#EF4444") : C.amber, display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "background 0.3s, transform 0.2s, box-shadow 0.3s", transform: recording && pulse ? "scale(1.07)" : "scale(1)", boxShadow: recording ? `0 0 0 ${pulse?"16px":"8px"} rgba(239,68,68,0.12)` : `0 0 0 0 transparent` }}>
          {recording ? <Square size={32} color="#fff" fill="#fff" /> : <Mic size={32} color="#fff" />}
        </button>
        {recording && <p style={{ fontSize: 13, color: "#EF4444", fontWeight: 700, margin: "14px 0 0" }}>● Recording</p>}
      </div>

      {error && (
        <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: "#991B1B", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Transcript */}
      {(hasContent || interim) && (
        <div style={mkCard()}>
          <SectionLabel text="Transcript" />
          <textarea value={transcript + interim} onChange={e => setTranscript(e.target.value)} rows={5}
            style={{ ...mkInput(), resize: "vertical", lineHeight: 1.65 }}
            placeholder="Your words will appear here as you speak…" />

          <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, margin: "12px 0 8px" }}>How are you feeling?</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {MOODS.map(m => (
              <button key={m} onClick={() => setMood(mood===m?null:m)} style={{ fontSize: 24, background: mood===m ? C.amberLight : "#F5F5F4", border: `1.5px solid ${mood===m ? C.amber : "transparent"}`, borderRadius: 10, padding: "6px 8px", cursor: "pointer" }}>{m}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveEntry} style={{ ...mkBtn("primary"), flex: 1 }}><BookOpen size={14} /> Save entry</button>
            <button onClick={() => { setTranscript(""); setMood(null); setInterim(""); }} style={mkBtn("danger")}>Discard</button>
          </div>
        </div>
      )}

      {!hasContent && !recording && !interim && (
        <div style={{ textAlign: "center", paddingBottom: 8 }}>
          <p style={{ fontSize: 13, color: C.faint, margin: "0 0 6px" }}>Prefer to type?</p>
          <button onClick={() => setTranscript(" ")} style={{ fontSize: 13, color: C.amber, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Open text entry</button>
        </div>
      )}

      {/* Past entries */}
      {entries.length > 0 && (
        <>
          <SectionLabel text="Past entries" />
          {entries.map(entry => (
            <div key={entry.id} style={mkCard()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setExpanded(expanded===entry.id ? null : entry.id)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {entry.mood && <span style={{ fontSize: 22 }}>{entry.mood}</span>}
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{entry.date}</p>
                    <p style={{ fontSize: 12, color: C.faint, margin: "2px 0 0" }}>{entry.words} words</p>
                  </div>
                </div>
                {expanded===entry.id ? <ChevronUp size={16} color={C.faint} /> : <ChevronDown size={16} color={C.faint} />}
              </div>
              {expanded===entry.id && (
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: "12px 0 0", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>{entry.transcript}</p>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─────────────────────── CREATIVE ───────────────────────
function Creative({ writingSessions, setWritingSessions, podcastEps, journalEntries, setJournalEntries }) {
  const [innerTab, setInnerTab] = useState("Journal");
  const [logging, setLogging] = useState(false);
  const [mins, setMins] = useState("30");
  const [words, setWords] = useState("");
  const logSession = () => { setWritingSessions(s => [{ id: Date.now(), date: "Today", mins: parseInt(mins)||30, words: parseInt(words)||0 }, ...s]); setLogging(false); setMins("30"); setWords(""); };
  const weekGoal = 5;
  const totalWords = writingSessions.reduce((a, s) => a + s.words, 0);
  const epStatus = { published: "green", editing: "amber", planned: "gray" };

  return (
    <>
      <PageHeader title="Creative" sub="Writing, podcast & journal" />
      <InnerTabs tabs={["Journal", "Writing", "Podcast"]} active={innerTab} onChange={setInnerTab} />

      {innerTab === "Journal" && <Journal entries={journalEntries} setEntries={setJournalEntries} />}

      {innerTab === "Writing" && (
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <StatCard label="Sessions this week" value={`${writingSessions.length}/${weekGoal}`} bg="#F5F3FF" textColor="#5B21B6" />
            <StatCard label="Total words" value={totalWords.toLocaleString()} bg="#ECFDF5" textColor="#065F46" />
          </div>
          <div style={{ background: "#EDE9FE", borderRadius: 100, height: 8, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ background: "#7C3AED", height: "100%", width: `${Math.min((writingSessions.length/weekGoal)*100,100)}%`, borderRadius: 100 }} />
          </div>
          {logging ? (
            <div style={mkCard()}>
              <p style={{ fontWeight: 700, margin: "0 0 10px" }}>Log a writing session</p>
              <input style={{ ...mkInput(), marginBottom: 8 }} type="number" placeholder="Duration (mins)" value={mins} onChange={e => setMins(e.target.value)} />
              <input style={{ ...mkInput(), marginBottom: 10 }} type="number" placeholder="Words written (optional)" value={words} onChange={e => setWords(e.target.value)} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={logSession} style={{ ...mkBtn("primary"), flex: 1 }}>Save</button>
                <button onClick={() => setLogging(false)} style={mkBtn("ghost")}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setLogging(true)} style={{ ...mkBtn("primary"), width: "100%", marginBottom: 16, background: "#7C3AED" }}><Plus size={14} /> Log a writing session</button>
          )}
          <div style={mkCard()}>
            {writingSessions.slice(0,4).map((w,i) => (
              <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i<3?`1px solid ${C.border}`:"none" }}>
                <div><span style={{ fontWeight: 600, fontSize: 14 }}>{w.mins} mins</span>{w.words>0&&<span style={{ fontSize: 13, color: C.muted, marginLeft: 8 }}>{w.words.toLocaleString()} words</span>}</div>
                <span style={{ fontSize: 12, color: C.faint }}>{w.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {innerTab === "Podcast" && (
        <div style={{ padding: "16px 20px" }}>
          <div style={{ background: "#FFFBEB", border: `1px solid #FCD34D`, borderRadius: 14, padding: "12px 16px", marginBottom: 12 }}>
            <p style={{ fontSize: 14, color: C.amberDark, margin: 0 }}>🎙 3 episodes published · Ep4 in editing · Ep5 in the works</p>
          </div>
          {podcastEps.map(ep => (
            <div key={ep.id} style={{ ...mkCard({ marginBottom: 8 }), display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.faint, minWidth: 24 }}>E{ep.ep}</span>
              <p style={{ flex: 1, fontSize: 14, fontWeight: ep.status==="planned"?400:600, color: ep.status==="planned"?C.faint:C.text, margin: 0 }}>{ep.title}</p>
              <Pill type={epStatus[ep.status]} text={ep.status} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─────────────────────── FUN ───────────────────────
function Fun({ funList, setFunList }) {
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState("");
  const toggle = id => setFunList(list => list.map(i => i.id===id?{...i,done:!i.done}:i));
  const addItem = () => { if (!newItem.trim()) return; setFunList(list => [...list, { id: Date.now(), title: newItem, icon: "⭐", done: false }]); setNewItem(""); setAdding(false); };
  const todo = funList.filter(i => !i.done);
  const done = funList.filter(i => i.done);
  return (
    <>
      <PageHeader title="Fun stuff" sub="Life isn't all goals — enjoy it" />
      <div style={{ padding: "16px 20px" }}>
        {todo.map(item => (
          <div key={item.id} style={{ ...mkCard({ marginBottom: 8 }), display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => toggle(item.id)} style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${C.border}`, background: "#fff", cursor: "pointer", flexShrink: 0 }} />
            <p style={{ flex: 1, fontSize: 14, fontWeight: 500, margin: 0 }}>{item.title}</p>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
          </div>
        ))}
        {adding ? (
          <div style={mkCard()}>
            <input style={{ ...mkInput(), marginBottom: 10 }} placeholder="What do you want to do?" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key==="Enter"&&addItem()} autoFocus />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addItem} style={{ ...mkBtn("primary"), flex: 1 }}>Add</button>
              <button onClick={() => setAdding(false)} style={mkBtn("ghost")}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={{ ...mkBtn("ghost"), width: "100%", marginBottom: 20 }}><Plus size={14} /> Add something fun</button>
        )}
        {done.length > 0 && (
          <>
            <SectionLabel text="Done ✓" />
            {done.map(item => (
              <div key={item.id} style={{ ...mkCard({ marginBottom: 8, opacity: 0.55 }), display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#D1FAE5", border: "2px solid #10B981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Check size={13} color="#065F46" /></div>
                <p style={{ flex: 1, fontSize: 14, color: C.muted, margin: 0, textDecoration: "line-through" }}>{item.title}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}

// ─────────────────────── BOTTOM NAV ───────────────────────
function BottomNav({ tab, setTab }) {
  const tabs = [{ id:"home",icon:Home,label:"Home" },{ id:"friends",icon:Heart,label:"Friends" },{ id:"fitness",icon:Dumbbell,label:"Fitness" },{ id:"creative",icon:PenLine,label:"Creative" },{ id:"fun",icon:Star,label:"Fun" }];
  return (
    <nav style={{ background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", padding: "8px 0 16px", flexShrink: 0 }}>
      {tabs.map(t => {
        const active = tab === t.id; const Icon = t.icon;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "transparent", cursor: "pointer", padding: "6px 0", color: active ? C.amber : C.faint }}>
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ─────────────────────── APP ───────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [friends, setFriends] = useState(INIT_FRIENDS);
  const [workouts, setWorkouts] = useState(INIT_WORKOUTS);
  const [weights, setWeights] = useState(INIT_WEIGHTS);
  const [writingSessions, setWritingSessions] = useState(INIT_WRITING);
  const [podcastEps] = useState(INIT_PODCAST);
  const [journalEntries, setJournalEntries] = useState(INIT_JOURNAL);
  const [funList, setFunList] = useState(INIT_FUN);
  return (
    <div style={{ ...base, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab==="home" && <Dashboard friends={friends} workouts={workouts} writingSessions={writingSessions} journalEntries={journalEntries} setTab={setTab} />}
        {tab==="friends" && <Friends friends={friends} setFriends={setFriends} />}
        {tab==="fitness" && <Fitness workouts={workouts} setWorkouts={setWorkouts} weights={weights} setWeights={setWeights} />}
        {tab==="creative" && <Creative writingSessions={writingSessions} setWritingSessions={setWritingSessions} podcastEps={podcastEps} journalEntries={journalEntries} setJournalEntries={setJournalEntries} />}
        {tab==="fun" && <Fun funList={funList} setFunList={setFunList} />}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
