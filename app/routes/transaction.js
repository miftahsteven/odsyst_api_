const router = require("express").Router();

const { donate, recurring, donate_nologin } = require("../controllers/transaction");
const { authentication } = require("../../config/auth");
const { upload } = require("../helper/upload");
const { validateTransaction,validateTransactionForNoLogin } = require("../middleware/transaction");

router.post("/donate", authentication, upload.single("evidence"), validateTransaction, donate);
router.post("/recurring", authentication, recurring);
router.post("/donate-nologin", upload.single("evidence"), validateTransactionForNoLogin, donate_nologin);

module.exports = router;
