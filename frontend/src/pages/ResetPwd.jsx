import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import { CenteredBox, CenteredCard } from '../components/CenterBoxLog';
import { apiCall } from '../helper';
import MessageAlert from '../components/MessageAlert';
import GradientBackground from '../components/GradientBackground';
import ResetSuccess from './ResetSuccess.jsx';

const ResetPwd = (props) => {
  const [password, setPassword] = React.useState('');
  const [passwordConfirmed, setPasswordConfirmed] = React.useState('');
  const [unmatched, setUnmatched] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = React.useState('');
  const [token, setToken] = React.useState('');

  const [open, setOpen] = React.useState(false); // alert state
  const [snackbarContent, setSnackbarContent] = React.useState('');
  const [alertType, setAlertType] = React.useState('error');

  // close alert message
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };
  
  React.useEffect(() => {
    // get token, email from url
    const params = new URLSearchParams(location.search);
    setToken(params.get('token'));
    setEmail(params.get('email'));
  }, []);

  // check password validation
  React.useEffect(() => {
    if (password !== passwordConfirmed) {
      setUnmatched('Password unmatched');
    } else if (password === passwordConfirmed) {
      setUnmatched('');
    }
  }, [passwordConfirmed, password]);

  ///////////////////////
  // reset function: activate when click on the rest button
  /////////////////////// 
  const reset = async () => {
    if (unmatched) {
      setSnackbarContent('Password unmatched');
      setAlertType('error');
      setOpen(true);
      return;
    }

    // check empty
    if (!email || !password){
      setSnackbarContent('Please fill in the form');
      setAlertType('error');
      setOpen(true);
      return 
    };

    // check valid password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (! passwordRegex.test(password)){
      setSnackbarContent('Password must be at least 8 characters long, including letter, number, and special character @$!%*?&');
      setAlertType('error');
      setOpen(true);
      return 
    }
    
    
    // try to request
    const requestBody = {
      new_password: password,
      new_password_confirm: passwordConfirmed,
      token: token
    };

    try {
      const data = await apiCall('POST', 'v1/user/reset/password', requestBody);
      if (data.error) {
        setSnackbarContent(data.error);
        setAlertType('error');
        setOpen(true);
      } else if (data.msg) {
        // localStorage.setItem('token', data.token);
        // localStorage.setItem('email', email);
        // props.setToken(data.token);
        // props.setEmail(email);
        setSuccess(true);
        // setSnackbarContent('data.msg');
        // setAlertType('success');
        // setOpen(true);
      }
    } catch (error) {
      console.error('Error during reset password:', error);
    }
  };

  return (
    <>
      {success ? <ResetSuccess /> :(
        <>
          <CenteredBox>
            <CenteredCard>
              <CardContent>
                <Typography variant="h4" component="div">
                Reset Password
                </Typography> <br />
                <Typography variant="body2">
                  <TextField
                    id="email"
                    label="Email"
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={true}
                  /> <br /><br />
                  <TextField id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} /> <br /><br />
                  <TextField id="passwordConfirmed" label="Password Confirmed" type="password" value={passwordConfirmed} onChange={e => setPasswordConfirmed(e.target.value)} />
                  <br /><br />
                </Typography>
              </CardContent>
              <CardActions>
                <Button id="buttonReset" variant="contained" onClick={reset} aria-label="Click me to reset">Reset</Button>
                {unmatched && <small id='unmatchError' style={{ color: 'red', paddingLeft: '1vw' }}>{unmatched}<br/></small>}
              </CardActions>
            </CenteredCard>
          </CenteredBox>
          <MessageAlert open={open} alertType={alertType} handleClose={handleClose} snackbarContent={snackbarContent}/>
          <GradientBackground />
        </>
      )}
    </>
  )
}

export default ResetPwd;
