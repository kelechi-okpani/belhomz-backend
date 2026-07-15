import axios from 'axios';
import { Request, Response } from 'express';

export const handleImageProxy = async (req: Request, res: Response) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) return res.status(400).send('URL is required');

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      proxy: {
        protocol: 'http',
        host: 'proxy.apify.com',
        port: 8000,
        auth: {
          username: 'groups-RESIDENTIAL',
          password: process.env.APIFY_TOKEN 
        } as any
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    const contentType = Array.isArray(response.headers['content-type'])
      ? response.headers['content-type'][0]
      : response.headers['content-type']
      ? String(response.headers['content-type'])
      : 'image/jpeg';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400'); 
    res.send(response.data);
  } catch (error) {
    // If proxy fails, try direct fetch as fallback
    try {
      const fallback = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const fallbackContentType = Array.isArray(fallback.headers['content-type'])
        ? fallback.headers['content-type'][0]
        : fallback.headers['content-type']
        ? String(fallback.headers['content-type'])
        : undefined;
      if (fallbackContentType) res.set('Content-Type', fallbackContentType);
      res.send(fallback.data);
    } catch (e) {
      res.status(500).send('Proxy Error');
    }
  }
};