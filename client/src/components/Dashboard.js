import React from "react";
import { Link } from "react-router-dom";
import BlogList from "./blogs/BlogList";

const Dashboard = () => {
  return (
    <div className="Blogs">
      <BlogList />
      <div className="fixed-action-btn">
        <Link to="/blogs/new" className="Blogs--new btn-floating btn-large red">
          <i className="material-icons">add</i>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
