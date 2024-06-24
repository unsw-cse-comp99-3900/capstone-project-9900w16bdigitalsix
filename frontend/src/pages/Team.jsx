import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MessageAlert from "../components/MessageAlert";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container } from "reactstrap";
import { apiCall } from "../helper";
import JoinTeamDialog from "./JoinTeam";
import TeamProfile from "./TeamProfile";
import CircularProgress from "@mui/material/CircularProgress";

const Team = (props) => {
  const [hasTeam, setHasTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teamId, setTeamId] = useState(null);
  const [teamName, setTeamName] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [alertType, setAlertType] = useState("error");
  const [currentMember, setCurrentMember] = useState([]);
  const [curTeamSkills, setCurTeamSkills] = useState([]);
  const [isInvite, setIsInvite] = useState(false);

  const userId = parseInt(localStorage.getItem("userId"));

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowError(false);
  };

  useEffect(() => {
    const isTeam = async () => {
      const res = await apiCall("GET", `v1/team/profile/${userId}`);
      if (res.error) {
        setHasTeam(false);
        setLoading(false);
      } else {
        console.log(res);
        setTeamId(res.teamId);
        setTeamName(res.teamName);
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
      setErrorMessage(error);
      setAlertType("error");
      setShowError(true);
    }
  }, [userId, teamId, isInvite]);

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
        setTeamName(res.teamName);
        setCurrentMember(res.teamMember);
        setHasTeam(true);
        setErrorMessage("Success!");
        setAlertType("success");
        setShowError(true);
        localStorage.setItem("teamId", res.teamId);
      }
    } catch (error) {
      setErrorMessage(error);
      setAlertType("error");
      setShowError(true);
    }
  };

  const clickJoin = () => {
    setDialogOpen(true);
  };

  const joinTeam = async (uid, tid) => {
    try {
      const body = { userId: uid, teamId: parseInt(tid) };
      const res = await apiCall("PUT", "v1/team/join", body);
      if (res.error) {
        setErrorMessage("team not found");
        setAlertType("error");
        setShowError(true);
      } else {
        console.log(res.teamSkills);
        setTeamId(res.teamId);
        setTeamName(res.teamName);
        setCurrentMember(res.teamMember);
        setCurTeamSkills(res.teamSkills);
        setHasTeam(true);
        setErrorMessage("Success!");
        setAlertType("success");
        setShowError(true);
        localStorage.setItem("teamId", res.teamId);
      }
    } catch (error) {
      setErrorMessage(error);
      setAlertType("error");
      setShowError(true);
    }
  };

  const leaveTeam = async (uid) => {
    try {
      // console.log(uid);
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
      setErrorMessage(error);
      setAlertType("error");
      setShowError(true);
    }
  };

  const contentAreaStyle = {
    marginTop: "56px", // Adjust this value to match the Header height
    // padding: '16px', // Optional padding for the content area
  };

  const headerStyleLg = {
    position: "fixed",
    top: 0,
    // width: "100%",
    width: "calc(100% - 260px)",
    zIndex: 1000,
  };

  const headerStyleMd = {
    position: "fixed",
    top: 0,
    width: "100%",
    // width: "calc(100% - 260px)",
    zIndex: 1000,
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
          <div className="contentArea" style={contentAreaStyle}>
            <div className="d-mg-none" style={headerStyleLg}>
              {/********Header**********/}
              <Header />
            </div>
            <div className="d-lg-none" style={headerStyleMd}>
              {/********Header**********/}
              <Header />
            </div>
            {/********Middle Content**********/}
            <Container className="p-4 wrapper" fluid>
              {loading ? (
                <div style={styles.loadingContainer}>
                  <CircularProgress />
                </div>
              ) : (
                <>
                  {hasTeam ? (
                    <div>
                      <TeamProfile
                        teamId={teamId}
                        teamName={teamName}
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
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="h3"
                        gutterBottom
                        style={{ textAlign: "center", marginTop: "12vh" }}
                      >
                        You do not have your own team yet!
                      </Typography>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "30px",
                          marginTop: "15%",
                          width: "20vw",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          variant="contained"
                          size="large"
                          style={styles.button}
                          onClick={clickCreate}
                        >
                          create a team
                        </Button>
                        <Button
                          variant="contained"
                          size="large"
                          style={styles.button}
                          onClick={clickJoin}
                        >
                          join a team
                        </Button>
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

const styles = {
  button: {
    backgroundColor: "purple",
    width: "100%",
    padding: "20px 0",
    fontSize: "1.25rem",
  },
};

export default Team;
