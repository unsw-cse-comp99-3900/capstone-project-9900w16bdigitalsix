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
            {/* add code here */}
            hey
          </Container>
        </div>
      </div>
    </main>
  );
};

export default FullLayout;