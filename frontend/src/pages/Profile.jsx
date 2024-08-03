import React, { useState, useEffect } from "react";
import { Container,Avatar, Box, Button, Grid, TextField, 
  Typography, Chip,Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

import '../assets/scss/FullLayout.css';//make sure import this
import '../assets/scss/UserInfo.css';
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { apiCall, fileToDataUrl } from '../helper';
import MessageAlert from '../components/MessageAlert';

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
    const [confirmPassword, setConfirmPassword] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertType, setAlertType] = useState('');
    const [snackbarContent, setSnackbarContent] = useState('');
    const [avatar, setAvatar] = useState('');
    const [course, setCourse] = useState('');

    // load user profile
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
                    setBio(response.bio );
                    setOrganization(response.organization);
                    setSkills(response.skills);
                    setField(response.field);
                    setCourse(response.course);
                    console.log("response:", response);
                    const imagePath = response.avatarURL; 
                if (imagePath) {
                    try {
                        const imageResponse = await fetch(imagePath);
                        if (!imageResponse.ok) {
                            throw new Error('Failed to fetch image');
                        }
                        const imageBlob = await imageResponse.blob();
                        const imageFile = new File([imageBlob], "avatar.png", { type: imageBlob.type });
                        const imageDataUrl = await fileToDataUrl(imageFile);
                        setAvatar(imageDataUrl);
                    } catch (imageError) {
                        console.error('Failed to fetch image:', imageError);
                        setAvatar(null);
                    }
                } else {
                    setAvatar(null);
                }
                } else {
                    setSnackbarContent('Failed to fetch user data 1');
                    setAlertType('error');
                    setAlertOpen(true);
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                setSnackbarContent('Failed to fetch user data 2');
                setAlertType('error');
                setAlertOpen(true);
            }
        };

        fetchUserData();
    }, []);

    // open "reset password" modal
    const handleClickOpen = () => {
        setOpen(true);
    };

    // close "reset password" modal
    const handleClose = () => {
        setOpen(false);
    };

    // close alert message
    const handleAlertClose = () => {
      setAlertOpen(false);
    };

    // edit profile 
    const handleEditClick = () => {
        if (editable) {
            const confirmUpdate = async () => {
                const payload = {
                    profile: {
                        avatarBase64: avatar, // Ensure the avatar is in the correct format
                        bio: bio,
                        field: field,
                        name: name,
                        organization: organization,
                        role: roleReverseMap[role],
                        skills: skills,
                        userId: parseInt(userId, 10),
                        course: course,
                    }
                };
    
                // Check if required fields are empty and ask for confirmation
                if (!bio || !field || !name || !organization || !skills || !avatar) {
                    if (window.confirm("Some fields are empty. Are you sure you want to update?")) {
                        try {
                            const response = await apiCall('POST', 'v1/user/modify/profile', payload, localStorage.getItem('token'), true);
                            if (response.msg) {
                                setSnackbarContent('User profile updated successfully');
                                setAlertType('success');
                            } else {
                                setSnackbarContent(response.error || 'Failed to update user profile');
                                setAlertType('error');
                            }
                        } catch (error) {
                            console.error('Failed to update user profile:', error);
                            setSnackbarContent('Failed to update user profile');
                            setAlertType('error');
                        } finally {
                            setAlertOpen(true);
                            setEditable(!editable);
                        }
                    }
                } else {
                    try {
                        const response = await apiCall('POST', 'v1/user/modify/profile', payload, localStorage.getItem('token'), true);
                        if (response.msg) {
                            setSnackbarContent('User profile updated successfully');
                            setAlertType('success');
                        } else {
                            setSnackbarContent(response.error || 'Failed to update user profile');
                            setAlertType('error');
                        }
                    } catch (error) {
                        console.error('Failed to update user profile:', error);
                        setSnackbarContent('Failed to update user profile');
                        setAlertType('error');
                    } finally {
                        setAlertOpen(true);
                        setEditable(!editable);
                    }
                }
            };
    
            confirmUpdate();
            window.location.reload();
        } else {
            setEditable(!editable);
        }
    };    
// handle the functionality of uploading image
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
    // check validation of resetting password
    const handleChangePassword = async () => {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setSnackbarContent('Password must be at least 8 characters long, including letter, number, and special character.');
            setAlertType('error');
            setAlertOpen(true);
            return;
        }
        if (newPassword !== confirmPassword) {
            setSnackbarContent('New password and confirmation password do not match.');
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
                            sx={{ fontSize: '2rem', fontWeight: 'bold' }}
                        />
                    ) : (
                        <Typography variant="h4" component="h1" color="textPrimary">{name}</Typography>
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
                            <Typography variant="body1">Course:</Typography>
                            {editable ? (
                                <Typography variant="body2" sx={{ mt: 1, bgcolor: 'grey.200', p: 2, borderRadius: 1 }}>
                                    {course}
                                </Typography>
                            ) : (
                                <Typography variant="body2" sx={{ mt: 1, bgcolor: 'grey.200', p: 2, borderRadius: 1 }}>
                                    {course}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1">Skills:</Typography>
                            {editable ? (
                                <>
                                    <TextField
                                        variant="outlined"
                                        value={skills ? skills.join(', ') : ''}
                                        onChange={(e) => setSkills(e.target.value.split(', '))}
                                        fullWidth
                                        sx={{ mt: 1 }}
                                    />
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                        Please separate keywords with commas
                                    </Typography>
                                </>
                            ) : (
                                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {skills && skills.map((skill, index) => (
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
                <TextField
                    margin="dense"
                    id="confirm-password"
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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