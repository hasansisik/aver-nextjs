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
  const [selectedLetter, setSelectedLetter] = useState('');

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
    setSelectedLetter(''); // Arama yapılınca harf filtresi sıfırlansın
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    setSearchQuery(''); // Harf filtresi yapılınca arama sıfırlansın
  };

  const handleClearFilter = () => {
    setSelectedLetter('');
    setSearchQuery('');
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
    <section className="py-28 bg-[#f5f5f5] min-h-screen">
      <div className="container">
        <div className="row justify-center">
          <div className="col-12 text-center">
            <h2 className="text-4xl font-bold mb-6 text-black">Search Terms</h2>
            <p className="mb-8 text-black">Find any term in our glossary by typing below</p>
            {/* Search input */}
            <div className="max-w-8xl mx-auto mb-16">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for marketing terms..."
                  className="w-full py-4 px-6 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-dark placeholder:text-black"
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
            {/* Alphabetical navigation sadece arama ve harf filtresi yoksa göster */}
            {!searchQuery && !selectedLetter && (
              <div className="mb-16">
                <h3 className="text-2xl font-medium mb-6 text-black">Browse by Letter</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {alphabet.map(letter => (
                    <button
                      key={letter}
                      onClick={() => handleLetterClick(letter)}
                      className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 text-white font-medium rounded hover:bg-primary transition-colors focus:outline-none"
                    >
                      {letter}
                    </button>
                  ))}
                  <button
                    onClick={() => handleLetterClick('#')}
                    className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 text-white font-medium rounded hover:bg-primary transition-colors focus:outline-none"
                  >
                    #
                  </button>
                </div>
              </div>
            )}
            {/* Filtre temizleme butonu */}
            {(selectedLetter || searchQuery) && (
              <div className="mb-8 text-center">
                <button
                  onClick={handleClearFilter}
                  className="inline-block px-6 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Reset
                </button>
              </div>
            )}
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
            {/* Search veya harf filtresi varsa sadece ilgili kartlar, yoksa harf başlıkları ve gruplu kartlar */}
            {(searchQuery || selectedLetter) ? (
              <div className="max-w-8xl mx-auto">
                {(searchQuery ? filteredTerms : groupedTerms[selectedLetter] || []).length === 0 ? null : (
                  Object.entries(
                    (searchQuery
                      ? filteredTerms.reduce((acc, term) => {
                          const letter = term.title.charAt(0).toUpperCase();
                          if (!acc[letter]) acc[letter] = [];
                          acc[letter].push(term);
                          return acc;
                        }, {})
                      : { [selectedLetter]: groupedTerms[selectedLetter] || [] }
                    )
                  ).map(([letter, terms]) => (
                    <div key={letter} id={letter} className="mb-12 max-w-8xl mx-auto bg-white rounded-2xl p-0 shadow-sm">
                      <div className="flex flex-row items-stretch">
                        {/* Harf solda */}
                        <div className="flex flex-col justify-start min-w-[64px] pl-8 pt-8">
                          <span className="text-black text-3xl font-bold leading-none">{letter}</span>
                        </div>
                        {/* Termler sağda */}
                        <div className="flex-1 flex flex-col">
                          {terms.map((term, index) => (
                            <div
                              key={index}
                              className={`flex flex-col items-start py-8 pr-8 pl-8 w-full ${index !== terms.length - 1 ? '' : ''}`}
                            >
                              <span className="text-lg font-semibold text-[#222] mb-2 text-left w-full">{term.title}</span>
                              <span className="text-gray-600 mb-4 w-full text-left">{term.description}</span>
                              <Link href={`/glossary/${term.slug}`} className="inline-flex items-center text-black font-medium hover:underline">
                                Read more
                                <svg className="ml-2" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                              </Link>
                              {index !== terms.length - 1 && (
                                <div className="w-full border-b border-gray-200 mt-8"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <>
                {alphabet.map(letter => (
                  groupedTerms[letter] && groupedTerms[letter].length > 0 && (
                    <div key={letter} id={letter} className="mb-12 max-w-8xl mx-auto bg-white rounded-2xl p-0 shadow-sm">
                      <div className="flex flex-row items-stretch">
                        {/* Harf solda */}
                        <div className="flex flex-col justify-start min-w-[64px] pl-8 pt-8">
                          <span className="text-black text-3xl font-bold leading-none">{letter}</span>
                        </div>
                        {/* Termler sağda */}
                        <div className="flex-1 flex flex-col">
                          {groupedTerms[letter].map((term, index) => (
                            <div
                              key={index}
                              className={`flex flex-col items-start py-8 pr-8 pl-8 w-full ${index !== groupedTerms[letter].length - 1 ? '' : ''}`}
                            >
                              <span className="text-lg font-semibold text-[#222] mb-2 text-left w-full">{term.title}</span>
                              <span className="text-gray-600 mb-4 w-full text-left">{term.description}</span>
                              <Link href={`/glossary/${term.slug}`} className="inline-flex items-center text-black font-medium hover:underline">
                                Read more
                                <svg className="ml-2" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                              </Link>
                              {index !== groupedTerms[letter].length - 1 && (
                                <div className="w-full border-b border-gray-200 mt-8"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </>
            )}
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