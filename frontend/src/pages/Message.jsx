import React, { useEffect, useRef, useState } from 'react';
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
import { Button as MUIButton } from '@mui/material';
import { Button, Flex, List, Input, Modal, Avatar } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Outlet, useActionData } from "react-router-dom";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container, Card, CardText, CardTitle } from "reactstrap";
import IconButton from '@mui/material/IconButton';
import ShareIcon from '@mui/icons-material/Share';
import GroupIcon from '@mui/icons-material/Group';

import '../assets/scss/FullLayout.css';//make sure import this
import '../assets/scss/Message.css'
import PersonalCard from '../components/PersonalCard';
import ChatAllMemberCard from '../components/ChatAllMemberCard';
import ChatPersonalCard from '../components/ChatPersonalCard';
import MessageText from '../components/MessageText';
import MessageCard from '../components/MessageCard';
import apiCall from '../helper';
import AllChannelsModal from '../components/AllChannelModal';
import MessageAlert from '../components/MessageAlert';

const Message = () => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  
  // record channelId
  const [channelId, setChannelId] = useState(null);
  const [channelType, setChannelType] = useState(null);
  // all channel modal
  const [isAllChannelVisible, setAllChannelVisible] = useState(false);
  const [allChannelData, setAllChannelData] = useState([]);

  // channel Message
  const [messages, setMessages] = useState([]);

  // personal card modal
  const [isPersonalCardVisible, setIsPersonalCardVisible] = useState(false);
  // new chat select person card modal
  const [isChatPersonalCardVisible, setIsChatPersonalCardVisible] = useState(false);
  // show all members in channel ChatAllMemberCard
  const [isChatAllMemberCardVisible, setIsChatAllMemberCardVisible] = useState(false);
  // edit channel name
  const [isEditing, setIsEditing] = useState(false);
  const [channelName, setChannelName] = useState('');
  // decide which function we use when we open the select person card
  const [cardType, setCardType] = useState(null);
  // alert message
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');

  // for sharing personal card modal
  const handlePersonalCardOk = () => {
    setIsPersonalCardVisible(false);
  }

  const handlePersonalCardCancel = () => {
    setIsPersonalCardVisible(false);
  }

  // for chat select modal
  const handleChatPersonalCardOk = () => {
    setIsChatPersonalCardVisible(false);
  }
  const handleChatPersonalCardCancel = () => {
    setIsChatPersonalCardVisible(false);
  }

  // for show all members ChatAllMemberCard 
  const handleChatAllMemberCardOk = () => {
    setIsChatAllMemberCardVisible(false);
  }
  const handleChatAllMemberCardCancel = () => {
    setIsChatAllMemberCardVisible(false);
  }

  // for channel name edit
  const handleEditClick = () => {
    setIsEditing(true);
  };
  const handleInputChange = (e) => {
    setChannelName(e.target.value);
  };
  const handleInputBlur = async () => {
    setIsEditing(false);
    const requestBody = {
      ChannelName: channelName,
      channelId: parseInt(channelId, 10),
    };

    try {
      const response = await apiCall('POST', 'v1/message/update/channelName', requestBody, token, true);
      console.log(response);

      if (response && !response.error) {
        setSnackbarContent('Channel name updated successfully');
        setAlertType('success');
        setAlertOpen(true);
      } else {
        const errorMsg = response.error || 'Failed to update channel name';
        console.error(errorMsg);
        setAlertType('error');
        setAlertOpen(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbarContent('An unexpected error occurred');
      setAlertType('error');
      setAlertOpen(true);
    }
  };

  // for create new channel
  const handleNewChannelClick = () => {
    setCardType('newChannel');
    setIsChatPersonalCardVisible(true);
  };
  
  // for invite new member to channel
  const handleInviteClick = () => {
    setCardType('invite');
    setIsChatPersonalCardVisible(true);
  };

  // for view all member ChatAllMemberCard
  const handleMemberClick = () => {
    setIsChatAllMemberCardVisible(true);
  };

  // fetch channel list
  const loadChannelData = async() => {
    const response = await apiCall('GET', 'v1/message/get/all/channels', null, token, true);
      if (!response) {
        setAllChannelData([]);
      } else if (response.error) {
        setAllChannelData([]);
      } else {
        setAllChannelData(response.channels);
      }
  }

  // Handle all channel button click
  const handleAllChannelButtonClick = () => {
    loadChannelData();
    setAllChannelVisible(true);
  };
  const handleAllChannelOk = () => {
    setAllChannelVisible(false);
  }
  const handleAllChannelCancel = () => {
    setAllChannelVisible(false);
  }

  // fetch all messages in the selected channel
  useEffect(() => {
    fetchMessages();
  }, [channelId]);

  const fetchMessages = async() => {
    const response = await apiCall('GET', `v1/message/channel/${channelId}/messages`, null, token, true);
      if (!response) {
        setMessages([]);
      } else if (response.error) {
        setMessages([]);
      } else {
        setMessages(response.messages);
      }
  }

  // Handle leave channel
  const handleLeaveChannel = async () => {
    const requestBody = {
      channelId: parseInt(channelId),
      userId: parseInt(userId),
    };
    console.log("requestBody:",requestBody);
    const response = await apiCall('DELETE', 'v1/message/leave/channel', requestBody, token, true);
    console.log("response:",response);

    if (response && !response.error) {
      setSnackbarContent('Left channel successfully');
      setAlertType('success');
      setAlertOpen(true);
    } else {
      setSnackbarContent('Failed to leave channel');
      setAlertType('error');
      setAlertOpen(true);
      console.log("response.error:",response.error);
    }
  };

  // Message alert
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  return (
    <main>
      <div className="pageWrapper d-lg-flex">
        {/********Sidebar**********/}
        <aside className="sidebarArea shadow" id="sidebarArea">
          <Sidebar />
        </aside>
        {/********Content Area**********/}
        <div className="contentArea">
          <div className="d-lg-none headerMd">
            {/********Header**********/}
            <Header />
          </div>
          <div className="d-none d-lg-block headerLg">
            {/********Header**********/}
            <Header />
          </div>
          {/********Middle Content**********/}
          <Container className="p-4 wrapper" fluid>
            {/* add code here */}
            
            <Card id="scrollableDiv2">
            <div className="topContainer">
              <div>
                <Button
                  type="primary" 
                  className="list-item-button"
                  style={{marginLeft: '18px'}}
                  onClick={handleAllChannelButtonClick}
                >
                  All Channel
                </Button>
              </div>

              <Button
                type="primary" 
                className="list-item-button"
                style={{marginLeft: '18px'}}
                onClick={handleNewChannelClick}
              >
                +  New Channel
              </Button>
            </div>
            {channelId ? (
              <>
              <Card id="scrollableDiv2">
                {/* Channel name. When it's group chat, show invite & leave button*/}
                <CardTitle>
                  <div className="channel-title">
                  {isEditing ? (
                      <Input
                        value={channelName}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        autoFocus
                      />
                    ) : (
                      <p>
                        <strong>{channelName}</strong>
                        <EditOutlined className="edit-icon" onClick={handleEditClick} />
                      </p>
                    )}
                    <div className="buttons">
                      <IconButton 
                        className="group-icon-button"
                        onClick={handleMemberClick}
                      >
                        <GroupIcon />
                      </IconButton>
                    {channelType !== 1 && (
                      <div className="buttons">
                        
                        <Button 
                          className="invite-button"
                          onClick={handleInviteClick}
                        >
                          + Invite
                        </Button>
                        <Button 
                          className="leave-button"
                          onClick={handleLeaveChannel}
                        >
                          Leave
                        </Button>
                      </div>
                    )}
                    </div>
                  </div>
                </CardTitle>
                {/* message text or card*/}
                <List
                  dataSource={messages}
                  style={{ maxHeight: '400px', overflowY: 'auto' }}
                  renderItem={item => (
                    <List.Item>
                      {item.messageType === 1 ? <MessageText message={item}></MessageText>
                      : <MessageCard message={item}></MessageCard>
                      }  
                    </List.Item>
                  )}
                />
              </Card>
              <div className="text-muted d-flex justify-content-start align-items-center pe-3 pt-3 mt-2">
                <img
                  src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
                  alt="avatar 3"
                  style={{ width: "40px", height: "100%" }}
                />
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="exampleFormControlInput2"
                  placeholder="Type message"
                />
                <a className="ms-1 text-muted" href="#!">
                  <MDBIcon fas icon="paperclip" />
                </a>
                <a className="ms-3 text-muted" href="#!">
                  <MDBIcon fas icon="smile" />
                </a>
                <a className="ms-3" href="#!">
                  <MDBIcon fas icon="paper-plane" />
                </a>
                <IconButton
                  className="circle-buttonshare"
                  onClick={() => setIsPersonalCardVisible(true)}
                >
                  <ShareIcon />
                </IconButton>
              </div>
            </>
            ) : (
              <h1 style={{display: 'flex', justifyContent: 'center', alignItems: 'center', margin:'100px'}}>
                Please select a channel
              </h1>
            )}
            </Card>
          </Container>
        </div>
      </div>

      {/* share personal card */}
      <PersonalCard
        visible={isPersonalCardVisible}
        onOk={handlePersonalCardOk}
        onCancel={handlePersonalCardCancel}
        // refreshData={loadMessageData} // update function
      >

      </PersonalCard>

      {/* chat selection personal card */}
      <ChatPersonalCard
        visible={isChatPersonalCardVisible}
        onOk={handleChatPersonalCardOk}
        onCancel={handleChatPersonalCardCancel}
        // refreshData={loadMessageData} // update function
        channelId={channelId}
        cardType={cardType}
      >
      </ChatPersonalCard>

      {/* show all member in channel card */}
      <ChatAllMemberCard
        visible={isChatAllMemberCardVisible}
        onOk={handleChatAllMemberCardOk}
        onCancel={handleChatAllMemberCardCancel}
        // refreshData={loadMessageData} // update function
        channelId={channelId}
        cardType={cardType}
        >
      </ChatAllMemberCard>

      {/* show all channels */}
      <AllChannelsModal
        visible={isAllChannelVisible}
        onOk={handleAllChannelOk}
        onCancel={handleAllChannelCancel}
        // refreshData={loadMessageData} // update function
        channelId={channelId}
        setChannelId={setChannelId}
        channelType={channelType}
        setChannelType={setChannelType}
        channelName={channelName}
        setChannelName={setChannelName}
        data={allChannelData}
      >
      </AllChannelsModal>

      <MessageAlert
                open={alertOpen}
                alertType={alertType}
                handleClose={handleAlertClose}
                snackbarContent={snackbarContent}
            />
    </main>
  );
};

export default Message;
