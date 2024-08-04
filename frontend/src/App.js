import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import PageList from "./pages/PageList";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <>
      <Router>
        <PageList />
      </Router>
    </>
  );
}

export default App;
