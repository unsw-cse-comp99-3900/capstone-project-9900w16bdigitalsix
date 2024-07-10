import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container } from "reactstrap";
import '../assets/scss/FullLayout.css';//make sure import this

const TestProjectDetail = () => {
  const navigate = useNavigate();
  const item = {
    projectId: '1',
    title:'ma111',
    teamId:'1',
    teamIdShow:'11111',
    teamName:"digitalSix",
  }
  const handleClick = () => {
    navigate(`/project/progress/${item.projectId}/${item.teamId}`, { state: { item } });
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
            {/* add code here */}
            dashboard
            <button
              onClick={handleClick}
            >

            </button>
          </Container>
        </div>
      </div>
    </main>
  );
};

export default TestProjectDetail;
