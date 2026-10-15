/* =====================================================================
   PORTAFOLIO PERSONAL — script.js
   ---------------------------------------------------------------------
   JavaScript vainilla (sin librerías). Funcionalidades:
     1. Cambio de tema claro/oscuro (se recuerda en el navegador)
     2. Menú hamburguesa para móviles
     3. Cabecera con fondo al hacer scroll + botón "volver arriba"
     4. Enlace activo del menú según la sección visible
     5. Animaciones de aparición al hacer scroll
     6. Filtro de proyectos por categoría
     7. Año automático en el footer
   ===================================================================== */
'use strict';

// Avisa al seguro del <head> de que el JavaScript cargó bien
window.__sitioListo = true;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initScrollEffects();
  initActiveLinks();
  initReveal();
  initProjectFilter();
  setCurrentYear();
  setAge();
});


/* ---------------------------------------------------------------------
   1. TEMA CLARO / OSCURO
   El tema inicial ya lo aplicó el script en línea del <head> (evita
   parpadeos). Aquí solo gestionamos el botón y guardamos la elección.
   --------------------------------------------------------------------- */
function initTheme() {
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');
  if (!button) return;

  const icon = button.querySelector('i');

  // Actualiza el icono y la etiqueta accesible según el tema actual
  const updateButton = (theme) => {
    const isDark = theme === 'dark';
    icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    button.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  };

  const applyTheme = (theme, save) => {
    root.setAttribute('data-theme', theme);
    updateButton(theme);
    if (save) {
      try { localStorage.setItem('theme', theme); } catch (e) { /* almacenamiento no disponible */ }
    }
  };

  updateButton(root.getAttribute('data-theme') || 'light');

  button.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  });

  // Si el usuario nunca eligió manualmente, seguimos el tema del sistema
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener?.('change', (event) => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) { /* nada */ }
    if (!saved) applyTheme(event.matches ? 'dark' : 'light', false);
  });
}


/* ---------------------------------------------------------------------
   2. MENÚ HAMBURGUESA (móvil / tablet)
   --------------------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const header = document.getElementById('header');
  if (!toggle || !menu) return;

  const openMenu = () => {
    menu.classList.add('is-open');
    header.classList.add('menu-active');
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    header.classList.remove('menu-active');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  };

  const isOpen = () => menu.classList.contains('is-open');

  // Abrir / cerrar con el botón
  toggle.addEventListener('click', () => (isOpen() ? closeMenu() : openMenu()));

  // Cerrar al elegir un enlace
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  // Cerrar con la tecla Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      closeMenu();
      toggle.focus();
    }
  });

  // Cerrar al tocar fuera del menú
  document.addEventListener('click', (event) => {
    if (isOpen() && !menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });

  // Si se agranda la ventana a tamaño escritorio, cerramos el menú
  window.matchMedia('(min-width: 961px)').addEventListener?.('change', (event) => {
    if (event.matches) closeMenu();
  });
}


/* ---------------------------------------------------------------------
   3. EFECTOS DE SCROLL: cabecera con fondo + botón "volver arriba"
   Usamos requestAnimationFrame para no recalcular en cada píxel.
   --------------------------------------------------------------------- */
function initScrollEffects() {
  const header = document.getElementById('header');
  const backToTop = document.getElementById('back-to-top');
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 10);
    backToTop?.classList.toggle('is-visible', y > 600);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update(); // estado inicial (por si la página carga ya desplazada)
}


/* ---------------------------------------------------------------------
   4. ENLACE ACTIVO DEL MENÚ
   Marca en el menú la sección que está en el centro de la pantalla.
   --------------------------------------------------------------------- */
function initActiveLinks() {
  const links = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('main section[id]');
  if (!('IntersectionObserver' in window) || !sections.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, {
    // Franja estrecha en el centro de la pantalla
    rootMargin: '-45% 0px -50% 0px',
  });

  sections.forEach((section) => observer.observe(section));
}


/* ---------------------------------------------------------------------
   5. ANIMACIONES AL HACER SCROLL
   Los elementos con la clase .reveal aparecen al entrar en pantalla.
   Para escalonar, usa style="--delay:.1s" en el HTML.
   --------------------------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');

  // Navegadores antiguos: mostramos todo directamente
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target); // se anima solo una vez
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach((el) => observer.observe(el));
}


/* ---------------------------------------------------------------------
   6. FILTRO DE PROYECTOS
   Los botones tienen data-filter="web" y las tarjetas
   data-category="web sistemas" (pueden tener varias categorías).
   --------------------------------------------------------------------- */
function initProjectFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  const emptyMsg = document.getElementById('projects-empty');
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      // Estado visual y accesible de los botones
      buttons.forEach((b) => {
        const active = b === button;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });

      // Mostrar u ocultar tarjetas
      let visibleCount = 0;
      cards.forEach((card) => {
        const categories = (card.dataset.category || '').split(' ');
        const show = filter === 'todos' || categories.includes(filter);
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visibleCount++;
          // Pequeña animación de entrada al filtrar
          card.classList.add('is-visible');
          card.animate?.(
            [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
            { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' }
          );
        }
      });

      if (emptyMsg) emptyMsg.hidden = visibleCount > 0;
    });
  });
}


/* ---------------------------------------------------------------------
   7. AÑO ACTUAL EN EL FOOTER
   --------------------------------------------------------------------- */
function setCurrentYear() {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
}


/* ---------------------------------------------------------------------
   8. EDAD AUTOMÁTICA
   Calcula la edad a partir de data-birthday (AAAA-MM-DD), así se
   actualiza sola cada 17 de marzo sin tocar el código.
   --------------------------------------------------------------------- */
function setAge() {
  const source = document.getElementById('age');
  if (!source || !source.dataset.birthday) return;

  const [y, m, d] = source.dataset.birthday.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  const birthdayPassed =
    today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d);
  if (!birthdayPassed) age--;

  source.textContent = age;
  document.querySelectorAll('[data-age]').forEach((el) => (el.textContent = age));
}
