import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MessageAlert from "../components/MessageAlert";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container } from "reactstrap";
import { apiCall } from "../helper";
import JoinTeamDialog from "./JoinTeam";
import TeamProfile from "./TeamProfile";

const Team = (props) => {
  const [hasTeam, setHasTeam] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { userId } = props;

  const clickCreate = async () => {
    try {
      const response = await fetch("/api/create-team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        // 假设后端返回了团队 ID
        const teamId = data.teamId;

        // 设置 hasTeam 为 true，可以根据需要设置
        setHasTeam(true);

        // 跳转到 teamProfile 页面
        navigate(`/teamProfile/${teamId}`);
      } else {
        // 处理错误响应
        console.error("Failed to create team");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const clickJoin = () => {
    setDialogOpen(true);
  };

  return (
    <>
      {hasTeam ? (
        <>
          <main>
            <div className="pageWrapper d-lg-flex">
              {/********Sidebar**********/}
              <aside className="sidebarArea shadow" id="sidebarArea">
                <Sidebar />
              </aside>
              {/********Content Area**********/}
              <div className="contentArea">
                {/********Header**********/}
                <Header />
                {/********Middle Content**********/}
                <Container className="p-4 wrapper" fluid>
                  {/* add code here */}
                  <div>
                    <TeamProfile />
                  </div>
                </Container>
              </div>
            </div>
          </main>
        </>
      ) : (
        <>
          <main>
            <div className="pageWrapper d-lg-flex">
              {/********Sidebar**********/}
              <aside className="sidebarArea shadow" id="sidebarArea">
                <Sidebar />
              </aside>
              {/********Content Area**********/}
              <div className="contentArea">
                {/********Header**********/}
                <Header />
                {/********Middle Content**********/}
                <Container
                  className="p-4 wrapper"
                  fluid
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* add code here */}
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
                    />
                  </div>
                </Container>
              </div>
            </div>
          </main>
        </>
      )}

      {/* <MessageAlert open={open} alertType={alertType} handleClose={handleClose} snackbarContent={snackbarContent}/> */}
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
