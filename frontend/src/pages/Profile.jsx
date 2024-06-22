import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container,Avatar, Box, Button, Grid, TextField, 
  Typography, Chip,Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

import '../assets/scss/UserInfo.css';
import { apiCall, fileToDataUrl } from '../helper';
import base64Image from '../assets/images/testimage'
import MessageAlert from '../components/MessageAlert';

const Profile = (props) => {
  const [open, setOpen] = useState(false);
  const [editable, setEditable] = useState(false);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('This is a sample bio text that describes the user.');
  const [organization, setOrganization] = useState('Sample Organization');
  const [skills, setSkills] = useState(['Skill 1', 'Skill 2', 'Skill 3']);
  const [field, setField] = useState('Sample Field');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');
  const [avatar, setAvatar] = useState(base64Image);

    useEffect(() => {
        setEmail(localStorage.getItem('email'));
        setUserId(localStorage.getItem('userId'));
        setRole(localStorage.getItem('role') || 'Sample Role'); // 设置默认role值以防没有role
    }, []);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleAlertClose = () => {
      setAlertOpen(false);
  };

    const handleEditClick = () => {
      setEditable(!editable);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    try {
        const dataUrl = await fileToDataUrl(file);
        setAvatar(dataUrl);
    } catch (error) {
        setSnackbarContent('Failed to upload image: ' + error.message);
        setAlertType('error');
        setAlertOpen(true);
    }
};

    const handleChangePassword = async () => {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setSnackbarContent('Password must be at least 8 characters long, including letter, number, and special character.');
            setAlertType('error');
            setAlertOpen(true);
            return;
        }

      const payload = {
          email,
          old_password: currentPassword,
          new_password: newPassword
      };

      try {
        const token = localStorage.getItem('token');
        const response = await apiCall('POST', 'v1/user/change_password', payload, token, true);
        if (response.msg) {
            setSnackbarContent('Password updated successfully');
            setAlertType('success');
            setAlertOpen(true);
        } else {
            setSnackbarContent(response.error || 'Failed to change password');
            setAlertType('error');
            setAlertOpen(true);
        }
    } catch (error) {
        console.error('Failed to change password:', error);
        setSnackbarContent('Failed to change password');
        setAlertType('error');
        setAlertOpen(true);
    } finally {
        handleClose();
    }
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
        {/********Header**********/}
        <Header />
        {/********Middle Content**********/}
        <Container className="p-4 wrapper" fluid>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar
                        src={avatar}
                        alt="Profile"
                        sx={{ width: 150, height: 150 }}
                    />
                    {editable && (
                        <IconButton color="primary" aria-label="upload picture" component="label">
                            <input hidden accept="image/*" type="file" onChange={handleFileChange} />
                            <PhotoCamera />
                        </IconButton>
                    )}
                    <Box>
                        <Typography variant="h4" component="h1">Name</Typography>
                        {editable ? (
                            <TextField
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                fullWidth
                            />
                        ) : (
                            <Typography variant="body1" color="textSecondary">{email}</Typography>
                        )}
                        <Typography variant="body2" color="textSecondary">UserID: {userId}</Typography>
                        <Box sx={{ mt: 2 }}>
                            <Button variant="contained" color="primary" startIcon={editable ? <SaveIcon /> : <EditIcon />} onClick={handleEditClick}>
                                {editable ? 'Save' : 'Edit'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6">Bio:</Typography>
                    {editable ? (
                        <TextField
                            variant="outlined"
                            multiline
                            rows={4}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            fullWidth
                            sx={{ mt: 1 }}
                        />
                    ) : (
                        <Typography variant="body1" sx={{ mt: 1, bgcolor: 'grey.200', p: 2, borderRadius: 1 }}>
                            {bio}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6">Personal Information:</Typography>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={6}>
                            <Typography variant="body1">Organization:</Typography>
                            {editable ? (
                                <TextField
                                    variant="outlined"
                                    value={organization}
                                    onChange={(e) => setOrganization(e.target.value)}
                                    fullWidth
                                    sx={{ mt: 1 }}
                                />
                            ) : (
                                <Typography variant="body2" sx={{ mt: 1, bgcolor: 'grey.200', p: 2, borderRadius: 1 }}>
                                    {organization}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1">Skills:</Typography>
                            {editable ? (
                                <TextField
                                    variant="outlined"
                                    value={skills.join(', ')}
                                    onChange={(e) => setSkills(e.target.value.split(', '))}
                                    fullWidth
                                    sx={{ mt: 1 }}
                                />
                            ) : (
                                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {skills.map((skill, index) => (
                                        <Chip key={index} label={skill} variant="outlined" />
                                    ))}
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1">Role:</Typography>
                            {editable ? (
                                <TextField
                                    variant="outlined"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    fullWidth
                                    sx={{ mt: 1 }}
                                />
                            ) : (
                                <Typography variant="body2" sx={{ mt: 1, bgcolor: 'grey.200', p: 2, borderRadius: 1 }}>
                                    {role}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1">Field:</Typography>
                            {editable ? (
                                <TextField
                                    variant="outlined"
                                    value={field}
                                    onChange={(e) => setField(e.target.value)}
                                    fullWidth
                                    sx={{ mt: 1 }}
                                />
                            ) : (
                                <Typography variant="body2" sx={{ mt: 1, bgcolor: 'grey.200', p: 2, borderRadius: 1 }}>
                                    {field}
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{ mt: 4, textAlign: 'right' }}>
                    <Button variant="contained" color="primary" onClick={handleClickOpen}>Change Password</Button>
                </Box>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To change your password, please enter your current password and new password below.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="current-password"
                        label="Current Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        margin="dense"
                        id="new-password"
                        label="New Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Cancel</Button>
                    <Button onClick={handleChangePassword} color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            <MessageAlert
                open={alertOpen}
                alertType={alertType}
                handleClose={handleAlertClose}
                snackbarContent={snackbarContent}
            />
        </Container>
      </div>
    </div>
  </main>
  );
};

export default Profile;