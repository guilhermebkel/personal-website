import { join } from "node:path";
import { PostService } from "@/Services/PostService.ts";
import { ProjectService } from "@/Services/ProjectService.ts";

export class ContentFactory {
  static createPostService(): PostService {
    return new PostService(join(process.cwd(), "content", "posts"), join(process.cwd(), "public"));
  }

  static createProjectService(): ProjectService {
    return new ProjectService(join(process.cwd(), "content", "projects"));
  }
}
