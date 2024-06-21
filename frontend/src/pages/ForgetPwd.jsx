import React from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CenteredBox, CenteredCard } from '../components/CenterBoxLog';
import { ReactComponent as LogoDark } from "../assets/images/logos/capstone.svg";
import MessageAlert from '../components/MessageAlert';
import { apiCall } from '../helper';
import GradientBackground from '../components/GradientBackground';

const ForgetPwd = () => {
	const navigate = useNavigate();
	const [email, setEmail] = React.useState('');
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

	const sendResetEmail = async() => {
		// check valid email
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (! regex.test(email)){
			setSnackbarContent('Invalid Email');
			setAlertType('error');
			setOpen(true);
			return 
		};

    // try to request
    const requestBody = {
      email
    };
    try {
      const data = await apiCall('POST', 'user/auth/register', requestBody);
      if (data.error) {
        setSnackbarContent(data.error);
        setAlertType('error');
        setOpen(true);
      } else if (data.msg) {
        // localStorage.setItem('token', data.token);
        // localStorage.setItem('email', email);
        // props.setToken(data.token);
        // props.setEmail(email);
        navigate('/reset-pwd-link-sent');
        setSnackbarContent('data.msg');
        setAlertType('success');
        setOpen(true);
      }
    } catch (error) {
      console.error('Error during register:', error);
    }
	};

	return(
    <>
      <CenteredBox>
        <CenteredCard>
          <CardContent>
						<div style={{ display: 'flex', justifyContent: 'center' }}>
							<LogoDark />
						</div>
            <Typography sx={{textAlign:'center'}} variant="h5" component="div">
							<b></b> Enter your email address and we'll send you a link to reset your password. <b></b>
            </Typography> <br /><br />
						<div style={{ display: 'flex', justifyContent: 'center' }}>
							<TextField id="email" style={{marginRight: "25pt"}} label="Email" type="text" value={email} onChange={e => setEmail(e.target.value)} /> <br /><br />
							<Button id='buttonSend' variant="contained" onClick={sendResetEmail} aria-label="Click me to send an email">SEND</Button>
						</div>
						<br />
						<div style={{ display: 'flex', justifyContent: 'center' }}>
							<Link
								href="#"
								onClick={() => navigate('/login')}
								aria-label="Go Back to Login"
							>
								Go Back to Login
							</Link>
						</div>

          </CardContent>
        </CenteredCard>
      </CenteredBox>
	  <MessageAlert open={open} alertType={alertType} handleClose={handleClose} snackbarContent={snackbarContent}/>
    <GradientBackground />
		</>


	)

}

export default ForgetPwd;