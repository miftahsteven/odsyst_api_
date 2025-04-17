const { generate } = require("../helper/auth-jwt");
const { prisma } = require("../../prisma/client");
const { z } = require("zod");

module.exports = {
  async getDepartement(req, res) {
    try {
      const userId = req.user_id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "id";

      const departments = await prisma.departments.findMany({
          select: {
              id: true,
              dept_name: true,
              divisions: {
                select: {
                  id: true,
                  division_name: true,
                  groups: {
                    select: {
                      id: true,
                      group_name: true,
                    },
                  },
                },
              },
          },
          orderBy: {
            [sortBy]: sortType,
          },
      });      

      return res.status(200).json({
        message: "Sukses",
        data: departments
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async getProvinces(req, res) {
    try {
      const userId = req.user_id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "prov_id";

      const provinces = await prisma.provinces.findMany({
          select: {
              prov_id: true,
              prov_name: true,
          },
          orderBy: {
            [sortBy]: sortType,
          },
      });

      return res.status(200).json({
        message: "Sukses",
        data: provinces
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async getLocations(req, res) {
    try {
      const userId = req.user_id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "subdis_id";

      const locations = await prisma.subdistricts.findMany({
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
                      prov_id: true,  
                    }
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
        data: locations
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  
};
