import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MessageAlert from "../components/MessageAlert";
import { Container } from "reactstrap";
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
import user4Image from "../assets/images/users/user4.jpg";
import user3Image from "../assets/images/users/user3.jpg";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { width } from "@mui/system";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "transparent",
  boxShadow: "none",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

// const EditableTextField = styled(TextField)(({ theme, $editable }) => ({
//   "& .MuiInputBase-input": {
//     backgroundColor: $editable ? "white" : "transparent",
//     border: $editable ? `1px solid ${theme.palette.divider}` : "none",
//     cursor: $editable ? "text" : "default",
//   },
// }));

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
  "Miriam Wagner",
  "Bradley Wilkerson",
  "Virginia Andrews",
  "Others",
];

const TeamProfile = ({ teamId, teamNameOld, leaveTeam }) => {
  const [editable, setEditable] = useState(false);
  const [teamNameNew, setTeamNameNew] = useState("");
  const [personName, setPersonName] = React.useState([]);
  const userId = parseInt(localStorage.getItem("userId"));

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleLeaveTeam = async () => {
    // const userId = parseInt(localStorage.getItem("userId"));
    leaveTeam(userId);
  };

  const handleEditClick = () => {
    setEditable(true);
  };

  const handleSaveClick = () => {
    setEditable(false);
    // You can add code to save the updated team name here
  };

  return (
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
                      // placeholder="Team Name"
                      value={teamNameNew}
                      onChange={(e) => setTeamNameNew(e.target.value)}
                    />
                  ) : (
                    <Typography variant="h5" gutterBottom>
                      Team Name: {teamNameOld}
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
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar alt="Remy Sharp" src={user5Image} />
                </ListItemAvatar>
                <ListItemText
                  primary="Brunch this weekend?"
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: "inline" }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        Ali Connors
                      </Typography>
                      {" — I'll be in your neighborhood doing errands this…"}
                    </React.Fragment>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar alt="Travis Howard" src={user4Image} />
                </ListItemAvatar>
                <ListItemText
                  primary="Summer BBQ"
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: "inline" }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        to Scott, Alex, Jennifer
                      </Typography>
                      {" — Wish I could come, but I'm out of town this…"}
                    </React.Fragment>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar alt="Cindy Baker" src={user3Image} />
                </ListItemAvatar>
                <ListItemText
                  primary="Oui Oui"
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: "inline" }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        Sandra Adams
                      </Typography>
                      {" — Do you have Paris recommendations? Have you ever…"}
                    </React.Fragment>
                  }
                />
              </ListItem>
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
            <Typography
              variant="h5"
              gutterBottom
              style={{ marginLeft: "12px" }}
            >
              Team Skills:
            </Typography>
          </Item>
          <Item style={{ width: "100%" }}>
            <div>
              <FormControl sx={{ m: 1, width: "80%" }}>
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
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeamProfile;
