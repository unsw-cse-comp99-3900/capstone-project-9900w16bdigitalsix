import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container, Card, CardTitle, CardBody, Button } from "reactstrap";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Avatar from "@mui/material/Avatar";

import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import "../assets/scss/FullLayout.css"; //make sure import this
import TutorAssign from "../components/AssignTeamTutorModal";
import CoorAssign from "../components/AssignTeamCoorModal";
import { apiCall } from "../helper";

// load the project details page for admin, assign tutor, coordinator for the project
const ProjectAdminAssign = () => {
  const location = useLocation();
  const { item } = location.state || {};

  const {
    clientEmail,
    clientName,
    description,
    field,
    projectId,
    requiredSkills,
    title,
  } = item;

  const [tutor, setTutor] = useState(null);
  const [coordinator, setCoordinator] = useState(null);
  // State for the Tutor Dialog
  const [tutorDialogOpen, setTutorDialogOpen] = useState(false);
  const toggleTutorDialog = () => {
    setTutorDialogOpen(!tutorDialogOpen);
    fetchTutor();
  };
  // State for the Coordinator Dialog
  const [coorDialogOpen, setCoorDialogOpen] = useState(false);
  const toggleCoorDialog = () => {
    fetchCoordinator();
    setCoorDialogOpen(!coorDialogOpen);
  };

  const { tutorId, tutorName, tutorEmail, tutorAvatar } = tutor || {};
  const { coorId, coorEmail, coorName, coorAvatar } = coordinator || {};

  useEffect(() => {
    if (projectId) {
      fetchTutor();
      fetchCoordinator();
    }
  }, [projectId]);

  // get the detail information for the assigned tutor
  const fetchTutor = async () => {
    const token = localStorage.getItem("token");
    const result = await apiCall(
      "GET",
      `v1/admin/get/tutor/${projectId}`,
      null,
      token,
      true
    );
    if (!result.error) {
      setTutor({
        tutorId: result.tutorId,
        tutorName: result.name,
        tutorEmail: result.email,
        tutorAvatar: result.avatarURL,
      });
    } else {
      console.error("Error fetching tutor info:", result.error);
      setTutor(null);
    }
  };
  // get the detail information for the assigned coordinator
  const fetchCoordinator = async () => {
    const token = localStorage.getItem("token");
    const result = await apiCall(
      "GET",
      `v1/admin/get/coordinator/${projectId}`,
      null,
      token,
      true
    );
    if (!result.error) {
      setCoordinator({
        coorId: result.coorId,
        coorName: result.name,
        coorEmail: result.email,
        coorAvatar: result.avatarURL,
      });
    } else {
      console.error("Error fetching coordinator info:", result.error);
      setCoordinator(null);
    }
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
            {/* card to load all the information about project */}
            <Card>
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
                  {title}
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
              </CardTitle>
              {/* project detail: client, description, skills, tutor, coordinator */}
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
                    style={{
                      margin: "0",
                      fontSize: "16px",
                      textAlign: "justify",
                      fontWeight: "400",
                    }}
                  >
                    <strong>Description:</strong> {description}
                  </p>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "400" }}
                  >
                    <strong>Required Skills:</strong>{" "}
                    {requiredSkills.join(", ")}
                  </p>
                </div>
                <div>
                  <h5
                    style={{
                      margin: "30px 30px 10px 30px",
                      fontSize: "18px",
                      fontWeight: "600",
                    }}
                  >
                    Project Tutor
                  </h5>
                  {tutorId || tutorName || tutorEmail ? (
                    <Card
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 20px",
                        margin: "10px auto",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        width: "70%",
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ minWidth: "60px", marginRight: "20px" }}>
                        <Avatar
                          src={tutorAvatar}
                          alt="Coor Avatar"
                          style={{ width: "60px", height: "60px" }}
                          imgProps={{
                            onError: (e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://example.com/default-avatar.png";
                            },
                          }}
                        />
                      </div>

                      <div
                        style={{
                          flexGrow: 1,
                          minWidth: "160px",
                          flexBasis: "50%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "flex-start",
                        }}
                      >
                        <p
                          style={{
                            margin: "0",
                            fontSize: "14px",
                            fontWeight: "400",
                          }}
                        >
                          <strong>Name:</strong> {tutorName}
                          <br />
                          <strong>Email:</strong> {tutorEmail}
                        </p>
                      </div>

                      <Button
                        color="primary"
                        onClick={toggleTutorDialog}
                        style={{
                          whiteSpace: "nowrap",
                          alignSelf: "center",
                          padding: "6px 12px",
                          fontSize: "14px",
                        }}
                      >
                        Change
                      </Button>
                    </Card>
                  ) : (
                    <Button
                      color="primary"
                      className="mb-3 btn-lg"
                      style={{ display: "block", margin: "30px" }}
                      onClick={toggleTutorDialog}
                    >
                      Assign Tutor
                    </Button>
                  )}
                </div>
                <div>
                  <h5
                    style={{
                      margin: "30px 30px 10px 30px",
                      fontSize: "18px",
                      fontWeight: "600",
                    }}
                  >
                    Project Coordinator
                  </h5>
                  {coorId || coorName || coorEmail ? (
                    <Card
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 20px",
                        margin: "10px auto",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        width: "70%",
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ minWidth: "60px", marginRight: "20px" }}>
                        <Avatar
                          src={coorAvatar}
                          alt="Coor Avatar"
                          style={{ width: "60px", height: "60px" }}
                          imgProps={{
                            onError: (e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://example.com/default-avatar.png";
                            },
                          }}
                        />
                      </div>

                      <div
                        style={{
                          flexGrow: 1,
                          minWidth: "160px",
                          flexBasis: "50%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "flex-start",
                        }}
                      >
                        <p
                          style={{
                            margin: "0",
                            fontSize: "14px",
                            fontWeight: "400",
                          }}
                        >
                          <strong>Name:</strong> {coorName}
                          <br />
                          <strong>Email:</strong> {coorEmail}
                        </p>
                      </div>

                      <Button
                        color="primary"
                        onClick={toggleCoorDialog}
                        style={{
                          whiteSpace: "nowrap",
                          alignSelf: "center",
                          padding: "6px 12px",
                          fontSize: "14px",
                        }}
                      >
                        Change
                      </Button>
                    </Card>
                  ) : (
                    <Button
                      color="primary"
                      className="mb-3 btn-lg"
                      style={{ display: "block", margin: "30px" }}
                      onClick={toggleCoorDialog}
                    >
                      Assign Coordinator
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          </Container>
          {/* dialog for assigning a coordinator */}
          <Dialog
            open={coorDialogOpen}
            onClose={() => {
              toggleCoorDialog();
              fetchCoordinator();
            }}
            maxWidth="md"
            fullWidth={true}
          >
            <DialogTitle>Assign Coordinator</DialogTitle>
            <DialogContent style={{ height: "100%", minHeight: "400px" }}>
              <CoorAssign
                projectId={projectId}
                projectName={title}
                assignedCoorId={coordinator?.coorId}
                toggleCoorDialog={toggleCoorDialog}
              />
            </DialogContent>
          </Dialog>
          {/* dialog for assigning a tutor */}
          <Dialog
            open={tutorDialogOpen}
            onClose={() => {
              toggleTutorDialog();
              fetchTutor();
            }}
            maxWidth="md"
            fullWidth={true}
          >
            <DialogTitle>Assign Tutor</DialogTitle>
            <DialogContent style={{ height: "100%", minHeight: "400px" }}>
              <TutorAssign
                projectId={projectId}
                projectName={title}
                assignedTutorId={tutor?.tutorId}
                toggleTutorDialog={toggleTutorDialog}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </main>
  );
};

export default ProjectAdminAssign;
