import React, { useEffect, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { List, Input, Modal, Checkbox, message } from 'antd';
import { apiCall } from '../../../helper';
export default function InviteModel({ isModalOpen, handleClose }) {
  const [messageApi] = message.useMessage();
  const [loading, setLoading] = useState(false);
  let [data, setData] = useState([]);
  const seachRef = useRef();
  const mountedRef = useRef(false);
  const loadMoreData = async () => {
    if (loading) return;
    setLoading(true);
    const url = 'v1/user/student/list';
    const response = await apiCall('GET', url);
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
  };
  useEffect(() => {
    if (!mountedRef.current) {
      console.log(12121212);
      mountedRef.current = true;
      loadMoreData();
    }
  }, [mountedRef]);
  const seachList = () => {
    console.log(seachRef.current.input.value);
    setData([]);
    loadMoreData();
  };

  //   const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkedList, setCheckedList] = useState([]);
  const handleOk = async () => {
    console.log(checkedList);
    if (checkedList.length > 0) {
      const url = `v1/team/invite/${checkedList}/${localStorage.getItem(
        'teamId'
      )}`;
      const response = await apiCall('GET', url);
      console.log(response)
      if (response.error) {
        message.error(response.error)
      } else {
        messageApi.success('success');
        setCheckedList([]);
        handleClose();
      }
    } else {
      message.warning('warning');
    }
  };

  const handleCancel = () => {
    setCheckedList([]);
    handleClose();
  };

  const handleCheckboxChange = (id, e) => {
    const checked = [...checkedList];
    if (e.target.checked) {
      checked.push(id);
    } else {
      const i = checked.indexOf(id);
      if (i > -1) {
        checked.splice(i, 1);
      }
    }
    setCheckedList(checked);
  };
  return (
    <>
      <Modal
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
                    checked={checkedList.includes(item.userId)}
                    key={index}
                    onChange={(e) => handleCheckboxChange(item.userId, e)}
                  />,
                ]}
              >
                <List.Item.Meta
                  title={<a>{item.userName}</a>}
                  description={item.email}
                />
              </List.Item>
            )}
          />
        </div>
      </Modal>
    </>
  );
}