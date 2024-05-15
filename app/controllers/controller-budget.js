const { prisma } = require("../../prisma/client");
const fs = require("fs/promises");

const { customAlphabet } = require("nanoid");
const { z, number } = require("zod");

module.exports = {

  async programList(req, res) {
    try {
      //const userId = req.user_id;

      const ptc = await prisma.program.findMany({
        
      });

      if (!ptc) {
        return res.status(404).json({
          message: "Program tidak ditemukan",
        });
      }

      
      const programResult = await Promise.all(
        ptc.map(async (item) => {        
          item.program_target_amount = undefined
          
          return {                
            ...item,
            //tahun: item.tahun,
            //tahun_laporan: item.tahun_laporan,
            //program_title: item.program.program_title || "",
            //program_kode : item.program.program_kode ||"",
            //amount: item.amount,                
          };
        })
      );

      res.status(200).json({
        // aggregate,
        message: "Sukses Ambil Data",
        data: programResult,
        
      });

    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
      async allBudgetData(req, res) {
        try {
          const page = Number(req.query.page || 1);
          const perPage = Number(req.query.perPage || 10);
          const status = Number(req.query.status || 4);
          const skip = (page - 1) * perPage;
          const keyword = req.query.keyword || "";
          const user_type = req.query.user_type || "";
          const category = req.query.category || "";
          const sortBy = req.query.sortBy || "id";
          const sortType = req.query.order || "asc";
    
          const params = {                    
            OR: [
              {
                program: {
                  program_title:{
                    contains: keyword,
                  }
                },
                program: {
                  program_description:{
                    contains: keyword,
                  }
                }   
              }
            ]
                     
          };
    
          const [count, budgetData] = await prisma.$transaction([
            prisma.budget.count({
              where: params,
            }),
            prisma.budget.findMany({
              include:{
                program:true
              },
              orderBy: {
                [sortBy]: sortType,
              },
              where: params,         
              skip,
              take: perPage,
            }),
          ]);
    
          const budgetResult = await Promise.all(
            budgetData.map(async (item) => {
              
              //console.log("-----<<<<", JSON.stringify(item));
              
              item.program.program_target_amount = undefined
              //item.program.total_donation: ,
            
              return {                
                ...item,
                //tahun: item.tahun,
                //tahun_laporan: item.tahun_laporan,
                //program_title: item.program.program_title || "",
                //program_kode : item.program.program_kode ||"",
                //amount: item.amount,                
              };
            })
          );
    
          res.status(200).json({
            // aggregate,
            message: "Sukses Ambil Data",
    
            data: budgetResult,
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

      async createBudget(req, res) {
        try {
          const userId = req.user_id;
                    
          const {
            program_id,
            tahun,
            tahun_laporan,
            amount            
          } = req.body;
    
          //console.log(JSON.stringify(req.body))
            
          const budgetResult = await prisma.budget.create({
            data: {
              program: {
                connect: {
                  program_id: Number(program_id),
                },
              },        
              tahun,
              tahun_laporan,                   
              amount: Number(amount)             
            },
          });
    
          return res.status(200).json({
            message: "Sukses",
            data: budgetResult,
          });
        } catch (error) {
              
          return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
          });
        }
      },

      async updateBudget(req, res) {
        try {
          const id = req.params.id;
                    
          const {
            program_id,            
            tahun,
            tahun_laporan,
            amount,
          } = req.body;
    
          //console.log(JSON.stringify(req.body))
            
          const budgetResult = await prisma.budget.update({
            where: {
              id: Number(id),
            },
            data: {
              program: {
                connect: {
                  program_id: Number(program_id),
                },
              },                 
              tahun,
              tahun_laporan,
              amount: Number(amount),             
            },
          });
    
          return res.status(200).json({
            message: "Sukses",
            data: budgetResult,
          });
        } catch (error) {
              
          return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
          });
        }
      },

      async deleteBudget(req, res) {
        try {
          const id = req.body.id;
    
          await prisma.budget.delete({
            where: {
              id: Number(id),
            }        
          });
    
          return res.status(200).json({
            message: "Sukses",
            data: "Berhasil Delete Data",
          });
        } catch (error) {
          return res.status(500).json({
            message: error?.message,
          });
        }
      },      
}