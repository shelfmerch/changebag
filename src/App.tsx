import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CausesPage from "./pages/Causes";
import AllCausesPage from "./pages/AllCauses";
import CauseDetailsPage from "./pages/CauseDetails";
import CauseDetail from "./pages/CauseDetail";
import SponsorFormPage from "./pages/SponsorForm";
import SponsorshipConfirmation from "./pages/SponsorshipConfirmation";
import LoginPage from "./pages/Login";
import CreateCausePage from "./pages/CreateCause";

// Public Pages
import WhySponsorPage from "./pages/WhySponsor";
import WhyClaimPage from "./pages/WhyClaim";
import LogoReuploadPage from "./pages/sponsor/LogoReupload";
import { CsrPage } from "./pages/CsrPage";

// Legal & Support Pages
import HelpCenter from "./pages/HelpCenter";
import Documentation from "./pages/Documentation";
import DevelopersPage from "./pages/Developers";
import DevelopersRegisterPage from "./pages/DevelopersRegister";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import AccessibilityPage from "./pages/AccessibilityPage";

// Claimer Journey Pages
import ClaimFormPage from "./pages/claimer/ClaimForm";
import OtpVerificationPage from "./pages/claimer/OtpVerification";
import ClaimConfirmedPage from "./pages/claimer/ClaimConfirmed";
import QrClaimConfirmedPage from "./pages/claimer/QrClaimConfirmed";
import ClaimStatusPage from "./pages/claimer/ClaimStatus";
import JoinWaitlistPage from "./pages/claimer/JoinWaitlist";
import WaitlistConfirmationPage from "./pages/claimer/WaitlistConfirmation";
import MagicLinkClaimPage from "./pages/claimer/MagicLinkClaim";
import WaitlistEmailPreviewPage from "./pages/claimer/WaitlistEmailPreview";

// Dashboard Pages
import SponsorDashboard from "./pages/dashboard/SponsorDashboard";
import ClaimerDashboard from "./pages/dashboard/ClaimerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

// Admin Pages
import CausesManagement from "./pages/admin/CausesManagement";
import CauseImageUpload from '@/pages/admin/CauseImageUpload';
import CampaignApprovals from "./pages/admin/CampaignApprovals";
import LogoReview from "./pages/admin/LogoReview";
import ClaimsManagement from "./pages/admin/ClaimsManagement";
import PartnerClaims from "./pages/admin/PartnerClaims";
import Shipping from "./pages/admin/Shipping";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import QrScanner from "./pages/admin/QrScanner";
import QrCodeClaims from "./pages/admin/QrCodeClaims";
// import ClaimDetails from '@/pages/admin/claims/ClaimDetails';
import DistributionSettings from './pages/admin/DistributionSettings';
import EditCause from './pages/admin/EditCause';
import WaitlistManagement from "./pages/admin/WaitlistManagement";
import CauseContentEditor from "./pages/admin/CauseContentEditor";

// Wrapper component for content editor
const CauseContentEditorWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <CauseContentEditor causeId={id!} />;
};

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const location = useLocation();
  React.useEffect(() => {
    // Always reset scroll position to top-left on route changes
    window.scrollTo(0, 0);
  }, [location.pathname, location.search, location.hash]);
  return null;
};

// Test Components
// import PaymentTest from "./components/PaymentTest";
import NumberInputDemo from "./components/NumberInputDemo";

// Dynamic Cause Page
import DynamicCausePage from "./pages/DynamicCausePage";

// Widget Pages
import SponsorWidget from "./pages/widget/SponsorWidget";

// Create QueryClient once, outside of component
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/causes" element={<CausesPage />} />
                <Route path="/all-causes" element={<AllCausesPage />} />
                <Route path="/cause/:id" element={<DynamicCausePage />} />
                <Route path="/create-cause" element={<CreateCausePage />} />
                <Route path="/sponsor/new" element={<SponsorFormPage />} />
                <Route path="/sponsorship/confirmation" element={<SponsorshipConfirmation />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Widget Routes - No Layout */}
                <Route path="/widget/sponsor" element={<SponsorWidget />} />

                {/* Test Routes */}
                {/* <Route path="/test/payment" element={<PaymentTest />} /> */}
                <Route path="/demo/number-input" element={<NumberInputDemo />} />

                {/* Public Information Pages */}
                <Route path="/why-sponsor" element={<WhySponsorPage />} />
                <Route path="/why-claim" element={<WhyClaimPage />} />
                <Route path="/csr" element={<CsrPage />} />
                <Route path="/sponsor/logo-reupload/:sponsorshipId" element={<LogoReuploadPage />} />

                {/* Legal & Support Pages */}
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/developers" element={<DevelopersPage />} />
                <Route path="/developers/register" element={<DevelopersRegisterPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/accessibility" element={<AccessibilityPage />} />

                {/* Claimer Journey Routes */}
                {/* Fix route ordering - more specific routes must come before dynamic routes */}
                <Route path="/claim/verify" element={<OtpVerificationPage />} />
                <Route path="/claim/confirmed" element={<ClaimConfirmedPage />} />
                <Route path="/claim/qr-confirmed" element={<QrClaimConfirmedPage />} />
                <Route path="/claim/magic-link" element={<MagicLinkClaimPage />} />
                <Route path="/claim/status/:id" element={<ClaimStatusPage />} />
                <Route path="/claim/:id" element={<ClaimFormPage />} />
                <Route path="/waitlist/:id" element={<JoinWaitlistPage />} />
                <Route path="/waitlist/confirmed" element={<WaitlistConfirmationPage />} />
                <Route path="/claim/magic-link" element={<MagicLinkClaimPage />} />
                <Route path="/demo/waitlist-email" element={<WaitlistEmailPreviewPage />} />

                {/* Dashboard Routes */}
                <Route path="/dashboard/sponsor" element={
                  <ProtectedRoute allowedRoles={['sponsor', 'admin']}>
                    <SponsorDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/claimer" element={
                  <ProtectedRoute allowedRoles={['claimer', 'admin', 'user']}>
                    <ClaimerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Unauthorized Route */}
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Redirect old visitor dashboard to appropriate dashboard */}
                <Route path="/dashboard/visitor" element={<Navigate to="/dashboard/claimer" replace />} />
                <Route path="/dashboard/user" element={<Navigate to="/dashboard/claimer" replace />} />

                {/* Admin Routes */}
                <Route path="/admin/causes" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CausesManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/approvals" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CampaignApprovals />
                  </ProtectedRoute>
                } />
                <Route path="/admin/waitlist" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <WaitlistManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/logos" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <LogoReview />
                  </ProtectedRoute>
                } />
                <Route path="/admin/claims" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ClaimsManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/partner-claims" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PartnerClaims />
                  </ProtectedRoute>
                } />
                <Route path="/admin/shipping" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Shipping />
                  </ProtectedRoute>
                } />
                <Route path="/admin/analytics" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/admin/qr-scanner" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <QrScanner />
                  </ProtectedRoute>
                } />
                <Route path="/admin/qr-claims" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <QrCodeClaims />
                  </ProtectedRoute>
                } />
                {/* <Route path="/admin/claims/:id" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ClaimDetails />
                  </ProtectedRoute>
                } /> */}
                <Route path="/admin/causes/:id/upload-image" element={
                  <CauseImageUpload />
                } />
                <Route path="/admin/causes/:id/edit" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EditCause />
                  </ProtectedRoute>
                } />
                <Route path="/admin/distribution-settings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DistributionSettings />
                  </ProtectedRoute>
                } />
                <Route path="/admin/causes/:id/content" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CauseContentEditorWrapper />
                  </ProtectedRoute>
                } />

                {/* Dynamic Cause Routes */}
                <Route path="/causes/:id" element={<DynamicCausePage />} />

                {/* Catch-all Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
