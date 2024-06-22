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
import user5Image from "../assets/images/users/user5.jpg";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";

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
  teamName,
  setTeamName,
  leaveTeam,
  currentMember,
  setCurrentMember,
  curTeamSkills,
  setCurTeamSkills,
}) => {
  const [editable, setEditable] = useState(false);
  const [personName, setPersonName] = React.useState([]);
  const userId = parseInt(localStorage.getItem("userId"));
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [alertType, setAlertType] = useState("error");

  // console.log(currentMember);

  const handleClose = (event, reason) => {
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
        console.log(personName);
        setCurTeamSkills(personName);
        setErrorMessage("Success!");
        setAlertType("success");
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage(error);
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
              <div style={{ display: "flex", justifyContent: "space-between" }}>
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
                      <Typography variant="h5" gutterBottom>
                        Team Name: {teamName}
                      </Typography>
                    )}
                  </Item>
                  <Item style={{ textAlign: "left" }}>
                    <Typography variant="h6" gutterBottom>
                      Team Id: {teamId}
                    </Typography>
                  </Item>
                </Grid>
                <Grid item xs={4}>
                  <Item style={{ textAlign: "end" }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleLeaveTeam}
                    >
                      Leave
                    </Button>
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
                    <React.Fragment key={member.UserID}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar alt={member.UserName} src={user5Image} />
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
                                User Skills:
                              </Typography>
                              {` ${
                                member.UserSkills
                                  ? member.UserSkills.join(", ")
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
              <Button variant="contained" color="primary" size="large">
                invite new member
              </Button>
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
                <Typography
                  variant="h5"
                  gutterBottom
                  style={{ marginLeft: "12px" }}
                >
                  Team Skills: {curTeamSkills ? curTeamSkills.join(", ") : " "}
                </Typography>
              )}
            </Item>
          </Grid>
        </Grid>
      </Box>
      <MessageAlert
        open={showError}
        alertType={alertType}
        handleClose={handleClose}
        snackbarContent={errorMessage}
      />
    </>
  );
};

export default TeamProfile;
