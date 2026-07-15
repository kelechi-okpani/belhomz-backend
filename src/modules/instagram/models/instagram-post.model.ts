import { Schema, model, Document } from 'mongoose';

export interface IInstagramPost extends Document {
  instagramId: string;
  caption: string;
  mediaType: string;
  mediaUrl: string;
  permalink: string;
  thumbnailUrl: string;
  timestamp: Date;
  lastSyncedAt: Date;
}

const instagramPostSchema = new Schema<IInstagramPost>(
  {
    instagramId: { type: String, required: true, unique: true, index: true },
    caption: { type: String, default: '' },
    mediaType: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    permalink: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    timestamp: { type: Date, required: true },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const InstagramPost = model<IInstagramPost>('InstagramPost', instagramPostSchema);