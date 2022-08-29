import express from "express";
import isAuth from "../middleware/isAuth";

import * as SpyController from "../controllers/SpyController";

const spyRoutes = express.Router();

spyRoutes.get("/spy", isAuth, SpyController.index);

spyRoutes.get("/spy/:ticketId", isAuth, SpyController.show);

spyRoutes.get("/spyMessages/:ticketId", isAuth, SpyController.messages)

export default spyRoutes;