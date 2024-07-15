import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody, CardTitle, CardText, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import '../assets/scss/CustomCard.css'; // import CSS file
import TeamFile from "../components/TeamFileDialog";

const CustomCard = ({ id, title, client, clientTitle, skills, field, onDelete, role }) => {
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  const navigate = useNavigate();

  const handleCardNavi = () => {
    navigate(`/project/details/${id}`);
  };
  // student preference list modal openW
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    setOpen(false);
  };



  // delete project
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/v1/project/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onDelete(id);
      } else {
        console.error('Failed to delete the project.');
      }
    } catch (error) {
      console.error('An error occurred while deleting the project:', error);
    }
  };

  return (
    <>
      <Card 
        className="mb-4 custom-card"
      >
        <div 
          className="custom-card-header"
          onClick={handleCardNavi}
          style={{ cursor: "pointer" }}
        >
          <h5 className="custom-card-title">
            {title}
          </h5>
        </div>
        <CardBody className="d-flex flex-column custom-card-body">
          <div className="d-flex align-items-center mb-3">
            <div className="avatar">
              <span>{client[0]}</span>
            </div>
            <div className="client-info">
              <CardTitle tag="h5" className="client-name">{client}</CardTitle>
              <CardText className="client-title">{clientTitle}</CardText>
            </div>
          </div>
          <div className="skills-container">
            {Array.isArray(skills) && skills.map(skill => (
              <span key={skill} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
          <div className="field-container">
            <span className="field-badge">{field}</span>
          </div>
          <div className="mt-auto d-flex justify-content-between">
          {(role === 3 || role === 4 || role === 5) && (
            // archive
            <i className="bi bi-file-earmark"></i>
          )}
            {(role === 3 || role === 4 || role === 5) && (
              <Link to={`/project/edit/${id}`}>
                {/* edit */}
                <i className="bi bi-pencil"></i>
              </Link>
            )}
            {(role === 2 || role === 3 || role === 4 || role === 5)  && (
              // preference list
              <i 
                className="bi bi-person"
                onClick={handleClickOpen}
                style={{ color: 'blue', cursor: 'pointer' }}
              ></i>

            )}
            {(role === 3 || role === 4 || role === 5) && (
              // delete
              <i className="bi bi-trash" onClick={toggle} style={{ color: 'red', cursor: 'pointer' }}></i>
            )}
          </div>
        </CardBody>
        <TeamFile
          open={open}
          handleClose={handleClose}
          projectId={id}
          handleClickOpen={handleClickOpen}
        />
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
