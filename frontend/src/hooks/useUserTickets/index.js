import { useState, useEffect } from "react";
import { getHoursCloseTicketsAuto } from "../../config";
import toastError from "../../errors/toastError";

import { useParams } from "react-router-dom";

import api from "../../services/api";

const useSpyTicketsByUser = ({
  searchParam,
  pageNumber,
  status,
  date,
  showAll,
  queueIds,
  withUnreadMessages,
}) => {
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [count, setCount] = useState(0);

  const { spiedUserId } = useParams();

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTickets = async () => {
        try {
          const { data } = await api.get(`/spyUser/${spiedUserId}`, {
            params: {
              searchParam,
              pageNumber,
              status,
              date,
              showAll,
              queueIds,
              withUnreadMessages,
            },
          });
          setTickets(data.tickets);

          let horasFecharAutomaticamente = getHoursCloseTicketsAuto();

          if (
            status === "open" &&
            horasFecharAutomaticamente &&
            horasFecharAutomaticamente !== "" &&
            horasFecharAutomaticamente !== "0" &&
            Number(horasFecharAutomaticamente) > 0
          ) {
            let dataLimite = new Date();
            dataLimite.setHours(
              dataLimite.getHours() - Number(horasFecharAutomaticamente)
            );

            data.tickets.forEach((ticket) => {
              if (ticket.status !== "closed") {
                let dataUltimaInteracaoChamado = new Date(ticket.updatedAt);
                if (dataUltimaInteracaoChamado < dataLimite)
                  closeTicket(ticket);
              }
            });
          }

          setHasMore(data.hasMore);
          setCount(data.count);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };

      const closeTicket = async (ticket) => {
        await api.put(`/spyTickets/${ticket.id}`, {
          status: "closed",
          userId: ticket.userId || null,
        });
      };

      fetchTickets();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    queueIds,
    withUnreadMessages,
  ]);

  return { tickets, loading, hasMore, count };
};

export default useSpyTicketsByUser;
