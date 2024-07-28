import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MessageAlert from "../components/MessageAlert";

const JoinTeamDialog = ({ open, onClose, joinTeam }) => {
  // some states
  const [teamIdShow, setTeamIdShow] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [alertType, setAlertType] = useState("error");
  const userId = parseInt(localStorage.getItem("userId"));

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowError(false);
  };

  // submit to join a team
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (teamIdShow === "") {
      setErrorMessage("please enter a valid teamId");
      setAlertType("error");
      setShowError(true);
    } else {
      joinTeam(userId, teamIdShow);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} style={{ marginLeft: "20%" }}>
        <DialogTitle>Join a Team</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To join a team, please enter the teamId which you want to join, and
            sumbit.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="text"
            label="teamId"
            type="text"
            fullWidth
            variant="standard"
            value={teamIdShow}
            onChange={(e) => setTeamIdShow(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} style={{ color: "grey" }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} style={{ color: "purple" }}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <MessageAlert
        open={showError}
        alertType={alertType}
        handleClose={handleClose}
        snackbarContent={errorMessage}
      />
    </>
  );
};

export default JoinTeamDialog;
