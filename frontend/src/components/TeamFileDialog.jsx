import React, { useState, useRef, useEffect } from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Input, Avatar } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";

import { apiCall } from "../helper";
import MessageAlert from "../components/MessageAlert";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const TeamFile = ({ open, handleClose, projectId, handleClickOpen }) => {
  const HoverDiv = styled("div")`
    cursor: pointer;
    &:hover {
      color: "red";
    }
  `;

  const [selected, setSelected] = useState("Preference List");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [alertType, setAlertType] = useState("error");
  const [currentTeam, setCurrentTeam] = useState([]);
  const [open2, setOpen2] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamIdShow, setTeamIdShow] = useState("");
  const [teamSkills, setTeamSkills] = useState("");
  const [teamMember, setTeamMember] = useState([]);
  const [preReason, setPreReason] = useState("");
  const userRole = parseInt(localStorage.getItem("role"));

  // const [data, setData] = useState([]);
  // const [filteredData, setFilteredData] = useState([]);
  // const seachRef = useRef();

  // const searchList = () => {
  //   const searchTerm = seachRef.current.input.value.toLowerCase();
  //   if (searchTerm) {
  //     const filtered = data.filter(
  //       (item) =>
  //         (item.userId && item.userId.toString().includes(searchTerm)) ||
  //         (item.userName && item.userName.toLowerCase().includes(searchTerm)) ||
  //         (item.email && item.email.toLowerCase().includes(searchTerm))
  //     );
  //     setFilteredData(filtered);
  //   } else {
  //     setFilteredData(data);
  //   }
  // };

  const getAllAppliedTeams = async () => {
    try {
      const res = await apiCall(
        "GET",
        `v1/project/preferencedBy/team/${projectId}`
      );
      if (res === null) {
        setCurrentTeam([]);
        return;
      }
      if (res.error) {
        setCurrentTeam([]);
      } else {
        // console.log(res);
        setCurrentTeam(res);
      }
    } catch (error) {
      setErrorMessage(error.message || error.toString());
      setAlertType("error");
      setShowError(true);
    }
  };

  const getAllAllocatedTeams = async () => {
    try {
      const res = await apiCall(
        "GET",
        `v1/project/team/allocated/${projectId}`
      );
      if (res === null) {
        setCurrentTeam([]);
        return;
      }
      if (res.error) {
        setCurrentTeam([]);
      } else {
        // console.log(res);
        setCurrentTeam(res);
      }
    } catch (error) {
      setErrorMessage(error.message || error.toString());
      setAlertType("error");
      setShowError(true);
    }
  };

  const handleClick = (name) => {
    setSelected(name);
    if (name === "Preference List") {
      // console.log("Preference List");
      getAllAppliedTeams();
    } else if (name === "Allocated Team") {
      // console.log("Allocated Team");
      getAllAllocatedTeams();
    }
  };

  useEffect(() => {
    setSelected("Preference List");
    getAllAppliedTeams();
  }, [handleClickOpen]);

  const handleClose2 = () => {
    setOpen2(false);
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowError(false);
  };

  const fetchTeamProfile = async (teamId) => {
    try {
      const res = await apiCall(
        "GET",
        `v1/project/${projectId}/preferencedBy/${teamId}/detail`
      );
      if (res === null) {
        return;
      }
      if (res.error) {
        return;
      } else {
        console.log(res);
        setTeamName(res.teamName);
        setTeamIdShow(res.teamIdShow);
        setTeamSkills(res.teamSkills);
        setTeamMember(res.teamMember);
        setPreReason(res.preferenceReason);
      }
    } catch (error) {
      return;
    }
  };

  const handleClickFetchFile = (teamId) => {
    setOpen2(true);
    // console.log("fetch profile", teamId);
    fetchTeamProfile(teamId);
  };

  const handleApproveTeam = async (teamId) => {
    // console.log("approve", teamId);
    const notification = {
      content: `Your team has been allocated the project P${projectId}`,
      to: { teamId: teamId },
    };
    const body = {
      projectId: projectId,
      teamId: teamId,
      notification: notification,
    };
    try {
      const res = await apiCall("PUT", `v1/team/project/allocation`, body);
      // console.log(res);
      if (res === null) {
        return;
      }
      if (res.error) {
        return;
      } else {
        // console.log(res);
        getAllAppliedTeams();
      }
    } catch (error) {
      return;
    }
  };

  const handleRejectTeam = async (teamId) => {
    console.log("reject", teamId);
    const notification = {
      content: `Your team has been rejected by the project P${projectId}`,
      to: { teamId: teamId },
    };
    const body = {
      projectId: projectId,
      teamId: teamId,
      notification: notification,
    };
    try {
      const res = await apiCall("PUT", `v1/team/project/reject`, body);
      // console.log(res);
      if (res === null) {
        return;
      }
      if (res.error) {
        return;
      } else {
        // console.log(res);
        getAllAllocatedTeams();
      }
    } catch (error) {
      return;
    }
  };

  return (
    <>
      <React.Fragment>
        <BootstrapDialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={open}
        >
          <DialogTitle
            sx={{ m: 0, p: 2, textDecoration: "underline" }}
            id="customized-dialog-title"
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <HoverDiv
                onClick={() => handleClick("Preference List")}
                style={{
                  color: selected === "Preference List" ? "blue" : "inherit",
                }}
              >
                Preference List
              </HoverDiv>
              <div style={{ display: "flex" }}>
                <HoverDiv
                  onClick={() => handleClick("Allocated Team")}
                  style={{
                    color: selected === "Allocated Team" ? "blue" : "inherit",
                  }}
                >
                  Allocated Team
                </HoverDiv>
                <div>
                  <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                      left: 4,
                      right: 0,
                      color: (theme) => theme.palette.grey[500],
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              </div>
            </div>
          </DialogTitle>

          <DialogContent dividers>
            <div className="search">
              <Input
                // ref={seachRef}
                size="large"
                placeholder="Search Team"
                prefix={<SearchOutlined />}
                // onChange={searchList}
                style={{ minWidth: "50vw" }}
              />
            </div>
            <List sx={{ width: "100%" }}>
              {currentTeam.length > 0 ? (
                currentTeam.map((team) => {
                  return (
                    <React.Fragment key={team.teamId}>
                      <div style={{ display: "flex", direction: "row" }}>
                        <ListItem
                          alignItems="flex-start"
                          style={{ flex: 7 }}
                          onClick={() => {
                            handleClickFetchFile(team.teamId);
                          }}
                        >
                          <ListItemText
                            primary={`TeamName: ${team.teamName} `}
                            secondary={
                              <React.Fragment>
                                <Typography
                                  sx={{ display: "inline" }}
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  TeamId: {team.teamIdShow} <br />
                                </Typography>
                                <Typography
                                  sx={{ display: "inline" }}
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  No. of TeamMembers: {team.teamMember.length}
                                </Typography>
                                <br />
                                <Typography
                                  sx={{ display: "inline" }}
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  TeamSkills:{" "}
                                  {team.teamSkills
                                    ? team.teamSkills.join(", ")
                                    : " "}{" "}
                                </Typography>
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                        <ListItem style={{ textAlign: "right", flex: 1 }}>
                          {userRole === 4 && selected === "Preference List" ? (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => {
                                handleApproveTeam(team.teamId);
                              }}
                            >
                              Approve
                            </Button>
                          ) : userRole === 3 &&
                            selected === "Allocated Team" ? (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => {
                                handleRejectTeam(team.teamId);
                              }}
                            >
                              Reject
                            </Button>
                          ) : (
                            ""
                          )}
                        </ListItem>
                      </div>
                      <Divider component="li" />
                    </React.Fragment>
                  );
                })
              ) : (
                <Typography
                  variant="h6"
                  gutterBottom
                  // fontWeight={"bold"}
                  textAlign="center"
                >
                  No Teams Found
                </Typography>
              )}
            </List>
          </DialogContent>
        </BootstrapDialog>
      </React.Fragment>

      <div>
        <Dialog open={open2} onClose={handleClose2}>
          <div style={{ display: "flex" }}>
            <DialogTitle style={{ minWidth: "40vw", paddingBottom: 2 }}>
              TeamName: {teamName ? teamName : "N/A"}
            </DialogTitle>
            <IconButton
              aria-label="close"
              onClick={handleClose2}
              sx={{
                left: 4,
                right: 0,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>
          <DialogContent style={{ paddingTop: 0 }}>
            <Typography
              sx={{ display: "inline" }}
              component="span"
              // variant="body"
              color="text.primary"
            >
              TeamId: {teamIdShow}
            </Typography>{" "}
            <br />
            <Typography
              sx={{ display: "inline" }}
              component="span"
              // variant="body"
              color="text.primary"
            >
              TeamSkills: {teamSkills ? teamSkills.join(", ") : "N/A"}
            </Typography>
          </DialogContent>
          <DialogContent dividers>
            <Typography
              sx={{ display: "inline" }}
              component="span"
              // variant="body"
              color="text.primary"
            >
              Team members:
            </Typography>
            <List sx={{ width: "100%" }}>
              {teamMember.map((member, index) => {
                return (
                  <React.Fragment key={member.userId}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar
                          alt={member.userName.charAt(0)}
                          src={
                            member.avatarURL === ""
                              ? (member.avatarURL = member.userName.charAt(0))
                              : member.avatarURL
                          }
                        >
                          {member.userName.charAt(0)}
                          {/* {member.avatarURL === ""
                            ? (member.avatarURL = member.userName.charAt(0))
                            : member.avatarURL} */}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${member.userName} (${member.userEmail})`}
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: "inline" }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              UserId: {member.userId}
                            </Typography>{" "}
                            <br />
                            <Typography
                              sx={{ display: "inline" }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              User Skills:
                            </Typography>
                            {` ${
                              member.userSkills
                                ? member.userSkills.join(", ")
                                : "N/A"
                            }`}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {/* <Divider variant="inset" component="li" /> */}
                  </React.Fragment>
                );
              })}
            </List>
          </DialogContent>
          <DialogContent dividers>
            <Typography
              sx={{ display: "inline" }}
              component="span"
              // variant="body"
              color="text.primary"
            >
              Preference Reason:
            </Typography>{" "}
            <br />
            <Typography
              sx={{ display: "inline" }}
              component="span"
              // variant="body"
              color="text.primary"
            >
              &nbsp;&nbsp;{preReason}
            </Typography>
          </DialogContent>
        </Dialog>
      </div>

      <MessageAlert
        open={showError}
        alertType={alertType}
        handleClose={handleCloseAlert}
        snackbarContent={errorMessage}
      />
    </>
  );
};

export default TeamFile;
