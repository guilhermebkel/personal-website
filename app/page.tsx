import { ContentFactory } from "@/Factories/ContentFactory.ts";
import type { Project } from "@/Protocols/ProjectProtocol.ts";

const ProjectList = ({ projects }: { projects: Project[] }) => {
  if (projects.length === 0) {
    return <p className="meta">Projects will show up here.</p>;
  }
  return (
    <ul>
      {projects.map((project) => (
        <li key={project.name}>
          <a href={project.url}>{project.name}</a>
          {": "}
          {project.description}
        </li>
      ))}
    </ul>
  );
};

const HomePage = async () => {
  const projects = await ContentFactory.createProjectService().listProjects();
  return (
    <div className="page">
      <h1>Guilherme Mota</h1>
      <p>Notes on what I build, break and rebuild.</p>
      <h2 className="label">Projects</h2>
      <ProjectList projects={projects} />
    </div>
  );
};

export default HomePage;
