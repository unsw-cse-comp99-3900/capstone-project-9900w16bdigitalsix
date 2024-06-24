import React from 'react';
import { Outlet, useRoutes } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { Container } from 'reactstrap';
import routes from '../routes';
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
          {/********Header**********/}
          <Header />
          {/********Middle Content**********/}
          <Container className="p-4 wrapper" fluid>
            {useRoutes(routes)}
          </Container>
        </div>
      </div>
    </main>
  );
};

export default FullLayout;
