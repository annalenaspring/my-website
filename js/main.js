/* Anna Lena Spring — main.js */
(function(){
  "use strict";
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover:none), (pointer:coarse)').matches;

  /* ---------------- Loader ---------------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => loader.classList.add('done'), 1400);
    setTimeout(() => { loader.style.display = 'none'; }, 2100);
  });

  /* ---------------- Year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Theme toggle ---------------- */
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('als-theme');
  if (stored === 'dark') root.classList.add('dark');
  else if (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');

  toggle?.addEventListener('click', () => {
    root.classList.toggle('dark');
    localStorage.setItem('als-theme', root.classList.contains('dark') ? 'dark' : 'light');
  });

  /* ---------------- Custom cursor ---------------- */
  if (!isTouch) {
    const cursor = document.getElementById('cursor');
    let mx = window.innerWidth/2, my = window.innerHeight/2, cx = mx, cy = my;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursor.classList.remove('hidden'); });
    document.addEventListener('mouseleave', () => cursor.classList.add('hidden'));

    function raf(){
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(raf);
    }
    raf();

    document.querySelectorAll('[data-cursor="link"], .work-item').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('link'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('link'));
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => obs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------------- Hero parallax (mouse) + leitfigur float ---------------- */
  const heroFigure = document.querySelector('.hero-figure');
  if (heroFigure && !isTouch && !reduceMotion) {
    window.addEventListener('mousemove', (e) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * 18;
      const dy = (e.clientY / window.innerHeight - 0.5) * 18;
      heroFigure.style.transform = `translate(${dx}px, ${dy}px)`;
    });
  }

  /* Gentle idle float via GSAP if available */
  if (window.gsap) {
    gsap.to('.hero-figure', { y: '+=10', duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray('main > section').forEach((sec, i) => {
        if (i === 0) return;
        gsap.fromTo(sec, { opacity: 1 }, {
          opacity: 1,
          scrollTrigger: { trigger: sec, start: 'top 85%' }
        });
      });
    }
  }

  /* ---------------- Work item hover preview ---------------- */
  const preview = document.getElementById('work-preview');
  const previewImg = document.getElementById('work-preview-img');
  const placeholderColors = {
    glitzert: '%2387A748', ultimo: '%23AACCBA', sauna: '%23DC6F4B', sweetnothing: '%2387A748', lu: '%23AACCBA'
  };
  if (preview && !isTouch) {
    document.querySelectorAll('.work-item').forEach(item => {
      const key = item.dataset.project;
      const color = placeholderColors[key] || '%23AACCBA';
      const svg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='160'><rect width='100%' height='100%' fill='${color}'/></svg>`;
      item.addEventListener('mouseenter', () => {
        previewImg.src = svg;
        preview.classList.add('show');
      });
      item.addEventListener('mousemove', (e) => {
        preview.style.left = e.clientX + 'px';
        preview.style.top = e.clientY + 'px';
      });
      item.addEventListener('mouseleave', () => preview.classList.remove('show'));
    });
  }

  /* ---------------- Project modal ---------------- */
  const projectData = {
    glitzert: { year: '2026', title: 'Was glitzert', role: 'Regie & Animation (mit Lara Perren)', desc: 'Aktuelle Regiearbeit von Anna Lena Spring und Lara Perren.', link: 'https://www.swissfilms.ch/de/movie/was-glitzert/1B608203A31848A9AAB4EEFDE2471DBB' },
    ultimo: { year: '2025', title: 'último round', role: 'Animation', desc: 'Animationsarbeit für den Film von Eva Jane Wottreng.', link: 'https://www.swissfilms.ch/de/movie/ultimo-round/2575A0D1169F4D0C9242D5A46BC53F0F' },
    sauna: { year: '2021', title: 'Sauna', role: 'Regie, Drehbuch, Character Design, Compositing', desc: 'Abschlussfilm an der HSLU — entstanden mit Lara Perren.', link: 'https://www.swissfilms.ch/de/movie/sauna/EDA97B6C3ED146F6A2D856E7691D6A71' },
    sweetnothing: { year: '2021', title: 'Sweet Nothing', role: 'Animation', desc: 'Animationsarbeit für den Film von Marie Kenov & Joana Fischer.', link: 'https://www.swissfilms.ch/de/movie/sweet-nothing/4F694EB9F5BB43A8B78C99136BBE5326' },
    lu: { year: '2020', title: 'Lu', role: 'Regie, Drehbuch, Sound Design', desc: 'Gemeinsam mit Lara Perren und Luisa Zürcher realisiert.', link: 'https://www.swissfilms.ch/de/movie/lu/22A7D74058EC4770BBB04B533B249D2E' }
  };

  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('project-modal-close');
  document.querySelectorAll('.work-item').forEach(item => {
    item.addEventListener('click', () => {
      const data = projectData[item.dataset.project];
      if (!data) return;
      document.getElementById('modal-year').textContent = data.year;
      document.getElementById('modal-title').textContent = data.title;
      document.getElementById('modal-role').textContent = data.role;
      document.getElementById('modal-desc').textContent = data.desc;
      document.getElementById('modal-link').href = data.link;
      modal.classList.add('open');
    });
  });
  modalClose?.addEventListener('click', () => modal.classList.remove('open'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.classList.remove('open'); });

  /* ---------------- Mobile nav burger ---------------- */
  const burger = document.getElementById('nav-burger');
  const nav = document.querySelector('.main-nav');
  burger?.addEventListener('click', () => {
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    nav.style.position = 'fixed';
    nav.style.top = '70px';
    nav.style.right = '1.25rem';
    nav.style.flexDirection = 'column';
    nav.style.background = 'var(--bg-alt)';
    nav.style.padding = '1.5rem';
    nav.style.borderRadius = '8px';
    nav.style.boxShadow = '0 10px 30px rgba(0,0,0,.15)';
  });

})();
