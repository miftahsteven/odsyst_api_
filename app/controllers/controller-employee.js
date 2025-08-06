const { generate } = require("../helper/auth-jwt");
const { prisma } = require("../../prisma/client");
const { z } = require("zod");
const { nanoid } = require("nanoid");
const argon2 = require("argon2");
const { generateTemplate, sendEmail, generateTemplateForgotEmail } = require("../helper/email");
const crypto = require("node:crypto");
const { update } = require("lodash");
const moment = require("moment");

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
            //console.log('---->', JSON.stringify(item.departments?.dept_name));
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
  async createContract(req, res) {
    try {
      const { contract_number, contract_type, contract_end_date } = req.body;

      if (!contract_end_date || !contract_number || !contract_type ) {
        return res.status(400).json({
          message: "Nomor Kontrak, Tipe Kontrak, Tanggal Akhir Kontrak harus diisi",
        });
      }

      const checkContract = await prisma.contracts.findFirst({
        where: {
          contract_number,
        },
      });
      if (checkContract) {
        return res.status(400).json({
          message: "Nomor Kontrak sudah ada",
        });
      }

      const contract = await prisma.contracts.create({
        data: {
          contract_number,
          contract_type: Number(contract_type),
          contract_end_date: new Date(contract_end_date),
          contract_status: 0,
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: contract,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },  
  async getAllContracts(req, res) {
    try {
      const page = Number(req.query.page || 1);
      const perPage = Number(req.query.perPage || 10);           
      const sortBy = req.query.sortBy || "id";
      const sortType = req.query.order || "desc";
      
      const params = {}
      //console.log(JSON.stringify(params));

      const [count, contracts] = await prisma.$transaction([
        prisma.contracts.count({
          where: params,
        }),
        prisma.contracts.findMany({
          select: {
            id: true,            
            contract_number: true,            
            contract_type: true,
            contract_end_date: true,
            contract_status: true,
          },
          orderBy: {
            [sortBy]: sortType,
          },
          where: params,
          //skip,
          //take: perPage,
        }),
      ]);

      const dataResult = await Promise.all(
        contracts.map(async (item) => {
          const SELECT_TYPE_OPTIONS = [
            { value: 0, text: 'PKWT' },
            { value: 1, text: 'PKWTT' },
            { value: 2, text: 'OUTSOURCING' },
            { value: 3, text: 'MAGANG' },
            { value: 4, text: 'KONTRAK' },
          ]
          const SELECT_STATUS_OPTIONS = [
            { value: 0, text: 'TIDAK AKTIF' },
            { value: 1, text: 'AKTIF' },
            { value: 2, text: 'SELESAI' },
            { value: 3, text: 'DIBEKUKAN' },
            { value: 4, text: 'DIBATALKAN' },
          ]
          //console.log('---->', JSON.stringify(item.users.user_address.filter(key => key.name === "Office")[0]?.districts?.dis_name));
          //console.log('---->', JSON.stringify(item.departments?.dept_name));
          return {            
            id: item.id,            
            contract_number: item.contract_number,
            contract_type: item.contract_type,
            contract_type_text: SELECT_TYPE_OPTIONS.filter(key => key.value === item.contract_type)[0]?.text,
            contract_end_date_text: moment(item.contract_end_date).format("DD-MM-YYYY"),
            contract_end_date: item.contract_end_date,
            contract_status: item.contract_status,
            contract_status_text: SELECT_STATUS_OPTIONS.filter(key => key.value === item.contract_status)[0]?.text,
          };
        })
      );

      res.status(200).json({
        // aggregate,
        message: "Sukses Ambil Data",
        data: dataResult,       
      });
    } catch (error) {
      res.status(500).json({
        message: error?.message,
      });
    }
  },
  async getContractForSelect(req, res) {
    try {
      const contracts = await prisma.contracts.findMany({
        select: {
          id: true,
          contract_number: true,
          contract_type: true,
          contract_end_date: true,
        },
      });
      const selectResult = await Promise.all(
        contracts.map(async (item) => {
          const SELECT_TYPE_OPTIONS = [
            { value: 0, text: 'PKWT' },
            { value: 1, text: 'PKWTT' },
            { value: 2, text: 'OUTSOURCING' },
            { value: 3, text: 'MAGANG' },
            { value: 4, text: 'KONTRAK' },
          ]
          return {
            id: item.id,
            label: item.contract_number + " - " + SELECT_TYPE_OPTIONS.filter(key => key.value === item.contract_type)[0]?.text,
            value: item.id,
            contract_type_text: SELECT_TYPE_OPTIONS.filter(key => key.value === item.contract_type)[0]?.text,
          };
        })
      )
      return res.status(200).json({
        message: "Sukses",
        data: selectResult,
      });
    } catch (error) { 
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async updateContract(req, res) {
    try {
      const { id } = req.params;
      const { contract_number, contract_type, contract_end_date } = req.body;

      if (!id || !contract_number || !contract_type || !contract_end_date ) {
        return res.status(400).json({
          message: "ID Kontrak, Nomor Kontrak, Tipe Kontrak, Tanggal Akhir Kontrak harus diisi",
        });
      }

      const checkContract = await prisma.contracts.findFirst({
        where: {
          contract_number,
          id: {
            not: Number(id),
          },
        },
      });
      if (checkContract) {
        return res.status(400).json({
          message: "Nomor Kontrak sudah ada",
        });
      }

      const contract = await prisma.contracts.update({
        where: {
          id: Number(id),
        },
        data: {
          contract_number,
          contract_type: Number(contract_type),
          contract_end_date: new Date(contract_end_date),          
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: contract,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async deleteContract(req, res) {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          message: "ID Kontrak Tidak Boleh Kosong",
        });
      }

      await prisma.contracts.delete({
        where: {
          id: Number(id),
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: "Berhasil menghapus kontrak",
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async updateStatusContract(req, res) {
    try {
      const { id } = req.params;
      const { contract_status } = req.body;

      if (!contract_status) {
        return res.status(400).json({
          message: "ID Kontrak dan Status Kontrak harus diisi",
        });
      }

      const contract = await prisma.contracts.update({
        where: {
          id: Number(id),
        },
        data: {
          contract_status: Number(contract_status),
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: contract,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async getAllEmployee(req, res) {
    try {
      const page = Number(req.query.page || 1);
      const perPage = Number(req.query.perPage || 10);           
      const sortBy = req.query.sortBy || "id";
      const sortType = req.query.order || "desc";
      
      const params = {}
      //console.log(JSON.stringify(params));
      const gendertext = [
        { value: 0, text: 'Pria' },
        { value: 1, text: 'Wanita' },
      ]

      const [count, allemployee] = await prisma.$transaction([
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
            user_birthdate: true,
            user_entrydate: true,
            user_foto: true,
            user_ispermanent: true,
            user_gender: true,
            user_onboarding_date: true,
            user_nik: true,
            user_npwp: true,
            user_status: true,
            user_position: true,
            recruitment: {
                select: {
                    id: true,
                    cv_uploaded: true,
                }
            },
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
            user_address: true,
            users: {
                select: {
                    id: true,
                    username: true,
                    user_status: true,
                    user_create_datetime: true,                    
                },                
            },
            contracts: {
                select: {
                    id: true, 
                    contract_number: true,
                }
            },
            position: {
                select: {
                    id: true,
                    position_name: true,  
                    position_code: true,
                    position_head:true,
                    position: {
                        select: {
                            id: true,
                            position_name: true,
                            position_code: true,
                        }
                    },                  
                    departments: {
                        select: {
                            dept_name: true,
                            divisions: {
                                select: {
                                    division_name: true,
                                    groups: {
                                        select: {
                                            group_name: true,                                            
                                        }
                                    }
                                }
                            }
                        }
                    },
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

      const dataResult = await Promise.all(
        allemployee.map(async (item) => {       
          const nama_atasan = await prisma.user_profile.findFirst({
            where: {
              user_position: item.position?.position?.id,
            },
            select: {
              user_nama: true,
            }
          });   
          return {            
            id: item.id,            
            name: item.user_nama,
            email: item.user_email,
            employee_number: item.user_employee_number,
            phone: item.user_phone,
            gender: item.user_gender,
            permanent_status: item.user_ispermanent,
            gender_text: gendertext.filter(key => key.value === item.user_gender)[0]?.text,
            birthdate: item.user_birthdate,
            birthdate_text: moment(item.user_birthdate).format('YYYY-MM-DD'),
            //fate format dd-mm-yyyy
            onboarding_date: moment(item.user_onboarding_date).format('DD-MM-YYYY'),
            onboarding_date_text: moment(item.user_onboarding_date).format('DD-MM-YYYY'),
            position_name: item.position?.position_name,
            position_code: item.position?.position_code,
            position_head_name: item.position?.position?.position_name,
            nama_atasan: item.position?.position_head == null ? '' :  nama_atasan?.user_nama,
            position_id: item.user_position,
            age: moment().diff(item.user_birthdate, 'years'),
            contract_number: item.contracts?.contract_number,
            departement: item.position?.departments?.dept_name,
            division: item.position?.departments?.divisions?.division_name,
            group: item.position?.departments?.divisions?.groups?.group_name,
            nik: item.user_nik,
            npwp: item.user_npwp,
            user_status: item.user_status,
            prov_name: item.subdistricts?.districts?.cities?.provinces?.prov_name,
            prov_id: item.subdistricts?.districts?.cities?.provinces?.prov_id,
            city_name: item.subdistricts?.districts?.cities?.city_name,
            city_id: item.subdistricts?.districts?.cities?.city_id,
            district_name: item.subdistricts?.districts?.dis_name,      
            district_id: item.subdistricts?.districts?.dis_id,      
            subdistrict_name: item.subdistricts?.subdis_name,
            subdistrict_id: item.subdistricts?.subdis_id,
            streetAddress: item.user_address,
            cv_uploaded: item.recruitment?.cv_uploaded,
          };
        }
      )
      );
      res.status(200).json({
        // aggregate,
        message: "Sukses Ambil Data",
        data: dataResult,       
      });
    }
    catch (error) {
      res.status(500).json({
        message: error?.message,
      });
    }
  },
  //create promote method
  async createPromote(req, res) {
    try {
      const user_id = req.params.id;
      const { contract_id, permanent_date } = req.body;

      if (!user_id || !contract_id || !permanent_date) {
        return res.status(400).json({
          message: "User ID, Contract ID, dan Tanggal Permanen harus diisi",
        });
      }

      const user = await prisma.user_profile.findUnique({
        where: {
          id: Number(user_id),
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User tidak ditemukan",
        });
      }            

      await prisma.user_profile.update({
        where: {
          id: Number(user_id),
        },
        data: {
          user_ispermanent: 1,
          user_contract_id: Number(contract_id),
          user_permanent_date: new Date(permanent_date),
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: "Berhasil Promosi Karyawan",
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
};
