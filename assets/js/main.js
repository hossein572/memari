/* ═══════════════════════════════════════════════════════════
   ARTIMA STUDIO — interactions
   ═══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  document.documentElement.classList.add('js');
  const faDigits = s => String(s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]);
  const faNum = n => faDigits(n);
  const faPad = n => faDigits(String(n).padStart(2, '0'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  /* ── Word splitting for headline reveals (حفظ <br>) ── */
  $$('[data-split]').forEach(el => {
    let idx = 0;
    const wrap = text => text.trim().split(/\s+/).filter(Boolean).map(w => {
      const d = `style="transition-delay:${Math.min(idx++ * 50, 700)}ms"`;
      return `<span class="w"><span class="wi" ${d}>${w}</span></span>`;
    }).join(' ');
    el.innerHTML = [...el.childNodes].map(node =>
      node.nodeType === 3 ? wrap(node.textContent) : node.outerHTML
    ).join(' ');
  });

  /* ── Preloader ── */
  const loader = $('#loader');
  if (loader && !reduced) {
    const count = $('#loaderCount');
    const t0 = performance.now();
    const DUR = 1000;
    document.documentElement.classList.add('is-loading');
    (function tick(now) {
      const p = Math.min((now - t0) / DUR, 1);
      count.textContent = String(Math.round(p * 100)).padStart(2, '0');
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(() => loader.classList.add('is-done'), 150);
    })(t0);
  } else if (loader) loader.classList.add('is-done');

  /* ── Header: hide on scroll down, surface on scroll up ── */
  const header = $('#siteHeader');
  let lastY = scrollY;
  const onScrollHeader = () => {
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    const canHide = document.body.classList.contains('page-home');
    if (!menuOpen) {
      if (canHide && y > lastY && y > 320) header.classList.add('is-hidden');
      else header.classList.remove('is-hidden');
    }
    lastY = y;
  };

  /* ── Mobile menu ── */
  const burger = $('#burger');
  const menu = $('#mobileMenu');
  let menuOpen = false;
  const setMenu = open => {
    menuOpen = open;
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('is-locked', open);
    if (open) header.classList.remove('is-hidden');
  };
  burger?.addEventListener('click', () => setMenu(!menuOpen));
  $$('.mm-link', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ── Scroll-linked: header + parallax ── */
  const pxItems = $$('[data-parallax]').map(el => ({ el, speed: parseFloat(el.dataset.parallax) || .1 }));
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScrollHeader();
      if (!reduced) {
        const vh = innerHeight;
        pxItems.forEach(({ el, speed }) => {
          const r = (el.parentElement || el).getBoundingClientRect();
          if (r.bottom < -100 || r.top > vh + 100) return;
          const delta = (r.top + r.height / 2 - vh / 2) * speed;
          el.style.transform = `translateY(${(-delta).toFixed(1)}px)`;
        });
      }
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Reveal on view ── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal], [data-split], .steps-line').forEach(el => io.observe(el));

  /* ── Counters ── */
  const cio = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      cio.unobserve(el);
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      if (reduced) { el.textContent = faNum(target); return; }
      const t0 = performance.now(), DUR = 1700;
      (function step(now) {
        const p = Math.min((now - t0) / DUR, 1);
        el.textContent = faNum(Math.round(easeOut(p) * target));
        if (p < 1) requestAnimationFrame(step);
        else if (suffix) el.innerHTML = `${faNum(target)}<span class="suffix">${suffix}</span>`;
      })(t0);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ── Services: floating image preview ── */
  const svcList = $('#svcList');
  const preview = $('#svcPreview');
  if (svcList && preview && finePointer) {
    const pImg = $('img', preview);
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null, active = false;
    const loop = () => {
      cx += (tx - cx) * .12;
      cy += (ty - cy) * .12;
      preview.style.left = cx + 'px';
      preview.style.top = cy + 'px';
      raf = active ? requestAnimationFrame(loop) : null;
    };
    svcList.addEventListener('mousemove', e => {
      tx = Math.min(e.clientX + 36, innerWidth - preview.offsetWidth - 16);
      ty = e.clientY - 110;
      if (!raf && active) raf = requestAnimationFrame(loop);
    });
    $$('.svc-row', svcList).forEach(row => {
      row.addEventListener('mouseenter', e => {
        pImg.src = row.dataset.img;
        tx = Math.min(e.clientX + 36, innerWidth - preview.offsetWidth - 16);
        ty = e.clientY - 110;
        if (!active) {
          active = true; cx = tx; cy = ty;
          preview.classList.add('is-on');
          raf = requestAnimationFrame(loop);
        }
      });
    });
    svcList.addEventListener('mouseleave', () => {
      active = false;
      preview.classList.remove('is-on');
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    });
  }

  /* ── Testimonials slider ── */
  const tsl = $('#tsl');
  if (tsl) {
    const slides = $$('.tsl-slide', tsl);
    const idxEl = $('#tslIndex');
    let i = 0, timer = null;
    const go = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      idxEl.textContent = `${faPad(i + 1)} / ${faPad(slides.length)}`;
    };
    const auto = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 7000); };
    $('#tslNext').addEventListener('click', () => { go(i + 1); auto(); });
    $('#tslPrev').addEventListener('click', () => { go(i - 1); auto(); });
    tsl.addEventListener('mouseenter', () => clearInterval(timer));
    tsl.addEventListener('mouseleave', auto);
    let sx = null;
    tsl.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    tsl.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 48) { go(i + (dx < 0 ? 1 : -1)); auto(); }
      sx = null;
    }, { passive: true });
    auto();
  }

  /* ── Magnetic buttons ── */
  if (finePointer && !reduced) {
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * .18}px, ${y * .28}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
        btn.style.transform = '';
        setTimeout(() => btn.style.transition = '', 500);
      });
    });
  }

  /* ── Team portrait fallback (monogram tile) ── */
  $$('.member-photo img').forEach(img => {
    const swap = () => {
      const d = document.createElement('div');
      d.className = 'ph-fallback';
      d.setAttribute('aria-hidden', 'true');
      d.textContent = img.dataset.initials || '•';
      img.replaceWith(d);
    };
    img.addEventListener('error', swap);
    if (img.complete && img.naturalWidth === 0) swap();
  });

  /* ═══ PROJECTS PAGE ═══ */
  const archive = $('.proj-archive');
  if (archive) {
    const cards = $$('.proj-card', archive);
    const buttons = $$('.filter-btn');

    /* counts */
    buttons.forEach(btn => {
      const f = btn.dataset.filter;
      const n = f === 'all' ? cards.length : cards.filter(c => c.dataset.cat === f).length;
      const sup = document.createElement('sup');
      sup.textContent = faNum(n);
      btn.append(sup);
    });

    /* filtering */
    buttons.forEach(btn => btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.toggle('is-active', b === btn));
      const f = btn.dataset.filter;
      cards.forEach(card => {
        const show = f === 'all' || card.dataset.cat === f;
        card.classList.remove('filter-in', 'filter-out');
        if (show) {
          card.classList.remove('is-hidden');
          void card.offsetWidth;
          card.classList.add('filter-in');
        } else {
          card.classList.add('filter-out');
          setTimeout(() => card.classList.add('is-hidden'), reduced ? 0 : 380);
        }
      });
      const countEl = $('.filters-count');
      if (countEl) {
        const n = f === 'all' ? cards.length : cards.filter(c => c.dataset.cat === f).length;
        countEl.textContent = `${faNum(n)} پروژه`;
      }
    }));

    /* modal */
    const modal = $('#projModal');
    if (modal) {
      const mImg = $('.pm-media img', modal);
      const mTitle = $('.pm-title', modal);
      const mLoc = $('.pm-loc', modal);
      const mDesc = $('.pm-desc', modal);
      const mCat = $('#pmCat'); const mYear = $('#pmYear');
      const mArea = $('#pmArea'); const mStyle = $('#pmStyle');
      cards.forEach(card => card.addEventListener('click', e => {
        e.preventDefault();
        const d = card.dataset;
        mImg.src = $('.proj-media img', card).src;
        mImg.alt = d.title;
        mTitle.textContent = d.title;
        mLoc.textContent = d.loc;
        mDesc.textContent = d.desc;
        mCat.textContent = d.catLabel;
        mYear.textContent = d.year;
        mArea.textContent = d.area;
        mStyle.textContent = d.style;
        modal.showModal();
      }));
      $('.pm-close', modal).addEventListener('click', () => modal.close());
      modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
    }
  }

  /* ═══ CONTACT FORM ═══ */
  const form = $('#consultForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const btn = $('.form-submit .btn', form);
      const label = $('.btn-label', btn);
      btn.disabled = true;
      label.textContent = 'در حال ارسال…';
      setTimeout(() => {
        form.style.display = 'none';
        const ok = $('#formSuccess');
        ok.classList.add('is-on');
        ok.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      }, 900);
    });
  }
})();
