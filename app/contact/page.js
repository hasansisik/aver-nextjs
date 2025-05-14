import FaqItem from "@/blocks/FaqItem";
import PageHeader from "@/components/PageHeader";
import { getSinglePage } from "@/libs/getSinglePage";
import ContactForm from "./ContactForm";

const getContactPageData = async () => {
  return getSinglePage("content/contact.md");
}

export const generateMetadata = async () => {
  const contactPage = await getContactPageData();
  return {
    title: contactPage.frontMatter.title,
    description: contactPage.frontMatter.subtitle,
  };
};

const Contact = async () => {
  const contactPage = await getContactPageData();
  const { title, subtitle, contactForm, faq } = contactPage.frontMatter;

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />

      <section className="py-28 bg-white text-dark rounded-b-2xl">
        <div className="container">
          <div className="row justify-center">
            <div
              className="md:col-10 lg:col-5 mb-24 lg:mb-0"
              data-aos="fade-up-sm"
            >
              {contactForm && (
                <div className="mb-10">
                  <h2 className="text-3xl font-medium mb-3 -mt-[6px]">{contactForm.title}</h2>
                </div>
              )}

              <ContactForm data={contactForm} />
              
            </div>
            <div
              className="md:col-10 lg:col-5"
              data-aos="fade-up-sm"
              data-aos-delay="100"
            >
              <div className="pl-0 lg:pl-8">
                <div className="mb-10">
                  <h2 className="text-3xl font-medium mb-3 -mt-[6px]">{faq.title}</h2>
                  <p className="text-black/75">{faq.subtitle}</p>
                </div>
                {faq.qaLists.map((item, index) => (
                  <FaqItem key={index} index={index} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;