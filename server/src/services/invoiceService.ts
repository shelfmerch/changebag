import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { sendInvoiceEmail } from './emailService';
import { MongoClient, ObjectId } from 'mongodb';

interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  sponsor: {
    organizationName: string;
    contactName: string;
    email: string;
    phone: string;
  };
  cause: {
    title: string;
    description?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paymentId: string;
  orderId: string;
}

// Helper function to safely get text or return placeholder
const safeText = (text: string | undefined | null, placeholder: string = 'N/A') => {
  return text && text.trim() ? text.trim() : placeholder;
};

// Helper function to validate and format currency
const validateCurrency = (currency: string): string => {
  const validCurrencies = ['INR', 'USD', 'EUR'];
  return validCurrencies.includes(currency?.toUpperCase()) ? currency.toUpperCase() : 'INR';
};

// Helper function to validate and format amount
const validateAmount = (amount: number): number => {
  return typeof amount === 'number' && !isNaN(amount) && amount >= 0 ? amount : 0;
};

// Helper function to validate quantity
const validateQuantity = (quantity: number | undefined | null): number => {
  if (quantity === undefined || quantity === null) {
    console.warn('Quantity is undefined or null, using default value 1');
    return 1;
  }
  const num = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
  return typeof num === 'number' && !isNaN(num) && num > 0 ? num : 1;
};

// Helper function to validate unit price
const validateUnitPrice = (unitPrice: number | undefined | null): number => {
  if (unitPrice === undefined || unitPrice === null) {
    console.warn('Unit price is undefined or null, using default value 0');
    return 0;
  }
  const num = typeof unitPrice === 'string' ? parseFloat(unitPrice) : unitPrice;
  return typeof num === 'number' && !isNaN(num) && num >= 0 ? num : 0;
};

export const generateInvoicePDF = async (data: InvoiceData): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Generating PDF with data:', {
        invoiceNumber: data.invoiceNumber,
        itemsCount: data.items.length,
        items: data.items,
        total: data.total,
        currency: data.currency
      });
      
      console.log('PDF data validation:', {
        hasItems: !!data.items,
        itemsLength: data.items?.length || 0,
        itemsType: typeof data.items,
        isArray: Array.isArray(data.items),
        firstItem: data.items?.[0] || 'No items'
      });

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Create invoices directory if it doesn't exist
      const invoicesDir = path.join(uploadsDir, 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `invoice-${data.invoiceNumber}-${Date.now()}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
      });

      // --- TABLE ROW/CELL CLIPPING ---
      // Helper function to create a table row
      const createTableRow = (y: number, cells: string[], widths: number[], startX: number = 50) => {
        let currentX = startX;
        cells.forEach((cell, index) => {
          doc.fontSize(10)
             .font('Helvetica')
             .fillColor('#000000');
          const cellX = currentX + 5;
          const cellY = y + 5;
          // Clip/ellipsize if too long
          let text = cell;
          if (text.length > 40) text = text.slice(0, 37) + '...';
          doc.text(text, cellX, cellY, {
            width: widths[index] - 10,
            align: 'left',
            ellipsis: true,
            height: 15
          });
          currentX += widths[index];
        });
      };
      // Helper function to create table header
      const createTableHeader = (y: number, headers: string[], widths: number[], startX: number = 50) => {
        let currentX = startX;
        headers.forEach((header, index) => {
          doc.fontSize(10)
             .font('Helvetica-Bold')
             .fillColor('#000000');
          const cellX = currentX + 5;
          const cellY = y + 5;
          let text = header;
          if (text.length > 40) text = text.slice(0, 37) + '...';
          doc.text(text, cellX, cellY, {
            width: widths[index] - 10,
            align: 'left',
            ellipsis: true,
            height: 15
          });
          currentX += widths[index];
        });
      };

      // Pipe PDF to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Helper function to format currency
      const formatCurrency = (amount: number) => {
        return `${data.currency} ${amount.toFixed(2)}`;
      };

      // Helper function to draw a line
      const drawLine = (y: number, width: number = 500) => {
        doc.moveTo(50, y).lineTo(50 + width, y).stroke();
      };

      // --- IMAGE ---
      const imagePath = path.join(__dirname, '../../uploads/shelf.jpg');
      const imgWidth = 120;
      const imgHeight = 60;
      const imgX = doc.page.width - imgWidth - 40; // 40pt right margin
      const imgY = 40;
      console.log('Looking for image at:', imagePath, 'Exists:', fs.existsSync(imagePath));
      if (fs.existsSync(imagePath)) {
        doc.image(imagePath, imgX, imgY, { width: imgWidth, height: imgHeight });
      } else {
        console.warn('Invoice logo image not found at:', imagePath);
      }

      // --- HEADER TEXT ---
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('Changebag', 50, 50, { width: imgX - 60, ellipsis: true });

      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text('Making a difference, one tote at a time', 50, 85, { width: imgX - 60, ellipsis: true })
         .moveDown(0.5);

      // Invoice Title and Details
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('INVOICE', 50, 120);

      // Invoice details in two columns
      const leftColumnX = 50;
      const rightColumnX = 300;
      let currentY = 160;

      // Left column - Invoice details
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#374151')
         .text('Invoice Details:', leftColumnX, currentY);

      currentY += 20;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text(`Invoice #: ${safeText(data.invoiceNumber)}`, leftColumnX, currentY);
      
      currentY += 15;
      doc.text(`Date: ${data.date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, leftColumnX, currentY);
      
      currentY += 15;
      doc.text(`Due Date: ${data.dueDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, leftColumnX, currentY);

      // Right column - Payment details
      currentY = 160;
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#374151')
         .text('Payment Information:', rightColumnX, currentY);

      currentY += 20;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text(`Payment ID: ${safeText(data.paymentId)}`, rightColumnX, currentY);
      
      currentY += 15;
      doc.text(`Order ID: ${safeText(data.orderId)}`, rightColumnX, currentY);
      
      currentY += 15;
      doc.text(`Status: Paid`, rightColumnX, currentY);

      // Sponsor Information
      currentY += 40;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('Bill To:', 50, currentY);

      currentY += 20;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#374151')
         .text(safeText(data.sponsor.organizationName), 50, currentY);
      
      currentY += 15;
      doc.text(safeText(data.sponsor.contactName), 50, currentY);
      
      currentY += 15;
      doc.text(safeText(data.sponsor.email), 50, currentY);
      
      currentY += 15;
      doc.text(safeText(data.sponsor.phone), 50, currentY);

      // Cause Information
      currentY += 30;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('Campaign:', 50, currentY);

      currentY += 20;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#374151')
         .text(safeText(data.cause.title), 50, currentY);
      
      if (data.cause.description) {
        currentY += 15;
        doc.text(safeText(data.cause.description), 50, currentY);
      }

      // Items Table
      currentY += 40;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('Items:', 50, currentY);

      currentY += 20;

      // Table dimensions
      const tableStartX = 50;
      const tableWidth = 500;
      const colWidths = [50, 200, 80, 100, 100]; // Item, Description, Qty, Unit Price, Total
      const headers = ['#', 'Description', 'Qty', 'Unit Price', 'Total'];

      // Draw table header background
      doc.rect(tableStartX, currentY - 5, tableWidth, 25)
         .fill('#f3f4f6');

      // Draw table header
      createTableHeader(currentY, headers, colWidths, tableStartX);

      // Draw header border
      doc.rect(tableStartX, currentY - 5, tableWidth, 25)
         .stroke();

      currentY += 25;

      // Draw table rows
      console.log('Rendering table with items:', data.items);
      console.log('Table position:', { currentY, tableStartX, tableWidth });
      
      if (data.items.length === 0) {
        console.warn('No items to render in table');
        // Add a placeholder row
        const placeholderRowY = currentY;
        const placeholderCells = ['1', 'No items available', '0', formatCurrency(0), formatCurrency(0)];
        
        // Draw placeholder row background
        doc.rect(tableStartX, placeholderRowY - 5, tableWidth, 25)
           .fill('#fef2f2');
        
        createTableRow(placeholderRowY, placeholderCells, colWidths, tableStartX);
        
        // Draw placeholder row border
        doc.rect(tableStartX, placeholderRowY - 5, tableWidth, 25)
           .stroke();
        
        currentY += 25;
      } else {
        data.items.forEach((item, index) => {
          const rowY = currentY + (index * 25);
          
          console.log(`Rendering item ${index + 1}:`, {
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            rowY
          });
          
          // Alternate row background
          if (index % 2 === 0) {
            doc.rect(tableStartX, rowY - 5, tableWidth, 25)
               .fill('#fafafa');
          }

          // Create row content
          const rowCells = [
            (index + 1).toString(),
            safeText(item.description),
            item.quantity.toString(),
            formatCurrency(item.unitPrice),
            formatCurrency(item.total)
          ];

          console.log(`Row ${index + 1} cells:`, rowCells);

          createTableRow(rowY, rowCells, colWidths, tableStartX);

          // Draw row border
          doc.rect(tableStartX, rowY - 5, tableWidth, 25)
           .stroke();
        });
        
        // Update currentY to after the table
        currentY += (data.items.length * 25);
      }

      // Add some space after the table
      currentY += 30;

      // Totals Section
      const totalsStartX = 350;
      const totalsWidth = 200;

      // Subtotal
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text('Subtotal:', totalsStartX, currentY);

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#374151')
         .text(formatCurrency(data.subtotal), totalsStartX + 100, currentY);

      currentY += 20;

      // Tax (if applicable)
      if (data.tax > 0) {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#6b7280')
           .text('Tax:', totalsStartX, currentY);

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#374151')
           .text(formatCurrency(data.tax), totalsStartX + 100, currentY);

        currentY += 20;
      }

      // Total
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('Total:', totalsStartX, currentY);

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#059669')
         .text(formatCurrency(data.total), totalsStartX + 100, currentY);

      // --- FOOTER ---
      // Always place footer at the bottom, centered, and never overflow
      const footerY = doc.page.height - 60;
      drawLine(footerY - 10);
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text('Thank you for your support!', 0, footerY, { align: 'center', width: doc.page.width, ellipsis: true });
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#9ca3af')
         .text('For questions about this invoice, please contact support@changebag.org', 0, footerY + 15, { align: 'center', width: doc.page.width, ellipsis: true });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Test function to debug PDF generation with hardcoded data
 */
export const testPDFGeneration = async (): Promise<string> => {
  const testData: InvoiceData = {
    invoiceNumber: 'TEST-INV-001',
    date: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    sponsor: {
      organizationName: 'Test Organization',
      contactName: 'Test Contact',
      email: 'test@example.com',
      phone: '1234567890',
    },
    cause: {
      title: 'Test Cause Campaign',
      description: 'This is a test cause for debugging',
    },
    items: [
      {
        description: 'Tote Bags for Test Cause Campaign',
        quantity: 5,
        unitPrice: 100,
        total: 500,
      },
    ],
    subtotal: 500,
    tax: 0,
    total: 500,
    currency: 'INR',
    paymentId: 'pay_test_123',
    orderId: 'order_test_123',
  };

  console.log('Testing PDF generation with data:', {
    itemsCount: testData.items.length,
    items: testData.items,
    total: testData.total
  });

  return await generateInvoicePDF(testData);
};

/**
 * Simple test function to create a minimal PDF with just a table
 */
export const testSimplePDF = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Create invoices directory if it doesn't exist
      const invoicesDir = path.join(uploadsDir, 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `simple-test-${Date.now()}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
      });

      // Pipe PDF to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Simple test - just add a title and a table
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('Simple PDF Test', 50, 50);

      // Create a simple table
      const tableY = 100;
      const tableStartX = 50;
      const tableWidth = 500;
      const colWidths = [50, 200, 80, 100, 100];
      const headers = ['#', 'Description', 'Qty', 'Price', 'Total'];

      // Draw table header
      doc.rect(tableStartX, tableY - 5, tableWidth, 25)
         .fill('#f3f4f6')
         .stroke();

      // Add header text
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('1', tableStartX + 5, tableY + 5)
         .text('Test Item', tableStartX + 55, tableY + 5)
         .text('5', tableStartX + 255, tableY + 5)
         .text('100', tableStartX + 335, tableY + 5)
         .text('500', tableStartX + 435, tableY + 5);

      // Add a data row
      const dataRowY = tableY + 25;
      doc.rect(tableStartX, dataRowY - 5, tableWidth, 25)
         .fill('#fafafa')
         .stroke();

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#000000')
         .text('1', tableStartX + 5, dataRowY + 5)
         .text('Tote Bags', tableStartX + 55, dataRowY + 5)
         .text('5', tableStartX + 255, dataRowY + 5)
         .text('100', tableStartX + 335, dataRowY + 5)
         .text('500', tableStartX + 435, dataRowY + 5);

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        console.log('Simple test PDF created at:', filePath);
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

export const generateAndSendInvoice = async (
  email: string,
  paymentData: {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    organizationName: string;
    contactName: string;
    phone: string;
    causeTitle: string;
    toteQuantity: number;
    unitPrice: number;
    shippingCost?: number;
    shippingCostPerTote?: number;
    sponsorshipId?: string;
    causeId?: string;
  }
): Promise<void> => {
  let client: MongoClient | null = null;
  
  try {
    console.log('Generating invoice for payment:', paymentData.paymentId);

    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI as string;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    // List available collections for debugging
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Log initial payment data
    console.log('Initial payment data received:', {
      organizationName: paymentData.organizationName,
      contactName: paymentData.contactName,
      phone: paymentData.phone,
      email: email,
      sponsorshipId: paymentData.sponsorshipId,
      causeId: paymentData.causeId
    });

    // Fetch and validate all required data
    let validatedData = {
      sponsor: {
        organizationName: safeText(paymentData.organizationName, 'Organization Name Not Available'),
        contactName: safeText(paymentData.contactName, 'Contact Name Not Available'),
        email: safeText(email, 'Email Not Available'),
        phone: safeText(paymentData.phone, 'Phone Not Available'),
      },
      cause: {
        title: safeText(paymentData.causeTitle, 'Campaign Title Not Available'),
        description: undefined as string | undefined,
      },
      items: [] as Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }>,
      currency: validateCurrency(paymentData.currency),
      paymentId: safeText(paymentData.paymentId, 'Payment ID Not Available'),
      orderId: safeText(paymentData.orderId, 'Order ID Not Available'),
    };

    // If we have complete sponsor data in paymentData, use it instead of database query
    if (paymentData.contactName && paymentData.contactName.trim() && 
        paymentData.phone && paymentData.phone.trim()) {
      console.log('Using complete sponsor data from paymentData');
      validatedData.sponsor.contactName = safeText(paymentData.contactName);
      validatedData.sponsor.phone = safeText(paymentData.phone);
    }

    console.log('Initial validated data:', {
      sponsor: validatedData.sponsor,
      cause: validatedData.cause
    });

    // Fetch additional cause details if causeId is provided
    if (paymentData.causeId) {
      try {
        const cause = await db.collection('causes').findOne(
          { _id: new ObjectId(paymentData.causeId) },
          { projection: { title: 1, description: 1, about: 1 } }
        );
        
        if (cause) {
          validatedData.cause.title = safeText(cause.title, validatedData.cause.title);
          validatedData.cause.description = safeText(cause.description || cause.about);
        }
      } catch (error) {
        console.warn('Failed to fetch cause details:', error);
      }
    }

    // Fetch additional sponsor details if sponsorshipId is provided
    if (paymentData.sponsorshipId) {
      try {
        console.log('Fetching sponsorship details for ID:', paymentData.sponsorshipId);
        
        const sponsorship = await db.collection('sponsorships').findOne(
          { _id: new ObjectId(paymentData.sponsorshipId) }
        );
        
        console.log('Raw sponsorship data:', sponsorship);
        
        if (sponsorship) {
          // Check for different possible field names
          const orgName = sponsorship.organizationName || sponsorship.organization || sponsorship.companyName || sponsorship.name;
          const contactName = sponsorship.contactName || sponsorship.contact || sponsorship.name || sponsorship.fullName;
          const sponsorEmail = sponsorship.email || sponsorship.contactEmail;
          const sponsorPhone = sponsorship.phone || sponsorship.contactPhone || sponsorship.phoneNumber;
          
          console.log('Extracted sponsor data:', {
            orgName,
            contactName,
            sponsorEmail,
            sponsorPhone,
            originalFields: {
              organizationName: sponsorship.organizationName,
              contactName: sponsorship.contactName,
              email: sponsorship.email,
              phone: sponsorship.phone
            }
          });
          
          validatedData.sponsor.organizationName = safeText(orgName, validatedData.sponsor.organizationName);
          validatedData.sponsor.contactName = safeText(contactName, validatedData.sponsor.contactName);
          validatedData.sponsor.email = safeText(sponsorEmail, validatedData.sponsor.email);
          validatedData.sponsor.phone = safeText(sponsorPhone, validatedData.sponsor.phone);
          
          console.log('Updated sponsor data after database fetch:', validatedData.sponsor);
        } else {
          console.log('No sponsorship found with ID:', paymentData.sponsorshipId);
        }
      } catch (error) {
        console.warn('Failed to fetch sponsorship details:', error);
      }
    } else {
      console.log('No sponsorshipId provided - using data from paymentData');
    }

    // Validate and build items array
    console.log('Raw payment data for items:', {
      toteQuantity: paymentData.toteQuantity,
      unitPrice: paymentData.unitPrice,
      shippingCost: paymentData.shippingCost,
      shippingCostPerTote: paymentData.shippingCostPerTote,
      types: {
        toteQuantity: typeof paymentData.toteQuantity,
        unitPrice: typeof paymentData.unitPrice,
        shippingCost: typeof paymentData.shippingCost,
        shippingCostPerTote: typeof paymentData.shippingCostPerTote
      }
    });

    // Convert to numbers and validate
    const rawQuantity = typeof paymentData.toteQuantity === 'string' ? 
      parseInt(paymentData.toteQuantity, 10) : paymentData.toteQuantity;
    const rawUnitPrice = typeof paymentData.unitPrice === 'string' ? 
      parseFloat(paymentData.unitPrice) : paymentData.unitPrice;

    console.log('Converted values:', {
      rawQuantity,
      rawUnitPrice,
      types: {
        rawQuantity: typeof rawQuantity,
        rawUnitPrice: typeof rawUnitPrice
      }
    });

    const validatedQuantity = validateQuantity(rawQuantity);
    const validatedUnitPrice = validateUnitPrice(rawUnitPrice);
    const itemTotal = validatedQuantity * validatedUnitPrice;

    console.log('Validated values:', {
      validatedQuantity,
      validatedUnitPrice,
      itemTotal
    });

    // Always create at least one item, even if data is missing
    if (validatedQuantity > 0 && validatedUnitPrice > 0) {
      validatedData.items = [
        {
          description: `Tote Bags for ${validatedData.cause.title} Campaign`,
          quantity: validatedQuantity,
          unitPrice: validatedUnitPrice,
          total: itemTotal,
        },
      ];

      // Add shipping as an item if present
      const shippingCost = typeof paymentData.shippingCost === 'string' ? parseFloat(paymentData.shippingCost) : paymentData.shippingCost;
      const shippingCostPerTote = typeof paymentData.shippingCostPerTote === 'string' ? parseFloat(paymentData.shippingCostPerTote) : paymentData.shippingCostPerTote;
      const normalizedShippingCost = validateAmount(shippingCost as number);
      const normalizedShippingPerTote = validateUnitPrice(shippingCostPerTote as number) || (validatedQuantity > 0 ? normalizedShippingCost / validatedQuantity : 0);

      if (normalizedShippingCost > 0) {
        validatedData.items.push({
          description: 'Shipping',
          quantity: validatedQuantity,
          unitPrice: normalizedShippingPerTote,
          total: normalizedShippingCost,
        });
      }
    } else {
      console.warn('Invalid quantity or unit price, using fallback values');
      // Use payment amount as fallback
      const fallbackQuantity = 1;
      const fallbackUnitPrice = paymentData.amount / 100; // Convert from paise to rupees
      const fallbackTotal = fallbackQuantity * fallbackUnitPrice;
      
      validatedData.items = [
        {
          description: `Tote Bags for ${validatedData.cause.title} Campaign`,
          quantity: fallbackQuantity,
          unitPrice: fallbackUnitPrice,
          total: fallbackTotal,
        },
      ];
      console.log('Created fallback item:', validatedData.items[0]);
    }

    console.log('Final items array:', validatedData.items);
    console.log('Items array details:', {
      length: validatedData.items.length,
      isEmpty: validatedData.items.length === 0,
      items: validatedData.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      }))
    });

    // Calculate totals
    const subtotal = validatedData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = 0; // No tax for now
    const total = subtotal + tax;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Calculate dates
    const date = new Date();
    const dueDate = new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    // Build complete InvoiceData object
    const invoiceData: InvoiceData = {
      invoiceNumber,
      date,
      dueDate,
      sponsor: validatedData.sponsor,
      cause: validatedData.cause,
      items: validatedData.items,
      subtotal,
      tax,
      total,
      currency: validatedData.currency,
      paymentId: validatedData.paymentId,
      orderId: validatedData.orderId,
    };

    // Log validation results
    console.log('Invoice data validation completed:', {
      invoiceNumber,
      sponsor: validatedData.sponsor.organizationName,
      cause: validatedData.cause.title,
      itemsCount: validatedData.items.length,
      total: invoiceData.total,
      currency: invoiceData.currency,
    });

    // Log final sponsor data that will be used in PDF
    console.log('Final sponsor data for PDF:', {
      organizationName: invoiceData.sponsor.organizationName,
      contactName: invoiceData.sponsor.contactName,
      email: invoiceData.sponsor.email,
      phone: invoiceData.sponsor.phone,
    });

    // Generate PDF
    const pdfPath = await generateInvoicePDF(invoiceData);
    console.log('Invoice PDF generated at:', pdfPath);

    // Send email with invoice
    await sendInvoiceEmail(email, {
      organizationName: validatedData.sponsor.organizationName,
      causeTitle: validatedData.cause.title,
      invoiceNumber,
      total: paymentData.amount / 100, // Convert from paise to rupees
      currency: validatedData.currency,
    }, pdfPath);

    console.log('Invoice sent successfully to:', email);

    // Clean up database connection
    if (client) {
      await client.close();
    }

    // Clean up PDF file after sending (optional)
    // For debugging, we'll keep the PDF for longer or disable cleanup entirely
    const CLEANUP_DELAY = process.env.NODE_ENV === 'development' ? 300000 : 60000; // 5 minutes in dev, 1 minute in prod
    const DISABLE_CLEANUP = process.env.DISABLE_PDF_CLEANUP === 'true';
    
    if (!DISABLE_CLEANUP) {
      setTimeout(() => {
        try {
          fs.unlinkSync(pdfPath);
          console.log('Invoice PDF cleaned up:', pdfPath);
        } catch (error) {
          console.log('Could not clean up invoice PDF:', error);
        }
      }, CLEANUP_DELAY);
    } else {
      console.log('PDF cleanup disabled - file will remain at:', pdfPath);
    }

  } catch (error) {
    console.error('Error generating and sending invoice:', error);
    // Ensure client is closed even on error
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
    throw error;
  }
}; 