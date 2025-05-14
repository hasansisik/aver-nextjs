import PageHeader from "@/components/PageHeader";
import Markdown from "@/components/ReactMarkdown";
import { getSinglePage } from "@/libs/getSinglePage";

const getPrivacyPageData = async () => {
  return getSinglePage("content/privacy.md");
}

export const generateMetadata = async () => {
  const privacyPage = await getPrivacyPageData();
  return {
    title: privacyPage.frontMatter.title,
    description: privacyPage.frontMatter.subtitle,
  };
};

const Privacy = async () => {
  const privacyPage = getSinglePage("content/privacy.md");
  const { title, subtitle } = privacyPage.frontMatter;

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />

      <section className="py-28 bg-white text-dark rounded-b-2xl">
        <div className="container">
          <div className="row justify-center">
            <div className="lg:col-10">
              <div className="content content-dark">
                <Markdown content={privacyPage.content} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Privacy;