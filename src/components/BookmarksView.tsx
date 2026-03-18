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
          <h1 className="text-4xl font-bold heading-tight uppercase mb-2 flex items-center gap-4">
            <Star className="text-accent fill-accent shadow-lg" size={40} />
            지식 저장소
          </h1>
          <p className="text-muted-foreground font-medium">중요 표시한 문제와 학습 개념 보관함</p>
        </div>
        <div className="card px-6 py-3 text-micro">
          <span className="text-accent">{bookmarks.length}</span> 노드 확보됨
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="문제 제목 또는 ID로 검색..."
            className="w-full pl-16 pr-6 py-5 card focus:outline-none focus:border-accent/50 transition-all text-sm font-medium placeholder:text-muted-foreground/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 card px-6 py-2">
          <Filter size={18} className="text-muted-foreground" />
          <select 
            className="bg-transparent text-micro focus:outline-none cursor-pointer text-muted-foreground"
            value={filterTag || ''}
            onChange={(e) => setFilterTag(e.target.value || null)}
          >
            <option value="" className="bg-background">모든 태그</option>
            {allTags.map(tag => (
              <option key={tag} value={tag} className="bg-background">{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
        {filteredProblems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
            <BookOpen size={120} className="mb-8" />
            <h3 className="text-3xl font-bold uppercase tracking-[0.3em]">저장소 비어 있음</h3>
            <p className="text-sm font-medium tracking-widest">보관된 문제가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProblems.map((p) => (
              <div 
                key={p.id}
                className="card p-8 hover:border-accent/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 grid-pattern opacity-5"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col">
                      <span className="text-micro mb-2">
                        {p.type === 'multiple' ? '객관식' : '주관식'}
                      </span>
                      <h3 className="text-xl font-bold heading-tight group-hover:text-accent transition-colors">{p.title || `문제 ${p.id}`}</h3>
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
                      <span key={tag} className="px-3 py-1.5 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded-lg border border-accent/20">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar size={14} />
                      <span className="text-micro">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button 
                      onClick={() => onSelectProblem(p.id)}
                      className="flex items-center gap-3 text-micro text-muted-foreground hover:text-accent transition-all group/btn"
                    >
                      상세 보기 <ExternalLink size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
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
