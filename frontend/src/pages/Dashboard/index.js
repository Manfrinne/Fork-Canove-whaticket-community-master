import React, { useContext, useState } from "react";

import DateFnsUtils from "@date-io/date-fns";
import {
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
  isToday,
} from "date-fns";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

import useTickets from "../../hooks/useTickets";

import { AuthContext } from "../../context/Auth/AuthContext";

import { i18n } from "../../translate/i18n";

import Chart from "./Chart";
import UsersList from "./UsersList";

import { Can } from "../../components/Can";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  customFixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 120,
  },
  customFixedHeightPaperLg: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  },
  customFixedHeightPaperDateTime: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  },
}));

const Dashboard = () => {
  const classes = useStyles();

  const [selectedStartDate, setSelectedStartDate] = useState(
    startOfDay(new Date())
  );

  const [selectedEndDate, setSelectedEndDate] = useState(endOfDay(new Date()));

  const { user } = useContext(AuthContext);
  var userQueueIds = [];

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  const handleDateStartChange = (date) => {
    setSelectedStartDate(date);
  };

  const handleDateEndChange = (date) => {
    setSelectedEndDate(date);
  };

  const GetTickets = (status, showAll, withUnreadMessages) => {
    const { tickets } = useTickets({
      status: status,
      showAll: showAll,
      withUnreadMessages: withUnreadMessages,
      queueIds: JSON.stringify(userQueueIds),
    });

    // instanciar somente tickets do dia
    // eslint-disable-next-line
    const isTodayTicket = tickets.filter((ticket) => {
      const isTodayTicket = isToday(parseISO(ticket.createdAt));
      if (isTodayTicket) return ticket;
    });

    // instanciar somente tickets dentro de um intervalo de datas
    // eslint-disable-next-line
    const ticketsFilteredByDateRange = tickets.filter((ticket) => {
      const ticketInsideDateRange = isWithinInterval(
        parseISO(ticket.createdAt),
        {
          start: selectedStartDate,
          end: selectedEndDate,
        }
      );

      if (ticketInsideDateRange) return ticket;
    });

    return user.profile === "admin"
      ? ticketsFilteredByDateRange.length
      : isTodayTicket.length;
  };

  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Can
            role={user.profile}
            perform="spy-tickets-service:view"
            yes={() => (
              <Grid item xs={12}>
                <Paper className={classes.customFixedHeightPaperDateTime}>
                  {/* Determinar data inicial e final dos tickets exibidos */}
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Grid container justifyContent="space-evenly">
                      <KeyboardDatePicker
                        disableToolbar
                        variant="inline"
                        format="dd/MM/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        label="Data ticket - inicial"
                        value={selectedStartDate}
                        onChange={handleDateStartChange}
                        KeyboardButtonProps={{
                          "aria-label": "change date",
                        }}
                      />
                      <KeyboardDatePicker
                        disableToolbar
                        variant="inline"
                        format="dd/MM/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        label="Data ticket - final"
                        value={selectedEndDate}
                        onChange={handleDateEndChange}
                        KeyboardButtonProps={{
                          "aria-label": "change date",
                        }}
                      />
                    </Grid>
                  </MuiPickersUtilsProvider>
                </Paper>
              </Grid>
            )}
          />
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.inAttendance.title")}
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {GetTickets("open", "true", "false")}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.waiting.title")}
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {GetTickets("pending", "true", "false")}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.closed.title")}
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {GetTickets("closed", "true", "false")}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper}>
              <Chart
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
              />
            </Paper>
          </Grid>
        </Grid>
        <UsersList />
      </Container>
    </div>
  );
};

export default Dashboard;
