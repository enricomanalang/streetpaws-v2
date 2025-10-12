'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Pin, 
  Heart, 
  Info, 
  Megaphone,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import useModernModal from '@/components/ui/modern-modal';

interface NewsfeedPost {
  id: string;
  title: string;
  content: string;
  type: 'event' | 'update' | 'announcement' | 'success_story';
  eventDate?: string;
  eventLocation?: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  isPinned?: boolean;
  imageUrls?: string[];
}

const NewsfeedManagement: React.FC = () => {
  const [posts, setPosts] = useState<NewsfeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { confirm, success, error } = useModernModal();

  useEffect(() => {
    if (!firestore) {
      setLoading(false);
      return;
    }

    const postsRef = collection(firestore, 'newsfeed');
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsfeedPost[];

      // Sort: pinned posts first, then by date
      const sortedPosts = postsData.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });

      setPosts(sortedPosts);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getPostTypeConfig = (type: string) => {
    const configs = {
      event: { icon: Calendar, color: 'bg-blue-100 text-blue-800', label: 'Event' },
      update: { icon: Info, color: 'bg-green-100 text-green-800', label: 'Update' },
      announcement: { icon: Megaphone, color: 'bg-orange-100 text-orange-800', label: 'Announcement' },
      success_story: { icon: Heart, color: 'bg-pink-100 text-pink-800', label: 'Success Story' }
    };
    return configs[type as keyof typeof configs] || configs.update;
  };

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const formatEventDate = (eventDate: string) => {
    const date = new Date(eventDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcomingEvent = (eventDate: string) => {
    return new Date(eventDate) > new Date();
  };

  const handleDeletePost = async (postId: string, postTitle: string) => {
    const confirmed = await confirm(
      `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`,
      'Delete Post'
    );

    if (!confirmed) return;

    try {
      if (!firestore) {
        await error('Database connection error. Please refresh the page.', 'Connection Error');
        return;
      }

      const postRef = doc(firestore, 'newsfeed', postId);
      await deleteDoc(postRef);
      
      await success('Post deleted successfully!', 'Success');
    } catch (err) {
      console.error('Error deleting post:', err);
      await error('Failed to delete post. Please try again.', 'Error');
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600" />
            Manage Newsfeed Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600" />
            Manage Newsfeed Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No posts yet. Create your first post to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-blue-600" />
          Manage Newsfeed Posts ({posts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {posts.map((post) => {
            const typeConfig = getPostTypeConfig(post.type);
            const Icon = typeConfig.icon;
            const isEvent = post.type === 'event';
            const isUpcoming = isEvent && post.eventDate && isUpcomingEvent(post.eventDate);

            return (
              <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <Pin className="w-3 h-3 text-orange-500" />
                    )}
                    <Badge className={`${typeConfig.color} border-0 text-xs`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {typeConfig.label}
                    </Badge>
                    {isEvent && isUpcoming && (
                      <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Upcoming
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatDate(post.createdAt)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePost(post.id, post.title)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {post.title}
                </h3>

                <p className="text-sm text-gray-700 mb-3 leading-relaxed line-clamp-3">
                  {post.content}
                </p>

                {/* Display Images Preview */}
                {post.imageUrls && post.imageUrls.length > 0 && (
                  <div className="mb-3">
                    <div className="flex gap-2">
                      {post.imageUrls.slice(0, 3).map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Post image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                      {post.imageUrls.length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                          +{post.imageUrls.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isEvent && post.eventDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium text-sm">Event Details</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-blue-700 text-sm">
                        <Clock className="w-3 h-3" />
                        <span>{formatEventDate(post.eventDate)}</span>
                      </div>
                      {post.eventLocation && (
                        <div className="flex items-center gap-2 text-blue-700 text-sm">
                          <MapPin className="w-3 h-3" />
                          <span>{post.eventLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Posted by {post.authorName}</span>
                  {post.isPinned && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <Pin className="w-3 h-3" />
                      Pinned
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsfeedManagement;
