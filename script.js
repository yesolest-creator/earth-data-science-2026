/* ============================================================
   대기·해양 데이터 프로젝트 — 안내 웹앱 공용 스크립트
   index.html / step1~6.html 전 페이지에서 동일하게 사용
   ============================================================ */

/* ------------------------------------------------------------
   [교사 수정 구역] 반별 제출 기한
   ------------------------------------------------------------
   · 날짜는 "YYYY-MM-DD" 형식으로 적습니다. 예: "2026-09-15"
   · null 로 두면 화면에 "미정" 으로 표시됩니다.
   · default : 반을 아직 고르지 않았을 때 보여줄 "범위" (start ~ end)
   · "1"~"8" : 각 반을 골랐을 때 보여줄 "하나의 날짜"
   · plan  = 기획안 PDF / report = 결과 보고서 PDF / webapp = 웹앱 결과물

   예시)
     default: { plan:{start:"2026-09-14", end:"2026-09-18"}, ... }
     "1":     { plan:"2026-09-15", report:"2026-09-25", webapp:"2026-09-25" },
------------------------------------------------------------ */
const SUBMIT_SCHEDULE = {
  default: {
    plan:   { start: null, end: null },
    report: { start: null, end: null },
    webapp: { start: null, end: null }
  },
  "1": { plan: null, report: null, webapp: null },
  "2": { plan: null, report: null, webapp: null },
  "3": { plan: null, report: null, webapp: null },
  "4": { plan: null, report: null, webapp: null },
  "5": { plan: null, report: null, webapp: null },
  "6": { plan: null, report: null, webapp: null },
  "7": { plan: null, report: null, webapp: null },
  "8": { plan: null, report: null, webapp: null }
};
/* ---------------------- [교사 수정 구역 끝] ---------------------- */


/* "2026-09-15" → "9월 15일" (값이 없으면 null) */
function formatDate(iso) {
  if (!iso) return null;
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return `${Number(m[2])}월 ${Number(m[3])}일`;
}

/* 셀에 표시할 문자열 만들기 — 단일 날짜 또는 범위, 없으면 "미정" */
function formatDue(value) {
  if (!value) return null;
  if (typeof value === "string") return formatDate(value);
  const start = formatDate(value.start);
  const end = formatDate(value.end);
  if (start && end) return `${start} ~ ${end}`;
  return start || end || null;
}

/* 제출물 표의 기한 셀 갱신 */
function renderSubmitDates(classKey) {
  const schedule = SUBMIT_SCHEDULE[classKey] || SUBMIT_SCHEDULE.default;
  document.querySelectorAll("[data-due]").forEach(function (cell) {
    const text = formatDue(schedule[cell.dataset.due]);
    cell.textContent = text || "미정";
    cell.dataset.state = text ? "set" : "empty";
  });
}

function initClassSelect() {
  const select = document.getElementById("class-select");
  if (!select) return;
  renderSubmitDates(select.value);
  select.addEventListener("change", function () {
    renderSubmitDates(select.value);
  });
}


/* ============================================================
   step2 — 데이터 분석 방법
   ============================================================ */

/* ------------------------------------------------------------
   [교사 수정 구역] step2 데이터 주소
   주소가 바뀌면 아래 두 줄만 고치면 됩니다.
------------------------------------------------------------ */
const STEP2_URL = {
  temp: "https://raw.githubusercontent.com/datasets/global-temp/main/data/annual.csv",
  co2:  "https://raw.githubusercontent.com/datasets/co2-ppm/main/data/co2-annmean-mlo.csv"
};
/* ---------------------- [교사 수정 구역 끝] ---------------------- */

/* 네트워크가 막혔을 때 쓰는 저장본 (2025년 자료까지 미리 받아둔 값) */
const STEP2_FALLBACK = {
  tempHead: "Source,Year,Mean\nGCAG,1850,-0.4265\nGCAG,1851,-0.2635\nGCAG,1852,-0.2241\nGCAG,1853,-0.2623",
  co2Head: "Year,Mean,Uncertainty\n1959,315.98,0.12\n1960,316.91,0.12\n1961,317.64,0.12\n1962,318.45,0.12",
  temp: [[1880,-0.1792],[1881,-0.0917],[1882,-0.115],[1883,-0.1767],[1884,-0.285],[1885,-0.3358],[1886,-0.3167],[1887,-0.365],[1888,-0.1775],[1889,-0.1092],[1890,-0.355],[1891,-0.2258],[1892,-0.2742],[1893,-0.3142],[1894,-0.3067],[1895,-0.2275],[1896,-0.1158],[1897,-0.1125],[1898,-0.2783],[1899,-0.1767],[1900,-0.0858],[1901,-0.155],[1902,-0.2825],[1903,-0.3717],[1904,-0.4767],[1905,-0.2642],[1906,-0.2258],[1907,-0.3883],[1908,-0.43],[1909,-0.4892],[1910,-0.4417],[1911,-0.4483],[1912,-0.3717],[1913,-0.3525],[1914,-0.1633],[1915,-0.1475],[1916,-0.3642],[1917,-0.4625],[1918,-0.3033],[1919,-0.28],[1920,-0.2792],[1921,-0.1917],[1922,-0.285],[1923,-0.2692],[1924,-0.2717],[1925,-0.2233],[1926,-0.1108],[1927,-0.2208],[1928,-0.2033],[1929,-0.3642],[1930,-0.16],[1931,-0.0967],[1932,-0.1625],[1933,-0.2883],[1934,-0.1283],[1935,-0.2017],[1936,-0.1508],[1937,-0.0325],[1938,-0.0033],[1939,-0.0208],[1940,0.1175],[1941,0.1783],[1942,0.0625],[1943,0.0867],[1944,0.2008],[1945,0.095],[1946,-0.0717],[1947,-0.0267],[1948,-0.1058],[1949,-0.1083],[1950,-0.175],[1951,-0.0683],[1952,0.0108],[1953,0.0825],[1954,-0.1317],[1955,-0.14],[1956,-0.1883],[1957,0.0475],[1958,0.0592],[1959,0.0308],[1960,-0.025],[1961,0.0583],[1962,0.0308],[1963,0.0533],[1964,-0.1983],[1965,-0.1067],[1966,-0.055],[1967,-0.0242],[1968,-0.0833],[1969,0.0517],[1970,0.0275],[1971,-0.08],[1972,0.0075],[1973,0.1608],[1974,-0.0717],[1975,-0.0133],[1976,-0.0983],[1977,0.1783],[1978,0.0658],[1979,0.1617],[1980,0.2533],[1981,0.3208],[1982,0.1375],[1983,0.3108],[1984,0.1542],[1985,0.1175],[1986,0.1792],[1987,0.32],[1988,0.3875],[1989,0.2725],[1990,0.4467],[1991,0.405],[1992,0.2217],[1993,0.2308],[1994,0.3125],[1995,0.4433],[1996,0.33],[1997,0.465],[1998,0.6075],[1999,0.3808],[2000,0.3933],[2001,0.5317],[2002,0.6275],[2003,0.615],[2004,0.5325],[2005,0.6783],[2006,0.6392],[2007,0.6642],[2008,0.5425],[2009,0.6567],[2010,0.7225],[2011,0.6067],[2012,0.6458],[2013,0.6758],[2014,0.7483],[2015,0.8958],[2016,1.0117],[2017,0.9142],[2018,0.8483],[2019,0.9775],[2020,1.0067],[2021,0.8467],[2022,0.8908],[2023,1.1675],[2024,1.2842],[2025,1.1917]],
  co2: [[1959,315.98],[1960,316.91],[1961,317.64],[1962,318.45],[1963,318.99],[1964,319.62],[1965,320.04],[1966,321.37],[1967,322.18],[1968,323.05],[1969,324.62],[1970,325.68],[1971,326.32],[1972,327.46],[1973,329.68],[1974,330.19],[1975,331.13],[1976,332.03],[1977,333.84],[1978,335.41],[1979,336.84],[1980,338.76],[1981,340.12],[1982,341.48],[1983,343.15],[1984,344.87],[1985,346.35],[1986,347.61],[1987,349.31],[1988,351.69],[1989,353.2],[1990,354.45],[1991,355.7],[1992,356.54],[1993,357.21],[1994,358.96],[1995,360.97],[1996,362.74],[1997,363.88],[1998,366.84],[1999,368.54],[2000,369.71],[2001,371.32],[2002,373.45],[2003,375.98],[2004,377.7],[2005,379.98],[2006,382.09],[2007,384.02],[2008,385.83],[2009,387.64],[2010,390.1],[2011,391.85],[2012,394.06],[2013,396.74],[2014,398.81],[2015,401.01],[2016,404.41],[2017,406.76],[2018,408.72],[2019,411.65],[2020,414.21],[2021,416.41],[2022,418.53],[2023,421.08],[2024,424.61],[2025,427.35]]
};

/* 현재 페이지가 쓰고 있는 자료 */
let STEP2_DATA = null;


/* ---------- 통계 helper ---------- */
function s2mean(a) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i];
  return s / a.length;
}

/* 피어슨 상관계수 */
function s2corr(x, y) {
  const mx = s2mean(x), my = s2mean(y);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < x.length; i++) {
    const a = x[i] - mx, b = y[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  return num / Math.sqrt(dx * dy);
}

/* 가우스 소거법 — 정규방정식 풀이용 */
function s2solve(A, b) {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    const tA = A[i]; A[i] = A[p]; A[p] = tA;
    const tb = b[i]; b[i] = b[p]; b[p] = tb;
    for (let r = i + 1; r < n; r++) {
      const f = A[r][i] / A[i][i];
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c];
      b[r] -= f * b[i];
    }
  }
  const out = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let c = i + 1; c < n; c++) s -= A[i][c] * out[c];
    out[i] = s / A[i][i];
  }
  return out;
}

/* 최소제곱 다항회귀.
   수치 안정성을 위해 x를 평균만큼 옮겨서(중심화) 계산한다. */
function s2polyfit(x, y, deg) {
  const n = deg + 1;
  const x0 = s2mean(x);
  const xs = x.map(function (v) { return v - x0; });
  const A = [], b = [];
  for (let i = 0; i < n; i++) {
    A.push(new Array(n).fill(0));
    b.push(0);
    for (let k = 0; k < xs.length; k++) {
      b[i] += Math.pow(xs[k], i) * y[k];
      for (let j = 0; j < n; j++) A[i][j] += Math.pow(xs[k], i + j);
    }
  }
  return { coef: s2solve(A, b), x0: x0, deg: deg };
}

function s2polyval(fit, x) {
  const u = x - fit.x0;
  let s = 0;
  for (let i = 0; i < fit.coef.length; i++) s += fit.coef[i] * Math.pow(u, i);
  return s;
}

/* 중심화 계수를 원래 좌표계 계수로 되돌린다 (화면 표시용) */
function s2expand(fit) {
  const c = fit.coef, x0 = fit.x0;
  if (fit.deg === 1) return { a: c[1], b: c[0] - c[1] * x0 };
  return {
    a: c[2],
    b: c[1] - 2 * c[2] * x0,
    c: c[0] - c[1] * x0 + c[2] * x0 * x0
  };
}

/* 결정계수 R² */
function s2r2(x, y, fit) {
  const my = s2mean(y);
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < x.length; i++) {
    const d = y[i] - s2polyval(fit, x[i]);
    ssRes += d * d;
    ssTot += (y[i] - my) * (y[i] - my);
  }
  return 1 - ssRes / ssTot;
}

function s2fmt(v, d) {
  const s = Number(v).toFixed(d);
  return /^-0\.?0*$/.test(s) ? s.slice(1) : s;
}


/* ---------- CSV 파싱 ---------- */
function s2parseCSV(text) {
  const rows = text.trim().split(/\r?\n/).map(function (l) { return l.split(","); });
  const head = rows.shift().map(function (h) { return h.trim(); });
  return rows.map(function (r) {
    const o = {};
    head.forEach(function (h, i) { o[h] = (r[i] || "").trim(); });
    return o;
  });
}

/* 기온: 여러 출처가 섞인 파일에서 GISTEMP 행만 골라 [연도, 편차] */
function s2cleanTemp(text) {
  return s2parseCSV(text)
    .filter(function (r) { return r.Source === "GISTEMP" && r.Year && r.Mean; })
    .map(function (r) { return [Number(r.Year), Number(r.Mean)]; })
    .filter(function (r) { return isFinite(r[0]) && isFinite(r[1]); })
    .sort(function (a, b) { return a[0] - b[0]; });
}

/* CO₂: [연도, 농도] */
function s2cleanCO2(text) {
  return s2parseCSV(text)
    .filter(function (r) { return r.Year && r.Mean; })
    .map(function (r) { return [Number(r.Year), Number(r.Mean)]; })
    .filter(function (r) { return isFinite(r[0]) && isFinite(r[1]); })
    .sort(function (a, b) { return a[0] - b[0]; });
}

/* 두 자료를 연도 기준으로 합치기 */
function s2merge(temp, co2) {
  const map = new Map(co2);
  const out = [];
  temp.forEach(function (r) {
    if (map.has(r[0])) out.push([r[0], r[1], map.get(r[0])]);
  });
  return out;
}


/* ---------- SVG 차트 helper ----------
   색·굵기를 CSS 클래스가 아니라 SVG 속성으로 직접 지정한다.
   styles.css가 어긋나 있어도 그래프가 정상적으로 그려지게 하기 위함이다.
   (클래스도 함께 남겨두므로 CSS 쪽에서 덮어쓰는 것도 가능하다) */
const S2C = {
  grid:   "#D8D3C8",
  axis:   "#9AA5AD",
  lbl:    "#9AA5AD",
  axtitle:"#5A6570",
  head:   "#2C363F",
  temp:   "#B25A50",
  co2:    "#4E86A6",
  fit:    "#2C363F",
  fit2:   "#B25A50",
  faint:  "#B6BFC6",
  dot:    "#4E86A6",
  plain:  "#7C8791",
  band:   "#DCEAF0",
  mono:   "'JetBrains Mono', ui-monospace, Menlo, monospace"
};

function s2ticks(min, max, count) {
  const span = max - min;
  if (span <= 0) return [min];
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const out = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) {
    out.push(Number(v.toFixed(10)));
  }
  return out;
}

/* 축 눈금 글자 */
function s2text(x, y, s, anchor, color, size, weight) {
  return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "start") +
    '" fill="' + (color || S2C.lbl) + '" font-size="' + (size || 10.5) +
    '" font-weight="' + (weight || 400) + '" font-family="' + S2C.mono + '">' + s + '</text>';
}

/* 좌표계(패널) 하나 만들기 */
function s2panel(o) {
  const sx = function (v) { return o.x + (v - o.xmin) / (o.xmax - o.xmin) * o.w; };
  const sy = function (v) { return o.y + o.h - (v - o.ymin) / (o.ymax - o.ymin) * o.h; };
  let g = "";
  const xt = o.xticks || s2ticks(o.xmin, o.xmax, 5);
  const yt = o.yticks || s2ticks(o.ymin, o.ymax, 4);

  yt.forEach(function (v) {
    const py = sy(v);
    if (py < o.y - 1 || py > o.y + o.h + 1) return;
    g += '<line x1="' + o.x + '" y1="' + py.toFixed(1) + '" x2="' + (o.x + o.w) +
      '" y2="' + py.toFixed(1) + '" stroke="' + S2C.grid + '" stroke-width="1"/>';
    g += s2text(o.x - 8, (py + 3.5).toFixed(1), (o.yfmt ? o.yfmt(v) : v), "end");
  });
  xt.forEach(function (v) {
    const px = sx(v);
    if (px < o.x - 1 || px > o.x + o.w + 1) return;
    g += s2text(px.toFixed(1), o.y + o.h + 17, (o.xfmt ? o.xfmt(v) : v), "middle");
  });
  g += '<line x1="' + o.x + '" y1="' + (o.y + o.h) + '" x2="' + (o.x + o.w) +
    '" y2="' + (o.y + o.h) + '" stroke="' + S2C.axis + '" stroke-width="1"/>';
  if (o.title) {
    g += '<text x="' + (o.x + o.w / 2).toFixed(1) + '" y="' + (o.y - 12) +
      '" text-anchor="middle" fill="' + S2C.head + '" font-size="12.5" font-weight="700">' + o.title + '</text>';
  }
  return { sx: sx, sy: sy, g: g };
}

/* 선 하나 */
function s2line(pts, p, color, width, dashed) {
  const d = pts.map(function (v, i) {
    return (i ? "L" : "M") + p.sx(v[0]).toFixed(1) + " " + p.sy(v[1]).toFixed(1);
  }).join(" ");
  return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + (width || 2) +
    '" stroke-linejoin="round" stroke-linecap="round"' +
    (dashed ? ' stroke-dasharray="5 4"' : '') + '/>';
}

function s2dots(pts, p, color, r) {
  return pts.map(function (v) {
    return '<circle cx="' + p.sx(v[0]).toFixed(1) + '" cy="' + p.sy(v[1]).toFixed(1) +
      '" r="' + (r || 3) + '" fill="' + color + '" fill-opacity="0.55"/>';
  }).join("");
}

/* 막대 */
function s2bars(pts, p, baseY, color, bw) {
  return pts.map(function (v) {
    const x = p.sx(v[0]) - bw / 2;
    const y = p.sy(v[1]);
    const h = Math.max(0, baseY - y);
    return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw +
      '" height="' + h.toFixed(1) + '" fill="' + color + '" fill-opacity="0.85"/>';
  }).join("");
}

function s2svg(w, h, inner) {
  return '<svg class="chart-svg" viewBox="0 0 ' + w + ' ' + h +
    '" role="img" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
}

/* 회귀식을 촘촘한 점 목록으로 */
function s2curve(fit, xmin, xmax, steps) {
  const n = steps || 80, out = [];
  for (let i = 0; i <= n; i++) {
    const x = xmin + (xmax - xmin) * i / n;
    out.push([x, s2polyval(fit, x)]);
  }
  return out;
}


/* ---------- 섹션 04 차트 ---------- */
function s2chartCorrTime(el) {
  const m = STEP2_DATA.merged;
  const W = 720, H = 300, PX = 54, PY = 34, PW = W - PX - 58, PH = H - PY - 44;
  const years = m.map(function (d) { return d[0]; });
  const ts = m.map(function (d) { return d[1]; });
  const cs = m.map(function (d) { return d[2]; });

  const tmin = Math.min.apply(null, ts), tmax = Math.max.apply(null, ts);
  const cmin = Math.min.apply(null, cs), cmax = Math.max.apply(null, cs);
  const tpad = (tmax - tmin) * .12, cpad = (cmax - cmin) * .12;

  const pT = s2panel({
    x: PX, y: PY, w: PW, h: PH,
    xmin: years[0], xmax: years[years.length - 1],
    ymin: tmin - tpad, ymax: tmax + tpad,
    yfmt: function (v) { return v.toFixed(1); },
    xfmt: function (v) { return String(Math.round(v)); }
  });
  const pC = s2panel({
    x: PX, y: PY, w: PW, h: PH,
    xmin: years[0], xmax: years[years.length - 1],
    ymin: cmin - cpad, ymax: cmax + cpad
  });

  let g = pT.g;
  s2ticks(cmin - cpad, cmax + cpad, 4).forEach(function (v) {
    const py = pC.sy(v);
    if (py < PY - 1 || py > PY + PH + 1) return;
    g += s2text(PX + PW + 8, (py + 3.5).toFixed(1), Math.round(v), "start");
  });
  g += s2text(2, PY - 12, "기온 편차 (℃)", "start", S2C.axtitle);
  g += s2text(PX + PW, PY - 12, "CO₂ (ppm)", "end", S2C.axtitle);
  g += s2line(m.map(function (d) { return [d[0], d[2]]; }), pC, S2C.co2, 2);
  g += s2line(m.map(function (d) { return [d[0], d[1]]; }), pT, S2C.temp, 2);

  el.innerHTML = s2svg(W, H, g);
}

function s2chartCorrScatter(el) {
  const m = STEP2_DATA.merged;
  const W = 720, H = 300, PX = 54, PY = 34, PW = W - PX - 26, PH = H - PY - 50;
  const cs = m.map(function (d) { return d[2]; });
  const ts = m.map(function (d) { return d[1]; });
  const cmin = Math.min.apply(null, cs), cmax = Math.max.apply(null, cs);
  const tmin = Math.min.apply(null, ts), tmax = Math.max.apply(null, ts);
  const cpad = (cmax - cmin) * .06, tpad = (tmax - tmin) * .1;

  const p = s2panel({
    x: PX, y: PY, w: PW, h: PH,
    xmin: cmin - cpad, xmax: cmax + cpad,
    ymin: tmin - tpad, ymax: tmax + tpad,
    yfmt: function (v) { return v.toFixed(1); },
    xfmt: function (v) { return String(Math.round(v)); }
  });
  let g = p.g;
  g += s2text(2, PY - 12, "기온 편차 (℃)", "start", S2C.axtitle);
  g += s2text((PX + PW / 2).toFixed(1), H - 6, "CO₂ 농도 (ppm)", "middle", S2C.axtitle);
  g += s2dots(m.map(function (d) { return [d[2], d[1]]; }), p, S2C.co2, 3.6);
  el.innerHTML = s2svg(W, H, g);
}


/* ---------- 섹션 05 차트 ---------- */
function s2chartRegression(el) {
  const t = STEP2_DATA.temp;
  const W = 720, H = 320, PX = 54, PY = 34, PW = W - PX - 26, PH = H - PY - 50;
  const xs = t.map(function (d) { return d[0]; });
  const ys = t.map(function (d) { return d[1]; });
  const f1 = s2polyfit(xs, ys, 1);
  const f2 = s2polyfit(xs, ys, 2);
  const xlast = xs[xs.length - 1];
  const XEND = 2050;

  const cand = ys.concat([
    s2polyval(f1, XEND), s2polyval(f2, XEND),
    s2polyval(f1, xs[0]), s2polyval(f2, xs[0])
  ]);
  const ymin = Math.min.apply(null, cand), ymax = Math.max.apply(null, cand);
  const pad = (ymax - ymin) * .1;

  const p = s2panel({
    x: PX, y: PY, w: PW, h: PH,
    xmin: xs[0], xmax: XEND,
    ymin: ymin - pad, ymax: ymax + pad,
    yfmt: function (v) { return v.toFixed(1); },
    xfmt: function (v) { return String(Math.round(v)); }
  });
  /* 예측 구간 음영은 격자보다 먼저 깔아야 선이 가려지지 않는다 */
  let g = '<rect x="' + p.sx(xlast).toFixed(1) + '" y="' + PY + '" width="' +
    (p.sx(XEND) - p.sx(xlast)).toFixed(1) + '" height="' + PH +
    '" fill="' + S2C.band + '" fill-opacity="0.55"/>';
  g += p.g;
  g += s2text(2, PY - 12, "기온 편차 (℃)", "start", S2C.axtitle);
  g += s2text((PX + PW / 2).toFixed(1), H - 6, "연도", "middle", S2C.axtitle);
  g += s2dots(t, p, S2C.plain, 2.6);
  g += s2line(s2curve(f1, xs[0], xlast), p, S2C.fit, 2);
  g += s2line(s2curve(f2, xs[0], xlast), p, S2C.fit2, 2);
  g += s2line(s2curve(f1, xlast, XEND, 20), p, S2C.fit, 2, true);
  g += s2line(s2curve(f2, xlast, XEND, 20), p, S2C.fit2, 2, true);
  g += s2text(((p.sx(xlast) + p.sx(XEND)) / 2).toFixed(1), PY + 14, "예측 구간", "middle", S2C.axtitle);
  el.innerHTML = s2svg(W, H, g);
}


/* ---------- 섹션 07 차트 — 전부 설명용 임의 데이터 ---------- */
/* 매번 같은 그림이 나오도록 결정적 의사난수를 쓴다 */
function s2demoLine(n, a, b, amp, seed) {
  let s = seed || 1;
  const rnd = function () { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648 - .5; };
  const out = [];
  for (let i = 0; i < n; i++) out.push([i, a * i + b + rnd() * amp]);
  return out;
}

function s2mistakeOutlier(el) {
  const base = s2demoLine(14, .45, 2, .9, 7);
  const withOut = base.concat([[1, 12.5]]);
  const fitA = s2polyfit(base.map(function (d) { return d[0]; }), base.map(function (d) { return d[1]; }), 1);
  const fitB = s2polyfit(withOut.map(function (d) { return d[0]; }), withOut.map(function (d) { return d[1]; }), 1);

  const W = 720, H = 300, PX = 48, PY = 24, PW = W - PX - 26, PH = H - PY - 44;
  const p = s2panel({
    x: PX, y: PY, w: PW, h: PH,
    xmin: -.6, xmax: 13.6, ymin: 0, ymax: 15,
    xfmt: function (v) { return String(Math.round(v)); }
  });
  let g = p.g;
  g += s2dots(base, p, S2C.plain, 4);
  g += '<circle cx="' + p.sx(1).toFixed(1) + '" cy="' + p.sy(12.5).toFixed(1) +
    '" r="5.5" fill="' + S2C.temp + '"/>';
  g += s2line(s2curve(fitA, 0, 13, 2), p, S2C.fit, 2);
  g += s2line(s2curve(fitB, 0, 13, 2), p, S2C.temp, 2);
  g += s2text((p.sx(1) + 12).toFixed(1), (p.sy(12.5) + 4).toFixed(1), "이상치", "start", S2C.temp);
  g += s2text(p.sx(3.4).toFixed(1), (p.sy(s2polyval(fitA, 3.4)) + 18).toFixed(1), "이상치 제외", "end", S2C.fit);
  g += s2text(p.sx(3.4).toFixed(1), (p.sy(s2polyval(fitB, 3.4)) - 10).toFixed(1), "이상치 포함", "end", S2C.temp);
  el.innerHTML = s2svg(W, H, g);
}

/* 축 왜곡 — 막대그래프 두 개를 나란히 */
function s2mistakeAxis(el) {
  const d = [];
  for (let i = 0; i < 10; i++) d.push([i, 20 + i * 0.06]);
  const W = 720, H = 300, PY = 40, PH = H - PY - 44, PW = 280;
  const A = s2panel({ x: 54, y: PY, w: PW, h: PH, xmin: -.8, xmax: 9.8, ymin: 0, ymax: 25, xfmt: function (v) { return String(Math.round(v)); }, title: "y축을 0부터" });
  const B = s2panel({ x: 54 + PW + 66, y: PY, w: PW, h: PH, xmin: -.8, xmax: 9.8, ymin: 19.9, ymax: 20.6, yfmt: function (v) { return v.toFixed(1); }, xfmt: function (v) { return String(Math.round(v)); }, title: "y축을 좁게 확대" });
  const baseY = PY + PH;
  let g = A.g + B.g;
  g += s2bars(d, A, baseY, S2C.co2, 20);
  g += s2bars(d, B, baseY, S2C.co2, 20);
  el.innerHTML = s2svg(W, H, g);
}

function s2mistakeSlice(el) {
  const d = [];
  for (let i = 0; i < 40; i++) {
    const plateau = i < 16 ? 0 : -Math.min(i - 16, 10) * 0.11;
    d.push([i, i * 0.12 + plateau + Math.sin(i * 1.7) * 0.09]);
  }
  const slice = d.slice(16, 27);
  const W = 720, H = 300, PY = 40, PH = H - PY - 44, PW = 280;
  const A = s2panel({ x: 54, y: PY, w: PW, h: PH, xmin: 0, xmax: 39, ymin: -.3, ymax: 3.6, yfmt: function (v) { return v.toFixed(1); }, xfmt: function (v) { return String(Math.round(v)); }, title: "전체 구간" });
  const B = s2panel({ x: 54 + PW + 66, y: PY, w: PW, h: PH, xmin: 16, xmax: 26, ymin: 1.3, ymax: 2.5, yfmt: function (v) { return v.toFixed(1); }, xfmt: function (v) { return String(Math.round(v)); }, title: "가운데만 잘라내면" });
  let g = '<rect x="' + A.sx(16).toFixed(1) + '" y="' + PY + '" width="' +
    (A.sx(26) - A.sx(16)).toFixed(1) + '" height="' + PH +
    '" fill="' + S2C.band + '" fill-opacity="0.75"/>';
  g += A.g + B.g;
  g += s2line(d, A, S2C.temp, 2);
  g += s2line(slice, B, S2C.temp, 2);
  el.innerHTML = s2svg(W, H, g);
}

function s2mistakeGeneral(el) {
  const slopes = [.04, .07, .05, .03, .06, .19];
  const series = slopes.map(function (a, i) { return s2demoLine(20, a, 1 + i * .12, .22, 11 + i * 5); });
  const W = 720, H = 300, PX = 48, PY = 24, PW = W - PX - 60, PH = H - PY - 44;
  const p = s2panel({
    x: PX, y: PY, w: PW, h: PH,
    xmin: 0, xmax: 19, ymin: .5, ymax: 5.4,
    yfmt: function (v) { return v.toFixed(1); },
    xfmt: function (v) { return String(Math.round(v)); }
  });
  let g = p.g;
  series.forEach(function (s, i) {
    if (i !== 5) g += s2line(s, p, S2C.faint, 1.4);
  });
  g += s2line(series[5], p, S2C.temp, 2.4);
  g += s2text(PX + PW + 6, (p.sy(series[5][19][1]) + 3.5).toFixed(1), "지점 F", "start", S2C.temp);
  g += s2text(PX + PW + 6, (p.sy(series[2][19][1]) + 3.5).toFixed(1), "그 외 5개", "start", S2C.lbl);
  el.innerHTML = s2svg(W, H, g);
}


/* ---------- 화면 갱신 ---------- */
function s2renderPeek() {
  const a = document.getElementById("peek-temp");
  const b = document.getElementById("peek-co2");
  if (a) a.textContent = STEP2_DATA.tempHead;
  if (b) b.textContent = STEP2_DATA.co2Head;
  document.querySelectorAll("[data-srcflag]").forEach(function (f) {
    f.dataset.src = STEP2_DATA.source;
    f.textContent = STEP2_DATA.source === "live" ? "방금 불러온 자료 기준" : "저장된 자료 기준";
  });
}

function s2renderTable() {
  const tb = document.getElementById("clean-tbody");
  if (!tb) return;
  tb.innerHTML = STEP2_DATA.merged.slice(-6).map(function (r) {
    return '<tr><th scope="row">' + r[0] + '</th><td class="num-col">' + r[1].toFixed(3) + '</td><td class="num-col">' + r[2].toFixed(2) + '</td></tr>';
  }).join("");
}

function s2renderStats() {
  const m = STEP2_DATA.merged;
  const set = function (id, v) { const e = document.getElementById(id); if (e) e.innerHTML = v; };
  set("stat-range", m[0][0] + "–" + m[m.length - 1][0]);
  set("stat-n", m.length + '<small>개 연도</small>');
  set("stat-base", '20세기 평균<small>기온 기준</small>');
}

function s2renderCorr() {
  const m = STEP2_DATA.merged;
  const r = s2corr(m.map(function (d) { return d[2]; }), m.map(function (d) { return d[1]; }));
  document.querySelectorAll("[data-rval]").forEach(function (e) { e.textContent = s2fmt(r, 2); });
  const a = document.getElementById("chart-corr-a");
  const b = document.getElementById("chart-corr-b");
  if (a) { s2chartCorrTime(a); a.dataset.done = "1"; }
  if (b) { s2chartCorrScatter(b); b.dataset.done = "1"; }
}

function s2renderReg() {
  const t = STEP2_DATA.temp;
  const xs = t.map(function (d) { return d[0]; });
  const ys = t.map(function (d) { return d[1]; });
  const f1 = s2polyfit(xs, ys, 1), e1 = s2expand(f1);
  const f2 = s2polyfit(xs, ys, 2);
  const f8 = s2polyfit(xs, ys, 8);
  const set = function (id, v) { const e = document.getElementById(id); if (e) e.textContent = v; };
  set("reg-a", s2fmt(e1.a, 4));
  set("reg-b", s2fmt(e1.b, 2));
  set("reg-pred1", s2fmt(s2polyval(f1, 2050), 2));
  set("reg-pred2", s2fmt(s2polyval(f2, 2050), 2));
  set("reg-r2-1", s2fmt(s2r2(xs, ys, f1), 2));
  set("reg-r2-2", s2fmt(s2r2(xs, ys, f2), 2));
  set("reg-r2-8", s2fmt(s2r2(xs, ys, f8), 2));
  const c = document.getElementById("chart-reg");
  if (c) { s2chartRegression(c); c.dataset.done = "1"; }
}

function s2renderAll() {
  s2renderPeek();
  s2renderTable();
  s2renderStats();
  s2renderCorr();
  s2renderReg();
  document.querySelectorAll("[data-needsdata]").forEach(function (e) { e.hidden = false; });
  document.querySelectorAll(".chart-empty").forEach(function (e) { e.remove(); });
}

function s2useFallback() {
  STEP2_DATA = {
    temp: STEP2_FALLBACK.temp.slice(),
    co2: STEP2_FALLBACK.co2.slice(),
    tempHead: STEP2_FALLBACK.tempHead,
    co2Head: STEP2_FALLBACK.co2Head,
    source: "fallback"
  };
  STEP2_DATA.merged = s2merge(STEP2_DATA.temp, STEP2_DATA.co2);
  s2renderAll();
}


/* ---------- 로더 ---------- */
function initStep2Loader() {
  const box = document.getElementById("loader");
  if (!box) return;
  const inT = document.getElementById("url-temp");
  const inC = document.getElementById("url-co2");
  const btnFill = document.getElementById("btn-fill");
  const btnLoad = document.getElementById("btn-load");
  const btnFb = document.getElementById("btn-fallback");
  const state = document.getElementById("load-state");

  const say = function (msg, cls) {
    state.textContent = msg;
    state.className = "lstate" + (cls ? " " + cls : "");
  };

  btnFill.addEventListener("click", function () {
    inT.value = STEP2_URL.temp;
    inC.value = STEP2_URL.co2;
    say("주소를 채웠습니다. 이제 ‘불러오기’를 눌러 보세요.");
  });

  btnLoad.addEventListener("click", function () {
    if (!inT.value.trim() || !inC.value.trim()) {
      say("먼저 ‘채우기’를 눌러 주소를 넣어 주세요.", "err");
      return;
    }
    say("불러오는 중…");
    btnLoad.disabled = true;
    Promise.all([
      fetch(inT.value.trim()).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }),
      fetch(inC.value.trim()).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    ]).then(function (res) {
      const temp = s2cleanTemp(res[0]);
      const co2 = s2cleanCO2(res[1]);
      if (!temp.length || !co2.length) throw new Error("empty");
      STEP2_DATA = {
        temp: temp, co2: co2,
        tempHead: res[0].trim().split(/\r?\n/).slice(0, 5).join("\n"),
        co2Head: res[1].trim().split(/\r?\n/).slice(0, 5).join("\n"),
        source: "live"
      };
      STEP2_DATA.merged = s2merge(temp, co2);
      s2renderAll();
      say("불러왔습니다. 기온 " + temp.length + "개, CO₂ " + co2.length + "개 연도 자료입니다.", "ok");
      btnFb.hidden = true;
      btnLoad.disabled = false;
    }).catch(function () {
      say("지금은 인터넷 연결 문제로 데이터를 불러오지 못했습니다.", "err");
      btnFb.hidden = false;
      btnLoad.disabled = false;
    });
  });

  btnFb.addEventListener("click", function () {
    s2useFallback();
    say("저장된 자료로 아래 내용을 채웠습니다. 실시간 자료가 아니라는 점만 기억해 두세요.", "ok");
    btnFb.hidden = true;
  });
}


/* ---------- 토글 (탭) ---------- */
function initToggles() {
  document.querySelectorAll("[data-toggle]").forEach(function (bar) {
    const btns = Array.prototype.slice.call(bar.querySelectorAll("button"));
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) {
          const on = b === btn;
          b.setAttribute("aria-selected", on ? "true" : "false");
          const panel = document.getElementById(b.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
        const fn = btn.dataset.render;
        const panel = document.getElementById(btn.getAttribute("aria-controls"));
        const target = panel && panel.querySelector(".chart-slot");
        if (fn && window[fn] && target && !target.dataset.done) {
          window[fn](target);
          target.dataset.done = "1";
        }
      });
    });
  });
}


/* ---------- 확인 문제 ---------- */
function initQuiz() {
  document.querySelectorAll(".quiz").forEach(function (quiz) {
    const fb = quiz.querySelector(".fb");
    quiz.querySelectorAll(".choices button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        quiz.querySelectorAll(".choices button").forEach(function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        const ok = btn.dataset.correct === "1";
        fb.className = "fb " + (ok ? "ok" : "no");
        fb.textContent = btn.dataset.fb || "";
      });
    });
  });
}


/* ---------- 코드 복사 ---------- */
function initCopyButtons() {
  document.querySelectorAll(".codeblock .copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const pre = btn.parentElement.querySelector("pre");
      if (!pre || !navigator.clipboard) return;
      navigator.clipboard.writeText(pre.innerText).then(function () {
        const old = btn.textContent;
        btn.textContent = "복사됨";
        btn.classList.add("done");
        setTimeout(function () { btn.textContent = old; btn.classList.remove("done"); }, 1400);
      });
    });
  });
}

/* 07 섹션은 자료를 불러오지 않아도 되므로 첫 탭을 바로 그린다 */
function initMistakeCharts() {
  const first = document.querySelector("#panel-m1 .chart-slot");
  if (first && !first.dataset.done) {
    s2mistakeOutlier(first);
    first.dataset.done = "1";
  }
}

window.s2mistakeOutlier = s2mistakeOutlier;
window.s2mistakeAxis = s2mistakeAxis;
window.s2mistakeSlice = s2mistakeSlice;
window.s2mistakeGeneral = s2mistakeGeneral;


document.addEventListener("DOMContentLoaded", function () {
  initClassSelect();
  initStep2Loader();
  initToggles();
  initQuiz();
  initCopyButtons();
  initMistakeCharts();
});


/* ============================================================
   step3 — 웹앱 제작 연습
   ============================================================ */

/* ------------------------------------------------------------
   [교사 수정 구역] step3 데이터 접근 정보
   ------------------------------------------------------------
   · REAL_APPS_SCRIPT_URL : 실제 데이터 Apps Script 배포 URL (뒤에 ?password=... 를 붙여서 호출)
   · EXAMPLE_CSV_URL       : 예시 데이터 구글시트 "웹에 게시" CSV 링크 (학생 프롬프트에 그대로 노출됨)
------------------------------------------------------------ */
const REAL_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwGSbvkSlKqDqBYo1oqgv_bMzHbYy3xQE_3xGqedwT0r38N0YMV90BshGnKOIYlLdfL/exec";
const EXAMPLE_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4OgLjaTCnHeJ1Ya7RVTN_ouIBCTrDJV_PhKHkcKm-CdZgIPhvAApcTqUoxbH5O0z5j-MeTrjLTKZ7/pub?gid=1116648278&single=true&output=csv";
/* 위 URL은 CORS 문제로 학생 프롬프트에서는 더 이상 쓰지 않는다(CSV 내용을 직접 내장해서
   해결함). 교사가 원본 시트를 빠르게 열어보고 싶을 때 참고용으로만 남겨둔다. */
/* ---------------------- [교사 수정 구역 끝] ---------------------- */

/* 예시 데이터 — 오프라인에서도 동작하도록 페이지에 내장 (160명) */
const STEP3_EXAMPLE_HEADERS = ["class","ei","ns","tf","pj","jjajang_jjambbong","tangsuyuk","chicken","peach","mintchoco","pet","mountain_sea","chronotype","healing_style","travel_style","counsel_style","subject","exam_style","frontier","career_choice","group_role"];
const STEP3_EXAMPLE_ROWS = [[1,"I","N","T","P","짬뽕","찍먹","양념","딱복","반민초","강아지","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","화학","일찍 숙면하기","우주 탐사","공학자","앞에 나서서 발표하기"],[1,"I","S","T","P","짬뽕","부먹","후라이드","딱복","민초","고양이","산","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","생명과학","밤새 벼락치기","심해 탐사","공학자","뒤에서 차분히 자료조사"],[1,"I","N","T","P","짜장면","부먹","후라이드","딱복","민초","강아지","바다","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","생명과학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[1,"I","N","F","J","짬뽕","찍먹","후라이드","딱복","반민초","강아지","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","화학","밤새 벼락치기","우주 탐사","과학자","앞에 나서서 발표하기"],[1,"I","N","F","J","짜장면","부먹","양념","딱복","반민초","강아지","바다","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","화학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[1,"E","S","F","J","짜장면","찍먹","후라이드","딱복","반민초","고양이","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","지구과학","일찍 숙면하기","심해 탐사","공학자","앞에 나서서 발표하기"],[1,"I","N","F","J","짜장면","부먹","후라이드","물복","민초","고양이","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","화학","일찍 숙면하기","심해 탐사","공학자","앞에 나서서 발표하기"],[1,"I","N","T","J","짜장면","부먹","후라이드","물복","반민초","강아지","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","물리학","일찍 숙면하기","우주 탐사","과학자","앞에 나서서 발표하기"],[1,"E","N","T","J","짬뽕","부먹","후라이드","물복","반민초","강아지","산","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","물리학","일찍 숙면하기","우주 탐사","과학자","앞에 나서서 발표하기"],[1,"I","S","F","P","짜장면","부먹","양념","딱복","반민초","강아지","바다","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","지구과학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[1,"I","S","F","P","짜장면","부먹","후라이드","딱복","반민초","고양이","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","지구과학","밤새 벼락치기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[1,"I","N","T","J","짜장면","부먹","후라이드","물복","반민초","고양이","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","물리학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[1,"E","N","T","J","짜장면","찍먹","후라이드","딱복","민초","강아지","바다","아침형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","지구과학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[1,"I","S","T","P","짬뽕","찍먹","양념","물복","민초","강아지","산","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","물리학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[1,"I","N","F","P","짜장면","찍먹","양념","딱복","반민초","강아지","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[1,"I","N","F","J","짜장면","부먹","후라이드","물복","민초","고양이","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","지구과학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[1,"I","S","F","J","짜장면","찍먹","후라이드","물복","민초","고양이","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","지구과학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[1,"I","N","T","P","짜장면","찍먹","양념","딱복","민초","강아지","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","물리학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[1,"I","N","F","J","짜장면","부먹","후라이드","물복","반민초","고양이","바다","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","물리학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[1,"I","N","T","P","짜장면","부먹","후라이드","딱복","민초","고양이","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","물리학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[2,"E","N","T","J","짬뽕","부먹","후라이드","딱복","민초","강아지","산","아침형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","물리학","일찍 숙면하기","우주 탐사","공학자","앞에 나서서 발표하기"],[2,"E","N","T","J","짜장면","부먹","양념","딱복","민초","고양이","바다","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","물리학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[2,"I","S","F","J","짬뽕","찍먹","양념","딱복","민초","강아지","산","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","밤새 벼락치기","우주 탐사","공학자","앞에 나서서 발표하기"],[2,"E","N","T","P","짜장면","부먹","후라이드","물복","민초","강아지","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","지구과학","밤새 벼락치기","심해 탐사","공학자","뒤에서 차분히 자료조사"],[2,"E","N","T","J","짬뽕","찍먹","후라이드","물복","반민초","고양이","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","생명과학","일찍 숙면하기","우주 탐사","과학자","앞에 나서서 발표하기"],[2,"I","N","T","J","짜장면","찍먹","후라이드","딱복","반민초","강아지","바다","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","생명과학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[2,"I","N","F","J","짬뽕","찍먹","양념","딱복","반민초","강아지","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","심해 탐사","공학자","앞에 나서서 발표하기"],[2,"I","S","T","P","짜장면","찍먹","양념","딱복","민초","강아지","산","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","생명과학","일찍 숙면하기","심해 탐사","공학자","뒤에서 차분히 자료조사"],[2,"E","N","T","P","짬뽕","찍먹","후라이드","물복","민초","고양이","산","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","생명과학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[2,"E","S","F","P","짬뽕","부먹","후라이드","물복","반민초","강아지","산","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","지구과학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[2,"E","S","T","J","짬뽕","찍먹","후라이드","물복","반민초","강아지","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","화학","밤새 벼락치기","우주 탐사","공학자","앞에 나서서 발표하기"],[2,"E","N","T","P","짜장면","찍먹","후라이드","딱복","반민초","고양이","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","물리학","일찍 숙면하기","우주 탐사","과학자","앞에 나서서 발표하기"],[2,"I","N","F","P","짬뽕","부먹","양념","물복","반민초","강아지","바다","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","화학","일찍 숙면하기","심해 탐사","과학자","앞에 나서서 발표하기"],[2,"I","N","F","P","짬뽕","찍먹","양념","딱복","반민초","강아지","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","밤새 벼락치기","심해 탐사","과학자","앞에 나서서 발표하기"],[2,"I","N","T","P","짜장면","부먹","양념","딱복","반민초","고양이","산","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","생명과학","밤새 벼락치기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[2,"I","S","F","P","짜장면","부먹","양념","물복","반민초","강아지","산","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","물리학","일찍 숙면하기","우주 탐사","과학자","앞에 나서서 발표하기"],[2,"E","S","F","J","짬뽕","찍먹","양념","딱복","반민초","고양이","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","우주 탐사","과학자","앞에 나서서 발표하기"],[2,"I","S","T","J","짜장면","찍먹","양념","물복","반민초","강아지","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","생명과학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[2,"I","N","F","P","짜장면","찍먹","후라이드","물복","반민초","고양이","산","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","물리학","밤새 벼락치기","심해 탐사","과학자","앞에 나서서 발표하기"],[2,"I","N","F","J","짜장면","찍먹","양념","딱복","민초","강아지","산","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[3,"E","N","F","J","짜장면","부먹","후라이드","딱복","민초","강아지","바다","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","물리학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[3,"I","N","F","J","짬뽕","부먹","후라이드","딱복","민초","고양이","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","화학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[3,"E","S","F","J","짬뽕","찍먹","후라이드","딱복","민초","고양이","산","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","지구과학","밤새 벼락치기","우주 탐사","과학자","앞에 나서서 발표하기"],[3,"I","N","F","J","짜장면","찍먹","후라이드","딱복","반민초","강아지","산","아침형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","생명과학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[3,"E","N","T","J","짬뽕","찍먹","후라이드","딱복","반민초","강아지","산","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","화학","일찍 숙면하기","우주 탐사","공학자","앞에 나서서 발표하기"],[3,"I","N","F","J","짜장면","부먹","양념","물복","반민초","고양이","바다","아침형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","화학","일찍 숙면하기","심해 탐사","공학자","뒤에서 차분히 자료조사"],[3,"I","S","F","J","짬뽕","부먹","후라이드","물복","민초","강아지","바다","아침형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","지구과학","일찍 숙면하기","심해 탐사","공학자","앞에 나서서 발표하기"],[3,"I","N","F","J","짜장면","부먹","양념","딱복","민초","고양이","산","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[3,"I","N","F","J","짜장면","부먹","후라이드","물복","민초","고양이","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","화학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[3,"E","S","T","P","짬뽕","찍먹","양념","딱복","민초","강아지","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","물리학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[3,"E","S","T","J","짜장면","부먹","후라이드","딱복","민초","강아지","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","물리학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[3,"E","N","F","P","짜장면","찍먹","후라이드","물복","반민초","강아지","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","우주 탐사","과학자","앞에 나서서 발표하기"],[3,"I","N","F","P","짬뽕","부먹","후라이드","딱복","민초","강아지","산","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","물리학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[3,"I","N","T","J","짜장면","부먹","양념","딱복","반민초","고양이","바다","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","지구과학","일찍 숙면하기","심해 탐사","공학자","앞에 나서서 발표하기"],[3,"I","N","T","P","짜장면","부먹","후라이드","물복","반민초","강아지","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[3,"E","N","T","J","짬뽕","찍먹","양념","물복","민초","강아지","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","심해 탐사","공학자","뒤에서 차분히 자료조사"],[3,"I","S","F","J","짬뽕","부먹","양념","물복","반민초","강아지","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","생명과학","일찍 숙면하기","우주 탐사","공학자","앞에 나서서 발표하기"],[3,"I","N","T","P","짜장면","찍먹","양념","물복","반민초","강아지","바다","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","화학","밤새 벼락치기","우주 탐사","공학자","앞에 나서서 발표하기"],[3,"E","N","F","P","짬뽕","부먹","후라이드","물복","반민초","강아지","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","우주 탐사","공학자","앞에 나서서 발표하기"],[3,"I","S","T","J","짜장면","부먹","양념","물복","민초","강아지","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","생명과학","일찍 숙면하기","심해 탐사","공학자","앞에 나서서 발표하기"],[4,"I","N","F","J","짜장면","부먹","후라이드","딱복","반민초","강아지","바다","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","밤새 벼락치기","우주 탐사","과학자","앞에 나서서 발표하기"],[4,"I","S","F","P","짬뽕","부먹","양념","물복","반민초","고양이","산","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","물리학","일찍 숙면하기","우주 탐사","과학자","앞에 나서서 발표하기"],[4,"E","N","T","P","짜장면","찍먹","후라이드","물복","민초","고양이","바다","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","화학","밤새 벼락치기","심해 탐사","과학자","앞에 나서서 발표하기"],[4,"E","N","T","J","짜장면","찍먹","후라이드","딱복","반민초","강아지","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","화학","일찍 숙면하기","우주 탐사","공학자","앞에 나서서 발표하기"],[4,"E","N","F","P","짬뽕","찍먹","양념","물복","반민초","강아지","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","생명과학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[4,"I","S","F","J","짬뽕","부먹","양념","딱복","반민초","강아지","바다","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","물리학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[4,"I","S","T","P","짬뽕","부먹","후라이드","딱복","민초","고양이","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","물리학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[4,"I","N","F","P","짬뽕","부먹","양념","물복","반민초","강아지","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","물리학","일찍 숙면하기","심해 탐사","공학자","뒤에서 차분히 자료조사"],[4,"E","S","F","P","짬뽕","부먹","양념","딱복","반민초","고양이","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","화학","일찍 숙면하기","심해 탐사","과학자","앞에 나서서 발표하기"],[4,"I","S","F","J","짜장면","부먹","양념","물복","반민초","고양이","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","화학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[4,"E","N","T","J","짜장면","부먹","양념","물복","반민초","강아지","바다","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","화학","일찍 숙면하기","우주 탐사","공학자","앞에 나서서 발표하기"],[4,"I","N","F","J","짜장면","부먹","양념","물복","반민초","강아지","산","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","생명과학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[4,"E","S","T","J","짬뽕","찍먹","후라이드","물복","반민초","강아지","바다","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","지구과학","일찍 숙면하기","우주 탐사","공학자","앞에 나서서 발표하기"],[4,"E","S","F","P","짜장면","부먹","양념","물복","민초","강아지","산","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","생명과학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[4,"I","N","T","J","짜장면","찍먹","후라이드","물복","반민초","강아지","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","지구과학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[4,"I","S","T","J","짬뽕","부먹","후라이드","물복","반민초","강아지","산","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","생명과학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[4,"E","N","F","P","짜장면","부먹","후라이드","딱복","반민초","고양이","바다","아침형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","화학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[4,"I","N","T","P","짜장면","찍먹","양념","물복","민초","고양이","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[4,"I","N","T","P","짬뽕","찍먹","후라이드","물복","민초","강아지","산","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","지구과학","밤새 벼락치기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[4,"E","S","T","P","짜장면","부먹","후라이드","물복","반민초","고양이","산","아침형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","물리학","밤새 벼락치기","우주 탐사","과학자","앞에 나서서 발표하기"],[5,"I","N","F","J","짬뽕","찍먹","양념","물복","반민초","강아지","산","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[5,"I","S","F","P","짜장면","부먹","후라이드","딱복","반민초","고양이","바다","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","물리학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[5,"E","N","T","P","짜장면","찍먹","후라이드","물복","반민초","강아지","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","화학","밤새 벼락치기","우주 탐사","공학자","앞에 나서서 발표하기"],[5,"I","N","T","P","짜장면","찍먹","양념","딱복","반민초","고양이","바다","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","화학","밤새 벼락치기","우주 탐사","공학자","앞에 나서서 발표하기"],[5,"I","S","T","J","짬뽕","부먹","양념","딱복","민초","강아지","산","아침형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","물리학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[5,"I","N","T","J","짜장면","찍먹","양념","딱복","반민초","고양이","바다","아침형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","생명과학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[5,"I","N","T","J","짬뽕","찍먹","양념","물복","민초","강아지","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","물리학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[5,"E","S","T","J","짬뽕","찍먹","양념","딱복","반민초","강아지","바다","아침형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","지구과학","일찍 숙면하기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[5,"I","S","F","P","짜장면","부먹","후라이드","물복","반민초","강아지","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","생명과학","일찍 숙면하기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[5,"I","S","F","J","짜장면","부먹","양념","딱복","반민초","강아지","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","물리학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[5,"I","N","T","P","짬뽕","부먹","양념","딱복","민초","고양이","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","지구과학","밤새 벼락치기","심해 탐사","공학자","앞에 나서서 발표하기"],[5,"I","N","F","J","짬뽕","부먹","양념","딱복","민초","고양이","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","지구과학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[5,"E","S","T","P","짬뽕","찍먹","후라이드","딱복","반민초","강아지","바다","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","생명과학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[5,"I","N","T","J","짜장면","부먹","후라이드","딱복","반민초","강아지","산","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[5,"E","N","F","J","짜장면","부먹","양념","딱복","민초","강아지","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","화학","일찍 숙면하기","우주 탐사","공학자","앞에 나서서 발표하기"],[5,"E","S","F","P","짜장면","찍먹","후라이드","물복","반민초","강아지","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","물리학","일찍 숙면하기","우주 탐사","과학자","앞에 나서서 발표하기"],[5,"I","N","T","P","짜장면","부먹","양념","물복","반민초","고양이","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","지구과학","밤새 벼락치기","우주 탐사","공학자","앞에 나서서 발표하기"],[5,"E","S","F","J","짬뽕","부먹","양념","딱복","민초","고양이","바다","아침형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","화학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[5,"E","N","T","P","짬뽕","부먹","후라이드","물복","반민초","강아지","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","화학","밤새 벼락치기","심해 탐사","과학자","앞에 나서서 발표하기"],[5,"E","N","F","J","짜장면","찍먹","후라이드","딱복","반민초","고양이","바다","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","화학","일찍 숙면하기","심해 탐사","과학자","앞에 나서서 발표하기"],[6,"E","S","T","P","짜장면","찍먹","양념","물복","민초","강아지","바다","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","화학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[6,"I","S","T","J","짬뽕","찍먹","양념","물복","민초","강아지","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","물리학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[6,"I","S","T","J","짬뽕","부먹","후라이드","물복","반민초","고양이","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","화학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[6,"I","S","T","J","짜장면","부먹","후라이드","딱복","반민초","고양이","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","생명과학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[6,"I","N","T","P","짜장면","찍먹","후라이드","물복","민초","강아지","산","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[6,"I","N","T","P","짬뽕","찍먹","양념","물복","반민초","고양이","바다","아침형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","생명과학","밤새 벼락치기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[6,"E","N","T","J","짜장면","찍먹","후라이드","물복","민초","고양이","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","화학","밤새 벼락치기","우주 탐사","과학자","앞에 나서서 발표하기"],[6,"E","N","F","P","짬뽕","찍먹","양념","물복","민초","강아지","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","화학","밤새 벼락치기","심해 탐사","공학자","뒤에서 차분히 자료조사"],[6,"E","N","T","P","짬뽕","찍먹","후라이드","딱복","반민초","고양이","산","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","지구과학","밤새 벼락치기","심해 탐사","공학자","앞에 나서서 발표하기"],[6,"E","N","T","J","짜장면","찍먹","후라이드","물복","반민초","고양이","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","생명과학","일찍 숙면하기","심해 탐사","공학자","앞에 나서서 발표하기"],[6,"I","N","T","J","짜장면","부먹","양념","딱복","민초","고양이","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","물리학","밤새 벼락치기","심해 탐사","공학자","뒤에서 차분히 자료조사"],[6,"E","N","T","P","짜장면","부먹","후라이드","딱복","민초","강아지","바다","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","화학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[6,"I","S","F","P","짜장면","부먹","후라이드","딱복","반민초","강아지","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[6,"I","N","F","J","짜장면","부먹","양념","물복","민초","강아지","바다","아침형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","지구과학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[6,"E","N","F","P","짜장면","부먹","양념","딱복","민초","강아지","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","밤새 벼락치기","심해 탐사","과학자","앞에 나서서 발표하기"],[6,"I","N","F","J","짬뽕","부먹","양념","딱복","반민초","강아지","산","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","지구과학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[6,"I","N","F","P","짬뽕","찍먹","후라이드","물복","민초","강아지","바다","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[6,"I","N","T","P","짜장면","찍먹","후라이드","물복","반민초","강아지","바다","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","생명과학","밤새 벼락치기","우주 탐사","공학자","앞에 나서서 발표하기"],[6,"I","N","F","P","짬뽕","부먹","후라이드","딱복","민초","고양이","바다","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","물리학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[6,"I","N","F","J","짜장면","부먹","양념","딱복","반민초","강아지","바다","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[7,"I","S","T","J","짜장면","부먹","후라이드","딱복","반민초","고양이","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","심해 탐사","공학자","뒤에서 차분히 자료조사"],[7,"I","N","T","P","짜장면","부먹","후라이드","딱복","민초","고양이","바다","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","화학","일찍 숙면하기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[7,"E","N","T","P","짬뽕","찍먹","후라이드","딱복","반민초","고양이","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","화학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[7,"E","S","T","P","짬뽕","부먹","양념","물복","반민초","고양이","산","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","물리학","일찍 숙면하기","우주 탐사","과학자","앞에 나서서 발표하기"],[7,"E","N","T","J","짜장면","부먹","양념","물복","민초","강아지","산","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","물리학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[7,"I","S","T","J","짜장면","부먹","후라이드","물복","민초","강아지","바다","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","화학","일찍 숙면하기","심해 탐사","공학자","뒤에서 차분히 자료조사"],[7,"I","S","T","P","짜장면","부먹","후라이드","딱복","반민초","고양이","바다","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","생명과학","일찍 숙면하기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[7,"E","S","T","P","짬뽕","부먹","양념","딱복","민초","강아지","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","지구과학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[7,"E","S","F","P","짜장면","부먹","후라이드","물복","반민초","고양이","산","아침형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","화학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[7,"E","S","F","P","짬뽕","부먹","후라이드","딱복","민초","강아지","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","지구과학","일찍 숙면하기","우주 탐사","공학자","앞에 나서서 발표하기"],[7,"E","S","T","P","짜장면","부먹","양념","물복","민초","고양이","산","아침형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","화학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[7,"I","N","T","P","짬뽕","부먹","양념","물복","민초","강아지","산","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","지구과학","밤새 벼락치기","우주 탐사","과학자","앞에 나서서 발표하기"],[7,"E","N","F","J","짬뽕","부먹","후라이드","물복","반민초","강아지","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[7,"I","N","F","J","짬뽕","부먹","후라이드","딱복","반민초","고양이","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[7,"I","N","T","J","짜장면","찍먹","양념","딱복","민초","강아지","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","화학","일찍 숙면하기","우주 탐사","과학자","앞에 나서서 발표하기"],[7,"E","N","F","P","짜장면","부먹","양념","딱복","반민초","강아지","바다","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","생명과학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[7,"E","N","T","J","짬뽕","부먹","양념","물복","민초","강아지","바다","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","물리학","일찍 숙면하기","우주 탐사","과학자","앞에 나서서 발표하기"],[7,"I","N","T","J","짜장면","찍먹","양념","딱복","반민초","강아지","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","물리학","일찍 숙면하기","심해 탐사","공학자","앞에 나서서 발표하기"],[7,"I","N","T","P","짬뽕","찍먹","후라이드","물복","민초","강아지","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","물리학","밤새 벼락치기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[7,"I","N","T","P","짬뽕","찍먹","양념","딱복","반민초","강아지","바다","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","화학","밤새 벼락치기","우주 탐사","공학자","앞에 나서서 발표하기"],[8,"E","N","T","P","짬뽕","찍먹","양념","딱복","민초","강아지","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","물리학","밤새 벼락치기","우주 탐사","과학자","앞에 나서서 발표하기"],[8,"I","N","T","J","짜장면","부먹","양념","물복","반민초","고양이","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[8,"E","S","F","P","짜장면","부먹","후라이드","물복","민초","강아지","바다","아침형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","물리학","밤새 벼락치기","우주 탐사","공학자","앞에 나서서 발표하기"],[8,"E","N","F","P","짜장면","부먹","후라이드","물복","반민초","고양이","산","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","화학","밤새 벼락치기","심해 탐사","과학자","앞에 나서서 발표하기"],[8,"E","N","T","J","짬뽕","부먹","양념","딱복","민초","고양이","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","지구과학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[8,"I","N","F","J","짜장면","부먹","양념","물복","민초","강아지","산","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","지구과학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[8,"E","N","T","J","짜장면","찍먹","후라이드","딱복","민초","고양이","산","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","생명과학","밤새 벼락치기","심해 탐사","공학자","앞에 나서서 발표하기"],[8,"I","N","T","P","짜장면","부먹","양념","물복","민초","고양이","바다","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","물리학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[8,"E","S","F","J","짜장면","찍먹","양념","딱복","민초","고양이","산","저녁형","친구들과 다같이 놀기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[8,"E","S","F","J","짜장면","부먹","후라이드","딱복","반민초","강아지","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","좋은 해결책을 제시해주는 친구","화학","일찍 숙면하기","우주 탐사","과학자","앞에 나서서 발표하기"],[8,"I","S","F","P","짜장면","찍먹","후라이드","딱복","민초","강아지","바다","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","물리학","밤새 벼락치기","심해 탐사","과학자","앞에 나서서 발표하기"],[8,"I","N","F","P","짜장면","부먹","후라이드","물복","민초","고양이","바다","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[8,"I","N","T","P","짜장면","부먹","후라이드","물복","반민초","강아지","바다","아침형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","지구과학","밤새 벼락치기","우주 탐사","과학자","뒤에서 차분히 자료조사"],[8,"E","N","T","J","짬뽕","부먹","후라이드","딱복","민초","강아지","산","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","지구과학","일찍 숙면하기","심해 탐사","과학자","앞에 나서서 발표하기"],[8,"I","S","T","J","짬뽕","찍먹","양념","딱복","민초","강아지","산","아침형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","좋은 해결책을 제시해주는 친구","지구과학","일찍 숙면하기","심해 탐사","공학자","뒤에서 차분히 자료조사"],[8,"E","S","F","P","짜장면","부먹","후라이드","딱복","반민초","고양이","산","저녁형","친구들과 다같이 놀기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","물리학","밤새 벼락치기","심해 탐사","공학자","뒤에서 차분히 자료조사"],[8,"I","N","T","J","짜장면","부먹","후라이드","딱복","민초","강아지","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","지구과학","일찍 숙면하기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[8,"I","N","F","P","짜장면","부먹","양념","딱복","민초","강아지","산","저녁형","혼자 자유시간 보내기","휴양지에서 마음 편히 휴식하기","다정하게 경청하고 위로해주는 친구","생명과학","일찍 숙면하기","우주 탐사","공학자","뒤에서 차분히 자료조사"],[8,"I","S","F","J","짜장면","부먹","후라이드","딱복","민초","고양이","바다","저녁형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","화학","밤새 벼락치기","심해 탐사","과학자","뒤에서 차분히 자료조사"],[8,"I","N","T","P","짜장면","부먹","후라이드","물복","민초","강아지","바다","아침형","혼자 자유시간 보내기","관광지에서 부지런히 돌아다니기","다정하게 경청하고 위로해주는 친구","화학","일찍 숙면하기","우주 탐사","공학자","뒤에서 차분히 자료조사"]];

/* 20개 문항 메타데이터 — 03 미리보기 표, 05 문항 선택 체크박스가 공유해서 쓴다 */
const STEP3_FIELDS = [{"key":"ei","cat":"MBTI","q":"E/I","opts":["E","I"]},{"key":"ns","cat":"MBTI","q":"N/S","opts":["N","S"]},{"key":"tf","cat":"MBTI","q":"T/F","opts":["T","F"]},{"key":"pj","cat":"MBTI","q":"P/J","opts":["P","J"]},{"key":"jjajang_jjambbong","cat":"음식","q":"짜장면 / 짬뽕","opts":["짜장면","짬뽕"]},{"key":"tangsuyuk","cat":"음식","q":"탕수육 찍먹 / 부먹","opts":["찍먹","부먹"]},{"key":"chicken","cat":"음식","q":"후라이드 치킨 / 양념 치킨","opts":["후라이드","양념"]},{"key":"peach","cat":"음식","q":"물복 / 딱복","opts":["물복","딱복"]},{"key":"mintchoco","cat":"음식","q":"민초 / 반민초","opts":["민초","반민초"]},{"key":"pet","cat":"일상","q":"강아지 / 고양이","opts":["강아지","고양이"]},{"key":"mountain_sea","cat":"일상","q":"산 / 바다","opts":["산","바다"]},{"key":"chronotype","cat":"일상","q":"아침형 / 저녁형","opts":["아침형","저녁형"]},{"key":"healing_style","cat":"일상","q":"더 힐링되는 것은?","opts":["친구들과 다같이 놀기","혼자 자유시간 보내기"]},{"key":"travel_style","cat":"일상","q":"선호하는 여행 스타일은?","opts":["관광지에서 부지런히 돌아다니기","휴양지에서 마음 편히 휴식하기"]},{"key":"counsel_style","cat":"일상","q":"고민상담하고 싶은 친구는?","opts":["다정하게 경청하고 위로해주는 친구","좋은 해결책을 제시해주는 친구"]},{"key":"subject","cat":"학업","q":"가장 좋아하는 과학 분야","opts":["물리학","화학","생명과학","지구과학"]},{"key":"exam_style","cat":"학업","q":"시험 전날 더 가까운 타입은?","opts":["밤새 벼락치기","일찍 숙면하기"]},{"key":"frontier","cat":"학업","q":"더 끌리는 미지의 영역은?","opts":["우주 탐사","심해 탐사"]},{"key":"career_choice","cat":"학업","q":"두 직업 중 선택해야 한다면?","opts":["과학자","공학자"]},{"key":"group_role","cat":"학업","q":"모둠 과제에서 선호하는 역할은?","opts":["앞에 나서서 발표하기","뒤에서 차분히 자료조사"]}];

/* 현재 선택된 데이터 상태 */
let STEP3_STATE = {
  source: null,      // "example" | "real"
  rows: null,         // [{ei:"E", ...}, ...]
  count: 0,
  password: null      // real일 때만 사용
};


/* ---------- 데이터 로드 ---------- */

function step3RowsFromHeaders(headers, rawRows) {
  return rawRows.map(function (r) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = r[i]; });
    return obj;
  });
}

function step3SetStatus(msg, cls) {
  const el = document.getElementById("data-status");
  if (!el) return;
  el.textContent = msg;
  el.className = "lstate" + (cls ? " " + cls : "");
}

function step3MarkPicked(source) {
  document.querySelectorAll(".datapick-card").forEach(function (card) {
    card.classList.toggle("picked", card.dataset.source === source);
  });
}

function step3LoadExample() {
  STEP3_STATE = {
    source: "example",
    rows: step3RowsFromHeaders(STEP3_EXAMPLE_HEADERS, STEP3_EXAMPLE_ROWS),
    count: STEP3_EXAMPLE_ROWS.length,
    password: null
  };
  step3MarkPicked("example");
  step3SetStatus("예시 데이터(" + STEP3_STATE.count + "명)를 불러왔습니다.", "ok");
  const fb = document.getElementById("btn-fallback");
  if (fb) fb.hidden = true;
  step3RenderAll();
}

function step3LoadReal(password) {
  step3SetStatus("실제 데이터를 확인하는 중…");
  const btn = document.getElementById("btn-pick-real");
  if (btn) btn.disabled = true;

  const url = REAL_APPS_SCRIPT_URL + "?password=" + encodeURIComponent(password);

  fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (json) {
      if (btn) btn.disabled = false;
      if (!json.ok) {
        if (json.error === "wrong_password") {
          step3SetStatus("비밀번호가 올바르지 않습니다. 다시 확인해 주세요.", "err");
        } else {
          throw new Error(json.error || "server_error");
        }
        return;
      }
      STEP3_STATE = {
        source: "real",
        rows: json.data,
        count: json.count,
        password: password
      };
      step3MarkPicked("real");
      step3SetStatus("실제 데이터(" + STEP3_STATE.count + "명)를 불러왔습니다.", "ok");
      const fb = document.getElementById("btn-fallback");
      if (fb) fb.hidden = true;
      step3RenderAll();
    })
    .catch(function () {
      if (btn) btn.disabled = false;
      step3SetStatus("실제 데이터를 불러오지 못했습니다. 인터넷 연결을 확인하거나, 예시 데이터로 실습해 보세요.", "err");
      const fb = document.getElementById("btn-fallback");
      if (fb) fb.hidden = false;
    });
}


/* ---------- 03. 데이터 미리보기 ---------- */

function step3CountField(rows, key, opts) {
  const counts = {};
  opts.forEach(function (o) { counts[o] = 0; });
  rows.forEach(function (row) {
    const v = row[key];
    if (v in counts) counts[v] += 1;
    else counts[v] = (counts[v] || 0) + 1;
  });
  return Object.keys(counts).map(function (k) { return k + " " + counts[k] + "명"; }).join(" · ");
}

function step3RenderPreview() {
  const tbody = document.getElementById("preview-tbody");
  const meta = document.getElementById("preview-meta");
  if (!tbody || !STEP3_STATE.rows) return;

  if (meta) {
    meta.textContent = (STEP3_STATE.source === "example" ? "예시 데이터" : "실제 데이터") +
      " · 총 " + STEP3_STATE.count + "명";
  }

  tbody.innerHTML = STEP3_FIELDS.map(function (f) {
    const dist = step3CountField(STEP3_STATE.rows, f.key, f.opts);
    return "<tr><th>" + f.key + "</th><td>" + f.q + "</td><td>" + dist + "</td></tr>";
  }).join("");
}


/* ---------- 공통 규칙 조립 ---------- */

/* 예시 데이터를 CSV 텍스트로 직접 만든다 — fetch 없이 프롬프트에 통째로 넣기 위함 */
function step3ExampleCSV() {
  const lines = [STEP3_EXAMPLE_HEADERS.join(",")];
  STEP3_EXAMPLE_ROWS.forEach(function (r) {
    lines.push(r.map(function (v) { return String(v); }).join(","));
  });
  return lines.join("\n");
}

function step3DownloadExampleCSV() {
  const csv = "\uFEFF" + step3ExampleCSV(); // BOM 포함 — 엑셀에서 한글 깨짐 방지
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "example_data.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function step3DataSourceBlock() {
  if (STEP3_STATE.source === "example") {
    const headerList = STEP3_EXAMPLE_HEADERS.join(", ");
    return "- 데이터는 반 친구들이 답한 성향·취향 관련 객관식 설문 응답이다.\n" +
      "- 데이터는 미리 다운로드한 CSV 파일(example_data.csv)을 사용한다. 이 프롬프트와\n" +
      "  함께 그 파일을 AI 코딩 도구에 첨부(업로드)해서 전달해라.\n" +
      "- 파일의 헤더(열 이름)는 다음과 같다: " + headerList + "\n" +
      "- CSV는 헤더 기준으로 읽는다. 문항이 빠지거나 순서가 바뀌어도 헤더 이름으로 값을\n" +
      "  찾도록 코드를 짠다. 첨부한 파일 내용을 코드 안에 정적 데이터로 그대로 포함시켜라.";
  }
  if (STEP3_STATE.source === "real") {
    const url = REAL_APPS_SCRIPT_URL + "?password=" + encodeURIComponent(STEP3_STATE.password || "");
    return "- 데이터는 우리 학교 전교생이 답한 성향·취향 관련 객관식 설문 응답이다.\n" +
      "- 데이터는 아래 링크에서 JSON 형식으로 제공된다: " + url + "\n" +
      "- 응답 형식은 { ok:true, data:[ {필드명:값, ...}, ... ] } 이며, data 배열의 각 항목이 한 명의 응답이다.";
  }
  return "- (먼저 02섹션에서 데이터를 선택해 주세요)";
}

const STEP3_ROLE =
  "너는 친구들이 답한 설문 데이터를 재미있게 보여주는 웹페이지를 만드는 개발자다.";
const STEP3_CONTEXT =
  "이 요청을 하는 사용자는 고등학생이며, AI 도구를 활용한 웹앱 제작 과정을\n  경험하는 것이 목적이다.";
const STEP3_OUTPUT =
  "- 결과물은 index.html 파일 하나로만 만든다.\n" +
  "- CSS는 전부 <style> 태그 안에, JavaScript는 전부 <script> 태그 안에 포함한다.\n" +
  "  별도의 .css, .js 파일로 분리하지 않는다.\n" +
  "- 데스크톱 브라우저(노트북 화면 크기)에서 보는 것을 기준으로 만든다.";
const STEP3_SECURITY =
  "- 이 웹앱은 방문자의 개인정보를 수집하지 않는다.\n" +
  "- 로그인, 이름·이메일 입력, 위치추적 기능을 넣지 않는다.";
const STEP3_REQUEST =
  "- 계획에서 애매하거나 추가로 결정해야 할 부분이 있으면 알려줘.\n" +
  "- 문제없으면 어떤 방식으로 만들 건지 간단히 설명해줘. 내가 확인하고 \"시작해줘\"라고\n" +
  "  하면 그때 코드를 만들어줘.";

function step3FixedPrompt() {
  return "■ 역할\n- " + STEP3_ROLE + "\n\n" +
    "■ 사용자 맥락\n- " + STEP3_CONTEXT + "\n\n" +
    "■ 데이터 출처 (반드시 지킬 것)\n" + step3DataSourceBlock() + "\n\n" +
    "■ 출력 형식 (반드시 지킬 것)\n" + STEP3_OUTPUT + "\n\n" +
    "■ 데이터·보안 원칙 (반드시 지킬 것)\n" + STEP3_SECURITY;
}


/* ---------- 04. 프롬프트 예시 보기 ---------- */

function step3EscapeHtml(s) {
  return String(s).replace(/[&<>]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
  });
}

function step3RenderExample() {
  const pre = document.getElementById("example-prompt-pre");
  if (!pre) return;

  const fixed = step3FixedPrompt();
  const emph =
    "■ 사용할 문항\n- ei (E/I), group_role (모둠 과제에서 선호하는 역할)\n\n" +
    "■ 보여주는 방식\n- 두 문항을 교차분석한 막대그래프 (ei별로 group_role 응답 비율을 나란히)\n\n" +
    "■ 디자인 무드\n- 깔끔하고 정제된 파스텔 톤";

  pre.innerHTML =
    '<span class="dim">' + step3EscapeHtml(fixed) + '</span>\n\n' +
    '<span class="emph">' + step3EscapeHtml(emph) + '</span>\n\n' +
    '<span class="dim">' + step3EscapeHtml("■ 요청\n" + STEP3_REQUEST) + '</span>';

  step3RenderExampleChart();
}

/* 04. 결과 예시 그래프 — 항상 내장된 예시 데이터(160명)로 실제 계산해서 보여준다 */
function step3RenderExampleChart() {
  const svg = document.getElementById("example-chart-svg");
  const legend = document.getElementById("example-chart-legend");
  const sub = document.getElementById("example-chart-sub");
  if (!svg || !STEP3_STATE.rows) return;

  const rows = STEP3_STATE.rows;
  if (sub) {
    sub.textContent = (STEP3_STATE.source === "example" ? "예시 데이터" : "실제 데이터") +
      " " + STEP3_STATE.count + "명 기준";
  }
  const roleA = "앞에 나서서 발표하기";
  const roleB = "뒤에서 차분히 자료조사";
  const groups = ["E", "I"];
  const counts = {};
  groups.forEach(function (g) { counts[g] = { a: 0, b: 0, total: 0 }; });
  rows.forEach(function (r) {
    if (!counts[r.ei]) return;
    counts[r.ei].total += 1;
    if (r.group_role === roleA) counts[r.ei].a += 1;
    else counts[r.ei].b += 1;
  });

  const W = 560, H = 260;
  const padL = 46, padR = 20, padT = 18, padB = 40;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const maxV = Math.max.apply(null, groups.map(function (g) { return Math.max(counts[g].a, counts[g].b); })) || 1;
  const groupW = plotW / groups.length;
  const barW = groupW * 0.28;

  let bars = "";
  let gridlines = "";
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const v = Math.round(maxV * i / ticks);
    const y = padT + plotH - (plotH * i / ticks);
    gridlines += '<line class="grid" x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '"/>';
    gridlines += '<text class="axlbl left" x="' + (padL - 8) + '" y="' + (y + 4) + '">' + v + '</text>';
  }

  groups.forEach(function (g, gi) {
    const cx = padL + groupW * gi + groupW / 2;
    const c = counts[g];
    const hA = plotH * (c.a / maxV);
    const hB = plotH * (c.b / maxV);
    const xA = cx - barW - 4;
    const xB = cx + 4;
    const yA = padT + plotH - hA;
    const yB = padT + plotH - hB;
    bars += '<rect class="s3bar s3bar-a" x="' + xA + '" y="' + yA + '" width="' + barW + '" height="' + hA + '"/>';
    bars += '<rect class="s3bar s3bar-b" x="' + xB + '" y="' + yB + '" width="' + barW + '" height="' + hB + '"/>';
    bars += '<text class="s3val" x="' + (xA + barW / 2) + '" y="' + (yA - 6) + '">' + c.a + '</text>';
    bars += '<text class="s3val" x="' + (xB + barW / 2) + '" y="' + (yB - 6) + '">' + c.b + '</text>';
    bars += '<text class="axlbl mid" x="' + cx + '" y="' + (H - padB + 22) + '">' + g + ' (' + c.total + '명)</text>';
  });

  svg.innerHTML =
    '<line class="axis" x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) + '" y2="' + (padT + plotH) + '"/>' +
    gridlines + bars;

  if (legend) {
    legend.innerHTML =
      '<span><i class="s3-k-a"></i>' + step3EscapeHtml(roleA) + '</span>' +
      '<span><i class="s3-k-b"></i>' + step3EscapeHtml(roleB) + '</span>';
  }
}


/* ---------- 05. 프롬프트 만들기 ---------- */

function step3RenderFieldPicker() {
  const box = document.getElementById("fieldpicker");
  if (!box) return;

  const cats = ["MBTI", "음식", "일상", "학업"];
  box.innerHTML = cats.map(function (cat) {
    const items = STEP3_FIELDS.filter(function (f) { return f.cat === cat; });
    const opts = items.map(function (f) {
      return '<label class="fp-item"><input type="checkbox" value="' + f.key + '" data-q="' +
        step3EscapeHtml(f.q) + '"><span>' + step3EscapeHtml(f.q) + '</span></label>';
    }).join("");
    return '<div class="fp-group"><h4>' + cat + '</h4><div class="fp-options">' + opts + '</div></div>';
  }).join("");

}

function step3RenderRuleBox() {
  const pre = document.getElementById("rulebox-pre");
  const srcLine = document.getElementById("rule-datasrc-text");
  if (pre) pre.textContent = step3FixedPrompt();
  if (srcLine) {
    srcLine.textContent = STEP3_STATE.source === "example" ? "예시 데이터 (CSV 링크)"
      : STEP3_STATE.source === "real" ? "실제 데이터 (비밀번호 포함 링크)" : "-";
  }
}

function step3BuildPrompt() {
  const box = document.getElementById("fieldpicker");
  const checked = box ? Array.prototype.slice.call(box.querySelectorAll('input[type="checkbox"]:checked')) : [];
  const howshow = (document.getElementById("build-howshow") || {}).value || "";
  const mood = (document.getElementById("build-mood") || {}).value || "";

  const fieldLine = checked.map(function (b) { return b.value + " (" + b.dataset.q + ")"; }).join(", ");

  let text = step3FixedPrompt() + "\n\n";
  text += "■ 사용할 문항\n- " + (fieldLine || "(선택 안 됨)") + "\n\n";
  text += "■ 보여주는 방식\n- " + (howshow.trim() || "(자유롭게 정해줘)") + "\n\n";
  if (mood.trim()) text += "■ 디자인 무드\n- " + mood.trim() + "\n\n";
  text += "■ 요청\n" + STEP3_REQUEST;
  return text;
}

function step3InitBuilder() {
  const btn = document.getElementById("btn-copy-prompt");
  if (!btn) return;
  btn.addEventListener("click", function () {
    const box = document.getElementById("fieldpicker");
    const checked = box ? box.querySelectorAll('input[type="checkbox"]:checked').length : 0;
    const status = document.getElementById("build-status");
    if (!checked) {
      if (status) { status.textContent = "문항을 1개 이상 골라주세요."; status.className = "lstate err"; }
      return;
    }
    const text = step3BuildPrompt();
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(function () {
      if (status) { status.textContent = "복사됐습니다. AI 코딩 도구에 붙여넣어 보세요."; status.className = "lstate ok"; }
      const old = btn.textContent;
      btn.textContent = "복사됨";
      setTimeout(function () { btn.textContent = old; }, 1400);
    });
  });
}


/* ---------- 섹션 노출 제어 ---------- */

function step3ToggleGuards() {
  const has = !!STEP3_STATE.rows;
  ["preview", "example", "build"].forEach(function (id) {
    const guard = document.getElementById(id + "-guard");
    const content = document.getElementById(id + "-content");
    if (guard) guard.hidden = has;
    if (content) content.hidden = !has;
  });
}

function step3RenderAll() {
  step3ToggleGuards();
  step3RenderPreview();
  step3RenderExample();
  step3RenderRuleBox();
}


/* ---------- 초기화 ---------- */

function initStep3() {
  const picker = document.getElementById("btn-pick-example");
  if (!picker) return; // step3.html이 아니면 아무 것도 하지 않는다

  document.getElementById("btn-pick-example").addEventListener("click", step3LoadExample);

  const dl = document.getElementById("btn-download-example");
  if (dl) dl.addEventListener("click", step3DownloadExampleCSV);

  document.getElementById("btn-pick-real").addEventListener("click", function () {
    const pw = document.getElementById("real-password").value.trim();
    if (!pw) {
      step3SetStatus("비밀번호를 입력해 주세요.", "err");
      return;
    }
    step3LoadReal(pw);
  });

  const fb = document.getElementById("btn-fallback");
  if (fb) fb.addEventListener("click", step3LoadExample);

  step3RenderFieldPicker();
  step3InitBuilder();
  step3ToggleGuards();
}

document.addEventListener("DOMContentLoaded", function () {
  initStep3();
});
