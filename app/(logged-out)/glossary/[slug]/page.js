import PageHeader from "@/components/PageHeader";
import Markdown from "@/components/ReactMarkdown";
import { getSinglePage } from "@/libs/getSinglePage";
import { generateMetadata as generatePageMetadata } from "@/libs/metadataUtils";
import Link from "next/link";

// Fetch glossary data
const getGlossaryData = async () => {
  return getSinglePage("content/glossary.md");
}

// Generate all possible paths for static generation
export async function generateStaticParams() {
  const glossaryPage = await getGlossaryData();
  return glossaryPage.frontMatter.terms.map((term) => ({
    slug: term.slug,
  }));
}

export const generateMetadata = async ({ params }) => {
  const { slug } = params;
  const glossaryPage = await getGlossaryData();
  const term = glossaryPage.frontMatter.terms.find((t) => t.slug === slug);

  if (!term) {
    return {
      title: "Term Not Found",
      description: "The glossary term you're looking for does not exist.",
    };
  }

  return generatePageMetadata(`/glossary/${slug}`, {
    title: `${term.title} - Glossary`,
    description: term.description,
  });
};

const GlossaryTermPage = async ({ params }) => {
  const { slug } = params;
  const glossaryPage = await getGlossaryData();
  const term = glossaryPage.frontMatter.terms.find((t) => t.slug === slug);

  if (!term) {
    return (
      <>
        <PageHeader 
          title="Term Not Found" 
          subtitle="The glossary term you're looking for does not exist."
          className="text-center"
        />
        <section className="py-28 bg-white text-dark rounded-b-2xl">
          <div className="container">
            <div className="flex justify-center">
              <Link href="/glossary" className="btn btn-primary">
                Back to Glossary
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Get related terms (optional)
  const relatedTerms = glossaryPage.frontMatter.terms
    .filter((t) => t.slug !== slug && t.category === term.category)
    .slice(0, 3);

  return (
    <>
      <PageHeader 
        title={term.title} 
        subtitle={term.description}
        className="text-center" 
      />

      <section className="py-28 bg-white text-dark rounded-b-2xl">
        <div className="container">
          <div className="row justify-center">
            <div className="md:col-10 lg:col-8">
              <div className="prose prose-lg max-w-none">
                {term.content && <Markdown content={term.content} />}
                
                {!term.content && (
                  <div>
                    <h2>What is {term.title}?</h2>
                    <p>{term.description}</p>
                  </div>
                )}
              </div>

              {/* Navigate back button */}
              <div className="mt-16 mb-10 flex">
                <Link href="/glossary" className="inline-flex items-center text-primary hover:text-primary-dark font-medium transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M19 12H5"></path>
                    <path d="M12 19l-7-7 7-7"></path>
                  </svg>
                  Back to Glossary
                </Link>
              </div>
              
              {/* Related terms section */}
              {relatedTerms.length > 0 && (
                <div className="mt-16 pt-10 border-t border-gray-200">
                  <h3 className="text-2xl font-medium mb-6">Related Terms</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {relatedTerms.map((relatedTerm, index) => (
                      <Link 
                        key={index} 
                        href={`/glossary/${relatedTerm.slug}`}
                        className="block p-6 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
                      >
                        <h4 className="text-lg font-medium mb-2">{relatedTerm.title}</h4>
                        <p className="text-gray-600 text-sm line-clamp-2">{relatedTerm.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default GlossaryTermPage; 