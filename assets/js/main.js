const navToggle = document.querySelector('.site-header__toggle');
const nav = document.querySelector('.site-header__nav');
const body = document.body;
const header = document.querySelector('.site-header');
const navigationLinks = document.querySelectorAll('.nav-link');
const revealTargets = document.querySelectorAll('[data-reveal]');
const currentYearEl = document.getElementById('current-year');
const heroSection = document.querySelector('.hero');
const parallaxItems = document.querySelectorAll('[data-parallax]');
const parallaxChildren = document.querySelectorAll('[data-parallax-child]');
const prefersReducedMotion = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false };
let shouldReduceMotion = prefersReducedMotion.matches;

// Smooth scrolling for in-page navigation
const handleSmoothScroll = (event) => {
  const targetSelector = event.currentTarget.getAttribute('href');
  if (!targetSelector || !targetSelector.startsWith('#')) return;

  const targetEl = document.querySelector(targetSelector);
  if (!targetEl) return;

  event.preventDefault();
  targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (nav.classList.contains('is-open')) {
    toggleMenu(false);
  }
};

navigationLinks.forEach((link) => {
  link.addEventListener('click', handleSmoothScroll);
});

// Mobile navigation toggle
const toggleMenu = (forceState) => {
  if (!nav) return;
  const shouldOpen =
    typeof forceState === 'boolean' ? forceState : !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', shouldOpen);
  navToggle?.setAttribute('aria-expanded', String(shouldOpen));
  body.classList.toggle('is-menu-open', shouldOpen);
};

if (navToggle && nav) {
  navToggle.addEventListener('click', () => toggleMenu());

  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!nav.classList.contains('is-open')) return;
    const isInsideNav = nav.contains(event.target);
    const isToggle = navToggle.contains(event.target);
    if (!isInsideNav && !isToggle) {
      toggleMenu(false);
    }
  });
}

// Scroll reveal animations via IntersectionObserver
const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
  }
);

revealTargets.forEach((target) => observer.observe(target));

// Scroll interactions: header dynamics & hero parallax
let lastScrollY = window.scrollY;
let latestScrollY = window.scrollY;
let ticking = false;
const SCROLL_THRESHOLD = 8;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function resetParallax() {
  [...parallaxItems, ...parallaxChildren].forEach((element) => {
    element.style.transform = '';
  });
}

const handleMotionPreferenceChange = (event) => {
  shouldReduceMotion = event.matches;
  if (shouldReduceMotion) {
    resetParallax();
  }
};

if (typeof prefersReducedMotion.addEventListener === 'function') {
  prefersReducedMotion.addEventListener('change', handleMotionPreferenceChange);
} else if (typeof prefersReducedMotion.addListener === 'function') {
  prefersReducedMotion.addListener(handleMotionPreferenceChange);
}

const updateParallax = () => {
  if (shouldReduceMotion || !heroSection) return;
  const heroRect = heroSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const range = heroRect.height + viewportHeight;
  const progress = clamp((viewportHeight - heroRect.top) / range, 0, 1);
  const baseOffset = (progress - 0.5) * 80;

  parallaxItems.forEach((item) => {
    const speed = parseFloat(item.dataset.parallaxSpeed || '0.25');
    const translateY = baseOffset * speed;
    item.style.transform = `translateY(${translateY}px)`;
  });

  parallaxChildren.forEach((item, index) => {
    const speed = parseFloat(item.dataset.parallaxSpeed || '0.35');
    const stagger = index * 4;
    const translateY = baseOffset * speed + stagger;
    item.style.transform = `translateY(${translateY}px)`;
  });
};

const updateHeaderState = (currentScrollY) => {
  if (!header) return;

  const heroHeight = heroSection?.offsetHeight || window.innerHeight;
  if (currentScrollY > heroHeight * 0.35) {
    header.classList.add('is-condensed');
  } else {
    header.classList.remove('is-condensed');
  }

  if (currentScrollY <= 0) {
    header.classList.remove('is-hidden');
    lastScrollY = 0;
    return;
  }

  if (Math.abs(currentScrollY - lastScrollY) < SCROLL_THRESHOLD) {
    return;
  }

  if (currentScrollY > lastScrollY && currentScrollY > header.offsetHeight) {
    header.classList.add('is-hidden');
  } else {
    header.classList.remove('is-hidden');
  }
  lastScrollY = currentScrollY;
};

const onScrollUpdate = () => {
  updateHeaderState(latestScrollY);
  updateParallax();
  ticking = false;
};

const handleScroll = () => {
  latestScrollY = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(onScrollUpdate);
    ticking = true;
  }
};

window.addEventListener('scroll', handleScroll, { passive: true });
onScrollUpdate();

// Set current year in footer
if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear();
}
