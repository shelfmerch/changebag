import axios from 'axios';
import config from '@/config';
export class PaymentService {
    constructor() {
        this.baseUrl = config.apiUrl;
    }
    /**
     * Create a Razorpay order for sponsorship
     */
    async createPaymentOrder(sponsorshipData) {
        try {
            console.log('Creating payment order with data:', sponsorshipData);
            console.log('API URL:', `${this.baseUrl}/api/payments/create-order`);
            const token = localStorage.getItem('token');
            const response = await axios.post(`${this.baseUrl}/api/payments/create-order`, sponsorshipData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });
            console.log('Payment order created successfully:', response.data);
            return response.data.order;
        }
        catch (error) {
            console.error('Error creating payment order:', error);
            console.error('Error response:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to create payment order');
        }
    }
    /**
     * Confirm payment after successful Razorpay payment
     */
    async confirmPayment(paymentData) {
        try {
            console.log('Confirming payment with data:', paymentData);
            const token = localStorage.getItem('token');
            const response = await axios.post(`${this.baseUrl}/api/payments/confirm-payment`, paymentData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });
            console.log('Payment confirmed successfully:', response.data);
            return response.data;
        }
        catch (error) {
            console.error('Error confirming payment:', error);
            console.error('Error response:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to confirm payment');
        }
    }
    /**
     * Get payment status
     */
    async getPaymentStatus(razorpayOrderId) {
        try {
            console.log('Getting payment status for order:', razorpayOrderId);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${this.baseUrl}/api/payments/status/${razorpayOrderId}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });
            console.log('Payment status retrieved:', response.data);
            return response.data;
        }
        catch (error) {
            console.error('Error getting payment status:', error);
            console.error('Error response:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to get payment status');
        }
    }
    /**
     * Test payment service connection
     */
    async testPaymentService() {
        try {
            console.log('Testing payment service connection...');
            const response = await axios.get(`${this.baseUrl}/api/payments/test`);
            console.log('Payment service test response:', response.data);
            return response.data;
        }
        catch (error) {
            console.error('Error testing payment service:', error);
            console.error('Error response:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to test payment service');
        }
    }
}
// Export a singleton instance
export const paymentService = new PaymentService();
//# sourceMappingURL=paymentService.js.map