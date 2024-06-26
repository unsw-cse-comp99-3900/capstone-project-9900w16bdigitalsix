import React, { useState, useEffect } from 'react';
import { Modal, Select, Avatar, Button, message } from 'antd';

import '../assets/scss/AssignRoleModal.css';
import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';

const { Option } = Select;

const roleMap = {
  1: 'Student',
  2: 'Tutor',
  3: 'Client',
  4: 'Coordinator',
  5: 'Administrator'
};

const roleColorMap = {
  1: { background: '#e0f7fa', color: '#006064' }, // blue Student
  2: { background: '#e1bee7', color: '#6a1b9a' }, // purple Tutor
  3: { background: '#fff9c4', color: '#f57f17' }, // yellow Client
  4: { background: '#ffe0b2', color: '#e65100' }, // orange Coordinator
  5: { background: '#ffcdd2', color: '#b71c1c' }  // red Administrator
};

const AssignRoleModal = ({ visible, user, onOk, onCancel, refreshData }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');

  useEffect(() => {
    if (user && user.role !== undefined) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleRoleChange = (value) => {
    setSelectedRole(parseInt(value, 10));
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      setSnackbarContent('Please select a role');
      setAlertType('error');
      setAlertOpen(true);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setSnackbarContent('Please login first');
      setAlertType('error');
      setAlertOpen(true);
      return;
    }

    const response = await apiCall('POST', 'v1/admin/modify/user/role', {
      userId: user.userId,
      role: selectedRole
    }, token, true);

    if (response.error) {
      setSnackbarContent(response.error);
      setAlertType('error');
      setAlertOpen(true);
    } else {
      setSnackbarContent('User role updated successfully');
      setAlertType('success');
      setAlertOpen(true);
      onOk();
      refreshData();
    }
  };

  return (
    <>
      <Modal
        title="Assign Role"
        visible={visible}
        onOk={handleSubmit}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>Save</Button>
        ]}
      >
        <div className="modal-content">
          <Avatar src={user?.avatar || ''} size={80} className="avatar" />
          <div className="user-details">
            <div className="user-name">{user?.userName}</div>
            <div className="user-email">{user?.email}</div>
            <div className="user-role">
              Current Role: <span className={`role-${user?.role}`}>{roleMap[user?.role]}</span>
            </div>
          </div>
        </div>
        <div className="modal-body">
          <p className="assign-role-text"><strong>Assign role to {user?.userName}</strong></p>
          <Select
            className="role-select"
            placeholder="Select a role"
            value={selectedRole !== null ? selectedRole.toString() : undefined} // 确保显示选项文字
            onChange={handleRoleChange}
          >
            <Option value="1">Student</Option>
            <Option value="2">Tutor</Option>
            <Option value="3">Client</Option>
            <Option value="4">Coordinator</Option>
            <Option value="5">Administrator</Option>
          </Select>
        </div>
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

export default AssignRoleModal;
