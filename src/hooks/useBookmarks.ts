import { useState, useEffect } from 'react';
import { FirebaseService } from '../services/firebaseService';
import { useAuth } from '../components/AuthProvider';

export interface Bookmark {
  problemId: string;
  userId: string;
  tags: string[];
  createdAt: string;
  notes?: string;
}

export const useBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Record<string, Bookmark>>({});

  useEffect(() => {
    if (user) {
      const unsubscribe = FirebaseService.subscribeToBookmarks((ids) => {
        const newBookmarks: Record<string, Bookmark> = {};
        ids.forEach(id => {
          newBookmarks[id] = {
            problemId: id,
            userId: user.uid,
            tags: ['Saved'],
            createdAt: new Date().toISOString()
          };
        });
        setBookmarks(newBookmarks);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const toggleBookmark = async (problemId: string, autoTags: string[] = []) => {
    if (!user) return;

    if (bookmarks[problemId]) {
      await FirebaseService.deleteBookmark(problemId);
    } else {
      await FirebaseService.saveBookmark(problemId, 'Problem ' + problemId);
    }
  };

  const isBookmarked = (problemId: string) => !!bookmarks[problemId];

  const updateBookmarkTags = (problemId: string, tags: string[]) => {
    // Note: Tag update not fully implemented in FirebaseService yet, 
    // but we can extend it if needed.
  };

  return {
    bookmarks: Object.values(bookmarks),
    toggleBookmark,
    isBookmarked,
    updateBookmarkTags,
  };
};
