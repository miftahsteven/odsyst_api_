const nodemailer = require("nodemailer");

const sendEmail = async ({ email, html, subject }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "admin@zisindosat.id",
      pass: "ziswaf2019",
    },
  });

  const info = await transporter.sendMail({
    from: "admin@zisindosat.id",
    to: email,
    subject,
    html: html,
  });

  console.log("Message sent: %s", info.messageId);

  return info.messageId;
};

const generateTemplate = ({ email, password }) => {
  const encodedEmail = Buffer.from(email).toString("base64");
  const url = `https://portal.zisindosat.id/verifikasi?akun=${encodedEmail}`;

  const content = `
  <p>Assalamu'alaikum, Wr Wb.</p>
  <p>Terima Kasih Telah Mendaftar Ke Ziswaf INDOSAT.</p>
  <p>Berikut ini adalah detail login anda :</p>
  <p>Username: ${email}</p>
  <p>Password: ${password}</p>
  <p>Untuk melanjutkan proses registrasi dan agar anda bisa melakukan login, silahkan lakukan Verifikasi terlebih
     dahulu, dengan melakukan klik pada link berikut</p>
  <br />
  <a href="${url}"><strong>VERIFIKASI AKUN</strong></a>
  <br />
  <p>Terima kasih atas partisipasi anda.</p>
  <p>Wassalamu'alaikum Wr, Wb</p>
`;

  return content;
};

const generateTemplateForgotEmail = ({ email, token }) => {
  const encodedEmail = Buffer.from(email).toString("base64");
  const url = `https://portal.zisindosat.id/reset-password?akun=${encodedEmail}&token=${token}`;

  const content = `
  <p>Assalamu'alaikum, Wr Wb.</p>
  <p>Anda telah melakukan permintaan untuk melakukan reset password.</p>
  <p>Untuk melanjutkan proses reset password, silahkan klik link berikut:</p>
  <br />
  <a href="${url}"><strong>RESET PASSWORD</strong></a>
  <br />
  <p>Terima kasih atas partisipasi anda.</p>
  <p>Wassalamu'alaikum Wr, Wb</p>
 `;

  return content;
};

module.exports = {
  sendEmail,
  generateTemplate,
  generateTemplateForgotEmail,
};
