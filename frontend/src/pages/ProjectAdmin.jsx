import { Container, Card } from "reactstrap";
import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, List, Input } from "antd";
import { Button as MUIButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { apiCall } from "../helper";
import "../assets/scss/RoleManage.css";
import "../assets/scss/FullLayout.css"; //make sure import this

const ProjectAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const seachRef = useRef();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // load all project data for admin
  const loadProjectData = async () => {
    if (loading) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found in localStorage");
      setLoading(false);
      return;
    }

    const response = await apiCall("GET", "v1/project/get/public_project/list");

    if (!response) {
      setData([]);
      setFilteredData([]);
      setLoading(false);
    } else if (response.error) {
      setData([]);
      setFilteredData([]);
      setLoading(false);
    } else {
      const res = Array.isArray(response) ? response : [];
      setData(res);
      setFilteredData(res);
      setLoading(false);
    }
  };

  // get filtered project list from backend
  const handleSearchProjects = async () => {
    const searchTerm = seachRef.current.input.value.toLowerCase();
    try {
      const response = await apiCall(
        "GET",
        `v1/search/public/project/${searchTerm}`
      );
      if (!response) {
        setFilteredData([]);
        return;
      }
      if (response.error) {
        setFilteredData([]);
        return;
      } else {
        const res = Array.isArray(response) ? response : [];
        setFilteredData(res);
      }
    } catch (error) {
      return;
    }
  };

  // clear searching token
  const handleClear = () => {
    setSearchTerm("");
    loadProjectData();
  };

  // when clicking on "report" button
  const handleReport = () => {
    navigate("/project/virtual-data-report");
  };

  useEffect(() => {
    loadProjectData();
  }, []);

  const solveClickAssign = (item) => {
    navigate(`/project/admin/${item.projectId}`, { state: { item } });
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
          <Container className="p-4 wrapper" fluid>
            <div
              className="search"
              style={{ display: "flex", alignItems: "center", border: "none" }}
            >
              <Input
                ref={seachRef}
                size="large"
                placeholder="Search Project"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginRight: "10px" }}
              />
              <MUIButton
                size="small"
                type="primary"
                onClick={handleSearchProjects}
                style={{ marginRight: "10px" }}
              >
                Filter
              </MUIButton>
              <MUIButton size="small" type="primary" onClick={handleClear}>
                Clear
              </MUIButton>
              <Button
                type="primary"
                className="list-item-button"
                style={{ marginLeft: "18px" }}
                onClick={handleReport}
              >
                REPORT
              </Button>
            </div>
            <Card style={{ padding: "20px", margin: "20px" }}>
              <List
                loading={loading}
                dataSource={filteredData}
                renderItem={(item) => (
                  <List.Item className="list-item" key={item.userId}>
                    <List.Item.Meta
                      style={{ paddingLeft: "8px" }}
                      title={
                        <div className="list-item-meta-title">
                          <span
                            className="list-item-meta-name"
                            style={{ fontSize: "16px", fontWeight: "bold" }}
                          >
                            {item.title}
                          </span>
                        </div>
                      }
                      description={
                        <div className="list-item-meta-description">
                          <div className="list-item-meta-id">
                            Client: {item.clientName}
                          </div>
                          <div className="list-item-meta-email">
                            Client Email: {item.clientEmail}
                          </div>
                          <div className="list-item-meta-field">
                            Field: {item.field}
                          </div>
                        </div>
                      }
                    />
                    <Button
                      type="primary"
                      className="list-item-button"
                      onClick={() => solveClickAssign(item)}
                    >
                      Assign
                    </Button>
                  </List.Item>
                )}
              />
            </Card>
          </Container>
        </div>
      </div>
    </main>
  );
};

export default ProjectAdmin;
