import React from 'react';
import { ArrowDownTrayIcon, EyeIcon, AcademicCapIcon, CalendarIcon, BookOpenIcon } from '@heroicons/react/24/outline';

interface PaperCardProps {
  id: string;
  title: string;
  grade: number;
  subject: string;
  medium: string;
  year: number;
  term: number;
  examType: string;
  pdfUrl: string;
  addedDate?: string;
}

const PaperCard: React.FC<PaperCardProps> = ({
  id,
  title,
  grade,
  subject,
  medium,
  year,
  term,
  examType,
  pdfUrl,
  addedDate,
}) => {
  const getMediumColor = (medium: string) => {
    switch (medium.toLowerCase()) {
      case 'sinhala':
        return 'bg-teal-100 text-teal-800';
      case 'tamil':
        return 'bg-amber-100 text-amber-800';
      case 'english':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Check if paper is new (added within last 7 days)
  const isNew = () => {
    if (!addedDate) return false;
    const added = new Date(addedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - added.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-blue-400 group h-full flex flex-col">
      <div className="p-6 flex-grow flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-grow">
            <div className="flex items-center space-x-2 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-800 text-white">
                Grade {grade}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getMediumColor(medium)}`}>
                {medium}
              </span>
              {isNew() && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse">
                  NEW
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-800 transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </div>
        </div>

        {/* Details with Icons */}
        <div className="flex flex-wrap gap-3 mb-5 text-sm text-slate-700">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
            <AcademicCapIcon className="w-4 h-4 text-blue-600" />
            <span className="font-medium">{subject}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
            <CalendarIcon className="w-4 h-4 text-teal-600" />
            <span>{year}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
            <BookOpenIcon className="w-4 h-4 text-amber-600" />
            <span>Term {term}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-200 mt-auto">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Download PDF
          </a>
          <a
            href={`/paper/${id}`}
            className="flex items-center justify-center px-5 py-2.5 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors duration-200 border border-slate-300 hover:border-slate-400 touch-manipulation"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            View Details
          </a>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="h-1 bg-gradient-to-r from-blue-800 via-teal-700 to-amber-500"></div>
    </div>
  );
};

export default PaperCard;
