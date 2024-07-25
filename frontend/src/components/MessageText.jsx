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

const MessageText = ({ content }) => {
  return (
    <>
      {/* message template */}
      <li className="d-flex align-items-center mb-4">
        <Avatar src={''} size={48} className="avatar" />
        <MDBCard style={{ flexGrow: 1 }}>
          <MDBCardHeader className="d-flex justify-content-between p-3">
            <p className="fw-bold mb-0">Brad Pitt</p>
            <p className="text-muted small mb-0">
              <MDBIcon far icon="clock" /> 12 mins ago
            </p>
          </MDBCardHeader>
          <MDBCardBody>
            <p className="mb-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
              do eiusmod tempor incididunt ut labore et dolore magna
              aliqua.
            </p>
          </MDBCardBody>
        </MDBCard>
      </li>
    </>
  );
};

export default MessageText;
