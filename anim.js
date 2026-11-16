/* 설명 영상: 영상 파일 없이 페이지 안에서 장면이 자동 재생·반복됩니다. */
const bar = (l, pct, txt, d, cls = "") =>
  `<div class="ar ${cls}" style="--d:${d}s"><div class="at"><span>${l}</span><span>${txt}</span></div><div class="ab"><i style="--w:${pct}%"></i></div></div>`;
const item = (rank, name, sub, d, one) =>
  `<div class="it ${one ? "one" : ""}" style="--d:${d}s"><span><b>${rank}</b> ${name}</span><span>${sub}</span></div>`;

const AN = {};

AN.auction = {
  badge: "예시 숫자 · 이해를 돕는 설명 영상", dur: 4200,
  scenes: [
    { cap: "① 같은 키워드에 광고주 3곳이 입찰합니다",
      html: bar("A 광고", 100, "입찰가 1,000원", .1) + bar("B 광고", 80, "입찰가 800원", .4) + bar("C 광고", 60, "입찰가 600원", .7) },
    { cap: "② 입찰가 × 품질지수(1~7단계)로 광고 점수를 계산합니다",
      html: bar("A 광고", 54, "1,000 × 3 = 3,000", .1) + bar("B 광고", 100, "800 × 7 = 5,600", .4, "hi") + bar("C 광고", 64, "600 × 6 = 3,600", .7) },
    { cap: "③ 점수가 높은 순서대로 순위가 정해집니다",
      html: `<div class="pd">${item("3위", "A 광고", "3,000점", .1)}${item("2위", "C 광고", "3,600점", .5)}${item("1위", "B 광고", "5,600점", .9, true)}</div><p class="tip" style="--d:1.5s">입찰가가 가장 높아도(A) 품질지수가 낮으면 순위가 밀립니다</p>` },
    { cap: "④ 실제 과금은 내 순위를 지키는 데 필요한 최소 금액입니다",
      html: `<div class="chg"><div class="old" style="--d:.1s">입찰가 800원</div><div class="arr" style="--d:.6s">↓</div><div class="new" style="--d:1s">실제 약 515원</div><p style="--d:1.6s">바로 아래 순위 점수 3,600 ÷ 내 품질지수 7 ≈ 515원</p></div>` }
  ]
};

AN.place = {
  badge: "예시 · 이해를 돕는 설명 영상", dur: 4200,
  scenes: [
    { cap: "① 고객이 지역 키워드로 검색합니다",
      html: `<div class="sb"><span class="mag">🔍</span><span class="type">제주 필라테스</span></div><p class="tip" style="--d:1.6s">네이버 플레이스에 매장 목록이 나타납니다</p>` },
    { cap: "② 관련성 · 거리 · 인기도를 함께 봅니다",
      html: bar("관련성", 92, "카테고리 · 키워드 일치", .1) + bar("거리", 70, "고객과 가까울수록", .4) + bar("인기도", 85, "저장 · 방문자 리뷰 · 예약", .7) },
    { cap: "③ 점수가 높은 매장이 위에 노출됩니다",
      html: `<div class="pd">${item("3위", "B 매장", "점수 낮음", .1)}${item("2위", "A 매장", "점수 보통", .5)}${item("1위", "우리 매장", "관련성 · 거리 · 인기도 우수", .9, true)}</div>` }
  ]
};

AN.rank = {
  badge: "PPT에 기록된 실제 순위 기반", dur: 4200,
  build() {
    const pick = [0, 1, 4].map(i => siteData.ranks[0].rows[i]);
    const num = s => parseInt(s, 10);
    const len = r => Math.max(6, 100 - num(r));
    const two = (r, d, showB, showR) =>
      `<div class="ar" style="--d:${d}s"><div class="at"><span>${r[0]}</span><span>${showB ? `${r[1]} → ${r[2]}` : r[1]}</span></div>
       <div class="ab"><i class="gr" style="--w:${len(r[1])}%"></i></div>
       ${showB ? `<div class="ab" style="margin-top:5px"><i style="--w:${len(r[2])}%;animation-delay:${d + .3}s"></i></div>` : ""}</div>`;
    this.scenes = [
      { cap: "① 1주 차 기록 (막대가 길수록 순위가 높습니다)", html: pick.map((r, i) => two(r, .1 + i * .3, false)).join("") },
      { cap: "② 4주 차 기록 (노란 막대)", html: pick.map((r, i) => two(r, .1 + i * .3, true)).join("") },
      { cap: "③ 4주 동안의 변화", html: `<div class="pd">${pick.map((r, i) => item("▲", r[0], `${r[1]} → ${r[2]} · ${r[3]}`, .1 + i * .4, i === 1)).join("")}</div><p class="tip" style="--d:1.5s">검색 시점과 위치에 따라 결과는 달라질 수 있습니다</p>` }
    ];
  }
};

function initVideos() {
  document.querySelectorAll(".vid").forEach(v => {
    const def = AN[v.dataset.anim]; if (!def) return;
    if (def.build) def.build();
    v.innerHTML = `<span class="vbadge">${def.badge}</span><button class="rp" type="button">↻ 다시 보기</button>
      <div class="scr"></div><div class="vc"></div><div class="seg">${def.scenes.map(() => "<i></i>").join("")}</div>`;
    const scr = v.querySelector(".scr"), vc = v.querySelector(".vc"), segs = [...v.querySelectorAll(".seg i")];
    let timer = null;
    function show(n) {
      clearTimeout(timer);
      const s = def.scenes[n];
      scr.innerHTML = `<div class="sc">${s.html}</div>`;
      vc.textContent = s.cap;
      segs.forEach((g, k) => { g.className = k < n ? "done" : k === n ? "fill" : ""; g.style.setProperty("--t", def.dur + "ms"); });
      timer = setTimeout(() => show((n + 1) % def.scenes.length), def.dur);
    }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { if (!timer) show(0); } else { clearTimeout(timer); timer = null; }
    }), { threshold: .45 });
    io.observe(v);
    v.querySelector(".rp").onclick = () => show(0);
  });
}
