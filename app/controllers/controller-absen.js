const { generate } = require("../helper/auth-jwt");
const { prisma } = require("../../prisma/client");
const { z } = require("zod");
const {saveLog} = require("../helper/log");
const { create, get } = require("lodash");
const moment = require('moment-timezone');

const formatDate = (datestring) => {
  const today = new Date(datestring)
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

const formatViewDate = (datestring) => {
  const today = new Date(datestring)
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')

  return `${dd}-${mm}-${yyyy}`
}

// //change picture to base64
// const convertToBase64 = (file) => {
//   if (!file) return null;
//   return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
// }

module.exports = {
  
  createAbsenIn: async (req, res) => {
    try {          

      const checkShift = await prisma.info_shift.findFirst({
        where: {
          //assumsing monday is 1, sunday is 7. get the current day of the week                    
          day: new Date().getDay() // getDay() returns 0 for Sunday, so we add 1          
        }        
      })
      //if checkShift is null, it means there is no shift for today
      if (!checkShift) {
        return res.status(400).json({ message: "No shift available for today." });
      }

      const schema = z.object({        
        long: z.string(),
        lat: z.string()        
      });  
          

      const userId = req.user.id;            
      const timestamp = moment().tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ssZ');
      // Format the date to YYYY-MM-DD
      const currentDate = new Date() // Adjusting to UTC+7 timezone
      const formattedDate = formatDate(currentDate);

      // Check if the user has already checked in today
      const existingAbsen = await prisma.absensi.findFirst({
        where: {
          user_id: userId,
          absensi_in: {
            gte: new Date(formattedDate + 'T00:00:00Z'),
            lt: new Date(formattedDate + 'T23:59:59Z')
          },
          status: 1 // Assuming 1 means 'checked in'
        }
      });

      const picture = req.file || ''
      if (existingAbsen) {
        // delete the uploaded file if it exists
        if (req.file) {
          const fs = require('fs');
          const path = require("path");
          const filePath = path.join(__dirname, '../../uploads/absen/', picture.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        return res.status(400).json({ message: "Anda sudah melakukan absen masuk hari ini." }); 
      }
      
      const { long, lat } = schema.parse(req.body);
      //check filefilter
      if (!picture || !['image/jpeg', 'image/png'].includes(picture.mimetype)) {
        return res.status(400).json({ message: "Invalid file type. Only JPEG and PNG are allowed." });
      }

      // Create a new absen record
      const newAbsen = await prisma.absensi.create({
        data: {
          user_id: userId,
          absensi_in: timestamp,
          shift_id: checkShift.id,
          long: long,
          lat: lat,          
          picture: `${picture.filename}`,
          status: 1 // Assuming 1 means 'checked in'
        }
      });

      // Log the action
      await saveLog(req.user.id, 'create', 'absensi', newAbsen.id);

      return res.status(201).json({ message: "Check-in successful", data: newAbsen });
    } catch (error) {
      console.error("Error creating absen:", error);
      //delete the uploaded file if it exists      
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  createAbsenOut: async (req, res) => {
    try {
      const userId = req.user.id;
      const timestamp = moment().tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ssZ');
      const currentDate = new Date();
      const formattedDate = formatDate(currentDate);

      // Check if the user has already checked out today
      const existingAbsen = await prisma.absensi.findFirst({
        where: {
          user_id: userId,
          absensi_out: {
            gte: new Date(formattedDate + 'T00:00:00Z'),
            lt: new Date(formattedDate + 'T23:59:59Z')
          },
          status: 2 // Assuming 2 means 'checked out'
        }
      });

      if (existingAbsen) {
        return res.status(400).json({ message: "Anda sudah melakukan absen keluar hari ini." });
      }

      // Update the existing absen record with the check-out time
      const updatedAbsen = await prisma.absensi.updateMany({
        where: {
          user_id: userId,
          absensi_in: {
            gte: new Date(formattedDate + 'T00:00:00Z'),
            lt: new Date(formattedDate + 'T23:59:59Z')
          }
        },
        data: {
          absensi_out: timestamp,
          status: 2 // Assuming 2 means 'checked out'
        }
      });

      if (updatedAbsen.count === 0) {
        return res.status(404).json({ message: "No check-in record found for today." });
      }

      // Log the action
      await saveLog(req.user.id, 'update', 'absensi', updatedAbsen.id);

      return res.status(200).json({ message: "Check-out successful", data: updatedAbsen });
    } catch (error) {
      console.error("Error creating absen out:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  
};
