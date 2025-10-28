/* pwa.js — registers service worker and handles simple install prompt UI */

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('service-worker.js').then(reg=>{
    console.log('SW registered', reg.scope);
  }).catch(err => console.warn('SW register failed', err));
}

// simple handling of beforeinstallprompt (UI handled in main.js)
window.addEventListener('appinstalled', ()=> {
  console.log('App installed');
  document.getElementById('installBtn')?.classList.add('hidden');
});
