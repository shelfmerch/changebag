export interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    status: string;
    sponsorshipId?: string;
    key: string;
    email: string;
    organizationName: string;
    causeTitle: string;
}
export interface CreateOrderRequest {
    amount: number;
    currency: string;
    sponsorshipId?: string;
    email: string;
    organizationName: string;
    contactName: string;
    phone: string;
    causeTitle: string;
    toteQuantity?: number;
    unitPrice?: number;
}
export interface ConfirmPaymentRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}
export declare class PaymentService {
    private baseUrl;
    constructor();
    /**
     * Create a Razorpay order for sponsorship
     */
    createPaymentOrder(sponsorshipData: CreateOrderRequest): Promise<RazorpayOrder>;
    /**
     * Confirm payment after successful Razorpay payment
     */
    confirmPayment(paymentData: ConfirmPaymentRequest): Promise<any>;
    /**
     * Get payment status
     */
    getPaymentStatus(razorpayOrderId: string): Promise<{
        status: string;
        amount: number;
    }>;
    /**
     * Test payment service connection
     */
    testPaymentService(): Promise<any>;
}
export declare const paymentService: PaymentService;
