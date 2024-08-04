import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Input } from "antd";
import "../assets/scss/FullLayout.css";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { apiCall } from "../helper";
import MessageAlert from "../components/MessageAlert";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "transparent",
  boxShadow: "none",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

// this component is the select component used to select all available projects
const SelectProjectModal = ({ value, onChange, index, allProjects }) => {
  const isValidValue = allProjects.some((proj) => proj.projectId === value);
  return (
    <FormControl
      sx={{ m: 1, minWidth: "20vw", textAlign: "left" }}
      size="small"
    >
      <InputLabel>Project</InputLabel>
      <Select
        value={isValidValue ? value : ""}
        label="Project"
        onChange={(event) => onChange(event, index)}
        sx={{
          maxWidth: "20vw",
          ".MuiSelect-select": {
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: "10vw",
          },
        }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {allProjects && allProjects.length > 0 ? (
          allProjects.map((proj) => (
            <MenuItem key={proj.projectId} value={proj.projectId}>
              <Typography
                sx={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: "10vw",
                }}
              >
                P{proj.projectId} &nbsp;&nbsp;{proj.title}
              </Typography>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No Projects Available</MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

// this component is the input area used to fill in the preference reason
const ReasonField = ({ value, onChange, index }) => {
  return (
    <Input.TextArea
      placeholder="Reason"
      autoSize={{ minRows: 3, maxRows: 4 }}
      onChange={(event) => onChange(event, index)}
      value={value}
      onMouseOver={(e) => {
        e.target.style.borderColor = "black";
      }}
      onMouseOut={(e) => {
        e.target.style.borderColor = "#CBCBCB";
      }}
    />
  );
};

const StudentTeamPreference = () => {
  // some states
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [alertType, setAlertType] = useState("error");

  const [rows, setRows] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const navigate = useNavigate();

  const userId = parseInt(localStorage.getItem("userId"));

  // this function used to fetch all projects that are public
  const getAllPublicProjects = async () => {
    try {
      const res = await apiCall("GET", "v1/project/get/public_project/list");
      if (res === null) {
        return;
      }
      if (res.error) {
        return;
      } else {
        setAllProjects(res);
      }
    } catch (error) {
      setErrorMessage(error.message || error.toString());
      setAlertType("error");
      setShowError(true);
    }
  };

  // this function used to fetch a specific team's preference list
  const getTeamPreference = async () => {
    try {
      const res = await apiCall("GET", `v1/team/get/preferences/${userId}`);
      if (res === null) {
        setRows([{ preNum: 1, projectId: "", reason: "" }]);
        return;
      }
      if (res.error) {
        return;
      } else {
        if (res && res.length > 0) {
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
      }
    } catch (error) {
      setErrorMessage(error.message || error.toString());
      setAlertType("error");
      setShowError(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAllPublicProjects();
        await getTeamPreference();
      } catch (error) {
        setErrorMessage(error.message || error.toString());
        setAlertType("error");
        setShowError(true);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // used to process select project
  const handleSelectProjectChange = (event, index) => {
    const newRows = [...rows];
    newRows[index].projectId = event.target.value;
    setRows(newRows);
  };

  // used to process the reason textfield change
  const handleReasonFieldChange = (event, index) => {
    const newRows = [...rows];
    newRows[index].reason = event.target.value;
    setRows(newRows);
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowError(false);
  };

  // used to add one more preference
  const addOneMore = () => {
    setRows([...rows, { preNum: rows.length + 1, projectId: "", reason: "" }]);
  };

  // used to delete a preference
  const deleteOneRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    const updatedRows = newRows.map((row, idx) => ({
      ...row,
      preNum: idx + 1,
    }));
    setRows(updatedRows);
  };

  // used to submit the preference list
  const submitPreference = async () => {
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
    try {
      const res = await apiCall(
        "PUT",
        `v1/team/preference/project/${userId}`,
        body
      );
      if (
        res.error ===
        "Team already allocated a project, cannot update preferences"
      ) {
        setErrorMessage(
          "already been allocated a project, cannot update preferences!"
        );
        setAlertType("error");
        setShowError(true);
        return;
      }
      if (res.error) {
        setErrorMessage("Failed to update,check and try again!");
        setAlertType("error");
        setShowError(true);
      } else {
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

  // this function is used to handle back button
  const handleBack = () => {
    navigate("/project/myproject");
  };

  if (rows.length === 0) {
    setRows([{ preNum: 1, projectId: "", reason: "" }]);
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
                  </Item>
                  <Item>
                    {/* the table below is used to record team's preference list */}
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
                        {/* the table body is for teams to select projects and fill in the reanson field */}
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
                      <Button variant="outlined" onClick={handleBack}>
                        ⬅️ Back
                      </Button>
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
