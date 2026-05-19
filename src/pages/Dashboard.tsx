import { Navigate, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.setItem("authToken", "");
    navigate("/");
  };
  return (
    <div>
      <h1>This is the dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
