const { prisma } = require("../../prisma/client");
const fs = require("fs");
const moment = require("moment")

module.exports = {

  async create(req, res) {
    try {
      const userId = req.user_id;

      const {
        mitra_nama,
        mitra_phone,
        mitra_email,
        mitra_nama_pendiri,
        mitra_nik,
        mitra_npwp,
        mitra_siup_no,
        mitra_siup_date,
        mitra_alamat,
        mitra_prov_id,
        mitra_city_id,
        mitra_kodepos
      } = req.body;

      //console.log(JSON.stringify(req.body))      

      const mitraResult = await prisma.mitra.create({
        data: {
          user: {
            connect: {
              user_id: Number(userId),
            },
          },
          mitra_nama,
          mitra_phone,
          mitra_email,
          mitra_nama_pendiri,
          mitra_nik,
          mitra_npwp,
          mitra_siup_no,
          mitra_siup_date: moment().toISOString(mitra_siup_date),
          mitra_alamat,
          mitra_kodepos,
          provinces: {
            connect: {
              prov_id: Number(mitra_prov_id),
            }
          },
          cities: {
            connect: {
              city_id: Number(mitra_city_id),
            }
          }
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: mitraResult,
      });
    } catch (error) {

      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  async createMitraReg(req, res) {
    try {


      const file = req.file;

      if (!file) {
        return res.status(400).json({
          message: "Proposal harus diupload",
        });
      }

      const maxSize = 5000000;
      if (file.size > maxSize) {
        await fs.unlink(file.path);

        return res.status(400).json({
          message: "Ukuran Proposal Terlalu Besar",
        });
      }


      const {
        mitra_id,
        mitra_reg_wakaf_category,
        mitra_reg_program_id,
        mitra_reg_referentor,
        mitra_reg_nama_wakaf,
        mitra_reg_alamat_wakaf,
        mitra_reg_deskripsi_wakaf,
        mitra_reg_nominal,
        mitra_reg_durasi_value,
        mitra_reg_durasi_satuan
      } = req.body;

      //console.log(JSON.stringify(req.body))      

      const regResult = await prisma.mitra_register.create({
        data: {
          mitra: {
            connect: {
              id: Number(mitra_id),
            }
          },
          mitra_reg_wakaf_category: Number(mitra_reg_wakaf_category),
          program: {
            connect: {
              program_id: Number(mitra_reg_program_id)
            }
          },
          referentor: {
            connect: {
              id: Number(mitra_reg_referentor)
            }
          },
          mitra_reg_nama_wakaf,
          mitra_reg_alamat_wakaf,
          mitra_reg_deskripsi_wakaf,
          mitra_reg_nominal: Number(mitra_reg_nominal),
          mitra_reg_durasi_value: Number(mitra_reg_durasi_value),
          mitra_reg_durasi_satuan: Number(mitra_reg_durasi_satuan),
          mitra_reg_file: `uploads/${file.filename}`
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: regResult,
      });
    } catch (error) {

      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },


  async getMitraById(req, res) {
    try {
      const page = Number(req.query.page || 1);
      const perPage = Number(req.query.perPage || 10);
      const status = Number(req.query.status || 1);
      const skip = (page - 1) * perPage;
      const keyword = req.query.keyword || "";
      const sortBy = req.query.sortBy || "id";
      const sortType = req.query.order || "asc";
      const id = req.params.id
      const params = { mitra_user_id: Number(id) };

      const [count, detailmitra] = await prisma.$transaction([
        prisma.mitra.count({
          where: params,
        }),
        prisma.mitra.findMany({
          orderBy: {
            [sortBy]: sortType,
          },
          where: params,
          include: {
            user: true,
            provinces: true,
            cities: true,
            mitra_register: {
              include: {
                program: {
                  select: {
                    program_title: true,
                    program_banner: true,
                    kategori_penyaluran: true
                  },
                }
              }
            },
            mitra_penarikan_dana: true,
          },
          skip,
          // take: perPage,
        }),
      ]);

      res.status(200).json({
        // aggregate,
        message: "Sukses Ambil Data Detail Waqif",

        data: detailmitra,
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

  async penarikanMitra(req, res) {
    try {
      const {
        status_request_penarikan,
        mitra_bank,
        mitra_no_rekening,
        mitra_nama_rekening
      } = req.body;

      const id = req.params.id

      //console.log(JSON.stringify(req.body))      

      const mitraResult = await prisma.mitra.update({
        where: {
          id: Number(id)
        },
        data: {
          status_request_penarikan,
          mitra_bank,
          mitra_no_rekening,
          mitra_nama_rekening
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: mitraResult,
      });
    } catch (error) {

      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  async createWakafTransactions(req, res) {
    try {
      const userId = req.user_id;

      const {
        waqif_reg_id,
        waqif_trans_nominal,
        waqif_trans_status,
        waqif_trans_va_tujuan,
        waqif_trans_bank
      } = req.body;

      console.log(JSON.stringify(req.body))

      const transResult = await prisma.waqif_transaction.create({
        data: {
          waqif_register: {
            connect: {
              id: Number(waqif_reg_id),
            },
          },
          waqif_trans_nominal,
          waqif_trans_status,
          waqif_trans_va_tujuan,
          waqif_trans_bank
        },
      });

      return res.status(200).json({
        message: "Sukses Transaksi",
        data: transResult,
      });
    } catch (error) {

      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  async getAllDataWakaf(req, res) {
    try {
      const page = Number(req.query.page || 1);
      const perPage = Number(req.query.perPage || 10);
      const status = Number(req.query.status || 1);
      const skip = (page - 1) * perPage;
      const keyword = req.query.keyword || "";
      const sortBy = req.query.sortBy || "id";
      const sortType = req.query.order || "asc";
      const id = req.params.id
      const userId = req.user_id;
      const params = { waqif: { user_id: Number(userId) } };
      //const params = "";

      const [count, detailwaqif] = await prisma.$transaction([
        prisma.waqif_register.count({
          where: params,
        }),
        prisma.waqif_register.findMany({
          orderBy: {
            [sortBy]: sortType,
          },
          where: params,
          include: {
            waqif: {
              include: {
                user: true
              }
            },
            waqif_transaction: true
          },
          skip,
          // take: perPage,
        }),
      ]);

      res.status(200).json({
        // aggregate,
        message: "Sukses Ambil Data List Wakaf",

        data: detailwaqif,
        pagination: {
          total: count,
          page,
          hasNext: count > page * perPage,
          totalPage: Math.ceil(count / perPage),
        },
      });
    } catch (error) {
      res.status(500).json({
        message: error?.message,
      });
    }
  },

  async detailWaqif(req, res) {
    try {
      const id = req.params.id;

      const waqifData = await prisma.waqif.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          waqif_register: {
            include: {
              waqif_transaction: true
            }
          },
        },
      });

      if (!waqifData) {
        return res.status(404).json({
          message: "Wa tidak ditemukan",
        });
      }

      //const omit = require("lodash/omit");

      //const cleanUser = omit(user, ["user_password", "user_token"]);

      return res.status(200).json({
        message: "Sukses",
        data: waqifData,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },



};
