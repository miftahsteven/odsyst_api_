const { z } = require("zod");
const { prisma } = require("../../prisma/client");

const validateFields = async (req, res, next) => {
  try {
    const userId = req.user_id;
    const user = await prisma.user.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    if (user.mustahiq_id !== null) {
      return res.status(400).json({
        message: "User sudah terdaftar sebagai mustahiq",
      });
    }
    const schema = z
      .object({
        is_institusi: z.boolean().optional(),
        institusi_nama: z.string().optional(),
        institusi_no_hp: z.string().optional(),
        address: z
          .string({
            required_error: "Alamat harus diisi",
          })
          .min(1, "Alamat harus diisi"),
        emergency_contact_name: z
          .string({
            required_error: "Nama Kontak Darurat harus diisi",
          })
          .min(1, "Nama Kontak Darurat harus diisi"),
        emergency_contact_number: z
          .string({
            required_error: "Nomor Kontak Darurat harus diisi",
          })
          .min(1, "Nomor Kontak Darurat harus diisi"),
        bank_name: z
          .string({
            required_error: "Nama Bank harus diisi",
          })
          .min(1, "Nama Bank harus diisi"),
        bank_account_name: z
          .string({
            required_error: "Nama Pemilik Rekening harus diisi",
          })
          .min(1, "Nama Pemilik Rekening harus diisi"),
        bank_number: z
          .string({
            required_error: "Nomor Rekening harus diisi",
          })
          .min(1, "Nomor Rekening harus diisi"),
        imkas_number: z.string().optional(),
      })
      .refine((data) => {
        if (data.is_institusi === true) {
          return data.institusi_nama !== undefined && data.institusi_no_hp !== undefined;
        }
        return true;
      });

    const body = await schema.safeParseAsync(req.body);

    let errorObj = {};

    if (body.error) {
      body.error.issues.forEach((issue) => {
        errorObj[issue.path[0]] = issue.message;
      });
      body.error = errorObj;
    }
    if (!body.success) {
      return res.status(400).json({
        message: "Beberapa Field Harus Diisi",
        error: errorObj,
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  validateFields,
};
