"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getGlossaryTermBySlug } from "@/redux/actions/glossaryActions";
import PageHeader from "@/components/PageHeader";
import Markdown from "@/components/ReactMarkdown";
import Link from "next/link";

const GlossaryTermPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { currentTerm, loading, error, glossaryTerms } = useSelector((state) => state.glossary);

  useEffect(() => {
    // Fetch the specific term by slug
    if (slug) {
      dispatch(getGlossaryTermBySlug(slug));
    }
  }, [dispatch, slug]);

  // Get related terms (up to 3 terms from the same category)
  const relatedTerms = currentTerm && glossaryTerms 
    ? glossaryTerms
        .filter(t => t.slug !== slug && t.category === currentTerm.category)
        .slice(0, 3)
    : [];

  if (loading) {
    return (
      <>
        <PageHeader 
          title="Loading..." 
          subtitle="Please wait"
          className="text-center"
        />
        <section className="py-28 bg-white text-dark rounded-b-2xl">
          <div className="container">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-4 text-lg">Sözlük terimi yükleniyor...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error || !currentTerm) {
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

  return (
    <>
      <PageHeader 
        title={currentTerm.title} 
        subtitle={currentTerm.description}
        className="text-center" 
      />

      <section className="py-28 bg-white text-dark rounded-b-2xl">
        <div className="container">
          <div className="row justify-center">
            <div className="md:col-10 lg:col-8">
              <div className="prose prose-lg max-w-none">
                {currentTerm.content ? (
                  <Markdown content={currentTerm.content} />
                ) : (
                  <div>
                    <h2>What is {currentTerm.title}?</h2>
                    <p>{currentTerm.description}</p>
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