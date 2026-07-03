require('dotenv').config();
const { Resend } = require('resend');

// Initialize Resend with API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// Generic function to send email via Resend
const sendEmail = async (to, subject, text, html) => {
  try {
    const { data, error } = await resend.emails.send({
      // NOTE: Agar domain verified nahi hai, to sirf "onboarding@resend.dev" se bhej sakte ho testing ke liye.
      // Domain verify hone ke baad: "no-reply@yourdomain.com" ya `"BANKING-LEDGER" <support@yourdomain.com>` use kar sakte ho.
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev', 
      to: [to], // Resend expects an array or string
      subject: subject,
      text: text,
      html: html,
    });

    if (error) {
      console.error('Resend Error:', error);
      return;
    }

    console.log('Email sent successfully via Resend. ID:', data.id);
  } catch (error) {
    console.error('Unexpected error sending email:', error);
  }
};

// 1. Registration Email
async function sendRegistrationEmail(userEmail, name) {
  const subject = 'Welcome to Banking-Ledger!';
  const text = `Dear ${name},\n\nThank you for registering with Banking-Ledger. We are excited to have you on board!\n\nBest regards,\nThe Banking-Ledger Team`;
  const html = `<p>Dear <strong>${name}</strong>,</p>
                <p>Thank you for registering with Banking-Ledger. We are excited to have you on board!</p>
                <p>Best regards,<br>The Banking-Ledger Team</p>`;
  await sendEmail(userEmail, subject, text, html);
}

// 2. Sender Transaction Success Email
async function senderTransectionEmail(userEmail, name, amount, toAccount) {
  const subject = 'Transaction Successful';
  const text = `Hello ${name},\n\nYour transaction of INR ${amount} to account ${toAccount} was successfully made.\n\nRegards,\nBANKING-LEDGER`;
  const html = `<p>Hello <strong>${name}</strong>,</p>
                <p>Your transaction of <strong>INR ${amount}</strong> to account <strong>${toAccount}</strong> was successfully made.</p>
                <p>Regards,<br>BANKING-LEDGER</p>`;
  await sendEmail(userEmail, subject, text, html);
}

// 3. Receiver Transaction Success Email
async function receiverTransectionEmail(userEmail, name, amount, fromAccount) {
  const subject = 'Transaction Received';
  const text = `Hello ${name},\n\nYou have received INR ${amount} from account ${fromAccount}.\n\nRegards,\nBANKING-LEDGER`;
  const html = `<p>Hello <strong>${name}</strong>,</p>
                <p>You have received <strong>INR ${amount}</strong> from account <strong>${fromAccount}</strong>.</p>
                <p>Regards,<br>BANKING-LEDGER</p>`;
  await sendEmail(userEmail, subject, text, html);
}

// 4. Transaction Failure Email
async function sendTransectionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = 'Transaction Failed';
  const text = `Hello ${name},\n\nYour transaction of INR ${amount} to account ${toAccount} has FAILED.\n\nRegards,\nBANKING-LEDGER`;
  const html = `<p>Hello <strong>${name}</strong>,</p>
                <p>Your transaction of <strong>INR ${amount}</strong> to account <strong>${toAccount}</strong> has <span style="color: red; font-weight: bold;">FAILED</span>.</p>
                <p>Regards,<br>BANKING-LEDGER</p>`;
  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  senderTransectionEmail,
  receiverTransectionEmail,
  sendTransectionFailureEmail
};