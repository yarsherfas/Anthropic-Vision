import { Router, type IRouter } from "express";
import healthRouter from "./health";
import charactersRouter from "./characters";
import categoriesRouter from "./categories";
import chatsRouter from "./chats";
import messagesRouter from "./messages";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/characters", charactersRouter);
router.use("/categories", categoriesRouter);
router.use("/chats", chatsRouter);
router.use("/chats/:id/messages", messagesRouter);

export default router;
