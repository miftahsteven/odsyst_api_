const { generate } = require("../helper/auth-jwt");
const { prisma } = require("../../prisma/client");
const { z } = require("zod");
const {saveLog} = require("../helper/log");
const { create } = require("lodash");
const { user } = require(".");

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
              position: {
                select: {
                  id: true,
                  position_name: true,
                  position_code: true,
                },
              },
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
      
      const { position_name, position_code, position_grade, position_deskripsi, dept_id, position_head } = req.body;

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
          position_head: position_head ? Number(position_head) : null,
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
      
      const { position_name, position_code, position_grade, position_deskripsi, dept_id, status,position_head } = req.body;

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
          position_head: position_head ? Number(position_head) : null,
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
              recruitment_status: {
                select: {
                  id: true,
                  name: true,
                }          
              },
              approval_process: {
                select: {
                  id: true,
                  user_approval_id: true,
                  user_candidat_id: true,
                  approval_status: true,
                  approval_type: true,
                  approval_desc: true,
                  users: {
                    select: {
                      id: true,
                      user_profile: {
                        select: {
                          user_nama: true,
                          position: {
                            select: {
                              position_name: true,                              
                            }
                          }
                        }
                      }
                    }
                  }                                                        
                },
              },
              recruitment_process: {
                select: {
                  id: true,
                  process_status: true,
                  status_pic_id: true,
                  process_description: true,
                  recruitment_id: true,
                  recruitment_status: {
                    select: {
                      id: true,
                      name: true,
                    }
                  },                  
                }          
              },    
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
              status: item.status === null ? 'No Status' : item.recruitment_status.name,
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
          status: Number(req.body.status),
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
        npwp: z.string().optional(),
        address: z.string().optional(),
        nik: z.string().optional(),        
      })
      
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
      
      if (file) {        

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
        
        const checkData = await prisma.recruitment.findUnique({
          select: {
            id: true,
            cv_uploaded: true,
          },
          where: {
            id: Number(id),
          },
          where: {
            id: Number(id),
          },
        });
        if (checkData) {
          const deleteFile = checkData.cv_uploaded;
          const fs = require("fs");
          const path = require("path");
          const filePath = path.join(__dirname, `../../uploads/cv/${deleteFile}`);
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
            } else {
              console.log("File deleted successfully");              
            }
          });
        }         
      }
    
      const recruitment = await prisma.recruitment.update({
        data: {
          //...rest,
          fullname: req.body.fullname,
          phone: req.body.phone,
          email: req.body.email,
          birthdate: new Date(req.body.birthdate),
          position_id: Number(req.body.position_id),
          user_input_id: Number(userId),
          //status: 0,
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
          //cv_uploaded: `${file.filename}`,
          //cv_uploaded: `${file?.filename}`,
          date_register: new Date(),
        },
        where: {
            id: Number(id)
        }
      });
      if(file !== undefined){
        const updateFile = await prisma.recruitment.update({
          data: {
            cv_uploaded: `${file.filename}`,
          },
          where: {
            id: Number(id),
          },
        });   
      }
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
  },

  async updateStatusRecruitement(req, res) {
    try {
      const userId = req.user_id;
      const { id } = req.params;
      const { process_status, status_pic_id, process_description  } = req.body;

      const updateStatus = await prisma.recruitment.update({
          data : {
            status: Number(process_status)
          },
          where :{
              id: Number(id)
          }
      })

      const insertStatus = await prisma.recruitment_process.create({
        data : {
          recruitment_id: Number(id),
          process_status: Number(process_status),
          status_pic_id: Number(status_pic_id) ?? null,
          process_description: process_description,        
        }       
    })

      const savelog =  saveLog({user_id: userId, activity: `Update Status Untuk data dengan ID : ${id}`, route: 'recruitment/applychangestatus/'+id});

      res.status(200).json({
        message: "Sukses Mengubah Status Recruitment",
        data: insertStatus,
      });      
    
    } catch (e){
      return res.status(500).json({
        message: error?.message,
      });
    }
  
  },
  async getUserInterviewer(req, res) {
    try {
      const userId = req.user_id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "id";

      const pic_interview = await prisma.users.findMany({
          select: {
              id:true,
              user_profile: {                
                select: {
                  user_nama: true,
                  user_grade: true,
                  position: {                   
                    select: {
                      position_name: true,
                      departments: {
                        select: {
                          dept_name: true,
                          divisions: {
                            select: {
                              division_name: true,
                              groups: true
                            }
                          }
                        }
                      }
                    }
                  },                  
                }
              },
          },
          where: {
              user_profile: {
                  some: {
                      user_grade: {
                        in: [6,7]
                      }
                  }
              },
          },
          orderBy: {
            [sortBy]: sortType,
          },
      });      

      return res.status(200).json({
        message: "Sukses",
        data: pic_interview,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  //approve recruitment
  async approveRecruitment(req, res) {
    try {
      const userId = req.user_id;
      const {id} = req.params;
      const { approval_status, approval_type, approval_desc } = req.body;
      
      if (!id) {
        return res.status(400).json({
          message: "ID Kandidat Tidak Boleh Kosong",
        });
      }
      if (!id) {
        return res.status(400).json({
          message: "User Candidat Id Tidak Boleh Kosong",
        });
      }

      //cek userID has approval process in candidate
      const checkApproval = await prisma.approval_process.findFirst({
        where: {
          AND: [
            { user_candidat_id: Number(id) },
            { user_approval_id: Number(userId) },
            { approval_type: Number(approval_type) } //1 is for approved
          ]
        },
      });
      if (checkApproval) {
        return res.status(400).json({
          message: "Anda Sudah Melakukan Approval Untuk Kandidat Ini",
        });
      }

      const recruitment = await prisma.approval_process.create({
        data: {
          user_approval_id: Number(userId),
          user_candidat_id: Number(id),
          approval_status: Number(approval_status),
          approval_type: Number(approval_type),
          approval_desc: approval_desc,
        },       
      });

      //update status recruitment when approva_status is 0
      // if (Number(approval_status) === 0) {
      //   const updateRecruitment = await prisma.recruitment.update({
      //     data: {
      //       status: 7 //status 7 is for failed recruitment
      //     },
      //     where: {
      //       id: Number(id),
      //     },
      //   });
      // }

      const savelog =  saveLog({user_id: userId, activity: `Approve Recruitment : ID ${id}`, route: 'recruitment/list/approval/'+id});

      return res.status(200).json({
        message: "Sukses Approve Recruitment",
        data: recruitment,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  //update approval recruitment
  async updateApprovalRecruitment(req, res) {
    try {
      const userId = req.user_id;
      const {id} = req.params;
      const { approval_status, approval_desc } = req.body;
      
      if (!id) {
        return res.status(400).json({
          message: "ID Kandidat Tidak Boleh Kosong",
        });
      }
      if (!approval_status && approval_status !== 0) {
        return res.status(400).json({
          message: "Status dan Deskripsi Tidak Boleh Kosong",
        });
      }

      const recruitment = await prisma.approval_process.update({
        data: {          
          approval_status: Number(approval_status),          
          approval_desc: approval_desc,
        },       
        where: {
          id: Number(id),
        }
      });

      const savelog =  saveLog({user_id: userId, activity: `Update Approval Recruitment : ID ${id}`, route: 'recruitment/list/approval/'+id});

      return res.status(200).json({
        message: "Sukses Update Approve Recruitment",
        data: recruitment,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  //get all approval process data
  async getAllApprovalProcess(req, res) {
    try {
      const userId = req.user_id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "id";

      const approvalProcess = await prisma.approval_process.findMany({
          select: {
              id: true,              
              user_approval_id: true,
              user_candidat_id: true,
              approval_status: true,
              approval_type: true,
              approval_desc: true,                
              users: {
                select: {
                  id: true,
                  user_profile: {
                    select: {
                      user_nama: true,
                      position: {
                        select: {
                          position_name: true,                          
                        }
                      }
                    }
                  }
                }
              }                                                        
          },
          orderBy: {
            [sortBy]: sortType,
          },
      });      


      const statusApprovalResult = await Promise.all(
        approvalProcess.map(async (item) => {
            return {              
              id: item.id,
              iduser: item.users?.id,
              kandidatId: item.user_candidat_id,
              nama: item.users?.user_profile[0]?.user_nama,
              jabatan: item.users?.user_profile[0]?.position?.position_name,
              status: item.approval_status,
              statusText: item.approval_status === 0 ? "Ditolak" : "Disetujui",
              type: item.approval_type,
              desc: item.approval_desc,
            }
        })
      )

      return res.status(200).json({
        message: "Sukses",
        data: statusApprovalResult,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  
};
