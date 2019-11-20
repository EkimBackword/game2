(function () {
  'use strict';

  // console.log('Кастомный ServiceWorker begin registration');
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (clients.openWindow && event.notification.data.url) {
      event.waitUntil(clients.openWindow(event.notification.data.url));
    }
    // console.log('notification details: ', event.notification);
  });
  // console.log('Кастомный Service Worker registration done');

}());
