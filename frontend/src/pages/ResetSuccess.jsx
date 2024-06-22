import React from 'react';
import { useNavigate } from 'react-router-dom';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import { CenteredBox, CenteredCard } from '../components/CenterBoxLog';
import { ReactComponent as LogoDark } from "../assets/images/logos/capstone.svg";
import GradientBackground from '../components/GradientBackground';
import Link from '@mui/material/Link';

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

export default ResetSuccess;