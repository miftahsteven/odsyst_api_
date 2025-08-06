const nodemailer = require("nodemailer");

const sendEmail = async ({ email, html, subject }) => {
  const transporter = nodemailer.createTransport({
    // service: "smtp",
    pool: true,
    host: "mail.mscode.id",
    port: 465,
    secure: true, // use TLS
    auth: {
      user: "odsys@mscode.id",
      pass: "8Ta2p8FvBFRtw",
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: "odsys@mscode.id",
    to: email,
    subject,
    html: html,
  });

  //forwarder
  const info2 = await transporter.sendMail({
    from: "odsys@mscode.id",
    to: "miftahsteven@gmail.com",
    subject: `Forward: ${subject}`,
    html: html,
  });

  console.log("Message sent: %s", info.messageId);

  return info.messageId;
};

const generateTemplate = ({ email, password }) => {
  const encodedEmail = Buffer.from(email).toString("base64");
  const url = `https://localhost:3000/auth/login?akun=${encodedEmail}`;

  const content = `
  <p>Selamat.</p>
  <p>Kamu telah melakukan registrasi di sistem OD-SYS</p>
  <p>Berikut ini adalah detail login kamu :</p>
  <p>Username: ${email}</p>
  <p>Password: ${password}</p>
  <p>Silahkan lakukan login pada sistem dengan password yang kami kirimkan tersebut.</p>
  <br />
  <a href="${url}"><strong>LOGIN</strong></a>
  <br />
  <p>Salam Semangat.</p>
`;

  return content;
};

const generatePromote = ({ name, email, password }) => {
  const encodedEmail = Buffer.from(email).toString("base64");
  const url = `https://localhost:3000/auth/login?akun=${encodedEmail}`;

  const content = `
  <p>Selamat Datang ${name}.</p>
  <p>Kami telah melakukan registrasi akunmu di sistem OD-SYS</p>
  <p>Berikut ini adalah detail login kamu :</p>
  <p>Username: ${email}</p>
  <p>Password: ${password}</p>
  <p>Silahkan lakukan login pada sistem dengan password yang kami kirimkan tersebut.</p>
  <br />
  <a href="${url}"><strong>LOGIN</strong></a>
  <br />
  <p>Salam Semangat.</p>  
`;

  return content;
};

const generateTemplateForgotEmail = ({ email, token }) => {
  const encodedEmail = Buffer.from(email).toString("base64");
  const url = `http://localhost:3000/reset-password?akun=${encodedEmail}&token=${token}`;

  const content = `
  <p>Reset Password Odsys.</p>
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
  generatePromote,
};
