import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

import { getHoursCloseTicketsAuto } from "../../config";
import toastError from "../../errors/toastError";

import api from "../../services/api";

const useTickets = ({
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

    // para espiar usuários individualmente
    const { spiedUserId } = useParams();
    const location = useLocation();
    const spyUserPath = location.pathname

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {

          // se estiver na rota de espiar usuário, filtrar tickets
          if (spyUserPath.includes("spyUser")) {
            const fetchUserTickets = async() => {
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
                  })
                  
                  setTickets(data.tickets)

                  let horasFecharAutomaticamente = getHoursCloseTicketsAuto(); 

                  if (status === "open" && horasFecharAutomaticamente && horasFecharAutomaticamente !== "" &&
                      horasFecharAutomaticamente !== "0" && Number(horasFecharAutomaticamente) > 0) {

                      let dataLimite = new Date()
                      dataLimite.setHours(dataLimite.getHours() - Number(horasFecharAutomaticamente))

                      data.tickets.forEach(ticket => {
                          if (ticket.status !== "closed") {
                              let dataUltimaInteracaoChamado = new Date(ticket.updatedAt)
                              if (dataUltimaInteracaoChamado < dataLimite)
                                  closeTicket(ticket)
                          }
                      })
                  }

                  setHasMore(data.hasMore)
                  setCount(data.count)
                  setLoading(false)
              } catch (err) {
                  setLoading(false)
                  toastError(err)
              }
            }

            const closeTicket = async(ticket) => {
              await api.put(`/tickets/${ticket.id}`, {
                  status: "closed",
                  userId: ticket.userId || null,
              })
            }

            return fetchUserTickets()

          } else {
            const fetchTickets = async() => {
              try {
                  const { data } = await api.get("/tickets", {
                      params: {
                          searchParam,
                          pageNumber,
                          status,
                          date,
                          showAll,
                          queueIds,
                          withUnreadMessages,
                      },
                  })
                  
                  setTickets(data.tickets)

                  let horasFecharAutomaticamente = getHoursCloseTicketsAuto(); 

                  if (status === "open" && horasFecharAutomaticamente && horasFecharAutomaticamente !== "" &&
                      horasFecharAutomaticamente !== "0" && Number(horasFecharAutomaticamente) > 0) {

                      let dataLimite = new Date()
                      dataLimite.setHours(dataLimite.getHours() - Number(horasFecharAutomaticamente))

                      data.tickets.forEach(ticket => {
                          if (ticket.status !== "closed") {
                              let dataUltimaInteracaoChamado = new Date(ticket.updatedAt)
                              if (dataUltimaInteracaoChamado < dataLimite)
                                  closeTicket(ticket)
                          }
                      })
                  }

                  setHasMore(data.hasMore)
                  setCount(data.count)
                  setLoading(false)
              } catch (err) {
                  setLoading(false)
                  toastError(err)
              }
            }

            const closeTicket = async(ticket) => {
              await api.put(`/tickets/${ticket.id}`, {
                  status: "closed",
                  userId: ticket.userId || null,
              })
            }

            return fetchTickets()
          }
        }, 500)
        return () => clearTimeout(delayDebounceFn)
        // eslint-disable-next-line
    }, [
        searchParam,
        pageNumber,
        status,
        date,
        showAll,
        queueIds,
        withUnreadMessages,
    ])

    return { tickets, loading, hasMore, count };
};

export default useTickets;