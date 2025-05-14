import Link from "next/link";

const NotFound = () => {
  return (
    // <Layout metaTitle="Page Not Found">
    <>
      <section className="py-28 rounded-b-2xl">
        <div className="container">
          <div className="row justify-center">
            <div className="lg:col-10">
              <div className="text-center">
                <h1 className="font-medium mb-4 text-white/75">404</h1>
                <p className="text-6xl -ml-4 -mb-2 -rotate-12 text-white/50">Page</p>
                <p className="text-6xl">Not</p>
                <p className="text-6xl -rotate-12 -mt-4 ml-2 text-white/50">Found</p>
                <Link href="/" className="button mt-12">
                  <span>Back to home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default NotFound;