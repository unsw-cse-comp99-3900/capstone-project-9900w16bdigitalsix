import React, { useState, useEffect } from 'react';
import { Modal, Select, Avatar, Button, message, List, Radio } from 'antd';

import '../assets/scss/AssignRoleModal.css';
import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';

const { Option } = Select;

const PersonalCard = ({ visible, onOk, onCancel, refreshData }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // student list
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadStudentData();
    setSelectedId(null);
  }, []);
  // update selected student 
  const handleSelect = (e) => {
    setSelectedId(e);
  };

  const loadStudentData = async() => {
    const response = await apiCall('GET', 'v1/user/student/list', null, token, true);
    
    if (!response) {
      setData([]);
      setFilteredData([]);
    } else if (response.error) {
      setData([]);
      setFilteredData([]);
    } else {
      const res = Array.isArray(response) ? response : [];
      setData(res);
      setFilteredData(res);
    }
  }

  const handleSubmit = async () => {
    if (!selectedId) {
      setSnackbarContent('Please select a personal card');
      setAlertType('error');
      setAlertOpen(true);
      return;
    }

    if (!token) {
      setSnackbarContent('Please login first');
      setAlertType('error');
      setAlertOpen(true);
      return;
    }
    setSelectedId(null);
    // const response = await apiCall('POST', 'v1/admin/modify/user/role', {
    //   userId: user.userId,
    //   role: selectedRole,
    //   notification: {
    //     content: `Your role has been changed to ${selectedRoleName}.`,
    //     to: {
    //       users: [
    //         user.userId
    //       ]
    //     }
    //   },
    // }, token, true);

    // if (response.error) {
    //   setSnackbarContent(response.error);
    //   setAlertType('error');
    //   setAlertOpen(true);
    // } else {
    //   setSnackbarContent('User role updated successfully');
    //   setAlertType('success');
    //   setAlertOpen(true);
    //   onOk();
    //   refreshData();
    // }
  };

  const handleCancel = () => {
    setSelectedId(null);
    onCancel();
  }

  return (
    <>
      <Modal
        title="Share student card"
        visible={visible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>Save</Button>
        ]}
      >
        <List
          dataSource={data}
          style={{ maxHeight: '400px', overflowY: 'auto' }}
          renderItem={item => (
            <List.Item onClick={() => handleSelect(item.userId)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Radio
                  value={item.userId}
                  checked={selectedId === item.userId}
                  onChange={() => handleSelect(item.userId)}
                  style={{ marginRight: 16 }}
                />
                <Avatar src={item.avatarUrl} style={{ marginRight: 16 }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div><strong>Name:</strong> {item.userName}</div>
                  <div><strong>Email:</strong> {item.email}</div>
                  <div><strong>Course:</strong> {item.course}</div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Modal>
      <MessageAlert
        open={alertOpen}
        alertType={alertType}
        handleClose={() => setAlertOpen(false)}
        snackbarContent={snackbarContent}
      />
    </>
  );
};

export default PersonalCard;
