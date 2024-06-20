import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { apiCall } from "../helper";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const JoinTeamDialog = ({ open, onClose }) => {
  const [teamId, setTeamId] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // 处理搜索逻辑
    console.log(`Searching for team ID: ${teamId}`);
    setTeamId("");
    // 可以在这里添加搜索队伍的 API 调用
  };

  return (
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
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
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
  );
};

export default JoinTeamDialog;
