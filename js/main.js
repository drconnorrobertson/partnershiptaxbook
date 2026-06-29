/* =========================================
   AE Tax Advisors Book Library
   books.aetaxadvisors.com -- Minimal JS
   ========================================= */

(function () {
  'use strict';

  // --- Mobile Navigation Toggle ---
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      nav.classList.toggle('active');
    });

    // Close nav when a link is clicked
    var navLinks = nav.querySelectorAll('.nav__link');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('active');
        nav.classList.remove('active');
      });
    });

    // Close nav on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
        navToggle.classList.remove('active');
        nav.classList.remove('active');
      }
    });
  }

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // --- Header Background on Scroll ---
  var header = document.querySelector('.header');
  if (header) {
    var updateHeader = function () {
      if (window.scrollY > 10) {
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.2)';
      } else {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.15)';
      }
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  // --- Set Active Nav Link ---
  var currentPath = window.location.pathname;
  var navAllLinks = document.querySelectorAll('.nav__link');
  navAllLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && !link.classList.contains('nav__link--cta')) {
      // Normalize paths for comparison
      var linkPath = href.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
      var pagePath = currentPath.replace(/\/index\.html$/, '/').replace(/\.html$/, '');

      if (linkPath === pagePath || (linkPath !== '/' && pagePath.startsWith(linkPath))) {
        link.classList.add('nav__link--active');
      }
    }
  });
})();
