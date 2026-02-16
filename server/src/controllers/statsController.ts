import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Sponsorship, { SponsorshipStatus } from '../models/Sponsorship';
import Cause from '../models/Cause';

// Get comprehensive statistics for public display
export const getPublicStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== getPublicStats START ===');
    
    // Import Claim model
    const Claim = mongoose.model('Claim');
    
    // Get total sponsors (unique users who have created sponsorships)
    const totalSponsors = await Sponsorship.distinct('sponsor').countDocuments();
    
    // Get total claimers (unique users who have made claims)
    const totalClaimers = await Claim.distinct('email').countDocuments();
    
    // Get total bags sponsored from approved sponsorships
    const totalBagsSponsoredResult = await Sponsorship.aggregate([
      { $match: { status: SponsorshipStatus.APPROVED } },
      { $group: { _id: null, total: { $sum: '$toteQuantity' } } }
    ]);
    const totalBagsSponsored = totalBagsSponsoredResult.length > 0 ? totalBagsSponsoredResult[0].total : 0;
    
    // Get total bags claimed (verified, shipped, or delivered claims)
    const totalBagsClaimed = await Claim.countDocuments({
      status: { $in: ['verified', 'shipped', 'delivered'] }
    });
    
    // Get active campaigns (approved sponsorships that are online)
    const activeCampaigns = await Sponsorship.countDocuments({
      status: SponsorshipStatus.APPROVED,
      isOnline: true
    });
    
    // Get total causes
    const totalCauses = await Cause.countDocuments({ status: 'approved' });
    
    // Get total raised amount from all approved sponsorships
    const totalRaisedResult = await Sponsorship.aggregate([
      { $match: { status: SponsorshipStatus.APPROVED } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRaised = totalRaisedResult.length > 0 ? totalRaisedResult[0].total : 0;
    
    // Get monthly growth data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await Sponsorship.aggregate([
      {
        $match: {
          status: SponsorshipStatus.APPROVED,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sponsors: { $addToSet: '$sponsor' },
          totalAmount: { $sum: '$totalAmount' },
          totalBags: { $sum: '$toteQuantity' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Format monthly data for charts
    const growthData = monthlyStats.map(stat => ({
      month: new Date(stat._id.year, stat._id.month - 1).toLocaleDateString('en-US', { month: 'short' }),
      sponsors: stat.sponsors.length,
      impact: stat.totalBags
    }));
    
    // Get impact by cause category
    const impactByCause = await Cause.aggregate([
      {
        $lookup: {
          from: 'sponsorships',
          localField: '_id',
          foreignField: 'cause',
          as: 'sponsorships'
        }
      },
      {
        $lookup: {
          from: 'claims',
          localField: '_id',
          foreignField: 'causeId',
          as: 'claims'
        }
      },
      {
        $addFields: {
          totalBags: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$sponsorships',
                    as: 'sponsorship',
                    cond: { $eq: ['$$sponsorship.status', 'approved'] }
                  }
                },
                as: 'approvedSponsorship',
                in: { $ifNull: ['$$approvedSponsorship.toteQuantity', 0] }
              }
            }
          },
          claimedBags: {
            $size: {
              $filter: {
                input: '$claims',
                as: 'claim',
                cond: { $in: ['$$claim.status', ['verified', 'shipped', 'delivered']] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$category',
          bags: { $sum: '$claimedBags' }
        }
      },
      {
        $sort: { bags: -1 }
      }
    ]);
    
    // Format impact data for charts
    const impactData = impactByCause.map(item => ({
      cause: item._id,
      bags: item.bags
    }));
    
    const stats = {
      // Sponsor-focused stats
      totalSponsors,
      totalBagsSponsored,
      activeCampaigns,
      totalRaised,
      
      // Claimer-focused stats  
      totalClaimers,
      totalBagsClaimed,
      totalCauses,
      
      // Chart data
      growthData,
      impactData
    };
    
    console.log('Public stats calculated:', stats);
    console.log('=== getPublicStats SUCCESS ===');
    
    res.json(stats);
  } catch (error) {
    console.error('=== getPublicStats ERROR ===');
    console.error('Error calculating public stats:', error);
    res.status(500).json({ message: 'Error calculating public statistics' });
  }
}; 