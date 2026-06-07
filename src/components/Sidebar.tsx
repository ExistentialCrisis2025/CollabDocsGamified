const Sidebar = () => {
  return (
    <aside className="flex items-left text-center">
      <h3>Dashboard</h3>

      <nav>
        <ul>
          <li>Recent Docs</li>
          <li>Tasks</li>
          <li>Analytics</li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
