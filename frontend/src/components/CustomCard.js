import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

// the card to show the project
const CustomCard = ({ id, title, client, clientTitle, clientAvatar, skills, field, onDelete, role, allocatedTeamsCount, maxTeams, showActions = true, showTeamsCount = false }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  // click on the project title, redirect to project detail page
  const handleCardNavi = () => {
    navigate(`/project/details/${id}`);
  };

  const [open, setOpen] = useState(false);

  // check if the maximum number of allocated teams has been reached
  // if yes, raise the modal for alerting
  const handleClickOpen = () => {
    if (allocatedTeamsCount >= maxTeams) {
      setConfirmOpen(true);
    } else {
      setOpen(true);
    }
  };

  const handleConfirmClose = (confirmed) => {
    setConfirmOpen(false);
    if (confirmed) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  // delete a published project
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

  // archive a publised project
  const handleArchive = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/v1/project/archive/${id}`, {
        method: 'GET',
      });
      if (response.ok) {
        message.success('Project archived successfully');
        setArchiveDialogOpen(false);
        navigate(0);
      } else {
        message.error('Failed to archive the project');
      }
    } catch (error) {
      message.error('An error occurred while archiving the project');
    }
  };

  const renderAvatar = () => {
    if (clientAvatar) {
      return <img src={clientAvatar} alt="Client Avatar" className="avatar" />;
    } else {
      return <div className="avatar"> <span> {client[0]}</span></div>;
    }
  };

  const getColor = (allocated, max) => {
    if (allocated < max / 2) {
      return 'green';
    } else if (allocated < max) {
      return 'yellow';
    } else {
      return 'red';
    }
  };

  return (
    <>
      <Card className="mb-4 custom-card">
        {showTeamsCount && maxTeams > 0 && (
          <div 
            className="allocated-teams-count"
            style={{ color: getColor(allocatedTeamsCount, maxTeams) }}
          >
            {allocatedTeamsCount} / {maxTeams}
          </div>
        )}
        <div 
          className="custom-card-header"
          onClick={handleCardNavi}
          style={{ cursor: "pointer" }}
        >
          {/* project title */}
          <h5 className="custom-card-title">
            {title}
          </h5>
        </div>
        <CardBody className="d-flex flex-column custom-card-body">
          {/* client detail */}
          <div className="d-flex align-items-center mb-3">
            <Avatar src={clientAvatar ? clientAvatar : ''} size={40} className="avatar" />
            <div className="client-info">
              <CardTitle tag="h5" className="client-name">{client}</CardTitle>
              <CardText className="client-title">{clientTitle}</CardText>
            </div>
          </div>
          {/* project required skills */}
          <div className="skills-container">
            {Array.isArray(skills) && skills.map(skill => (
              <span key={skill} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
          {/* project field */}
          <div className="field-container">
            <span className="field-badge">{field}</span>
          </div>
          {/* all the actions for the project */}
          {showActions && (
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
          )}
        </CardBody>
        <TeamFile
          open={open}
          handleClose={handleClose}
          projectId={id}
          handleClickOpen={handleClickOpen}
        />
      </Card>
      {/* deletion modal */}
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
      {/* archive modal */}
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
      {/* maximum teams reached modal */}
      <Dialog
        open={confirmOpen}
        onClose={() => handleConfirmClose(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {"Maximum Teams Reached"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            The number of teams has reached the maximum limit. Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmClose(true)} color="primary">
            Yes
          </Button>
          <Button onClick={() => handleConfirmClose(false)} color="secondary" autoFocus>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomCard;
