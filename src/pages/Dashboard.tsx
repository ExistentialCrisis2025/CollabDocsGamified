import { Navigate, useNavigate } from "react-router-dom";
import Kanban from "../components/Kanban";

const Dashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.setItem("authToken", "");
    navigate("/");
  };
  return (
    <div>
      <h1>This is the dashboard</h1>
      <Kanban></Kanban>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
