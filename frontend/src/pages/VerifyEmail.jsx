import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Link from '@mui/material/Link';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import { CenteredBox, CenteredCard } from '../components/CenterBoxLog';
import { ReactComponent as LogoDark } from "../assets/images/logos/capstone.svg";
import GradientBackground from '../components/GradientBackground';
import { apiCall } from '../helper';

const VerifyEmail = (props) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [message, setMessage] = React.useState('');
	const [token, setToken] = React.useState('');

	React.useEffect(() => {
		// get token from url
		const params = new URLSearchParams(location.search);
		setToken(params.get('token'));
		console.log(token)
	}, []);

	React.useEffect(() => {
		// return error
		console.log(token)
		if (!token) {
		  setMessage('Invalid Link');
		  return;
		}
		verify();
	}, [token]);

	const verify = async() => {
		// send request to verify token
    try {
			const queryParams = {
				'token': token
			}
      const data = await apiCall('GET', 'v1/user/register/verify', null, null, false, queryParams);
      if (data.error) {
				setMessage(data.error)

      } else if (data.msg) {
        // localStorage.setItem('token', data.token);
        // localStorage.setItem('email', email);
        // props.setToken(data.token);
        // props.setEmail(email);
        setMessage("Email verification successful!")
      }
    } catch (error) {
      console.error('Error during verify email:', error);
    };
	}
	return(
    <>
      <CenteredBox>
        <CenteredCard>
          <CardContent>
						<div style={{ display: 'flex', justifyContent: 'center' }}>
							<LogoDark />
						</div>
            <Typography sx={{textAlign:'center'}} variant="h5" component="div">
							<b></b> {message} <b></b>
            </Typography> <br />
						<div style={{ display: 'flex', justifyContent: 'center' }}>
							<big>
								<Link
									href="#"
									onClick={() => navigate('/login')}
									aria-label="Go Back to Login"
								>
									Go Back to Login
								</Link>
							</big>
						</div>
          </CardContent>
        </CenteredCard>
      </CenteredBox>
      <GradientBackground />
    </>


	)

}

export default VerifyEmail;