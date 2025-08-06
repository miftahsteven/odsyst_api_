const { prisma } = require("../../prisma/client");

module.exports = {
  async donate(req, res) {
    try {
      const userId = req.user_id;
      const programId = req.body.program_id;
      const payment_method = req.body.payment_method;
      const evidence = req.file;
      const amount = req.body.amount;
      const isrecurring = req.body.isrecurring;
      const recurring_satuan = req.body.recurring_satuan;

      if (!programId) {
        return res.status(400).json({
          message: "Program tidak ditemukan",
        });
      }

      if (!amount) {
        return res.status(400).json({
          message: "Jumlah donasi tidak boleh kosong",
        });
      }

      const program = await prisma.program.findUnique({
        where: {
          program_id: Number(programId),
        },
      });

      if (!program) {
        return res.status(400).json({
          message: "Program tidak ditemukan",
        });
      }

      const trx = await prisma.transactions.create({
        data: {
          amount: Number(amount),
          evidence: "uploads/" + evidence.filename,
          payment_method,
          user: {
            connect: {
              user_id: Number(userId),
            },
          },
          program: {
            connect: {
              program_id: Number(programId),
            },
          },
          isrecurring: Number(isrecurring),
          recurring_value: Number(amount),
          recurring_satuan: Number(recurring_satuan)
        },
      });

      await prisma.notification.create({
        data: {
          user: {
            connect: {
              user_id: Number(userId),
            },
          },
          description: "Transaksi berhasil, silahkan tunggu konfirmasi dari admin",
          title: "Konfirmasi Transaksi Donasi",
          type: "transaction",
          transaction: {
            connect: {
              id: trx.id,
            },
          }          
        },
      });

      res.status(200).json({
        message: "Sukses donasi",
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async donate_nologin(req, res) {
    try {
      const userId = 1;
      const is_nologin = 1;
      const programId = req.body.program_id;
      const payment_method = req.body.payment_method;
      const evidence = req.file;
      const amount = req.body.amount;
      const isrecurring = req.body.isrecurring;
      const recurring_value = req.body.recurring_value;
      const recurring_satuan = req.body.recurring_satuan;
      const nama_muzaki = req.body.nama_muzaki;
      const email_muzaki = req.body.email_muzaki;
      const phone_muzaki = req.body.phone_muzaki;

      if (!programId) {
        return res.status(400).json({
          message: "Program tidak ditemukan",
        });
      }

      if (!amount) {
        return res.status(400).json({
          message: "Jumlah donasi tidak boleh kosong",
        });
      }

      const program = await prisma.program.findUnique({
        where: {
          program_id: Number(programId),
        },
      });

      if (!program) {
        return res.status(400).json({
          message: "Program tidak ditemukan",
        });
      }

      const trx = await prisma.transactions.create({
        data: {
          amount: Number(amount),
          evidence: "uploads/" + evidence.filename,
          payment_method,
          user: {
            connect: {
              user_id: 1,
            },
          },
          program: {
            connect: {
              program_id: Number(programId),
            },
          },
          isrecurring,
          is_nologin,
          recurring_value,
          recurring_satuan,
          nama_muzaki,
          email_muzaki,
          phone_muzaki
        },
      });

      await prisma.notification.create({
        data: {
          user: {
            connect: {
              user_id: Number(userId),
            },
          },
          description: "Transaksi berhasil, Silahkan tunggu konfirmasi dari admin",
          title: "Konfirmasi Transaksi Donasi",
          type: "transaction",
          transaction: {
            connect: {
              id: trx.id,
            },
          }          
        },
      });

      res.status(200).json({
        message: "Sukses donasi",
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async recurring(req, res) {
    try {
      const userId = req.user_id;
      const programId = req.body.program_id;
      const payment_method = req.body.payment_method;      
      const amount = req.body.amount;
      const reminderType = req.body.reminder_type;
      const recurringType = req.body.recurring_type;

      if (!programId) {
        return res.status(400).json({
          message: "Program tidak boleh kosong",
        });
      }

      if (!amount) {
        return res.status(400).json({
          message: "Jumlah donasi tidak boleh kosong",
        });
      }

      const program = await prisma.program.findUnique({
        where: {
          program_id: Number(programId),
        },
      });

      if (!program) {
        return res.status(400).json({
          message: "Program tidak ditemukan",
        });
      }

      const trx = await prisma.recurring_transaction.create({
        data: {
          amount: Number(amount),          
          payment_method,
          reminder_type: Number(reminderType),
          recurring_type: Number(recurringType),
          user: {
            connect: {
              user_id: Number(userId),
            },
          },
          program: {
            connect: {
              program_id: Number(programId),
            },
          },
        },
      });

      await prisma.notification.create({
        data: {
          user: {
            connect: {
              user_id: Number(userId),
            },
          },
          description: "Anda Mengaktifkan Reminder Dan Recurring",
          title: "Konfirmasi Reminder dan Recurring",
          type: "transaction",
          transaction: {
            connect: {
              id: trx.id,
            },
          },
        },
      });

      res.status(200).json({
        message: "Sukses recurring",
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
};
