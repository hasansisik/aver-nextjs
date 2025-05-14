import { getDirectoryPages } from "@/libs/getDirectoryPages";
import { getSinglePage } from "@/libs/getSinglePage";
import PageData from "./PageData";

const getProjectData = async () => {
  const projectPage = getSinglePage("content/project/_index.md")
  const allProjects = getDirectoryPages("content/project")
  return { projectPage, allProjects }
}

export const generateMetadata = async () => {
  const { projectPage } = await getProjectData()
  return {
    title: projectPage.frontMatter.title,
    description: projectPage.frontMatter.subtitle,
  }
}

const ProjectPage = async () => {
  const { projectPage, allProjects } = await getProjectData();
  const totalProjects = allProjects.length
  const { title, subtitle } = projectPage.frontMatter

  return (
    <PageData 
      title={title}
      subtitle={subtitle}
      allProjects={allProjects}
      totalProjects={totalProjects}
    />
  )
}

export default ProjectPage;