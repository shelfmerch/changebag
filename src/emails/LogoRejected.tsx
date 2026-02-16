import React from 'react';

interface LogoRejectedEmailProps {
  organizationName: string;
  causeTitle: string;
  rejectionReason: string;
  sponsorshipId: string;
}

export const LogoRejectedEmail: React.FC<LogoRejectedEmailProps> = ({
  organizationName,
  causeTitle,
  rejectionReason,
  sponsorshipId,
}) => {
  // Create a secure reupload link
  const reuploadLink = `https://changebag.org/sponsor/logo-reupload/${sponsorshipId}`;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Logo Update Required</h2>
      <p>Dear {organizationName},</p>
      
      <p>Thank you for your support of the <strong>{causeTitle}</strong> campaign.</p>
      
      <p>We've reviewed your submitted logo and unfortunately, we're unable to approve it in its current form.</p>
      
      <div style={{ backgroundColor: '#f4f4f4', padding: '20px', margin: '20px 0', borderRadius: '5px' }}>
        <p style={{ marginTop: '0' }}><strong>Reason for rejection:</strong></p>
        <p>{rejectionReason}</p>
      </div>
      
      <p><strong>What to do next:</strong></p>
      <p>Please upload a revised logo that addresses the issues mentioned above using the button below:</p>
      
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a 
          href={reuploadLink}
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block'
          }}
        >
          Upload New Logo
        </a>
      </div>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br/>The changebag Team</p>
    </div>
  );
};

export default LogoRejectedEmail;