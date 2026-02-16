import clientPromise from '../mongodb';
import { SystemSettings } from '@/types/settings';

export async function getSettings() {
  const client = await clientPromise;
  const db = client.db();
  const settings = await db.collection('settings').findOne({ _id: 'global' });
  return settings as SystemSettings;
}

export async function updateSettings(settings: Partial<SystemSettings>) {
  const client = await clientPromise;
  const db = client.db();
  
  const result = await db.collection('settings').updateOne(
    { _id: 'global' },
    { 
      $set: settings,
      $setOnInsert: {
        siteName: 'Tote Bag Platform',
        siteDescription: 'A platform for cause-based tote bag distribution',
        supportEmail: 'support@totebag.com',
        maxCampaignsPerUser: 5,
        autoApprovalEnabled: false,
        emailNotificationsEnabled: true,
        maintenanceMode: false,
        requireApprovalForClaims: true,
        maxClaimsPerCampaign: 1000,
        shippingFee: 0,
        privacyPolicyUrl: 'https://example.com/privacy',
        termsOfServiceUrl: 'https://example.com/terms'
      }
    },
    { upsert: true }
  );

  return result.acknowledged;
}
