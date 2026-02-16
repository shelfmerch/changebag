import axios from 'axios';
import config from '@/config';

/**
 * Test function to create a Razorpay order
 */
export const testCreateOrder = async () => {
  try {
    console.log('Testing payment order creation...');
    console.log('API URL:', config.apiUrl);
    
    // First, test the connection with a simple GET request
    try {
      const testResponse = await axios.get(`${config.apiUrl}/payments/test`);
      console.log('Test endpoint response:', testResponse.data);
    } catch (error) {
      console.error('Error connecting to test endpoint:', error);
    }
    
    // Now try to create an order
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${config.apiUrl}/payments/create-order`,
      {
        amount: 100, // 100 rupees
        currency: 'INR',
        email: 'test@example.com',
        organizationName: 'Test Organization',
        contactName: 'Test Contact',
        phone: '1234567890',
        causeTitle: 'Test Cause'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : 'Bearer mock_token_test',
        },
      }
    );
    
    console.log('Order created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error in test payment:', error);
    console.error('Error response:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to test payment order');
  }
};

/**
 * Test function to get payment status
 */
export const testGetPaymentStatus = async (orderId: string) => {
  try {
    console.log('Testing payment status for order:', orderId);
    
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${config.apiUrl}/payments/status/${orderId}`,
      {
        headers: {
          'Authorization': token ? `Bearer ${token}` : 'Bearer mock_token_test',
        },
      }
    );
    
    console.log('Payment status retrieved:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error getting payment status:', error);
    console.error('Error response:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to get payment status');
  }
};

export default testCreateOrder;