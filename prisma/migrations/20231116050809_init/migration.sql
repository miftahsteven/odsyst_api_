-- CreateTable
CREATE TABLE `banners` (
    `banners_id` INTEGER NOT NULL AUTO_INCREMENT,
    `banners_name` VARCHAR(255) NULL,
    `banners_path` TEXT NULL,
    `banners_program_id` INTEGER NULL,

    PRIMARY KEY (`banners_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `customer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_user_id` INTEGER NOT NULL,
    `customer_no_imkas` VARCHAR(15) NULL,
    `customer_durasi` INTEGER NULL,
    `customer_reminder` SMALLINT NULL,
    `customer_status` SMALLINT NULL DEFAULT 1,

    PRIMARY KEY (`customer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `institusi` (
    `institusi_id` INTEGER NOT NULL AUTO_INCREMENT,
    `institusi_nama` VARCHAR(255) NOT NULL,
    `institusi_user_id` INTEGER NULL,
    `institusi_no_hp` VARCHAR(15) NULL,
    `institusi_status` SMALLINT NULL DEFAULT 1,

    INDEX `institusi_FK`(`institusi_user_id`),
    PRIMARY KEY (`institusi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program` (
    `program_id` INTEGER NOT NULL AUTO_INCREMENT,
    `program_kode` VARCHAR(10) NULL,
    `program_title` VARCHAR(100) NOT NULL,
    `program_short_desc` TEXT NULL,
    `program_start_date` DATETIME(0) NULL,
    `program_end_date` DATETIME(0) NULL,
    `program_description` TEXT NULL,
    `program_institusi_id` INTEGER NULL,
    `program_target_amount` BIGINT NOT NULL,
    `program_create` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `program_status` SMALLINT NULL DEFAULT 1,
    `program_isheadline` SMALLINT NULL DEFAULT 0,
    `program_banner_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `program_category_id` INTEGER NULL,
    `beneficiary_id` INTEGER NULL,

    UNIQUE INDEX `program_program_banner_id_key`(`program_banner_id`),
    INDEX `program_program_institusi_id_fkey`(`program_institusi_id`),
    INDEX `program_user_id_fkey`(`user_id`),
    INDEX `program_beneficiary_id_fkey`(`beneficiary_id`),
    INDEX `program_program_category_id_fkey`(`program_category_id`),
    PRIMARY KEY (`program_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `desc` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `user_password` VARCHAR(255) NOT NULL,
    `user_nama` VARCHAR(100) NULL,
    `user_phone` VARCHAR(100) NULL,
    `user_type` INTEGER NULL DEFAULT 0,
    `user_status` SMALLINT NULL DEFAULT 0,
    `user_token` TEXT NULL,
    `user_reg_date` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `mustahiq_id` INTEGER NULL,

    UNIQUE INDEX `user_UN`(`username`),
    UNIQUE INDEX `user_UN_2`(`user_phone`),
    UNIQUE INDEX `user_mustahiq_id_key`(`mustahiq_id`),
    INDEX `user_user_type_fkey`(`user_type`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `program_id` INTEGER NULL,
    `transaction_id` INTEGER NULL,
    `user_id` INTEGER NOT NULL,

    INDEX `notification_program_id_fkey`(`program_id`),
    INDEX `notification_transaction_id_fkey`(`transaction_id`),
    INDEX `notification_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mustahiq` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `address` TEXT NOT NULL,
    `ktp_url` VARCHAR(255) NOT NULL,
    `kk_url` VARCHAR(255) NOT NULL,
    `emergency_contact_name` VARCHAR(255) NOT NULL,
    `emergency_contact_number` VARCHAR(15) NOT NULL,
    `bank_name` VARCHAR(255) NOT NULL,
    `bank_number` VARCHAR(255) NOT NULL,
    `imkas_number` VARCHAR(255) NULL,
    `bank_account_name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `beneficiary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `address` TEXT NOT NULL,
    `ktp_url` VARCHAR(255) NOT NULL,
    `kk_url` VARCHAR(255) NOT NULL,
    `emergency_contact_name` VARCHAR(255) NOT NULL,
    `emergency_contact_number` VARCHAR(15) NOT NULL,
    `bank_name` VARCHAR(255) NOT NULL,
    `bank_number` VARCHAR(255) NOT NULL,
    `imkas_number` VARCHAR(255) NULL,
    `bank_account_name` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NULL,

    INDEX `beneficiary_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `token` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `password_token_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_type` (
    `user_type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_type_name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`user_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor` (
    `vendor_id` INTEGER NOT NULL AUTO_INCREMENT,
    `vendor_user_id` INTEGER NOT NULL,
    `vendor_address` TEXT NULL,
    `vendor_ktp` VARCHAR(255) NULL,
    `vendor_kk` VARCHAR(255) NULL,
    `vendor_kontak_name` VARCHAR(255) NULL,
    `vendor_kontak_number` VARCHAR(15) NULL,
    `vendor_bank_name` VARCHAR(255) NULL,
    `vendor_bank_number` INTEGER NULL,
    `vendor_bank_id` INTEGER NULL,

    PRIMARY KEY (`vendor_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_table` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `program_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `amount` MEDIUMINT NOT NULL,
    `payment_method` VARCHAR(100) NOT NULL,
    `evidence` TEXT NOT NULL,
    `status` VARCHAR(100) NOT NULL DEFAULT 'pending',

    INDEX `transactions_program_id_fkey`(`program_id`),
    INDEX `transactions_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bank_name` VARCHAR(255) NOT NULL,
    `bank_number` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ebs_staging` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `account_number` INTEGER NOT NULL,
    `trans_ref` VARCHAR(50) NULL,
    `bank_date` VARCHAR(8) NULL,
    `state_num` VARCHAR(25) NULL,
    `currency` VARCHAR(3) NULL,
    `ob_amount` VARCHAR(200) NULL,
    `ob_ind` VARCHAR(50) NULL,
    `eb_amount` VARCHAR(200) NULL,
    `eb_ind` VARCHAR(50) NULL,
    `trans_date` VARCHAR(8) NULL,
    `trans_type` VARCHAR(27) NULL,
    `trans_amount` VARCHAR(27) NULL,
    `trans_id` VARCHAR(27) NULL,
    `text_info` VARCHAR(200) NULL,
    `ebs_info1` VARCHAR(50) NULL,
    `ebs_info2` VARCHAR(50) NULL,
    `ebs_info3` VARCHAR(50) NULL,
    `ebs_filename` VARCHAR(255) NULL,

    INDEX `ebs_staging_account_number_fkey`(`account_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tccode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ccode` VARCHAR(191) NOT NULL,
    `cname` VARCHAR(191) NOT NULL,
    `cncode` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tccode_ccode_key`(`ccode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `athead` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ccode` VARCHAR(191) NOT NULL,
    `fyear` VARCHAR(191) NOT NULL,
    `docnr` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `athead_ccode_fyear_docnr_key`(`ccode`, `fyear`, `docnr`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `atgla` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ccode` VARCHAR(191) NOT NULL,
    `fyear` VARCHAR(191) NOT NULL,
    `docnr` VARCHAR(191) NOT NULL,
    `clrdt` VARCHAR(191) NOT NULL,
    `docit` VARCHAR(191) NOT NULL,
    `posdt` VARCHAR(191) NOT NULL,
    `docdt` VARCHAR(191) NOT NULL,
    `dtype` VARCHAR(191) NOT NULL,

    INDEX `atgla_ccode_fyear_docnr_fkey`(`ccode`, `fyear`, `docnr`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recurring_transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `program_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `amount` INTEGER NULL,
    `payment_method` VARCHAR(100) NULL,
    `recurring_status` SMALLINT NULL DEFAULT 0,
    `recurring_type` SMALLINT NULL DEFAULT 0,
    `reminder_type` SMALLINT NULL DEFAULT 0,

    INDEX `recurring_transaction_program_id_FK`(`program_id`),
    INDEX `recurring_transaction_user_id_FK`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `institusi` ADD CONSTRAINT `institusi_FK` FOREIGN KEY (`institusi_user_id`) REFERENCES `user`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `program` ADD CONSTRAINT `program_beneficiary_id_fkey` FOREIGN KEY (`beneficiary_id`) REFERENCES `beneficiary`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `program` ADD CONSTRAINT `program_program_banner_id_fkey` FOREIGN KEY (`program_banner_id`) REFERENCES `banners`(`banners_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `program` ADD CONSTRAINT `program_program_category_id_fkey` FOREIGN KEY (`program_category_id`) REFERENCES `program_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `program` ADD CONSTRAINT `program_program_institusi_id_fkey` FOREIGN KEY (`program_institusi_id`) REFERENCES `institusi`(`institusi_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `program` ADD CONSTRAINT `program_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_mustahiq_id_fkey` FOREIGN KEY (`mustahiq_id`) REFERENCES `mustahiq`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_user_type_fkey` FOREIGN KEY (`user_type`) REFERENCES `user_type`(`user_type_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `program`(`program_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `beneficiary` ADD CONSTRAINT `beneficiary_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_token` ADD CONSTRAINT `password_token_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `program`(`program_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ebs_staging` ADD CONSTRAINT `ebs_staging_account_number_fkey` FOREIGN KEY (`account_number`) REFERENCES `bank_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `athead` ADD CONSTRAINT `athead_ccode_fkey` FOREIGN KEY (`ccode`) REFERENCES `tccode`(`ccode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atgla` ADD CONSTRAINT `atgla_ccode_fyear_docnr_fkey` FOREIGN KEY (`ccode`, `fyear`, `docnr`) REFERENCES `athead`(`ccode`, `fyear`, `docnr`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_transaction` ADD CONSTRAINT `recurring_transaction_program_id_FK` FOREIGN KEY (`program_id`) REFERENCES `program`(`program_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `recurring_transaction` ADD CONSTRAINT `recurring_transaction_user_id_FK` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
