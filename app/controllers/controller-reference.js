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
      const sortType = req.query.order || "asc";
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
  async getCities(req, res) {
    try {
      const userId = req.user_id;
      //const prov_id = req.params.id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "city_id";

      const cities = await prisma.cities.findMany({
          select: {
              city_id: true,
              city_name: true,
              prov_id: true,              
          },
          // where: {
          //   prov_id: {
          //     equals: parseInt(prov_id),
          //   },
          // },
          orderBy: {
            [sortBy]: sortType,
          },
      });

      return res.status(200).json({
        message: "Sukses",
        data: cities
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async getDistricts(req, res) {
    try {
      const userId = req.user_id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "dis_id";

      const districts = await prisma.districts.findMany({
          select: {
              dis_id: true,
              dis_name: true,
              city_id: true,              
          },
          orderBy: {
            [sortBy]: sortType,
          },
      });

      return res.status(200).json({
        message: "Sukses",
        data: districts
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
              dis_id: true,
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
  
  async getStatusRecruitment(req, res) {
    try {
      const userId = req.user_id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "id";

      const status_recruitment = await prisma.recruitment_status.findMany({
          select: {
              id: true,
              name: true,              
          },
          orderBy: {
            [sortBy]: sortType,
          },
      });

      return res.status(200).json({
        message: "Sukses",
        data: status_recruitment
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  
};
