// sw-register.js
(() => {
    if (!('serviceWorker' in navigator)) return;

    // Bump this number whenever you change sw.js
    const SW_VERSION = 6;
    const SW_URL = `sw.js?v=${SW_VERSION}`;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register(SW_URL, { scope: './' })
            .then((reg) => {
                console.log('[SW] registered at', reg.scope);

                // Detect updates & reload so users get the new version
                reg.addEventListener('updatefound', () => {
                    const nw = reg.installing;
                    nw && nw.addEventListener('statechange', () => {
                        if (nw.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                console.log('[SW] update installed → reloading');
                                location.reload();
                            } else {
                                console.log('[SW] ready for offline use');
                            }
                        }
                    });
                });
            })
            .catch((err) => console.error('[SW] register error', err));
    });
})();
