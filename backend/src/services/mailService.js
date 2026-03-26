const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER || 'thiruppathi400@gmail.com',
        pass: process.env.MAIL_PASS || '' // User needs to set an app password
    }
});

const MailService = {
    sendEnquiryNotification: async (enquiry) => {
        const { name, email, phone, organization, enquiry_type, message } = enquiry;

        const mailOptions = {
            from: 'Thirupathi Constructions <notifications@company.com>',
            to: process.env.ADMIN_EMAIL || 'thiruppathi400@gmail.com',
            subject: `New Enquiry from ${name} - ${enquiry_type}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #2e7d32;">New Enquiry Received</h2>
                    <p>Details of the new enquiry from the website:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Organization</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${organization || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Type</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${enquiry_type}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Message</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${message}</td>
                        </tr>
                    </table>
                    <p style="margin-top: 20px;">
                        <em>This is an automated notification from the THIRUPATHI CONSTRUCTIONS website.</em>
                    </p>
                </div>
            `
        };

        try {
            // Note: This will only work if MAIL_PASS is set (App Password for Gmail)
            if (process.env.MAIL_PASS) {
                await transporter.sendMail(mailOptions);
                console.log(`Enquiry notification sent to ${mailOptions.to}`);
            } else {
                console.log("Email notification skipped: MAIL_PASS not configured in .env");
            }
        } catch (error) {
            console.error("Error sending enquiry email:", error);
        }
    }
};

module.exports = MailService;
