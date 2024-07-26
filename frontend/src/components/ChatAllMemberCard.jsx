import React, { useState, useEffect } from 'react';
import { Modal, Avatar, List, Input } from 'antd';

import '../assets/scss/AssignRoleModal.css';
import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';

const { Search } = Input;

const ChatAllMemberCard = ({ visible, onOk, onCancel, refreshData, channelId, cardType }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // student list
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvatars, setSelectedAvatars] = useState([]);

  useEffect(() => {
    loadStudentData();
    setSelectedAvatars([]);
  }, []);

  useEffect(() => {
    const filtered = data.filter(item =>
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const loadStudentData = async () => {
    const response = await apiCall('GET', `v1/message/${channelId}/users/detail`, null, token, true);
    console.log("response:",response);
    console.log("channelId:",channelId);
    if (!response) {
      setData([]);
      setFilteredData([]);
    } else if (response.error) {
      setData([]);
      setFilteredData([]);
    } else {
      // const res = Array.isArray(response.users) ? response : [];
      setData(response.users);
      setFilteredData(response.users);
      // console.log("data:",data);
    }
  }
  const handleCancel = () => {
    onCancel();
  }

  return (
    <>
      <Modal
        title="Members"
        visible={visible}
        footer={null}
        onCancel={handleCancel}
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

export default ChatAllMemberCard;