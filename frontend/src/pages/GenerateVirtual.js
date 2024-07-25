import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container } from "reactstrap";
import '../assets/scss/FullLayout.css'; // make sure to import this

// Import the VirtualDataReport component
import VirtualDataReport from './VirtualDataReport';

const GenerateVirtual = () => {
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
            {/* Render the VirtualDataReport component here */}
            <VirtualDataReport />
            {/* Placeholder for outlet or other components */}
            <Outlet />
          </Container>
        </div>
      </div>
    </main>
  );
};

export default GenerateVirtual;
