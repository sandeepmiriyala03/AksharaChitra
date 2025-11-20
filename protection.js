/* ==========================================================
   🔐 AksharaChitra — Code Protection Layer (v2.0)
   Protects against DevTools, copying, and unauthorized use
   ========================================================== */

(function() {
  'use strict';

  // =====================================================
  // 1️⃣ DOMAIN LOCK - Only works on authorized domains
  // =====================================================
  const ALLOWED_DOMAINS = ['aksharachitra.netlify.app', 'localhost', '127.0.0.1'];
  
  if (!ALLOWED_DOMAINS.includes(window.location.hostname)) {
    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial;flex-direction:column;"><h1>⚠️ Unauthorized Access</h1><p>This application is not authorized to run on this domain.</p></div>';
    throw new Error('Domain not authorized');
  }

  // =====================================================
  // 2️⃣ DISABLE RIGHT-CLICK
  // =====================================================
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  }, false);

  // =====================================================
  // 3️⃣ DISABLE KEYBOARD SHORTCUTS
  // =====================================================
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+S (Save Page)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+A (Select All) - Optional
    // if (e.ctrlKey && e.key === 'a') {
    //   e.preventDefault();
    //   return false;
    // }
    
    // Ctrl+C (Copy) - Optional
    // if (e.ctrlKey && e.key === 'c') {
    //   e.preventDefault();
    //   return false;
    // }
  }, false);

  // =====================================================
  // 4️⃣ DEVTOOLS DETECTION
  // =====================================================
  let devtoolsOpen = false;
  
  const detectDevTools = function() {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        handleDevToolsOpen();
      }
    } else {
      devtoolsOpen = false;
    }
  };
  
  function handleDevToolsOpen() {
    // Redirect or blank the page
    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial;flex-direction:column;background:#000;color:#fff;"><h1>⚠️ Developer Tools Detected</h1><p>Please close developer tools to continue.</p></div>';
    
    // Optional: Redirect after delay
    // setTimeout(() => {
    //   window.location.href = 'about:blank';
    // }, 2000);
  }
  
  // Check every 500ms
  setInterval(detectDevTools, 500);

  // =====================================================
  // 5️⃣ ANTI-DEBUGGING (Infinite Debugger Loop)
  // =====================================================
  setInterval(function() {
    (function() {
      return false;
    }['constructor']('debugger')['call']());
  }, 50);

  // =====================================================
  // 6️⃣ DISABLE TEXT SELECTION
  // =====================================================
  document.onselectstart = function() {
    return false;
  };
  
  document.oncopy = function() {
    return false;
  };
  
  // CSS-based selection prevention
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
    
    input, textarea {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
  `;
  document.head.appendChild(style);

  // =====================================================
  // 7️⃣ CLEAR CONSOLE PERIODICALLY
  // =====================================================
  setInterval(function() {
    console.clear();
  }, 1000);

  // =====================================================
  // 8️⃣ OVERRIDE CONSOLE METHODS
  // =====================================================
  const noop = function() {};
  
  if (window.console) {
    window.console.log = noop;
    window.console.warn = noop;
    window.console.error = noop;
    window.console.info = noop;
    window.console.debug = noop;
    window.console.dir = noop;
    window.console.dirxml = noop;
    window.console.trace = noop;
    window.console.profile = noop;
    window.console.profileEnd = noop;
  }

  // =====================================================
  // 9️⃣ DETECT BROWSER EXTENSIONS (Optional)
  // =====================================================
  function detectExtensions() {
    const ext = document.documentElement.getAttribute('data-extension');
    if (ext) {
      console.warn('Extension detected');
      // Handle extension detection
    }
  }
  
  detectExtensions();

  // =====================================================
  // 🔟 PREVENT IFRAME EMBEDDING
  // =====================================================
  if (window.top !== window.self) {
    window.top.location = window.self.location;
  }

  // =====================================================
  // 1️⃣1️⃣ WATERMARK CONSOLE WARNING
  // =====================================================
  setTimeout(function() {
    console.log('%c⚠️ STOP!', 'color: red; font-size: 60px; font-weight: bold;');
    console.log('%cThis is a browser feature intended for developers.', 'font-size: 18px;');
    console.log('%cIf someone told you to copy-paste something here, it is a scam.', 'font-size: 18px;');
    console.log('%cPasting anything here can compromise your security.', 'font-size: 18px; font-weight: bold;');
  }, 100);

  // =====================================================
  // 1️⃣2️⃣ PROTECT AGAINST SOURCE CODE THEFT
  // =====================================================
  Object.defineProperty(window, 'ak', {
    get: function() {
      throw new Error('Access denied');
    },
    set: function() {
      throw new Error('Access denied');
    }
  });

  // =====================================================
  // 1️⃣3️⃣ PERFORMANCE MONITORING (Detect if code is copied)
  // =====================================================
  const startTime = Date.now();
  
  window.addEventListener('load', function() {
    const loadTime = Date.now() - startTime;
    
    // If load time is suspiciously fast, code might be cached/copied
    if (loadTime < 50) {
      console.warn('Suspicious load time detected');
    }
  });

  // =====================================================
  // 1️⃣4️⃣ SEAL THE WINDOW OBJECT
  // =====================================================
  try {
    Object.freeze(window);
    Object.seal(window);
  } catch(e) {
    // Some browsers don't allow this
  }

  console.log('🔐 Protection layer active');

})();