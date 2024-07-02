import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { Container } from "reactstrap";

import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import '../assets/scss/FullLayout.css';//make sure import this

const TeamRouter = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const role = parseInt(localStorage.getItem("role"));
    if (role === 1) {
      navigate('/team/student');
    } else {
      navigate('/team/tutor');
    }
  }, []);

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
          </Container>
        </div>
      </div>
    </main>
  );
};

export default TeamRouter;