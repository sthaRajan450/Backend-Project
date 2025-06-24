import { Router } from "express";
import { login, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middelwares/multer.middelware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(login);
export default router;
