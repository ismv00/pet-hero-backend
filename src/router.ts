import express from 'express';
import { userController } from './controllers/UserController';
import { registerController } from './controllers/RegisterController';
import { uploads } from './libs/multer';
import { caseController } from './controllers/CaseController';

const router = express.Router();

router.post("/users", userController.create);
router.get("/users", userController.index);

router.post("/users/register", registerController.create);

router.get("/users/cases", caseController.index);
router.post("/users/cases", uploads.array("images", 3), caseController.create);
router.delete("/users/cases/:id",caseController.delete);



export default router;
