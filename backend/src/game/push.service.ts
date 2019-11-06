import { Injectable } from '@nestjs/common';
import webpush = require('web-push');
import {
    IAddPushSubscriberRequest,
    IPushRequest,
    vapidKeys,
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

    async pushAll(dto: IPushRequest) {
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
            for (const sub of this.subscriptions.values()) {
                promises.push(webpush.sendNotification( sub, JSON.stringify(notificationPayload )));
            }
            await Promise.all(promises);
            console.log('PushAll (SUCCESS): Уведомление отправленно');
        } catch (err) {
            console.log('PushAll (ERROR): Уведомление неотправленно');
        }
    }

}
