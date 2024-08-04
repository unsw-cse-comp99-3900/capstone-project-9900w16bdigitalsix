import React, { useState } from "react";
import { Modal, Select, List } from "antd";

import "../assets/scss/AssignRoleModal.css";
import MessageAlert from "./MessageAlert";

const { Option } = Select;

// show all the channels (private & public) for the current user
const AllChannelModal = ({
  visible,
  onOk,
  onCancel,
  refreshData,
  channelId,
  setChannelId,
  data,
  channelType,
  setChannelType,
  channelName,
  setChannelName,
}) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [snackbarContent, setSnackbarContent] = useState("");

  const userId = parseInt(localStorage.getItem("userId"));
  const token = localStorage.getItem("token");

  // select a channel
  const handleClick = (id, type, name) => {
    setChannelId(id);
    setChannelType(type);
    setChannelName(name);
    onOk();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <>
      <Modal title="Select a channel" open={visible} onCancel={handleCancel}>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {/* show the list of private channel */}
          <div>
            <strong>Private Channels</strong>
            <List
              dataSource={
                data.length > 0
                  ? data.filter((item) => parseInt(item.type) === 1)
                  : []
              }
              style={{ maxHeight: "400px", overflowY: "auto" }}
              renderItem={(item) => (
                <List.Item
                  onClick={() =>
                    handleClick(item.channelId, item.type, item.channelName)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#006064",
                        borderRadius: "50%",
                        width: "10px",
                        height: "10px",
                        marginRight: "5px",
                        marginLeft: "20px",
                      }}
                    ></div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div>{item.channelName}</div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
          {/* show the list of public channel */}
          <div>
            <strong>Group Channels</strong>
            <List
              dataSource={
                data.length > 0
                  ? data.filter((item) => parseInt(item.type) === 2)
                  : []
              }
              style={{ maxHeight: "400px", overflowY: "auto" }}
              renderItem={(item) => (
                <List.Item
                  onClick={() =>
                    handleClick(item.channelId, item.type, item.channelName)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#e65100",
                        borderRadius: "50%",
                        width: "10px",
                        height: "10px",
                        marginRight: "5px",
                        marginLeft: "20px",
                      }}
                    ></div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div>{item.channelName}</div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
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

export default AllChannelModal;
