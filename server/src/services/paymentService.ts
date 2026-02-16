import axios from 'axios';

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  sponsorshipId: string;
  key: string;
}

export interface PaymentConfirmation {
  sponsorshipId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  status: string;
  email: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.API_URL || 'http://localhost:3000';
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Create a Razorpay order for sponsorship
   */
  async createPaymentOrder(sponsorshipData: {
    amount: number;
    currency: string;
    sponsorshipId: string;
    email: string;
    organizationName: string;
    causeTitle: string;
  }): Promise<RazorpayOrder> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${this.baseUrl}/api/payments/create-order`,
        sponsorshipData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating payment order:', error);
      throw new Error(error.response?.data?.message || 'Failed to create payment order');
    }
  }

  /**
   * Confirm payment and send email confirmation
   */
  async confirmPayment(paymentData: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
    sponsorshipId: string;
    email: string;
  }): Promise<PaymentConfirmation> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${this.baseUrl}/api/payments/confirm`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      throw new Error(error.response?.data?.message || 'Failed to confirm payment');
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(razorpayOrderId: string): Promise<{ status: string; amount: number }> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${this.baseUrl}/api/payments/status/${razorpayOrderId}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error getting payment status:', error);
      throw new Error(error.response?.data?.message || 'Failed to get payment status');
    }
  }
}

export default PaymentService.getInstance(); 