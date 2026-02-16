import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, ChevronDown, ChevronRight, Download, Check, X, Eye, AlertTriangle, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import authAxios from '@/utils/authAxios';
import { AxiosResponse } from 'axios';
import { Button } from '@/components/ui/button';

interface Cause {
  _id: string;
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl: string;
}
interface Sponsorship {
  _id: string;
  status: string;
  logoStatus?: string;
  cause: Cause;
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  toteQuantity: number;
  unitPrice: number;
  totalAmount: number;
  logoUrl: string;
  qrCodeUrl?: string; // Add QR code URL field
  toteDetails?: {
    totalAmount?: number;
  };
  selectedCities?: string[];
  distributionType: 'physical' | 'online';
  distributionLocations?: Array<{
    name: string;
    address: string;
    contactPerson: string;
    phone: string;
    location?: string;
    totesCount?: number;
  }>;
  distributionStartDate?: string;
  distributionEndDate?: string;
  documents: Array<{
    name: string;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
  isOnline: boolean;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface Organization {
  _id?: string;
  name?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
}

// StatusBadge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under-review':
      case 'under review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending Review';
      case 'under-review':
      case 'under review':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}
    >
      {getStatusText(status)}
    </span>
  );
};

// ExpandableSection component
interface ExpandableSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const ExpandableSection = ({ title, isExpanded, onToggle, children }: ExpandableSectionProps) => {
  return (
    <div className="border border-gray-200 rounded-md">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-900">{title}</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100">
          <div className="pt-3">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const CampaignCard = ({ sponsorship, onApprove, onReject, onEndCampaign }: { 
  sponsorship: Sponsorship;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEndCampaign: (id: string) => void;
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isPending = sponsorship.status.toLowerCase() === 'pending';
  const isApproved = sponsorship.status.toLowerCase() === 'approved';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{sponsorship.cause?.title || 'Unknown Cause'}</h3>
          <p className="text-sm text-gray-600">
            Submitted by: <span className="font-medium">{sponsorship.organizationName || 'Unknown Organization'}</span>
          </p>
          <p className="text-sm text-gray-500">
            Submitted: {new Date(sponsorship.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={sponsorship.status} />
          {sponsorship.logoStatus && (
            <StatusBadge status={sponsorship.logoStatus} />
          )}
          {/* {isApproved && (
            <StatusBadge status={sponsorship.isOnline ? 'online' : 'offline'} />
          )} */}
        </div>
      </div>

      {/* Description & Basic Info */}
      <div className="mb-4">
        <p className="text-gray-700 mb-3">{sponsorship.cause?.description || 'No description available'}</p>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Category: </span>
            <span className="text-sm font-medium text-gray-900">{sponsorship.cause?.category || 'Unknown'}</span>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">Goal Amount: </span>
            <span className="text-lg font-bold text-gray-900">{sponsorship.cause?.targetAmount || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-3 mb-6">
        <ExpandableSection
          title="Organization Information"
          isExpanded={expandedSections.includes('org')}
          onToggle={() => toggleSection('org')}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Organization: </span>
                <span className="text-sm text-gray-600">{sponsorship.organizationName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Contact Name: </span>
                <span className="text-sm text-gray-600">{sponsorship.contactName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Email: </span>
                <span className="text-sm text-gray-600">{sponsorship.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Phone: </span>
                <span className="text-sm text-gray-600">{sponsorship.phone || 'N/A'}</span>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                {sponsorship.logoUrl ? (
                  <img 
                    src={sponsorship.logoUrl} 
                    alt="Organization Logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-500">No Logo</span>
                )}
              </div>
            </div>
          </div>
        </ExpandableSection>
        <ExpandableSection
          title="Tote Details"
          isExpanded={expandedSections.includes('tote')}
          onToggle={() => toggleSection('tote')}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Quantity: </span>
              <span className="text-sm text-gray-600">{sponsorship.toteQuantity ?? 'N/A'}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Unit Price: </span>
              <span className="text-sm text-gray-600">{sponsorship.unitPrice ?? 'N/A'}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Total: </span>
              <span className="text-sm font-semibold text-gray-900">{sponsorship.totalAmount ?? 'N/A'}</span>
            </div>
          </div>
        </ExpandableSection>
        <ExpandableSection
          title="Distribution Details"
          isExpanded={expandedSections.includes('distribution')}
          onToggle={() => toggleSection('distribution')}
        >
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Distribution Type: </span>
                <span className="text-sm text-gray-600 capitalize">{sponsorship.distributionType || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Duration: </span>
                <span className="text-sm text-gray-600">
                  {sponsorship.distributionStartDate && sponsorship.distributionEndDate
                    ? `${new Date(sponsorship.distributionStartDate).toLocaleDateString()} — ${new Date(sponsorship.distributionEndDate).toLocaleDateString()}`
                    : 'N/A'}
                </span>
              </div>
            </div>
            
            {sponsorship.distributionType === 'physical' && (
              <>
                <div>
                  <span className="text-sm font-medium text-gray-700">Selected Cities: </span>
                  <span className="text-sm text-gray-600">
                    {Array.isArray(sponsorship.selectedCities) && sponsorship.selectedCities.length > 0
                      ? sponsorship.selectedCities.join(', ')
                      : 'N/A'}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Distribution Locations:</h4>
                  <div className="space-y-3">
                    {Array.isArray(sponsorship.distributionLocations) && sponsorship.distributionLocations.length > 0
                      ? sponsorship.distributionLocations.map((location, index) => {
                          return (
                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                              <div className="grid md:grid-cols-2 gap-2">
                                <div>
                                  <div className="font-medium text-sm text-gray-900">{location.name || 'N/A'}</div>
                                  <div className="text-sm text-gray-600">{location.address || 'N/A'}</div>
                                  <div className="text-xs text-gray-500">Type: {location.location || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600">
                                    Contact: {location.contactPerson || 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-600">Phone: {location.phone || 'N/A'}</div>
                                  <div className="text-sm font-medium text-gray-900">
                                    Totes: {location.totesCount || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      : <span className="text-xs text-gray-500">No distribution locations specified</span>}
                  </div>
                </div>
              </>
            )}
            
            {sponsorship.distributionType === 'online' && (
              <div>
                <span className="text-sm text-gray-600">
                  Online distribution - totes will be shipped directly to the organization.
                </span>
              </div>
            )}
          </div>
        </ExpandableSection>
        
        {/* QR Code Section */}
        <ExpandableSection
          title="QR Code"
          isExpanded={expandedSections.includes('qr')}
          onToggle={() => toggleSection('qr')}
        >
          <div className="space-y-4">
            {sponsorship.qrCodeUrl ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(sponsorship.qrCodeUrl)}`}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    This QR code links to the cause page for claiming totes.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(sponsorship.qrCodeUrl)}`;
                        link.download = `qr-code-${sponsorship.organizationName.replace(/\s+/g, '-')}.png`;
                        link.click();
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download QR Code
                    </Button>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(sponsorship.qrCodeUrl);
                        toast({
                          title: "QR Code URL Copied",
                          description: "The QR code URL has been copied to clipboard.",
                        });
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-4 w-4" />
                      Copy URL
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No QR code available for this sponsorship.</p>
              </div>
            )}
          </div>
        </ExpandableSection>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        {isPending && (
          <>
            <button
              onClick={() => onApprove(sponsorship._id)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4 mr-1" />
              Approve
            </button>
            <button
              onClick={() => onReject(sponsorship._id)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </button>
          </>
        )}
        
        {isApproved && (
          <button
            onClick={() => onEndCampaign(sponsorship._id)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            End Campaign
          </button>
        )}
      </div>
    </div>
  );
};

const CampaignApprovals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSponsorships();
  }, []);

  const fetchSponsorships = async () => {
    try {
      setLoading(true);
      // Fetch both approved and pending sponsorships
      const [approvedResponse, pendingResponse] = await Promise.all([
        authAxios.get<Sponsorship[]>('/api/sponsorships/approved'),
        authAxios.get<Sponsorship[]>('/api/sponsorships/pending')
      ]);
      
      const allSponsorships = [...approvedResponse.data, ...pendingResponse.data];
      setSponsorships(allSponsorships);
    } catch (error) {
      console.error('Error fetching sponsorships:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sponsorships",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await authAxios.patch(`/api/sponsorships/${id}/approve`);
      toast({
        title: "Success",
        description: "Sponsorship approved successfully"
      });
      fetchSponsorships(); // Refresh the list
    } catch (error) {
      console.error('Error approving sponsorship:', error);
      toast({
        title: "Error",
        description: "Failed to approve sponsorship",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await authAxios.patch(`/api/sponsorships/${id}/reject`);
      toast({
        title: "Success",
        description: "Sponsorship rejected successfully"
      });
      fetchSponsorships(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting sponsorship:', error);
      toast({
        title: "Error",
        description: "Failed to reject sponsorship",
        variant: "destructive"
      });
    }
  };

  const handleEndCampaign = async (id: string) => {
    try {
      await authAxios.patch(`/api/sponsorships/${id}/end-campaign`);
      toast({
        title: "Success",
        description: "Campaign ended successfully"
      });
      fetchSponsorships(); // Refresh the list
    } catch (error) {
      console.error('Error ending campaign:', error);
      toast({
        title: "Error",
        description: "Failed to end campaign",
        variant: "destructive"
      });
    }
  };

  const filteredSponsorships = sponsorships.filter(sponsorship =>
    (sponsorship.cause?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    sponsorship.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = sponsorships.filter(s => s.status.toLowerCase() === 'pending').length;
  const approvedCount = sponsorships.filter(s => s.status.toLowerCase() === 'approved').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminLayout title="Campaign Approvals" subtitle="Review and manage sponsorship campaigns">
      <div className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-semibold text-gray-800">Campaign Approvals</h1>
            <span className="text-sm text-gray-500">Admin (Admin)</span>
          </div>
          <p className="text-gray-600 mb-4">Review and manage sponsorship campaigns</p>
          
          {/* Status Summary */}
          <div className="flex gap-4 mb-4">
            <div className="bg-yellow-100 px-3 py-2 rounded-md">
              <span className="text-sm font-medium text-yellow-800">
                Pending: {pendingCount}
              </span>
            </div>
            <div className="bg-green-100 px-3 py-2 rounded-md">
              <span className="text-sm font-medium text-green-800">
                Approved: {approvedCount}
              </span>
            </div>
          </div>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredSponsorships.length > 0 ? (
        <div className="space-y-6">
              {filteredSponsorships.map((sponsorship) => (
                <CampaignCard
                  key={sponsorship._id}
                  sponsorship={sponsorship}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onEndCampaign={handleEndCampaign}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No campaigns found</h3>
              <p className="text-gray-500">No campaigns match your search criteria</p>
            </div>
          )}
      </div>
      </AdminLayout>
    </div>
  );
};

export default CampaignApprovals;