const nodemailer = require("nodemailer");

// ✅ FIXED transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendApprovalMail = async (school) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: school.email,
    subject: "School Registration Approved ✅",
    html: `
      <h2>Congratulations ${school.name}</h2>
      <p>Your school registration has been approved.</p>
      <p>You can now login to the DSC App.</p>
    `,
  });
};

const sendRejectionMail = async (school) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: school.email,
    subject: "School Registration Rejected ❌",
    html: `
      <h2>Hello ${school.name}</h2>
      <p>Your registration was not approved.</p>
      <p>Please contact admin for more details.</p>
    `,
  });
};

module.exports = {
  sendApprovalMail,
  sendRejectionMail,
};