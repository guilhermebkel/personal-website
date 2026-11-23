import Link from "next/link";
import { Button } from "@components/Button.tsx";
import { ContentFactory } from "@/Factories/ContentFactory.ts";
import type { Project } from "@/Protocols/ProjectProtocol.ts";

const ProjectList = ({ projects }: { projects: Project[] }) => {
  if (projects.length === 0) {
    return <p className="font-mono text-caption text-text-muted">Projects will show up here.</p>;
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
    <div className="mx-auto max-w-content px-4 py-8">
      <h1>Guilherme Mota</h1>
      <p>Notes on what I build, break and rebuild.</p>
      <Button asChild variant="primary">
        <Link href="/blog/">Read the posts</Link>
      </Button>
      <h2 className="font-mono text-small tracking-wide text-purple-light">Projects</h2>
      <ProjectList projects={projects} />
    </div>
  );
};

export default HomePage;
