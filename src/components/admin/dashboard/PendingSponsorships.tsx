import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface PendingSponsorship {
  _id: string;
  organizationName: string;
  contactName: string;
  email: string;
  toteQuantity: number;
  distributionStartDate: string;
  distributionEndDate: string;
  distributionDate?: string; // Keeping for backward compatibility
  createdAt: string;
}

interface PendingSponsorshipsProps {
  sponsorships: PendingSponsorship[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const PendingSponsorships = ({
  sponsorships,
  onApprove,
  onReject,
  onViewDetails,
}: PendingSponsorshipsProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Tote Quantity</TableHead>
            <TableHead>Distribution Period</TableHead>
            <TableHead>Submitted</TableHead>
            {/* <TableHead>Actions</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sponsorships.map((sponsorship) => (
            <TableRow key={sponsorship._id}>
              <TableCell className="font-medium">
                {sponsorship.organizationName}
              </TableCell>
              <TableCell>
                {sponsorship.contactName}
                <br />
                <span className="text-sm text-gray-500">{sponsorship.email}</span>
              </TableCell>
              <TableCell>{sponsorship.toteQuantity}</TableCell>
              <TableCell>
                {sponsorship.distributionStartDate && sponsorship.distributionEndDate ? (
                  <>
                    {formatDate(sponsorship.distributionStartDate)} - {formatDate(sponsorship.distributionEndDate)}
                  </>
                ) : sponsorship.distributionDate ? (
                  formatDate(sponsorship.distributionDate)
                ) : (
                  "Not specified"
                )}
              </TableCell>
              <TableCell>{formatDate(sponsorship.createdAt)}</TableCell>
              {/* <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(sponsorship._id)}
                  >
                    View
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onApprove(sponsorship._id)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onReject(sponsorship._id)}
                  >
                    Reject
                  </Button>
                </div>
              </TableCell> */}
            </TableRow>
          ))}
          {sponsorships.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No pending sponsorships found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingSponsorships; 