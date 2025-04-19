const { generate } = require("../helper/auth-jwt");
const { prisma } = require("../../prisma/client");
const { z } = require("zod");
const { customAlphabet } = require("nanoid");
const argon2 = require("argon2");
const { generateTemplate, sendEmail, generateTemplateForgotEmail } = require("../helper/email");
const {saveLog} = require("../helper/log")
const crypto = require("node:crypto");
const { includes } = require("lodash");
const moment  = require("moment");
const { group } = require("node:console");

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
        include: {                        
            user_profile: {
                include: {
                  //groups: true,
                  //divisions: true
                  position: {
                    include: {
                      departments: {
                        include: {
                          divisions: {
                            include: {
                              groups: true
                            }
                          }
                        }
                      }
                    }
                  },
                }              
            }            
        }
      });

      if (!user) {
        return res.status(400).json({
          message: "Username atau Password Salah",
        });
      }

      if (!user.user_status == 1) {
        return res.status(400).json({
          message: "User Tidak Aktif",
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

      console.log('CLEAN', JSON.stringify(cleanUser));

      const token = generate(cleanUser);

      await prisma.users.update({
        where: {
          username,
        },
        data: {
          user_token: token,
        },
      });

      const savelog =  saveLog({user_id: user.id, activity: 'User Login', route: 'auth/login'});

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
      const userId = req.user_id;
      const schema = z.object({
        username: z.string({
          required_error: "Username Harus Diisi Dengan NIP Karyawan",          
        }).min(3).max(8),
        user_nama: z.string({
          required_error: "Nama harus diisi",          
        }).min(3),
        user_phone: z.string().min(6).max(12),
        user_email: z.string().email({ message: "Format email salah" })
      });
      
      const { username, user_nama, user_phone, user_email, user_type, user_gender } = req.body;

      const body = await schema.safeParseAsync({
        username,        
        user_phone : String(user_phone),
        user_email,
        user_nama,
        user_type
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

      //console.log(' --> ',user_email);

      const checkDataCode = await prisma.users.findUnique({
        where: {
          username: req.body.username,
        },
      });
      if (checkDataCode) {
        return res.status(400).json({
          message: "Username sudah terdaftar",
        });
      }

      const nanoid = customAlphabet('1234567890abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ', 6)
      const password = nanoid();
      const hashedPassword = await argon2.hash(password);

      console.log({ password });

      const userdata = await prisma.users.create({
        data: {
          userpassword: hashedPassword,
          username: username,          
          user_type: Number(user_type),
          user_status: 1,
        },
      });

      const userprofiledata = await prisma.user_profile.create({
        data: {
          user_id: userdata.id,
          user_nama,
          user_phone,
          user_email,
          user_employee_number: Number(username),
          user_status: 1,
          user_gender: Number(user_gender)
        },
      });

      const templateEmail = generateTemplate({ email: user_email, password });
      const msgId = await sendEmail({
        email: user_email,
        html: templateEmail,
        subject: "Registrasi ODSyst",
      });

      if (!msgId) {
        return res.status(400).json({
          success: false,
          message: "Gagal mengirim email",
        });
      }
      
      const savelog =  saveLog({user_id: userId, activity: `Register System : username ${username}`, route: 'auth/register'});

      return res.status(200).json({
        code: "200",
        message: "Berhasil Mendaftarkan User",
        data: userprofiledata
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error?.message,
      });
    }
  },

  async getAllUser(req, res) {
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
        users : {
            user_status: 1
        }
      }
      //console.log(JSON.stringify(params));

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
            subdistricts: {
                select: {
                    subdis_id: true,
                    subdis_name: true,
                    districts: {
                        select: {
                            dis_id: true,
                            dis_name: true,
                            cities: {
                                select: {
                                    city_id: true,
                                    city_name: true,
                                    provinces: {
                                        select: {
                                            prov_id: true,
                                            prov_name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                  }
            },
            user_grade: true,
            user_gender: true,
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
                },                
            },  
            position: {  
                select: {
                    position_name: true,
                    position_code: true,
                    position_grade: true,
                    departments: {
                        select: {
                            id: true,
                            dept_name: true,  
                            divisions: {
                                select: {
                                    division_name: true,
                                    groups: {  
                                        select: {
                                            group_name: true
                                        }
                                    }
                                }
                            },
                        }
                    },                      
                }
            },            
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
          //console.log('---->', JSON.stringify(item.departments?.dept_name));
          return {
            //...item,
            id: item.id,
            user_id: item.users.id,
            name: item.user_nama,
            username: item.users.username,
            email: item.user_email,
            title: item.position.position_name,
            grade: item.position.position_grade,
            departement: item.position.departments?.dept_name,
            type: item.users.user_type_users_user_typeTouser_type.type_name,
            type_id : item.users.user_type_users_user_typeTouser_type.id,
            status: item.users.user_status,
            group: item.position.departments?.divisions?.groups?.group_name,
            division: item.position.departments?.divisions?.division_name,
            membershipDate:  moment(item.user_entrydate).format('L'),
            balance: 0,
            payout: 0,
            src: item.user_foto,
            isOnline: true,
            streetAddress: item.user_profile?.user_address,
            streetAddress2: item.user_profile?.subdistricts?.districts?.dis_name,
            city: item.user_profile?.subdistricts?.districts?.cities?.city_name,
            state: item.user_profile?.subdistricts?.districts?.cities?.provinces?.prov_name,
            stateFull: '',
            zip: '',
            streetAddressDelivery: item.user_profile?.user_address,
            streetAddress2Delivery: item.user_profile?.subdistricts?.subdis_name,
            cityDelivery: item.user_profile?.subdistricts?.districts?.cities?.city_name,
            stateDelivery: item.user_profile?.subdistricts?.districts?.cities?.provinces?.prov_name,
            stateFullDelivery: '',
            zipDelivery: '',
            phone: item.user_phone,
            latitude: '',
            longitude: '',
            user_entrydate : moment(item.user_entrydate).format('L'),
            user_gender: item.user_gender            
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
      console.log('ERROR msg', error);
      res.status(500).json({
        message: error?.message,
      });    
    }
  },


  async getAllUserInactive(req, res) {
    try {
      const page = Number(req.query.page || 1);
      const perPage = Number(req.query.perPage || 10);
      const sortBy = req.query.sortBy || "user_id";
      const sortType = req.query.order || "desc";
      
      const params = {
        users : {
            user_status: 0
        }
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
                },                
            },              
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
          //console.log('---->', JSON.stringify(item.departments?.dept_name));
          return {
            //...item,
            id: item.id,
            user_id: item.users.id,
            name: item.user_nama,
            username: item.users.username,
            email: item.user_email,
            departement: item.departments?.dept_name,
            type: item.users.user_type_users_user_typeTouser_type.type_name,
            type_id : item.users.user_type_users_user_typeTouser_type.id,
            status: item.users.user_status,
            group: item.groups?.group_name,
            division: item.divisions?.division_name,
            membershipDate:  moment(item.user_entrydate).format('L'),
            balance: 0,
            payout: 0,
            src: item.user_foto,
            isOnline: true,            
            streetAddress: item.user_profile.user_address,
            streetAddress2: item.user_profile.subdistricts.districts.dis_name,
            city: item.user_profile.subdistricts.districts.cities.city_name,
            state: item.user_profile.subdistricts.districts.cities.provinces.prov_name,
            stateFull: '',
            zip: '',
            streetAddressDelivery: item.user_profile.user_address,
            streetAddress2Delivery: item.user_profile.subdistricts.subdis_name,
            cityDelivery: item.user_profile.subdistricts.districts.cities.city_name,
            stateDelivery: item.user_profile.subdistricts.districts.cities.provinces.prov_name,
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
      console.log('ERROR msg', error);
      res.status(500).json({
        message: error?.message,
      });    
    }
  },

  async getDataTypeUser(req, res) {
    try {
      const page = Number(req.query.page || 1);
      const perPage = Number(req.query.perPage || 10);
      //const user_status = Number(req.query.status || 4);
      //const skip = (page - 1) * perPage;
      //const keyword = req.query.keyword || "";
      //const user_type = req.query.user_type || "";      
      const sortBy = req.query.sortBy || "id";
      const sortType = req.query.order || "desc";

      const params = {
        // user_nama: {
        //   contains: keyword,
        // },
        // ...(user_type ? { user_type: Number(user_type) } : {}),
      };

      const [count, typeUser] = await prisma.$transaction([
        prisma.user_type.count({
          where: params,
        }),
        prisma.user_type.findMany({          
          orderBy: {
            [sortBy]: sortType,
          },
          where: params,
          //skip,
          //take: perPage,
        }),
      ]);

      const typeResult = await Promise.all(
        typeUser.map(async (item) => {
          //console.log('---->', JSON.stringify(item.users.user_address.filter(key => key.name === "Office")[0]?.districts?.dis_name));
          return {
            ...item,            
            //program_target_amount: Number(item.program_target_amount),
            //total_donation: total_donation._sum.amount || 0,
          };
        })
      );

      res.status(200).json({
        // aggregate,
        message: "Sukses Ambil Data",
        data: typeResult,
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

  async inactiveUser(req, res) {
    try {
      const id = req.body.id;
      const userId = req.user_id;
      const status = req.body.statusUser;

      if (!id) {
        return res.status(400).json({
          message: "ID tidak boleh kosong"
        });
      }

      await prisma.users.update({
        where: {
          id: id,
        },
        data: {
          user_status: Number(status),
          user_token: ''
        },
      });

      if (status == 0) {
        const savelog =  saveLog({user_id: userId, activity: `Inactivated User : User Id ${id}`, route: 'auth/inactivated'});
      } else {
        const savelog =  saveLog({user_id: userId, activity: `Activated User : User Id ${id}`, route: 'auth/inactivated'});
      }

      return res.status(200).json({
        message: "Sukses",
        data: "Berhasil Non Aktifkan User",
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async updateUseOnAdmin(req, res) {
    try {
      const userId = req.user_id;
      const id = req.params.id;
      const schema = z.object({        
        user_nama: z.string({
          required_error: "Nama harus diisi",          
        }).min(3),
        user_phone: z.string().min(6).max(12),
        user_email: z.string().email({ message: "Format email salah" }),
        user_type: z.number()
      });

      const { user_id, user_nama, user_phone, user_email, user_type } = req.body;

      const body = await schema.safeParseAsync({        
        user_phone,
        user_email,
        user_nama,
        user_type
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

      //console.log(' --> ',user_email);

      const userprofiledata = await prisma.user_profile.update({
        data: {
          user_nama,
          user_phone,
          user_email,          
        },
        where : {
            id: Number(id)
        }
      });

      const userupdate = await prisma.users.update({
        data: {
          user_type          
        },
        where : {
            id: Number(user_id)
        }
      });
      
      const savelog =  saveLog({user_id: userId, activity: `Update User : username ${user_nama}`, route: 'auth/update/:'+id});

      return res.status(200).json({
        code: "200",
        message: "Berhasil Mengupdate User",
        data: userprofiledata
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

  async getAllActivity(req, res) {
    try {
      const userId = req.params.id;
      const sortBy = req.query.sortBy || "id";
      const sortType = req.query.order || "desc";

      const logData = await prisma.log.findMany({
        where: {
          user_id: Number(userId),
        },
        // include: {
        //   program: true,
        //   transaction: true,
        // },
        orderBy: {
          [sortBy]: sortType,
        },
        skip: 0,
        take: 5,
      });

      return res.status(200).json({
        message: "Sukses",
        data: logData,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async logout(req, res) {
    try{
      const user_id = req.body.user_id;
      console.log("user id", user_id);
      const savelog =  saveLog({user_id: user_id, activity: 'User Logout', route: 'auth/logout'});
      return res.status(200).json({
        message: "Sukses Logout",
        data: [],
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async removeUser(req, res) {
    try {
      const id = req.body.id;
      const userId = req.user_id;

      if (!id) {
        return res.status(400).json({
          message: "ID tidak boleh kosong"
        });
      }

      const user = await prisma.users.findFirst({        
        where: {          
          id: Number(id),
        },
      });

      await prisma.user_profile.deleteMany({
        where: {
          user_id: Number(id),
        },        
      });

      await prisma.log.deleteMany({
        where: {
          user_id: Number(id),
        },        
      });

      await prisma.users.delete({
        where: {
          id: Number(id),
        },        
      });

      const savelog =  saveLog({user_id: userId, activity: `Delete User : username ${user.username}`, route: 'auth/remove'});

      return res.status(200).json({
        message: "Sukses",
        data: "Berhasil Hapus User",
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
};
