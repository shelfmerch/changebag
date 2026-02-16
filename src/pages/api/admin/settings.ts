import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('settings');

    switch (req.method) {
      case 'GET':
        const settings = await collection.findOne({ _id: 'global' });
        return res.status(200).json({ success: true, settings });

      case 'PUT':
        const { settings: newSettings } = req.body;
        const result = await collection.updateOne(
          { _id: 'global' },
          { 
            $set: newSettings,
            $setOnInsert: {
              _id: 'global',
              createdAt: new Date()
            }
          },
          { upsert: true }
        );
        
        if (result.acknowledged) {
          return res.status(200).json({ success: true, settings: newSettings });
        }
        throw new Error('Failed to update settings');

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
