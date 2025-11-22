import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import Particles from "./components/Core/Particles";
import Frame from "./components/Core/Frame";
import "./index.css";
import Login from "./pages/Login";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const App = () => {
  return (
    <>
      <Frame />
      <Particles quantity={70} />

      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </>
  );
};

document.addEventListener("contextmenu", (e) => e.preventDefault());

root.render(
  <HashRouter>
    <App />
  </HashRouter>
);
