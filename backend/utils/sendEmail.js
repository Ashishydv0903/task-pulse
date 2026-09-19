const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = process.env.EMAIL_PORT || 587;

  if (emailUser && emailPass) {
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort == 465, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const message = {
      from: `TaskPulse Workspace <${process.env.EMAIL_FROM || emailUser}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(message);
    console.log(`[EMAIL] OTP Email sent to ${options.to}: ${info.messageId}`);
    return info;
  } else {
    // If SMTP credentials not provided in .env, log formatted OTP email to console for preview
    console.log('\n====================================================');
    console.log(`[EMAIL SIMULATION] To: ${options.to}`);
    console.log(`[EMAIL SIMULATION] Subject: ${options.subject}`);
    console.log(`[EMAIL SIMULATION] (Configure EMAIL_USER & EMAIL_PASS in .env for live Gmail SMTP delivery)`);
    console.log('====================================================\n');
  }
};

module.exports = sendEmail;
