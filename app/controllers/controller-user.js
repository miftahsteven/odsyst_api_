const { generate } = require("../helper/auth-jwt");
const { prisma } = require("../../prisma/client");
const { z } = require("zod");
const { nanoid } = require("nanoid");
const argon2 = require("argon2");
const { generateTemplate, sendEmail, generateTemplateForgotEmail } = require("../helper/email");
const crypto = require("node:crypto");

module.exports = {
  // LOGIN USER 
  async loginUser(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          message: "Username atau Password Salah",
        });
      }

      const user = await prisma.users.findUnique({        
        where: {          
          username          
       },
      });

      if (!user) {
        return res.status(400).json({
          message: "Username atau Password Salah",
        });
      }

      const passwordMatch = await argon2.verify(user.userpassword, password);
      if (!passwordMatch) {
        return res.status(400).json({
          message: "Username atau Password Salah",
        });
      }

      if (user.user_status === 0) {
        return res.status(400).json({
          message: "Akun tidak aktif",
        });
      }

      const omit = require("lodash/omit");

      const cleanUser = omit(user, ["userpassword", "user_token"]);

      const token = generate(cleanUser);

      await prisma.users.update({
        where: {
          username,
        },
        data: {
          user_token: token,
        },
      });

      return res.status(200).json({
        message: "Login Berhasil",
        data: cleanUser,
        token,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async registerUser(req, res) {
    try {
      const schema = z.object({
        username: z.string(),
        user_type: z.number(),
      });

      const { username, user_type, email } = req.body;

      const body = await schema.safeParseAsync({
        username,        
        user_type,
      });

      let errorObj = {};

      if (body.error) {
        body.error.issues.forEach((issue) => {
          errorObj[issue.path[0]] = issue.message;
        });
        body.error = errorObj;
      }

      if (!body.success) {
        return res.status(400).json({
          message: "Beberapa Field Harus Diisi",
          error: errorObj,
        });
      }

      const currentUser = await prisma.users.findFirst({
        where: {
           username: body.data.username 
        },
      });

      if (currentUser) {
        return res.status(400).json({
          message: "User sudah terdaftar",
        });
      }

      const password = nanoid(10);
      const hashedPassword = await argon2.hash(password);

      console.log({ password });

      await prisma.users.create({
        data: {
          userpassword: hashedPassword,
          username: username,          
          user_type: Number(user_type),
          user_status: 1
        },
      });

      const templateEmail = generateTemplate({ email: email, password });
      const msgId = await sendEmail({
        email: body.data.email,
        html: templateEmail,
        subject: "Registrasi ODSyst",
      });

      if (!msgId) {
        return res.status(400).json({
          message: "Gagal mengirim email",
        });
      }

      return res.status(200).json({
        message: "Sukses",
        data: "Berhasil Mendaftarkan User",
        password: password
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async registerProfile(req, res) {
    try {
      const schema = z.object({
        user_nama: z.string(),
        user_phone: z.string(),
        user_email: z.string().email(),
        user_employee_number: z.number(),
        user_address: z.string(),
        user_title: z.string(),        
        user_ispermanent: z.number(),
        user_entrydate: z.date(),        
      });

      const { user_id,nama, phone, email, employee_number, address, title, ispermanent, entrydate, division_id, group_id, dept_id, contract_id } = req.body;

      const body = await schema.safeParseAsync({
        user_nama,        
        user_phone,
        user_email,
        user_employee_number,
        user_address,
        user_title,
        user_ispermanent,
        user_entrydate
      });

      let errorObj = {};

      if (body.error) {
        body.error.issues.forEach((issue) => {
          errorObj[issue.path[0]] = issue.message;
        });
        body.error = errorObj;
      }

      if (!body.success) {
        return res.status(400).json({
          message: "Beberapa Field Harus Diisi",
          error: errorObj,
        });
      }

      const currentProfile = await prisma.user_profile.findFirst({
        where: {
           user_id: body.data.user_id 
        },
      });

      if (currentProfile) {

        await prisma.user_profile.update({
          where: {
            user_id: user_id,
          },
          data: {            
            user_nama: nama,          
            user_phone: phone,
            user_email: email,
            user_employee_number: Number(employee_number),
            user_address: address,
            user_group: Number(group_id),
            user_division: Number(division_id),
            user_department: Number(dept_id),
            user_title: title,
            user_ispermanent: Number(ispermanent),
            user_entrydate: entrydate,
            user_contract_id: contract_id
          },
        });

        return res.status(200).json({
          message: "Sukses",
          data: "Berhasil Mengupdate Data Profil Karyawan",          
        });

      } else {
        await prisma.user_profile.create({
          data: {
            user_nama: nama,          
            user_phone: phone,
            user_email: email,
            user_employee_number: Number(employee_number),
            user_address: address,
            user_group: Number(group_id),
            user_division: Number(division_id),
            user_department: Number(dept_id),
            user_title: title,
            user_ispermanent: Number(ispermanent),
            user_entrydate: entrydate,
            user_contract_id: contract_id
          },
        });
        
        return res.status(200).json({
          message: "Sukses",
          data: "Berhasil Menambah Data Profil Karyawan",          
        });

      }
          
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },


  async updateUser(req, res) {
    try {
      const userId = req.user_id;
      const { nama, phone } = req.body;

      if (!nama || !phone) {
        return res.status(400).json({
          message: "Nama, dan Nomor Telepon harus diisi",
        });
      }

      await prisma.user.update({
        where: {
          user_id: userId,
        },
        data: {
          user_nama: nama,
          user_phone: phone,
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: "Berhasil Update Data",
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async updatePasswordWithAuth(req, res) {
    try {
      const userId = req.user_id;
      const { password, newPassword } = req.body;

      if (!password || !newPassword) {
        return res.status(400).json({
          message: "Password, dan Password Baru harus diisi",
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          user_id: userId,
        },
      });

      if (!user) {
        return res.status(400).json({
          message: "User tidak ditemukan",
        });
      }

      const passwordMatch = await argon2.verify(user.user_password, password);
      if (!passwordMatch) {
        return res.status(400).json({
          message: "Password Lama salah",
        });
      }

      const hashedPassword = await argon2.hash(newPassword);

      await prisma.user.update({
        where: {
          user_id: userId,
        },
        data: {
          user_password: hashedPassword,
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: "Berhasil Ganti Password",
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async forgotPassword(req, res) {
    try {
      const email = req.body.email;

      if (!email) {
        return res.status(400).json({
          message: "Email harus diisi",
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          username: email,
        },
      });

      // if (!user) {
      //   return res.status(400).json({
      //     message: "User tidak ditemukan",
      //   });
      // }

      const randomToken = crypto.randomBytes(32).toString("hex");
      console.log(randomToken);

      await prisma.password_token.upsert({
        where: {
          user_id: user.user_id,
        },
        create: {
          token: randomToken,
          user_id: user.user_id,
        },
        update: {
          token: randomToken,
        },
      });

      const templateEmail = generateTemplateForgotEmail({ email: user.username, token: randomToken });

      const msgId = await sendEmail({
        email: user.username,
        html: templateEmail,
        subject: "Reset Password Ziswaf INDOSAT",
      });

      if (!msgId) {
        return res.status(400).json({
          message: "Gagal mengirim email",
        });
      }

      return res.status(200).json({
        message: "Sukses",
        data: "Berhasil Kirim Email",
      });
    } catch (error) {
      return res.status(200).json({
        message: "Sukses",
        data: "Berhasil Kirim Email",
      });
    }
  },

  async resetPassword(req, res) {
    try {
      const { token, email, password } = req.body;

      if (!token || !email) {
        return res.status(400).json({
          message: "Gagal reset password, token tidak valid",
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          username: email,
        },
      });

      if (!user) {
        return res.status(400).json({
          message: "Gagal reset password, token tidak valid",
        });
      }

      const passwordToken = await prisma.password_token.findUnique({
        where: {
          token,
          user_id: user.user_id,
        },
      });

      if (!passwordToken) {
        return res.status(400).json({
          message: "Gagal reset password, token tidak valid",
        });
      }

      if (!password) {
        return res.status(400).json({
          message: "Password harus diisi",
        });
      }

      const hashedPassword = await argon2.hash(password);

      await prisma.user.update({
        where: {
          username: email,
        },
        data: {
          user_password: hashedPassword,
        },
      });

      await prisma.password_token.delete({
        where: {
          user_id: user.user_id,
          token: passwordToken.token,
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: "Berhasil Reset Password",
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async verifiedUser(req, res) {
    try {
      const email = req.body.email;

      const user = await prisma.user.findUnique({
        where: {
          username: email,
        },
      });

      if (!user) {
        return res.status(400).json({
          message: "User tidak ditemukan",
        });
      }

      await prisma.user.update({
        where: {
          username: email,
        },
        data: {
          user_status: 1,
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: "Berhasil Verifikasi",
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async detailUser(req, res) {
    try {
      const userId = req.user_id;

      const user = await prisma.user.findUnique({
        where: {
          user_id: userId,
        },
        include: {
          institusi: true,
          mustahiq: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User tidak ditemukan",
        });
      }

      const omit = require("lodash/omit");

      const cleanUser = omit(user, ["user_password", "user_token"]);

      return res.status(200).json({
        message: "Sukses",
        data: cleanUser,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async getNotifications(req, res) {
    try {
      const userId = req.user_id;

      const notifications = await prisma.notification.findMany({
        where: {
          user_id: userId,
        },
        include: {
          program: true,
          transaction: true,
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: notifications,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
};
