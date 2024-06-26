import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

// toast alert component
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={2} ref={ref} variant="filled" {...props} />;
});

const MessageAlert = (props) => {
  const { open, alertType, handleClose, snackbarContent } = props;
  return (
    <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} sx={{ padding: '0' }} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert onClose={handleClose} severity={alertType} sx={{ width: '100%' }}>
        {snackbarContent}
      </Alert>
    </Snackbar>
  )
}

export default MessageAlert;
