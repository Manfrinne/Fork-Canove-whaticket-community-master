import express from "express";
import isAuth from "../middleware/isAuth";

import * as SpyController from "../controllers/SpyController";
import * as SpyUserController from "../controllers/SpyUserController";

const spyRoutes = express.Router();

spyRoutes.get("/spy", isAuth, SpyController.index);

spyRoutes.get("/spy/:ticketId", isAuth, SpyController.show);

spyRoutes.get("/spyMessages/:ticketId", isAuth, SpyController.messages)

// Espiar tickets por usuários
spyRoutes.get("/spyUser/:spiedUserId", isAuth, SpyUserController.indexByUser);

spyRoutes.get("/spyUser/:spiedUserId/:spyTicketId", isAuth, SpyUserController.showByUser);

export default spyRoutes;