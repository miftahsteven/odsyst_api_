const { generate } = require("../helper/auth-jwt");
const { prisma } = require("../../prisma/client");
const { z } = require("zod");

module.exports = {
  async getRole(req, res) {
    try {
      const userId = req.user_id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "id";

      const roles = await prisma.user_type.findMany({
          select: {
              id: true,
              type_name: true
          },
          orderBy: {
            [sortBy]: sortType,
          },
      });

      const roleResult = await Promise.all(
        roles.map(async (item) => {
            return {
                id: item.id,
                name: item.type_name
            }
        })
      )

      return res.status(200).json({
        message: "Sukses",
        data: roleResult,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async createRole(req, res) {
    try {
      const userId = req.user_id;
      
      const { type_name } = req.body;

      if (!type_name) {
        return res.status(400).json({
          message: "Nama Tidak Boleh Kosong",
        });
      }

      const dataBaru = await prisma.user_type.create({
        data: {
          type_name
        },
      });

      res.status(200).json({
        message: "Sukses Membuat Role Baru",
        data: dataBaru
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async updateRole(req, res) {
    try {
      const userId = req.user_id;
      
      const { id, type_name } = req.body;

      if (!type_name) {
        return res.status(400).json({
          message: "Nama Tidak Boleh Kosong",
        });
      }

      const dataUpdate = await prisma.user_type.update({
        data: {
          type_name
        },
        where: {
          id: Number(id)
        }
      });

      res.status(200).json({
        message: "Sukses Update Role",
        data: dataUpdate
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
};
