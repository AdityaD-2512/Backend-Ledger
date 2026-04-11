const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({    //transporter(our express server) work is to interact/communicate with SMTP serves(SMTP servers are used to handle emails specifically by big comapnies) which uses some credential to find out from which id and what mail has to be sent
//   service: 'gmail',
//   auth: {
//     type: 'OAuth2',
//     user: process.env.EMAIL_USER,
//     clientId: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     refreshToken: process.env.REFRESH_TOKEN,
//   },
// });

//earlier above one we used for sending email but some error occur due to which we have updated it...
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify the connection configuration  (that our credential is correct or not)
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, name){
    const subject = 'Welcome to Backend Ledger!';
    const text = `hello ${name}, \n\nThank You for registering at Backend Ledger. We're excited to have you on board! \n\nBest regards, \nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>Thank you for registering at Backend Ledger. We're excited to have you on board!</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}


async function sendTransactionEmail(userEmail, name, amount, toAccount){ //transaction successful email
  const subject = 'Transaction Successful!';
  const text = `hello ${name}, \n\nYour transaction of ${amount} to account ${toAccount} was successful.\n\nBest regards, \nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>Your transaction of ${amount} to account ${toAccount} was successful.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount){ //transaction successful email
  const subject = 'Transaction Failed!';
  const text = `hello ${name}, \n\nWe regret to inform you that Your transaction of ${amount} to account ${toAccount} was unsuccessful.\n\nBest regards, \nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>We regret to inform you that Your transaction of ${amount} to account ${toAccount} was unsuccessful.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
};
