import { Link } from "react-router-dom";
import Logo from "./../images/logo.svg";
import sunLogo from "./../images/sunLogo.svg";
import startScanImg from "./../images/start-scan.png";
import turfproLogoImg1 from "./../images/turfproLogo1.png";
// import { mobileAndTabletCheck } from "./../helpers/Utils";
const Home = () => {
  // console.log(mobileAndTabletCheck());
  return (
    <div className="appUi homePage">
      <img src={Logo} alt="logo" className="logo" />
      <Link to="/scan-hand" className="btn">
        <img src={startScanImg} alt="img" />
      </Link>
      <img src={turfproLogoImg1} alt="turfpro" />
      <img src={sunLogo} alt="sunLogo" className="sunLogologo" />
    </div>
  );
};

export default Home;
