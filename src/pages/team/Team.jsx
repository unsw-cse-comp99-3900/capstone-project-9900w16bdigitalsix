import React, { useEffect, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Flex, List, Input } from 'antd';
import './team.css';
import { useNavigate } from 'react-router-dom';
import InviteModel from './components/InviteModel';
import { apiCall } from '../../helper';
export default function Team() {
  const navigate = useNavigate();
  const [team, setTeam] = useState(true);
  const [loading, setLoading] = useState(false);
  const mounting = useRef(true);
  let [data, setData] = useState([]);
  const seachRef = useRef();
  const mountedRef = useRef(false);
  const loadMoreData = async () => {
    if (loading) return;
    setLoading(true);
    const url = 'v1/team/get/list';
    const studentUrl = 'v1/user/student/list';
    const params = {};
    if (seachRef.current.input.value)
      params.name = seachRef.current.input.value;
    const response = await apiCall('GET', team ? url : studentUrl, params);
    console.log('....list....', response);
    if (response.error) {
      setData([]);
      setLoading(false);
    } else {
      const res = response;
      console.log(res);
      setData([...res]);
      setLoading(false);
    }
    // axios
    //   .get(team ? url : studentUrl, { params, headers })
    //   .then((response) => {
    //     const res = response.data;
    //     console.log(res);
    //     setData([...res]);
    //     setLoading(false);
    //   })
    //   .catch((error) => {
    //     setData([]);
    //     setLoading(false);
    //     console.error('Error fetching data:', error);
    //   });
  };
  useEffect(() => {
    if (mounting.current) {
      mounting.current = false;
    } else {
      loadMoreData();
    }
  }, [team]);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      console.log('...token..');
      // if (!localStorage.getItem('token')) {
      //   navigate('/login');
      //   return;
      // }
      loadMoreData();
    }
  }, [mountedRef]);
  const changeList = () => {
    setData([]);
    setTeam(!team);
  };
  const seachList = () => {
    if (seachRef.current.input.value) {
      setData([]);
      loadMoreData();
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleClose = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <div className="titleBtn">
        <Flex gap="small" wrap>
          <Button
            style={{ backgroundColor: '#6451e9', borderColor: '#6451e9' }}
            type="primary"
            shape="round"
            onClick={changeList}
          >
            {team ? 'STUDENT LIST' : 'TEAM LIST'}
          </Button>
        </Flex>
      </div>
      <div className="seach">
        <Input
          ref={seachRef}
          size="large"
          placeholder="Seach Team"
          prefix={<SearchOutlined />}
        />
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
          border: '1px solid rgba(140, 140, 140, 0.35)',
          background: '#fff',
        }}
      >
        {team ? (
          <List
            loading={loading}
            dataSource={data}
            renderItem={(item) => (
              <List.Item key={item.teamId}>
                <List.Item.Meta
                  title={<a>{item.teamName}</a>}
                />
              </List.Item>
            )}
          />
        ) : (
          <List
            loading={loading}
            dataSource={data}
            grid={{
              gutter: 16,
              column: 2,
            }}
            renderItem={(item) => (
              <List.Item key={item.userId}>
                <List.Item.Meta
                  title={<a>{item.userName}</a>}
                  description={item.email}
                />
              </List.Item>
            )}
          />
        )}
      </div>
      <Button type="primary" onClick={showModal}>
        Invite
      </Button>
      <InviteModel
        isModalOpen={isModalOpen}
        handleClose={handleClose}
      ></InviteModel>
      {/* <Modal
        title=""
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div className="seach">
          <Input
            ref={seachRef}
            size="large"
            placeholder="Seach"
            prefix={<SearchOutlined />}
          />
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
            border: '1px solid rgba(140, 140, 140, 0.35)',
            background: '#fff',
          }}
        >
          <List
            loading={loading}
            dataSource={data}
            renderItem={(item, index) => (
              <List.Item
                key={item.id}
                actions={[
                  <Checkbox
                    checked={checkedList.includes(item.id)}
                    key={index}
                    onChange={(e) => handleCheckboxChange(item.id, e)}
                  />,
                ]}
              >
                <List.Item.Meta
                  title={<a>{item.name}</a>}
                  description={item.email}
                />
              </List.Item>
            )}
          />
        </div>
      </Modal> */}
    </>
  );
}
