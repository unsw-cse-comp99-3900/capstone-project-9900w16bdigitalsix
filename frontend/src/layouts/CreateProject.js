// CreateProject.js
import React from 'react';
import { Container } from 'reactstrap';
import Sidebar from './Sidebar';
import Header from './Header';
import ProjectForm from './ProjectForm';

const CreateProject = () => {
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
            <h3>Create a new project</h3>
            <ProjectForm />
          </Container>
        </div>
      </div>
    </main>
  );
};

export default CreateProject;
