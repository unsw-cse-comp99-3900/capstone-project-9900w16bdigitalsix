import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Container } from "reactstrap";

const contentAreaStyle = {
  marginTop: '56px', // Adjust this value to match the Header height
  // padding: '16px', // Optional padding for the content area
};

const FullLayout = () => {
  return (
    <main>
      <div className="pageWrapper d-lg-flex">
        {/********Sidebar**********/}
        <aside className="sidebarArea shadow" id="sidebarArea">
          <Sidebar />
        </aside>
        {/********Content Area**********/}
        <div className="contentArea"  style={contentAreaStyle}>
          {/********Header**********/}
          <Header />
          {/********Middle Content**********/}
          <Container className="p-4 wrapper" fluid>
            {/* add code here */}

          </Container>
        </div>
      </div>
    </main>
  );
};

export default FullLayout;