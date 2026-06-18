/* Anna Lena Spring — Portfolio (Multi-Page) */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader && loader.classList.add('done'), 600);
  });
  // safety fallback in case 'load' already fired or is slow
  setTimeout(() => loader && loader.classList.add('done'), 2200);

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const THEME_KEY = 'als-theme';

  function applyTheme(t) {
    if (t === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = root.classList.contains('dark');
      applyTheme(isDark ? 'light' : 'dark');
      localStorage.setItem(THEME_KEY, isDark ? 'light' : 'dark');
    });
  }

  /* ---------- Custom cursor ---------- */
  const cursor = document.querySelector('.cursor');
  if (cursor && matchMedia('(hover: hover)').matches) {
    let mx = innerWidth / 2, my = innerHeight / 2;
    let cx = mx, cy = my;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('mouseleave', () => cursor.classList.add('hidden'));
    document.addEventListener('mouseenter', () => cursor.classList.remove('hidden'));
    (function loop() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('[data-cursor="link"], a, button, .work-item, .ceramic-viewer, .home-figure').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('link'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('link'));
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const obs = new IntersectionObserver(entries => {
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

  /* ---------- Mobile nav burger ---------- */
  const burger = document.querySelector('.nav-burger');
  const mainNav = document.querySelector('.main-nav');
  if (burger && mainNav) {
    burger.addEventListener('click', () => {
      mainNav.classList.toggle('open');
    });
  }

  /* ---------- GSAP idle float (if available) ---------- */
  if (window.gsap) {
    gsap.to('.home-figure', {
      y: 10,
      duration: 2.4,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });
  }

  /* ---------- Home figure drag (light parallax tilt) ---------- */
  const homeFigure = document.getElementById('home-figure');
  if (homeFigure) {
    let dragging = false, startX = 0, rotation = 0;
    const onDown = (x) => { dragging = true; startX = x; homeFigure.style.transition = 'none'; };
    const onMove = (x) => {
      if (!dragging) return;
      const delta = x - startX;
      rotation = Math.max(-18, Math.min(18, delta / 4));
      homeFigure.style.transform = `rotate(${rotation}deg)`;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      homeFigure.style.transition = 'transform .6s cubic-bezier(.16,.84,.44,1)';
      homeFigure.style.transform = 'rotate(0deg)';
    };
    homeFigure.addEventListener('mousedown', e => onDown(e.clientX));
    window.addEventListener('mousemove', e => onMove(e.clientX));
    window.addEventListener('mouseup', onUp);
    homeFigure.addEventListener('touchstart', e => onDown(e.touches[0].clientX), { passive: true });
    homeFigure.addEventListener('touchmove', e => onMove(e.touches[0].clientX), { passive: true });
    homeFigure.addEventListener('touchend', onUp);
  }

  /* ---------- Ceramic pseudo-3D turntable viewer ---------- */
  document.querySelectorAll('.ceramic-viewer[data-front]').forEach(viewer => {
    const img = viewer.querySelector('.ceramic-img');
    const front = viewer.getAttribute('data-front');
    const side = viewer.getAttribute('data-side');
    if (!img || !front || !side) return;

    let dragging = false, startX = 0, lastDelta = 0;
    const THRESHOLD = 60; // px to fully cross to the side image

    function setFrame(t) {
      // t: -1 (side from left) .. 0 (front) .. 1 (side from right)
      const abs = Math.min(1, Math.abs(t));
      img.style.opacity = String(1 - abs * 0.55);
      img.src = abs > 0.5 ? side : front;
      img.style.transform = `scaleX(${t < 0 ? -1 : 1}) rotateY(${t * 25}deg)`;
    }

    const onDown = (x) => {
      dragging = true; startX = x;
      viewer.style.cursor = 'grabbing';
      document.querySelector('.cursor')?.classList.add('drag');
    };
    const onMove = (x) => {
      if (!dragging) return;
      const delta = x - startX;
      lastDelta = delta;
      setFrame(Math.max(-1, Math.min(1, delta / THRESHOLD)));
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      viewer.style.cursor = 'grab';
      document.querySelector('.cursor')?.classList.remove('drag');
      setFrame(0);
    };

    viewer.addEventListener('mousedown', e => onDown(e.clientX));
    window.addEventListener('mousemove', e => onMove(e.clientX));
    window.addEventListener('mouseup', onUp);
    viewer.addEventListener('touchstart', e => onDown(e.touches[0].clientX), { passive: true });
    viewer.addEventListener('touchmove', e => onMove(e.touches[0].clientX), { passive: true });
    viewer.addEventListener('touchend', onUp);
  });

  /* ---------- Work list: hover preview + modal ---------- */
  const projectData = {
    glitzert: {
      year: '2026', title: 'Was glitzert', role: 'Co-Regie mit Lara Perren',
      desc: '10\'. Produktion: Hélium Films / Clémence Pun. Co-Produktion: RTS Radio Télévision Suisse.',
      link: 'https://aggregat-studio.ch/was-glitzert',
      trailer: 'https://vimeo.com/1185420476',
      poster: '/assets/img/work/glitzert_poster_night.jpg'
    },
    roadmovie: {
      year: '2023', title: 'Roadmovie — Trailer', role: 'Co-Regie',
      desc: 'Trailer zum Roadmovie, entstanden mit Aggregat Studio.',
      link: 'https://aggregat-studio.ch/roadmovie',
      trailer: 'https://www.youtube.com/watch?v=exXsSEMbRHs',
      poster: '/assets/img/work/roadmovie_still.jpg'
    },
    faderchleid: {
      year: '2022', title: 'Faderchleid — Troubas Kater', role: 'Co-Regie',
      desc: 'Musikvideo für Troubas Kater, entstanden mit Aggregat Studio.',
      link: 'https://aggregat-studio.ch/faderchleid',
      poster: '/assets/img/work/faderchleid_still.jpg'
    },
    animadvent: {
      year: '2021', title: 'Animadvent', role: 'Co-Regie',
      desc: 'Animationsprojekt, entstanden mit Aggregat Studio.',
      link: 'https://aggregat-studio.ch/animadvent'
    },
    sauna: {
      year: '2021', title: 'Sauna', role: 'Co-Regie mit Lara Perren, Character Design, Compositing',
      desc: '4\'. Produktion: HSLU — Design Film Kunst, Co-Produktion: SRF. Ausgezeichnet u.a. mit dem New Swiss Talent Award (Fantoche 2021) und dem Prix Röstigraben (Jugendfilmtage Zürich 2023).',
      link: 'https://aggregat-studio.ch/sauna',
      trailer: 'https://www.youtube.com/watch?v=VaTAhH7iKEw',
      poster: '/assets/img/work/sauna_poster.jpg'
    },
    lu: {
      year: '2020', title: 'Lu', role: 'Co-Regie mit Lara Perren & Luisa Zürcher',
      desc: '1\'. Produktion: HSLU — Design Film Kunst. Gezeigt u.a. an Fantoche, den Solothurner und Zuger Filmtagen.',
      link: 'https://aggregat-studio.ch/lu',
      trailer: 'https://www.youtube.com/watch?v=eWSPBKh0-28',
      poster: '/assets/img/work/lu_still.jpg'
    }
  };

  const previewColors = {
    glitzert: '#DC6F4B', roadmovie: '#87A748', faderchleid: '#AACCBA',
    animadvent: '#D9E6E1', sauna: '#E9F0DD', lu: '#181614'
  };

  function placeholderSVG(color) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='160'><rect width='100%' height='100%' fill='${color}'/></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  const workItems = document.querySelectorAll('.work-item');
  const preview = document.querySelector('.work-preview');
  const previewImg = preview ? preview.querySelector('img') : null;

  if (workItems.length && preview && previewImg) {
    workItems.forEach(item => {
      const key = item.getAttribute('data-project');
      const projInfo = projectData[key];
      item.addEventListener('mouseenter', () => {
        previewImg.src = (projInfo && projInfo.poster) ? projInfo.poster : placeholderSVG(previewColors[key] || '#AACCBA');
        preview.classList.add('show');
      });
      item.addEventListener('mousemove', e => {
        preview.style.left = e.clientX + 'px';
        preview.style.top = e.clientY + 'px';
      });
      item.addEventListener('mouseleave', () => preview.classList.remove('show'));
    });
  }

  const modal = document.getElementById('project-modal');
  if (modal) {
    const modalYear = document.getElementById('modal-year');
    const modalTitle = document.getElementById('modal-title');
    const modalRole = document.getElementById('modal-role');
    const modalDesc = document.getElementById('modal-desc');
    const modalLink = document.getElementById('modal-link');
    const modalTrailer = document.getElementById('modal-trailer');
    const modalPoster = document.getElementById('modal-poster');
    const closeBtn = document.getElementById('project-modal-close');

    workItems.forEach(item => {
      item.addEventListener('click', () => {
        const key = item.getAttribute('data-project');
        const data = projectData[key];
        if (!data) return;
        if (modalPoster) {
          if (data.poster) {
            modalPoster.src = data.poster;
            modalPoster.alt = data.title;
            modalPoster.style.display = '';
          } else {
            modalPoster.style.display = 'none';
          }
        }
        if (modalYear) modalYear.textContent = data.year;
        if (modalTitle) modalTitle.textContent = data.title;
        if (modalRole) modalRole.textContent = data.role;
        if (modalDesc) modalDesc.textContent = data.desc;
        if (modalLink) modalLink.href = data.link;
        if (modalTrailer) {
          if (data.trailer) {
            modalTrailer.href = data.trailer;
            modalTrailer.style.display = '';
          } else {
            modalTrailer.style.display = 'none';
          }
        }
        modal.classList.add('open');
      });
    });
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') modal.classList.remove('open');
    });
  }

});
