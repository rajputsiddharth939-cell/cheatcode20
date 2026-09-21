/* =========================================================================
   CHEATCODE™ — script.js
   Vanilla JS only: launch countdown, scroll-reveal, signup form.
   ========================================================================= */

(function () {
  'use strict';

  /* -----------------------------------------------------------------
     1. Launch countdown — 11 October 2026, 00:00 IST
     Drives both the big cinematic countdown and the sticky bar.
  ----------------------------------------------------------------- */
  var LAUNCH_DATE = new Date('2026-10-11T00:00:00+05:30').getTime();

  var els = {
    days: document.querySelector('[data-cd-days]'),
    hours: document.querySelector('[data-cd-hours]'),
    minutes: document.querySelector('[data-cd-minutes]'),
    seconds: document.querySelector('[data-cd-seconds]'),
    stickyValue: document.querySelector('[data-sticky-value]'),
    stickyBar: document.querySelector('[data-sticky-countdown]')
  };

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function renderCountdown() {
    var now = Date.now();
    var diff = LAUNCH_DATE - now;

    if (diff <= 0) {
      if (els.days) els.days.textContent = '00';
      if (els.hours) els.hours.textContent = '00';
      if (els.minutes) els.minutes.textContent = '00';
      if (els.seconds) els.seconds.textContent = '00';
      if (els.stickyValue) els.stickyValue.textContent = "IT'S HERE";
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    if (els.days) els.days.textContent = pad(days);
    if (els.hours) els.hours.textContent = pad(hours);
    if (els.minutes) els.minutes.textContent = pad(minutes);
    if (els.seconds) els.seconds.textContent = pad(seconds);

    if (els.stickyValue) {
      els.stickyValue.textContent =
        pad(days) + 'D : ' + pad(hours) + 'H : ' + pad(minutes) + 'M : ' + pad(seconds) + 'S';
    }
  }

  renderCountdown();
  setInterval(renderCountdown, 1000);

  /* -----------------------------------------------------------------
     2. Scroll-reveal — one fade-up treatment, gently staggered
     within whichever section an element belongs to.
  ----------------------------------------------------------------- */
  var animatedEls = document.querySelectorAll('[data-animate]');

  animatedEls.forEach(function (el) {
    var parentGroup = el.closest('section, .marquee') || document.body;
    if (!parentGroup.__animateIndex) parentGroup.__animateIndex = 0;
    var delay = Math.min(parentGroup.__animateIndex * 70, 280);
    el.style.transitionDelay = delay + 'ms';
    parentGroup.__animateIndex += 1;
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    animatedEls.forEach(function (el) { observer.observe(el); });
  } else {
    animatedEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* -----------------------------------------------------------------
     3. Signup form — posts to the CHEATCODE Google Apps Script
     Web App. no-cors means the response body can't be read, so a
     resolved fetch (no network error) is treated as success.
  ----------------------------------------------------------------- */
  var SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbzX2i0JOw5HED9JnEOEs3gwDKZgEfpvRHN1b2VS6VYlFDJVBZDrlCwCBjTEKD8EuCVipg/exec';

  var form = document.getElementById('signup-form');
  var errorEl = document.getElementById('signup-error');
  var successEl = document.getElementById('signup-success');
  var submitBtn = document.getElementById('signup-submit');

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.hidden = true;
    errorEl.textContent = '';
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearError();

      var name = document.getElementById('field-name').value.trim();
      var email = document.getElementById('field-email').value.trim();
      var phone = document.getElementById('field-phone').value.trim();

      if (!name || !email || !phone) {
        showError('Fill in every field before you go.');
        return;
      }
      if (!isValidEmail(email)) {
        showError('That email doesn\u2019t look right.');
        return;
      }

      submitBtn.disabled = true;
      var originalLabel = submitBtn.querySelector('.btn__label');
      if (originalLabel) originalLabel.textContent = 'SENDING…';

      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ name: name, email: email, phone: phone })
      })
        .then(function () {
          form.hidden = true;
          if (successEl) successEl.hidden = false;
        })
        .catch(function () {
          submitBtn.disabled = false;
          if (originalLabel) originalLabel.textContent = 'KEEP ME POSTED';
          showError('Something went wrong. Try again in a moment.');
        });
    });
  }
})();
