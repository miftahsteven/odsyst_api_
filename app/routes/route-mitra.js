const router = require("express").Router();
const mitra = require("../controllers/controller-mitra");
const { authentication } = require("../../config/auth");
const { upload } = require("../helper/upload");
//const { validateFields } = require("../middleware/middleware-mustahiq");

router.post("/update-profile", authentication, mitra.create); 
router.post("/register", authentication, upload.single("proposal") , mitra.createMitraReg); 
router.get("/detail/:id", authentication, mitra.getMitraById); 
router.put("/tarik/:id", authentication, mitra.penarikanMitra); 
// router.post("/transaction", authentication, waqif.createWakafTransactions); 
// router.get("/all", authentication, waqif.getAllDataWakaf); 
// router.get("/detail/:id", authentication, waqif.detailWaqif); 

module.exports = router;
