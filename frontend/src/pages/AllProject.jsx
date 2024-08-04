import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Input, Button, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import "../assets/scss/FullLayout.css";
import "../assets/scss/CustomCard.css";
import "../styles/project.css";
import { apiCall } from "../helper";
import CustomCard from "../components/CustomCard";

const FullLayout = () => {
  let [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State to manage input value
  const mountedRef = useRef(false);
  const role = localStorage.getItem("role");

  // load all project list information
  const loadMoreData = async (url = "v1/project/get/public_project/list") => {
    const response = await apiCall("GET", url, null, null, null);

    if (!response) {
      setData([]);
    } else if (response.error) {
      setData([]);
    } else {
      const res = response;

      setData(res);
    }
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      loadMoreData();
    }
  }, [mountedRef]);

  // load filtered project list from backend
  const seachList = () => {
    if (searchTerm) {
      const url = `v1/search/public/project/${searchTerm.toLowerCase()}`;
      loadMoreData(url);
    } else {
      loadMoreData();
    }
  };

  // when click on "clear" button, call this function
  const handleClearSearch = () => {
    setSearchTerm("");
    loadMoreData();
  };

  return (
    <main>
      <div className="pageWrapper d-lg-flex">
        <aside className="sidebarArea shadow" id="sidebarArea">
          <Sidebar />
        </aside>
        <div className="contentArea">
          <div className="d-lg-none headerMd">
            <Header />
          </div>
          <div className="d-none d-lg-block headerLg">
            <Header />
          </div>
          <Container className="p-4 wrapper" fluid>
            <div className="seach">
              <Input
                value={searchTerm} // Bind input value to state
                onChange={(e) => setSearchTerm(e.target.value)} // Update state on input change
                size="large"
                placeholder="Search Projects"
                prefix={<SearchOutlined />}
                style={{ width: "70%", marginRight: "10px" }}
              />
              <Button
                size="large"
                type="primary"
                onClick={seachList}
                style={{ marginRight: "10px" }}
              >
                Filter
              </Button>
              <Button size="large" type="primary" onClick={handleClearSearch}>
                Clear
              </Button>
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
          </Container>
        </div>
      </div>
    </main>
  );
};

export default FullLayout;
