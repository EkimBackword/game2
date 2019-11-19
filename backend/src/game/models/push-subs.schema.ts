import * as mongoose from 'mongoose';

export const PushSubsSchema = new mongoose.Schema<IPushSubsModel>({
    userId: String,
    pushSubscription: mongoose.Schema.Types.Mixed,
});

export interface IPushSubsModel extends mongoose.Document {
    userId: string;
    pushSubscription: any;
}
