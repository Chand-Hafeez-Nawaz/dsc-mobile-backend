const nodemailer = require("nodemailer");

// ✅ CREATE TRANSPORTER
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: "dscanantapur@gmail.com",
    pass: "dhrlrlktsovkjexz",
  },
});

// ✅ VERIFY CONNECTION (optional but helpful)
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY ✔");
  }
});

// ✅ SEND APPROVAL MAIL FUNCTION
const sendApprovalMail = async (to, name) => {
  try {
    console.log("📩 Sending mail to:", to);

    const info = await transporter.sendMail({
      from: `"DSC Portal" <your_email@gmail.com>`,
      to: to,
      subject: "School Approved 🎉",
      text: `Hello ${name}, your school registration has been approved. You can now login.`,
      html: `
        <h2>School Approved 🎉</h2>
        <p>Hello <b>${name}</b>,</p>
        <p>Your school registration has been <b>approved</b>.</p>
        <p>You can now login to the system.</p>
        <br/>
        <p>Regards,<br/>DSC Team</p>
      `,
    });

    console.log("✅ MAIL SENT:", info.response);
  } catch (error) {
    console.error("❌ MAIL ERROR:", error);
  }
};

module.exports = sendApprovalMail;