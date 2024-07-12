import React, { useState, useEffect } from "react";
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
  const [searchKey, setSearchKey] = useState("");
  const [isFilter, setIsFilter] = useState(false);
  const userRole = parseInt(localStorage.getItem("role"));

  // this function used to get all teams that prefer a specific project
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
        setCurrentTeam(res);
      }
    } catch (error) {
      setErrorMessage(error.message || error.toString());
      setAlertType("error");
      setShowError(true);
    }
  };

  // this function used to get all teams that have already been allocated to a specific project
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
      getAllAppliedTeams();
    } else if (name === "Allocated Team") {
      getAllAllocatedTeams();
    }
  };

  useEffect(() => {
    setSelected("Preference List");
    setIsFilter(false);
    setSearchKey("");
    getAllAppliedTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // this function is used to fetch a specific team's details
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
    fetchTeamProfile(teamId);
  };

  // this function is used to approve team's preference of a project
  const handleApproveTeam = async (teamId) => {
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
      if (res === null) {
        return;
      }
      if (res.error) {
        return;
      } else {
        getAllAppliedTeams();
      }
    } catch (error) {
      return;
    }
  };

  // this function is used to reject team's preference of a project
  const handleRejectTeam = async (teamId) => {
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
      if (res === null) {
        return;
      }
      if (res.error) {
        return;
      } else {
        getAllAllocatedTeams();
      }
    } catch (error) {
      return;
    }
  };

  // this function is used to search teams that satisfy the search requirements
  const handleSearchTeams = async () => {
    const trimmedSearchKey = searchKey.trim();
    if (trimmedSearchKey === "") {
      return;
    }
    if (!isFilter) {
      const searchList = trimmedSearchKey.split(/, */);
      const trimmedSearcList = searchList
        .map((word) => word.trim())
        .filter((word) => word !== "");
      console.log(trimmedSearcList);
      setIsFilter(true);
      // to do 返回搜索结果
    } else {
      setSearchKey("");
      setIsFilter(false);
      getAllAppliedTeams();
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
            sx={{
              m: 0,
              p: 2,
              textDecoration: "underline",
              minWidth: "48vw",
              display: "flex",
            }}
            id="customized-dialog-title"
          >
            <div style={{ marginRight: "18vw" }}>
              <HoverDiv
                onClick={() => handleClick("Preference List")}
                style={{
                  color: selected === "Preference List" ? "blue" : "inherit",
                }}
              >
                Preference List
              </HoverDiv>
            </div>
            <div
              style={{
                display: "flex",
              }}
            >
              <HoverDiv
                onClick={() => handleClick("Allocated Team")}
                style={{
                  color: selected === "Allocated Team" ? "blue" : "inherit",
                }}
              >
                Allocated Team
              </HoverDiv>
              <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                  left: 8,
                  right: 0,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </div>
          </DialogTitle>

          <DialogContent dividers>
            {/* this is search component used to search teams that satisfy the requirements */}
            {selected === "Preference List" ? (
              <div className="search">
                <Input
                  size="large"
                  placeholder="Search Team (separated by comma)"
                  prefix={<SearchOutlined />}
                  value={searchKey}
                  onChange={(e) => {
                    setSearchKey(e.target.value);
                  }}
                  suffix={
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        handleSearchTeams();
                      }}
                    >
                      {isFilter ? "Clear" : "Filter"}
                    </Button>
                  }
                />
              </div>
            ) : (
              <></>
            )}

            {/* the list component is used to show all teams that prefer or have been allocated a specific project */}
            <List sx={{ width: "100%" }}>
              {currentTeam.length > 0 ? (
                currentTeam.map((team) => {
                  return (
                    <React.Fragment key={team.teamId}>
                      <div style={{ display: "flex", direction: "row" }}>
                        <ListItem
                          alignItems="flex-start"
                          style={{
                            flex: 7,
                            cursor: "pointer",
                          }}
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
                <Typography variant="h6" gutterBottom textAlign="center">
                  No Teams Found
                </Typography>
              )}
            </List>
          </DialogContent>
        </BootstrapDialog>
      </React.Fragment>

      <div>
        {/* this dialog is used to show a specific team's details */}
        <Dialog open={open2} onClose={handleClose2}>
          <div style={{ display: "flex" }}>
            <DialogTitle style={{ minWidth: "36vw", paddingBottom: 2 }}>
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
              color="text.primary"
            >
              TeamId: {teamIdShow}
            </Typography>{" "}
            <br />
            <Typography
              sx={{ display: "inline" }}
              component="span"
              color="text.primary"
            >
              TeamSkills: {teamSkills ? teamSkills.join(", ") : "N/A"}
            </Typography>
          </DialogContent>
          <DialogContent dividers>
            <Typography
              sx={{ display: "inline" }}
              component="span"
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
                  </React.Fragment>
                );
              })}
            </List>
          </DialogContent>
          <DialogContent dividers>
            <Typography
              sx={{ display: "inline" }}
              component="span"
              color="text.primary"
            >
              Preference Reason:
            </Typography>{" "}
            <br />
            <Typography
              sx={{ display: "inline" }}
              component="span"
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