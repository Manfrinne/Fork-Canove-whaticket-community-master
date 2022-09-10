import { Request, Response } from "express";

import ListTicketsByDateService from "../services/TicketServices/ListTicketsByDateService";


export const indexByDate = async (req: Request, res: Response): Promise<Response> => {

  const { tickets } = await ListTicketsByDateService();

  return res.status(200).json({ tickets });
};
