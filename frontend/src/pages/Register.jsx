import React from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { CenteredBox, CenteredCard } from '../components/CenterBoxLog';
import Link from '@mui/material/Link';

import { apiCall } from '../helper';
import MessageAlert from '../components/MessageAlert';
import GradientBackground from '../components/GradientBackground';

const Register = (props) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordConfirmed, setPasswordConfirmed] = React.useState('');
  const [name, setName] = React.useState('');
  const [unmatched, setUnmatched] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
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

  // load dashboard
  React.useEffect(() => {
    if (props.token) {
      navigate('/');
    }
  }, [props.token]);

  // check password validation
  React.useEffect(() => {
    if (password !== passwordConfirmed) {
      setUnmatched('Password unmatched');
    } else if (password === passwordConfirmed) {
      setUnmatched('');
    }
  }, [passwordConfirmed, password]);

  ///////////////////////
  // register function: activate when click on the register button
  /////////////////////// 
  const register = async () => {
    if (unmatched) {
      setSnackbarContent('Password unmatched');
      setAlertType('error');
      setOpen(true);
      return;
    }

    // check empty
    if (!email || !password || !name){
      setSnackbarContent('Please fill in the form');
      setAlertType('error');
      setOpen(true);
      return 
    };

    // check valid email
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (! regex.test(email)){
      setSnackbarContent('Invalid Email');
      setAlertType('error');
      setOpen(true);
      return 
    };

    // check valid password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (! passwordRegex.test(password)){
      setSnackbarContent('Password must be at least 8 characters long, including letter, number, and special character.');
      setAlertType('error');
      setOpen(true);
      return 
    }
    
    // try to request
    const requestBody = {
      email: email,
      password: password,
      password_confirm: passwordConfirmed,
      username: name
    };
    setLoading(true);
    try {
      const data = await apiCall('POST', 'v1/user/register/send_email', requestBody);
      if (data.error) {
        setSnackbarContent(data.error);
        setAlertType('error');
        setOpen(true);
      } else if (data.msg) {
        // localStorage.setItem('token', data.token);
        // localStorage.setItem('email', email);
        // props.setToken(data.token);
        // props.setEmail(email);
        setSnackbarContent('data.msg');
        setAlertType('success');
        setOpen(true);
        navigate('/verify-email-link-sent');
      }
    } catch (error) {
      console.error('Error during register:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CenteredBox>
        <CenteredCard>
          <CardContent>
            <Typography variant="h4" component="div">
            Register
            </Typography> <br />
            <Typography variant="body2">
              <TextField id="email" label="Email" type="text" value={email} onChange={e => setEmail(e.target.value)} /> <br /><br />
              <TextField id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} /> <br /><br />
              <TextField id="passwordConfirmed" label="Password Confirmed" type="password" value={passwordConfirmed} onChange={e => setPasswordConfirmed(e.target.value)} />
              <br /><br />
              <TextField id="name" label="Name" type="text" value={name} onChange={e => setName(e.target.value)} /> <br /><br />
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              id="buttonRegister"
              variant="contained"
              onClick={register}
              disabled={loading}
              aria-label="Click me to register"
            >
              {loading ? 'Loading...' : 'Register'}
            </Button>
            {unmatched && <small id='unmatchError' style={{ color: 'red', paddingLeft: '1vw' }}>{unmatched}<br/></small>}
          </CardActions>
          <CardContent>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <small>
              Already have an account?{'\u00A0'}
              <Link
                href="#"
                onClick={() => navigate('/login')}
                aria-label="Click me to login page"
              >
                Login
              </Link>
              {'\u00A0'}now
            </small>
          </div>
          </CardContent>
        </CenteredCard>
      </CenteredBox>
      <MessageAlert open={open} alertType={alertType} handleClose={handleClose} snackbarContent={snackbarContent}/>
      <GradientBackground />
    </>
  )
}

export default Register;
