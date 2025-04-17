const { generate } = require("../helper/auth-jwt");
const { prisma } = require("../../prisma/client");
const { z } = require("zod");
const {saveLog} = require("../helper/log")

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
              position: {
                select: {
                  id: true,
                  position_name: true,
                  position_code: true,
                },
              },
              status: true,
          },
          orderBy: {
            [sortBy]: sortType,
          },
      });      

      return res.status(200).json({
        message: "Sukses",
        data: recruitment,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  
};
