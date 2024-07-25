import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import Card from '@mui/material/Card';

// define center box style for login and register screen
const CenteredBox = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
`;
const CenteredCard = styled(Card)`
  max-width: 60%;
  padding: 3vh 3vw;
`;

export { CenteredBox, CenteredCard };
