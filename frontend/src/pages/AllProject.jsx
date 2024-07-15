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
import '../assets/scss/CustomCard.css'; // 引入CSS文件
import '../styles/project.css';
import { apiCall } from '../helper'; // Make sure to import this file
const { Meta } = Card;

const FullLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState(true);
  let [data, setData] = useState([]);
  const seachRef = useRef();
  const mountedRef = useRef(false);

  const loadMoreData = async (url = 'v1/project/get/public_project/list') => {
    // const url = 'v1/project/get/public_project/list';
    const response = await apiCall('GET', url, null, null, null);
    console.log('....list....', response);
    if (response.error) {
      setData([]);
    } else {
      const res = response;
      console.log(res);
      setData([...res]);
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
    // if (searchTerm) {
    //   let filtered;
    //   if (team) {
    //     filtered = data.filter((item) =>
    //       [item.userName, String(item.userId)].some((field) =>
    //         field.toLowerCase().includes(searchTerm)
    //       )
    //     );
    //   } else {
    //     filtered = data.filter((item) =>
    //       [
    //         item.userName,
    //         item.email,
    //         String(item.userId),
    //         item.userSkills,
    //       ].some((field) => field && field.toLowerCase().includes(searchTerm))
    //     );
    //   }
    //   console.log(filtered);
    //   setData(filtered);
    // } else {
    //   console.log(data);
    //   loadMoreData();
    // }
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
              {data.map((item, index) => (
                <Col xs={24} sm={16} md={8} span={8} key={index}>
                   <Card className="mb-4 custom-card">
        <div className="custom-card-header">
          <h5 className="custom-card-title">{item.title}</h5>
        </div>
        <CardBody className="d-flex flex-column custom-card-body">
          <div className="d-flex align-items-center mb-3">
            <div className="avatar">
              <span>{ item.clientName[0] }</span>
            </div>
            <div className="client-info">
              <CardTitle tag="h5" className="client-name">{ item.clientName }</CardTitle>
              <CardText className="client-title">{item.clientEmail}</CardText>
            </div>
          </div>
          <div className="skills-container">
            {Array.isArray(item.requiredSkills) && item.requiredSkills.map(skill => (
              <span key={skill} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
          <div className="field-container">
            <span className="field-badge">{ item.field }</span>
          </div>
          {/* <div className="mt-auto d-flex justify-content-between">
            <i className="bi bi-file-earmark"></i>
            <Link to={`/project/edit/${id}`}>
              <i className="bi bi-pencil"></i>
            </Link>
            <i className="bi bi-person"></i>
            <i className="bi bi-trash" onClick={toggle} style={{ color: 'red', cursor: 'pointer' }}></i>
          </div> */}
        </CardBody>
      </Card>
                  {/* <Card
                    style={{ width: 300 }}
                    cover={
                      <div
                        style={{
                          background: '#D8BFD8',
                          borderTopLeftRadius: '5px',
                          borderTopRightRadius: '5px',
                          height: '150px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '550',
                          fontSize: '20px',
                        }}
                      >
                        {item.title}
                      </div>
                    }
                  >
                    <Meta
                      avatar={
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#D8BFD8',
                          }}
                        ></div>
                      }
                      title={
                        <>
                          {item.clientName}
                          <br />
                          <div style={{ color: '#ababab', fontSize: '12px' }}>
                            {item.clientEmail}
                          </div>
                        </>
                      }
                      description={
                        <>
                          <div style={{ marginBottom: '10px' }}>
                            {Array.isArray(item.requiredSkills) &&
                              item.requiredSkills.map((skill, skillIndex) => (
                                <Tag color="default" key={skillIndex}>
                                  {skill}
                                </Tag>
                              ))}
                          </div>
                          {item.field}
                        </>
                      }
                    />
                  </Card> */}
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
