const router = require("express").Router();
const mustahiq = require("../controllers/controller-mustahiq");
const { authentication } = require("../../config/auth");
const { upload } = require("../helper/upload");
const { validateFields } = require("../middleware/middleware-mustahiq");

router.get("/", authentication, mustahiq.details); 
router.get("/proposal/:id", authentication, mustahiq.getProposalById); 
router.get("/details/:id", authentication, mustahiq.getDetailById);
router.post(
  "/create",
  authentication,
  //validateFields,
  upload.fields([
    {
      name: "ktp_file",
      maxCount: 1,
    },
    {
      name: "kk_file",
      maxCount: 1,
    },
  ]),
  mustahiq.create
);

module.exports = router;
