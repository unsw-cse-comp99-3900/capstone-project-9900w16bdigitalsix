import React from "react";
import { Select, Avatar } from "antd";
import { MDBCard, MDBCardBody, MDBIcon, MDBCardHeader } from "mdb-react-ui-kit";

import "../assets/scss/AssignRoleModal.css";

const { Option } = Select;

const MessageText = ({ message }) => {
  const messageTime = new Date(message.messageTime).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  });

  return (
    <>
      {/* message template */}
      <li className="d-flex align-items-center">
        <Avatar
          src={message.avatarUrl ? message.avatarUrl : message.senderName[0]}
          size={48}
          className="avatar"
        />
        <MDBCard style={{ flexGrow: 1 }}>
          <MDBCardHeader className="d-flex justify-content-between">
            <p className="fw-bold mb-0">{message.senderName}</p>
            <p className="text-muted small mb-0">
              <MDBIcon far icon="clock" /> {messageTime}
            </p>
          </MDBCardHeader>
          <MDBCardBody style={{ minWidth: "350px" }}>
            <p className="mb-0">{message.messageContent.content}</p>
          </MDBCardBody>
        </MDBCard>
      </li>
    </>
  );
};

export default MessageText;
