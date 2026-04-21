"use client";
import { useState, useEffect } from "react";

const ESSENTIALS_CHECKLIST = [
  "Plates",
  "Napkins",
  "Silverware",
  "Cups",
  "Plastic wine glasses",
  "Bags of ice (6)",
];

const CATEGORIES = [
  { id: "side", label: "Sides & salads", unit: "dish", unitPlural: "dishes" },
  { id: "main", label: "Mains", unit: "dish", unitPlural: "dishes" },
  { id: "dessert", label: "Desserts", unit: "dish", unitPlural: "dishes" },
  { id: "drinks", label: "Drinks", unit: "drink", unitPlural: "drinks" },
  { id: "essentials", label: "Essentials", unit: "item", unitPlural: "items" },
];

// Palette
const cream = "#f6efe2";
const paper = "#fbf6ea";
const ink = "#1f3329";
const inkSoft = "#4a5a50";
const sage = "#6b8461";
const terracotta = "#b86841";
const rule = "rgba(31, 51, 41, 0.18)";

type Entry = {
  id: string;
  name: string;
  dish: string;
  category: string;
  notes: string;
  createdAt: number;
};

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchEssentialItem(item: string, entries: Entry[]): Entry | undefined {
  const normItem = normalize(item);
  return entries.find((e) => {
    const normDish = normalize(e.dish);
    return normDish.includes(normItem) || normItem.includes(normDish);
  });
}

export default function PotluckSignup() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [title, setTitle] = useState("Garden Party Potluck");
  const [subtitle, setSubtitle] = useState("Sunday, the 3rd of May");
  const [loading, setLoading] = useState(true);

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [tempSubtitle, setTempSubtitle] = useState("");

  const [name, setName] = useState("");
  const [dish, setDish] = useState("");
  const [category, setCategory] = useState("main");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const loadData = async () => {
    try {
      const [cfgRes, entriesRes] = await Promise.all([
        fetch("/api/config"),
        fetch("/api/entries"),
      ]);
      const cfg = await cfgRes.json();
      if (cfg.title) setTitle(cfg.title);
      if (cfg.subtitle) setSubtitle(cfg.subtitle);
      const list = await entriesRes.json();
      setEntries(list);
    } catch (e) {
      console.error("Load error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const poll = setInterval(loadData, 15000);
    return () => clearInterval(poll);
  }, []);

  const saveConfig = async (newTitle: string, newSubtitle: string) => {
    try {
      await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, subtitle: newSubtitle }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const addEntry = async () => {
    if (!name.trim() || !dish.trim() || saving) return;
    setSaving(true);
    const id = "e_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    const entry: Entry = {
      id,
      name: name.trim(),
      dish: dish.trim(),
      category,
      notes: notes.trim(),
      createdAt: Date.now(),
    };
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!res.ok) throw new Error("Failed");
      setName("");
      setDish("");
      setNotes("");
      showToast("Added — thank you!");
      await loadData();
    } catch {
      alert("Couldn't save — please try again.");
    }
    setSaving(false);
  };

  const removeEntry = async (id: string) => {
    if (pendingRemove !== id) {
      setPendingRemove(id);
      setTimeout(() => {
        setPendingRemove((cur) => (cur === id ? null : cur));
      }, 3000);
      return;
    }
    setPendingRemove(null);
    try {
      await fetch(`/api/entries/${id}`, { method: "DELETE" });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const countsByCategory: Record<string, number> = {};
  for (const cat of CATEGORIES) countsByCategory[cat.id] = 0;
  for (const e of entries)
    countsByCategory[e.category] = (countsByCategory[e.category] || 0) + 1;

  const entriesByCategory = (catId: string) =>
    entries.filter((e) => e.category === catId);

  const essentialsEntries = entriesByCategory("essentials");

  // Styles
  const s: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: `radial-gradient(circle at 20% 0%, ${paper} 0%, ${cream} 55%)`,
      fontFamily: "'EB Garamond', Georgia, serif",
      color: ink,
      padding: "48px 20px 80px",
      position: "relative",
    },
    wrap: { maxWidth: 680, margin: "0 auto" },
    preamble: {
      textAlign: "center",
      fontStyle: "italic",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      color: sage,
      fontSize: 15,
      letterSpacing: "0.18em",
      textTransform: "lowercase",
      marginBottom: 18,
    },
    title: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontSize: 48,
      fontWeight: 500,
      textAlign: "center",
      margin: "0 0 10px",
      color: ink,
      lineHeight: 1.05,
      cursor: "text",
    },
    subtitle: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: "italic",
      fontSize: 20,
      textAlign: "center",
      color: inkSoft,
      marginBottom: 10,
      cursor: "text",
    },
    editInput: {
      font: "inherit",
      fontSize: "inherit",
      color: "inherit",
      background: "transparent",
      border: "none",
      borderBottom: `1px dashed ${sage}`,
      outline: "none",
      textAlign: "center",
      width: "90%",
      maxWidth: 500,
    },
    ornament: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      margin: "32px auto 28px",
      color: sage,
    },
    ornamentLine: { flex: "0 0 80px", height: 1, background: rule },
    sectionLabel: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: "italic",
      fontSize: 16,
      color: sage,
      letterSpacing: "0.1em",
    },
    categoryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: 14,
      marginBottom: 8,
    },
    categoryCard: {
      background: paper,
      border: `1px solid ${rule}`,
      borderRadius: 2,
      padding: "14px 16px",
    },
    categoryName: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontSize: 20,
      color: ink,
      marginBottom: 6,
    },
    categoryCount: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: "italic",
      fontSize: 14,
      color: inkSoft,
      marginBottom: 10,
    },
    dots: { display: "flex", gap: 6 },
    dotFilled: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: terracotta,
    },
    dotEmpty: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      border: `1px solid ${rule}`,
    },
    servingNote: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: "italic",
      fontSize: 15,
      color: terracotta,
      textAlign: "center",
      marginBottom: 16,
      padding: "0 20px",
      lineHeight: 1.5,
    },
    formCard: {
      background: paper,
      border: `1px solid ${rule}`,
      borderRadius: 2,
      padding: "28px 28px 24px",
      margin: "8px 0 8px",
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
      marginBottom: 14,
    },
    label: {
      display: "block",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: "italic",
      fontSize: 14,
      color: inkSoft,
      marginBottom: 4,
      letterSpacing: "0.05em",
    },
    input: {
      width: "100%",
      font: "inherit",
      fontSize: 16,
      padding: "8px 2px",
      color: ink,
      background: "transparent",
      border: "none",
      borderBottom: `1px solid ${rule}`,
      outline: "none",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      font: "inherit",
      fontSize: 16,
      padding: "8px 2px",
      color: ink,
      background: "transparent",
      border: "none",
      borderBottom: `1px solid ${rule}`,
      outline: "none",
      boxSizing: "border-box",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%236b8461' fill='none' stroke-width='1.2'/></svg>")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 4px center",
      paddingRight: 20,
    },
    submitRow: { textAlign: "center", marginTop: 18 },
    submit: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: "italic",
      fontSize: 18,
      padding: "10px 40px",
      background: "transparent",
      color: ink,
      border: `1px solid ${ink}`,
      borderRadius: 30,
      cursor: "pointer",
      letterSpacing: "0.05em",
      transition: "all 0.2s",
    },
    submitDisabled: { opacity: 0.4, cursor: "not-allowed" },
    catGroup: { marginBottom: 24 },
    catGroupTitle: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontSize: 22,
      color: ink,
      marginBottom: 8,
      display: "flex",
      alignItems: "baseline",
      gap: 10,
    },
    catGroupCount: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: "italic",
      fontSize: 14,
      color: sage,
    },
    entry: {
      display: "flex",
      alignItems: "baseline",
      gap: 10,
      padding: "7px 0",
      borderBottom: `1px dotted ${rule}`,
      fontSize: 17,
    },
    entryBullet: { color: terracotta, flexShrink: 0 },
    entryDish: { color: ink },
    entryDash: { color: inkSoft, fontStyle: "italic", margin: "0 4px" },
    entryName: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: "italic",
      color: inkSoft,
    },
    entryNote: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: "italic",
      fontSize: 14,
      color: sage,
      marginLeft: 8,
    },
    entryRemove: {
      marginLeft: "auto",
      background: "transparent",
      border: "none",
      color: inkSoft,
      cursor: "pointer",
      fontSize: 13,
      fontStyle: "italic",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      opacity: 0.5,
      padding: "2px 6px",
    },
    emptyMsg: {
      textAlign: "center",
      fontStyle: "italic",
      color: inkSoft,
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontSize: 17,
      padding: "16px 0 8px",
    },
    toast: {
      position: "fixed",
      bottom: 30,
      left: "50%",
      transform: "translateX(-50%)",
      background: ink,
      color: cream,
      padding: "10px 24px",
      borderRadius: 2,
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: "italic",
      fontSize: 16,
      opacity: toast ? 1 : 0,
      transition: "opacity 0.3s",
      pointerEvents: "none",
      letterSpacing: "0.03em",
      zIndex: 100,
    },
    editHint: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: "italic",
      fontSize: 12,
      color: sage,
      textAlign: "center",
      marginTop: 4,
      marginBottom: 24,
      opacity: 0.7,
    },
  };

  const Sprig = () => (
    <svg
      width="20"
      height="24"
      viewBox="0 0 20 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: sage }}
    >
      <path d="M10 2 L10 22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M10 6 Q5 6 3 9" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M10 10 Q15 10 17 13" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M10 14 Q5 14 3 17" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
      <ellipse cx="3" cy="9" rx="2.5" ry="1.3" fill="currentColor" opacity="0.4" transform="rotate(-30 3 9)" />
      <ellipse cx="17" cy="13" rx="2.5" ry="1.3" fill="currentColor" opacity="0.4" transform="rotate(30 17 13)" />
      <ellipse cx="3" cy="17" rx="2.5" ry="1.3" fill="currentColor" opacity="0.4" transform="rotate(-30 3 17)" />
    </svg>
  );

  const Ornament = ({ label }: { label: string }) => (
    <div style={s.ornament}>
      <div style={s.ornamentLine} />
      <span style={s.sectionLabel}>{label}</span>
      <div style={s.ornamentLine} />
    </div>
  );

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        input::placeholder, textarea::placeholder {
          color: ${inkSoft}; opacity: 0.5; font-style: italic;
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        button.submit-btn:hover:not(:disabled) { background: ${ink} !important; color: ${cream} !important; }
        button.remove-btn:hover { opacity: 1 !important; color: ${terracotta} !important; }
        select option { background: ${paper}; color: ${ink}; }
      `}</style>

      <div style={s.wrap}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <Sprig />
        </div>

        <div style={s.preamble}>bring a dish to share</div>

        {editingTitle ? (
          <input
            autoFocus
            style={{ ...s.title, ...s.editInput }}
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={() => {
              if (tempTitle.trim()) {
                setTitle(tempTitle.trim());
                saveConfig(tempTitle.trim(), subtitle);
              }
              setEditingTitle(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") setEditingTitle(false);
            }}
          />
        ) : (
          <h1 style={s.title} onClick={() => { setTempTitle(title); setEditingTitle(true); }}>
            {title}
          </h1>
        )}

        {editingSubtitle ? (
          <input
            autoFocus
            style={{ ...s.subtitle, ...s.editInput }}
            value={tempSubtitle}
            onChange={(e) => setTempSubtitle(e.target.value)}
            onBlur={() => {
              setSubtitle(tempSubtitle.trim());
              saveConfig(title, tempSubtitle.trim());
              setEditingSubtitle(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") setEditingSubtitle(false);
            }}
          />
        ) : (
          <div style={s.subtitle} onClick={() => { setTempSubtitle(subtitle); setEditingSubtitle(true); }}>
            {subtitle}
          </div>
        )}

        <div style={s.editHint}>(click the title or date to edit)</div>

        <Ornament label="the offerings so far" />

        <div style={s.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const c = countsByCategory[cat.id];
            const unit = c === 1 ? cat.unit : cat.unitPlural;

            if (cat.id === "essentials") {
              const allClaimed = ESSENTIALS_CHECKLIST.every(
                (item) => matchEssentialItem(item, essentialsEntries)
              );
              return (
                <div key={cat.id} style={{ ...s.categoryCard, gridColumn: "1 / -1" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
                    <div style={s.categoryName}>{cat.label}</div>
                    <div style={{ ...s.categoryCount, marginBottom: 0 }}>
                      {allClaimed ? "all covered!" : `${ESSENTIALS_CHECKLIST.filter((item) => !matchEssentialItem(item, essentialsEntries)).length} still needed`}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "4px 24px" }}>
                    {ESSENTIALS_CHECKLIST.map((item) => {
                      const match = matchEssentialItem(item, essentialsEntries);
                      return (
                        <div
                          key={item}
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 8,
                            padding: "5px 0",
                            borderBottom: `1px dotted ${rule}`,
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: 15,
                          }}
                        >
                          <span style={{ color: match ? sage : inkSoft, fontSize: 16, lineHeight: 1 }}>
                            {match ? "✓" : "○"}
                          </span>
                          <span style={{ color: match ? ink : inkSoft, textDecoration: match ? "none" : "none" }}>
                            {item}
                          </span>
                          {match && (
                            <span style={{ fontStyle: "italic", color: sage, fontSize: 13, marginLeft: 2 }}>
                              — {match.name}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <div key={cat.id} style={s.categoryCard}>
                <div style={s.categoryName}>{cat.label}</div>
                <div style={s.categoryCount}>
                  {c === 0 ? "nothing yet" : `${c} ${unit} so far`}
                </div>
                <div style={s.dots}>
                  {Array.from({ length: c }).map((_, i) => (
                    <span key={i} style={s.dotFilled} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Ornament label="claim a dish" />

        <div style={s.servingNote}>
          please bring any serving utensils and condiments your dish requires
        </div>

        <div style={s.formCard}>
          <div style={s.formRow}>
            <div>
              <label style={s.label}>Your name</label>
              <input
                style={s.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eleanor"
                onKeyDown={(e) => e.key === "Enter" && addEntry()}
              />
            </div>
            <div>
              <label style={s.label}>What you&apos;ll bring</label>
              <input
                style={s.input}
                type="text"
                value={dish}
                onChange={(e) => setDish(e.target.value)}
                placeholder="e.g. deviled eggs"
                onKeyDown={(e) => e.key === "Enter" && addEntry()}
              />
            </div>
          </div>
          <div style={s.formRow}>
            <div>
              <label style={s.label}>Category</label>
              <select style={s.select} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={s.label}>Note (optional)</label>
              <input
                style={s.input}
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. vegetarian, serves 8"
                onKeyDown={(e) => e.key === "Enter" && addEntry()}
              />
            </div>
          </div>
          <div style={s.submitRow}>
            <button
              className="submit-btn"
              style={{ ...s.submit, ...(saving || !name.trim() || !dish.trim() ? s.submitDisabled : {}) }}
              disabled={saving || !name.trim() || !dish.trim()}
              onClick={addEntry}
            >
              {saving ? "saving…" : "add to the table"}
            </button>
          </div>
        </div>

        <Ornament label="who's bringing what" />

        {loading ? (
          <div style={s.emptyMsg}>gathering the list…</div>
        ) : entries.length === 0 ? (
          <div style={s.emptyMsg}>the table is still empty — be the first to claim a dish</div>
        ) : (
          CATEGORIES.map((cat) => {
            const items = entriesByCategory(cat.id);
            if (items.length === 0) return null;
            const unit = items.length === 1 ? cat.unit : cat.unitPlural;
            return (
              <div key={cat.id} style={s.catGroup}>
                <div style={s.catGroupTitle}>
                  {cat.label}
                  <span style={s.catGroupCount}>· {items.length} {unit}</span>
                </div>
                {items.map((e) => (
                  <div key={e.id} style={s.entry}>
                    <span style={s.entryBullet}>·</span>
                    <span style={s.entryDish}>{e.dish}</span>
                    <span style={s.entryDash}>—</span>
                    <span style={s.entryName}>{e.name}</span>
                    {e.notes && <span style={s.entryNote}>({e.notes})</span>}
                    <button
                      className="remove-btn"
                      style={{
                        ...s.entryRemove,
                        ...(pendingRemove === e.id
                          ? { color: terracotta, opacity: 1, fontWeight: 500 }
                          : {}),
                      }}
                      onClick={() => removeEntry(e.id)}
                      title="Remove"
                    >
                      {pendingRemove === e.id ? "click again to confirm" : "remove"}
                    </button>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      <div style={s.toast}>{toast}</div>
    </div>
  );
}
