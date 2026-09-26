/* ===== SOLID PROJECTS — site logic ===== */
(function () {
  "use strict";
  var D = window.SITE;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var el = function (t, cls, html) {
    var n = document.createElement(t);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  var AR = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  function toAr(n) { return String(n).replace(/\d/g, function (d) { return AR[+d]; }); }
  function pad(n) { return toAr(n < 10 ? "0" + n : n); }

  /* ---------------- brand + hero ---------------- */
  var b = D.brand;
  $("#brandA").textContent = b.name;
  $("#brandB").textContent = b.name2;
  $("#railText").textContent = b.tagline;
  $("#heroLoc").textContent = b.location;
  $("#heroKicker").textContent = D.hero.kicker;
  $("#heroLead").textContent = D.hero.lead;
  if (b.logo) {
    $("#heroTitle").classList.add("hero__title--logo");
    $("#heroTitle").innerHTML =
      '<img class="hero__logo" src="' + b.logo + '" alt="' + b.name + " " + b.name2 + '">' +
      '<em class="hero__logosub">' + b.name2.split("").join(" ") + '</em>' +
      '<span class="hero__line">' + D.hero.title.join(" ") + '</span>';
  } else {
    $("#heroTitle").innerHTML = D.hero.title.map(function (t) {
      return "<span><b>" + t + "</b></span>";
    }).join("");
  }
  $("#heroCta1 span").textContent = D.hero.cta1;
  $("#heroCta2 span").textContent = D.hero.cta2;
  $("#cPhone").textContent = b.phoneShown;
  $("#cLoc").textContent = b.location;
  $("#footBrand").textContent = b.name + " " + b.name2;
  $("#footYear").textContent = new Date().getFullYear();

  if (b.logo) {
    $("#logoMark").style.display = "none";
    var wm = document.querySelector(".wordmark");
    wm.innerHTML = "";
    var li = new Image();
    li.src = b.logo; li.alt = b.name + " " + b.name2; li.className = "wordmark__img";
    li.onerror = function () { wm.innerHTML = "<b>" + b.name + "</b><em>" + b.name2 + "</em>"; $("#logoMark").style.display = ""; };
    wm.appendChild(li);
    var sub = document.createElement("em");
    sub.textContent = b.name2;
    wm.appendChild(sub);
  }

  var wa = "https://wa.me/" + b.whatsapp + "?text=" +
    encodeURIComponent("السلام عليكم، شفت موقعكم وأبي أستفسر عن تجهيز سيارتي.");
  $("#waBtn").href = wa;
  $("#waFab").href = wa;
  $("#igBtn").href = b.instagram;

  /* background video — runs behind the whole site */
  var v = $("#bgVideo"), ph = $("#bgPh"), hint = $("#heroHint");
  if (D.hero.poster) v.poster = D.hero.poster;
  v.muted = true;
  v.setAttribute("muted", "");
  function reveal() {
    v.classList.add("is-on");
    ph.classList.add("is-off");
    if (hint) hint.style.display = "none";
    play();
  }
  /* start as early as the browser lets us, not after full buffering */
  v.addEventListener("loadedmetadata", reveal);
  v.addEventListener("loadeddata", reveal);
  v.addEventListener("canplay", play);
  function play() {
    var p = v.play();
    if (p && p.catch) p.catch(function () {
      /* some phones block autoplay until the first touch */
      var go = function () {
        v.play();
        document.removeEventListener("touchstart", go);
        document.removeEventListener("click", go);
      };
      document.addEventListener("touchstart", go, { once: true });
      document.addEventListener("click", go, { once: true });
    });
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && v.paused) play();
  });
  /* if the browser still blocks autoplay, offer a one-tap start */
  setTimeout(function () {
    if (!v.paused) return;
    var btn = el("button", "playfab", "<i></i><span>شغّل الفيديو</span>");
    document.body.appendChild(btn);
    btn.addEventListener("click", function () {
      v.play();
      btn.remove();
    });
    v.addEventListener("playing", function () { if (btn.parentNode) btn.remove(); });
  }, 5000);

  /* بعض إضافات المتصفح (مثل Ultrawidify) تغيّر مقاس أي فيديو بالقوة — نرجّعه لمكانه */
  (function protectVideo() {
    var fixes = 0, last = 0;
    function clean() {
      if (fixes > 60) return;
      var now = Date.now();
      if (now - last < 200) return;
      last = now;
      var touched = false;
      [v, v.parentNode].forEach(function (n) {
        if (!n || !n.classList) return;
        Array.prototype.slice.call(n.classList).forEach(function (c) {
          if (c.indexOf("uw-") === 0 || c.indexOf("ultrawidify") > -1) { n.classList.remove(c); touched = true; }
        });
      });
      var st = v.getAttribute("style");
      if (st && /transform|width|height|top|left|margin|position/i.test(st)) {
        v.removeAttribute("style"); touched = true;
      }
      if (touched) fixes++;
    }
    clean();
    if (window.MutationObserver) {
      new MutationObserver(clean).observe(v, { attributes: true, attributeFilter: ["class", "style"] });
      if (v.parentNode) {
        new MutationObserver(clean).observe(v.parentNode, { attributes: true, attributeFilter: ["class", "style"] });
      }
    }
    setTimeout(clean, 1200);
    setTimeout(clean, 3000);
    window.addEventListener("resize", clean);
  })();

  /* المصدر مكتوب في HTML عشان التشغيل التلقائي يبدأ قبل أي كود — نضبطه هنا فقط لو تغيّر */
  if (!v.getAttribute("src")) { v.src = D.hero.video; }
  else if (v.getAttribute("src") !== D.hero.video) { v.src = D.hero.video; }
  play();
  /* بعض التلفونات تحتاج محاولات متكررة في أول ثانيتين */
  var tries = 0;
  var retry = setInterval(function () {
    if (!v.paused || tries++ > 14) { clearInterval(retry); return; }
    play();
  }, 140);

  /* ticker */
  var tr = $("#tickerRow"), tHtml = D.ticker.map(function (t) { return "<span>" + t + "</span>"; }).join("");
  tr.innerHTML = tHtml + tHtml;

  /* ---------------- works — معرض ثلاثي الأبعاد ---------------- */
  var wg = $("#worksGrid");
  if (wg) {
    /* [معطّل] الشبكة القديمة — ترجع لو رجّعنا العنصر في index.html */
    D.works.forEach(function (w, i) {
      var a2 = el("a", "work rv");
      a2.href = b.instagram; a2.target = "_blank"; a2.rel = "noopener";
      a2.appendChild(el("span", "work__n", pad(i + 1)));
      var img = new Image();
      img.alt = w.t; img.loading = "lazy"; img.src = w.img;
      a2.appendChild(img);
      wg.appendChild(a2);
    });
  }

  var g3d = $("#g3d");
  if (g3d) { /* [معطّل] معرض العمق — كوده محفوظ في app.js.backup-2026-09-26-d */ }

  /* ---------------- معرض دائري ---------------- */
  var cg = $("#cg");
  if (cg) (function () {
    var ring = $("#cgRing"), dots = $("#cgDots"), hint = $("#cgHint");
    var n = D.works.length, step = 360 / n;
    var items = [];

    D.works.forEach(function (w) {
      var a2 = el("a", "cg__item");
      a2.href = b.instagram; a2.target = "_blank"; a2.rel = "noopener";
      a2.setAttribute("aria-label", w.t);
      var img = new Image();
      img.src = w.img; img.alt = w.t;
      a2.appendChild(img);
      ring.appendChild(a2);
      items.push(a2);
      dots.appendChild(document.createElement("b"));
    });

    var radius = 0, angle = 0, auto = true, timer = null;

    function measure() {
      var w = items[0] ? items[0].offsetWidth : 240;
      radius = Math.round((w * 1.62) / (2 * Math.tan(Math.PI / n)));
    }

    function layout() {
      ring.style.transform = "rotateY(" + angle.toFixed(2) + "deg)";
      var front = 0, best = 1e9;
      for (var i = 0; i < items.length; i++) {
        items[i].style.transform = "rotateY(" + (i * step) + "deg) translateZ(" + radius + "px)";
        var rel = ((i * step + angle) % 360 + 360) % 360;
        var diff = Math.min(rel, 360 - rel);
        if (diff < best) { best = diff; front = i; }
      }
      for (var j = 0; j < items.length; j++) {
        items[j].classList.toggle("is-front", j === front);
        if (dots.children[j]) dots.children[j].classList.toggle("on", j === front);
      }
    }

    /* الحركة بانتقال CSS — تشتغل حتى لو المتصفح موقّف حلقة الرسم */
    function goTo(i) { angle = -i * step; layout(); }
    function index() { return Math.round(-angle / step); }

    function stopAuto() {
      auto = false;
      if (timer) { clearInterval(timer); timer = null; }
      if (hint) hint.classList.add("is-off");
    }

    $("#cgNext").addEventListener("click", function () { stopAuto(); goTo(index() + 1); });
    $("#cgPrev").addEventListener("click", function () { stopAuto(); goTo(index() - 1); });

    /* سحب بالإصبع أو الماوس */
    var dragging = false, lastX = 0, moved = 0;
    cg.addEventListener("pointerdown", function (e) {
      dragging = true; moved = 0; lastX = e.clientX;
      stopAuto();
      cg.classList.add("is-dragging");
      if (cg.setPointerCapture) { try { cg.setPointerCapture(e.pointerId); } catch (x) {} }
    });
    cg.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX; lastX = e.clientX;
      moved += Math.abs(dx);
      angle += dx * 0.3;
      layout();
    });
    function release() {
      if (!dragging) return;
      dragging = false;
      cg.classList.remove("is-dragging");
      angle = Math.round(angle / step) * step;   /* يلزق على أقرب صورة */
      layout();
    }
    cg.addEventListener("pointerup", release);
    cg.addEventListener("pointercancel", release);
    cg.addEventListener("pointerleave", release);

    /* ما نفتح إنستغرام إذا كان يسحب */
    items.forEach(function (it) {
      it.addEventListener("click", function (e) { if (moved > 8) e.preventDefault(); });
    });

    /* لوحة المفاتيح */
    cg.setAttribute("tabindex", "0");
    cg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft")  { stopAuto(); goTo(index() + 1); }
      if (e.key === "ArrowRight") { stopAuto(); goTo(index() - 1); }
    });

    window.addEventListener("resize", function () { measure(); layout(); }, { passive: true });

    measure(); layout();

    /* يدور لحاله لما يوصله المستخدم، ويوقف أول ما يلمسه */
    function startAuto() {
      if (timer || !auto) return;
      timer = setInterval(function () { if (auto) goTo(index() + 1); }, 3600);
    }
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        es.forEach(function (x) { if (x.isIntersecting) startAuto(); });
      }, { threshold: 0.25 }).observe(cg);
    } else { startAuto(); }
    setTimeout(function () { if (hint) hint.classList.add("is-off"); }, 6000);
  })();

  /* ---------------- services ---------------- */
  var sg = $("#servicesGrid");
  D.services.forEach(function (s, i) {
    sg.appendChild(el("article", "svc rv",
      "<i>" + pad(i + 1) + "</i><h3>" + s.t + "</h3><p>" + s.d + "</p>"));
  });

  /* ---------------- process ---------------- */
  var pl = $("#processList");
  D.steps.forEach(function (s, i) {
    pl.appendChild(el("li", "rv",
      "<b>" + pad(i + 1) + "</b><div><h3>" + s.t + "</h3><p>" + s.d + "</p></div>"));
  });

  /* ---------------- nav ---------------- */
  var nav = $("#nav");
  var fab = $("#waFab");
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle("is-stuck", y > 40);
    fab.classList.toggle("is-on", y > window.innerHeight * 0.7);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  $("#burger").addEventListener("click", function () { nav.classList.toggle("is-open"); });
  Array.prototype.forEach.call(document.querySelectorAll(".nav__links a"), function (a) {
    a.addEventListener("click", function () { nav.classList.remove("is-open"); });
  });

  /* reveal */
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(document.querySelectorAll(".rv, .sec__head, .stage, .plist"), function (n) {
      n.classList.add("rv"); io.observe(n);
    });
  }

  /* ---------------- 3D studio ---------------- */
  var stage = $("#stage"), layer = $("#layer"), lines = $("#lines");
  if (stage) {
  var SVGNS = "http://www.w3.org/2000/svg";
  var items = {}, showAll = false, pinned = null, active = null;

  var FOCUS = {
    bullbar: "front", lightbar: "front", roofrack: "34",
    snorkel: "side", steps: "side", flares: "side",
    platform: "rear", carrier: "rear"
  };

  /* parts list + hotspots */
  var ul = $("#plist");
  $("#pCount").textContent = toAr(D.parts.length);

  D.parts.forEach(function (p, i) {
    /* list row */
    var li = el("li", "", "<i>" + pad(i + 1) + "</i><span>" + p.name + "<em>" + p.note + "</em></span>");
    li.addEventListener("mouseenter", function () { setActive(p.id); });
    li.addEventListener("mouseleave", function () { setActive(null); });
    li.addEventListener("click", function () { pin(p.id); });
    ul.appendChild(li);

    /* hotspot dot */
    var dot = el("button", "hot");
    dot.setAttribute("aria-label", p.name);
    dot.addEventListener("mouseenter", function () { setActive(p.id); });
    dot.addEventListener("mouseleave", function () { setActive(null); });
    dot.addEventListener("click", function (e) { e.stopPropagation(); pin(p.id); });
    layer.appendChild(dot);

    /* chip */
    var chip = el("div", "chip",
      "<u>من إنتاجنا</u><b>" + p.name + "</b><s>" + p.note + "</s>");
    layer.appendChild(chip);

    /* line */
    var path = document.createElementNS(SVGNS, "path");
    lines.appendChild(path);

    items[p.id] = { p: p, li: li, dot: dot, chip: chip, path: path, on: false, timer: 0, drawn: false };
  });

  function setActive(id) {
    active = id;
    render();
  }
  function pin(id) {
    if (tour) { clearInterval(tour); tour = null; setBtn(); }
    pinned = (pinned === id) ? null : id;
    if (pinned && FOCUS[id]) setView(FOCUS[id]);
    render();
  }

  function isOn(id) { return showAll || pinned === id || active === id; }

  function render() {
    Object.keys(items).forEach(function (id) {
      var it = items[id], on = isOn(id);
      if (on === it.on) { it.li.classList.toggle("is-on", on); return; }
      it.on = on;
      it.li.classList.toggle("is-on", on);
      it.dot.classList.toggle("is-on", on);
      it.chip.classList.toggle("is-on", on);
      clearTimeout(it.timer);
      if (on) {
        it.drawn = false;
        it.path.style.strokeDasharray = "";
        it.path.style.strokeDashoffset = "";
        it.path.classList.add("is-on");
        it.timer = setTimeout(function () {
          it.drawn = true;
          it.path.style.strokeDasharray = "none";
          it.path.style.strokeDashoffset = "0";
        }, 620);
      } else {
        it.path.classList.remove("is-on");
      }
    });
    if (window.Truck3D && Truck3D.highlight) {
      Truck3D.highlight(pinned || active || null);
    }
  }

  function clamp(v, a, z) { return v < a ? a : (v > z ? z : v); }

  function frame(pos) {
    var w = stage.clientWidth, h = stage.clientHeight;
    var off = w < 620 ? 11 : 17, gap = w < 620 ? 1.2 : 1.6;
    var list = [];

    for (var i = 0; i < D.parts.length; i++) {
      var p = D.parts[i], it = items[p.id], o = pos[p.id];
      if (!o) continue;
      var hide = o.hid || o.behind;
      it.dot.classList.toggle("is-hid", hide);
      it.chip.classList.toggle("is-hid", hide || !it.on);
      it.dot.style.left = o.x + "%";
      it.dot.style.top = o.y + "%";
      if (!it.on || hide) { it.path.setAttribute("d", ""); continue; }

      var cw = (it.chip.offsetWidth / w) * 100 + 2;
      var lx = clamp(o.x + p.dir[0] * off, 6, 94);
      var ly = clamp(o.y + p.dir[1] * off, 10, 88);
      var sgn = (o.x > lx) ? 1 : -1;
      if (sgn === 1) lx = Math.max(lx, cw);
      else lx = Math.min(lx, 100 - cw);
      list.push({ it: it, ax: o.x, ay: o.y, lx: lx, ly: ly, sgn: sgn,
                  hh: (it.chip.offsetHeight / h) * 50 });
    }

    /* keep labels from stacking on top of each other */
    [1, -1].forEach(function (side) {
      var g = list.filter(function (x) { return x.sgn === side; })
                  .sort(function (a, b) { return a.ly - b.ly; });
      var prev = -999, k;
      for (k = 0; k < g.length; k++) {
        if (g[k].ly - g[k].hh < prev + gap) g[k].ly = prev + gap + g[k].hh;
        prev = g[k].ly + g[k].hh;
      }
      for (k = g.length - 1; k >= 0; k--) {
        var over = (g[k].ly + g[k].hh) - 97;
        if (over > 0) g[k].ly -= over;
        if (k > 0) {
          var top = g[k].ly - g[k].hh - gap;
          if (g[k - 1].ly + g[k - 1].hh > top) g[k - 1].ly = top - g[k - 1].hh;
        }
      }
    });

    for (var n = 0; n < list.length; n++) {
      var x = list[n], c = x.it;
      var ex = x.lx + x.sgn * (w < 620 ? 3.5 : 5);
      c.path.setAttribute("d",
        "M" + x.ax.toFixed(2) + " " + x.ay.toFixed(2) +
        "L" + ex.toFixed(2) + " " + x.ly.toFixed(2) +
        "L" + x.lx.toFixed(2) + " " + x.ly.toFixed(2));
      if (!c.drawn) {
        var px = Math.abs(x.ax - x.lx) * w / 100, py = Math.abs(x.ay - x.ly) * h / 100;
        c.path.style.setProperty("--len", (Math.sqrt(px * px + py * py) + 40) + "px");
      }
      c.chip.style.top = x.ly + "%";
      if (x.sgn === 1) { c.chip.style.left = "auto"; c.chip.style.right = (100 - x.lx) + "%"; }
      else { c.chip.style.right = "auto"; c.chip.style.left = x.lx + "%"; }
    }
  }

  /* tools */
  var btnAll = $("#btnAll"), btnSpin = $("#btnSpin");
  var narrow = function () { return window.matchMedia("(max-width:760px)").matches; };
  var tour = null, tourIdx = 0;

  function tourStep() {
    var p = D.parts[tourIdx % D.parts.length];
    tourIdx++;
    pinned = p.id;
    setView(FOCUS[p.id]);
    render();
  }
  function tourStop() {
    if (!tour) return;
    clearInterval(tour); tour = null;
    pinned = null; render();
  }
  function setBtn() {
    var on = showAll || !!tour;
    btnAll.classList.toggle("is-on", on);
    btnAll.querySelector("span").textContent = narrow()
      ? (tour ? "إيقاف الجولة" : "جولة على الأجزاء")
      : (showAll ? "إخفاء الأجزاء" : "اعرض كل الأجزاء");
  }
  setBtn();
  window.addEventListener("resize", setBtn);

  btnAll.addEventListener("click", function () {
    if (narrow()) {
      if (tour) { tourStop(); }
      else { tourIdx = 0; tourStep(); tour = setInterval(tourStep, 2900); }
    } else {
      showAll = !showAll;
      stage.classList.toggle("is-all", showAll);
      if (window.Truck3D.setSpin) {
        Truck3D.setSpin(showAll ? false : btnSpin.classList.contains("is-on"));
      }
      render();
    }
    setBtn();
  });
  btnSpin.classList.add("is-on");
  btnSpin.addEventListener("click", function () {
    var on = !btnSpin.classList.contains("is-on");
    btnSpin.classList.toggle("is-on", on);
    if (window.Truck3D.setSpin) Truck3D.setSpin(on);
  });

  function setView(v) {
    Array.prototype.forEach.call(document.querySelectorAll(".tool__views button"), function (x) {
      x.classList.toggle("is-on", x.dataset.view === v);
    });
    if (window.Truck3D.setView) Truck3D.setView(v);
  }
  Array.prototype.forEach.call(document.querySelectorAll(".tool__views button"), function (x) {
    x.addEventListener("click", function () { setView(x.dataset.view); });
  });

  stage.addEventListener("mouseenter", function () { if (Truck3D.setHover) Truck3D.setHover(true); });
  stage.addEventListener("mouseleave", function () { if (Truck3D.setHover) Truck3D.setHover(false); });
  stage.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".stage__tools")) return;
    if (pinned) { pinned = null; render(); }
  });

  /* boot 3D */
  var okStart = false;
  try {
    okStart = window.THREE && Truck3D.init({
      canvas: $("#scene"), stage: stage, onFrame: frame
    });
  } catch (e) { okStart = false; console.error(e); }

  if (okStart) {
    setTimeout(function () { $("#stageLoading").classList.add("is-off"); }, 420);
  } else {
    $("#stageLoading").style.display = "none";
    $("#stageErr").hidden = false;
  }
  }
})();
