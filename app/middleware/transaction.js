const { z } = require("zod");
const { prisma } = require("../../prisma/client");

const validateTransaction = async (req, res, next) => {
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

    const schema = z.object({
      program_id: z.string().min(1),
      amount: z.string().min(1),
      payment_method: z.string().min(1),
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

const validateTransactionForNoLogin = async (req, res, next) => {
  try {
    const userId = 1;

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

    const schema = z.object({
      program_id: z.string().min(1),
      amount: z.string().min(1),
      payment_method: z.string().min(1),
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
  validateTransaction,
  validateTransactionForNoLogin
};
