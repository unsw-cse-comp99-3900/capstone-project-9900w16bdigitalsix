import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Container,Avatar, Box, Button, Grid, TextField, 
  Typography, Chip,Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

import '../assets/scss/UserInfo.css';
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { apiCall, fileToDataUrl } from '../helper';
import base64Image from '../assets/images/testimage'
import MessageAlert from '../components/MessageAlert';

const contentAreaStyle = {
  marginTop: '56px', // Adjust this value to match the Header height
  // padding: '16px', // Optional padding for the content area
};

const roleMap = {
  1: 'Student',
  2: 'Tutor',
  3: 'Client',
  4: 'Coordinator',
  5: 'Administrator'
};

const roleReverseMap = {
  'Student': 1,
  'Tutor': 2,
  'Client': 3,
  'Coordinator': 4,
  'Administrator': 5
};

const Profile = (props) => {
    const [open, setOpen] = useState(false);
    const [editable, setEditable] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('');
    const [bio, setBio] = useState('');
    const [organization, setOrganization] = useState('');
    const [skills, setSkills] = useState([]);
    const [field, setField] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertType, setAlertType] = useState('');
    const [snackbarContent, setSnackbarContent] = useState('');
    const [avatar, setAvatar] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = localStorage.getItem('userId');
            try {
                const response = await apiCall('GET', `v1/user/profile/${userId}`, null, localStorage.getItem('token'), true);
                if (response) {
                    setEmail(response.email);
                    setName(response.name);
                    setUserId(response.userId);
                    setRole(roleMap[response.role] || 'Student');
                    setBio(response.bio);
                    setOrganization(response.organization);
                    setSkills(response.skills);
                    setField(response.field);
                    //need to be implented
                    console.log("response.avatarPath:",response.avatarPath);
                    const imageResponse = await fetch(`http://localhost:3000/${response.avatarPath}`); // 确保路径正确
                    const imageBlob = await imageResponse.blob();
                    const imageFile = new File([imageBlob], "avatar.png", { type: imageBlob.type });
                    const imageDataUrl = await fileToDataUrl(imageFile);

                    setAvatar(imageDataUrl);
                    console.log("Fetched avatar:", imageDataUrl);//
                } else {
                    setSnackbarContent('Failed to fetch user data');
                    setAlertType('error');
                    setAlertOpen(true);
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                setSnackbarContent('Failed to fetch user data');
                setAlertType('error');
                setAlertOpen(true);
            }
        };

        fetchUserData();
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
    if (editable) {
        // Save the edited data
        const saveUserData = async () => {
            const payload = {
                    profile: {
                        avatarBase64: avatar, // Ensure the avatar is in the correct format
                        bio: bio,
                        field: field,
                        name: name,
                        organization: organization,
                        role: roleReverseMap[role],
                        skills: skills,
                        userId: parseInt(userId, 10)
                    }
            };

            try {
                //console.log("handleEditClick - payload:", JSON.stringify(payload, null, 2)); // 确认 payload 的值
                const response = await apiCall('POST', 'v1/user/modify/profile', payload, localStorage.getItem('token'), true);
                if (response.msg) {
                    setSnackbarContent('User profile updated successfully');
                    setAlertType('success');
                    setAlertOpen(true);
                } else {
                    setSnackbarContent(response.error || 'Failed to update user profile');
                    setAlertType('error');
                    setAlertOpen(true);
                }
            } catch (error) {
                console.error('Failed to update user profile:', error);
                setSnackbarContent('Failed to update user profile');
                setAlertType('error');
                setAlertOpen(true);
            }
        };

        saveUserData();
    }

    setEditable(!editable);
};



const handleFileChange = async (event) => {
    const file = event.target.files[0];
    try {
        const dataUrl = await fileToDataUrl(file);
        setAvatar(dataUrl);
        //console.log("handleFileChange - avatar:", dataUrl); // 确认 avatar 的值
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
      <div className="contentArea"  style={contentAreaStyle}>
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
                    {editable ? (
                        <TextField
                            variant="outlined"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            sx={{ fontSize: '2rem', fontWeight: 'bold' }} // 大小和加粗样式
                        />
                    ) : (
                        <Typography variant="h4" component="h1" color="textPrimary">{name}</Typography> // 将名字作为大标题
                    )}

                        <Typography variant="body1" color="textSecondary">Email: {email}</Typography>
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
                                <Typography variant="body2" sx={{ mt: 1, bgcolor: 'grey.200', p: 2, borderRadius: 1 }}>
                                    {role}
                                </Typography>
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