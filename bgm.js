/* 하루마케팅 BGM — 브라우저에서 직접 만들어 재생하는 잔잔한 어쿠스틱/로파이 풍 음악.
   외부 음원 파일이 없어 저작권 걱정이 없습니다. (소리는 방문자가 버튼을 눌러야 시작됩니다) */
(function () {
  const btn = document.getElementById("bgm");
  if (!btn) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { btn.style.display = "none"; return; }

  const BPM = 76, HALF = 60 / BPM / 2;            // 8분음표 길이(초)
  const VOL = 0.16;                               // 전체 볼륨(작게)
  /* Cmaj7 → Am7 → Fmaj7 → G6 (밝고 따뜻한 진행) */
  const CHORDS = [[48, 55, 59, 64], [45, 52, 57, 60], [41, 48, 52, 57], [43, 50, 55, 59]];
  const SCALE = [72, 74, 76, 79, 81, 84, 79, 76];  // C 펜타토닉(멜로디 후보)
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  let ctx, master, bus, timer, nextT = 0, step = 0, on = false, stopTimer = 0;

  function build() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600; lp.Q.value = 0.4;
    lp.connect(master);
    /* 잔향 느낌: 피드백 딜레이 */
    const d = ctx.createDelay(1); d.delayTime.value = HALF * 3;
    const fb = ctx.createGain(); fb.gain.value = 0.34;
    const dl = ctx.createBiquadFilter(); dl.type = "lowpass"; dl.frequency.value = 1800;
    d.connect(dl); dl.connect(fb); fb.connect(d); dl.connect(lp);
    bus = ctx.createGain(); bus.connect(lp); bus.connect(d);
  }

  function tone(freq, t, dur, vol, type, atk, rel) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + rel);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + dur + rel + 0.05);
  }

  function schedule(t, s) {
    const chord = CHORDS[Math.floor(s / 16) % CHORDS.length];
    const pos = s % 16;
    if (pos === 0) {
      /* 코드 패드(부드럽게 들어오고 길게 사라짐) + 낮은 베이스 */
      chord.forEach((m, i) => {
        tone(hz(m), t, HALF * 14, 0.05, "sine", 1.4, 2.6);
        tone(hz(m) * 1.004, t, HALF * 14, 0.03, "triangle", 1.8, 2.6);
      });
      tone(hz(chord[0] - 12), t, HALF * 6, 0.1, "sine", 0.05, 1.2);
    }
    if (pos === 8) tone(hz(chord[0] - 12), t, HALF * 6, 0.07, "sine", 0.05, 1.2);
    /* 피아노/벨 느낌의 가벼운 멜로디 */
    const hit = pos % 2 === 0 ? 0.55 : 0.28;
    if (Math.random() < hit) {
      const m = SCALE[(Math.random() * SCALE.length) | 0] - (Math.random() < 0.25 ? 12 : 0);
      tone(hz(m), t, 0.05, 0.075, "sine", 0.008, 1.7);
      tone(hz(m) * 2, t, 0.03, 0.02, "triangle", 0.008, 0.9);
    }
  }

  function tick() {
    while (nextT < ctx.currentTime + 0.35) {
      schedule(nextT, step++);
      nextT += HALF;
    }
  }

  function start() {
    clearTimeout(stopTimer);
    if (!ctx) build();
    ctx.resume();
    if (!timer) { nextT = ctx.currentTime + 0.1; step = 0; timer = setInterval(tick, 100); }
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(VOL, ctx.currentTime, 0.8);
    on = true; paint();
  }
  function stop() {
    if (!ctx) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.35);
    on = false; paint();
    stopTimer = setTimeout(() => { clearInterval(timer); timer = 0; ctx.suspend(); }, 1600);
  }
  function paint() {
    btn.classList.toggle("on", on);
    btn.setAttribute("aria-pressed", on);
    btn.setAttribute("aria-label", on ? "배경음악 끄기" : "배경음악 켜기");
    btn.querySelector(".lb").textContent = on ? "BGM ON" : "BGM";
  }

  btn.addEventListener("click", () => (on ? stop() : start()));
  /* 다른 탭으로 가면 멈추고, 돌아오면 이어서 */
  document.addEventListener("visibilitychange", () => {
    if (!ctx || !on) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });
  paint();
})();
