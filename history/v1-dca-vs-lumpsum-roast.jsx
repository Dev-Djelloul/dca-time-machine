import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// ---------------------------------------------------------------------------
// Data: approximate monthly average BTC/USD price, Jan 2013 -> Jul 2026.
// Illustrative / educational only — not exact historical settlement prices.
// ---------------------------------------------------------------------------
const BTC_MONTHLY = [
  ["2013-01",13],["2013-02",26],["2013-03",47],["2013-04",100],["2013-05",119],["2013-06",100],
  ["2013-07",70],["2013-08",106],["2013-09",127],["2013-10",140],["2013-11",377],["2013-12",754],
  ["2014-01",823],["2014-02",600],["2014-03",450],["2014-04",449],["2014-05",453],["2014-06",600],
  ["2014-07",600],["2014-08",508],["2014-09",387],["2014-10",340],["2014-11",363],["2014-12",320],
  ["2015-01",220],["2015-02",236],["2015-03",244],["2015-04",236],["2015-05",230],["2015-06",223],
  ["2015-07",280],["2015-08",230],["2015-09",236],["2015-10",270],["2015-11",325],["2015-12",430],
  ["2016-01",380],["2016-02",410],["2016-03",415],["2016-04",430],["2016-05",530],["2016-06",650],
  ["2016-07",660],["2016-08",570],["2016-09",610],["2016-10",635],["2016-11",715],["2016-12",900],
  ["2017-01",920],["2017-02",1000],["2017-03",1050],["2017-04",1200],["2017-05",2200],["2017-06",2500],
  ["2017-07",2500],["2017-08",4200],["2017-09",4000],["2017-10",5700],["2017-11",9000],["2017-12",14000],
  ["2018-01",11000],["2018-02",9500],["2018-03",8000],["2018-04",8500],["2018-05",7500],["2018-06",6100],
  ["2018-07",7300],["2018-08",6700],["2018-09",6500],["2018-10",6400],["2018-11",4700],["2018-12",3700],
  ["2019-01",3600],["2019-02",3800],["2019-03",4000],["2019-04",5100],["2019-05",7500],["2019-06",10500],
  ["2019-07",9700],["2019-08",9600],["2019-09",8300],["2019-10",8200],["2019-11",7200],["2019-12",7200],
  ["2020-01",9300],["2020-02",9500],["2020-03",6400],["2020-04",7500],["2020-05",9200],["2020-06",9200],
  ["2020-07",9200],["2020-08",11500],["2020-09",10800],["2020-10",13000],["2020-11",17700],["2020-12",28900],
  ["2021-01",33000],["2021-02",45000],["2021-03",58000],["2021-04",57000],["2021-05",37000],["2021-06",35000],
  ["2021-07",41000],["2021-08",47000],["2021-09",43000],["2021-10",61000],["2021-11",60000],["2021-12",47000],
  ["2022-01",38000],["2022-02",40000],["2022-03",45000],["2022-04",38000],["2022-05",31000],["2022-06",20000],
  ["2022-07",23000],["2022-08",20000],["2022-09",19000],["2022-10",20000],["2022-11",17000],["2022-12",16500],
  ["2023-01",23000],["2023-02",23500],["2023-03",28000],["2023-04",29000],["2023-05",27000],["2023-06",30000],
  ["2023-07",29000],["2023-08",26000],["2023-09",27000],["2023-10",34000],["2023-11",37000],["2023-12",42000],
  ["2024-01",43000],["2024-02",52000],["2024-03",70000],["2024-04",64000],["2024-05",68000],["2024-06",61000],
  ["2024-07",65000],["2024-08",59000],["2024-09",63000],["2024-10",68000],["2024-11",88000],["2024-12",95000],
  ["2025-01",100000],["2025-02",97000],["2025-03",87000],["2025-04",94000],["2025-05",105000],["2025-06",107000],
  ["2025-07",112000],["2025-08",110000],["2025-09",115000],["2025-10",118000],["2025-11",120000],["2025-12",112000],
  ["2026-01",118000],["2026-02",122000],["2026-03",125000],["2026-04",120000],["2026-05",128000],["2026-06",130000],
  ["2026-07",132000],
];

const monthLabel = (key) => {
  const [y, m] = key.split("-");
  const names = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
  return `${names[parseInt(m, 10) - 1]} ${y}`;
};

const fmtEUR = (n) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const fmtBTC = (n) => n.toLocaleString("fr-FR", { maximumFractionDigits: 6 });

// Roast reference items (Paris-flavored, for scale-of-gain jokes)
const REF = { coffee: 3, metro: 2.15, teslaM3: 42000, aptApportParis: 60000 };

function roastLine(multiple) {
  if (multiple < 1)
    return "Aïe. Un Livret A t'aurait fait moins mal.";
  if (multiple < 2)
    return "Tu bats l'inflation. Champion du minimum syndical.";
  if (multiple < 5)
    return "Pas mal du tout. Ça commence à sentir bon.";
  if (multiple < 10)
    return "Là ça pique un peu les yeux de tes collègues.";
  if (multiple < 50)
    return "Une Tesla Model 3 dort tranquillement dans ce gain.";
  if (multiple < 200)
    return "Un apport pour un appart à Paris, potentiellement.";
  return "Bon là il faut appeler un conseiller patrimonial. Pas moi.";
}

function useTypewriterLines(lines, active, speed = 22) {
  const [shown, setShown] = useState([]);
  useEffect(() => {
    if (!active) return;
    setShown([]);
    let cancelled = false;
    (async () => {
      for (let i = 0; i < lines.length; i++) {
        const full = lines[i];
        for (let c = 1; c <= full.length; c++) {
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, speed));
          setShown((prev) => {
            const next = [...prev];
            next[i] = full.slice(0, c);
            return next;
          });
        }
        await new Promise((r) => setTimeout(r, 120));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, lines.join("|")]);
  return shown;
}

export default function DCATimeMachine() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const firstMonth = BTC_MONTHLY[0][0];
  const lastMonth = BTC_MONTHLY[BTC_MONTHLY.length - 1][0];

  const [monthly, setMonthly] = useState(100);
  const [startMonth, setStartMonth] = useState("2020-01");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0); // index into sliced series while animating
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  const priceMap = useMemo(() => new Map(BTC_MONTHLY), []);
  const startIdx = useMemo(
    () => BTC_MONTHLY.findIndex(([k]) => k === startMonth),
    [startMonth]
  );

  const series = useMemo(() => {
    const slice = BTC_MONTHLY.slice(startIdx);
    let btcAccum = 0;
    let invested = 0;
    const startPrice = slice[0][1];
    const lumpBtc = null; // computed after we know total invested
    const rows = slice.map(([key, price], i) => {
      btcAccum += monthly / price;
      invested += monthly;
      return { key, label: monthLabel(key), price, dcaInvested: invested, dcaBtc: btcAccum };
    });
    const totalInvested = rows[rows.length - 1].dcaInvested;
    const lumpBtcFinal = totalInvested / startPrice;
    const full = rows.map((r) => ({
      ...r,
      dcaValue: Math.round(r.dcaBtc * r.price),
      lumpValue: Math.round(lumpBtcFinal * r.price),
    }));
    return { rows: full, lumpBtcFinal, startPrice };
  }, [startIdx, monthly]);

  const finalRow = series.rows[series.rows.length - 1];
  const totalInvested = finalRow?.dcaInvested ?? 0;
  const dcaFinal = finalRow?.dcaValue ?? 0;
  const lumpFinal = finalRow?.lumpValue ?? 0;
  const multiple = totalInvested > 0 ? dcaFinal / totalInvested : 0;

  const visibleData = running || done ? series.rows.slice(0, progress + 1) : [];

  const runSimulation = () => {
    clearInterval(intervalRef.current);
    setDone(false);
    setRunning(true);
    setProgress(0);
    const total = series.rows.length;
    const stepMs = Math.max(8, Math.min(40, Math.floor(1400 / total)));
    let i = 0;
    intervalRef.current = setInterval(() => {
      i += 1;
      setProgress(i);
      if (i >= total - 1) {
        clearInterval(intervalRef.current);
        setRunning(false);
        setDone(true);
      }
    }, stepMs);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const roastLines = useMemo(() => {
    if (!done) return [];
    const gain = dcaFinal - totalInvested;
    const coffees = Math.round(gain / REF.coffee);
    const teslaPct = Math.round((gain / REF.teslaM3) * 100);
    return [
      `> SIMULATION TERMINÉE — ${monthLabel(startMonth)} → ${monthLabel(lastMonth)}`,
      `> Investi : ${fmtEUR(totalInvested)}  (${series.rows.length} versements de ${fmtEUR(monthly)})`,
      `> Valeur DCA aujourd'hui : ${fmtEUR(dcaFinal)}  (x${multiple.toFixed(2)})`,
      `> Valeur lump sum (tout misé au départ) : ${fmtEUR(lumpFinal)}`,
      `> Plus-value : ${fmtEUR(gain)} — soit ${coffees.toLocaleString("fr-FR")} cafés, ou ${teslaPct}% d'une Tesla Model 3.`,
      `> VERDICT : ${roastLine(multiple)}`,
    ];
  }, [done, dcaFinal, totalInvested, lumpFinal, multiple, monthly, startMonth]);

  const typed = useTypewriterLines(roastLines, done, 14);

  const monthOptions = BTC_MONTHLY.slice(0, BTC_MONTHLY.length - 6).map(([k]) => k);

  const [copied, setCopied] = useState(false);
  const copySummary = () => {
    const text = roastLines.map((l) => l.replace(/^> /, "")).join("\n");
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        background: "#0B0F14",
        color: "#E8EDF2",
        minHeight: "100%",
        padding: "28px 18px 48px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
        .cursor { display:inline-block; width:8px; background:#39FF9C; animation: blink 1s step-start infinite; margin-left:2px; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none; appearance:none; width:16px; height:16px; border-radius:50%;
          background:#39FF9C; cursor:pointer; box-shadow:0 0 8px rgba(57,255,156,0.6);
        }
        select, input[type=range] { accent-color:#39FF9C; }
        .btn:active { transform: translateY(1px); }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
          <span style={{ color: "#39FF9C", fontSize: 13, letterSpacing: 2 }}>₿ TERMINAL</span>
          <span style={{ color: "#5A6B7A", fontSize: 12 }}>v1.0</span>
        </div>
        <h1
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 30,
            margin: "0 0 6px",
            letterSpacing: -0.5,
          }}
        >
          DCA Time Machine
        </h1>
        <p style={{ color: "#8FA0AF", fontSize: 13.5, margin: "0 0 26px", lineHeight: 1.5 }}>
          Remonte le temps, investis en Bitcoin façon DCA, et découvre le verdict.
          Données mensuelles approximatives — à but ludique, pas un conseil d'investissement.
        </p>

        {/* Controls */}
        <div
          style={{
            background: "#121821",
            border: "1px solid #1E2733",
            borderRadius: 10,
            padding: "18px 20px",
            marginBottom: 22,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            <div style={{ flex: "1 1 220px" }}>
              <label style={{ fontSize: 11.5, color: "#7C8A9A", letterSpacing: 1 }}>
                MONTANT MENSUEL
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                <input
                  type="range"
                  min={20}
                  max={1000}
                  step={10}
                  value={monthly}
                  onChange={(e) => setMonthly(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ color: "#39FF9C", fontWeight: 700, minWidth: 62, textAlign: "right" }}>
                  {fmtEUR(monthly)}
                </span>
              </div>
            </div>

            <div style={{ flex: "1 1 220px" }}>
              <label style={{ fontSize: 11.5, color: "#7C8A9A", letterSpacing: 1 }}>
                DÉPART DU VOYAGE
              </label>
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                style={{
                  display: "block",
                  marginTop: 6,
                  width: "100%",
                  background: "#0B0F14",
                  color: "#E8EDF2",
                  border: "1px solid #1E2733",
                  borderRadius: 6,
                  padding: "8px 10px",
                  fontFamily: "inherit",
                  fontSize: 13.5,
                }}
              >
                {monthOptions.map((k) => (
                  <option key={k} value={k}>
                    {monthLabel(k)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="btn"
            onClick={runSimulation}
            disabled={running}
            style={{
              marginTop: 18,
              width: "100%",
              padding: "12px 16px",
              background: running ? "#1E2733" : "#39FF9C",
              color: running ? "#7C8A9A" : "#0B0F14",
              border: "none",
              borderRadius: 8,
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 0.5,
              cursor: running ? "default" : "pointer",
            }}
          >
            {running ? "⏳ REMONTÉE DANS LE TEMPS..." : "▶ LANCER LA SIMULATION"}
          </button>
        </div>

        {/* Chart */}
        {(running || done) && (
          <div
            style={{
              background: "#121821",
              border: "1px solid #1E2733",
              borderRadius: 10,
              padding: "16px 8px 8px",
              marginBottom: 22,
            }}
          >
            <div style={{ display: "flex", gap: 18, padding: "0 12px 10px", fontSize: 12 }}>
              <span style={{ color: "#39FF9C" }}>● DCA (versements réguliers)</span>
              <span style={{ color: "#FFB020" }}>● Lump sum (tout au départ)</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={visibleData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1E2733" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#5A6B7A", fontSize: 10 }}
                  interval={Math.floor(series.rows.length / 6)}
                  axisLine={{ stroke: "#1E2733" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#5A6B7A", fontSize: 10 }}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k€`}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0B0F14",
                    border: "1px solid #1E2733",
                    borderRadius: 8,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                  }}
                  formatter={(v, name) => [fmtEUR(v), name === "dcaValue" ? "DCA" : "Lump sum"]}
                  labelStyle={{ color: "#8FA0AF" }}
                />
                <Line
                  type="monotone"
                  dataKey="dcaValue"
                  stroke="#39FF9C"
                  strokeWidth={2.4}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="lumpValue"
                  stroke="#FFB020"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stat cards */}
        {done && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 10,
              marginBottom: 22,
            }}
          >
            {[
              ["INVESTI", fmtEUR(totalInvested), "#8FA0AF"],
              ["VALEUR DCA", fmtEUR(dcaFinal), "#39FF9C"],
              ["VALEUR LUMP SUM", fmtEUR(lumpFinal), "#FFB020"],
              ["MULTIPLE", `x${multiple.toFixed(2)}`, multiple >= 1 ? "#39FF9C" : "#FF5C72"],
            ].map(([label, value, color]) => (
              <div
                key={label}
                style={{
                  background: "#121821",
                  border: "1px solid #1E2733",
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontSize: 10.5, color: "#5A6B7A", letterSpacing: 1 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Receipt */}
        {done && (
          <div style={{ position: "relative" }}>
            <div
              style={{
                background: "#F2ECD9",
                color: "#20261F",
                borderRadius: "2px 2px 0 0",
                padding: "22px 20px 26px",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12.5,
                lineHeight: 1.9,
                boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ textAlign: "center", letterSpacing: 3, fontSize: 11, color: "#5A6B4A", marginBottom: 10 }}>
                ✂ — REÇU DE TÉLÉPORTATION FINANCIÈRE — ✂
              </div>
              {typed.map((line, i) => (
                <div key={i} style={{ whiteSpace: "pre-wrap", fontWeight: i === typed.length - 1 && line.startsWith(">") ? 500 : 400 }}>
                  {line || "\u00A0"}
                  {i === typed.length - 1 && typed.length < roastLines.length && (
                    <span className="cursor">&nbsp;</span>
                  )}
                </div>
              ))}
            </div>
            {/* torn edge */}
            <svg
              width="100%"
              height="14"
              viewBox="0 0 400 14"
              preserveAspectRatio="none"
              style={{ display: "block" }}
            >
              <polygon
                points="0,0 400,0 400,14 380,2 360,14 340,2 320,14 300,2 280,14 260,2 240,14 220,2 200,14 180,2 160,14 140,2 120,14 100,2 80,14 60,2 40,14 20,2 0,14"
                fill="#F2ECD9"
              />
            </svg>

            {typed.length === roastLines.length && (
              <button
                className="btn"
                onClick={copySummary}
                style={{
                  marginTop: 14,
                  padding: "10px 16px",
                  background: "transparent",
                  color: "#39FF9C",
                  border: "1px solid #39FF9C",
                  borderRadius: 8,
                  fontFamily: "inherit",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {copied ? "✓ Copié — colle-le où tu veux" : "📋 Copier le verdict à partager"}
              </button>
            )}
          </div>
        )}

        {!running && !done && (
          <p style={{ color: "#3E4C5A", fontSize: 12, textAlign: "center", marginTop: 30 }}>
            Règle les paramètres puis lance la simulation ↑
          </p>
        )}
      </div>
    </div>
  );
}
