import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getSettings(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }

    const settings = await prisma.systemSettings.findFirst();
    
    return res.status(200).json({
      success: true,
      settings: settings || {}
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export async function updateSettings(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }

    const { settings } = req.body;

    // Validate required fields
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Settings data is required'
      });
    }

    // Update or create settings
    const updatedSettings = await prisma.systemSettings.upsert({
      where: { id: 1 }, // Assuming single settings record
      update: settings,
      create: { id: 1, ...settings }
    });

    return res.status(200).json({
      success: true,
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
