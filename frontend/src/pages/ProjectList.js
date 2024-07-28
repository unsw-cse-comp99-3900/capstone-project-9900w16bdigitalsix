import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';
import { Container, Row, Col, Button } from 'reactstrap';
import CustomCard from '../components/CustomCard';
import MessageAlert from '../components/MessageAlert';

import '../assets/scss/FullLayout.css'; // make sure to import this

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
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [role, setRole] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertContent, setAlertContent] = useState('');
  const [hasProjects, setHasProjects] = useState(false);
  const [hasTeam, setHasTeam] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async (userId) => {
      try {
        const projectResponse = await apiCall('GET', `/v1/project/get/list/byRole/${userId}`);
        console.log('Project Response:', projectResponse);

        if (projectResponse.length === 0) {
          setHasProjects(false);
        } else {
          const mappedProjects = projectResponse.map(project => ({
            id: project.projectId,
            title: project.title,
            client: project.clientName,
            clientTitle: project.clientEmail,
            skills: project.requiredSkills || 'N/A',
            clientAvatar: project.clientAvatar,
            field: project.field,
            allocatedTeamsCount: project.allocatedTeam ? project.allocatedTeam.length : 0,
          }));
          console.log('Mapped Projects:', mappedProjects);
          setProjects(mappedProjects);
          setHasProjects(true);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    const fetchArchivedProjects = async () => {
      try {
        const archivedResponse = await apiCall('GET', `/v1/project/get/archived/list`);
        console.log('Archived Project Response:', archivedResponse);

        const mappedArchivedProjects = archivedResponse.map(project => ({
          id: project.projectId,
          title: project.title,
          client: project.clientName,
          clientTitle: project.clientEmail,
          skills: project.requiredSkills || 'N/A',
          clientAvatar: project.clientAvatar,
          field: project.field,
        }));
        console.log('Mapped Archived Projects:', mappedArchivedProjects);
        setArchivedProjects(mappedArchivedProjects);
      } catch (error) {
        console.error('Error fetching archived projects:', error);
      }
    };

    const checkTeamAndFetchProjects = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const role = parseInt(localStorage.getItem('role'), 10);
        setRole(role);

        if (role === 1) {
          const teamResponse = await apiCall('GET', `/v1/team/profile/${userId}`);
          if (teamResponse.error) {
            setAlertContent('You should gather your team first');
            setOpenAlert(true);
            return;
          } else {
            setHasTeam(true);
          }
        }
        fetchProjects(userId);
        fetchArchivedProjects();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    checkTeamAndFetchProjects();
  }, []);

  const handleDelete = (id) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const handlePreference = () => {
    navigate(`/project/preference`);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
    navigate('/team/student');
  };

  return (
    <main>
      <MessageAlert
        open={openAlert}
        alertType="error"
        handleClose={handleCloseAlert}
        snackbarContent={alertContent}
      />
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
            {role === 1 && hasTeam && !hasProjects && (
              <div className="d-flex justify-content-center align-items-center mb-3" style={{ height: '200px' }}>
                <Button
                  color="primary"
                  size="lg"
                  style={{ fontSize: '24px', padding: '20px 40px' }}
                  onClick={handlePreference}
                >
                  Manage your preference list
                </Button>
              </div>
            )}
            {(role === 3 || role === 4 || role === 5) && (
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Published Project</h3>
                <Link to="/project/create">
                  <Button color="primary">+ Create Project</Button>
                </Link>
              </div>
            )}
            {role === 2 && (
              <h3 className="mb-4">Published Project</h3>
            )}

            <Row>
              {projects.map(project => (
                <Col key={project.id} md="4">
                  <CustomCard
                    id={project.id}
                    title={project.title}
                    client={project.client}
                    clientTitle={project.clientTitle}
                    clientAvatar={project.clientAvatar}
                    skills={project.skills}
                    field={project.field}
                    onDelete={handleDelete}
                    role={role}
                    allocatedTeamsCount={project.allocatedTeamsCount} 
                    showActions={true}
                  />
                </Col>
              ))}
            </Row>
            <h3 className="mt-4">Archived Projects</h3>
            <Row>
              {archivedProjects.map(project => (
                <Col key={project.id} md="4">
                  <CustomCard
                    id={project.id}
                    title={project.title}
                    client={project.client}
                    clientTitle={project.clientTitle}
                    clientAvatar={project.clientAvatar}
                    skills={project.skills}
                    field={project.field}
                    role={role}
                    showActions={false}
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
