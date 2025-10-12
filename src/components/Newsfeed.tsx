'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Pin, 
  Heart, 
  Info, 
  Megaphone,
  AlertCircle,
  Users
} from 'lucide-react';

interface NewsfeedPost {
  id: string;
  title: string;
  content: string;
  type: 'event' | 'update' | 'announcement' | 'success_story';
  eventDate?: string;
  eventLocation?: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp | null;
  isPinned?: boolean;
  imageUrls?: string[];
}

const Newsfeed: React.FC = () => {
  const [posts, setPosts] = useState<NewsfeedPost[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);


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
        
        // Handle null timestamps
        const aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
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

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 48) return 'Yesterday';
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
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

  const displayedPosts = isExpanded ? posts : posts.slice(0, 3);
  const hasMorePosts = posts.length > 3;

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            StreetPaws Updates
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
            <Users className="w-5 h-5 text-blue-600" />
            StreetPaws Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No updates yet. Check back soon for news and events!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-white border-b">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-gray-900">StreetPaws Updates</span>
          </div>
          {hasMorePosts && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show All ({posts.length})
                </>
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          <div className="divide-y divide-gray-100">
            {displayedPosts.map((post) => {
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
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatDate(post.createdAt)}
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h3>

                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Display Images */}
                  {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className="mb-3">
                      <div className={`grid gap-2 ${
                        post.imageUrls.length === 1 ? 'grid-cols-1' :
                        post.imageUrls.length === 2 ? 'grid-cols-2' :
                        post.imageUrls.length === 3 ? 'grid-cols-3' :
                        post.imageUrls.length === 4 ? 'grid-cols-2' :
                        'grid-cols-3'
                      }`}>
                        {post.imageUrls.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Post image ${index + 1}`}
                              className="w-full h-40 object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => window.open(imageUrl, '_blank')}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white bg-opacity-90 rounded-full p-1">
                                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
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
        </div>

        {!isExpanded && hasMorePosts && (
          <div className="p-3 bg-gray-50 border-t">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(true)}
              className="w-full text-sm"
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              Show {posts.length - 3} More Updates
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Newsfeed;
