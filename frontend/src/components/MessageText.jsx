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

const MessageText = ({ message }) => {
  const messageTime = new Date(message.messageTime).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: true,
  });

  return (
    <>
      {/* message template */}
      <li className="d-flex align-items-center">
        <Avatar src={message.avatarUrl ?  message.avatarUrl : message.senderName[0]} size={48} className="avatar" />
        <MDBCard style={{ flexGrow: 1 }}>
          <MDBCardHeader className="d-flex justify-content-between">
            <p className="fw-bold mb-0">{message.senderName}</p>
            <p className="text-muted small mb-0">
              <MDBIcon far icon="clock" /> {messageTime}
            </p>
          </MDBCardHeader>
          <MDBCardBody style={{ minWidth: '350px' }}>
            <p className="mb-0">
              {message.messageContent.content}
            </p>
          </MDBCardBody>
        </MDBCard>
      </li>
    </>
  );
};

export default MessageText;
