import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import CleanHand from "./pages/CleanHand";
import Home from "./pages/Home";
import ScanHand from "./pages/ScanHand";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/scan-hand" exact>
          <ScanHand />
        </Route>
        <Route path="/clean-hand" exact>
          <CleanHand />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
