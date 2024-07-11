import React, { useState, useEffect } from 'react';
import { Modal, Select, Avatar, Input, Button, message } from 'antd';

import '../assets/scss/AssignRoleModal.css';
import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';

import TextField from '@mui/material/TextField';


const roleMap = {
  1: 'Student',
  2: 'Tutor',
  3: 'Client',
  4: 'Coordinator',
  5: 'Administrator'
};

const EditUserStoryModal = ({ title, visible, defaultDes, description, setDescription, onOk, onCancel, refreshData }) => {
  const [selectedSprint, setSelectedSprint] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');

  const handleSubmit = async () => {
    if (!description) {
      setSnackbarContent('Please complete description.');
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
  };

  return (
    <>
      <Modal
        title={title}
        open={visible}
        onOk={handleSubmit}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>Save</Button>
        ]}
      >
        <div className="modal-body">
          <Input.TextArea placeholder="Description" autoSize={{ minRows: 3, maxRows: 6 }} />
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

export default EditUserStoryModal;