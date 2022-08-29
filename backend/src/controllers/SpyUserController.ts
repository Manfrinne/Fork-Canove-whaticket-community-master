import { Request, Response } from "express";

import ListTicketsService from "../services/TicketServices/ListTicketsService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  status: string;
  date: string;
  showAll: string;
  withUnreadMessages: string;
  queueIds: string;
};

export const indexByUser = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    withUnreadMessages
  } = req.query as IndexQuery;

  const userId = req.user.id;
  const { spiedUserId } = req.params;

  let queueIds: number[] = [];

  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified);
  }

  const { tickets, count, hasMore } = await ListTicketsService({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    userId,
    queueIds,
    withUnreadMessages
  });

  const filteredTickets = tickets.filter((t) => t.userId === +spiedUserId);

  return res.status(200).json({ tickets: filteredTickets, count, hasMore });
};

export const showByUser = async (req: Request, res: Response): Promise<Response> => {
  const { spyTicketId } = req.params;

  const contact = await ShowTicketService(spyTicketId);

  return res.status(200).json(contact)
};
