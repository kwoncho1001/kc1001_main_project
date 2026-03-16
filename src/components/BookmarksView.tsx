import React, { useState } from 'react';
import { useBookmarks } from '../hooks/useBookmarks';
import { Star, Trash2, Filter, Search, ExternalLink, BookOpen, Tag as TagIcon, Calendar } from 'lucide-react';

interface Problem {
  id: string;
  type: 'multiple' | 'subjective';
  options?: string[];
  title?: string;
}

interface BookmarksViewProps {
  problems: Problem[];
  onSelectProblem: (problemId: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({ problems, onSelectProblem }) => {
  const { bookmarks, toggleBookmark } = useBookmarks();
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const bookmarkedProblems = bookmarks.map(b => {
    const problem = problems.find(p => p.id === b.problemId);
    return { ...problem, ...b };
  }).filter(p => p.id !== undefined);

  const allTags = Array.from(new Set(bookmarks.flatMap(b => b.tags)));

  const filteredProblems = bookmarkedProblems.filter(p => {
    const matchesTag = !filterTag || p.tags.includes(filterTag);
    const matchesSearch = !searchQuery || 
      (p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       p.id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[#E4E3E0] p-8 overflow-hidden">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Star className="fill-emerald-500 text-emerald-500" size={32} />
            My Bookmarks
          </h1>
          <div className="bg-white px-4 py-2 rounded-xl border border-black/5 shadow-sm text-xs font-bold uppercase tracking-widest opacity-50">
            {bookmarks.length} Problems Saved
          </div>
        </div>
        <p className="text-black/40 text-sm font-medium">Review and manage your personalized archive of challenging problems.</p>
      </header>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
          <input 
            type="text" 
            placeholder="Search by title or ID..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-black/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-black/5 shadow-sm">
          <Filter size={16} className="opacity-30" />
          <select 
            className="bg-transparent text-xs font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
            value={filterTag || ''}
            onChange={(e) => setFilterTag(e.target.value || null)}
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filteredProblems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <BookOpen size={64} className="mb-4" />
            <h3 className="text-xl font-bold uppercase tracking-widest">No Bookmarks Found</h3>
            <p className="text-sm">Start saving problems during your exam to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProblems.map((p) => (
              <div 
                key={p.id}
                className="bg-white rounded-3xl border border-black/5 p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-1">
                      {p.type === 'multiple' ? 'Multiple Choice' : 'Subjective'}
                    </span>
                    <h3 className="font-bold text-lg leading-tight">{p.title || `Problem ${p.id}`}</h3>
                  </div>
                  <button 
                    onClick={() => toggleBookmark(p.id)}
                    className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {p.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-100">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-black/5">
                  <div className="flex items-center gap-2 opacity-30">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    onClick={() => onSelectProblem(p.id)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-emerald-500 transition-colors"
                  >
                    Solve Again <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
