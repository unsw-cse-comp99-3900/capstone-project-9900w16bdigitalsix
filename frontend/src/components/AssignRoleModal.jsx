import React, { useState } from 'react';
import { Modal, Select, Avatar, Button, message } from 'antd';

import '../assets/scss/AssignRoleModal.css';
import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';

const { Option } = Select;

const AssignRoleModal = ({ visible, user, onOk, onCancel, refreshData }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');

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
          </div>
        </div>
        <div className="modal-body">
          <p className="assign-role-text"><strong>Assign role to {user?.userName}</strong></p>
          <Select
            className="role-select"
            placeholder="Select a role"
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
