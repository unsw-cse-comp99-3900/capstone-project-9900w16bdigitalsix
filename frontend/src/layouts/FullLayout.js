import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Container } from "reactstrap";
import '../assets/scss/FullLayout.css';//make sure import this

const FullLayout = () => {
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

export default FullLayout;
