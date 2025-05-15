"use client"

import { useState } from 'react'
import ClientPageWrapper from '@/app/_components/ClientPageWrapper'
import useSeoSettings from '@/app/_hooks/useSeoSettings'
import PageHeader from '@/components/PageHeader'

const ClientExamplePage = () => {
  const [count, setCount] = useState(0)
  
  // Use the hook to get SEO settings for this page
  const seoData = useSeoSettings(
    'Client Example - Interactive Page',
    'This is an example of a client component page with SEO settings.',
    'client, example, nextjs, seo'
  )
  
  return (
    <ClientPageWrapper
      title={seoData.title}
      description={seoData.description}
      keywords={seoData.keywords}
    >
      <PageHeader 
        title={seoData.isLoading ? 'Loading...' : seoData.title} 
        subtitle="This page demonstrates SEO with client components" 
      />
      
      <section className="py-28">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <h2 className="text-3xl mb-8">Interactive Client Component</h2>
                <p className="mb-6">
                  This page is using the <code>ClientPageWrapper</code> component to set metadata
                  on the client side. This is useful for pages that need to be client components.
                </p>
                
                <div className="mb-10">
                  <div className="text-6xl font-bold mb-4">{count}</div>
                  <button 
                    onClick={() => setCount(count + 1)}
                    className="bg-white text-dark px-8 py-3 rounded-md mr-4 hover:bg-white/80"
                  >
                    Increment
                  </button>
                  <button 
                    onClick={() => setCount(0)}
                    className="bg-white/20 text-white px-8 py-3 rounded-md hover:bg-white/30"
                  >
                    Reset
                  </button>
                </div>
                
                <div className="mt-10 p-6 bg-white/5 rounded-lg max-w-2xl mx-auto text-left">
                  <h3 className="text-xl mb-4">Current SEO Settings:</h3>
                  <div className="space-y-2 text-white/80">
                    <p><strong>Title:</strong> {seoData.title || '(none)'}</p>
                    <p><strong>Description:</strong> {seoData.description || '(none)'}</p>
                    <p><strong>Keywords:</strong> {seoData.keywords || '(none)'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ClientPageWrapper>
  )
}

export default ClientExamplePage 