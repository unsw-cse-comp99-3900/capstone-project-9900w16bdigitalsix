import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container } from "reactstrap";
import '../assets/scss/FullLayout.css';
import VirtualDataReport from './VirtualDataReport';

// load all project report for admin
const GenerateVirtual = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <main>
      <div className="pageWrapper d-lg-flex">
        <aside className={`sidebarArea shadow ${isSidebarOpen ? '' : 'collapsed'}`} id="sidebarArea">
          <Sidebar toggleSidebar={toggleSidebar} />
        </aside>
        <div className="contentArea" style={{ width: isSidebarOpen ? 'calc(100% - 250px)' : '100%' }}>
          <div className="d-lg-none headerMd">
            <Header />
          </div>
          <div className="d-none d-lg-block headerLg">
            <Header />
          </div>
          <Container className="p-4 wrapper" fluid>
            <VirtualDataReport isSidebarOpen={isSidebarOpen} />
            <Outlet />
          </Container>
        </div>
      </div>
    </main>
  );
};

export default GenerateVirtual;
