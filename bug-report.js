(function() {
  'use strict';

  var BUG_API = 'https://your-server.com/api/bugs';

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getBrowserData() {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: { width: screen.width, height: screen.height, colorDepth: screen.colorDepth },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      timestamp: new Date().toISOString(),
      cookies: document.cookie
    };
  }

  function captureScreenshot() {
    return new Promise(function(resolve) {
      try {
        var canvas = document.createElement('canvas');
        var scale = 2;
        canvas.width = window.innerWidth * scale;
        canvas.height = window.innerHeight * scale;
        var ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);

        ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var elements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, td, th, a, button, input, textarea, label');
        var y = 20;
        var seen = {};

        elements.forEach(function(el) {
          var rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          if (rect.top < 0 || rect.top > window.innerHeight) return;
          if (seen[el.tagName + rect.top]) return;
          seen[el.tagName + rect.top] = true;

          var text = el.textContent.trim();
          if (!text || text.length > 200) return;

          var color = window.getComputedStyle(el).color;
          ctx.fillStyle = '#333333';
          try { ctx.fillStyle = color; } catch(e) {}

          ctx.font = '14px ' + window.getComputedStyle(el).fontFamily;
          var maxWidth = window.innerWidth - 40;
          var textWidth = Math.min(ctx.measureText(text).width + 10, maxWidth);

          ctx.fillRect(20, y, textWidth, 24);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(text.slice(0, 80), 25, y + 16);
          y += 30;

          if (y > canvas.height - 60) {
            canvas.height += 200;
          }
        });

        var red = document.querySelectorAll('[style*="red"], [style*="#f00"], .error, .error-message, .alert-danger');
        red.forEach(function(el) {
          var rect = el.getBoundingClientRect();
          if (rect.width === 0) return;
          ctx.fillStyle = 'rgba(255,0,0,0.15)';
          ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
        });

        resolve(canvas.toDataURL('image/png').split(',')[1]);
      } catch(e) {
        resolve(null);
      }
    });
  }

  function sendBug(description, screenshot, browserData) {
    var payload = {
      description: description,
      screenshot: screenshot,
      browserData: browserData,
      url: window.location.href,
      timestamp: Date.now()
    };

    if (navigator.sendBeacon) {
      var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(BUG_API, blob);
    } else {
      fetch(BUG_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function() {});
    }
  }

  function bugReporter(message) {
    var data = getBrowserData();
    captureScreenshot().then(function(screenshot) {
      sendBug(message, screenshot, data);
    });
  }

  window.bugReporter = bugReporter;

  console.log('%c🔧 Bug Reporter loaded', 'color: red; font-size: 16px; font-weight: bold;');
  console.log('Usage: bugReporter("your error message here")');
  console.log('Or click the "Report Bug" button if available.');

  window.addEventListener('error', function(e) {
    var msg = 'JavaScript Error: ' + (e.message || 'unknown') + ' at ' + (e.filename || '') + ':' + (e.lineno || '');
    bugReporter(msg);
  });

  window.addEventListener('unhandledrejection', function(e) {
    bugReporter('Unhandled Promise Rejection: ' + (e.reason || 'unknown'));
  });
})();
