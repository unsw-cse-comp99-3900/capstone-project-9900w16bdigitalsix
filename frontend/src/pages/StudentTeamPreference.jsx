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

const SelectProjectModal = ({ value, onChange, index, allProjects }) => {
  // if (!allProjects) {
  //   return;
  // }
  const isValidValue = allProjects.some((proj) => proj.projectId === value);
  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel>Project</InputLabel>
      <Select
        // value={value}
        value={isValidValue ? value : ""}
        label="Project"
        onChange={(event) => onChange(event, index)}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {allProjects && allProjects.length > 0 ? (
          allProjects.map((proj) => (
            <MenuItem key={proj.projectId} value={proj.projectId}>
              P{proj.projectId} &nbsp;&nbsp;{proj.title}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No Projects Available</MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

const ReasonField = ({ value, onChange, index }) => {
  return (
    <TextField
      label="Reason"
      multiline
      maxRows={4}
      onChange={(event) => onChange(event, index)}
      value={value}
    />
  );
};

const StudentTeamPreference = () => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [alertType, setAlertType] = useState("error");
  const [open, setOpen] = useState(false);
  // const [preferences, setPreferences] = useState([]);
  const [rows, setRows] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  const userId = parseInt(localStorage.getItem("userId"));

  const getAllPublicProjects = async () => {
    try {
      const res = await apiCall("GET", "v1/project/get/public_project/list");
      if (res.error) {
        setErrorMessage(res.error);
        setAlertType("error");
        setShowError(true);
      } else {
        // console.log(res);
        setAllProjects(res);
      }
    } catch (error) {
      setErrorMessage(error);
      setAlertType("error");
      setShowError(true);
    }
  };

  useEffect(() => {
    const getTeamPreference = async () => {
      try {
        const res = await apiCall("GET", `v1/team/get/preferences/${userId}`);
        if (res.error) {
          setErrorMessage(res.error);
          setAlertType("error");
          setShowError(true);
        } else {
          // console.log(res);
          // setPreferences(res);

          if (res.length > 0) {
            setRows(
              res.map((pre, index) => ({
                preNum: index + 1,
                projectId: pre.projectId,
                reason: pre.reason,
              }))
            );
          } else {
            setRows([{ preNum: 1, projectId: "", reason: "" }]);
          }

          // setRows(
          //   res.map((pre, index) => ({
          //     preNum: index + 1,
          //     projectId: pre.projectId,
          //     reason: pre.reason,
          //   }))
          // );
        }
      } catch (error) {
        setErrorMessage(error.message || error.toString());
        setAlertType("error");
        setShowError(true);
      }
    };
    try {
      getAllPublicProjects();
    } catch (error) {
      setErrorMessage(error.message || error.toString());
      setAlertType("error");
      setShowError(true);
    }
    try {
      getTeamPreference();
    } catch (error) {
      setErrorMessage(error.message || error.toString());
      setAlertType("error");
      setShowError(true);
    }
  }, [userId]);

  const handleSelectProjectChange = (event, index) => {
    const newRows = [...rows];
    newRows[index].projectId = event.target.value;
    setRows(newRows);
  };

  const handleReasonFieldChange = (event, index) => {
    const newRows = [...rows];
    newRows[index].reason = event.target.value;
    setRows(newRows);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowError(false);
  };

  // useEffect(() => {
  //   if (preferences.length > 0) {
  //     setRows(
  //       preferences.map((pre, index) => ({
  //         preNum: index + 1,
  //         projectId: pre.projectId,
  //         reason: pre.reason,
  //       }))
  //     );
  //   } else {
  //     setRows([{ preNum: 1, projectId: "", reason: "" }]);
  //   }
  // }, [preferences]);

  // console.log(preferences);

  const addOneMore = () => {
    setRows([...rows, { preNum: rows.length + 1, projectId: "", reason: "" }]);
  };

  const deleteOneRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    const updatedRows = newRows.map((row, idx) => ({
      ...row,
      preNum: idx + 1,
    }));
    setRows(updatedRows);
  };

  const submitPreference = async () => {
    // console.log(rows);
    const seenProjectIds = new Set();
    for (const preference of rows) {
      if (preference.projectId === "") {
        setErrorMessage(
          "Please select all project fields or delete empty fields"
        );
        setAlertType("error");
        setShowError(true);
        return;
      }
      if (seenProjectIds.has(preference.projectId)) {
        setErrorMessage(
          "Duplicate projectId found. Please ensure do not select duplicate projects."
        );
        setAlertType("error");
        setShowError(true);
        return;
      }
      seenProjectIds.add(preference.projectId);
    }

    const body = rows.map((row) => ({
      projectId: row.projectId,
      reason: row.reason,
    }));
    // console.log(body);
    try {
      const res = await apiCall(
        "PUT",
        `v1/team/preference/project/${userId}`,
        body
      );
      if (res.error) {
        setErrorMessage(res.error);
        setAlertType("error");
        setShowError(true);
      } else {
        // console.log(res);
        setErrorMessage("Success Update Preferences!");
        setAlertType("success");
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage(error.message || error.toString());
      setAlertType("error");
      setShowError(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowError(false);
  };

  if (!rows) {
    return;
  }

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
                          {rows.map((row, index) => (
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
                                <SelectProjectModal
                                  value={row.projectId}
                                  onChange={(event) =>
                                    handleSelectProjectChange(event, index)
                                  }
                                  allProjects={allProjects}
                                />
                              </TableCell>
                              <TableCell
                                align="center"
                                style={{ width: "40%" }}
                              >
                                <ReasonField
                                  value={row.reason}
                                  onChange={(event) =>
                                    handleReasonFieldChange(event, index)
                                  }
                                />
                              </TableCell>
                              <TableCell
                                align="center"
                                style={{ width: "15%" }}
                              >
                                <IconButton
                                  aria-label="delete"
                                  onClick={() => deleteOneRow(index)}
                                >
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
                      <Button
                        variant="contained"
                        endIcon={<SendIcon />}
                        onClick={submitPreference}
                      >
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
