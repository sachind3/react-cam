import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="appUi homePage">
      <h1>Scan your hand</h1>
      <Link to="/scan-hand" className="btn">
        Open Camera
      </Link>
    </div>
  );
};

export default Home;
