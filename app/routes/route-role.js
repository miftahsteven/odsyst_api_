const router = require("express").Router();
const { role, menu } = require("../controllers");
const multer = require("multer");
//const upload = multer({ dest: './uploads/reports/' })
const { authentication, authorization } = require("../../config/auth");

// GET localhost:8080/home => Ambil data semua dari awal
router.get("/all", authentication, role.getRole);
router.post("/tambah", authentication, role.createRole);
router.put("/update", authentication, role.updateRole);

//semua list route untuk menu
router.get("/menus", authentication, menu.getMenu);
router.get("/menu", authentication, menu.getMenuStructure);
router.get("/menuAdmin", authentication, menu.getMenuAdminFinal);
router.get("/role-menus", authentication, menu.getRoleMenu);
router.post("/tambah-role-menu", authentication, menu.createMenuRole);
router.put("/update-role-menu", authentication, menu.updateMenuRole);
router.delete("/delete-role-menu", authentication, menu.removeRoleMenu);

module.exports = router;
