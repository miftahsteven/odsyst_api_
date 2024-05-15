const router = require("express").Router();
const { pettyCash } = require("../controllers");
const path = require("path");
const { authentication, authorization } = require("../../config/auth");
const { upload } = require("../helper/upload");

// GET localhost:8080/home => Ambil data semua dari awal
router.get("/head", authentication, pettyCash.HeadPettyCash);
router.get("/allrequests", authentication, pettyCash.allPettyCash);
router.put("/topup", authentication, pettyCash.topUpPettyCash);
router.delete("/remove", authentication, pettyCash.deletePettyCashRequest);
router.post("/requesting", authentication, pettyCash.requestPtCash);
router.post("/settlement", authentication, upload.single("settlement"), pettyCash.settlementCreate);

module.exports = router;
