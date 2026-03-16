import { useState, useEffect } from 'react';

export interface Bookmark {
  problemId: string;
  userId: string;
  tags: string[];
  createdAt: string;
  notes?: string;
}

export const useBookmarks = (userId: string = 'default-user') => {
  const [bookmarks, setBookmarks] = useState<Record<string, Bookmark>>(() => {
    const saved = localStorage.getItem(`bookmarks_${userId}`);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(bookmarks));
  }, [bookmarks, userId]);

  const toggleBookmark = (problemId: string, autoTags: string[] = []) => {
    setBookmarks(prev => {
      const newBookmarks = { ...prev };
      if (newBookmarks[problemId]) {
        delete newBookmarks[problemId];
      } else {
        newBookmarks[problemId] = {
          problemId,
          userId,
          tags: autoTags.length > 0 ? autoTags : ['Saved'],
          createdAt: new Date().toISOString(),
        };
      }
      return newBookmarks;
    });
  };

  const isBookmarked = (problemId: string) => !!bookmarks[problemId];

  const updateBookmarkTags = (problemId: string, tags: string[]) => {
    setBookmarks(prev => {
      if (!prev[problemId]) return prev;
      return {
        ...prev,
        [problemId]: { ...prev[problemId], tags }
      };
    });
  };

  return {
    bookmarks: Object.values(bookmarks),
    toggleBookmark,
    isBookmarked,
    updateBookmarkTags,
  };
};
