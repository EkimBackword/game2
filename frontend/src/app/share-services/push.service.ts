import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { GameSocketService } from './sockets';
import { vapidKeys } from './models';
import { UserService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  private readonly VAPID_PUBLIC_KEY = vapidKeys.publicKey;

  constructor(
    private swPush: SwPush,
    private gameSocket: GameSocketService,
    private userSocket: UserService,
  ) {}

  subscribeToNotifications() {
    if (this.userSocket.isAuthenticated) {
      this.swPush.requestSubscription({
          serverPublicKey: this.VAPID_PUBLIC_KEY
      })
      .then(sub => this.gameSocket.AddPushSubscriber({ pushSubscription: sub }).subscribe())
      .catch(err => console.error('Could not subscribe to notifications', err));
    }
  }

  handleActions() {
    this.swPush.notificationClicks.subscribe(notificationPayload => {
      window.focus();
      window.open(notificationPayload.notification.data.url, '_self');
    });
  }
}
