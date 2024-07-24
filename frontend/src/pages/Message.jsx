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
import { Outlet } from "react-router-dom";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container, Card } from "reactstrap";
import '../assets/scss/FullLayout.css';//make sure import this
import '../assets/scss/Message.css'

const Message = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
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
            <div className="search" style={{ display: 'flex', alignItems: 'center', border: 'none' }}>
              <Button
                type="primary" 
                className="list-item-button"
                style={{marginLeft: '18px'}}
              >
                REPORT
              </Button>
            </div>
            <Card id="scrollableDiv">
              <Card id="scrollableDiv">
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
              </div>
            </Card>
          </Container>
        </div>
      </div>
    </main>
  );
};

export default Message;
