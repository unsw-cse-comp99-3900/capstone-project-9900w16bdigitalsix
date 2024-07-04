import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Card, CardTitle, CardBody, Button } from 'reactstrap';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { CardContent } from '@mui/material';

import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import '../assets/scss/FullLayout.css';//make sure import this
import TutorAssign from '../components/AssignTeamTutorModal';

const ProjectAdminAssign = () => {
  const location = useLocation();
  const { item } = location.state || {};

  const {
    clientEmail,
    clientName,
    description,
    field,
    projectId,
    requiredSkills,
    title,
    tutorId,
    tutorName,
    tutorEmail,
    coorId,
    coorName,
    coorEmail,
  } = item;

  // State for the Tutor Dialog
  const [tutorDialogOpen, setTutorDialogOpen] = useState(false);
  const toggleTutorDialog = () => setTutorDialogOpen(!tutorDialogOpen);

  // State for the Coordinator Dialog
  const [coorDialogOpen, setCoorDialogOpen] = useState(false);
  const toggleCoorDialog = () => setCoorDialogOpen(!coorDialogOpen);
  console.log(item);

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
            <Card>
              <CardTitle
                tag="h5"
                className="border-bottom p-3 mb-0"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', fontFamily: 'Arial, sans-serif' }}
              >
                <div>
                  {title}
                  <div style={{ fontSize: '14px', fontWeight: '400', marginTop: '4px' }}>
                    Project Id: {projectId}
                  </div>
                </div>
              </CardTitle>
              <CardBody className="p-4" style={{ fontFamily: 'Arial, sans-serif' }}>
                <div style={{ margin: '30px' }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '600' }}>Client Information</h5>
                  <p style={{ margin: '0', fontSize: '16px', fontWeight: '400' }}><strong>Name:</strong> {clientName}</p>
                  <p style={{ margin: '0', fontSize: '16px', fontWeight: '400' }}><strong>Email:</strong> {clientEmail}</p>
                </div>
                <div style={{ margin: '30px' }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '600' }}>Project Details</h5>
                  <p style={{ margin: '0', fontSize: '16px', fontWeight: '400' }}><strong>Field:</strong> {field}</p>
                  <p style={{ margin: '0', fontSize: '16px',  textAlign: 'justify', fontWeight: '400' }}><strong>Description:</strong> {description}</p>
                  <p style={{ margin: '0', fontSize: '16px', fontWeight: '400' }}><strong>Required Skills:</strong> {requiredSkills.join(', ')}</p>
                </div>
                <div>
                  {tutorId !== 0 || tutorName ? (
                    <Card style={{
                      display: 'flex',
                      flexDirection: 'row',  // 修改为垂直布局
                      justifyContent: 'center',
                      alignItems: 'flex-start',  // 左对齐
                      padding: '8px 20px',
                      margin: '10px 0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      width: '40%'
                    }}>
                      <CardContent style={{ width: '100%' }}>
                        <div>
                          <p style={{ margin: '0', fontSize: '16px', fontWeight: '400' }}>
                            <strong>Name:</strong> {tutorName}<br/>
                            <strong>Email:</strong> {tutorEmail}
                          </p>
                        </div>
                      </CardContent>
                      <Button color="primary" onClick={toggleTutorDialog} style={{ whiteSpace: 'nowrap', alignSelf: 'flex-start', marginTop: '10px' }}>Change</Button>
                                       
                      <Dialog
                        open={tutorDialogOpen}
                        onClose={toggleTutorDialog}
                        maxWidth="md"
                        fullWidth={true}
                      >
                        <DialogTitle>Assign Tutor</DialogTitle>
                        <DialogContent style={{ height: '100%', minHeight: '400px' }}>
                          <TutorAssign projectId={projectId}/>
                        </DialogContent>
                      </Dialog>
                    </Card>
                  ) : (
                    <Button color="primary" className="mb-3 btn-lg" style={{ display: 'block' }} onClick={toggleTutorDialog}>Assign Tutor</Button>
                  )}
                </div>
                  <div>
                  {coorId === 0 ? (
                    <>
                      <Button color="secondary" className="btn-lg" style={{ display: 'block' }} onClick={toggleCoorDialog}>Assign Coordinator</Button>
                      <Dialog open={coorDialogOpen} onClose={toggleCoorDialog}>
                        <DialogTitle>{"Assign Coordinator"}</DialogTitle>
                        <DialogContent>
                          <DialogContentText>
                            Please enter the details to assign a coordinator.
                          </DialogContentText>
                          {/* Additional form inputs can be placed here */}
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={toggleCoorDialog} color="primary">Save</Button>
                          <Button onClick={toggleCoorDialog} color="secondary">Cancel</Button>
                        </DialogActions>
                      </Dialog>
                    </>
                  ) : (
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: '400' }}><strong>Coordinator Name:</strong> {coorName}</p>
                  )}
                </div>
              </CardBody>
            </Card>
          </Container>
        </div>
      </div>
    </main>
  );
};

export default ProjectAdminAssign;
