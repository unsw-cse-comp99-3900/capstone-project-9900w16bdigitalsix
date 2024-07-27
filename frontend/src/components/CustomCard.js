import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody, CardTitle, CardText, Button as StrapButton } from 'reactstrap';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Tooltip from '@mui/material/Tooltip';
import { message } from 'antd';
import '../assets/scss/CustomCard.css'; // import CSS file
import TeamFile from "../components/TeamFileDialog";
import { Avatar } from 'antd';

const CustomCard = ({ id, title, client, clientTitle, clientAvatar, skills, field, onDelete, role }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleCardNavi = () => {
    navigate(`/project/details/${id}`);
  };

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/v1/project/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onDelete(id);
        setModalOpen(false);
      } else {
        console.error('Failed to delete the project.');
      }
    } catch (error) {
      console.error('An error occurred while deleting the project:', error);
    }
  };

  const handleArchive = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/v1/project/archive/${id}`, {
        method: 'POST',
      });
      if (response.ok) {
        message.success('Project archived successfully');
        setArchiveDialogOpen(false);
      } else {
        message.error('Failed to archive the project');
      }
    } catch (error) {
      message.error('An error occurred while archiving the project');
    }
  };

  const renderAvatar = () => {
    console.log(clientAvatar)
    if (clientAvatar) {
      return <img src={clientAvatar} alt="Client Avatar" className="avatar" />;
    } else {
      return <div className="avatar"> <span> {client[0]}</span></div>;
    }
  };

  return (
    <>
      <Card className="mb-4 custom-card">
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
            <Avatar src={clientAvatar || ''} size={40} className="avatar" />
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
              <Tooltip title="Archive">
                <Button 
                  onClick={() => setArchiveDialogOpen(true)} 
                  style={{ color: 'green', cursor: 'pointer', minWidth: '40px' }}
                >
                  <i className="bi bi-file-earmark"></i>
                </Button>
              </Tooltip>
            )}
            {(role === 3 || role === 4 || role === 5) && (
              <Tooltip title="Edit">
                <Link to={`/project/edit/${id}`}>
                  <Button 
                    style={{ color: 'black', cursor: 'pointer', minWidth: '40px' }}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                </Link>
              </Tooltip>
            )}
            {(role === 2 || role === 3 || role === 4 || role === 5)  && (
              <Tooltip title="Teams">
                <Button 
                  onClick={handleClickOpen}
                  style={{ color: 'blue', cursor: 'pointer', minWidth: '40px' }}
                >
                  <i className="bi bi-person"></i>
                </Button>
              </Tooltip>
            )}
            {(role === 3 || role === 4 || role === 5) && (
              <Tooltip title="Delete">
                <Button 
                  onClick={() => setModalOpen(true)} 
                  style={{ color: 'red', cursor: 'pointer', minWidth: '40px' }}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </Tooltip>
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
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this project?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
          <Button onClick={() => setModalOpen(false)} color="primary" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Archive"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to archive this project?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleArchive} color="primary">
            Archive
          </Button>
          <Button onClick={() => setArchiveDialogOpen(false)} color="secondary" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomCard;
