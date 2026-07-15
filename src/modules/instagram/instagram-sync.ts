import { ApifyClient } from 'apify-client';
import { InstagramPost } from './models/instagram-post.model'; 
import 'dotenv/config';
import cron from 'node-cron';

/**
 * Ensures the URL ends with a trailing slash as required by Apify's directUrls format
 */
const formatInstagramUrl = (url: string): string => {
    const trimmed = url.trim();
    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
};

export const syncApifyInstagramFeed = async (force = false): Promise<void> => {
    try {
        const token = process.env.APIFY_TOKEN;
        const profileUrl = process.env.IG_URL;

        if (!token || !profileUrl) {
            console.error('❌ [Instagram] Missing required environment variables: APIFY_TOKEN or IG_URL');
            return;
        }

        // 1. Credit-saving check (unless 'force' is explicitly true)
        if (!force) {
            const lastPost = await InstagramPost.findOne().sort({ lastSyncedAt: -1 });
            if (lastPost && lastPost.lastSyncedAt) {
                const hoursSinceLastSync = (Date.now() - new Date(lastPost.lastSyncedAt).getTime()) / (1000 * 60 * 60);

                if (hoursSinceLastSync < 23) {
                    console.log(`ℹ️ [Instagram] Skipping sync. Last update was ${hoursSinceLastSync.toFixed(1)} hours ago.`);
                    return;
                }
            }
        }

        console.log('🔄 [Instagram] Starting sync process via Apify...');
        
        const client = new ApifyClient({ token });
        const formattedUrl = formatInstagramUrl(profileUrl);

        // 2. Apify Actor Input configured for apify/instagram-scraper
        const input = {
            directUrls: [formattedUrl],
            resultsType: "posts",
            resultsLimit: 20,
            proxy: {
                useApifyProxy: true,
                apifyProxyGroups: ['RESIDENTIAL'],
            },
        };

        // 3. Trigger Scraper Actor
        const run = await client.actor("apify/instagram-scraper").call(input);
        
        // 4. Fetch items from dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        if (!items || items.length === 0) {
            console.warn('⚠️ [Instagram] Scraper execution returned 0 posts.');
            return;
        }

        // 5. Construct Bulk Write Operations
        const operations = items
            .filter((item: any) => item.id || item.shortCode) // Safety fallback filter
            .map((item: any) => {
                const postId = item.id || item.shortCode;
                return {
                    updateOne: {
                        filter: { instagramId: postId },
                        update: {
                            $set: {
                                instagramId: postId, // Explicitly enforce field assignment on upsert
                                caption: item.caption || "",
                                mediaType: item.type || "Image",
                                mediaUrl: item.videoUrl || item.displayUrl,
                                permalink: item.url,
                                thumbnailUrl: item.displayUrl,
                                timestamp: item.timestamp ? new Date(item.timestamp) : new Date(), 
                                lastSyncedAt: new Date()
                            }
                        },
                        upsert: true
                    }
                };
            });

        if (operations.length === 0) {
            console.warn('⚠️ [Instagram] No valid posts found with identifiers.');
            return;
        }

        // 6. Batch update database
        const result = await InstagramPost.bulkWrite(operations);
        console.log(`✅ [Instagram] Sync complete. Matched: ${result.matchedCount}, Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`);

    } catch (error) {
        console.error('❌ [Instagram] Sync transaction operation failed:', error);
    }
};

/**
 * SCHEDULED CRON JOB (Executes daily at Midnight)
 * Re-activated and optimized to run asynchronously
 */
cron.schedule('0 0 * * *', async () => {
    console.log('⏰ [Cron] Midnight trigger: Executing automated feed update...');
    await syncApifyInstagramFeed(true); // Force true bypasses 23h skip check for safety during automated schedules
});

/* ==========================================================================
   🚀 STARTUP INITIALIZATION HOOK
   This runs automatically when the server boots.
   ========================================================================== */
(async () => {
    console.log('🚀 [Instagram] Bootstrap event: Triggering immediate startup sync...');
    await syncApifyInstagramFeed(true);
})();