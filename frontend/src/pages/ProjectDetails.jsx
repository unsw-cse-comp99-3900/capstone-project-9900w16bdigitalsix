import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Card, CardTitle, CardBody } from "reactstrap";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";

import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import "../assets/scss/FullLayout.css"; //make sure import this
import { apiCall } from "../helper";

const ProjectDetails = () => {
  let { projectId } = useParams();

  // some states
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [field, setField] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [description, setDiscription] = useState("");
  const [specLink, setSpecLink] = useState("");
  const [open, setOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState([]);
  const navigate = useNavigate();

  // this function is used to fetch a specific project detail
  const getProjectDetail = async () => {
    try {
      const res = await apiCall("GET", `v1/project/detail/${projectId}`);
      console.log(res);
      if (res === null) {
        return;
      }
      if (res.error) {
        return;
      } else {
        setTitle(res.title);
        setClientName(res.clientName);
        setClientEmail(res.clientEmail);
        setField(res.field);
        setRequiredSkills(res.requiredSkills);
        setDiscription(res.description);
        setSpecLink(res.specLink);
      }
    } catch (error) {
      return;
    }
  };

  useEffect(() => {
    getProjectDetail();
  }, []);

  // this function used to get all teams that have already been allocated to a specific project
  const getAllAllocatedTeams = async () => {
    const userId = parseInt(localStorage.getItem("userId"));
    const userRole = parseInt(localStorage.getItem("role"));
    try {
      const res = await apiCall(
        "GET",
        `v1/project/team/allocated/${projectId}`
      );
      // console.log(res);
      if (res === null) {
        setCurrentTeam([]);
        return;
      }
      if (res.error) {
        setCurrentTeam([]);
        return;
      }
      if (userRole !== 1) {
        setCurrentTeam(res);
        return;
      }
      if (userRole === 1) {
        setCurrentTeam(
          res.filter((team) => {
            return team.teamMember.some((user) => user.userId === userId);
          })
        );
        return;
      }
    } catch (error) {
      return;
    }
  };

  const handleClick = () => {
    getAllAllocatedTeams();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickTeam = (teamId, teamIdShow, teamName) => {
    const item = {
      projectId: projectId,
      title: title,
      teamId: teamId,
      teamIdShow: teamIdShow,
      teamName: teamName,
    };
    navigate(`/project/progress/${projectId}/${teamId}`, { state: { item } });
  };

  return (
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
            <Card style={{ marginTop: "5%" }}>
              <CardTitle
                tag="h5"
                className="border-bottom p-3 mb-0"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontWeight: "600",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                <div>
                  ProjectName: {title}
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "400",
                      marginTop: "4px",
                    }}
                  >
                    Project Id: {projectId}
                  </div>
                </div>
                <div>
                  <Button variant="contained" onClick={handleClick}>
                    Allocated Teams
                  </Button>
                </div>
              </CardTitle>
              <CardBody
                className="p-4"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                <div style={{ margin: "30px" }}>
                  <h5
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "18px",
                      fontWeight: "600",
                    }}
                  >
                    Client Information
                  </h5>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "400" }}
                  >
                    <strong>Name:</strong> {clientName}
                  </p>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "400" }}
                  >
                    <strong>Email:</strong> {clientEmail}
                  </p>
                </div>
                <div style={{ margin: "30px" }}>
                  <h5
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "18px",
                      fontWeight: "600",
                    }}
                  >
                    Project Details
                  </h5>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "400" }}
                  >
                    <strong>Field:</strong> {field}
                  </p>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "400" }}
                  >
                    <strong>Required Skills:</strong>{" "}
                    {requiredSkills ? requiredSkills.join(", ") : "N/A"}
                  </p>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "16px",
                      textAlign: "justify",
                      fontWeight: "400",
                    }}
                  >
                    <strong>Description:</strong> {description}
                  </p>
                </div>
                <div style={{ margin: "30px", fontSize: "14pt" }}>
                  {specLink ? (
                    <a
                      href={specLink}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Click here to download the project specification
                    </a>
                  ) : (
                    <></>
                  )}
                </div>
              </CardBody>
            </Card>
          </Container>
        </div>
      </div>
      <Dialog open={open} onClose={handleClose}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <DialogTitle style={{ paddingBottom: 2, marginRight: "15vw" }}>
            Allocated Teams:
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              right: 0,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <Divider style={{ borderColor: "black" }} />
        <DialogContent style={{ paddingTop: 0 }}>
          <List sx={{ width: "100%" }}>
            {currentTeam.length > 0 ? (
              currentTeam.map((team) => {
                return (
                  <React.Fragment key={team.teamId}>
                    <div style={{ display: "flex", direction: "row" }}>
                      <ListItem
                        alignItems="flex-start"
                        style={{ flex: 7, cursor: "pointer" }}
                        onClick={() => {
                          handleClickTeam(
                            team.teamId,
                            team.teamIdShow,
                            team.teamName
                          );
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
                                Course: {team.course} <br />
                              </Typography>
                              <Typography
                                sx={{ display: "inline" }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                Preference No.: {team.preferenceNum} <br />
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
      </Dialog>
    </main>
  );
};

export default ProjectDetails;
