import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, List, Avatar } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';

const CoorAssign = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [coordinators, setCoordinators] = useState([]);
  const [filteredCoordinators, setFilteredCoordinators] = useState([]);
  const searchRef = useRef();
  const [selectedCoordinator, setSelectedCoordinator] = useState(null);
  const [snackbarContent, setSnackbarContent] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');

  const loadCoordinators = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const data = await apiCall('GET', 'v1/admin/get/coordinator/list', null, token, true);
    if (!data){
      setCoordinators([]);
      setFilteredCoordinators([]);
    } else if (!data.error) {
      setCoordinators(data);
      setFilteredCoordinators(data);
    } else {
      console.error('Failed to fetch Coordinator data:', data.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCoordinators();
  }, []);

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const assignCoordinator = async (coordinator) => {
    setSelectedCoordinator(coordinator);
    const token = localStorage.getItem('token');
    const requestBody = {
      projectId: projectId,
      coordinatorId: coordinator.userId
    };
    const data = await apiCall('POST', 'v1/admin/change/project/coordinator', requestBody, token, true);
    if (data && !data.error) {
      setSnackbarContent('Project coordinator updated successfully');
      setAlertType('success');
      setAlertOpen(true);
    } else {
      setSnackbarContent('Failed to update project coordinator');
      setAlertType('error');
      setAlertOpen(true);
    }
  };

  const searchList = () => {
    const searchTerm = searchRef.current.input.value.toLowerCase();
    const filtered = coordinators.filter(coordinator =>
      coordinator.userName.toLowerCase().includes(searchTerm) ||
      coordinator.email.toLowerCase().includes(searchTerm)
    );
    setFilteredCoordinators(filtered);
  };

  return (
    <>
      <div className="search">
        <Input
          ref={searchRef}
          size="large"
          placeholder="Search Coordinator"
          prefix={<SearchOutlined />}
          onChange={searchList}
        />
      </div>
      <List
        loading={loading}
        dataSource={filteredCoordinators}
        renderItem={(coordinator) => (
          <List.Item key={coordinator.userId}>
            <Avatar src={coordinator.avatar || ''} size={48} />
            <List.Item.Meta
              title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>{coordinator.userName}</span>}
              description={<div>Email: {coordinator.email}</div>}
            />
            <Button type="primary" onClick={() => assignCoordinator(coordinator)}>Assign</Button>
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

export default CoorAssign;
