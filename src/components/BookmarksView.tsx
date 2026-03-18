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
    <div className="flex flex-col h-full gap-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter uppercase mb-2 flex items-center gap-4">
            <Star className="text-apex-accent fill-apex-accent shadow-[0_0_20px_rgba(16,185,129,0.5)]" size={40} />
            Knowledge Vault
          </h1>
          <p className="text-white/40 font-medium">Secure archive of prioritized neural nodes and problem sets</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          <span className="text-apex-accent">{bookmarks.length}</span> Nodes Secured
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-apex-accent transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by node signature or identifier..."
            className="w-full pl-16 pr-6 py-5 glass rounded-3xl border border-white/5 focus:outline-none focus:border-apex-accent/50 transition-all text-sm font-medium placeholder:text-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 glass px-6 py-2 rounded-3xl border border-white/5">
          <Filter size={18} className="text-white/20" />
          <select 
            className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none cursor-pointer text-white/60"
            value={filterTag || ''}
            onChange={(e) => setFilterTag(e.target.value || null)}
          >
            <option value="" className="bg-apex-black">All Protocols</option>
            {allTags.map(tag => (
              <option key={tag} value={tag} className="bg-apex-black">{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
        {filteredProblems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
            <BookOpen size={120} className="mb-8" />
            <h3 className="text-3xl font-bold uppercase tracking-[0.3em]">Vault Empty</h3>
            <p className="text-sm font-medium tracking-widest">No neural nodes have been prioritized for archival.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProblems.map((p) => (
              <div 
                key={p.id}
                className="glass rounded-[40px] p-8 border border-white/5 hover:border-apex-accent/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 apex-grid opacity-5"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">
                        {p.type === 'multiple' ? 'Discrete Response' : 'Neural Synthesis'}
                      </span>
                      <h3 className="text-xl font-bold tracking-tight leading-tight group-hover:text-apex-accent transition-colors">{p.title || `Node ${p.id}`}</h3>
                    </div>
                    <button 
                      onClick={() => toggleBookmark(p.id)}
                      className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-12">
                    {p.tags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-apex-accent/10 text-apex-accent text-[10px] font-black uppercase tracking-widest rounded-lg border border-apex-accent/20">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-white/20">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button 
                      onClick={() => onSelectProblem(p.id)}
                      className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-apex-accent transition-all group/btn"
                    >
                      Re-Synchronize <ExternalLink size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
