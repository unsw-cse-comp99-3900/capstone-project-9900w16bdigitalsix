import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import { SearchOutlined } from '@ant-design/icons';
import { Input, Col, Row } from 'antd';
import { Card, CardBody, CardTitle, CardText, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Container } from "reactstrap";
import axios from 'axios';
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import '../assets/scss/FullLayout.css'; // Make sure to import this file
import '../assets/scss/CustomCard.css'; // import CSS file
import '../styles/project.css';
import { apiCall } from '../helper'; // Make sure to import this file
import CustomCard from '../components/CustomCard';

const { Meta } = Card;

const FullLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState(true);
  let [data, setData] = useState([]);
  const seachRef = useRef();
  const mountedRef = useRef(false);
  const role = localStorage.getItem('role');

  const loadMoreData = async (url = 'v1/project/get/public_project/list') => {
    const response = await apiCall('GET', url, null, null, null);
    console.log('....list....', response);
    if (!response) {
      setData([]);
    } else if (response.error) {
      setData([]);
    } else {
      const res = response;
      console.log(res);
      setData(res);
    }
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      console.log('...token..');
      loadMoreData();
    }
  }, [mountedRef]);

  const seachList = () => {
    const searchTerm = seachRef.current.input.value.toLowerCase();
    console.log(searchTerm);
    if (searchTerm) {
      const url = `v1/search/public/project/${searchTerm}`
      loadMoreData(url)
    } else {
      console.log(888)
      loadMoreData();
    }
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
            {/* Project Component content start */}
            <div className="seach">
              <Input
                ref={seachRef}
                size="large"
                placeholder="Seach Projects"
                prefix={<SearchOutlined />}
              />
              <div
                style={{ marginLeft: '15px', cursor: 'pointer' }}
                onClick={seachList}
              >
                Filter
              </div>
            </div>
            <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
              {data.map((project, index) => (
                <Col xs={24} sm={16} md={8} span={8} key={index}>
                    <CustomCard
                      id={project.projectId}
                      title={project.title}
                      client={project.clientName}
                      clientTitle={project.clientEmail}
                      skills={project.requiredSkills}
                      clientAvatar={project.clientAvatarURL}
                      field={project.field}
                      role={role}
                    />
                </Col>
              ))}
            </Row>
            {/* Project Component content end */}
          </Container>
        </div>
      </div>
    </main>
  );
};

export default FullLayout;
