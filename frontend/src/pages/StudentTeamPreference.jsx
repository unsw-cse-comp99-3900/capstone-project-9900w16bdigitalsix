import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Container } from "reactstrap";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

import "../assets/scss/FullLayout.css"; //make sure import this
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import TeamFile from "../components/TeamFileDialog";

const Item = styled(Paper)(({ theme }) => ({
  // backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  backgroundColor: "transparent",
  boxShadow: "none",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const StudentTeamPreference = () => {
  const [count, setCount] = useState(1);
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const createData = (preNum, project, reason) => {
    return { preNum, project, reason };
  };

  const rows = [
    createData(1, 159, 6.0),
    createData(2, 237, 9.0),
    createData(3, 262, 16.0),
    createData(4, 305, 3.7),
    createData(5, 305, 3.7),
  ];

  const addOneMore = () => {
    setCount(count + 1);
  };

  return (
    <main>
      <div className="pageWrapper d-lg-flex">
        {/********Sidebar**********/}
        <aside className="sidebarArea shadow" id="sidebarArea">
          <Sidebar />
        </aside>
        {/********Content Area**********/}
        <div className="contentArea">
          <div className="d-lg-none headerMd">
            {/********Header**********/}
            <Header />
          </div>
          <div className="d-none d-lg-block headerLg">
            {/********Header**********/}
            <Header />
          </div>
          {/********Middle Content**********/}
          <Container className="p-4 wrapper" fluid>
            {/* add code here */}
            <Box sx={{ width: "100%" }}>
              <Stack spacing={2}>
                <Item>
                  <Typography
                    variant="h4"
                    gutterBottom
                    fontWeight={"bold"}
                    textAlign="left"
                  >
                    Preference List
                  </Typography>
                  <Typography variant="h5" gutterBottom fontWeight={"bold"}>
                    You must select at least 7 preferences
                  </Typography>
                </Item>
                <Item>
                  <TableContainer component={Paper}>
                    <Table sx={{ width: "100%" }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell align="center" style={{ width: "15%" }}>
                            Preference
                          </TableCell>
                          <TableCell align="center" style={{ width: "30%" }}>
                            Project
                          </TableCell>
                          <TableCell align="center" style={{ width: "40%" }}>
                            Reason
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{ width: "15%" }}
                          ></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow
                            key={row.preNum}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                              height: "12vh",
                            }}
                          >
                            <TableCell
                              component="th"
                              scope="row"
                              align="center"
                              style={{ width: "15%" }}
                            >
                              {row.preNum}
                            </TableCell>
                            <TableCell align="center" style={{ width: "30%" }}>
                              {row.project}
                            </TableCell>
                            <TableCell align="center" style={{ width: "40%" }}>
                              {row.reason}
                            </TableCell>
                            <TableCell align="center" style={{ width: "15%" }}>
                              <IconButton aria-label="delete">
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Item>
                <Item>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ justifyContent: "center" }}
                  >
                    <Button variant="outlined">⬅️ Back</Button>
                    <Button variant="outlined" onClick={addOneMore}>
                      ✚ Add one
                    </Button>
                    <Button variant="contained" endIcon={<SendIcon />}>
                      save
                    </Button>
                    <Button
                      variant="contained"
                      endIcon={<SendIcon />}
                      onClick={handleClickOpen}
                    >
                      teamProfile
                    </Button>
                    <TeamFile open={open} handleClose={handleClose} />
                  </Stack>
                </Item>
              </Stack>
            </Box>
          </Container>
        </div>
      </div>
    </main>
  );
};

export default StudentTeamPreference;
