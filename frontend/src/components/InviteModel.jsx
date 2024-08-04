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

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const loadMoreData = async () => {
    if (loading) return;
    setLoading(true);
    const url = `v1/user/same/course/student/list/${userId}`;
    const response = await apiCall("GET", url, null, token, null);
    if (!response || response.error) {
      setData([]);
      setLoading(false);
    } else {
      const res = response;
      setData([...res]);
      setLoading(false);
      setAllData([...res]);
    }
  };
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      loadMoreData();
    }
  }, [mountedRef]);
  const seachList = () => {
    const seachTerm = seachRef.current.input.value.toLowerCase();

    if (seachTerm) {
      let filtered = allData.filter((item) =>
        [item.userName, item.email, String(item.userId)].some((field) => {
          if (field) {
            return field.toLowerCase().includes(seachTerm);
          }
          return false;
        })
      );
      setData(filtered);
    } else {
      loadMoreData();
    }
  };

  const [checkedList, setCheckedList] = useState([]);
  const handleOk = async () => {
    if (checkedList.length > 0) {
      const teamId = localStorage.getItem("teamId");
      const promises = checkedList.map(async (id) => {
        const url = `v1/team/invite/${id}/${teamId}`;
        return await apiCall("GET", url);
      });
      const responses = await Promise.all(promises);
      const errors = responses.filter((response) => response.error);
      if (errors.length > 0) {
        errors.forEach((error) => message.error(error.error));
      } else {
        messageApi.success("success");
        setCheckedList([]);
        setIsInvite(!isInvite);
        handleClose();
      }
    } else {
      message.warning("Please select at least one user to invite");
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
                  description={
                    <>
                      <div>
                        <strong>Email:</strong> {item.email}
                      </div>
                      <div>
                        <strong>Course:</strong> {item.course}
                      </div>
                      <div>
                        <strong>Skills:</strong> {item.userSkills}
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </Modal>
    </>
  );
}
