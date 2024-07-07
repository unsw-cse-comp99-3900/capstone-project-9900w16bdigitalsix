import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, List, Avatar } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';

const TutorAssign = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const searchRef = useRef();
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [snackbarContent, setSnackbarContent] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');

  const loadTutors = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const data = await apiCall('GET', 'v1/admin/get/tutor/list', null, token, true);
    if (!data){
      setTutors([]);
      setFilteredTutors([]);
    } else if (!data.error) {
      setTutors(data);
      setFilteredTutors(data);
    } else {
      console.error('Failed to fetch tutor data:', data.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTutors();
  }, []);

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const assignTutor = async (tutor) => {
    setSelectedTutor(tutor);
    const token = localStorage.getItem('token');
    const requestBody = {
      projectId: projectId,
      tutorId: tutor.userId
    };
    const data = await apiCall('POST', 'v1/admin/change/project/tutor', requestBody, token, true);
    if (data && !data.error) {
      //console.log('Project tutor updated successfully:', data);
      setSnackbarContent('Project tutor updated successfully');
      setAlertType('success');
      setAlertOpen(true);
    } else {
      //console.error('Failed to update project tutor:', data.error);
      setSnackbarContent('Failed to update project tutor');
      setAlertType('error');
      setAlertOpen(true);
    }
  };

  const searchList = () => {
    const searchTerm = searchRef.current.input.value.toLowerCase();
    const filtered = tutors.filter(tutor =>
      tutor.userName.toLowerCase().includes(searchTerm) ||
      tutor.email.toLowerCase().includes(searchTerm)
    );
    setFilteredTutors(filtered);
  };

  return (
    <>
      <div className="search">
        <Input
          ref={searchRef}
          size="large"
          placeholder="Search Tutor"
          prefix={<SearchOutlined />}
          onChange={searchList}
        />
      </div>
      <List
        loading={loading}
        dataSource={filteredTutors}
        renderItem={(tutor) => (
          <List.Item key={tutor.userId}>
            <Avatar src={tutor.avatar || ''} size={48} />
            <List.Item.Meta
              title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>{tutor.userName}</span>}
              description={<div>Email: {tutor.email}</div>}
            />
            <Button type="primary" onClick={() => assignTutor(tutor)}>Assign</Button>
          </List.Item>
        )}
      />
        <MessageAlert
      open={alertOpen}
      alertType={alertType}
      handleClose={handleAlertClose}
      snackbarContent={snackbarContent}
        />
    </>
  );
};

export default TutorAssign;