require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // 587 ke liye false hona zaroori hai
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"BANKING-LEDGER" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('Email sent successfully. ID:', info.messageId);
  } catch (error) {
    console.error('Nodemailer Error:', error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  console.log("📧 sendEmail called with:", userEmail, 'Welcome to Banking-Ledger!');
  const subject = 'Welcome to Banking-Ledger!';
  const text = `Dear ${name},\n\nThank you for registering with Banking-Ledger. We are excited to have you on board!\n\nBest regards,\nThe Banking-Ledger Team`;
  const html = `<p>Dear <strong>${name}</strong>,</p>
                <p>Thank you for registering with Banking-Ledger. We are excited to have you on board!</p>
                <p>Best regards,<br>The Banking-Ledger Team</p>`;
  await sendEmail(userEmail, subject, text, html);
}

async function senderTransectionEmail(userEmail, name, amount, toAccount) {
  const subject = 'Transaction Successful';
  const text = `Hello ${name},\n\nYour transaction of INR ${amount} to account ${toAccount} was successfully made.\n\nRegards,\nBANKING-LEDGER`;
  const html = `<p>Hello <strong>${name}</strong>,</p>
                <p>Your transaction of <strong>INR ${amount}</strong> to account <strong>${toAccount}</strong> was successfully made.</p>
                <p>Regards,<br>BANKING-LEDGER</p>`;
  await sendEmail(userEmail, subject, text, html);
}

async function receiverTransectionEmail(userEmail, name, amount, fromAccount) {
  const subject = 'Transaction Received';
  const text = `Hello ${name},\n\nYou have received INR ${amount} from account ${fromAccount}.\n\nRegards,\nBANKING-LEDGER`;
  const html = `<p>Hello <strong>${name}</strong>,</p>
                <p>You have received <strong>INR ${amount}</strong> from account <strong>${fromAccount}</strong>.</p>
                <p>Regards,<br>BANKING-LEDGER</p>`;
  await sendEmail(userEmail, subject, text, html);
}

async function sendTransectionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = 'Transaction Failed';
  const text = `Hello ${name},\n\nYour transaction of INR ${amount} to account ${toAccount} has FAILED.\n\nRegards,\nBANKING-LEDGER`;
  const html = `<p>Hello <strong>${name}</strong>,</p>
                <p>Your transaction of <strong>INR ${amount}</strong> to account <strong>${toAccount}</strong> has <span style="color: red; font-weight: bold;">FAILED</span>.</p>
                <p>Regards,<br>BANKING-LEDGER</p>`;
  await sendEmail(userEmail, subject, text, html);
}

async function sendOTPEmail(userEmail, otp) {
  const subject = 'Your OTP for Password Reset';
  const text = `Your OTP for password reset is: ${otp}\n\nThis OTP is valid for 10 minutes. Do not share it with anyone.\n\nRegards,\nBANKING-LEDGER`;
  const html = `<p>Your OTP for password reset is:</p>
                <h2 style="letter-spacing: 4px;">${otp}</h2>
                <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
                <p>Regards,<br>BANKING-LEDGER</p>`;
  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  senderTransectionEmail,
  receiverTransectionEmail,
  sendTransectionFailureEmail,
  sendOTPEmail
};