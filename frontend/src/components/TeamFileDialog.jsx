import React, { useState, useRef } from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Input, Modal, Avatar } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { minWidth } from "@mui/system";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const TeamFile = ({ open, handleClose }) => {
  const HoverDiv = styled("div")`
    cursor: pointer;
    &:hover {
      color: "red";
    }
  `;

  const [selected, setSelected] = useState("Preference List");

  const handleClick = (name) => {
    setSelected(name);
  };

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const seachRef = useRef();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const searchList = () => {
    const searchTerm = seachRef.current.input.value.toLowerCase();
    if (searchTerm) {
      const filtered = data.filter(
        (item) =>
          (item.userId && item.userId.toString().includes(searchTerm)) ||
          (item.userName && item.userName.toLowerCase().includes(searchTerm)) ||
          (item.email && item.email.toLowerCase().includes(searchTerm))
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const currentTeam = [
    { teamId: 1, teamName: "goodTeam", teamSkills: ["python", "javascript"] },
  ];

  return (
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
              ref={seachRef}
              size="large"
              placeholder="Search Team"
              prefix={<SearchOutlined />}
              onChange={searchList}
              style={{ minWidth: "50vw" }}
            />
          </div>
          <List sx={{ width: "100%" }}>
            {currentTeam.map((team) => {
              return (
                <React.Fragment key={team.teamId}>
                  <div style={{ display: "flex", direction: "row" }}>
                    <ListItem alignItems="flex-start" style={{ flex: 7 }}>
                      <ListItemText
                        primary={`${team.teamName} `}
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: "inline" }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              UserId: {team.teamId} / User Skills:
                            </Typography>
                            {` ${
                              team.teamSkills ? team.teamSkills.join(", ") : " "
                            }`}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <ListItem style={{ textAlign: "right", flex: 1 }}>
                      <Button size="small" variant="contained">
                        Approve
                      </Button>
                    </ListItem>
                  </div>
                  <Divider component="li" />
                </React.Fragment>
              );
            })}
          </List>
        </DialogContent>
      </BootstrapDialog>
    </React.Fragment>
  );
};

export default TeamFile;
