import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { List, Input, Modal, Checkbox, message } from "antd";
import { apiCall } from "../helper";

export default function InviteModel({
  isModalOpen,
  handleClose,
  isInvite,
  setIsInvite,
}) {
  const [messageApi] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const seachRef = useRef();
  const mountedRef = useRef(false);
  const loadMoreData = async () => {
    if (loading) return;
    setLoading(true);
    const url = "v1/user/student/list";
    const response = await apiCall("GET", url);
    console.log("....list....", response);
    if (!response || response.error) {
      setData([]);
      setLoading(false);
    } else {
      const res = response;
      setData([...res]);
      setLoading(false);
      setAllData([...res]);
      console.log("allData", [...res])
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
    const seachTerm = seachRef.current.input.value.toLowerCase(); 
    console.log(seachTerm);

    if (seachTerm) {
        let filtered = allData.filter((item) =>
            [item.userName, item.email, String(item.userId)].some((field) => {
                console.log("field", field);
                if (field) {
                    return field.toLowerCase().includes(seachTerm);
                }
                return false; 
            })
        );
        console.log(filtered);
        setData(filtered);
    } else {
        console.log(data);
        // setData(data);
        loadMoreData();
    }
  };

  //   const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkedList, setCheckedList] = useState([]);
  const handleOk = async () => {
    console.log(checkedList);
    if (checkedList.length > 0) {
      const url = `v1/team/invite/${checkedList}/${localStorage.getItem(
        "teamId"
      )}`;
      const response = await apiCall("GET", url);
      console.log(response);
      if (response.error) {
        message.error(response.error);
      } else {
        messageApi.success("success");
        setCheckedList([]);
        setIsInvite(!isInvite);
        handleClose();
      }
    } else {
      message.warning("warning");
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
            style={{ marginLeft: "15px", cursor: "pointer" }}
            onClick={seachList}
          >
            Filter
          </div>
        </div>
        <div
          id="scrollableDiv"
          style={{
            maxHeight: 550,
            overflow: "auto",
            padding: "0 16px",
            border: "1px solid rgba(140, 140, 140, 0.35)",
            background: "#fff",
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