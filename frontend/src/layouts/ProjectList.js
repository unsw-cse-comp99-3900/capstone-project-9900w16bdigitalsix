import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { Container, Row, Col, Button } from 'reactstrap';
import CustomCard from './CustomCard';

const ProjectList = () => {
  const ongoingProjects = [
    {
      title: 'Project Title',
      client: 'Client',
      clientTitle: 'Client Title',
      skills: 'Required Skills',
      field: 'Field',
      imgSrc: 'path_to_your_image_1.jpg',
    },
    {
      title: 'Project Title',
      client: 'Client',
      clientTitle: 'Client Title',
      skills: 'Required Skills',
      field: 'Field',
      imgSrc: 'path_to_your_image_2.jpg',
    },
    {
      title: 'Project Title',
      client: 'Client',
      clientTitle: 'Client Title',
      skills: 'Required Skills',
      field: 'Field',
      imgSrc: 'path_to_your_image_3.jpg',
    },
    {
      title: 'Project Title',
      client: 'Client',
      clientTitle: 'Client Title',
      skills: 'Required Skills',
      field: 'Field',
      imgSrc: 'path_to_your_image_3.jpg',
    },
  ];

  const archivedProjects = [
    {
      title: 'Project Title',
      client: 'Client',
      clientTitle: 'Client Title',
      skills: 'Required Skills',
      field: 'Field',
      imgSrc: 'path_to_your_image_4.jpg',
    },
    {
      title: 'Project Title',
      client: 'Client',
      clientTitle: 'Client Title',
      skills: 'Required Skills',
      field: 'Field',
      imgSrc: 'path_to_your_image_5.jpg',
    },
    {
      title: 'Project Title',
      client: 'Client',
      clientTitle: 'Client Title',
      skills: 'Required Skills',
      field: 'Field',
      imgSrc: 'path_to_your_image_6.jpg',
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
          {/********Header**********/}
          <Header />
          {/********Middle Content**********/}
          <Container className="p-4 wrapper" fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>Published Project</h3>
              <Link to="/project/create">
                <Button color="primary">+ Create</Button>
              </Link>
            </div>
            

            <Row>
              {ongoingProjects.map((project, index) => (
                <Col md="4" key={index}>
                  <CustomCard
                    title={project.title}
                    client={project.client}
                    clientTitle={project.clientTitle}
                    skills={project.skills}
                    field={project.field}
                    imgSrc={project.imgSrc}
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
