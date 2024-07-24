import React, { useState, useEffect } from 'react';
import { Modal, Select, Avatar, Button, message, List, Checkbox } from 'antd';

import '../assets/scss/AssignRoleModal.css';
import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';

const { Option } = Select;

const ChatPersonalCard = ({ visible, onOk, onCancel, refreshData }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // student list
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    loadStudentData();
    setSelectedIds([]);
  }, []);

  const handleSelect = (userId) => {
    setSelectedIds(prevSelectedIds =>
      prevSelectedIds.includes(userId)
        ? prevSelectedIds.filter(id => id !== userId)
        : [...prevSelectedIds, userId]
    );
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
    if (selectedIds.length === 0) {
      setSnackbarContent('Please select at least one personal card');
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
    setSelectedIds([]);
  };

  const handleCancle = () => {
    onCancel();
    setSelectedIds([]);
  }

  return (
    <>
      <Modal
        title="Select people to chat"
        visible={visible}
        onOk={handleSubmit}
        onCancel={handleCancle}
        footer={[
          <Button key="cancel" onClick={onCancel}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>Save</Button>
        ]}
      >
        <List
          dataSource={data}
          style={{ maxHeight: '400px', overflowY: 'auto' }}
          renderItem={item => (
            <List.Item>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Checkbox
                  value={item.userId}
                  checked={selectedIds.includes(item.userId)}
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

export default ChatPersonalCard;