import React, { useState, useEffect } from "react";
import { useTheme } from "@material-ui/core/styles";
import {
  BarChart,
  CartesianGrid,
  Bar,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
} from "recharts";
import { startOfHour, parseISO, format, isWithinInterval } from "date-fns";

import { i18n } from "../../translate/i18n";

import Title from "./Title";

import api from "../../services/api";

const ChartAdmin = (props) => {
  const { selectedStartDate, selectedEndDate } = props;

  const theme = useTheme();

  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await api.get("/ticketsByDate");
        const allTickets = data.tickets

        // eslint-disable-next-line
        const ticketsFilteredByDateRange = allTickets.filter((ticket) => {
          const ticketInsideDateRange = isWithinInterval(
            parseISO(ticket.createdAt),
            {
              start: selectedStartDate,
              end: selectedEndDate,
            }
          );

          if (ticketInsideDateRange) return ticket;
        });

        setTickets(ticketsFilteredByDateRange);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTickets();
  }, [selectedStartDate, selectedEndDate]);

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    setChartData(() => {

      let aux = [
        { time: "08:00", amount: 0 },
        { time: "09:00", amount: 0 },
        { time: "10:00", amount: 0 },
        { time: "11:00", amount: 0 },
        { time: "12:00", amount: 0 },
        { time: "13:00", amount: 0 },
        { time: "14:00", amount: 0 },
        { time: "15:00", amount: 0 },
        { time: "16:00", amount: 0 },
        { time: "17:00", amount: 0 },
        { time: "18:00", amount: 0 },
        { time: "19:00", amount: 0 },
      ];

      aux.forEach((a) => {
        tickets.forEach((ticket) => {
            format(startOfHour(parseISO(ticket.createdAt)), "HH:mm") === a.time && a.amount++;
        });
      });

      return aux;
    });
  }, [tickets]);

  return (
    <React.Fragment>
      <Title>
        {`${i18n.t("dashboard.charts.perDay.title")}${tickets.length}`}
        <> Admin Chart </>
      </Title>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          barSize={40}
          width={730}
          height={250}
          margin={{
            top: 16,
            right: 16,
            bottom: 0,
            left: 24,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke={theme.palette.text.secondary} />
          <YAxis
            type="number"
            allowDecimals={false}
            stroke={theme.palette.text.secondary}
          >
            <Label
              angle={270}
              position="left"
              style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
            >
              Tickets
            </Label>
          </YAxis>
          <Bar dataKey="amount" fill={theme.palette.primary.main} />
        </BarChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
};

export default ChartAdmin;
