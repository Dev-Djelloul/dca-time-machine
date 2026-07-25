import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// ---------------------------------------------------------------------------
// Fallback data: approximate monthly average USD price.
// Used when the live CoinGecko fetch fails or is rate-limited.
// Illustrative only — not exact historical settlement prices.
// ---------------------------------------------------------------------------
const BTC_FALLBACK = [
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

const ETH_FALLBACK = [
  ["2016-01",1],["2016-02",5],["2016-03",11],["2016-04",9],["2016-05",11],["2016-06",13],
  ["2016-07",12],["2016-08",11],["2016-09",12],["2016-10",12],["2016-11",10],["2016-12",8],
  ["2017-01",10],["2017-02",12],["2017-03",15],["2017-04",50],["2017-05",90],["2017-06",270],
  ["2017-07",200],["2017-08",300],["2017-09",280],["2017-10",300],["2017-11",330],["2017-12",730],
  ["2018-01",1100],["2018-02",850],["2018-03",700],["2018-04",500],["2018-05",600],["2018-06",500],
  ["2018-07",430],["2018-08",290],["2018-09",220],["2018-10",210],["2018-11",110],["2018-12",130],
  ["2019-01",120],["2019-02",150],["2019-03",135],["2019-04",165],["2019-05",210],["2019-06",270],
  ["2019-07",220],["2019-08",190],["2019-09",170],["2019-10",180],["2019-11",150],["2019-12",130],
  ["2020-01",180],["2020-02",220],["2020-03",150],["2020-04",190],["2020-05",210],["2020-06",230],
  ["2020-07",250],["2020-08",400],["2020-09",350],["2020-10",380],["2020-11",480],["2020-12",730],
  ["2021-01",1100],["2021-02",1600],["2021-03",1800],["2021-04",2500],["2021-05",2700],["2021-06",2200],
  ["2021-07",2100],["2021-08",3100],["2021-09",3000],["2021-10",4100],["2021-11",4600],["2021-12",3700],
  ["2022-01",2700],["2022-02",2900],["2022-03",3200],["2022-04",3000],["2022-05",2000],["2022-06",1100],
  ["2022-07",1400],["2022-08",1600],["2022-09",1300],["2022-10",1300],["2022-11",1100],["2022-12",1200],
  ["2023-01",1550],["2023-02",1600],["2023-03",1800],["2023-04",1900],["2023-05",1900],["2023-06",1850],
  ["2023-07",1900],["2023-08",1650],["2023-09",1650],["2023-10",1700],["2023-11",2000],["2023-12",2300],
  ["2024-01",2300],["2024-02",2700],["2024-03",3500],["2024-04",3100],["2024-05",3000],["2024-06",3400],
  ["2024-07",3200],["2024-08",2600],["2024-09",2400],["2024-10",2500],["2024-11",3100],["2024-12",3400],
  ["2025-01",3300],["2025-02",3200],["2025-03",2800],["2025-04",3100],["2025-05",3400],["2025-06",3600],
  ["2025-07",3700],["2025-08",3600],["2025-09",3800],["2025-10",4000],["2025-11",4200],["2025-12",3900],
  ["2026-01",4100],["2026-02",4300],["2026-03",4400],["2026-04",4200],["2026-05",4500],["2026-06",4700],
  ["2026-07",4800],
];

// Solana only has meaningful trading history from mid-2020 onward.
const SOL_FALLBACK = [
  ["2020-04",0.5],["2020-05",0.7],["2020-06",0.6],["2020-07",0.6],["2020-08",3],["2020-09",3],
  ["2020-10",1.5],["2020-11",1.6],["2020-12",1.5],
  ["2021-01",1.8],["2021-02",8],["2021-03",15],["2021-04",35],["2021-05",30],["2021-06",32],
  ["2021-07",27],["2021-08",75],["2021-09",140],["2021-10",180],["2021-11",220],["2021-12",170],
  ["2022-01",120],["2022-02",100],["2022-03",95],["2022-04",100],["2022-05",55],["2022-06",35],
  ["2022-07",38],["2022-08",35],["2022-09",32],["2022-10",32],["2022-11",15],["2022-12",10],
  ["2023-01",22],["2023-02",23],["2023-03",21],["2023-04",22],["2023-05",20],["2023-06",17],
  ["2023-07",24],["2023-08",24],["2023-09",20],["2023-10",32],["2023-11",58],["2023-12",100],
  ["2024-01",100],["2024-02",110],["2024-03",190],["2024-04",150],["2024-05",160],["2024-06",135],
  ["2024-07",165],["2024-08",145],["2024-09",140],["2024-10",165],["2024-11",230],["2024-12",190],
  ["2025-01",200],["2025-02",180],["2025-03",130],["2025-04",150],["2025-05",170],["2025-06",150],
  ["2025-07",175],["2025-08",180],["2025-09",190],["2025-10",200],["2025-11",210],["2025-12",195],
  ["2026-01",200],["2026-02",210],["2026-03",220],["2026-04",210],["2026-05",230],["2026-06",240],
  ["2026-07",250],
];

const ASSETS = {
  BTC: { id: "bitcoin", label: "Bitcoin", symbol: "₿", fallback: BTC_FALLBACK, color: "#39FF9C" },
  ETH: { id: "ethereum", label: "Ethereum", symbol: "Ξ", fallback: ETH_FALLBACK, color: "#8C9EFF" },
  SOL: { id: "solana", label: "Solana", symbol: "◎", fallback: SOL_FALLBACK, color: "#FF7AD1" },
};
const ASSET_KEYS = Object.keys(ASSETS);

// Approximate monthly S&P 500 (total return, USD) — used only as a "classic investment" reference overlay.
const SP500_FALLBACK = [
  ["2013-01",145],["2013-07",162],["2014-01",178],["2014-07",192],["2015-01",199],["2015-07",204],
  ["2016-01",188],["2016-07",210],["2017-01",220],["2017-07",236],["2018-01",258],["2018-07",270],
  ["2019-01",245],["2019-07",283],["2020-01",300],["2020-07",300],["2021-01",348],["2021-07",406],
  ["2022-01",434],["2022-07",378],["2023-01",371],["2023-07",427],["2024-01",459],["2024-07",524],
  ["2025-01",568],["2025-07",590],["2026-01",610],["2026-07",625],
];
function expandSp500ToMonthly(months) {
  const anchors = SP500_FALLBACK.map(([k, v]) => ({
    idx: months.indexOf(k) >= 0 ? months.indexOf(k) : null,
    v,
  })).filter((a) => a.idx !== null);
  const out = [];
  for (let i = 0; i < months.length; i++) {
    let prev = anchors[0];
    let next = anchors[anchors.length - 1];
    for (let a = 0; a < anchors.length - 1; a++) {
      if (anchors[a].idx <= i && anchors[a + 1].idx >= i) {
        prev = anchors[a];
        next = anchors[a + 1];
        break;
      }
    }
    const span = next.idx - prev.idx || 1;
    const t = (i - prev.idx) / span;
    const value = prev.v + (next.v - prev.v) * Math.max(0, Math.min(1, t));
    out.push([months[i], Math.round(value * 100) / 100]);
  }
  return out;
}
const SP500_MONTHLY = expandSp500ToMonthly(BTC_FALLBACK.map(([k]) => k));
const AMOUNT_PRESETS = [50, 100, 200, 500, 1000];

const STORAGE_KEY = "dca-time-machine:settings";
const SCORE_KEY = "dca-time-machine:challenge-score";

const monthLabel = (key) => {
  const [y, m] = key.split("-");
  const names = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
  return `${names[parseInt(m, 10) - 1]} ${y}`;
};

const fmtEUR = (n) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const fmtQty = (n, symbol) => `${n.toLocaleString("fr-FR", { maximumFractionDigits: 6 })} ${symbol}`;

const REF = { coffee: 3, teslaM3: 42000 };

function roastLine(multiple) {
  if (multiple < 1) return "Aïe. Un Livret A t'aurait fait moins mal.";
  if (multiple < 2) return "Tu bats l'inflation. Champion du minimum syndical.";
  if (multiple < 5) return "Pas mal du tout. Ça commence à sentir bon.";
  if (multiple < 10) return "Là ça pique un peu les yeux de tes collègues.";
  if (multiple < 50) return "Une Tesla Model 3 dort tranquillement dans ce gain.";
  if (multiple < 200) return "Un apport pour un appart à Paris, potentiellement.";
  return "Bon là il faut appeler un conseiller patrimonial. Pas moi.";
}

function useTypewriterLines(lines, active, speed = 14) {
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

function toMonthlySeries(rawPrices) {
  const buckets = new Map();
  for (const [ts, price] of rawPrices) {
    const d = new Date(ts);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(price);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, arr]) => [key, Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)]);
}

function computeDcaRows(monthlySeries, startMonth, monthlyAmount) {
  const startIdx = monthlySeries.findIndex(([k]) => k === startMonth);
  if (startIdx < 0) return { rows: [] };
  const slice = monthlySeries.slice(startIdx);
  let btcAccum = 0;
  let invested = 0;
  const startPrice = slice[0][1];
  const rows = slice.map(([key, price], i, arr) => {
    btcAccum += monthlyAmount / price;
    invested += monthlyAmount;
    const prevPrice = i > 0 ? arr[i - 1][1] : price;
    const changePct = i > 0 ? (price - prevPrice) / prevPrice : 0;
    return { key, label: monthLabel(key), price, dcaInvested: invested, dcaBtc: btcAccum, changePct };
  });
  if (!rows.length) return { rows: [] };
  const totalInvested = rows[rows.length - 1].dcaInvested;
  const lumpBtcFinal = totalInvested / startPrice;
  const full = rows.map((r) => ({
    ...r,
    dcaValue: Math.round(r.dcaBtc * r.price),
    lumpValue: Math.round(lumpBtcFinal * r.price),
  }));
  return { rows: full, lumpBtcFinal, startPrice };
}

function loadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
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

  const saved = useMemo(() => loadJSON(STORAGE_KEY), []);

  const [asset, setAsset] = useState(saved?.asset || "BTC");
  const [compareMode, setCompareMode] = useState(saved?.compareMode || false);
  const [compareAssets, setCompareAssets] = useState(saved?.compareAssets || ["BTC", "ETH"]);
  const [monthly, setMonthly] = useState(saved?.monthly ?? 100);
  const [startMonth, setStartMonth] = useState(saved?.startMonth || "2020-01");
  const [showReference, setShowReference] = useState(saved?.showReference || false);
  const [delayMonths, setDelayMonths] = useState(saved?.delayMonths ?? 6);
  const [challengeMode, setChallengeMode] = useState(saved?.challengeMode || false);
  const [prediction, setPrediction] = useState(null); // "dca" | "lump" | null
  const [score, setScore] = useState(() => loadJSON(SCORE_KEY) || { correct: 0, total: 0 });
  const [contributionDay, setContributionDay] = useState(saved?.contributionDay ?? 25);
  const [browserNotif, setBrowserNotif] = useState(saved?.browserNotif || false);
  const [livePrices, setLivePrices] = useState({}); // { BTC: number, ETH: number, SOL: number }

  const [assetData, setAssetData] = useState(() => {
    const init = {};
    ASSET_KEYS.forEach((k) => (init[k] = { series: ASSETS[k].fallback, source: "loading" }));
    return init;
  });

  // Fetch all three assets independently, always, so switching tabs / compare picks is instant.
  useEffect(() => {
    let cancelled = false;
    ASSET_KEYS.forEach((key) => {
      const cfg = ASSETS[key];
      const from = Math.floor(new Date("2013-01-01").getTime() / 1000);
      const to = Math.floor(Date.now() / 1000);
      const url = `https://api.coingecko.com/api/v3/coins/${cfg.id}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;
      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error("bad status");
          return r.json();
        })
        .then((json) => {
          if (cancelled) return;
          if (!json?.prices?.length) throw new Error("empty");
          const monthlySeries = toMonthlySeries(json.prices);
          if (monthlySeries.length < 6) throw new Error("too sparse");
          setAssetData((prev) => ({ ...prev, [key]: { series: monthlySeries, source: "live" } }));
        })
        .catch(() => {
          if (cancelled) return;
          setAssetData((prev) => ({ ...prev, [key]: { series: cfg.fallback, source: "fallback" } }));
        });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Live "right now" prices for the reminder banner and exit scenarios (separate, lightweight endpoint).
  useEffect(() => {
    let cancelled = false;
    const ids = ASSET_KEYS.map((k) => ASSETS[k].id).join(",");
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
      .then((r) => {
        if (!r.ok) throw new Error("bad status");
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        const next = {};
        ASSET_KEYS.forEach((k) => {
          const v = json?.[ASSETS[k].id]?.usd;
          if (typeof v === "number") next[k] = v;
        });
        if (Object.keys(next).length) setLivePrices(next);
      })
      .catch(() => {
        // silent — the banner falls back to the last fallback/monthly data point per asset
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveJSON(STORAGE_KEY, {
      asset,
      compareMode,
      compareAssets,
      monthly,
      startMonth,
      showReference,
      delayMonths,
      challengeMode,
      contributionDay,
      browserNotif,
    });
  }, [asset, compareMode, compareAssets, monthly, startMonth, showReference, delayMonths, challengeMode, contributionDay, browserNotif]);

  const activeData = assetData[asset];
  const monthlySeries = activeData.series;
  const dataSource = activeData.source;
  const lastMonth = monthlySeries[monthlySeries.length - 1]?.[0];

  // "Today's contribution" reminder: is today the chosen day-of-month, and what would the monthly
  // amount buy at today's live price?
  const todayInfo = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const isToday = day === contributionDay;
    let daysUntil = contributionDay - day;
    if (daysUntil < 0) {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, contributionDay);
      daysUntil = Math.ceil((nextMonth - now) / 86400000);
    }
    const price = livePrices[asset] ?? monthlySeries[monthlySeries.length - 1]?.[1] ?? null;
    const buyQty = price ? monthly / price : null;
    return { isToday, daysUntil, price, buyQty };
  }, [contributionDay, livePrices, asset, monthlySeries, monthly]);

  const notifiedRef = useRef(false);
  useEffect(() => {
    if (!browserNotif || !todayInfo.isToday || notifiedRef.current) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "granted") {
      try {
        new Notification("DCA Time Machine", {
          body: `Aujourd'hui c'est ton jour de versement — ${fmtEUR(monthly)} au prix actuel.`,
        });
        notifiedRef.current = true;
      } catch {
        // Notification blocked by the browser/iframe — the in-app banner still shows the reminder.
      }
    }
  }, [browserNotif, todayInfo.isToday, monthly]);

  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const keys = monthlySeries.map(([k]) => k);
    if (!keys.includes(startMonth)) {
      setStartMonth(keys[Math.max(0, keys.length - 40)] || keys[0]);
    }
    setDone(false);
    setRunning(false);
    setPrediction(null);
    clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlySeries]);

  const series = useMemo(
    () => computeDcaRows(monthlySeries, startMonth, monthly),
    [monthlySeries, startMonth, monthly]
  );

  const referenceSeries = useMemo(
    () => (showReference && !compareMode ? computeDcaRows(SP500_MONTHLY, startMonth, monthly) : null),
    [showReference, compareMode, startMonth, monthly]
  );

  const delayedSeries = useMemo(() => {
    if (compareMode || !series.rows.length) return null;
    const rows = series.rows;
    const total = rows[rows.length - 1].dcaInvested;
    const idx = Math.min(delayMonths, rows.length - 1);
    const investPrice = rows[idx].price;
    const qty = total / investPrice;
    return rows.map((r, i) => ({
      key: r.key,
      delayedValue: i < idx ? total : Math.round(qty * r.price),
    }));
  }, [compareMode, series.rows, delayMonths]);

  // Multi-asset comparison — any 2 or 3 of BTC/ETH/SOL, clamped to a start month all of them have data for.
  const compareSeries = useMemo(() => {
    if (!compareMode || compareAssets.length < 2) return null;
    let effectiveStart = startMonth;
    compareAssets.forEach((k) => {
      const firstMonth = assetData[k].series[0]?.[0];
      if (firstMonth && firstMonth > effectiveStart) effectiveStart = firstMonth;
    });
    const perAsset = {};
    compareAssets.forEach((k) => {
      perAsset[k] = computeDcaRows(assetData[k].series, effectiveStart, monthly);
    });
    return { effectiveStart, perAsset };
  }, [compareMode, compareAssets, assetData, startMonth, monthly]);

  const finalRow = series.rows[series.rows.length - 1];
  const totalInvested = finalRow?.dcaInvested ?? 0;
  const dcaFinal = finalRow?.dcaValue ?? 0;
  const lumpFinal = finalRow?.lumpValue ?? 0;
  const multiple = totalInvested > 0 ? dcaFinal / totalInvested : 0;

  // "Et si j'arrêtais maintenant ?" — hypothetical scenarios from here, using today's live price,
  // not a prediction of what will actually happen.
  const exitScenarios = useMemo(() => {
    if (!done || compareMode || !finalRow || !todayInfo.price) return null;
    const qty = finalRow.dcaBtc;
    return [-0.3, 0, 0.5].map((delta) => ({
      delta,
      price: todayInfo.price * (1 + delta),
      value: Math.round(qty * todayInfo.price * (1 + delta)),
    }));
  }, [done, compareMode, finalRow, todayInfo.price]);

  const compareFinals = useMemo(() => {
    if (!compareSeries) return null;
    const out = {};
    compareAssets.forEach((k) => {
      const rows = compareSeries.perAsset[k].rows;
      out[k] = rows[rows.length - 1];
    });
    return out;
  }, [compareSeries, compareAssets]);

  const rowCount = compareMode
    ? compareSeries?.perAsset[compareAssets[0]]?.rows.length || 0
    : series.rows.length;

  const visibleData = useMemo(() => {
    if (!(running || done)) return [];
    if (!compareMode) {
      let rows = series.rows.slice(0, progress + 1);
      if (showReference && referenceSeries) {
        const refRows = referenceSeries.rows.slice(0, progress + 1);
        rows = rows.map((r, i) => ({ ...r, refValue: refRows[i]?.dcaValue ?? null }));
      }
      if (delayedSeries) {
        const delSlice = delayedSeries.slice(0, progress + 1);
        rows = rows.map((r, i) => ({ ...r, delayedValue: delSlice[i]?.delayedValue ?? null }));
      }
      return rows;
    }
    if (!compareSeries) return [];
    const base = compareSeries.perAsset[compareAssets[0]].rows.slice(0, progress + 1);
    return base.map((r, i) => {
      const point = { label: r.label };
      compareAssets.forEach((k) => {
        point[`${k}Value`] = compareSeries.perAsset[k].rows[i]?.dcaValue ?? null;
      });
      return point;
    });
  }, [running, done, compareMode, series.rows, compareSeries, compareAssets, progress, showReference, referenceSeries, delayedSeries]);

  const runSimulation = () => {
    if (!rowCount) return;
    if (challengeMode && !compareMode && !prediction) return; // must predict first
    clearInterval(intervalRef.current);
    setDone(false);
    setRunning(true);
    setProgress(0);
    const stepMs = Math.max(8, Math.min(40, Math.floor(1400 / rowCount)));
    let i = 0;
    intervalRef.current = setInterval(() => {
      i += 1;
      setProgress(i);
      if (i >= rowCount - 1) {
        clearInterval(intervalRef.current);
        setRunning(false);
        setDone(true);
      }
    }, stepMs);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  // Score the challenge-mode prediction once the simulation completes.
  useEffect(() => {
    if (done && challengeMode && !compareMode && prediction && finalRow) {
      const actualWinner = dcaFinal >= lumpFinal ? "dca" : "lump";
      const correct = actualWinner === prediction;
      setScore((prev) => {
        const next = { correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 };
        saveJSON(SCORE_KEY, next);
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const assetCfg = ASSETS[asset];

  const roastLines = useMemo(() => {
    if (!done) return [];

    if (compareMode && compareFinals) {
      const multiples = compareAssets.map((k) => ({
        key: k,
        label: ASSETS[k].label,
        mult: compareFinals[k].dcaValue / compareFinals[k].dcaInvested,
        value: compareFinals[k].dcaValue,
      }));
      multiples.sort((a, b) => b.mult - a.mult);
      const winner = multiples[0];
      const runnerUp = multiples[1];
      const diffPct = Math.round((winner.mult / runnerUp.mult - 1) * 100);
      const lines = [
        `> COMPARATIF — ${monthLabel(compareSeries.effectiveStart)} → ${monthLabel(lastMonth)}`,
        `> Même stratégie DCA de ${fmtEUR(monthly)}/mois sur ${compareAssets.length} actifs.`,
        ...multiples.map((m) => `> ${m.label} : ${fmtEUR(m.value)}  (x${m.mult.toFixed(2)})`),
        `> VERDICT : ${winner.label} l'emporte, avec ${diffPct}% de mieux que ${runnerUp.label}.`,
      ];
      return lines;
    }

    if (!finalRow) return [];
    const gain = dcaFinal - totalInvested;
    const coffees = Math.round(gain / REF.coffee);
    const teslaPct = Math.round((gain / REF.teslaM3) * 100);
    const lines = [
      `> SIMULATION TERMINÉE — ${monthLabel(startMonth)} → ${monthLabel(lastMonth)}`,
      `> Investi : ${fmtEUR(totalInvested)}  (${series.rows.length} versements de ${fmtEUR(monthly)})`,
      `> Valeur DCA aujourd'hui : ${fmtEUR(dcaFinal)}  (x${multiple.toFixed(2)})`,
      `> Valeur lump sum (tout misé au départ) : ${fmtEUR(lumpFinal)}`,
      `> Plus-value : ${fmtEUR(gain)} — soit ${coffees.toLocaleString("fr-FR")} cafés, ou ${teslaPct}% d'une Tesla Model 3.`,
    ];
    if (showReference && referenceSeries?.rows.length) {
      const refFinal = referenceSeries.rows[referenceSeries.rows.length - 1].dcaValue;
      const refMult = refFinal / totalInvested;
      lines.push(
        `> Même stratégie sur le S&P 500 : ${fmtEUR(refFinal)}  (x${refMult.toFixed(2)}) — ${
          multiple >= refMult ? "la crypto gagne" : "le placement classique gagne"
        } sur cette période.`
      );
    }
    if (delayMonths > 0 && delayedSeries?.length) {
      const delayedFinal = delayedSeries[delayedSeries.length - 1].delayedValue;
      const costOfWaiting = lumpFinal - delayedFinal;
      lines.push(
        `> Attendre ${delayMonths} mois avant de tout investir : ${fmtEUR(delayedFinal)} — ${
          costOfWaiting > 0
            ? `ça t'aurait coûté ${fmtEUR(costOfWaiting)} d'avoir attendu.`
            : `bien joué, attendre t'aurait fait gagner ${fmtEUR(-costOfWaiting)}.`
        }`
      );
    }
    if (challengeMode && prediction) {
      const actualWinner = dcaFinal >= lumpFinal ? "dca" : "lump";
      const correct = actualWinner === prediction;
      lines.push(
        `> DÉFI : tu avais parié sur "${prediction === "dca" ? "le DCA" : "le lump sum"}" — ${
          correct ? "GAGNÉ, bien vu." : "PERDU, c'était l'autre."
        }`
      );
    }
    lines.push(`> VERDICT : ${roastLine(multiple)}`);
    return lines;
  }, [done, compareMode, compareFinals, compareSeries, compareAssets, finalRow, dcaFinal, totalInvested, lumpFinal, multiple, monthly, startMonth, lastMonth, series.rows.length, showReference, referenceSeries, delayMonths, delayedSeries, challengeMode, prediction]);

  const typed = useTypewriterLines(roastLines, done, 14);
  const fullyTyped = typed.length === roastLines.length && roastLines.length > 0;

  const monthOptions = monthlySeries.slice(0, Math.max(1, monthlySeries.length - 3)).map(([k]) => k);

  const [copied, setCopied] = useState(false);
  const copySummary = () => {
    const text = roastLines.map((l) => l.replace(/^> /, "")).join("\n");
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  // Export the receipt as a real downloadable PNG, drawn on a canvas (no external lib needed).
  const exportReceiptImage = useCallback(() => {
    if (!roastLines.length) return;
    const width = 640;
    const paddingX = 34;
    const lineHeight = 26;
    const headerH = 70;
    const footerH = 40;
    const bodyLines = roastLines.map((l) => l.replace(/^> /, ""));
    const height = headerH + bodyLines.length * lineHeight + footerH;

    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    ctx.fillStyle = "#F2ECD9";
    ctx.fillRect(0, 0, width, height - 12);

    ctx.beginPath();
    ctx.moveTo(0, height - 12);
    const teeth = 20;
    const teethWidth = width / teeth;
    for (let i = 0; i <= teeth; i++) {
      const x = i * teethWidth;
      const y = height - 12 + (i % 2 === 0 ? 12 : 0);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height - 12);
    ctx.closePath();
    ctx.fillStyle = "#F2ECD9";
    ctx.fill();

    ctx.fillStyle = "#5A6B4A";
    ctx.font = "600 12px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      compareMode ? "— REÇU DE COMPARATIF CRYPTO —" : "— REÇU DE TÉLÉPORTATION FINANCIÈRE —",
      width / 2,
      34
    );

    ctx.textAlign = "left";
    ctx.fillStyle = "#20261F";
    bodyLines.forEach((line, i) => {
      const isVerdict = line.startsWith("VERDICT");
      ctx.font = `${isVerdict ? "700" : "400"} 13px 'IBM Plex Mono', monospace`;
      const maxWidth = width - paddingX * 2;
      const words = line.split(" ");
      let curLine = "";
      let y = headerH + i * lineHeight;
      const wrapped = [];
      words.forEach((w) => {
        const test = curLine ? curLine + " " + w : w;
        if (ctx.measureText(test).width > maxWidth && curLine) {
          wrapped.push(curLine);
          curLine = w;
        } else {
          curLine = test;
        }
      });
      if (curLine) wrapped.push(curLine);
      wrapped.forEach((wl, j) => ctx.fillText(wl, paddingX, y + j * 16));
    });

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `dca-time-machine-${compareMode ? "compare" : asset.toLowerCase()}-${startMonth}.png`;
    a.click();
  }, [roastLines, asset, startMonth, compareMode]);

  // Export a vertical 9:16 "story" card — bold headline number, made for sharing on mobile.
  const exportStoryImage = useCallback(() => {
    if (!roastLines.length) return;
    const W = 720;
    const H = 1280;
    const canvas = document.createElement("canvas");
    const scale = 1.5;
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    const accent = compareMode
      ? ASSETS[compareAssets.sort((a, b) => (compareFinals[b].dcaValue / compareFinals[b].dcaInvested) - (compareFinals[a].dcaValue / compareFinals[a].dcaInvested))[0]].color
      : assetCfg.color;

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0B0F14");
    grad.addColorStop(1, "#121821");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";
    ctx.fillStyle = "#5A6B7A";
    ctx.font = "600 20px 'IBM Plex Mono', monospace";
    ctx.fillText("DCA TIME MACHINE", W / 2, 120);

    const mult = compareMode
      ? Math.max(...compareAssets.map((k) => compareFinals[k].dcaValue / compareFinals[k].dcaInvested))
      : multiple;

    ctx.fillStyle = accent;
    ctx.font = "700 150px 'Space Mono', monospace";
    ctx.fillText(`x${mult.toFixed(1)}`, W / 2, 400);

    ctx.fillStyle = "#E8EDF2";
    ctx.font = "500 26px 'IBM Plex Mono', monospace";
    const headline = compareMode
      ? `DCA sur ${compareAssets.map((k) => ASSETS[k].label).join(" / ")}`
      : `DCA en ${assetCfg.label} depuis ${monthLabel(startMonth)}`;
    ctx.fillText(headline, W / 2, 460);

    ctx.font = "400 22px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#8FA0AF";
    const sub = compareMode
      ? `Même stratégie, ${fmtEUR(monthly)}/mois`
      : `${fmtEUR(totalInvested)} investis → ${fmtEUR(dcaFinal)}`;
    ctx.fillText(sub, W / 2, 500);

    // verdict block near the bottom, wrapped
    const verdict = roastLines[roastLines.length - 1].replace(/^> VERDICT : /, "");
    ctx.font = "400 24px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#F2ECD9";
    const maxWidth = W - 100;
    const words = verdict.split(" ");
    let curLine = "";
    const wrapped = [];
    words.forEach((w) => {
      const test = curLine ? curLine + " " + w : w;
      if (ctx.measureText(test).width > maxWidth && curLine) {
        wrapped.push(curLine);
        curLine = w;
      } else {
        curLine = test;
      }
    });
    if (curLine) wrapped.push(curLine);
    const verdictStartY = 850;
    wrapped.forEach((wl, i) => ctx.fillText(wl, W / 2, verdictStartY + i * 34));

    ctx.font = "500 18px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#3E4C5A";
    ctx.fillText("Contenu ludique — pas un conseil en investissement", W / 2, H - 60);

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `dca-story-${compareMode ? "compare" : asset.toLowerCase()}-${startMonth}.png`;
    a.click();
  }, [roastLines, asset, startMonth, compareMode, compareAssets, compareFinals, assetCfg, multiple, monthly, totalInvested, dcaFinal]);

  const toggleCompareAsset = (key) => {
    setCompareAssets((prev) => {
      if (prev.includes(key)) {
        if (prev.length <= 2) return prev; // keep at least 2 selected
        return prev.filter((k) => k !== key);
      }
      if (prev.length >= 3) return prev; // cap at 3
      return [...prev, key];
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
        .assetBtn, .toggle { transition: all .15s ease; }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ color: "#39FF9C", fontSize: 13, letterSpacing: 2 }}>TERMINAL</span>
          <span style={{ color: "#5A6B7A", fontSize: 12 }}>v4.0</span>
          {challengeMode && (
            <span style={{ fontSize: 11, color: "#FFB020" }}>
              SCORE DÉFI : {score.correct}/{score.total}
            </span>
          )}
          <span
            style={{
              marginLeft: "auto",
              fontSize: 10.5,
              padding: "3px 8px",
              borderRadius: 20,
              border: "1px solid #1E2733",
              color: dataSource === "live" ? "#39FF9C" : dataSource === "loading" ? "#5A6B7A" : "#FFB020",
            }}
          >
            {dataSource === "loading" && "connexion aux données..."}
            {dataSource === "live" && "données live (CoinGecko)"}
            {dataSource === "fallback" && "données locales (fallback)"}
          </span>
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
        <p style={{ color: "#8FA0AF", fontSize: 13.5, margin: "0 0 20px", lineHeight: 1.5 }}>
          Remonte le temps, investis façon DCA, et découvre le verdict.
          Contenu ludique, ne constitue pas un conseil en investissement.
        </p>

        {/* Reminder banner */}
        <div
          style={{
            border: `1px solid ${todayInfo.isToday ? assetCfg.color : "#1E2733"}`,
            background: todayInfo.isToday ? "rgba(57,255,156,0.06)" : "#121821",
            borderRadius: 10,
            padding: "14px 16px",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 13, color: todayInfo.isToday ? assetCfg.color : "#8FA0AF" }}>
              {todayInfo.isToday
                ? `Aujourd'hui, c'est ton jour de versement ${assetCfg.label} !`
                : `Prochain versement dans ${todayInfo.daysUntil} jour${todayInfo.daysUntil > 1 ? "s" : ""} (le ${contributionDay} du mois).`}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#5A6B7A" }}>
              Jour du versement :
              <select
                value={contributionDay}
                onChange={(e) => setContributionDay(Number(e.target.value))}
                style={{ background: "#0B0F14", color: "#E8EDF2", border: "1px solid #1E2733", borderRadius: 5, padding: "3px 6px", fontFamily: "inherit", fontSize: 11.5 }}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          {todayInfo.price && (
            <div style={{ marginTop: 8, fontSize: 12.5, color: "#E8EDF2" }}>
              Au prix actuel ({fmtEUR(todayInfo.price)}), {fmtEUR(monthly)} t'achète environ{" "}
              <span style={{ color: assetCfg.color, fontWeight: 700 }}>{fmtQty(todayInfo.buyQty, assetCfg.symbol)}</span>.
            </div>
          )}
          <div style={{ marginTop: 8 }}>
            {browserNotif ? (
              <span style={{ fontSize: 11.5, color: "#39FF9C" }}>Rappel navigateur activé (tant que cet onglet reste ouvert).</span>
            ) : (
              <button
                onClick={() => {
                  if (typeof Notification === "undefined") {
                    setBrowserNotif(true);
                    return;
                  }
                  Notification.requestPermission().then((perm) => setBrowserNotif(perm === "granted"));
                }}
                style={{ background: "transparent", border: "1px solid #1E2733", color: "#7C8A9A", borderRadius: 6, padding: "5px 10px", fontFamily: "inherit", fontSize: 11.5, cursor: "pointer" }}
              >
                Activer un rappel navigateur
              </button>
            )}
          </div>
        </div>

        {/* Mode toggles */}
        <div
          onClick={() => setCompareMode((v) => !v)}
          className="toggle"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            marginBottom: 10,
            borderRadius: 8,
            border: `1px solid ${compareMode ? "#FFB020" : "#1E2733"}`,
            background: compareMode ? "rgba(255,176,32,0.08)" : "#121821",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 13, color: compareMode ? "#FFB020" : "#8FA0AF" }}>
            Mode comparaison — 2 ou 3 cryptos face à face
          </span>
          <span style={{ width: 36, height: 20, borderRadius: 10, background: compareMode ? "#FFB020" : "#1E2733", position: "relative", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 2, left: compareMode ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#0B0F14", transition: "left .15s ease" }} />
          </span>
        </div>

        {!compareMode && (
          <div
            onClick={() => setChallengeMode((v) => !v)}
            className="toggle"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              marginBottom: 18,
              borderRadius: 8,
              border: `1px solid ${challengeMode ? "#FF8A5C" : "#1E2733"}`,
              background: challengeMode ? "rgba(255,138,92,0.08)" : "#121821",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 13, color: challengeMode ? "#FF8A5C" : "#8FA0AF" }}>
              Mode défi — devine avant de lancer
            </span>
            <span style={{ width: 36, height: 20, borderRadius: 10, background: challengeMode ? "#FF8A5C" : "#1E2733", position: "relative", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 2, left: challengeMode ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#0B0F14", transition: "left .15s ease" }} />
            </span>
          </div>
        )}

        {/* Asset selector */}
        {!compareMode ? (
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {ASSET_KEYS.map((key) => {
              const cfg = ASSETS[key];
              return (
                <button
                  key={key}
                  className="assetBtn"
                  onClick={() => setAsset(key)}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: `1px solid ${asset === key ? cfg.color : "#1E2733"}`,
                    background: asset === key ? "rgba(57,255,156,0.08)" : "#121821",
                    color: asset === key ? cfg.color : "#7C8A9A",
                    fontFamily: "inherit",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11.5, color: "#7C8A9A", letterSpacing: 1 }}>
              CHOISIS 2 OU 3 ACTIFS À COMPARER
            </label>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {ASSET_KEYS.map((key) => {
                const cfg = ASSETS[key];
                const selected = compareAssets.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleCompareAsset(key)}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: `1px solid ${selected ? cfg.color : "#1E2733"}`,
                      background: selected ? "rgba(255,255,255,0.04)" : "#121821",
                      color: selected ? cfg.color : "#5A6B7A",
                      fontFamily: "inherit",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
                <span style={{ color: assetCfg.color, fontWeight: 700, minWidth: 62, textAlign: "right" }}>
                  {fmtEUR(monthly)}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {AMOUNT_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setMonthly(p)}
                    style={{
                      flex: 1,
                      padding: "5px 0",
                      borderRadius: 5,
                      border: `1px solid ${monthly === p ? assetCfg.color : "#1E2733"}`,
                      background: monthly === p ? "rgba(57,255,156,0.08)" : "transparent",
                      color: monthly === p ? assetCfg.color : "#5A6B7A",
                      fontFamily: "inherit",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    {p}€
                  </button>
                ))}
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
              <input
                type="range"
                min={0}
                max={Math.max(0, monthOptions.length - 1)}
                step={1}
                value={Math.max(0, monthOptions.indexOf(startMonth))}
                onChange={(e) => setStartMonth(monthOptions[Number(e.target.value)])}
                style={{ width: "100%", marginTop: 10 }}
              />
            </div>
          </div>

          {!compareMode && (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 16,
                fontSize: 12.5,
                color: showReference ? "#E8EDF2" : "#7C8A9A",
                cursor: "pointer",
              }}
            >
              <input type="checkbox" checked={showReference} onChange={(e) => setShowReference(e.target.checked)} />
              Comparer à un placement classique (S&amp;P 500, même stratégie DCA)
            </label>
          )}

          {!compareMode && (
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 11.5, color: "#7C8A9A", letterSpacing: 1 }}>
                MODE CASH DIFFÉRÉ — attendre {delayMonths} mois avant de tout investir d'un coup
              </label>
              <input
                type="range"
                min={0}
                max={24}
                step={1}
                value={delayMonths}
                onChange={(e) => setDelayMonths(Number(e.target.value))}
                style={{ width: "100%", marginTop: 6 }}
              />
            </div>
          )}

          {/* Challenge prediction step */}
          {challengeMode && !compareMode && !done && !running && (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #1E2733" }}>
              <label style={{ fontSize: 11.5, color: "#FF8A5C", letterSpacing: 1 }}>
                AVANT DE LANCER : LE DCA VA-T-IL BATTRE LE LUMP SUM ?
              </label>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => setPrediction("dca")}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 8,
                    border: `1px solid ${prediction === "dca" ? assetCfg.color : "#1E2733"}`,
                    background: prediction === "dca" ? "rgba(57,255,156,0.1)" : "transparent",
                    color: prediction === "dca" ? assetCfg.color : "#7C8A9A",
                    fontFamily: "inherit",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Le DCA va gagner
                </button>
                <button
                  onClick={() => setPrediction("lump")}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 8,
                    border: `1px solid ${prediction === "lump" ? "#FFB020" : "#1E2733"}`,
                    background: prediction === "lump" ? "rgba(255,176,32,0.1)" : "transparent",
                    color: prediction === "lump" ? "#FFB020" : "#7C8A9A",
                    fontFamily: "inherit",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Le lump sum va gagner
                </button>
              </div>
            </div>
          )}

          <button
            className="btn"
            onClick={runSimulation}
            disabled={
              running ||
              dataSource === "loading" ||
              (compareMode && compareAssets.some((k) => assetData[k].source === "loading")) ||
              (challengeMode && !compareMode && !prediction)
            }
            style={{
              marginTop: 18,
              width: "100%",
              padding: "12px 16px",
              background:
                running || dataSource === "loading" || (challengeMode && !compareMode && !prediction)
                  ? "#1E2733"
                  : assetCfg.color,
              color:
                running || dataSource === "loading" || (challengeMode && !compareMode && !prediction)
                  ? "#7C8A9A"
                  : "#0B0F14",
              border: "none",
              borderRadius: 8,
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 0.5,
              cursor: running ? "default" : "pointer",
            }}
          >
            {dataSource === "loading"
              ? "CHARGEMENT DES DONNÉES..."
              : running
              ? "REMONTÉE DANS LE TEMPS..."
              : challengeMode && !compareMode && !prediction
              ? "CHOISIS D'ABORD UN PARI ↑"
              : "LANCER LA SIMULATION"}
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
            <div style={{ display: "flex", gap: 14, padding: "0 12px 10px", fontSize: 11.5, flexWrap: "wrap" }}>
              {compareMode ? (
                compareAssets.map((k) => (
                  <span key={k} style={{ color: ASSETS[k].color }}>{ASSETS[k].label} (DCA)</span>
                ))
              ) : (
                <>
                  <span style={{ color: assetCfg.color }}>DCA (versements réguliers)</span>
                  <span style={{ color: "#FFB020" }}>Lump sum (tout au départ)</span>
                  {showReference && <span style={{ color: "#7C8A9A" }}>S&P 500 (référence)</span>}
                  {delayMonths > 0 && <span style={{ color: "#FF8A5C" }}>Cash puis lump différé ({delayMonths}m)</span>}
                  <span style={{ color: "#3E4C5A" }}>▮ volatilité mensuelle</span>
                </>
              )}
            </div>
            <div style={{ width: "100%", minHeight: 240 }}>
              <ResponsiveContainer width="100%" height={240} debounce={1}>
                <ComposedChart data={visibleData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#1E2733" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#5A6B7A", fontSize: 10 }}
                    interval={Math.max(0, Math.floor(rowCount / 6))}
                    axisLine={{ stroke: "#1E2733" }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="value"
                    tick={{ fill: "#5A6B7A", fontSize: 10 }}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k€`}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                    domain={["auto", "auto"]}
                  />
                  {!compareMode && <YAxis yAxisId="vol" hide domain={[0, 0.9]} />}
                  <Tooltip
                    cursor={{ stroke: "#5A6B7A", strokeWidth: 1, strokeDasharray: "3 3" }}
                    contentStyle={{
                      background: "#0B0F14",
                      border: "1px solid #1E2733",
                      borderRadius: 8,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                    }}
                    formatter={(v, name) => {
                      if (name === "changePct") return [`${(v * 100).toFixed(1)}%`, "Variation mensuelle"];
                      const knownNames = {
                        dcaValue: "DCA",
                        lumpValue: "Lump sum",
                        refValue: "S&P 500",
                        delayedValue: "Cash différé",
                      };
                      ASSET_KEYS.forEach((k) => (knownNames[`${k}Value`] = ASSETS[k].label));
                      return [fmtEUR(v), knownNames[name] || name];
                    }}
                    labelStyle={{ color: "#8FA0AF" }}
                  />
                  {!compareMode && (
                    <Bar yAxisId="vol" dataKey={(d) => Math.abs(d.changePct || 0)} name="changePct" fill="#39FF9C" fillOpacity={0.12} isAnimationActive={false} barSize={6} />
                  )}
                  {compareMode ? (
                    compareAssets.map((k) => (
                      <Line key={k} yAxisId="value" type="monotone" dataKey={`${k}Value`} stroke={ASSETS[k].color} strokeWidth={2.4} dot={false} isAnimationActive={false} connectNulls />
                    ))
                  ) : (
                    <>
                      <Line yAxisId="value" type="monotone" dataKey="dcaValue" stroke={assetCfg.color} strokeWidth={2.4} dot={false} isAnimationActive={false} connectNulls />
                      <Line yAxisId="value" type="monotone" dataKey="lumpValue" stroke="#FFB020" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} connectNulls />
                      {showReference && (
                        <Line yAxisId="value" type="monotone" dataKey="refValue" stroke="#7C8A9A" strokeWidth={1.6} strokeDasharray="2 3" dot={false} isAnimationActive={false} connectNulls />
                      )}
                      {delayMonths > 0 && (
                        <Line yAxisId="value" type="monotone" dataKey="delayedValue" stroke="#FF8A5C" strokeWidth={1.8} strokeDasharray="1 3" dot={false} isAnimationActive={false} connectNulls />
                      )}
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Stat cards */}
        {done && !compareMode && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 22 }}>
            {[
              ["INVESTI", fmtEUR(totalInvested), "#8FA0AF"],
              ["VALEUR DCA", fmtEUR(dcaFinal), assetCfg.color],
              ["VALEUR LUMP SUM", fmtEUR(lumpFinal), "#FFB020"],
              ["MULTIPLE", `x${multiple.toFixed(2)}`, multiple >= 1 ? assetCfg.color : "#FF5C72"],
              ...(showReference && referenceSeries?.rows.length
                ? [["S&P 500 (même DCA)", fmtEUR(referenceSeries.rows[referenceSeries.rows.length - 1].dcaValue), "#7C8A9A"]]
                : []),
              ...(delayMonths > 0 && delayedSeries?.length
                ? [[`CASH DIFFÉRÉ (${delayMonths}m)`, fmtEUR(delayedSeries[delayedSeries.length - 1].delayedValue), "#FF8A5C"]]
                : []),
            ].map(([label, value, color]) => (
              <div key={label} style={{ background: "#121821", border: "1px solid #1E2733", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 10.5, color: "#5A6B7A", letterSpacing: 1 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {done && !compareMode && exitScenarios && (
          <div style={{ background: "#121821", border: "1px solid #1E2733", borderRadius: 10, padding: "16px 18px", marginBottom: 22 }}>
            <div style={{ fontSize: 12.5, color: "#8FA0AF", marginBottom: 4 }}>
              Et si tu arrêtais aujourd'hui ? Ta position actuelle : {fmtQty(finalRow.dcaBtc, assetCfg.symbol)}
              {todayInfo.price && <> au prix live de {fmtEUR(todayInfo.price)}</>}.
            </div>
            <div style={{ fontSize: 11, color: "#3E4C5A", marginBottom: 12 }}>
              Scénarios hypothétiques à partir d'ici — pas une prédiction.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
              {exitScenarios.map((s) => (
                <div
                  key={s.delta}
                  style={{
                    background: "#0B0F14",
                    border: `1px solid ${s.delta === 0 ? assetCfg.color : "#1E2733"}`,
                    borderRadius: 8,
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ fontSize: 10.5, color: "#5A6B7A", letterSpacing: 1 }}>
                    {s.delta === 0 ? "PRIX ACTUEL" : s.delta > 0 ? `SI +${Math.round(s.delta * 100)}%` : `SI ${Math.round(s.delta * 100)}%`}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: s.delta >= 0 ? assetCfg.color : "#FF5C72", marginTop: 4 }}>
                    {fmtEUR(s.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {done && compareMode && compareFinals && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 22 }}>
            {compareAssets.flatMap((k) => {
              const f = compareFinals[k];
              return [
                [`${ASSETS[k].label.toUpperCase()} — VALEUR`, fmtEUR(f.dcaValue), ASSETS[k].color],
                [`${ASSETS[k].label.toUpperCase()} — MULTIPLE`, `x${(f.dcaValue / f.dcaInvested).toFixed(2)}`, ASSETS[k].color],
              ];
            }).map(([label, value, color]) => (
              <div key={label} style={{ background: "#121821", border: "1px solid #1E2733", borderRadius: 8, padding: "12px 14px" }}>
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
                {compareMode ? "— REÇU DE COMPARATIF CRYPTO —" : "— REÇU DE TÉLÉPORTATION FINANCIÈRE —"}
              </div>
              {typed.map((line, i) => (
                <div key={i} style={{ whiteSpace: "pre-wrap", fontWeight: (line || "").startsWith("VERDICT") ? 600 : 400 }}>
                  {line || "\u00A0"}
                  {i === typed.length - 1 && typed.length < roastLines.length && <span className="cursor">&nbsp;</span>}
                </div>
              ))}
            </div>
            <svg width="100%" height="14" viewBox="0 0 400 14" preserveAspectRatio="none" style={{ display: "block" }}>
              <polygon
                points="0,0 400,0 400,14 380,2 360,14 340,2 320,14 300,2 280,14 260,2 240,14 220,2 200,14 180,2 160,14 140,2 120,14 100,2 80,14 60,2 40,14 20,2 0,14"
                fill="#F2ECD9"
              />
            </svg>

            {fullyTyped && (
              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                <button
                  className="btn"
                  onClick={copySummary}
                  style={{ padding: "10px 16px", background: "transparent", color: assetCfg.color, border: `1px solid ${assetCfg.color}`, borderRadius: 8, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}
                >
                  {copied ? "Copié" : "Copier le texte"}
                </button>
                <button
                  className="btn"
                  onClick={exportReceiptImage}
                  style={{ padding: "10px 16px", background: assetCfg.color, color: "#0B0F14", border: "none", borderRadius: 8, fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                >
                  Télécharger le reçu
                </button>
                <button
                  className="btn"
                  onClick={exportStoryImage}
                  style={{ padding: "10px 16px", background: "transparent", color: "#FF8A5C", border: "1px solid #FF8A5C", borderRadius: 8, fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                >
                  Télécharger la story (9:16)
                </button>
              </div>
            )}
          </div>
        )}

        {!running && !done && (
          <p style={{ color: "#3E4C5A", fontSize: 12, textAlign: "center", marginTop: 30 }}>
            Réglages sauvegardés automatiquement · Règle les paramètres puis lance la simulation ↑
          </p>
        )}
      </div>
    </div>
  );
}
