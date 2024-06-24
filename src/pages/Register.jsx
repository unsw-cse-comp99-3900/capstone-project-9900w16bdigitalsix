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

const Register = (props) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordConfirmed, setPasswordConfirmed] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
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

  // load listings
  React.useEffect(() => {
    if (props.token) {
      navigate('/');
    }
  }, [props.token]);

  // check password validation
  React.useEffect(() => {
    if (password !== passwordConfirmed) {
      setError('Password unmatched');
    } else if (password === passwordConfirmed) {
      setError('');
    }
  }, [passwordConfirmed, password]);

  const register = async () => {
    if (error) {
      setSnackbarContent('Password unmatched');
      setAlertType('error');
      setOpen(true);
      return;
    }
    const requestBody = {
      email, password, name
    };
    try {
      const data = await apiCall('POST', 'user/auth/register', requestBody);
      if (data.error) {
        setSnackbarContent(data.error);
        setAlertType('error');
        setOpen(true);
      } else if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', email);
        props.setToken(data.token);
        props.setEmail(email);
        navigate('/');
        setSnackbarContent('Register successfully');
        setAlertType('success');
        setOpen(true);
      }
    } catch (error) {
      console.error('Error during register:', error);
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
            <Button id="buttonRegister" variant="contained" onClick={register} aria-label="Click me to register">Register</Button>
            {error && <small id='unmatchError' style={{ color: 'red', paddingLeft: '1vw' }}>{error}<br/></small>}
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
    </>
  )
}

export default Register;
