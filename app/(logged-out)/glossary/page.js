import { getSinglePage } from "@/libs/getSinglePage";
import { generateMetadata as generatePageMetadata } from "@/libs/metadataUtils";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import ClientSideGlossary from "./ClientSideGlossary";

// Fetch glossary data
const getGlossaryData = async () => {
  return getSinglePage("content/glossary.md");
}

export const generateMetadata = async () => {
  const glossaryPage = await getGlossaryData();
  
  return generatePageMetadata('/glossary', {
    title: glossaryPage.frontMatter.title,
    description: glossaryPage.frontMatter.subtitle,
  });
};

const GlossaryPage = async () => {
  const glossaryPage = await getGlossaryData();
  const { title, subtitle, terms } = glossaryPage.frontMatter;
  
  return (
    <>
      <PageHeader 
        title={title} 
        subtitle={subtitle}
        className="text-center" 
      />
      <ClientSideGlossary terms={terms} />
    </>
  );
};

export default GlossaryPage; 