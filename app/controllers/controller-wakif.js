const { prisma } = require("../../prisma/client");
const fs = require("fs");
const  moment  = require("moment")

module.exports = {

  async create(req, res) {
    try {
      const userId = req.user_id;

      const {
       waqif_name,
       waqif_whatsapp,
       waqif_nik,
       waqif_gender,
       waqif_birthplace,
       waqif_birthdate,
       waqif_iswna,
       //waqif_country,
       waqif_prov_id,
       waqif_city_id,
       waqif_agama,
       waqif_pekerjaan
      } = req.body;

      console.log(JSON.stringify(req.body))      

      const waqifResult = await prisma.waqif.create({
        data: {
          user: {
            connect: {
              user_id: Number(userId),
            },
          },
          waqif_name,
          waqif_whatsapp,
          waqif_nik,
          waqif_gender,
          waqif_birthplace,
          waqif_birthdate: moment().toISOString(waqif_birthdate),
          waqif_iswna,
          //waqif_country,
          provinces: {
              connect : {
                prov_id : Number(waqif_prov_id),        
              }
          },
          cities : {
              connect : {
                city_id : Number(waqif_city_id),
              }
          },
          waqif_agama,
          waqif_pekerjaan
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: waqifResult,
      });
    } catch (error) {
     
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  async createWakafReg(req, res) {
    try {
    
      const {
       waqif_id,
       waqif_reg_type,
       waqif_reg_program_id,
       waqif_reg_nominal,
       waqif_reg_jangkawaktu,
       waqif_reg_isrecurring,
       waqif_reg_payment_method,
       waqif_reg_doa,
       waqif_reg_ishide
      } = req.body;

      //console.log(JSON.stringify(req.body))      

      const regResult = await prisma.waqif_register.create({
        data: {
          waqif : {
              connect : {
                  id : Number(waqif_id),
              }
          },          
          waqif_reg_type : Number(waqif_reg_type),
          program : {
              connect : {
                  program_id : Number(waqif_reg_program_id),
              }
          },         
          waqif_reg_nominal : Number(waqif_reg_nominal),
          waqif_reg_jangkawaktu : Number(waqif_reg_jangkawaktu),
          waqif_reg_isrecurring : Number(waqif_reg_isrecurring),
          waqif_reg_payment_method,
          waqif_reg_doa,
          waqif_reg_ishide: Number(waqif_reg_ishide)
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

  async createWakafReg_Nologin(req, res) {
    try {

      const userId = 3;
      const waqif_prov_id = 11;
      const waqif_city_id = 156;
    
      const {
       waqif_name,
       waqif_whatsapp,
       waqif_email,
       waqif_reg_type,
       waqif_reg_program_id,
       waqif_reg_nominal,
       waqif_reg_jangkawaktu,
       waqif_reg_isrecurring,
       waqif_reg_payment_method,
       waqif_reg_doa,
       waqif_reg_ishide
      } = req.body;

      //console.log(JSON.stringify(req.body))   
      
      const waqifResult = await prisma.waqif.create({
        data: {
          user: {
            connect: {
              user_id: Number(userId),
            },
          },
          waqif_name,
          waqif_whatsapp,
          waqif_email,
          //waqif_nik,
          //waqif_gender,
          //waqif_birthplace,
          //waqif_birthdate: moment().toISOString(waqif_birthdate),
          //waqif_iswna,
          //waqif_country,
          provinces: {
              connect : {
                prov_id : Number(waqif_prov_id),        
              }
          },
          cities : {
              connect : {
                city_id : Number(waqif_city_id),
              }
          },
          //waqif_agama,
          //waqif_pekerjaan
        },
      });
      
      const wakif_id = Number(waqifResult.id);

      const regResult = await prisma.waqif_register.create({
        data: {
          waqif : {
              connect : {
                  id : Number(wakif_id),
              }
          },          
          waqif_reg_type : Number(waqif_reg_type),
          program : {
              connect : {
                  program_id : Number(waqif_reg_program_id),
              }
          },         
          waqif_reg_nominal : Number(waqif_reg_nominal),
          waqif_reg_jangkawaktu : Number(waqif_reg_jangkawaktu),
          waqif_reg_isrecurring : Number(waqif_reg_isrecurring),
          waqif_reg_payment_method,
          waqif_reg_doa,
          waqif_reg_ishide: Number(waqif_reg_ishide)
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

  async createWakafTransactions_Nologin(req, res) {
    try {
      const userId = req.user_id;

      const {
       waqif_reg_id,       
       waqif_trans_nominal,
       waqif_trans_status,
       waqif_trans_va_tujuan,
       waqif_trans_bank
      } = req.body;

      //console.log(JSON.stringify(req.body))      

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


  async getWaqifById(req, res) {
    try {
      const page = Number(req.query.page || 1);
      const perPage = Number(req.query.perPage || 10);
      const status = Number(req.query.status || 1);
      const skip = (page - 1) * perPage;
      const keyword = req.query.keyword || "";
      const sortBy = req.query.sortBy || "id";
      const sortType = req.query.order || "asc";
      const id = req.params.id
      const params = { user_id: Number(id)};

      const [count, detailwaqif] = await prisma.$transaction([
        prisma.waqif.count({
          where: params,
        }),
        prisma.waqif.findMany({
          orderBy: {
            [sortBy]: sortType,
          },
          where: params,
          include: {
            user: true,
            provinces: true,
            cities: true
          },
          skip,
          // take: perPage,
        }),
      ]);

      res.status(200).json({
        // aggregate,
        message: "Sukses Ambil Data Detail Waqif",

        data: detailwaqif,
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

      //console.log(JSON.stringify(req.body))      

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
      const params = {  waqif : { user_id: Number(userId) }} ;
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
              include : {
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
