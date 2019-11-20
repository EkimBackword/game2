import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import webpush = require('web-push');
import {
    IAddPushSubscriberRequest,
    IPushRequest,
    vapidKeys,
    IUser,
    IAuthRequest,
} from './models';
import { IPushSubsModel } from './models/push-subs.schema';

@Injectable()
export class PushService {

    private subscriptions: Map<string, any> = new Map();

    constructor(
        @InjectModel('PushSubs') private readonly pushSubsModel: Model<IPushSubsModel>,
    ) {
        webpush.setVapidDetails(
            vapidKeys.mailto,
            vapidKeys.publicKey,
            vapidKeys.privateKey,
        );
        this.findAll();
    }

    async sub(data: IAddPushSubscriberRequest) {
        const flag = this.subscriptions.has(data.user.id);
        this.subscriptions.set(data.user.id, data.pushSubscription);
        if (!flag) {
            return await this.create(data.user.id, data.pushSubscription);
        }
        return await this.update(data.user.id, data.pushSubscription);
    }

    async unsub(data: IAuthRequest) {
        const flag = this.subscriptions.has(data.user.id);
        if (!flag) {
            return;
        }
        this.subscriptions.delete(data.user.id);
        return await this.delete(data.user.id);
    }

    private async create(userId: string, pushSubscription: any) {
        const sub = new this.pushSubsModel({ userId, pushSubscription });
        return await sub.save();
    }

    private async update(userId: string, pushSubscription: any) {
        await this.pushSubsModel.updateOne({ userId }, { userId, pushSubscription }).exec();
    }

    private async delete(userId: string) {
        const sub = await this.pushSubsModel.findOne({ userId }).exec();
        return await sub.remove();
    }

    private async findAll() {
        const list = await this.pushSubsModel.find().exec();
        for (const subInfo of list) {
            this.subscriptions.set(subInfo.userId, subInfo.pushSubscription);
        }
    }

    async pushAll(dto: IPushRequest, user: IUser) {
        const notificationPayload = {
            notification: {
                title: dto.title,
                body: dto.body,
                icon: 'assets/logo.png',
                vibrate: [100, 50, 100],
                data: {
                    url: `app/games/${dto.gameId}`,
                    dateOfArrival: Date.now(),
                    primaryKey: 1,
                },
                actions: [{
                    action: 'explore',
                    title: 'Присоединиться',
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
