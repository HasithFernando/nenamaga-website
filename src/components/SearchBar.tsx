import { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react';

interface Paper {
  id: string;
  grade: number;
  subject: string;
  medium: string;
  year: number;
  term: number;
  examType: string;
  title: string;
  pdfUrl: string;
  addedDate: string;
}

interface SearchBarProps {
  papers: Paper[];
}

export default function SearchBar({ papers }: SearchBarProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Paper[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = papers.filter(paper => 
      paper.title.toLowerCase().includes(query) ||
      paper.subject.toLowerCase().includes(query) ||
      paper.grade.toString().includes(query) ||
      paper.year.toString().includes(query) ||
      paper.medium.toLowerCase().includes(query)
    ).slice(0, 10);

    setSearchResults(filtered);
    setIsOpen(true);
  }, [searchQuery, papers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers by grade, subject, year..."
            className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
      </form>

      {isOpen && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {searchResults.map((paper) => (
            <a
              key={paper.id}
              href={`/paper/${paper.id}`}
              className="block px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
              onClick={() => {
                setIsOpen(false);
                setSearchQuery('');
              }}
            >
              <div className="font-medium text-slate-900 text-sm">
                {paper.title}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Grade {paper.grade}
                </span>
                <span>{paper.subject}</span>
                <span>•</span>
                <span>{paper.year}</span>
                <span>•</span>
                <span>{paper.medium}</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {isOpen && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-4">
          <p className="text-sm text-slate-600 text-center">
            No papers found. Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}
