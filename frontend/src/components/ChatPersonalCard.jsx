import React, { useState, useEffect } from 'react';
import { Modal, Avatar, Button, List, Checkbox, Input } from 'antd';

import '../assets/scss/AssignRoleModal.css';
import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';

const { Search } = Input;

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvatars, setSelectedAvatars] = useState([]);

  useEffect(() => {
    loadStudentData();
    setSelectedIds([]);
    setSelectedAvatars([]);
  }, []);

  useEffect(() => {
    const filtered = data.filter(item =>
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleSelect = (userId, avatarUrl) => {
    if (selectedIds.includes(userId)) {
      setSelectedIds(prevSelectedIds => prevSelectedIds.filter(id => id !== userId));
      setSelectedAvatars(prevSelectedAvatars => prevSelectedAvatars.filter(user => user.userId !== userId));
    } else {
      setSelectedIds(prevSelectedIds => [...prevSelectedIds, userId]);
      setSelectedAvatars(prevSelectedAvatars => [...prevSelectedAvatars, { userId, avatarUrl }]);
    }
  };

  const loadStudentData = async () => {
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
    setSelectedAvatars([]);
  };

  const handleCancel = () => {
    onCancel();
    setSelectedIds([]);
    setSelectedAvatars([]);
  }

  return (
    <>
      <Modal
        title="Select people to chat"
        visible={visible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>Invite</Button>
        ]}
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {selectedAvatars.map((user, index) => (
            <Avatar
              key={user.userId}
              id={user.userId}
              src={user.avatarUrl ? user.avatarUrl : ''}
              size={64}
              style={{
                marginLeft: index === 0 ? 0 : -16,
                zIndex: selectedAvatars.length - index,
              }}
            />
          ))}
        </div>
        <Search
          placeholder="Search by name or email"
          onChange={e => setSearchTerm(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <List
          dataSource={filteredData}
          style={{ maxHeight: '400px', overflowY: 'auto' }}
          renderItem={item => (
            <List.Item>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Checkbox
                  value={item.userId}
                  checked={selectedIds.includes(item.userId)}
                  onChange={() => handleSelect(item.userId, item.avatarUrl)}
                  style={{ marginRight: 16 }}
                />
                <Avatar src={item.avatarUrl ? item.avatarUrl : ''} style={{ marginRight: 16 }} />
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