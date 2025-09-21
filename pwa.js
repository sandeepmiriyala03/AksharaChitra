document.addEventListener('DOMContentLoaded', () => {
      let deferredPrompt;
      const installBtn = document.getElementById('installBtn');

      function isAppInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches
            || window.navigator.standalone === true; // iOS standalone detection
      }

      if (isAppInstalled()) {
        installBtn.style.setProperty('display', 'none', 'important');
      } else {
         installBtn.style.setProperty('display', 'none', 'important');
      }

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (!isAppInstalled()) {
          installBtn.style.display = 'inline-block';
        }
      });

      installBtn.addEventListener('click', () => {
          installBtn.style.setProperty('display', 'none', 'important');
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(() => {
            deferredPrompt = null;
          });
        }
      });
  
  window.addEventListener('appinstalled', () => {
    
    installBtn.style.setProperty('display', 'none', 'important');
    console.log('AksharaChitra PWA was installed');
  });
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
          .then(() => console.log('Service Worker registered'))
          .catch(err => console.error('Service Worker registration failed:', err));
      }
    });

    function openTab(evt, tabName) {
      var i, tabcontent, tabbuttons;
      tabcontent = document.getElementsByClassName("tab-content");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
      }
      tabbuttons = document.getElementsByClassName("tab-button");
      for (i = 0; i < tabbuttons.length; i++) {
        tabbuttons[i].classList.remove("active");
      }
      document.getElementById(tabName).classList.add("active");
      evt.currentTarget.classList.add("active");
      document.getElementById("header").style.display = "flex";
    }