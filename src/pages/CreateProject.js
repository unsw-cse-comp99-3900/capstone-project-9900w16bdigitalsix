// CreateProject.js
import React from 'react';
import { Container } from 'reactstrap';
import Sidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';
import ProjectForm from '../components/ProjectForm';
import '../assets/scss/FullLayout.css';//make sure import this

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
            <h3>Create a new project</h3>
            <ProjectForm />
          </Container>
        </div>
      </div>
    </main>
  );
};

export default CreateProject;
