// battwise carousel frame: header, counter, footer; ?s=N renders one slide, ?all previews all
  // Shared header/footer, and single-slide mode for rendering: slides.html?s=3  |  preview all: ?all
  const slides = [...document.querySelectorAll(".slide")];
  const total = slides.length;
  const markT = '<svg viewBox="190 126 300 396" aria-hidden="true"><defs><linearGradient id="bwID" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#1FD6B4"/><stop offset="1" stop-color="#B6F55A"/></linearGradient></defs><rect x="196" y="132" width="64" height="372" rx="32" fill="#EAF8F3"/><circle cx="340" cy="372" r="112" fill="none" stroke="url(#bwID)" stroke-width="64"/><polygon points="356,318 312,382 338,382 324,432 372,362 346,362" fill="#FFC933"/></svg>';
  slides.forEach((s, i) => {
    s.insertAdjacentHTML("afterbegin", `<div class="top"><div class="brand">${markT.replaceAll("bwID","bw"+i)}battwise</div><div class="count">${i + 1}/${total}</div></div>`);
    s.insertAdjacentHTML("beforeend", `<div class="foot"><span>@battwise.co</span>${i < total - 1 ? '<span class="swipe">Swipe</span>' : '<span style="color:var(--ink);display:flex;gap:12px;align-items:center">Follow for more <svg width=\"34\" height=\"44\" viewBox=\"310 316 64 118\" style=\"vertical-align:-6px\"><polygon points=\"356,318 312,382 338,382 324,432 372,362 346,362\" fill=\"#FFC933\"/></svg></span>'}</div>`);
  });
  const q = new URLSearchParams(location.search);
  if (q.has("all")) document.body.classList.add("all");
  else slides[(parseInt(q.get("s") || "1", 10) - 1)].classList.add("active");
