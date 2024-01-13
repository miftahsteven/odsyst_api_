const { prisma } = require("../../prisma/client");
const fs = require("fs");

module.exports = {
  async details(req, res) {
    const userId = req.user_id;

    return res.status(200).json({
      userId,
    });
  },
  async createProposal(req, res) {
    try {
      const userId = req.user_id;
      const program_id = req.body.program_id;
      const proposal_kategori = req.body.proposal_kategori;
      const nama = req.body.nama;
      const alamat_rumah = req.body.alamat_rumah;
      const kode_pos = req.body.kode_pos;
      const status_domisili = req.body.status_domisili;
      const tgl_lahir = req.body.tgl_lahir;
      const tempat_lahir = req.body.tempat_lahir;
      const jenis_kelamin = req.body.jenis_kelamin;
      const status_rumah = req.body.status_rumah;
      const status_pernikahan = req.body.status_pernikahan;
      const jumlah_anak = req.body.jumlah_anak;
      const penghasilan_bulanan = req.body.penghasilan_bulanan;
      const nama_pasangan = req.body.nama_pasangan;
      const pekerjaan = req.body.pekerjaan;
      const pendidikan_terakhir = req.body.pendidikan_terakhir;
      const nama_sekolah_universitas = req.body.nama_sekolah_universitas;
      const fakultas = req.body.fakultas;
      const jurusan = req.body.jurusan;
      const kelas_semester_saat_ini = req.body.kelas_semester_saat_ini;
      const alamat_sekolah_kampus = req.body.alamat_sekolah_kampus;
      const nomor_telp_sekolah_kampus = req.body.nomor_telp_sekolah_kampus;
      const tempat_mengajar = req.body.tempat_mengajar;
      const alamat_mengajar = req.body.alamat_mengajar;
      const sebagai_guru = req.body.sebagai_guru;
      const biaya_pendidikan_bulanan = req.body.biaya_pendidikan_bulanan;
      const jumlah_tanggungan = req.body.jumlah_tanggungan;
      const organisasi_yang_diikuti = req.body.organisasi_yang_diikuti;
      const nama_ayah = req.body.nama_ayah;
      const pekerjaan_ayah = req.body.pekerjaan_ayah;
      const penghasilan_bulanan_ayah = req.body.penghasilan_bulanan_ayah;
      const nama_ibu = req.body.nama_ibu;
      const pekerjaan_ibu = req.body.pekerjaan_ibu;
      const penghasilan_bulanan_ibu = req.body.penghasilan_bulanan_ibu;
      const jenis_bantuan_kesehatan = req.body.jenis_bantuan_kesehatan;
      const bantuan_pihak_lain = req.body.bantuan_pihak_lain;
      const nominal_bantuan = req.body.nominal_bantuan;
      const biaya_hidup_bulanan = req.body.biaya_hidup_bulanan;
      const nama_pemberi_rekomendasi = req.body.nama_pemberi_rekomendasi;
      const alamat_pemberi_rekomendasi = req.body.alamat_pemberi_rekomendasi;
      const no_telp_pemberi_rekomendasi = req.body.no_telp_pemberi_rekomendasi;
      const dana_yang_diajukan = req.body.dana_yang_diajukan;


      //console.log(JSON.stringify(req.body))

      if (!nama) {
        return res.status(400).json({ message: "Nama wajib diisi" });
      } else if (!userId) {
        return res.status(400).json({ message: "User ID wajib diisi" });
      } else if (!program_id) {
        return res.status(400).json({ message: "Program ID wajib diisi" });
      } else if (!proposal_kategori) {
        return res.status(400).json({ message: "Kategori Proposal wajib diisi" });
      } else if (!nama_pemberi_rekomendasi) {
        return res.status(400).json({ message: "Nama Pemberi Rekomendasi wajib diisi" });
      } else if (!alamat_pemberi_rekomendasi) {
        return res.status(400).json({ message: "Alamat Pemberi Rekomendasi wajib diisi" });
      } else if (!no_telp_pemberi_rekomendasi) {
        return res.status(400).json({ message: "Nomor Telepon Pemberi Rekomendasi wajib diisi" });
      }

      const files = {};
      for (let i = 1; i <= 7; i++) {
        const file = req.files[`lampiran${i}`];
        console.log(file)
        if (file) {
          console.log(file?.[0])
          files[`lampiran${i}`] = "uploads/"+ file?.[0].filename;
        }
      }

      const ProposalResult = await prisma.proposal.create({
        data: {
          user: {
            connect: {
              user_id: Number(userId),
            },
          },
          program: {
            connect: {
              program_id: Number(program_id),
            },
          },
          proposal_kategori: Number(proposal_kategori),
          nama,
          alamat_rumah,
          kode_pos,
          status_domisili: Number(status_domisili),
          tgl_lahir,
          tempat_lahir,
          jenis_kelamin: Number(jenis_kelamin),
          status_rumah: Number(status_rumah),
          status_pernikahan: Number(status_pernikahan),
          jumlah_anak: Number(jumlah_anak),
          penghasilan_bulanan: Number(penghasilan_bulanan),
          nama_pasangan,
          pekerjaan,
          pendidikan_terakhir: Number(pendidikan_terakhir),
          nama_sekolah_universitas,
          fakultas,
          jurusan,
          kelas_semester_saat_ini,
          alamat_sekolah_kampus,
          nomor_telp_sekolah_kampus,
          tempat_mengajar,
          alamat_mengajar,
          sebagai_guru,
          biaya_pendidikan_bulanan: Number(biaya_pendidikan_bulanan),
          jumlah_tanggungan: Number(jumlah_tanggungan),
          organisasi_yang_diikuti,
          nama_ayah,
          pekerjaan_ayah,
          penghasilan_bulanan_ayah: Number(penghasilan_bulanan_ayah),
          nama_ibu,
          pekerjaan_ibu,
          penghasilan_bulanan_ibu: Number(penghasilan_bulanan_ibu),
          jenis_bantuan_kesehatan,
          bantuan_pihak_lain,
          nominal_bantuan: Number(nominal_bantuan),
          biaya_hidup_bulanan: Number(biaya_hidup_bulanan),
          dana_yang_diajukan: Number(dana_yang_diajukan),
          nama_pemberi_rekomendasi,
          alamat_pemberi_rekomendasi,
          no_telp_pemberi_rekomendasi,
          ...files,
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: ProposalResult,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  //////////////////
  async updateProposal(req, res) {
    try {
      const id = req.params.id;
      //const userId = req.user_id;
      const {
        program_id,
        user_id,
        proposal_kategori,
        nama,
        alamat_rumah,
        kode_pos,
        status_domisili,
        tgl_lahir,
        tempat_lahir,
        jenis_kelamin,
        status_rumah,
        status_pernikahan,
        jumlah_anak,
        penghasilan_bulanan,
        nama_pasangan,
        pekerjaan,
        pendidikan_terakhir,
        nama_sekolah_universitas,
        fakultas,
        jurusan,
        kelas_semester_saat_ini,
        alamat_sekolah_kampus,
        nomor_telp_sekolah_kampus,
        tempat_mengajar,
        alamat_mengajar,
        sebagai_guru,
        biaya_pendidikan_bulanan,
        jumlah_tanggungan,
        organisasi_yang_diikuti,
        nama_ayah,
        pekerjaan_ayah,
        penghasilan_bulanan_ayah,
        nama_ibu,
        pekerjaan_ibu,
        penghasilan_bulanan_ibu,
        jenis_bantuan_kesehatan,
        bantuan_pihak_lain,
        nominal_bantuan,
        biaya_hidup_bulanan,
        nama_pemberi_rekomendasi,
        alamat_pemberi_rekomendasi,
        no_telp_pemberi_rekomendasi,
        dana_yang_diajukan,
        dana_yang_disetujui,
        dana_approval,
        approved,
        status_bayar
      } = req.body;

      //console.log(JSON.stringify(req.body))

      if (
        !nama ||
        !id ||
        !user_id ||
        !program_id ||
        !proposal_kategori ||
        !nama_pemberi_rekomendasi ||
        !alamat_pemberi_rekomendasi ||
        !no_telp_pemberi_rekomendasi
      ) {
        return res.status(400).json({
          message:
            "Nama, dan Program Id, Kategori Proposal, nama alamat dan nomor telepon pemberi rekomendasi wajib diisi",
        });
      }

      const ProposalResult = await prisma.proposal.update({
        where: {
          id: Number(id),
        },
        data: {
          proposal_kategori: Number(proposal_kategori),
          nama,
          alamat_rumah,
          kode_pos,
          status_domisili: Number(status_domisili),
          tgl_lahir,
          tempat_lahir,
          jenis_kelamin: Number(jenis_kelamin),
          status_rumah: Number(status_rumah),
          status_pernikahan: Number(status_pernikahan),
          jumlah_anak: Number(jumlah_anak),
          penghasilan_bulanan: Number(penghasilan_bulanan),
          nama_pasangan,
          pekerjaan,
          pendidikan_terakhir: Number(pendidikan_terakhir),
          nama_sekolah_universitas,
          fakultas,
          jurusan,
          kelas_semester_saat_ini,
          alamat_sekolah_kampus,
          nomor_telp_sekolah_kampus,
          tempat_mengajar,
          alamat_mengajar,
          sebagai_guru,
          biaya_pendidikan_bulanan: Number(biaya_pendidikan_bulanan),
          jumlah_tanggungan: Number(jumlah_tanggungan),
          organisasi_yang_diikuti,
          nama_ayah,
          pekerjaan_ayah,
          penghasilan_bulanan_ayah: Number(penghasilan_bulanan_ayah),
          nama_ibu,
          pekerjaan_ibu,
          penghasilan_bulanan_ibu: Number(penghasilan_bulanan_ibu),
          jenis_bantuan_kesehatan,
          bantuan_pihak_lain,
          nominal_bantuan: Number(nominal_bantuan),
          biaya_hidup_bulanan: Number(biaya_hidup_bulanan),
          dana_yang_diajukan: Number(dana_yang_diajukan),
          nama_pemberi_rekomendasi,
          alamat_pemberi_rekomendasi,
          no_telp_pemberi_rekomendasi,
          dana_yang_disetujui: dana_yang_disetujui ? Number(dana_yang_disetujui) : undefined,
          dana_approval: dana_approval ? Number(dana_approval) : undefined,
          approved: approved ? Number(approved) : undefined,
          status_bayar
        },
      });

      return res.status(200).json({
        message: "Sukses Update Proposal",
        data: ProposalResult,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  async approvalProposal(req, res) {
    try {
      const userId = req.user_id;

      const { proposal_id, status, amount } = req.body;

      //console.log(JSON.stringify(req.body))

      const appResult = await prisma.proposal_approval.create({
        data: {
          proposal: {
            connect: {
              id: Number(proposal_id),
            },
          },
          user: {
            connect: {
              user_id: Number(userId),
            },
          },
          status,
          amount: Number(amount),
        },
      });

      return res.status(200).json({
        message: "Approva",
        data: appResult,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  async getAllProposal(req, res) {
    try {
      const page = Number(req.query.page || 1);
      const perPage = Number(req.query.perPage || 10);
      const status = Number(req.query.status || 4);
      const skip = (page - 1) * perPage;
      const keyword = req.query.nama || "";
      const user_type = req.query.user_type || "";
      const category = req.query.category || "";
      const sortBy = req.query.sortBy || "create_date";
      const sortType = req.query.order || "desc";

      const params = {
        nama: {
          contains: keyword,
        },
        status_bayar: 0,
      };

      const [count, proposals] = await prisma.$transaction([
        prisma.proposal.count({
          where: params,
        }),
        prisma.proposal.findMany({
          include: {
            user: {
              select: {
                mustahiq: true,
                user_id: true,
                user_nama: true,
                username: true,
                user_phone: true,
              },              
            },
            //program:true,
            program: {
              select:{  
                pogram_target_amount: false,
                kategori_penyaluran: true
              },
              // include: {
               
              // }
            },
            proposal_approval: {
              include: {
                user: {
                  select: {
                    user_id: true,
                    user_nama: true,
                    username: true,
                    user_phone: true,
                    user_type: true
                  },
                },
              },
            },
          },
          orderBy: {
            [sortBy]: sortType,
          },
          where: params,
          skip,
          take: perPage,
        }),
      ]);
      // item.program_target_amount = undefined
      const propResult = await Promise.all(
        proposals.map(async (item) => {
          //item.program_target_amount = undefined
          return {
            ...item,
            pogram_target_amount: Number(item.program_target_amount),            
            //total_donation: total_donation._sum.amount || 0,
          };
        })
      );

      res.status(200).json({
        // aggregate,
        message: "Sukses Ambil Data",

        data: propResult,
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

  async getAllProposalBayar(req, res) {
    try {
      const page = Number(req.query.page || 1);
      const perPage = Number(req.query.perPage || 10);
      const status = Number(req.query.status || 4);
      const skip = (page - 1) * perPage;
      const keyword = req.query.nama || "";
      const user_type = req.query.user_type || "";
      const category = req.query.category || "";
      const sortBy = req.query.sortBy || "create_date";
      const sortType = req.query.order || "desc";

      const params = {
        nama: {
          contains: keyword,
        },
        status_bayar: 1,
        //approved: 1,
      };

      // const sum = await prisma.proposal.groupBy({
      //   by: ['dana_approval'],        
      //   where: params,
      // });

      const [count,summarize,proposals] = await prisma.$transaction([
        prisma.proposal.count({
          where: params,
        }),
        prisma.proposal.groupBy({
          by: ['dana_approval'],
          _sum: {
            dana_approval: true,
          },
          where: params,
        }),
        prisma.proposal.findMany({
          include: {
            user: {
              select: {
                mustahiq: true,
                user_id: true,
                user_nama: true,
                username: true,
                user_phone: true,
              },              
            },
            //program:true,
            program: {
              select:{  
                pogram_target_amount: false,
                kategori_penyaluran: true
              },
              // include: {
               
              // }
            },
            proposal_approval: {
              include: {
                user: {
                  select: {
                    user_id: true,
                    user_nama: true,
                    username: true,
                    user_phone: true,
                    user_type: true
                  },
                },
              },
            },
          },
          orderBy: {
            [sortBy]: sortType,
          },
          where: params,
          skip,
          take: perPage,
        }),
      ]);
      // item.program_target_amount = undefined
      const propResult = await Promise.all(
        proposals.map(async (item) => {
          //item.program_target_amount = undefined
          return {
            ...item,
            pogram_target_amount: Number(item.program_target_amount),            
            //total_donation: total_donation._sum.amount || 0,
          };
        })
      );

      var summarizes =  summarize.length > 0 ? 
            summarize.map(summarize => summarize.dana_approval).reduce((acc, amount) => acc + amount):0

      res.status(200).json({
        // aggregate,
        message: "Sukses Ambil Data",
        summarize: summarizes,
        data: propResult,
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

  async detailProposal(req, res) {
    try {
      const id = req.params.id;

      const proposal = await prisma.proposal.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          user: true,
          program: true,
        },
      });

      if (!proposal) {
        return res.status(404).json({
          message: "Proposal tidak ditemukan",
        });
      }

      //const omit = require("lodash/omit");

      //const cleanUser = omit(user, ["user_password", "user_token"]);

      return res.status(200).json({
        message: "Sukses",
        data: proposal,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async kategoriPenyaluran(req, res) {
    try {
      //const id = req.params.id;

      const proposal = await prisma.kategori_penyaluran.findMany({
        include: {
          asnaf_type: true
        },
      });

      if (!proposal) {
        return res.status(404).json({
          message: "Proposal tidak ditemukan",
        });
      }


      return res.status(200).json({
        message: "Sukses",
        data: proposal,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async updateKategoriPenyaluran(req, res) {
    try {
      const id = req.params.id;

      const {
        kategori_penyaluran
      } = req.body;

      //console.log(JSON.stringify(req.body))

      const glResult = await prisma.proposal.update({
        where: {
          id: Number(id),
        },
        data: {
          kategori_penyaluran_id: Number(kategori_penyaluran)
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: glResult,
      });
    } catch (error) {

      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  async uploadlampiran(req, res) {
    try {
      const id = req.params.id;

      const {
        kategori_penyaluran
      } = req.body;

      //console.log(JSON.stringify(req.body))

      const glResult = await prisma.proposal.update({
        where: {
          id: Number(id),
        },
        data: {
          kategori_penyaluran_id: Number(kategori_penyaluran)
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: glResult,
      });
    } catch (error) {

      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
};
