const router = require("express").Router();
const { emp, user } = require("../controllers");
const multer = require("multer");
//const upload = multer({ dest: './uploads/reports/' })
const { authentication, authorization } = require("../../config/auth");

// GET localhost:8080/home => Ambil data semua dari awal
router.post("/update", authentication, emp.updateEmployee);
router.post("/register", authentication, user.registerUser);
router.post("/detail/:id", authentication, user.getDataTypeUser);

router.get("/all-activity/:id", authentication, user.getAllActivity);
router.get("/all-contract", authentication, emp.getAllContracts);
router.post("/create-contract", authentication, emp.createContract);
router.put("/update-contract/:id", authentication, emp.updateContract);
router.delete("/delete-contract", authentication, emp.deleteContract);
router.put("/update-status/:id", authentication, emp.updateStatusContract);
router.get("/all-select-contract", authentication, emp.getContractForSelect);
router.put("/promote-user/:id", authentication, emp.createPromote);

router.get("/all-employee", authentication, emp.getAllEmployee);
module.exports = router;
