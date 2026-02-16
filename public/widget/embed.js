/**
 * CauseConn Sponsor Widget Embed Script
 * 
 * This script allows you to easily embed the CauseConn sponsor flow
 * into your website or application.
 * 
 * Usage:
 * 1. Include this script in your HTML
 * 2. Add a container div with id="causeconn-sponsor-widget"
 * 3. The widget will automatically load
 * 
 * Example:
 * <div id="causeconn-sponsor-widget"></div>
 * <script src="https://yourdomain.com/widget/embed.js"></script>
 */

(function () {
    'use strict';

    // Configuration
    const WIDGET_CONFIG = {
        baseUrl: 'http://localhost:8085', // Change to production URL
        containerId: 'causeconn-sponsor-widget',
        defaultWidth: '100%',
        defaultMinHeight: '600px',
    };

    // Parse data attributes from container
    function getWidgetConfig() {
        const container = document.getElementById(WIDGET_CONFIG.containerId);
        if (!container) {
            console.error(`Container with id "${WIDGET_CONFIG.containerId}" not found`);
            return null;
        }

        return {
            causeId: container.dataset.causeId || '',
            apiKey: container.dataset.apiKey || '',
            affiliateId: container.dataset.affiliateId || '',
            theme: container.dataset.theme || 'light',
            width: container.dataset.width || WIDGET_CONFIG.defaultWidth,
            minHeight: container.dataset.minHeight || WIDGET_CONFIG.defaultMinHeight,
        };
    }

    // Build widget URL with parameters
    function buildWidgetUrl(config) {
        const params = new URLSearchParams();
        if (config.causeId) params.append('causeId', config.causeId);
        if (config.apiKey) params.append('apiKey', config.apiKey);
        if (config.affiliateId) params.append('affiliateId', config.affiliateId);
        if (config.theme) params.append('theme', config.theme);

        return `${WIDGET_CONFIG.baseUrl}/widget/sponsor?${params.toString()}`;
    }

    // Create and inject iframe
    function createWidget(config) {
        const container = document.getElementById(WIDGET_CONFIG.containerId);
        if (!container) return;

        const iframe = document.createElement('iframe');
        iframe.id = 'causeconn-widget-iframe';
        iframe.src = buildWidgetUrl(config);
        iframe.style.width = config.width;
        iframe.style.minHeight = config.minHeight;
        iframe.style.border = 'none';
        iframe.style.display = 'block';
        iframe.allow = 'payment';
        iframe.setAttribute('scrolling', 'no');

        container.appendChild(iframe);

        return iframe;
    }

    // Handle messages from widget
    function handleWidgetMessage(event) {
        // In production, verify origin
        // if (event.origin !== WIDGET_CONFIG.baseUrl) return;

        const { type, data } = event.data;

        switch (type) {
            case 'WIDGET_READY':
                console.log('[CauseConn Widget] Ready');
                // Trigger custom event
                window.dispatchEvent(new CustomEvent('causeconnWidgetReady'));
                break;

            case 'WIDGET_RESIZE':
                const iframe = document.getElementById('causeconn-widget-iframe');
                if (iframe && data && data.height) {
                    iframe.style.height = `${data.height}px`;
                }
                break;

            case 'STEP_CHANGE':
                console.log('[CauseConn Widget] Step changed:', data.step);
                window.dispatchEvent(new CustomEvent('causeconnStepChange', { detail: data }));
                break;

            case 'SPONSOR_SUCCESS':
                console.log('[CauseConn Widget] Sponsorship successful:', data);
                window.dispatchEvent(new CustomEvent('causeconnSponsorSuccess', { detail: data }));
                break;

            case 'SPONSOR_ERROR':
                console.error('[CauseConn Widget] Error:', data);
                window.dispatchEvent(new CustomEvent('causeconnSponsorError', { detail: data }));
                break;
        }
    }

    // Initialize widget
    function init() {
        const config = getWidgetConfig();
        if (!config) return;

        createWidget(config);
        window.addEventListener('message', handleWidgetMessage);

        console.log('[CauseConn Widget] Initialized');
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose public API
    window.CauseConnWidget = {
        version: '1.0.0',
        reload: function () {
            const container = document.getElementById(WIDGET_CONFIG.containerId);
            if (container) {
                container.innerHTML = '';
                init();
            }
        }
    };
})();
