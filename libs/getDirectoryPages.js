import { sortByDate } from "@/utils/sortByDate";
import fs from "fs";
import matter from "gray-matter";
import path from "path";

export const getDirectoryPages = (directory, length) => {
  const dirFiles = fs.readdirSync(path.join(directory));
  const pages = dirFiles.filter((file) => file.match(/^(?!_)/));

  const returnDirFiles = pages.map((filename) => {
    const slug = filename.replace(".md", "");
    const dirFileContents = fs.readFileSync(
      path.join(directory, filename),
      "utf8"
    );

    const { data: frontMatter, content } = matter(dirFileContents);

    return {
      slug,
      frontMatter,
      content,
    };
  });
  return returnDirFiles.sort(sortByDate).slice(0, length);
};
