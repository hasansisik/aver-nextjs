import { getSinglePage } from "@/libs/getSinglePage";
import { generateMetadata as generatePageMetadata } from "@/libs/metadataUtils";
import PageHeader from "@/components/PageHeader";
import ClientSideGlossary from "./ClientSideGlossary";

// Fetch page metadata from content file
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
  const { title, subtitle } = glossaryPage.frontMatter;
  
  return (
    <>
      <PageHeader 
        title={title} 
        subtitle={subtitle}
        className="text-center" 
      />
      <ClientSideGlossary />
    </>
  );
};

export default GlossaryPage; 