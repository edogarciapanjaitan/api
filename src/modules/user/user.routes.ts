import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { UserController } from "./user.controller";
import { validateCreateUser, validateUpdateUser } from "./user.validator";

const router = Router();
const userController = new UserController();

// All user routes require ADMIN authentication
router.use(authenticate, authorize("ADMIN"));

router.get(
  "/",
  userController.getUsers.bind(userController)
);

router.post(
  "/",
  validateCreateUser,
  userController.createUser.bind(userController)
);

router.put(
  "/:id",
  validateUpdateUser,
  userController.updateUser.bind(userController)
);

router.delete(
  "/:id",
  userController.deleteUser.bind(userController)
);

export default router;
