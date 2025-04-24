const { generate } = require("../helper/auth-jwt");
const { prisma } = require("../../prisma/client");
const { z } = require("zod");
const {saveLog} = require("../helper/log");
const { create } = require("lodash");

const formatDate = (datestring) => {
  const today = new Date(datestring)
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

module.exports = {
  async getPosition(req, res) {
    try {
      const userId = req.user_id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "id";

      const positions = await prisma.position.findMany({
          select: {
              id: true,
              position_code: true,
              position_name: true,
              position_deskripsi: true,
              position_grade: true,
              status: true,
              created_date: true,
              departments: {
                include: {
                  divisions: {
                    include: {
                      groups: true
                    }
                  }
                }
              }
          },
          orderBy: {
            [sortBy]: sortType,
          },
      });      

      return res.status(200).json({
        message: "Sukses",
        data: positions,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async getPositionById(req, res) {
    try {
      const userId = req.user_id;
      const idPosition = req.params.id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "id";

      const positionsid = await prisma.position.findMany({
          select: {
              id: true,
              position_code: true,
              position_name: true,
              position_deskripsi: true,
              position_grade: true,
              status: true,
              created_date: true,
              departments: {
                include: {
                  divisions: {
                    include: {
                      groups: true
                    }
                  }
                }
              }
          },
          where: {
            id: Number(idPosition),
          },
          orderBy: {
            [sortBy]: sortType,
          },
      });      

      return res.status(200).json({
        message: "Sukses",
        data: positionsid,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async getPositionVacant(req, res) {
    try {
      const userId = req.user_id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "id";

      const positions = await prisma.position.findMany({
          select: {
              id: true,
              position_code: true,
              position_name: true,
              position_deskripsi: true,
              position_grade: true,
              status: true,
              created_date: true,
              departments: {
                // select: {
                //   id: true,
                //   dept_name: true,
                // },
                include: {
                  divisions: {
                    include: {
                      groups: true
                    }
                  }
                }
              },
          },
          where: {
            status: 0,
          },
          orderBy: {
            [sortBy]: sortType,
          },
      });      

      return res.status(200).json({
        message: "Sukses",
        data: positions,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async createPosition(req, res) {
    try {
      const userId = req.user_id;
      
      const { position_name, position_code, position_grade, position_deskripsi, dept_id } = req.body;

      if (!position_name) {
        return res.status(400).json({
          message: "Nama Posisi Tidak Boleh Kosong",
        });
      }
      const checkData = await prisma.position.findUnique({
        where: {
          position_code,
        },
      });
      if (checkData) {
        return res.status(400).json({
          message: "Kode Posisi Sudah Ada",
          code: 400,
        });
      }
      const checkDept = await prisma.departments.findUnique({
        where: {
          id: Number(dept_id),
        },
      });
      if (!checkDept) {
        return res.status(400).json({
          message: "ID Departemen Tidak Ditemukan",
        });
      }
      if (!position_code) {
        return res.status(400).json({
          message: "Kode Posisi Tidak Boleh Kosong",
        });
      }
      if (!position_grade) {
        return res.status(400).json({
          message: "Grade Posisi Tidak Boleh Kosong",
        });
      }
      if (!dept_id) {
        return res.status(400).json({
          message: "ID Departemen Tidak Boleh Kosong",
        });
      }

      const dataBaru = await prisma.position.create({
        data: {
          position_name,
          position_code,
          position_deskripsi,
          position_grade: Number(position_grade),          
          dept_id: Number(dept_id),
          created_by: Number(userId),
        },
      });

      const savelog =  saveLog({user_id: userId, activity: `Register New Vacancy : Nama Posisi ${position_name}`, route: 'recruitment/tambah'});

      res.status(200).json({
        message: "Sukses Membuat Posisi Baru",
        data: dataBaru
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async updatePosition(req, res) {
    try {
      const userId = req.user_id;
      const { id } = req.params;
      
      const { position_name, position_code, position_grade, position_deskripsi, dept_id, status } = req.body;

      console.log("ID", JSON.stringify(req.body));
      

      if (!position_name && position_name !== "") {
        return res.status(400).json({
          message: "Nama Posisi Tidak Boleh Kosong",
        });
      }
      const checkData = await prisma.position.findUnique({
        where: {
          id: Number(id),
        },
      });
      if (!checkData) {
        return res.status(404).json({
          message: "Data Posisi Tidak Ditemukan",
        });
      }
      if (!dept_id) {
        return res.status(400).json({
          message: "ID Departemen Tidak Boleh Kosong",
        });
      }
      const checkDept = await prisma.departments.findUnique({
        where: {
          id: Number(dept_id),
        },
      });
      if (!checkDept) {
        return res.status(400).json({
          message: "ID Departemen Tidak Ditemukan",
        });
      }
      if (!position_code && position_code !== "") {
        return res.status(400).json({
          message: "Kode Posisi Tidak Boleh Kosong",
        });
      }
      if (!position_grade && position_grade !== "") {
        return res.status(400).json({
          message: "Grade Posisi Tidak Boleh Kosong",
        });
      } 

      const savelog =  saveLog({user_id: userId, activity: `Update Vacancy : Nama Posisi ${position_name}`, route: `recruitment/tambah/:${id}`});

      const updateDataPosisi = await prisma.position.update({
        data: {
          position_name,
          position_code,
          position_deskripsi,
          position_grade: Number(position_grade),          
          dept_id: Number(dept_id),
          status: Number(status),
        },
        where: {
          id: Number(id),
        },
      });

      res.status(200).json({
        message: "Sukses Mengubah Posisi",
        data: updateDataPosisi
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async deletePosition(req, res) {
    try {
      const userId = req.user_id;
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          message: "ID Posisi Tidak Boleh Kosong",
        });
      }
      const checkData = await prisma.position.findUnique({
        where: {
          id: Number(id),
        },
      });
      if (!checkData) {
        return res.status(404).json({
          message: "Data Posisi Tidak Ditemukan",
        });
      }

      const checkVacancy = await prisma.user_profile.findFirst({
        where: {
          user_position: Number(id),
        },
      });
      if (checkVacancy) {
        return res.status(400).json({
          message: "Data Posisi Masih Digunakan",
        });
      }

      const deleteDataPosisi = await prisma.position.delete({
        where: {
          id: Number(id),
        },
      });

      const savelog =  saveLog({user_id: userId, activity: `Delete Vacancy : Nama Posisi ${checkData.position_name}`, route: `recruitment/delete`});

      res.status(200).json({
        message: "Sukses Menghapus Posisi",
        data: deleteDataPosisi
      });
            
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async getAllRecruitment(req, res) {
    try {
      const userId = req.user_id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "id";

      const recruitment = await prisma.recruitment.findMany({          
          select: { 
              id: true,
              date_register: true,
              fullname: true,
              gender: true,
              phone: true,
              email: true,
              birthdate: true,
              experience: true,
              position: {
                select: {
                  id: true,
                  position_name: true,
                  position_code: true,
                },
              },
              education: true,
              provinces: {
                  select:{
                      prov_id: true,
                      prov_name: true
                  }
              },
              cities: {
                  select: {
                      city_id: true,
                      city_name: true
                  }
              },
              districts: {
                  select: {
                      dis_id: true,
                      dis_name: true
                  }
              },
              subdistricts: {
                  select : {
                      subdis_id: true,
                      subdis_name: true
                  }
              },
              address: true,
              npwp: true,
              nik: true,
              cv_uploaded: true,
              status: true,
          },
          orderBy: {
            [sortBy]: sortType,
          },
      });   
      
      const recResult = await Promise.all(
        recruitment.map(async (item) => {
            return {
              ...item,
              id: item.id,
              date_register: item.date_register.toISOString().split('T')[0],
              fullname: item.fullname,              
              genderText: item.gender == 0 ? "Laki-laki":"Wanita",
              birthdate: item.birthdate.toISOString().split('T')[0],              
            }
        })
      )

      return res.status(200).json({
        message: "Sukses",
        //dataRecruitment: recruitment,
        data : recResult

      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async applyPosition(req, res) {
    try {
      //FILE
      const userId = req.user_id;
      const file = req.file;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const schema = z.object({
        fullname: z.string().min(1, { message: "Nama Lengkap Tidak Boleh Kosong" }),
        phone: z.string().min(1, { message: "No Handphone Tidak Boleh Kosong" }),
        email: z.string().min(1, { message: "Email Tidak Boleh Kosong" }),
        // birthdate: z
        // .string()
        // .regex(dateRegex, 'Date must be in YYYY-MM-DD format')
        // .refine((dateStr) => {
        //   const parsed = Date.parse(dateStr);
        //   return !isNaN(parsed);
        // }, 'Invalid date'),
        //birthdate: z.date().min(new Date("1960-01-01"), { message: "Tanggal Lahir Tidak Valid" }),
        //gender: z.enum([0, 1], { errorMap: () => ({ message: "Jenis Kelamin Tidak Valid" }) }),
        //position_id: z.number().min(1, { message: "ID Posisi Tidak Boleh Kosong" }),
        npwp: z.string().optional(),
        address: z.string().optional(),
        nik: z.string().optional(),        
      })
      // const body = await schema.safeParseAsync({
      //   ...req,
      //   // user_input_id: userId,
      //   // position_id: Number(req.body.position_id),
      //   // birthdate: new Date(req.body.birthdate),
      //   //cv_uploaded: `uploads/uploadcv/${file.filename}`,
      // });

      const result = schema.safeParse({ birthdate: req.body.birthdate });

      if (!result.success) {
        console.log(result.error.issues);
      } else {
        console.log('Valid date string!');
      }


      const validation = schema.parse(req.body); 
      if(!validation){
        return res.status(400).json({
          error: 'Validation error',
          details: err.errors,
        });
      }
      
      if (!file) {
        return res.status(400).json({
          message: "File CV Tidak Boleh Kosong",
        });
      }
      if (!file.mimetype.includes("pdf")) {
        return res.status(400).json({
          message: "File CV Harus Berupa PDF",
        });
      }
      if (!file.mimetype.includes("application/pdf")) {
        return res.status(400).json({
          message: "File CV Harus Berupa PDF",
        });
      }
      
      // const checkData = await prisma.recruitment.findFirst({
      //   where: {
      //     email: body.data.email,
      //     position_id: Number(body.data.position_id),
      //   },
      // });
      // if (checkData) {
      //   return res.status(400).json({
      //     message: "Email Sudah Pernah Mendaftar",
      //   });
      // }
      // if (!body.success) {
      //   return res.status(400).json({
      //     message: body.error.issues[0].message,
      //   });
      // }
      //const {...rest} = body.data;
      const recruitment = await prisma.recruitment.create({
        data: {
          //...rest,
          fullname: req.body.fullname,//req.body.data.fullname,
          phone: req.body.phone,
          email: req.body.email,
          birthdate: new Date(req.body.birthdate),
          position_id: Number(req.body.position_id),
          user_input_id: Number(userId),
          status: 0,
          gender: Number(req.body.gender),
          experience: Number(req.body.experience),
          education: Number(req.body.education),
          prov_id: Number(req.body.prov_id),
          city_id: Number(req.body.city_id),
          district_id: Number(req.body.district_id),
          subdistrict_id: Number(req.body.subdistrict_id),
          npwp: req.body.npwp,
          nik: req.body.nik,
          address: req.body.address,
          //cv_uploaded: file?.filename,
          cv_uploaded: `uploads/uploadcv/${file.filename}`,
          date_register: new Date(),
        },
      });
      const savelog =  saveLog({user_id: userId, activity: `Apply Untuk : ${req.body.fullname}`, route: 'recruitment/apply'});
      res.status(200).json({
        message: "Sukses Mendaftar Posisi",
        data: recruitment,
      });      
      
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async editApplyPosition(req, res) {
    try {
      //FILE
      const userId = req.user_id;
      const id = req.params.id;
      const file = req.file;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const schema = z.object({
        fullname: z.string().min(1, { message: "Nama Lengkap Tidak Boleh Kosong" }),
        phone: z.string().min(1, { message: "No Handphone Tidak Boleh Kosong" }),
        email: z.string().min(1, { message: "Email Tidak Boleh Kosong" }),
        // birthdate: z
        // .string()
        // .regex(dateRegex, 'Date must be in YYYY-MM-DD format')
        // .refine((dateStr) => {
        //   const parsed = Date.parse(dateStr);
        //   return !isNaN(parsed);
        // }, 'Invalid date'),
        //birthdate: z.date().min(new Date("1960-01-01"), { message: "Tanggal Lahir Tidak Valid" }),
        //gender: z.enum([0, 1], { errorMap: () => ({ message: "Jenis Kelamin Tidak Valid" }) }),
        //position_id: z.number().min(1, { message: "ID Posisi Tidak Boleh Kosong" }),
        npwp: z.string().optional(),
        address: z.string().optional(),
        nik: z.string().optional(),        
      })
      // const body = await schema.safeParseAsync({
      //   ...req,
      //   // user_input_id: userId,
      //   // position_id: Number(req.body.position_id),
      //   // birthdate: new Date(req.body.birthdate),
      //   //cv_uploaded: `uploads/uploadcv/${file.filename}`,
      // });

      const result = schema.safeParse({ birthdate: req.body.birthdate });

      if (!result.success) {
        console.log(result.error.issues);
      } else {
        console.log('Valid date string!');
      }


      const validation = schema.parse(req.body); 
      if(!validation){
        return res.status(400).json({
          error: 'Validation error',
          details: err.errors,
        });
      }
      
      if (!file) {
        return res.status(400).json({
          message: "File CV Tidak Boleh Kosong",
        });
      }
      if (!file.mimetype.includes("pdf")) {
        return res.status(400).json({
          message: "File CV Harus Berupa PDF",
        });
      }
      if (!file.mimetype.includes("application/pdf")) {
        return res.status(400).json({
          message: "File CV Harus Berupa PDF",
        });
      }
      
      // const checkData = await prisma.recruitment.findFirst({
      //   where: {
      //     email: body.data.email,
      //     position_id: Number(body.data.position_id),
      //   },
      // });
      // if (checkData) {
      //   return res.status(400).json({
      //     message: "Email Sudah Pernah Mendaftar",
      //   });
      // }
      // if (!body.success) {
      //   return res.status(400).json({
      //     message: body.error.issues[0].message,
      //   });
      // }
      //const {...rest} = body.data;
      const recruitment = await prisma.recruitment.update({
        data: {
          //...rest,
          fullname: req.body.fullname,//req.body.data.fullname,
          phone: req.body.phone,
          email: req.body.email,
          birthdate: new Date(req.body.birthdate),
          position_id: Number(req.body.position_id),
          user_input_id: Number(userId),
          status: 0,
          gender: Number(req.body.gender),
          experience: Number(req.body.experience),
          education: Number(req.body.education),
          prov_id: Number(req.body.prov_id),
          city_id: Number(req.body.city_id),
          district_id: Number(req.body.district_id),
          subdistrict_id: Number(req.body.subdistrict_id),
          npwp: req.body.npwp,
          nik: req.body.nik,
          address: req.body.address,
          //cv_uploaded: file?.filename,
          cv_uploaded: `${file.filename}`,
          date_register: new Date(),
        },
        where: {
            id: Number(id)
        }
      });
      const savelog =  saveLog({user_id: userId, activity: `Update Untuk data : ${req.body.fullname}`, route: 'recruitment/apply'});
      res.status(200).json({
        message: "Sukses Update Rekrutment",
        data: recruitment,
      });      
      
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  }

  
};
