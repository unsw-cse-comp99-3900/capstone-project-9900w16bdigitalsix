import { ReactComponent as LogoDark } from "../assets/images/logos/capstone.svg";
import capstone from "../assets/images/logos/capstone.png";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/">
      {/* <LogoDark /> */}
      <img src={capstone} alt="logo" style={{ width: '80%', height: '80%' }}/>
    </Link>
  );
};

export default Logo;
