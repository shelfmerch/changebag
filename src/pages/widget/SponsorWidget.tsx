import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import OnboardingWizard from '@/components/sponsor/OnboardingWizard';
import axios from 'axios';
import config from '@/config';
import { Card, CardContent } from '@/components/ui/card';
import SponsorBenefits from '@/components/sponsor/SponsorBenefits';

// Widget event types for cross-origin communication
export type WidgetEventType =
    | 'SPONSOR_SUCCESS'
    | 'SPONSOR_ERROR'
    | 'STEP_CHANGE'
    | 'WIDGET_RESIZE'
    | 'WIDGET_READY';

interface WidgetEvent {
    type: WidgetEventType;
    data?: any;
}

const SponsorWidget: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Extract parameters from URL
    const causeId = searchParams.get('causeId');
    const apiKey = searchParams.get('apiKey');
    const affiliateId = searchParams.get('affiliateId');
    const theme = searchParams.get('theme') || 'light';

    // Send message to parent window
    const sendMessageToParent = (event: WidgetEvent) => {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(event, '*');
            console.log('[Widget] Sent message to parent:', event);
        }
    };

    // Notify parent of widget height changes for responsive iframe sizing
    useEffect(() => {
        const notifyResize = () => {
            const height = document.documentElement.scrollHeight;
            sendMessageToParent({
                type: 'WIDGET_RESIZE',
                data: { height }
            });
        };

        // Initial resize notification
        notifyResize();

        // Set up resize observer
        const resizeObserver = new ResizeObserver(notifyResize);
        resizeObserver.observe(document.body);

        // Notify parent that widget is ready
        sendMessageToParent({ type: 'WIDGET_READY' });

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // Notify parent when step changes
    useEffect(() => {
        sendMessageToParent({
            type: 'STEP_CHANGE',
            data: { step: currentStep }
        });
    }, [currentStep]);

    const handleSubmitComplete = async (formData: any) => {
        setIsLoading(true);

        try {
            console.log('[Widget] Submitting sponsorship:', formData);

            // Prepare payload with widget-specific metadata
            const payload = {
                ...formData,
                cause: causeId,
                // Add widget metadata
                source: 'widget',
                apiKey: apiKey || undefined,
                affiliateId: affiliateId || undefined,
                paymentStatus: formData.paymentId ? 'completed' : 'pending',
            };

            // Remove large logo data URL if present
            if (payload.logoUrl && payload.logoUrl.startsWith('data:')) {
                payload.logoUrl = 'logo_uploaded_client_side';
            }

            const apiEndpoint = `${config.apiUrl}/sponsorships`;
            console.log('[Widget] Sending to endpoint:', apiEndpoint);

            const response = await axios.post(apiEndpoint, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(apiKey && { 'X-API-Key': apiKey }),
                },
                withCredentials: false, // Widget mode doesn't use credentials
            });

            console.log('[Widget] Sponsorship created:', response.data);

            // Notify parent of success
            sendMessageToParent({
                type: 'SPONSOR_SUCCESS',
                data: {
                    sponsorshipId: response.data._id,
                    causeId: causeId,
                    organizationName: formData.organizationName,
                    toteQuantity: formData.toteQuantity,
                    totalAmount: formData.totalAmount,
                }
            });

        } catch (error: any) {
            console.error('[Widget] Error submitting sponsorship:', error);

            // Notify parent of error
            sendMessageToParent({
                type: 'SPONSOR_ERROR',
                data: {
                    message: error.response?.data?.message || 'Failed to submit sponsorship',
                    error: error.message,
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={`widget-container ${theme === 'dark' ? 'dark' : ''}`}
            style={{
                minHeight: '100vh',
                padding: '1rem',
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f9fafb', // Changed to light gray background to match main site
            }}
        >
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardContent className="p-6">
                                <OnboardingWizard
                                    initialCauseId={causeId}
                                    onComplete={handleSubmitComplete}
                                    isSubmitting={isLoading}
                                    isWidget={true}
                                    onStepChange={setCurrentStep}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <SponsorBenefits />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SponsorWidget;
