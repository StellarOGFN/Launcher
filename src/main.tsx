import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import Particles from "./components/Core/Particles";
import Frame from "./components/Core/Frame";
import "./index.css";
import Login from "./pages/Login";
import Sidebar from "./components/Core/Sidebar";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Settings from "./pages/Settings";
import { useToastStore } from "./zustand/ToastStore";
import { ToastContainer } from "./components/Global/Toast";
import Leaderboards from "./pages/Leaderboards";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const App = () => {
  const location = useLocation();
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id="glass-distortion">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="3"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
        </filter>
      </svg>

      <Frame />
      <Particles quantity={85} />
      {location.pathname !== "/" && <Sidebar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/leaderboards" element={<Leaderboards />} />
      </Routes>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

document.addEventListener("contextmenu", (e) => e.preventDefault());

root.render(
  <HashRouter>
    <App />
  </HashRouter>,
);
