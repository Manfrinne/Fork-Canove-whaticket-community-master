import React, { useState, useEffect, useReducer, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import UserList from "./UserList";

import { Can } from "../../components/Can";

const reducer = (state, action) => {
  if (action.type === "LOAD_USERS") {
    const users = action.payload;
    const newUsers = [];

    users.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    marginTop: "28px",
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const UsersListDashboard = (props) => {
  const classes = useStyles();

  const { selectedStartDate, selectedEndDate } = props;

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [users, dispatch] = useReducer(reducer, []);

  const { user: loggedUser } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { pageNumber },
          });
          dispatch({ type: "LOAD_USERS", payload: data.users });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [pageNumber]);

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <MainHeader>
                <Typography
                  component="h3"
                  variant="h6"
                  color="primary"
                  paragraph
                >
                  {i18n.t("Listar tickets por usuário")}
                </Typography>
              </MainHeader>
            </TableRow>

            <TableRow>
              <TableCell align="center">{i18n.t("users.table.name")}</TableCell>
              <TableCell align="center">{i18n.t("Em Atendimento")}</TableCell>
              <TableCell align="center">{i18n.t("Aguardando")}</TableCell>
              <TableCell align="center">{i18n.t("Finalizado")}</TableCell>

              <Can
                role={loggedUser.profile}
                perform="spy-tickets-service:view"
                yes={() => (
                  <TableCell align="center">{i18n.t("Espiar")}</TableCell>
                )}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {users.map((user) => (
                <TableRow user={user} key={user.id}>
                  <UserList
                    selectedStartDate={selectedStartDate}
                    selectedEndDate={selectedEndDate}
                    user={user}
                  />
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default UsersListDashboard;
