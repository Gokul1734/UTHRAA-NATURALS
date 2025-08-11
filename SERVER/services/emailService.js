// Email service temporarily disabled for deployment
// const nodemailer = require('nodemailer');

// class EmailService {
//   constructor() {
//     this.transporter = null;
//     this.initializeTransporter();
//   }

//   async initializeTransporter() {
//     try {
//       // Try to create transporter with environment variables
//       if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
//         this.transporter = nodemailer.createTransporter({
//           host: process.env.EMAIL_HOST,
//           port: process.env.EMAIL_PORT || 587,
//           secure: process.env.EMAIL_SECURE === 'true',
//           auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS
//           }
//         });
//       } else {
//         // Fallback to Ethereal Email for testing
//         const testAccount = await nodemailer.createTestAccount();
//         this.transporter = nodemailer.createTransporter({
//           host: 'smtp.ethereal.email',
//           port: 587,
//           secure: false,
//           auth: {
//             user: testAccount.user,
//             pass: testAccount.pass
//           }
//         });
//         console.log('📧 Using Ethereal Email for testing');
//         console.log('📧 Test Account:', testAccount.user);
//         console.log('📧 Test Password:', testAccount.pass);
//       }

//       // Verify connection
//       await this.transporter.verify();
//       console.log('✅ Email service initialized successfully');
//     } catch (error) {
//       console.error('❌ Email service initialization failed:', error);
//       this.transporter = null;
//     }
//   }

//   async sendEmail(to, subject, html, text = null) {
//     if (!this.transporter) {
//       throw new Error('Email service not initialized');
//     }

//     try {
//       const mailOptions = {
//         from: process.env.EMAIL_FROM || '"Uthraa Naturals" <noreply@uthraanaturals.com>',
//         to: to,
//         subject: subject,
//         html: html,
//         text: text || this.htmlToText(html)
//       };

//       const info = await this.transporter.sendMail(mailOptions);
//       console.log('📧 Email sent successfully:', info.messageId);
      
//       // If using Ethereal, log the preview URL
//       if (info.messageId && info.messageId.includes('ethereal')) {
//         console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
//       }
      
//       return info;
//     } catch (error) {
//       console.error('❌ Email sending failed:', error);
//       throw error;
//     }
//   }

//   async sendBulkEmail(recipients, subject, html, text = null) {
//     if (!this.transporter) {
//       throw new Error('Email service not initialized');
//     }

//     const results = [];
//     const batchSize = 10; // Send emails in batches to avoid rate limiting

//     for (let i = 0; i < recipients.length; i += batchSize) {
//       const batch = recipients.slice(i, i + batchSize);
      
//       const promises = batch.map(async (recipient) => {
//         try {
//           const info = await this.sendEmail(recipient.email, subject, html, text);
//           return {
//             email: recipient.email,
//             success: true,
//             messageId: info.messageId
//           };
//         } catch (error) {
//           return {
//             email: recipient.email,
//             success: false,
//             error: error.message
//           };
//         }
//       });

//       const batchResults = await Promise.all(promises);
//       results.push(...batchResults);

//       // Add delay between batches to avoid rate limiting
//       if (i + batchSize < recipients.length) {
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
//     }

//     return results;
//   }

//   htmlToText(html) {
//     // Simple HTML to text conversion
//     return html
//       .replace(/<[^>]*>/g, '')
//       .replace(/&nbsp;/g, ' ')
//       .replace(/&amp;/g, '&')
//       .replace(/&lt;/g, '<')
//       .replace(/&gt;/g, '>')
//       .replace(/&quot;/g, '"')
//       .trim();
//   }

//   // Template methods for common emails
//   async sendWelcomeEmail(user) {
//     const subject = 'Welcome to Uthraa Naturals!';
//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #2c5530;">Welcome to Uthraa Naturals!</h2>
//         <p>Dear ${user.name},</p>
//         <p>Thank you for joining Uthraa Naturals! We're excited to have you as part of our community.</p>
//         <p>Discover our range of natural and organic products:</p>
//         <ul>
//           <li>🌿 Organic skincare products</li>
//           <li>🌱 Natural health supplements</li>
//           <li>🌸 Aromatherapy essentials</li>
//           <li>🌺 Herbal wellness products</li>
//         </ul>
//         <p>Start your journey towards natural wellness today!</p>
//         <p>Best regards,<br>The Uthraa Naturals Team</p>
//       </div>
//     `;
//     return this.sendEmail(user.email, subject, html);
//   }

//   async sendNewsletterEmail(user, newsletterData) {
//     const subject = newsletterData.subject || 'Uthraa Naturals Newsletter';
//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #2c5530;">${subject}</h2>
//         <div>${newsletterData.content}</div>
//         <p>Best regards,<br>The Uthraa Naturals Team</p>
//       </div>
//     `;
//     return this.sendEmail(user.email, subject, html);
//   }

//   async sendPromotionalEmail(user, promotionData) {
//     const subject = promotionData.subject || 'Special Offer from Uthraa Naturals';
//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #2c5530;">${subject}</h2>
//         <div>${promotionData.content}</div>
//         <p>Best regards,<br>The Uthraa Naturals Team</p>
//       </div>
//     `;
//     return this.sendEmail(user.email, subject, html);
//   }
// }

// module.exports = new EmailService();

// Temporary mock email service for deployment
class MockEmailService {
  constructor() {
    console.log('📧 Mock email service initialized (email functionality disabled for deployment)');
  }

  async sendEmail(to, subject, html, text = null) {
    console.log('📧 Mock email service: Email would be sent to', to, 'with subject:', subject);
    return { messageId: 'mock-message-id' };
  }

  async sendBulkEmail(recipients, subject, html, text = null) {
    console.log('📧 Mock email service: Bulk email would be sent to', recipients.length, 'recipients');
    return recipients.map(recipient => ({
      email: recipient.email,
      success: true,
      messageId: 'mock-message-id'
    }));
  }

  async sendWelcomeEmail(user) {
    console.log('📧 Mock email service: Welcome email would be sent to', user.email);
    return { messageId: 'mock-welcome-message-id' };
  }

  async sendNewsletterEmail(user, newsletterData) {
    console.log('📧 Mock email service: Newsletter email would be sent to', user.email);
    return { messageId: 'mock-newsletter-message-id' };
  }

  async sendPromotionalEmail(user, promotionData) {
    console.log('📧 Mock email service: Promotional email would be sent to', user.email);
    return { messageId: 'mock-promotional-message-id' };
  }
}

module.exports = new MockEmailService(); 