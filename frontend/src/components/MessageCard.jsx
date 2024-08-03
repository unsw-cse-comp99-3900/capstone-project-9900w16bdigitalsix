import React, { useState, useEffect, useRef } from 'react';
import { Modal, Select, Avatar, Button, message, List, Radio, Input } from 'antd';
import { Button as MUIButton } from '@mui/material';
import { SearchOutlined } from '@ant-design/icons';

import {
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBIcon,
    MDBTypography,
    MDBInputGroup,
    MDBCardHeader,
    MDBCardFooter,
    MDBBtn,
  } from "mdb-react-ui-kit";

import '../assets/scss/AssignRoleModal.css';
import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';

const { Option } = Select;

const MessageCard = ({ message }) => {
  const messageTime = new Date(message.messageTime).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: true,
  });
  return (
    <>
      {/* personal card template */}
      <li className="d-flex align-items-center mb-4">
        <Avatar src={message.avatarUrl ?  message.avatarUrl : message.senderName[0]} size={48} className="avatar" />
        <MDBCard style={{ flexGrow: 1 }}>
          <MDBCardHeader className="d-flex justify-content-between p-3">
            <p className="fw-bold mb-0">{message.senderName}</p>
            <p className="text-muted small mb-0">
              <MDBIcon far icon="clock" /> {messageTime}
            </p>
          </MDBCardHeader>
          <MDBCardBody style={{ padding: '16px', width: '350px' }}>
            <div style={{
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              padding: '16px',
              backgroundColor: '#e0f7fa',
            }}>
              <p className="mb-2" style={{ fontStyle: 'italic', color: '#555' }}>
                Recommend you connect with this user:
              </p>
              <hr style={{ borderColor: '#e0e0e0', margin: '8px 0' }} />
              <p className="mb-1" style={{ fontWeight: 'bold' }}>
                <strong>Name:</strong> <span style={{ fontWeight: 'normal' }}>{message.messageContent.name}</span>
              </p>
              <p className="mb-0" style={{ fontWeight: 'bold' }}>
                <strong>Email:</strong> <span style={{ fontWeight: 'normal' }}>{message.messageContent.email}</span>
              </p>
            </div>
          </MDBCardBody>
        </MDBCard>
      </li>
    </>
  );
};

export default MessageCard;