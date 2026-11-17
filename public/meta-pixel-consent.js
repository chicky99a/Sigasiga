(function () {
  'use strict';
  var PIXEL_ID = '3149020191936853';
  var KEY = 'sigasiga_meta_marketing_consent';
  if (window.__sigaMetaConsentInitialized) return;
  window.__sigaMetaConsentInitialized = true;

  function readConsent() {
    try { return localStorage.getItem(KEY); } catch (_) { return null; }
  }
  function saveConsent(value) {
    try { localStorage.setItem(KEY, value); } catch (_) {}
  }
  function loadPixel() {
    if (window.__sigaMetaPixelLoaded) return;
    window.__sigaMetaPixelLoaded = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
  }
  function makeButton(label, onClick) {
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = 'font:inherit;border:1px solid #222;border-radius:6px;padding:7px 12px;cursor:pointer;background:#fff;color:#111;';
    button.addEventListener('click', onClick);
    return button;
  }
  function showChoices() {
    if (document.getElementById('siga-cookie-choices')) return;
    var panel = document.createElement('aside');
    panel.id = 'siga-cookie-choices';
    panel.setAttribute('aria-label', 'Marketing cookies preferences');
    panel.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;max-width:490px;z-index:2147483647;background:#fff;color:#111;border:1px solid #333;border-radius:10px;padding:16px;box-shadow:0 5px 22px #0003;font:14px/1.5 Arial,sans-serif;';
    var text = document.createElement('p');
    text.style.cssText = 'margin:0 0 12px;';
    text.textContent = 'May we use Meta Pixel to measure visits and improve our advertising? This is optional. You can change your choice anytime.';
    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;';
    actions.appendChild(makeButton('Reject', function () {
      saveConsent('rejected'); panel.remove();
    }));
    actions.appendChild(makeButton('Accept', function () {
      saveConsent('accepted'); panel.remove(); loadPixel();
    }));
    panel.appendChild(text);
    panel.appendChild(actions);
    document.body.appendChild(panel);
  }
  function addPreferencesControl() {
    if (document.getElementById('siga-cookie-preferences')) return;
    var control = document.createElement('button');
    control.id = 'siga-cookie-preferences';
    control.type = 'button';
    control.textContent = 'Cookie settings';
    control.setAttribute('aria-label', 'Change marketing cookie preferences');
    control.style.cssText = 'position:fixed;bottom:5px;right:8px;z-index:2147483646;border:0;background:#fff;color:#333;padding:3px 5px;font:11px Arial,sans-serif;text-decoration:underline;cursor:pointer;';
    control.addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (_) {}
      // An already loaded pixel cannot be unloaded without reloading the page.
      location.reload();
    });
    document.body.appendChild(control);
  }
  function start() {
    addPreferencesControl();
    if (readConsent() === 'accepted') loadPixel();
    else if (readConsent() !== 'rejected') showChoices();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
