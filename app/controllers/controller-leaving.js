const { generate } = require("../helper/auth-jwt");
const { prisma } = require("../../prisma/client");
const { z } = require("zod");
const {saveLog} = require("../helper/log");
const { create, get } = require("lodash");
const { user, leaving } = require(".");

const formatDate = (datestring) => {
  const today = new Date(datestring)
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

//create function to counting the total days of leave using working days
const countTotalDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let totalDays = 0;  
  while (start <= end) {
    // Check if the day is a working day (Monday to Friday)
    if (start.getDay() !== 0) { // 0 = Sunday, 6 = Saturday
      totalDays++;
    }
    start.setDate(start.getDate() + 1);
  }
  return totalDays;
}

const formatViewDate = (datestring) => {
  const today = new Date(datestring)
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')

  return `${dd}-${mm}-${yyyy}`
}

module.exports = {

  getAllLeaving: async (req, res) => {
    try {

      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "id";

      const result = await prisma.leave.findMany({
        select: {
          id: true,
          leave_start_date: true,
          leave_end_date: true,
          leave_reason: true,
          leave_status: true,
          leave_approval: true,
          users: {          
            select: {
              id: true,
              username: true,
              user_profile: {
                select: {
                  user_nama: true,
                }
              }
            }
          }
        },
        orderBy: {
          [sortBy]: sortType,
        }
      });   
      
      const leavingResult = await Promise.all(
        result.map(async (item) => {
            return {
              user_id: item.users.id,
              nama_lengkap: item.users.user_profile[0].user_nama,
              username: item?.users?.username,
              tanggal_mulai: formatViewDate(item.leave_start_date),
              tanggal_selesai: formatViewDate(item.leave_end_date), 
              //coount totat leaving day that using working day
              status_approval: item.leave_approval,
              jumlah_hari: countTotalDays(item.leave_start_date, item.leave_end_date),
              alasan: item.leave_reason,
              status: item.leave_status,
              id: item.id,
            }
        })
      )

      return res.status(200).json({
        message: "Sukses",
        data: leavingResult,
      });
    } catch (error) {
      console.error("Error fetching leaving records:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  /**
   * Create a new leaving record
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<Object>} - The created leaving record or an error message
   */
  leaving: async (req, res) => {
    const userId = req.user_id; // Assuming userId is available in req.user
    const { leave_start_date, leave_end_date, leave_reason, leave_status } = req.body;

    const schema = z.object({
      //create a Zod schema to validate the date input
      leave_start_date: z.string().min(1),
      leave_end_date: z.string().min(1),
      leave_reason: z.string().min(1),
      leave_status: z.string().min(1)      
    });

    try {     
      schema.parse({
        leave_start_date,
        leave_end_date,
        leave_reason,
        leave_status
      });
    } catch (error) {
      return res.status(400).json({ error: error.errors });
    }


    try {
      const result = await prisma.leave.create({
        data: {
          leave_start_date: new Date(leave_start_date),
          leave_end_date: new Date(leave_end_date),
          leave_reason,
          leave_status : Number(leave_status),
          leave_user_id: Number(userId), // Assuming userId is available in req.user
        }
      });

      const savelog = saveLog(req, "Leaving created", { userId, leave_start_date, leave_end_date, leave_reason, leave_status });
      
      return res.status(201).json({
        message: "Leaving created successfully",
        data: result,
      });
    
    } catch (error) {
      console.error("Error creating leaving:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  //approval leaving 
  approvalLeaving: async (req, res) => {
    const userId = req.user_id; // Assuming userId is available in req.user
    const { idleave, approval_status } = req.body;

    const schema = z.object({
      idleave: z.number().min(1),
      approval_status: z.string().min(1)
    });

    try {
      schema.parse({ idleave, approval_status });
    } catch (error) {
      return res.status(400).json({ error: error.errors });
    }

    try {
      const result = await prisma.leave.update({
        where: { id: Number(idleave) },
        data: {
          leave_approval: Number(approval_status),
          leave_approval_id: Number(userId), // Assuming userId is available in req.user
        }
      });

      const savelog = saveLog(req, "Leaving approved", { userId, idleave, approval_status });

      return res.status(200).json({
        message: "Leaving approved successfully",
        data: result,
      });
    
    } catch (error) {
      console.error("Error approving leaving:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  
  getLeavingDetailWithAllUser: async (req, res) => {{
    try {

      //const user_id = req.params.id; // Assuming userId is available in req.user
      const dataLeavingPerPerson3 = [];

      //print all user_id that have leaving
      const userIds = await prisma.leave.findMany({
        select: {
          leave_user_id: true,
        },
        distinct: ['leave_user_id'],
      })

      //loop all user_id and get the leaving detail
      for (const user of userIds) {        
          const userId = user.leave_user_id;
          const leaves = await prisma.leave.findMany({
            where: {
              leave_user_id: Number(userId),
              //leave_approval: 0, // Assuming 1 means approved
            },
            select: { 
              id: true,
              leave_start_date: true,
              leave_end_date: true,
              leave_reason: true,
              leave_status: true,
              leave_approval: true,
              leave_approval_id: true,
              users: {
                select: {
                  id: true,
                  username: true,
                  user_profile: {
                    select: {
                      user_nama: true,
                      user_grade: true                    
                    }
                  }
                }
              }
            },
          });

          //push the data to dataLeavingPerPerson3          
          for (const item of leaves) {

            //get data leaving_limit per user_grade
            const SQL = `SELECT leave_limit FROM leaving_limit WHERE grade = ${item.users.user_profile[0].user_grade}`;
            //get data Leave limit from query SQL
            const leavingLimitResult = await prisma.$queryRawUnsafe(SQL);
            //console.log("leavingLimit~~~~", JSON.stringify(leavingLimit.leave_limit));
            const limit = leavingLimitResult[0]?.leave_limit || 0;            

            dataLeavingPerPerson3.push({
              user_id: item.users.id,
              nama_lengkap: item.users.user_profile[0].user_nama,
              username: item?.users?.username,
              tanggal_mulai: formatViewDate(item.leave_start_date),
              tanggal_selesai: formatViewDate(item.leave_end_date),
              jumlah_hari: countTotalDays(item.leave_start_date, item.leave_end_date),              
              alasan: item.leave_reason,
              status: item.leave_status,
              id: item.id,
              leave_approval: item.leave_approval,
              leave_approval_id: item.leave_approval_id,
              user_grade: item.users.user_profile[0].user_grade,
              leaving_limit: limit, // Add the leaving limit to the user data
            });            
          }          
        }
        //push countLeaveDays to dataLeavingPerPerson3
        
        return res.status(200).json({
          message: "Sukses",
          data: dataLeavingPerPerson3,
        }); 
        
      } catch (error) {
        console.error("Error fetching leaving detail with all user:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  },
  
  //create API get leaving data by user_id distinct by user_id, and get the detail profile users
  getLeavingDetailByUserId: async (req, res) => {
    try {
      const userId = req.user_id; // Assuming userId is available in req.user

      const result = await prisma.leave.findMany({
        where: {
          leave_user_id: Number(userId),
        },
        select: {
          id: true,
          leave_start_date: true,
          leave_end_date: true,
          leave_reason: true,
          leave_status: true,
          leave_approval: true,
          users: {
            select: {
              id: true,
              username: true,
              user_profile: {
                select: {
                  user_nama: true,
                  user_grade: true
                }
              }
            }
          }
        },
        orderBy: {
          id: 'desc',
        }
      });

      const leavingResult = await Promise.all(
        result.map(async (item) => {
            return {
              user_id: item.users.id,
              nama_lengkap: item.users.user_profile[0].user_nama,
              username: item?.users?.username,
              tanggal_mulai: formatViewDate(item.leave_start_date),
              tanggal_selesai: formatViewDate(item.leave_end_date), 
              status_approval: item.leave_approval,
              jumlah_hari: countTotalDays(item.leave_start_date, item.leave_end_date),
              alasan: item.leave_reason,
              status: item.leave_status,
              id: item.id,
            }
        })
      );

      return res.status(200).json({
        message: "Sukses",
        data: leavingResult,
      });
    } catch (error) {
      console.error("Error fetching leaving records by user ID:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getLeavingDetailByUserIdParams: async (req, res) => {
    try {
      //const userId = req.params.id; // Assuming userId is available in req.params

      const result = await prisma.leave.findMany({
        // where: {
        //   leave_user_id: Number(userId),
        // },
        select: {
          id: true,
          leave_start_date: true,
          leave_end_date: true,
          leave_reason: true,
          leave_status: true,
          leave_approval: true,
          users: {
            select: {
              id: true,
              username: true,
              user_profile: {
                select: {
                  user_nama: true,
                  user_grade: true
                }
              }
            }
          }
        },
        orderBy: {
          id: 'desc',
        }
      });

      const leavingResult = await Promise.all(
        result.map(async (item) => {
            return {
              user_id: item.users.id,
              nama_lengkap: item.users.user_profile[0].user_nama,
              username: item?.users?.username,
              tanggal_mulai: formatViewDate(item.leave_start_date),
              tanggal_selesai: formatViewDate(item.leave_end_date), 
              status_approval: item.leave_approval,
              jumlah_hari: countTotalDays(item.leave_start_date, item.leave_end_date),
              alasan: item.leave_reason,
              status: item.leave_status,
              id: item.id,
            }
        })
      );

      return res.status(200).json({
        message: "Sukses",
        data: leavingResult,
      });
    } catch (error) {
      console.error("Error fetching leaving records by user ID:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  
  //get user that ever leaving with all user detail and distinct by user_id
  getLeavingDetailWithAllUserDistinct: async (req, res) => {
    try {
      const result = await prisma.leave.findMany({
        select: {
          id: true,
          leave_start_date: true,
          leave_end_date: true,
          leave_reason: true,
          leave_status: true,
          leave_approval: true,
          users: {
            select: {
              id: true,
              username: true,
              user_profile: {
                select: {
                  user_nama: true,
                  user_grade: true
                }
              }
            }
          }
        },
        distinct: ['leave_user_id'],
        orderBy: {
          id: 'desc',
        }
      });

      const leavingResult = await Promise.all(
        result.map(async (item) => {
            return {
              user_id: item.users.id,
              nama_lengkap: item.users.user_profile[0].user_nama,
              username: item?.users?.username,              
              id: item.id,
            }
        })
      );

      return res.status(200).json({
        message: "Sukses",
        data: leavingResult,
      });
    } catch (error) {
      console.error("Error fetching leaving records with all user distinct:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  
  
};
