import Ticket from "../../models/Ticket";

interface Response {
  tickets: Ticket[];
}

const ListTicketsByDateService = async (): Promise<Response> => {

  const tickets = await Ticket.findAll({
    order: [["updatedAt", "DESC"]]
  });

  return {
    tickets
  };
};

export default ListTicketsByDateService;
