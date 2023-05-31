---
layout: compress
permalink: '/app.js'
---

const $notification = $('#notification');
const $notificationDialog = $('#notification-dialog');
const $btnRefresh = $('#notification .toast-body>button');

if ('serviceWorker' in navigator) {
    /* Registering Service Worker */
    navigator.serviceWorker.register('{{ "/sw.js" | relative_url }}')
        .then(registration => {

            /* in case the user ignores the notification */
            if (registration.waiting) {
                $notification.toast('show');
            }

            registration.addEventListener('updatefound', () => {
                registration.installing.addEventListener('statechange', () => {
                    if (registration.waiting) {
                        if (navigator.serviceWorker.controller) {
                            $notification.toast('show');
                        }
                    }
                });
            });

            $btnRefresh.click(() => {
                if (registration.waiting) {
                    registration.waiting.postMessage('SKIP_WAITING');
                }
                $notification.toast('hide');
            });
        });

    let refreshing = false;

    /* Detect controller change and refresh all the opened tabs */
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            window.location.reload();
            refreshing = true;
        }
    });
}

$notification.on('shown.bs.toast', function () {
    $notificationDialog[0].showModal();
});

$notification.on('hidden.bs.toast', function () {
    $notificationDialog[0].close();
});