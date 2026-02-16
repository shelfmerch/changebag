import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Save,
  AlertTriangle,
  Mail,
  Shield,
  Globe,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import config from '@/config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';

import authAxios from '@/utils/authAxios';











// Define the settings interface
interface SystemSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  maxCampaignsPerUser: number;
  autoApprovalEnabled: boolean;
  emailNotificationsEnabled: boolean;
  maintenanceMode: boolean;
  requireApprovalForClaims: boolean;
  maxClaimsPerCampaign: number;
  shippingFee: number;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
}




// Default settings as fallback
const defaultSettings: SystemSettings = {
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

};





const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => { },
  });



  // Fetch settings from the backend
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await authAxios.get('/api/admin/settings');

        if (response.data && response.data.settings) {
          const fetchedSettings = {
            ...defaultSettings,
            ...response.data.settings
          };
          setSettings(fetchedSettings);
          setOriginalSettings(fetchedSettings);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        console.error('Error fetching settings:', err);
        setError(err.response?.data?.message || 'Failed to load settings. Please try again.');
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };





















    fetchSettings();
  }, []);

  // Handle input changes
  const handleInputChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Check if settings have changed
  const hasChanges = () => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  };

  // Validate settings before saving
  const validateSettings = (): boolean => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.supportEmail)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid support email address.',
        variant: 'destructive'
      });
      return false;
    }

    // URL validation
    const urlRegex = /^https?:\/\/.+\..+/;
    if (!urlRegex.test(settings.privacyPolicyUrl) || !urlRegex.test(settings.termsOfServiceUrl)) {
      toast({
        title: 'Invalid URL',
        description: 'Privacy Policy and Terms of Service URLs must be valid HTTP/HTTPS URLs.',
        variant: 'destructive'
      });
      return false;
    }

    // Numeric validation
    if (settings.maxCampaignsPerUser < 1 || settings.maxClaimsPerCampaign < 1) {
      toast({
        title: 'Invalid Limits',
        description: 'Maximum campaigns and claims must be positive numbers.',
        variant: 'destructive'
      });
      return false;
    }

    // Shipping fee validation
    if (settings.shippingFee < 0) {
      toast({
        title: 'Invalid Shipping Fee',
        description: 'Shipping fee cannot be negative.',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  // Handle save with confirmation for critical settings
  const handleSaveClick = () => {
    if (!validateSettings()) return;

    // Check if maintenance mode is being enabled
    if (settings.maintenanceMode && !originalSettings.maintenanceMode) {
      setConfirmDialog({
        open: true,
        title: 'Enable Maintenance Mode?',
        description: 'This will make the site inaccessible to regular users. Only administrators will be able to access the site. Are you sure you want to continue?',
        onConfirm: saveSettings
      });
      return;
    }

    // Check if auto-approval is being enabled
    if (settings.autoApprovalEnabled && !originalSettings.autoApprovalEnabled) {
      setConfirmDialog({
        open: true,
        title: 'Enable Auto-Approval?',
        description: 'This will automatically approve all new campaign submissions without manual review. Are you sure you want to continue?',
        onConfirm: saveSettings
      });
      return;
    }

    // If no critical settings are being changed, save directly
    saveSettings();
  };

  // Add these interfaces right after the imports
  interface ApiResponse {
    success: boolean;
    message?: string;
    settings?: SystemSettings;
  }

  interface ApiError {
    response?: {
      data?: {
        message?: string;
      };
    };
  }

  // Update the save settings function
  const saveSettings = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await authAxios.put('/api/admin/settings', { settings });

      if (response.data.success) {
        setOriginalSettings(settings);
        toast({
          title: 'Settings Saved',
          description: 'All settings have been successfully updated.',
        });
      } else {
        throw new Error(response.data.message || 'Failed to save settings');
      }
    } catch (err: any) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || 'Failed to save settings';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
  };

  // Reset settings to last saved state
  const handleReset = () => {
    setSettings(originalSettings);
    toast({
      title: 'Settings Reset',
      description: 'All changes have been discarded.'
    });
  };

  // Show loading state
  if (loading) {
    return (
      <AdminLayout title="System Settings" subtitle="Loading settings...">
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Loading settings...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="System Settings" subtitle="Configure platform settings and preferences">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {settings.maintenanceMode && (
        <Alert variant="destructive" className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Maintenance Mode is Active:</strong> The site is currently inaccessible to regular users.
            Only administrators can access the platform.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                />
              </div>
            </div>
            <div>






              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                rows={3}
              />
            </div>












          </CardContent>
        </Card>















        {/* Campaign Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxCampaigns">Max Campaigns Per User</Label>
                <Input
                  id="maxCampaigns"
                  type="number"
                  value={settings.maxCampaignsPerUser}
                  onChange={(e) => handleInputChange('maxCampaignsPerUser', parseInt(e.target.value) || 1)}
                  min={1}
                />
              </div>
              <div>
                <Label htmlFor="maxClaims">Max Claims Per Campaign</Label>
                <Input
                  id="maxClaims"
                  type="number"
                  value={settings.maxClaimsPerCampaign}
                  onChange={(e) => handleInputChange('maxClaimsPerCampaign', parseInt(e.target.value) || 1)}
                  min={1}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoApproval">Auto-approve Campaigns</Label>
                <p className="text-sm text-gray-500">Automatically approve new campaign submissions</p>
              </div>
              <Switch
                id="autoApproval"
                checked={settings.autoApprovalEnabled}
                onCheckedChange={(checked) => handleInputChange('autoApprovalEnabled', checked)}
              />
            </div>







            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireClaimApproval">Require Approval for Claims</Label>
                <p className="text-sm text-gray-500">Manually review all tote bag claims</p>
              </div>
              <Switch
                id="requireClaimApproval"
                checked={settings.requireApprovalForClaims}
                onCheckedChange={(checked) => handleInputChange('requireApprovalForClaims', checked)}
              />
            </div>





          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Send email notifications for important events</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotificationsEnabled}
                onCheckedChange={(checked) => handleInputChange('emailNotificationsEnabled', checked)}
              />
            </div>



















          </CardContent>
        </Card>














        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="privacyPolicy">Privacy Policy URL</Label>
                <Input
                  id="privacyPolicy"
                  type="url"
                  value={settings.privacyPolicyUrl}
                  onChange={(e) => handleInputChange('privacyPolicyUrl', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="termsOfService">Terms of Service URL</Label>
                <Input
                  id="termsOfService"
                  value={settings.termsOfServiceUrl}
                  onChange={(e) => handleInputChange('termsOfServiceUrl', e.target.value)}
                />
              </div>
            </div>








          </CardContent>
        </Card>

















        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Put the site in maintenance mode</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
              />
            </div>
            <div>

              <Label htmlFor="shippingFee">Shipping Fee ($)</Label>
              <Input



                id="shippingFee"
                type="number"
                step="0.01"
                value={settings.shippingFee}
                onChange={(e) => handleInputChange('shippingFee', parseFloat(e.target.value))}
              />
            </div>



          </CardContent>
        </Card>








































        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges() || saving}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Changes
          </Button>

          <Button
            onClick={handleSaveClick}
            disabled={!hasChanges() || saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Add confirmation dialog */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmDialog.title}</DialogTitle>
              <DialogDescription>{confirmDialog.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDialog.onConfirm}
                variant="default"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>




    </AdminLayout>
  );
};


export default Settings;
