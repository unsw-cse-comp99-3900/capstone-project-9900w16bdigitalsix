import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardTitle, CardText, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const CustomCard = ({ id, title, client, clientTitle, skills = [], field, description, onDelete }) => {
  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/v1/project/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onDelete(id); // 调用父组件传递的删除回调函数
        toggle(); // 关闭模态框
      } else {
        console.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <>
      <Card className="mb-4 shadow-sm">
        <div style={{ height: '150px', backgroundColor: '#D8BFD8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h5 className="text-white">{title}</h5>
        </div>
        <CardBody>
          <div className="d-flex align-items-center mb-3">
            <div style={{ width: '40px', height: '40px', backgroundColor: '#D8BFD8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
              <span style={{ color: 'white', fontSize: '20px' }}>{client[0]}</span>
            </div>
            <div>
              <CardTitle tag="h5">{client}</CardTitle>
              <CardText className="text-muted">{clientTitle}</CardText>
            </div>
          </div>
          <CardText>{description}</CardText>
          <div className="mb-3">
            {Array.isArray(skills) && skills.map(skill => (
              <span key={skill} style={{ backgroundColor: '#f0f0f0', padding: '5px 10px', borderRadius: '15px', marginRight: '5px', display: 'inline-block', fontSize: '12px' }}>
                {skill}
              </span>
            ))}
          </div>
          <CardText className="text-muted">{field}</CardText>
          <div className="d-flex justify-content-between">
            <i className="bi bi-file-earmark"></i>
            <Link to={`/project/edit/${id}`}>
              <i className="bi bi-pencil"></i>
            </Link>
            <i className="bi bi-person"></i>
            <i className="bi bi-trash" onClick={toggle} style={{ color: 'red', cursor: 'pointer' }}></i>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Confirm Delete</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this project?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDelete}>Delete</Button>
          <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CustomCard;
