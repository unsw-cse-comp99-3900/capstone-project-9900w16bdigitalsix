import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';
import { Container, Row, Col, Button } from 'reactstrap';
import CustomCard from '../components/CustomCard';

import '../assets/scss/FullLayout.css';//make sure import this

const apiCall = async (method, endpoint) => {
  const response = await fetch(`http://127.0.0.1:8080${endpoint}`, {
    method,
    headers: {
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  return data;
};


const ProjectList = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await apiCall('GET', '/v1/project/get/public_project/list');
        const mappedProjects = data.map(project => ({
          id: project.projectId,
          title: project.title,
          client: project.clientName,
          clientTitle: project.clientEmail,
          skills: project.requiredSkills || 'N/A',
          field: project.field,
        }));
        setProjects(mappedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleDelete = (id) => {
    setProjects(projects.filter(project => project.id !== id));
  };


  const archivedProjects = [
    {
      title: 'Project Title',
      client: 'Client',
      clientTitle: 'Client Title',
      skills: 'Required Skills',
      field: 'Field',
    },
    {
      title: 'Project Title',
      client: 'Client',
      clientTitle: 'Client Title',
      skills: 'Required Skills',
      field: 'Field',
    },
    {
      title: 'Project Title',
      client: 'Client',
      clientTitle: 'Client Title',
      skills: 'Required Skills',
      field: 'Field',
    },
  ];

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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>Published Project</h3>
              <Link to="/project/create">
                <Button color="primary">+ Create</Button>
              </Link>
            </div>
            

            <Row>
        {projects.map(project => (
          <Col key={project.id} md="4">
            <CustomCard
              id={project.id}
              title={project.title}
              client={project.client}
              clientTitle={project.clientTitle}
              skills={project.skills}
              field={project.field}
              onDelete={handleDelete}
            />
          </Col>
        ))}
      </Row>


            <h3>Archived Projects</h3>
            <Row>
              {archivedProjects.map((project, index) => (
                <Col md="4" key={index}>
                  <CustomCard
                    title={project.title}
                    client={project.client}
                    clientTitle={project.clientTitle}
                    skills={project.skills}
                    field={project.field}
                    // imgSrc={project.imgSrc}
                  />
                </Col>
              ))}
            </Row>
          </Container>
        </div>
      </div>
    </main>
  );
};

export default ProjectList;
