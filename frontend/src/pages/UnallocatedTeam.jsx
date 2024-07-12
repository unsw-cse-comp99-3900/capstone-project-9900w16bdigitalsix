import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import { SearchOutlined } from '@ant-design/icons';
import { Button, List, Input, Avatar } from 'antd';
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container } from "reactstrap";
import axios from 'axios';
import '../assets/scss/FullLayout.css'; // Make sure to import this file
import { width } from '@mui/system';

const FullLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  let [data, setData] = useState([]);
  const seachRef = useRef();
  const mountedRef = useRef(false);

  const loadMoreData = async () => {
    if (loading) return;
    setLoading(true);
    const url = 'v1/team/get/list';
    const params = {
      name: 1,
    };
    if (seachRef.current.input.value)
      params.name = seachRef.current.input.value;

    axios
      .get('http://110.141.48.210:3000/mock/13/v1/team/profile/:userId', {
        params,
      })
      .then((response) => {
        const res = response.data;
        console.log(res);
        setData([...res]);
        setLoading(false);
      })
      .catch((error) => {
        setData([]);
        setLoading(false);
        console.error('Error fetching data:', error);
      });
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      console.log('...token..');
      loadMoreData();
    }
  }, [mountedRef]);

  const seachList = () => {
    // The code for the search function can be put here
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
            {/* Component content start */}
            <>
            <div className="seach" style={{width: '100%', display: 'flex', justifyContent: 'flex-start'}}>
              <div style={{width: '88%'}}>
              <Input
                ref={seachRef}
                size="large"
                placeholder="Seach Team"
                prefix={<SearchOutlined />}
              />
              </div>
              <div
                style={{ marginLeft: '15px', cursor: 'pointer' }}
                onClick={seachList}
              >
                Filter
              </div>
            </div>
            <div
              id="scrollableDiv"
              style={{
                maxHeight: 550,
                overflow: 'auto',
                padding: '0 16px',
                width: '88%',
                border: '1px solid rgba(140, 140, 140, 0.35)',
                background: '#fff',
              }}
            >
              <List
                loading={loading}
                dataSource={data}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={'https://randomuser.me/api/portraits/women/28.jpg'}
                        />
                      }
                      title={<a>{item.userName}</a>}
                      description={item.email}
                    />
                  </List.Item>
                )}
              />
            </div>
            </>
            {/* End of component content */}
          </Container>
        </div>
      </div>
    </main>
  );
};

export default FullLayout;
