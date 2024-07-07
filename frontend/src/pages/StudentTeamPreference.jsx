import React, { useState, useEffect } from "react";
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
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

import "../assets/scss/FullLayout.css"; //make sure import this
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import TeamFile from "../components/TeamFileDialog";
import { apiCall } from "../helper";
import MessageAlert from "../components/MessageAlert";

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
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [alertType, setAlertType] = useState("error");
  const [count, setCount] = useState(1);
  const [open, setOpen] = useState(false);

  const SelectProject = () => {
    const [project, setProject] = React.useState("");
    const [allProjects, setAllProjects] = useState([]);

    const handleChange = (event) => {
      setProject(event.target.value);
    };

    const getAllPublicProjects = async () => {
      try {
        const res = await apiCall("GET", "v1/project/get/public_project/list");
        if (res.error) {
          setErrorMessage(res.error);
          setAlertType("error");
          setShowError(true);
        } else {
          console.log(res);
          setAllProjects(res);
        }
      } catch (error) {
        setErrorMessage(error);
        setAlertType("error");
        setShowError(true);
      }
    };

    useEffect(() => {
      try {
        getAllPublicProjects();
      } catch (error) {
        setErrorMessage(error);
        setAlertType("error");
        setShowError(true);
      }
    }, []);

    return (
      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
        <InputLabel id="demo-select-small-label">Project</InputLabel>
        <Select
          labelId="demo-select-small-label"
          id="demo-select-small"
          value={project}
          label="Project"
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {allProjects.map((proj) => (
            <MenuItem key={proj.projectId} value={proj.projectId}>
              P{proj.projectId} &nbsp;&nbsp;{proj.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  const ReasonField = () => {
    const [reason, setReason] = useState("");
    const handleChange = (event) => {
      setReason(event.target.value);
    };

    return (
      <TextField
        id="outlined-multiline-flexible"
        label="Reason"
        multiline
        maxRows={4}
        onChange={handleChange}
        value={reason}
      />
    );
  };

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleCloseAlert = () => {
    setOpen(false);
  };

  const createData = (preNum, project, reason) => {
    return { preNum, project, reason };
  };

  const rows = [
    createData(1, <SelectProject />, <ReasonField />),
    createData(2, <SelectProject />, <ReasonField />),
    createData(3, <SelectProject />, <ReasonField />),
    createData(4, <SelectProject />, <ReasonField />),
  ];

  const oneRow = () => {
    return <>1</>;
  };

  const addOneMore = () => {
    setCount(count + 1);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowError(false);
  };

  return (
    <>
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
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
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
                              <TableCell
                                align="center"
                                style={{ width: "30%" }}
                              >
                                {row.project}
                              </TableCell>
                              <TableCell
                                align="center"
                                style={{ width: "40%" }}
                              >
                                {row.reason}
                              </TableCell>
                              <TableCell
                                align="center"
                                style={{ width: "15%" }}
                              >
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
      <MessageAlert
        open={showError}
        alertType={alertType}
        handleClose={handleCloseAlert}
        snackbarContent={errorMessage}
      />
    </>
  );
};

export default StudentTeamPreference;
