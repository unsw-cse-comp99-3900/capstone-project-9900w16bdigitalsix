import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import { Container } from "reactstrap";
import CircularProgress from "@mui/material/CircularProgress";

import MessageAlert from "../components/MessageAlert";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { apiCall } from "../helper";
import JoinTeamDialog from "./JoinTeam";
import TeamProfile from "./TeamProfile";
import "../assets/scss/FullLayout.css";
import "../assets/scss/teamStyle.css";
import cap from "../assets/images/logos/cap.png";

const Team = (props) => {
  // some states
  const [hasTeam, setHasTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teamId, setTeamId] = useState(null);
  const [teamIdShow, setTeamIdShow] = useState(null);
  const [teamName, setTeamName] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [alertType, setAlertType] = useState("error");
  const [currentMember, setCurrentMember] = useState([]);
  const [curTeamSkills, setCurTeamSkills] = useState([]);
  const [isInvite, setIsInvite] = useState(false);
  const [course, setCourse] = useState("");

  const userId = parseInt(localStorage.getItem("userId"));

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowError(false);
  };

  useEffect(() => {
    // this function is used to get the team details that a user belong to
    const isTeam = async () => {
      const res = await apiCall("GET", `v1/team/profile/${userId}`);
      if (res.error) {
        setHasTeam(false);
        setLoading(false);
      } else {
        setTeamId(res.teamId);
        setTeamIdShow(res.teamIdShow);
        setCourse(res.course);
        setCurrentMember(res.teamMember);
        setCurTeamSkills(res.teamSkills);
        setHasTeam(true);
        setLoading(false);
        localStorage.setItem("teamId", res.teamId);
      }
    };
    try {
      isTeam();
    } catch (error) {
      setErrorMessage(error.message || error.toString());
      setAlertType("error");
      setShowError(true);
    }
  }, [userId, teamId, isInvite]);

  // this function is used to create a team
  const clickCreate = async () => {
    try {
      const body1 = { user_id: userId };
      const res = await apiCall("POST", "v1/team/create", body1);
      if (res.error) {
        setErrorMessage(res.error);
        setAlertType("error");
        setShowError(true);
      } else {
        setTeamId(res.teamId);
        setTeamIdShow(res.teamIdShow);
        setTeamName(res.teamName);
        setCourse(res.course);
        setCurrentMember(res.teamMember);
        setCurTeamSkills(res.teamSkills);
        setHasTeam(true);
        setErrorMessage("Success!");
        setAlertType("success");
        setShowError(true);
        localStorage.setItem("teamId", res.teamId);
      }
    } catch (error) {
      setErrorMessage(error.message || error.toString());
      setAlertType("error");
      setShowError(true);
    }
  };

  const clickJoin = () => {
    setDialogOpen(true);
  };

  // this function is used to join a team
  const joinTeam = async (uid, tid) => {
    try {
      const body = { userId: uid, teamIdShow: parseInt(tid) };
      const res = await apiCall("PUT", "v1/team/join", body);
      if (res.error) {
        setErrorMessage("team not found");
        setAlertType("error");
        setShowError(true);
      } else {
        setTeamId(res.teamId);
        setTeamIdShow(res.teamIdShow);
        setTeamName(res.teamName);
        setCourse(res.course);
        setCurrentMember(res.teamMember);
        setCurTeamSkills(res.teamSkills);
        setHasTeam(true);
        setErrorMessage("Success!");
        setAlertType("success");
        setShowError(true);
        localStorage.setItem("teamId", res.teamId);
      }
    } catch (error) {
      setErrorMessage(error.message || error.toString());
      setAlertType("error");
      setShowError(true);
    }
  };

  // this function is used to leave a team
  const leaveTeam = async (uid) => {
    try {
      const res = await apiCall("DELETE", `v1/team/leave/${uid}`);
      if (res.error) {
        setErrorMessage(res.error);
        setAlertType("error");
        setShowError(true);
      } else {
        localStorage.removeItem("teamId");
        setErrorMessage("Success leave!");
        setAlertType("success");
        setShowError(true);
        setHasTeam(false);
        setTeamId(null);
        setDialogOpen(false);
      }
    } catch (error) {
      setErrorMessage(error.message || error.toString());
      setAlertType("error");
      setShowError(true);
    }
  };

  return (
    <>
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
              {loading ? (
                <div className="loadingContainer">
                  <CircularProgress />
                </div>
              ) : (
                <>
                  {hasTeam ? (
                    <div>
                      <TeamProfile
                        teamId={teamId}
                        teamIdShow={teamIdShow}
                        teamName={teamName}
                        course={course}
                        setTeamName={setTeamName}
                        leaveTeam={leaveTeam}
                        currentMember={currentMember}
                        setCurrentMember={setCurrentMember}
                        curTeamSkills={curTeamSkills}
                        setCurTeamSkills={setCurTeamSkills}
                        isInvite={isInvite}
                        setIsInvite={setIsInvite}
                      />
                    </div>
                  ) : (
                    <div className="noTeamContainer">
                      <div className="noTeamBox">
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          {/* <LogoDark /> */}
                          <img
                            src={cap}
                            alt="small_logo"
                            style={{ width: "80px", height: "80px" }}
                          />
                        </div>
                        <Typography
                          variant="h4"
                          gutterBottom
                          className="noTeamMessage"
                        >
                          You do not have your own team yet!
                        </Typography>
                        <div className="buttonContainer">
                          <button className="teamButton" onClick={clickCreate}>
                            Create a team
                          </button>
                          <button className="teamButton" onClick={clickJoin}>
                            Join a team
                          </button>
                        </div>
                      </div>
                      <div>
                        <JoinTeamDialog
                          open={dialogOpen}
                          onClose={() => setDialogOpen(false)}
                          joinTeam={joinTeam}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </Container>
          </div>
        </div>
      </main>
      <MessageAlert
        open={showError}
        alertType={alertType}
        handleClose={handleClose}
        snackbarContent={errorMessage}
      />
    </>
  );
};

export default Team;
