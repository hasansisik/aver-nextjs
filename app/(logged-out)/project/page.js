"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProjects } from "@/redux/actions/projectActions";
import PageData from "./PageData";

const ProjectPage = () => {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((state) => state.project);
  
  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);
  
  // Default values in case the API hasn't loaded yet
  const title = "Projects";
  const subtitle = "Our portfolio of work";
  
  if (loading && projects.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl mb-4">Loading Projects</h2>
        <p>Please wait while we load our portfolio...</p>
      </div>
    );
  }
  
  return (
    <PageData 
      title={title}
      subtitle={subtitle}
      allProjects={projects}
      totalProjects={projects.length}
    />
  );
};

export default ProjectPage;

