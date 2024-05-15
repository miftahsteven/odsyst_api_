-- DropForeignKey
ALTER TABLE `ebs_staging` DROP FOREIGN KEY `ebs_staging_account_number_fkey`;

-- DropForeignKey
ALTER TABLE `password_token` DROP FOREIGN KEY `password_token_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `program` DROP FOREIGN KEY `program_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `user_mustahiq_id_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `user_user_type_fkey`;

-- AlterTable
ALTER TABLE `ebs_staging` ADD COLUMN `mt_file_id` INTEGER NULL,
    MODIFY `account_number` VARCHAR(50) NULL,
    MODIFY `bank_date` VARCHAR(50) NULL,
    MODIFY `trans_date` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `mustahiq` ADD COLUMN `kecamatan` VARCHAR(100) NULL,
    ADD COLUMN `kota` VARCHAR(100) NULL,
    ADD COLUMN `province` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `program_category` ADD COLUMN `gl_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `document_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `indicator` VARCHAR(191) NULL,
    `account_type` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `description1` VARCHAR(191) NULL,
    `description2` VARCHAR(191) NULL,
    `description3` VARCHAR(191) NULL,
    `posting_key` VARCHAR(191) NULL,

    INDEX `document_type_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gl_account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gl_account` VARCHAR(191) NULL,
    `gl_name` VARCHAR(191) NULL,
    `gl_type` INTEGER NULL,
    `gl_group` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `coa` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,

    INDEX `gl_account_type_FK`(`gl_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gl_account_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gla_type` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pettycash` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NULL DEFAULT 0,
    `updatetime` DATETIME(0) NULL,
    `user_id` INTEGER NOT NULL,

    INDEX `pettycash_FK`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pettycash_request` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NULL DEFAULT 0,
    `user_id` INTEGER NOT NULL,
    `request_date` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` SMALLINT NULL DEFAULT 0,
    `deskripsi` TEXT NULL,

    INDEX `pettycash_request_FK`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provinces` (
    `prov_id` INTEGER NOT NULL AUTO_INCREMENT,
    `prov_name` VARCHAR(255) NULL,
    `locationid` INTEGER NULL,
    `status` INTEGER NULL DEFAULT 1,
    `province_by_dpt` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`prov_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cities` (
    `city_id` INTEGER NOT NULL AUTO_INCREMENT,
    `city_name` VARCHAR(255) NULL,
    `prov_id` INTEGER NULL,

    INDEX `cities_FK`(`prov_id`),
    PRIMARY KEY (`city_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `districts` (
    `dis_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dis_name` VARCHAR(255) NULL,
    `city_id` INTEGER NULL,
    `ket` VARCHAR(100) NULL,

    INDEX `districts_FK`(`city_id`),
    PRIMARY KEY (`dis_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proposal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `program_id` INTEGER NULL,
    `nama` VARCHAR(100) NULL,
    `tempat_lahir` VARCHAR(100) NULL,
    `tgl_lahir` VARCHAR(15) NULL,
    `jenis_kelamin` SMALLINT NULL DEFAULT 0,
    `alamat_rumah` VARCHAR(255) NULL,
    `kode_pos` VARCHAR(6) NULL,
    `status_rumah` SMALLINT NULL DEFAULT 0,
    `status_pernikahan` SMALLINT NULL DEFAULT 0,
    `jumlah_anak` SMALLINT NULL DEFAULT 0,
    `penghasilan_bulanan` INTEGER NULL,
    `nama_pasangan` VARCHAR(100) NULL,
    `pekerjaan` VARCHAR(100) NULL,
    `pendidikan_terakhir` SMALLINT NULL DEFAULT 0,
    `nama_sekolah_universitas` VARCHAR(100) NULL,
    `fakultas` VARCHAR(100) NULL,
    `jurusan` VARCHAR(100) NULL,
    `tempat_mengajar` VARCHAR(255) NULL,
    `alamat_mengajar` VARCHAR(255) NULL,
    `nomor_telp_sekolah_kampus` VARCHAR(15) NULL,
    `sebagai_guru` VARCHAR(100) NULL,
    `bantuan_pihak_lain` VARCHAR(255) NULL,
    `nominal_bantuan` INTEGER NULL,
    `nama_pemberi_rekomendasi` VARCHAR(100) NULL,
    `alamat_pemberi_rekomendasi` VARCHAR(255) NULL,
    `no_telp_pemberi_rekomendasi` VARCHAR(15) NULL,
    `proposal_kategori` SMALLINT NULL DEFAULT 0,
    `status_domisili` SMALLINT NULL DEFAULT 0,
    `kelas_semester_saat_ini` VARCHAR(100) NULL,
    `alamat_sekolah_kampus` VARCHAR(100) NULL,
    `biaya_pendidikan_bulanan` INTEGER NULL,
    `organisasi_yang_diikuti` VARCHAR(255) NULL,
    `nama_ayah` VARCHAR(100) NULL,
    `pekerjaan_ayah` VARCHAR(100) NULL,
    `penghasilan_bulanan_ayah` INTEGER NULL,
    `nama_ibu` VARCHAR(100) NULL,
    `pekerjaan_ibu` VARCHAR(100) NULL,
    `penghasilan_bulanan_ibu` INTEGER NULL,
    `biaya_hidup_bulanan` INTEGER NULL,
    `jumlah_tanggungan` SMALLINT NULL DEFAULT 0,
    `jenis_bantuan_kesehatan` VARCHAR(255) NULL DEFAULT '0',
    `create_date` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status_approval` SMALLINT NULL DEFAULT 0,
    `tanggal_approval` DATETIME(0) NULL,
    `user_approver_id` INTEGER NULL,
    `status_approval2` SMALLINT NULL DEFAULT 0,
    `tanggal_approval2` DATETIME(0) NULL,
    `status_perintah_bayar` SMALLINT NULL DEFAULT 0,
    `status_approval3` SMALLINT NULL DEFAULT 0,
    `tanggal_approval3` DATETIME(0) NULL,
    `user_approver_id3` INTEGER NULL,
    `status_bayar` SMALLINT NULL DEFAULT 0,
    `dana_yang_diajukan` INTEGER NULL DEFAULT 0,
    `dana_yang_disetujui` INTEGER NULL,
    `user_approver_id2` INTEGER NULL,
    `status_all` SMALLINT NULL DEFAULT 0,

    INDEX `proposal_FK`(`user_id`),
    INDEX `proposal_FK_1`(`program_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mt_file` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(255) NULL,
    `path` TEXT NULL,
    `date` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `bank` INTEGER NULL,
    `no_rekening` VARCHAR(25) NULL,
    `user_id` INTEGER NULL,

    INDEX `mt_file_FK`(`bank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proposal_approval` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proposal_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `date` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` SMALLINT NULL DEFAULT 0,
    `flag` SMALLINT NULL DEFAULT 0,

    INDEX `proposal_approval_FK`(`proposal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ebs_validation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ebs_id` INTEGER NULL,
    `gl_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `tgl_validation` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `ebs_validation_FK`(`gl_id`),
    INDEX `ebs_validation_FK_1`(`user_id`),
    INDEX `ebs_validation_FK_2`(`ebs_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ebs_staging_FK` ON `ebs_staging`(`mt_file_id`);

-- CreateIndex
CREATE INDEX `program_category_gl_FK` ON `program_category`(`gl_id`);

-- AddForeignKey
ALTER TABLE `program_category` ADD CONSTRAINT `program_category_gl_FK` FOREIGN KEY (`gl_id`) REFERENCES `gl_account`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_mustahiq_id_fkey` FOREIGN KEY (`mustahiq_id`) REFERENCES `mustahiq`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_user_type_fkey` FOREIGN KEY (`user_type`) REFERENCES `user_type`(`user_type_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ebs_staging` ADD CONSTRAINT `ebs_staging_FK` FOREIGN KEY (`mt_file_id`) REFERENCES `mt_file`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `document_type` ADD CONSTRAINT `document_type_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gl_account` ADD CONSTRAINT `gl_account_type_FK` FOREIGN KEY (`gl_type`) REFERENCES `gl_account_type`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pettycash` ADD CONSTRAINT `pettycash_FK` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pettycash_request` ADD CONSTRAINT `pettycash_request_FK` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cities` ADD CONSTRAINT `cities_FK` FOREIGN KEY (`prov_id`) REFERENCES `provinces`(`prov_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `districts` ADD CONSTRAINT `districts_FK` FOREIGN KEY (`city_id`) REFERENCES `cities`(`city_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `proposal` ADD CONSTRAINT `proposal_FK` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `proposal` ADD CONSTRAINT `proposal_FK_1` FOREIGN KEY (`program_id`) REFERENCES `program`(`program_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mt_file` ADD CONSTRAINT `mt_file_FK` FOREIGN KEY (`bank`) REFERENCES `bank_account`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `proposal_approval` ADD CONSTRAINT `proposal_approval_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proposal_approval` ADD CONSTRAINT `proposal_approval_FK` FOREIGN KEY (`proposal_id`) REFERENCES `proposal`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ebs_validation` ADD CONSTRAINT `ebs_validation_FK` FOREIGN KEY (`gl_id`) REFERENCES `gl_account`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ebs_validation` ADD CONSTRAINT `ebs_validation_FK_1` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ebs_validation` ADD CONSTRAINT `ebs_validation_FK_2` FOREIGN KEY (`ebs_id`) REFERENCES `ebs_staging`(`id`) ON DELETE SET NULL ON UPDATE SET NULL;
