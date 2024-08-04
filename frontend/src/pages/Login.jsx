import React from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import { CenteredBox, CenteredCard } from "../components/CenterBoxLog";
import Link from "@mui/material/Link";
import MessageAlert from "../components/MessageAlert";
import GradientBackground from "../components/GradientBackground";

import { apiCall } from "../helper";

const Login = (props) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false); // alert state
  const [snackbarContent, setSnackbarContent] = React.useState("");
  const [alertType, setAlertType] = React.useState("error");

  // close alert message
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  // load dashboard
  React.useEffect(() => {
    if (props.token) {
      navigate("/project/allproject");
    }
  }, [props.token]);

  ///////////////////////
  // login function: activate when click on the login button
  ///////////////////////
  const login = async () => {
    // check empty
    if (!email || !password) {
      setSnackbarContent("Please fill in the form");
      setAlertType("error");
      setOpen(true);
      return;
    }

    // check valid email
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setSnackbarContent("Invalid Email");
      setAlertType("error");
      setOpen(true);
      return;
    }

    // try to request
    const requestBody = {
      email,
      password,
    };

    try {
      const data = await apiCall("POST", "v1/user/pwd_login", requestBody);
      if (data.error) {
        setSnackbarContent(data.error);
        setAlertType("error");
        setOpen(true);
      } else if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", email);
        localStorage.setItem("userId", data.id);
        localStorage.setItem("role", data.role);
        props.setToken(data.token);
        props.setRole(data.role);
        setEmail(email);
        navigate("/project/allproject");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <>
      <CenteredBox>
        <CenteredCard>
          <CardContent>
            <Typography variant="h4" component="div">
              Login
            </Typography>{" "}
            <br />
            <Typography variant="body2">
              <TextField
                id="email"
                label="Email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />{" "}
              <br />
              <br />
              <TextField
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  autoComplete: "new-password",
                }}
                inputProps={{
                  autoComplete: "new-password",
                }}
              />{" "}
              <br />
              <br />
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              id="buttonLogin"
              variant="contained"
              onClick={login}
              aria-label="Click me to login"
            >
              Login
            </Button>
            <small>
              <Link
                href="#"
                onClick={() => navigate("/forget-pwd")}
                aria-label="Click me to forget password page"
              >
                Forget Password?
              </Link>
            </small>
          </CardActions>
          <CardContent>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <small>
                Do not have an account?{"\u00A0"}
                <Link
                  href="#"
                  onClick={() => navigate("/register")}
                  aria-label="Click me to register page"
                >
                  Register
                </Link>
                {"\u00A0"}now
              </small>
            </div>
          </CardContent>
        </CenteredCard>
      </CenteredBox>
      <MessageAlert
        open={open}
        alertType={alertType}
        handleClose={handleClose}
        snackbarContent={snackbarContent}
      />
      <GradientBackground />
    </>
  );
};

export default Login;
