import { Injectable } from '@nestjs/common';
import webpush = require('web-push');
import {
    IAddPushSubscriberRequest,
    IPushRequest,
    vapidKeys,
    IUser,
} from './models';

@Injectable()
export class PushService {

    private subscriptions: Map<string, any> = new Map();

    constructor() {
        webpush.setVapidDetails(
            vapidKeys.mailto,
            vapidKeys.publicKey,
            vapidKeys.privateKey,
        );
    }

    add(data: IAddPushSubscriberRequest): void {
        this.subscriptions.set(data.user.id, data.pushSubscription);
    }

    async pushAll(dto: IPushRequest, user: IUser) {
        const notificationPayload = {
            notification: {
                title: dto.title,
                body: dto.body,
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: 1,
                },
                actions: [{
                    action: 'explore',
                    title: 'Открыть приложение',
                }],
            },
        };
        try {
            const promises = [];
            for (const entrie of this.subscriptions.entries()) {
                const key = entrie[0];
                const sub = entrie[1];
                if (key !== user.id) {
                    promises.push(webpush.sendNotification( sub, JSON.stringify(notificationPayload )));
                }
            }
            await Promise.all(promises);
            console.log('PushAll (SUCCESS): Уведомление отправленно');
        } catch (err) {
            console.log('PushAll (ERROR): Уведомление неотправленно');
        }
    }

}
