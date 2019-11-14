(function () {
  'use strict';

  //console.log('Кастомный ServiceWorker begin registration');
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    console.log('notification details: ', event.notification);
  });
  //console.log('Кастомный Service Worker registration done');

}());
