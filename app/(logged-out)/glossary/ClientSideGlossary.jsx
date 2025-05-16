'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getGlossaryTerms } from '@/redux/actions/glossaryActions';
import Link from 'next/link';

// Generate an array of letters for alphabetical navigation
const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

const ClientSideGlossary = () => {
  const dispatch = useDispatch();
  const { glossaryTerms, loading, error } = useSelector((state) => state.glossary);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [groupedTerms, setGroupedTerms] = useState({});

  // Fetch glossary terms from API
  useEffect(() => {
    dispatch(getGlossaryTerms());
  }, [dispatch]);

  // Group terms by first letter
  useEffect(() => {
    if (!glossaryTerms || glossaryTerms.length === 0) return;

    // Prepare terms in the right format
    const terms = glossaryTerms.map(term => ({
      title: term.title,
      description: term.description,
      slug: term.slug,
      category: term.category
    }));

    // Filter terms based on search query
    const filtered = searchQuery
      ? terms.filter(term => 
          term.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          term.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : terms;
    
    setFilteredTerms(filtered);

    // Group filtered terms by first letter
    const grouped = {};
    
    filtered.forEach(term => {
      const firstLetter = term.title.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(term);
    });
    
    setGroupedTerms(grouped);
  }, [glossaryTerms, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <section className="py-28 bg-white text-dark rounded-b-2xl">
        <div className="container">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-4 text-lg">Sözlük terimleri yükleniyor...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-28 bg-white text-dark rounded-b-2xl">
        <div className="container">
          <div className="text-center">
            <p className="text-red-500 text-lg">Sözlük terimleri yüklenirken bir hata oluştu: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-28 bg-white text-dark rounded-b-2xl">
      <div className="container">
        <div className="row justify-center">
          <div className="col-12 text-center">
            <h2 className="text-3xl font-medium mb-6">Search Terms</h2>
            <p className="mb-8">Find any term in our glossary by typing below</p>
            
            {/* Search input */}
            <div className="max-w-4xl mx-auto mb-16">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for marketing terms..."
                  className="w-full py-4 px-6 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-dark"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Alphabetical navigation */}
            <div className="mb-16">
              <h3 className="text-2xl font-medium mb-6">Browse by Letter</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {alphabet.map(letter => (
                  <Link 
                    key={letter} 
                    href={`#${letter}`}
                    className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 text-white font-medium rounded hover:bg-primary transition-colors"
                  >
                    {letter}
                  </Link>
                ))}
                <Link 
                  href="#"
                  className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 text-white font-medium rounded hover:bg-primary transition-colors"
                >
                  #
                </Link>
              </div>
            </div>
            
            {/* Search results message */}
            {searchQuery && (
              <div className="mb-8">
                <p className="text-gray-500">
                  {filteredTerms.length === 0 
                    ? `No results found for "${searchQuery}"` 
                    : `Found ${filteredTerms.length} result${filteredTerms.length !== 1 ? 's' : ''} for "${searchQuery}"`}
                </p>
              </div>
            )}
            
            {/* Terms listing */}
            {alphabet.map(letter => (
              <div key={letter} id={letter} className="mb-16">
                {groupedTerms[letter] && groupedTerms[letter].length > 0 ? (
                  <>
                    <div className="flex items-center mb-8">
                      <div className="inline-block w-16 h-16 bg-gray-900 text-white text-3xl font-bold flex items-center justify-center rounded">
                        {letter}
                      </div>
                      <div className="ml-4 flex-grow border-t border-gray-200"></div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {groupedTerms[letter].map((term, index) => (
                        <Link 
                          href={`/glossary/${term.slug}`} 
                          key={index} 
                          className="block p-6 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
                        >
                          <h3 className="text-xl font-medium mb-2">{term.title}</h3>
                          <p className="text-gray-600 line-clamp-2">{term.description}</p>
                          <div className="mt-3 text-right">
                            <span className="inline-block text-primary font-medium">View details →</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center mb-8">
                      <div className="inline-block w-16 h-16 bg-gray-900 text-white text-3xl font-bold flex items-center justify-center rounded">
                        {letter}
                      </div>
                      <div className="ml-4 flex-grow border-t border-gray-200"></div>
                    </div>
                    <p className="text-gray-500 mb-12">No terms starting with letter {letter}</p>
                  </>
                )}
              </div>
            ))}
            
            {/* No results message when searching */}
            {searchQuery && filteredTerms.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-xl text-gray-500">No glossary terms found matching your search.</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientSideGlossary; 