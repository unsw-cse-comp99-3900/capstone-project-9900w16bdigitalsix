import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MessageAlert from "../components/MessageAlert";
import { apiCall } from "../helper";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import InviteModel from "../components/InviteModel";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "transparent",
  boxShadow: "none",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  "Python",
  "Javascript",
  "Java",
  "SQL",
  "Rust",
  "Golang",
  "C++",
  "Machine Learning",
  "Database",
  "Others",
];

const TeamProfile = ({
  teamId,
  teamIdShow,
  teamName,
  course,
  setTeamName,
  leaveTeam,
  currentMember,
  setCurrentMember,
  curTeamSkills,
  setCurTeamSkills,
  isInvite,
  setIsInvite,
}) => {
  // some states
  const [editable, setEditable] = useState(false);
  const [personName, setPersonName] = React.useState([]);
  const userId = parseInt(localStorage.getItem("userId"));
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [alertType, setAlertType] = useState("error");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  const handleLeaveDialogOpen = () => {
    setLeaveDialogOpen(true);
  };

  const handleLeaveDialogClose = () => {
    setLeaveDialogOpen(false);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleMessageClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowError(false);
  };

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  useEffect(() => {
    if (curTeamSkills) {
      setPersonName(curTeamSkills);
    }
  }, [curTeamSkills]);

  const handleLeaveTeam = async () => {
    leaveTeam(userId);
  };

  const handleEditClick = () => {
    setEditable(true);
  };

  // this function is used to save the team details after editing
  const handleSaveClick = async () => {
    setEditable(false);
    try {
      const body = {
        TeamSkills: personName.length > 0 ? personName : [],
        teamName: teamName,
      };
      const res = await apiCall(
        "PUT",
        `v1/team/update/profile/${teamId}`,
        body
      );
      if (res.error) {
        setErrorMessage(res.error);
        setAlertType("error");
        setShowError(true);
      } else {
        setCurTeamSkills(personName);
        setErrorMessage("Success!");
        setAlertType("success");
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage(error.message || error.toString());
      setAlertType("error");
      setShowError(true);
    }
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Grid
          container
          spacing={2}
          direction={"column"}
          justifyContent={"space-around"}
          alignItems={"stretch"}
        >
          <Grid item xs={10}>
            <Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "-60px",
                }}
              >
                <Grid item xs={6}>
                  <Item style={{ textAlign: "left" }}>
                    {editable ? (
                      <TextField
                        required
                        id="outlined-required"
                        label="Team Name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                      />
                    ) : (
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ fontWeight: "bold" }}
                      >
                        Team Name: {teamName}
                      </Typography>
                    )}
                  </Item>
                  <Item style={{ textAlign: "left" }}>
                    <Typography variant="h6" gutterBottom color="grey">
                      Team Id: {teamIdShow} <br />
                    </Typography>{" "}
                    <Typography variant="h6" gutterBottom color="grey">
                      Course: {course}
                    </Typography>{" "}
                  </Item>
                </Grid>
                <Grid item xs={4}>
                  <Item style={{ textAlign: "end" }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleLeaveDialogOpen}
                    >
                      Leave
                    </Button>
                    <Dialog
                      open={leaveDialogOpen}
                      onClose={handleLeaveDialogClose}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">
                        {"Confirm Leave"}
                      </DialogTitle>
                      <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                          Are you sure you want to leave this team?
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleLeaveTeam} color="error">
                          Leave
                        </Button>
                        <Button
                          onClick={handleLeaveDialogClose}
                          color="primary"
                          autoFocus
                        >
                          Cancel
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Item>
                  <Item style={{ textAlign: "end" }}>
                    {editable ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        onClick={handleSaveClick}
                        sx={{}}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        onClick={handleEditClick}
                        sx={{}}
                      >
                        Edit
                      </Button>
                    )}
                  </Item>
                </Grid>
              </div>
            </Item>
          </Grid>
          <Grid item xs={10}>
            <Item sx={{ textAlign: "left" }}>
              <Typography
                variant="h5"
                gutterBottom
                style={{ marginLeft: "12px" }}
                sx={{ fontWeight: "bold" }}
              >
                Team Members:
              </Typography>
            </Item>

            <Item
              style={{
                display: "flex",
                direction: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <List sx={{ width: "100%" }}>
                {currentMember.map((member, index) => {
                  return (
                    <React.Fragment key={member.userId}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar alt={member.userName} src={member.avatarURL}>
                            {member.userName.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${member.userName} (${member.email})`}
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: "inline" }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                UserId: {member.userId} / User Skills:
                              </Typography>
                              {` ${
                                member.userSkills
                                  ? member.userSkills.join(", ")
                                  : " "
                              }`}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  );
                })}
              </List>
            </Item>
          </Grid>
          <Grid item xs={10}>
            <Item>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={showModal}
              >
                invite new member
              </Button>
              <InviteModel
                isModalOpen={isModalOpen}
                handleClose={handleClose}
                isInvite={isInvite}
                setIsInvite={setIsInvite}
              ></InviteModel>
            </Item>
          </Grid>
          <Grid item xs={10}>
            <Item sx={{ textAlign: "left" }}>
              {editable ? (
                <div>
                  <FormControl sx={{ m: 1, width: "100%" }}>
                    <InputLabel id="demo-multiple-checkbox-label">
                      Skills
                    </InputLabel>
                    <Select
                      labelId="demo-multiple-checkbox-label"
                      id="demo-multiple-checkbox"
                      multiple
                      value={personName}
                      onChange={handleChange}
                      input={<OutlinedInput label="Tag" />}
                      renderValue={(selected) => selected.join(", ")}
                      MenuProps={MenuProps}
                    >
                      {names.map((name) => (
                        <MenuItem key={name} value={name}>
                          <Checkbox checked={personName.indexOf(name) > -1} />
                          <ListItemText primary={name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              ) : (
                <>
                  <Typography
                    variant="h5"
                    gutterBottom
                    style={{ marginLeft: "12px" }}
                    sx={{ fontWeight: "bold" }}
                  >
                    Team Skills:
                  </Typography>
                  <Typography
                    variant="h5"
                    gutterBottom
                    style={{ marginLeft: "12px" }}
                  >
                    &nbsp;&nbsp;
                    {curTeamSkills ? curTeamSkills.join(", ") : " "}
                  </Typography>
                </>
              )}
            </Item>
          </Grid>
        </Grid>
      </Box>
      <MessageAlert
        open={showError}
        alertType={alertType}
        handleClose={handleMessageClose}
        snackbarContent={errorMessage}
      />
    </>
  );
};

export default TeamProfile;
