"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const user_controller_1 = require("./user.controller");
const user_validator_1 = require("./user.validator");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// All user routes require ADMIN authentication
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"));
router.get("/", userController.getUsers.bind(userController));
router.post("/", user_validator_1.validateCreateUser, userController.createUser.bind(userController));
router.put("/:id", user_validator_1.validateUpdateUser, userController.updateUser.bind(userController));
router.delete("/:id", userController.deleteUser.bind(userController));
exports.default = router;
