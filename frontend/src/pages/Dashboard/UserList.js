import React, { useContext } from "react";

import { isWithinInterval, parseISO } from "date-fns";

import TableCell from "@material-ui/core/TableCell";
import IconButton from "@material-ui/core/IconButton";
import RemoveRedEyeIcon from "@material-ui/icons/RemoveRedEye";

import { useHistory } from "react-router-dom";

import useTickets from "../../hooks/useTickets";

import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

import { Can } from "../../components/Can";

const UserList = (props) => {
  const { selectedStartDate, selectedEndDate, user } = props;

  const { user: loggedUser } = useContext(AuthContext);
  const history = useHistory();

  const handleSpyUserService = async (spiedUserId) => {
    try {
      await api.get(`/spyUser/${spiedUserId}`);
    } catch (err) {
      toastError(err);
    }

    history.push(`/spyUser/${spiedUserId}`);
  };

  const GetTicketsByUser = (status, showAll, withUnreadMessages) => {
    var userQueueIds = [];

    if (user.queues && user.queues.length > 0) {
      userQueueIds = user.queues.map((q) => q.id);
    }

    const { tickets } = useTickets({
      status: status,
      showAll: showAll,
      withUnreadMessages: withUnreadMessages,
      queueIds: JSON.stringify(userQueueIds),
    });

    const ticketsByUser = tickets.filter((t) => t.userId === user.id);

    // eslint-disable-next-line
    const ticketsFilteredByDateRange = ticketsByUser.filter((ticket) => {
      const ticketInsideDateRange = isWithinInterval(
        parseISO(ticket.createdAt),
        {
          start: selectedStartDate,
          end: selectedEndDate,
        }
      );

      if (ticketInsideDateRange) return ticket;
    });

    return ticketsFilteredByDateRange.length;
  };

  return (
    <>
      <TableCell align="center">{user.name}</TableCell>
      <TableCell align="center">
        {GetTicketsByUser("open", "true", "false")}
      </TableCell>
      <TableCell align="center">
        {GetTicketsByUser("pending", "true", "false")}
      </TableCell>
      <TableCell align="center">
        {GetTicketsByUser("closed", "true", "false")}
      </TableCell>
      <TableCell align="center">
        <Can
          role={loggedUser.profile}
          perform="spy-tickets-service:view"
          yes={() => (
            <IconButton
              size="small"
              onClick={() => handleSpyUserService(user.id)}
            >
              <RemoveRedEyeIcon />
            </IconButton>
          )}
        />
      </TableCell>
    </>
  );
};

export default UserList;
