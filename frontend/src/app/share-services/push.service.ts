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
      .then(sub => {
        // console.log('AddPush');
        this.gameSocket.AddPushSubscriber({ pushSubscription: sub }).subscribe();
      })
      .catch(err => {
        // console.warn('DeletePush');
        this.gameSocket.DeletePushSubscriber({}).subscribe();
      });
    }
  }
}
