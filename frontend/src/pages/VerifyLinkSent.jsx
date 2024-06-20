import React from 'react';
import { useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CenteredBox, CenteredCard } from '../components/CenterBoxLog';
import { ReactComponent as LogoDark } from "../assets/images/logos/capstone.svg";
const Verify = (props) => {
	const navigate = useNavigate();
	return(
    <>
      <CenteredBox>
        <CenteredCard>
          <CardContent>
						<div style={{ display: 'flex', justifyContent: 'center' }}>
							<LogoDark />
						</div>
            <Typography sx={{textAlign:'center'}} variant="h5" component="div">
							<b></b> We sent you an email which contains a link to verify your account. <b></b>
            </Typography> <br />
						<div style={{ display: 'flex', justifyContent: 'center' }}>
							<big>
								<Link
									href="#"
									onClick={() => navigate('/login')}
									aria-label="Go Back to Login"
									sx={{textAlign:'center'}}
								>
									Go Back to Login
								</Link>
							</big>
						</div>
          </CardContent>
        </CenteredCard>
      </CenteredBox>
    </>


	)

}

export default Verify;