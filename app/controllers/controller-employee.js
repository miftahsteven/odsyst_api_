const { generate } = require("../helper/auth-jwt");
const { prisma } = require("../../prisma/client");
const { z } = require("zod");
const { nanoid } = require("nanoid");
const argon2 = require("argon2");
const { generateTemplate, sendEmail, generateTemplateForgotEmail } = require("../helper/email");
const crypto = require("node:crypto");

module.exports = {
  // LOGIN USER 
  
  async updateEmployee(req, res) {
    try {
      const schema = z.object({
        user_name: z.string(),
        user_phone : z.string(),
        user_email: z.email(),
        user_employee_number: z.string(),
        user_address: z.string(),
        user_division: z.number(),
        user_department: z.number(),
        user_group: z.number(),
        user_grade: z.number(),        
        user_title: z.string(),
        user_ispermanent: z.number()
      });

      const { user_id, user_nama, user_phone, user_email, 
              user_employee_number, user_address, 
              user_division, user_department, 
              user_group, user_grade, user_title, user_ispermanent, user_entrydate } = req.body;

      const body = await schema.safeParseAsync({
        user_nama,        
        user_phone,
        user_email,
        user_employee_number,
        user_address,
        user_division,
        user_department,
        user_group,
        user_grade,
        user_title,
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
      

      const password = nanoid(10);
      const hashedPassword = await argon2.hash(password);

      console.log({ password });

      await prisma.user_profile.update({
        data: {
          user_nama,
          user_phone,
          user_email,
          user_employee_number: Number(user_employee_number),
          user_address,
          user_division: Number(user_division),
          user_department: Number(user_department),
          user_group: Number(user_group),
          user_grade: Number(user_grade),
          user_title,
          user_ispermanent: Number(user_ispermanent),
          user_entrydate: Date(user_entrydate)
        },
        where: {
            user_id: Number(user_id)
        }
      });

      return res.status(200).json({
        message: "Sukses",
        data: "Berhasil Update Data Karyawan",
        password: password
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


  async getDetailUser(req, res) {
      try {
        const page = Number(req.query.page || 1);
        const perPage = Number(req.query.perPage || 10);
        //const user_status = Number(req.query.status || 4);
        //const skip = (page - 1) * perPage;
        //const keyword = req.query.keyword || "";
        //const user_type = req.query.user_type || "";      
        const sortBy = req.query.sortBy || "user_id";
        const sortType = req.query.order || "desc";
        
        const params = {
          
        }
        console.log(JSON.stringify(params));
  
        const [count, user] = await prisma.$transaction([
          prisma.user_profile.count({
            where: params,
          }),
          prisma.user_profile.findMany({
            select: {
              id: true,            
              user_nama: true,
              user_phone: true,
              user_email: true,
              user_employee_number: true,
              user_address: true,
              user_grade: true,
              user_entrydate: true,
              user_foto: true,
              user_ispermanent: true,
              users: {
                  select: {
                      id: true,
                      username: true,
                      user_status: true,
                      user_create_datetime: true,
                      user_type_users_user_typeTouser_type : true,                    
                      user_address: {
                          select : {
                              id: true,
                              name: true,
                              address: true,
                              provinces: {
                                  select : {
                                      prov_name : true
                                  }
                              },
                              cities : {
                                  select : {
                                      city_name: true
                                  }
                              },
                              districts: {
                                  select : {
                                      dis_name: true
                                  }
                              },
                              subdistricts: {
                                  select : {
                                      subdis_name: true
                                  }
                              }
                          }
                      }
                  },                
              },  
              user_address: true,
              departments: {
                  select: {
                      dept_name: true
                  }
              },
              divisions: {
                  select: {
                      division_name: true
                  }
              },
              groups: {
                  select: {
                      group_name: true
                  }
              }
            },
            orderBy: {
              [sortBy]: sortType,
            },
            where: params,
            //skip,
            //take: perPage,
          }),
        ]);
  
        const userResult = await Promise.all(
          user.map(async (item) => {
            //console.log('---->', JSON.stringify(item.users.user_address.filter(key => key.name === "Office")[0]?.districts?.dis_name));
            console.log('---->', JSON.stringify(item.departments?.dept_name));
            return {
              //...item,
              id: item.id,
              name: item.user_nama,
              email: item.user_email,
              departement: item.departments?.dept_name,
              type: item.users.user_type_users_user_typeTouser_type.type_name,
              group: item.groups?.group_name,
              division: item.divisions?.division_name,
              membershipDate:  moment(item.user_entrydate).format('L'),
              balance: 0,
              payout: 0,
              src: item.user_foto,
              isOnline: true,
              streetAddress: item.users.user_address.filter(key => key.name === "Home")[0]?.address,
              streetAddress2: item.users.user_address.filter(key => key.name === "Home")[0]?.districts.dis_name,
              city: item.users.user_address.filter(key => key.name === "Home")[0]?.cities.city_name,
              state: item.users.user_address.filter(key => key.name === "Home")[0]?.provinces.prov_name,
              stateFull: '',
              zip: '',
              streetAddressDelivery: item.users.user_address.filter(key => key.name === "Office")[0]?.address,
              streetAddress2Delivery: item.users.user_address.filter(key => key.name === "Office")[0]?.subdistricts.subdis_name,
              cityDelivery: item.users.user_address.filter(key => key.name === "Office")[0]?.cities.city_name,
              stateDelivery: item.users.user_address.filter(key => key.name === "Office")[0]?.provinces.prov_name,
              stateFullDelivery: '',
              zipDelivery: '',
              phone: item.user_phone,
              latitude: '',
              longitude: '',
              user_entrydate : moment(item.user_entrydate).format('L'),
              //program_target_amount: Number(item.program_target_amount),
              //total_donation: total_donation._sum.amount || 0,
            };
          })
        );
  
        res.status(200).json({
          // aggregate,
          message: "Sukses Ambil Data",
          data: userResult,
          // pagination: {
          //   total: count,
          //   page,
          //   hasNext: count > page * perPage,
          //   totalPage: Math.ceil(count / perPage),
          // },
        });
      } catch (error) {
        res.status(500).json({
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
