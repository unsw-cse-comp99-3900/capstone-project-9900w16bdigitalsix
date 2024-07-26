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
import '../assets/scss/FullLayout.css';//make sure import this
import '../assets/scss/Message.css'
import PersonalCard from '../components/PersonalCard';
import ChatPersonalCard from '../components/ChatPersonalCard';
import MessageText from '../components/MessageText';
import MessageCard from '../components/MessageCard';
import apiCall from '../helper';
import AllChannelsModal from '../components/AllChannelModal';

const Message = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  // record channelId
  const [channelId, setChannelId] = useState(null);
  // all channel dropdown
  const [isAllChannelVisible, setAllChannelVisible] = useState(false);

  // personal card modal
  const [isPersonalCardVisible, setIsPersonalCardVisible] = useState(false);
  // new chat select person card modal
  const [isChatPersonalCardVisible, setIsChatPersonalCardVisible] = useState(false);
  // edit channel name
  const [isEditing, setIsEditing] = useState(false);
  const [channelName, setChannelName] = useState('Channel Name');
  // decide which function we use when we open the select person card
  const [cardType, setCardType] = useState(null);

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

  // for channel name edit
  const handleEditClick = () => {
    setIsEditing(true);
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

  const handleInputChange = (e) => {
    setChannelName(e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
  };

  // Handle all channel button click
  const handleAllChannelButtonClick = () => {
    setAllChannelVisible(true);
  };
  const handleAllChannelOk = () => {
    setAllChannelVisible(false);
  }
  const handleAllChannelCancel = () => {
    setAllChannelVisible(false);
  }

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
                      <Button 
                        className="invite-button"
                        onClick={handleInviteClick}
                        >
                          + Invite</Button>
                      <Button className="leave-button">Leave</Button>
                    </div>
                  </div>
                </CardTitle>
                {/* message template */}
                <MessageText></MessageText>
                {/* personal card template */}
                <MessageCard></MessageCard>
                <List
                  loading={loading}
                  dataSource={filteredData}
                  renderItem={(item) => (
                    <List.Item className="list-item" key={item.userId}>
                      <List.Item.Meta style={{paddingLeft: "8px"}}

                        title={
                          <div className="list-item-meta-title">
                            <span className="list-item-meta-name" style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.title}</span>
                          </div>
                        }
                        description={
                          <div className="list-item-meta-description">
                            <div className="list-item-meta-id">Client: {item.clientName}</div>
                            <div className="list-item-meta-email">Client Email: {item.clientEmail}</div>
                            <div className="list-item-meta-field">Field: {item.field}</div>
                          </div>
                        }
                      />
                      <Button type="primary" className="list-item-button">Assign</Button>
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

      {/* show all channels */}
      <AllChannelsModal
        visible={isAllChannelVisible}
        onOk={handleAllChannelOk}
        onCancel={handleAllChannelCancel}
        // refreshData={loadMessageData} // update function
        channelId={channelId}
        setChannelId={setChannelId}
      >

      </AllChannelsModal>
    </main>
  );
};

export default Message;
