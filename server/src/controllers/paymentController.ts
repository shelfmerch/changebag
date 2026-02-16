import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { generateAndSendInvoice, testPDFGeneration as testPDFService, testSimplePDF as testSimplePDFService } from '../services/invoiceService';

// Initialize Razorpay instance lazily
let razorpay: Razorpay | null = null;

const getRazorpayInstance = (): Razorpay => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
    }
    
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

interface CreateOrderRequest {
  amount: number;
  currency: string;
  email: string;
  organizationName: string;
  contactName: string;
  phone: string;
  causeTitle: string;
  causeId?: string;
  sponsorshipId?: string;
  toteQuantity?: number;
  unitPrice?: number;
  shippingCost?: number;
  shippingCostPerTote?: number;
  totalAmount?: number;
  qrCodeUrl?: string; // Add QR code URL field
}

interface ConfirmPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Test endpoint to verify payment service is working
 */
export const testPaymentService = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Payment service test endpoint called');
    
    // Check if Razorpay credentials are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      res.status(500).json({ 
        message: 'Razorpay credentials not configured',
        error: 'Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables',
        hasKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET
      });
      return;
    }

    // Test Razorpay instance initialization
    try {
      const razorpayInstance = getRazorpayInstance();
      console.log('Razorpay instance initialized successfully');
      
      res.json({
        message: 'Payment service is working',
        razorpayConfigured: true,
        keyId: process.env.RAZORPAY_KEY_ID.substring(0, 10) + '...',
        timestamp: new Date().toISOString()
      });
    } catch (razorpayError) {
      console.error('Razorpay initialization error:', razorpayError);
      res.status(500).json({ 
        message: 'Razorpay initialization failed',
        error: razorpayError instanceof Error ? razorpayError.message : 'Unknown Razorpay error',
        hasKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET
      });
    }
  } catch (error) {
    console.error('Payment service test error:', error);
    res.status(500).json({ 
      message: 'Payment service test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Test endpoint to generate a sample invoice
 */
export const testInvoiceGeneration = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Testing invoice generation with sample data');
    
    // Sample payment data
    const samplePaymentData = {
      paymentId: 'pay_test_' + Date.now(),
      orderId: 'order_test_' + Date.now(),
      amount: 50000, // 500 rupees in paise
      currency: 'INR',
      organizationName: 'Test Organization',
      contactName: 'Test Contact',
      phone: '1234567890',
      causeTitle: 'Test Cause',
      toteQuantity: 10,
      unitPrice: 50,
    };

    console.log('Sample payment data:', samplePaymentData);
    
    // Generate invoice
    await generateAndSendInvoice('test@example.com', samplePaymentData);
    
    res.json({
      message: 'Test invoice generated successfully',
      sampleData: samplePaymentData
    });
  } catch (error) {
    console.error('Test invoice generation error:', error);
    res.status(500).json({ 
      message: 'Test invoice generation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Test endpoint to debug PDF generation directly
 */
export const testPDFGeneration = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Testing PDF generation directly');
    
    // Test PDF generation with hardcoded data
    const pdfPath = await testPDFService();
    
    res.json({
      message: 'PDF generation test successful',
      pdfPath: pdfPath
    });
  } catch (error) {
    console.error('PDF generation test error:', error);
    res.status(500).json({ 
      message: 'PDF generation test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Test endpoint to create a simple PDF with just a table
 */
export const testSimplePDF = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Testing simple PDF generation');
    
    // Test simple PDF generation
    const pdfPath = await testSimplePDFService();
    
    res.json({
      message: 'Simple PDF generation test successful',
      pdfPath: pdfPath
    });
  } catch (error) {
    console.error('Simple PDF generation test error:', error);
    res.status(500).json({ 
      message: 'Simple PDF generation test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Endpoint to download/view the latest generated PDF
 */
export const getLatestPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads/invoices');
    
    if (!fs.existsSync(uploadsDir)) {
      res.status(404).json({ message: 'No invoices directory found' });
      return;
    }

    // Get the most recent PDF file
    const files = fs.readdirSync(uploadsDir)
      .filter(file => file.endsWith('.pdf'))
      .map(file => ({
        name: file,
        path: path.join(uploadsDir, file),
        stats: fs.statSync(path.join(uploadsDir, file))
      }))
      .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

    if (files.length === 0) {
      res.status(404).json({ message: 'No PDF files found' });
      return;
    }

    const latestFile = files[0];
    
    res.json({
      message: 'Latest PDF found',
      fileName: latestFile.name,
      filePath: latestFile.path,
      fileSize: latestFile.stats.size,
      lastModified: latestFile.stats.mtime
    });
  } catch (error) {
    console.error('Error getting latest PDF:', error);
    res.status(500).json({ 
      message: 'Failed to get latest PDF',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create a Razorpay order
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Creating Razorpay order with data:', req.body);
    console.log('Request headers:', req.headers);
    
    const { amount, currency, email, organizationName, contactName, phone, causeTitle, causeId, sponsorshipId, toteQuantity, unitPrice, shippingCost, shippingCostPerTote, totalAmount, qrCodeUrl }: CreateOrderRequest = req.body;

    console.log('Extracted values:', {
      amount,
      currency,
      email,
      organizationName,
      contactName,
      phone,
      causeTitle,
      causeId,
      sponsorshipId,
      toteQuantity,
      unitPrice,
      shippingCost,
      shippingCostPerTote,
      totalAmount,
      qrCodeUrl,
      types: {
        toteQuantity: typeof toteQuantity,
        unitPrice: typeof unitPrice,
        shippingCost: typeof shippingCost,
        shippingCostPerTote: typeof shippingCostPerTote
      }
    });

    // Validate required fields
    if (!amount || !currency || !email || !organizationName || !contactName || !phone || !causeTitle) {
      console.log('Validation failed - missing fields:', {
        amount: !!amount,
        currency: !!currency,
        email: !!email,
        organizationName: !!organizationName,
        contactName: !!contactName,
        phone: !!phone,
        causeTitle: !!causeTitle
      });
      res.status(400).json({
        message: 'Missing required fields',
        required: ['amount', 'currency', 'email', 'organizationName', 'contactName', 'phone', 'causeTitle']
      });
      return;
    }

    // Validate amount (should be in paise for INR)
    if (currency === 'INR' && amount < 100) {
      res.status(400).json({
        message: 'Minimum amount for INR is 100 paise (₹1)'
      });
      return;
    }

    // Optional: Guard against very large amounts in non-production (Razorpay test-mode often limits high amounts)
    const isNonProd = (process.env.NODE_ENV || '').toLowerCase() !== 'production';
    if (isNonProd && currency.toUpperCase() === 'INR' && amount > 5000000) { // > ₹50,000
      console.warn('Amount exceeds suggested test-mode limit. Rejecting to avoid Razorpay failure.', {
        amountPaise: amount,
        amountRupees: (amount / 100).toFixed(2)
      });
      res.status(400).json({
        message: 'Amount exceeds test-mode limit (~₹50,000). Reduce quantity or split into smaller payments.',
        amount: amount,
        amountRupees: (amount / 100).toFixed(2)
      });
      return;
    }

    // Create order options
    const orderOptions = {
      amount: amount, // Amount is already in paise from frontend
      currency: currency.toUpperCase(),
      receipt: `receipt_${Date.now()}`,
      notes: {
        email: String(email || ''),
        organizationName: String(organizationName || ''),
        contactName: String(contactName || ''),
        phone: String(phone || ''),
        causeTitle: String(causeTitle || ''),
        causeId: String(causeId || ''),
        sponsorshipId: String(sponsorshipId || 'N/A'),
        toteQuantity: String(toteQuantity || 0),
        unitPrice: String(unitPrice || 0),
        shippingCost: String(shippingCost || 0),
        shippingCostPerTote: String(shippingCostPerTote || 0),
        qrCodeUrl: String(qrCodeUrl || '')
      },
      partial_payment: false
    };

    console.log('Order notes being stored:', {
      email,
      organizationName,
      contactName,
      phone,
      causeTitle,
      causeId: causeId || '',
      sponsorshipId: sponsorshipId || 'N/A',
      toteQuantity: toteQuantity || 0,
      unitPrice: unitPrice || 0,
      shippingCost: shippingCost || 0,
      shippingCostPerTote: shippingCostPerTote || 0,
      qrCodeUrl: qrCodeUrl || '',
      types: {
        toteQuantity: typeof (toteQuantity || 0),
        unitPrice: typeof (unitPrice || 0),
        shippingCost: typeof (shippingCost || 0),
        shippingCostPerTote: typeof (shippingCostPerTote || 0)
      }
    });

    console.log('Creating Razorpay order with options:', {
      ...orderOptions,
      amountInRupees: (orderOptions.amount / 100).toFixed(2)
    });

    // Create order with Razorpay
    const order = await getRazorpayInstance().orders.create(orderOptions);

    console.log('Razorpay order created successfully:', {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });

    // Return order details with Razorpay key for frontend
    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        receipt: order.receipt,
        key: process.env.RAZORPAY_KEY_ID,
        email,
        organizationName,
        contactName,
        phone,
        causeTitle,
        causeId,
        sponsorshipId,
        shippingCost: shippingCost || 0,
        shippingCostPerTote: shippingCostPerTote || 0,
        qrCodeUrl: qrCodeUrl || ''
      }
    });

  } catch (error: any) {
    // Razorpay SDK often returns non-Error objects; extract meaningful details
    const rpError = error?.error || error;
    const errorDescription = rpError?.description || rpError?.message || (typeof rpError === 'string' ? rpError : undefined);
    const errorCode = rpError?.code || rpError?.statusCode || rpError?.status;
    const meta = {
      errorCode,
      errorDescription,
      raw: rpError
    };

    console.error('Error creating Razorpay order:', meta);

    res.status(500).json({
      message: 'Failed to create payment order',
      error: errorDescription || 'Unknown error occurred',
      code: errorCode || 'UNKNOWN'
    });
  }
};

/**
 * Confirm payment after successful Razorpay payment
 */
export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Confirming payment with data:', req.body);
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature }: ConfirmPaymentRequest = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({
        message: 'Missing required payment verification fields',
        required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature']
      });
      return;
    }

    // Verify payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (signature !== razorpay_signature) {
      console.error('Payment signature verification failed');
      res.status(400).json({
        message: 'Payment verification failed',
        error: 'Invalid payment signature'
      });
      return;
    }

    console.log('Payment signature verified successfully');

    // Get payment details from Razorpay
    const payment = await getRazorpayInstance().payments.fetch(razorpay_payment_id);

    console.log('Payment details retrieved:', {
      id: payment.id,
      order_id: payment.order_id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency
    });

    // Fetch order details to get sponsor info from notes
    let order;
    try {
      order = await getRazorpayInstance().orders.fetch(payment.order_id);
    } catch (err) {
      order = null;
    }
    const notes = order?.notes || {};

    console.log('Retrieved order notes:', notes);
    console.log('Notes data types:', {
      toteQuantity: typeof notes.toteQuantity,
      unitPrice: typeof notes.unitPrice,
      shippingCost: typeof notes.shippingCost,
      shippingCostPerTote: typeof notes.shippingCostPerTote,
      values: {
        toteQuantity: notes.toteQuantity,
        unitPrice: notes.unitPrice,
        shippingCost: notes.shippingCost,
        shippingCostPerTote: notes.shippingCostPerTote
      }
    });

    // Only send invoice if payment is captured
    if (payment.status === 'captured') {
      try {
        // Get the complete sponsor data from the request body or session
        // The complete data should be available from the sponsorship creation
        const completeSponsorData = {
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: Number(payment.amount),
          currency: payment.currency,
          organizationName: notes.organizationName || '',
          contactName: notes.contactName || '',
          phone: notes.phone || '',
          causeTitle: notes.causeTitle || '',
          causeId: notes.causeId || '',
          toteQuantity: Number(notes.toteQuantity) || 0,
          unitPrice: Number(notes.unitPrice) || 0,
          shippingCost: Number(notes.shippingCost) || 0,
          shippingCostPerTote: Number(notes.shippingCostPerTote) || 0,
          qrCodeUrl: notes.qrCodeUrl || ''
        };

        console.log('Complete sponsor data for invoice:', completeSponsorData);
        console.log('Data types for invoice generation:', {
          toteQuantity: typeof completeSponsorData.toteQuantity,
          unitPrice: typeof completeSponsorData.unitPrice,
          values: {
            toteQuantity: completeSponsorData.toteQuantity,
            unitPrice: completeSponsorData.unitPrice
          }
        });

        console.log('Generating invoice with data:', completeSponsorData);
        
        await generateAndSendInvoice(
          notes.email || payment.email || '',
          completeSponsorData
        );
        console.log('Invoice generated and sent to sponsor.');
      } catch (err) {
        console.error('Failed to generate/send invoice:', err);
      }
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      payment: {
        id: payment.id,
        order_id: payment.order_id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method
      }
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    
    if (error instanceof Error) {
      res.status(500).json({
        message: 'Failed to confirm payment',
        error: error.message
      });
    } else {
      res.status(500).json({
        message: 'Failed to confirm payment',
        error: 'Unknown error occurred'
      });
    }
  }
};

/**
 * Get payment status for an order
 */
export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    
    console.log('Getting payment status for order:', orderId);

    if (!orderId) {
      res.status(400).json({
        message: 'Order ID is required'
      });
      return;
    }

    // Get order details from Razorpay
    const order = await getRazorpayInstance().orders.fetch(orderId);
    
    console.log('Order details retrieved:', {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      receipt: order.receipt
    });

    // Get payments for this order
    const payments = await getRazorpayInstance().orders.fetchPayments(orderId);

    console.log('Payments for order:', payments.items.length);

    // Find the most recent successful payment
    const successfulPayment = payments.items.find(payment => payment.status === 'captured');

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        receipt: order.receipt
      },
      payment: successfulPayment ? {
        id: successfulPayment.id,
        status: successfulPayment.status,
        amount: successfulPayment.amount,
        currency: successfulPayment.currency,
        method: successfulPayment.method
      } : null,
      totalPayments: payments.items.length
    });

  } catch (error) {
    console.error('Error getting payment status:', error);
    
    if (error instanceof Error) {
      res.status(500).json({
        message: 'Failed to get payment status',
        error: error.message
      });
    } else {
      res.status(500).json({
        message: 'Failed to get payment status',
        error: 'Unknown error occurred'
      });
    }
  }
}; 