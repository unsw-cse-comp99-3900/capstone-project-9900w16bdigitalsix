import React, { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import Sidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';
import '../assets/scss/FullLayout.css';//make sure import this
import EditProjectForm from '../components/EditProjectForm';
// import { apiCall } from './api'; // 确保路径正确
import { useParams } from 'react-router-dom';

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

const EditProject = () => {
  const { id } = useParams();
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await apiCall('GET', `/v1/project/detail/${id}`);
        setInitialValues({
          title: data.title || '',
          field: data.field || '',
          description: data.description || '',
          email: data.clientEmail || '',
          requiredSkills: data.requiredSkills ? data.requiredSkills.join(', ') : '',
          file: null,
        });
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [id]);

  if (!initialValues) {
    return <div>Loading...</div>;
  }

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
          <Container className="p-4 wrapper" fluid>
            <h3>Edit Project Information</h3>
            <EditProjectForm initialValues={initialValues} id={id} />
          </Container>
        </div>
      </div>
    </main>
  );
};

export default EditProject;
