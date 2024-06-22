import React from 'react';
import { useNavigate } from 'react-router-dom';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import { CenteredBox, CenteredCard } from '../components/CenterBoxLog';
import { ReactComponent as LogoDark } from "../assets/images/logos/capstone.svg";
import GradientBackground from '../components/GradientBackground';

const ResetSuccess = (props) => {
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
							<b></b> Password has been reset successfully. <b></b>
            </Typography> <br />
          </CardContent>
        </CenteredCard>
      </CenteredBox>
      <GradientBackground />
    </>
	)
}

export default ResetSuccess;