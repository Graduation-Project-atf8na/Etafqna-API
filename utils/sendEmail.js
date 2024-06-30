const nodeMailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodeMailer.createTransport({
    host: process.env.BREVO_HOST,
    port: process.env.BREVO_PORT,
    auth: {
      user: process.env.BREVO_USERNAME,
      pass: process.env.BREVO_PASSWORD
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Etafqna <graduation2024.project@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
