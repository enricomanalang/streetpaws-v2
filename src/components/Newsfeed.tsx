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
  createdAt: Timestamp;
  isPinned?: boolean;
  imageUrl?: string;
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
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            StreetPaws Updates
          </div>
          {hasMorePosts && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:bg-white/20"
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
        <div className="divide-y divide-gray-100">
          {displayedPosts.map((post) => {
            const typeConfig = getPostTypeConfig(post.type);
            const Icon = typeConfig.icon;
            const isEvent = post.type === 'event';
            const isUpcoming = isEvent && post.eventDate && isUpcomingEvent(post.eventDate);

            return (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {post.isPinned && (
                      <Pin className="w-4 h-4 text-orange-500" />
                    )}
                    <Badge className={`${typeConfig.color} border-0`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {typeConfig.label}
                    </Badge>
                    {isEvent && isUpcoming && (
                      <Badge className="bg-green-100 text-green-800 border-0">
                        <Clock className="w-3 h-3 mr-1" />
                        Upcoming
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {formatDate(post.createdAt)}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {post.title}
                </h3>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {post.content}
                </p>

                {isEvent && post.eventDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">Event Details</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Clock className="w-4 h-4" />
                        <span>{formatEventDate(post.eventDate)}</span>
                      </div>
                      {post.eventLocation && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <MapPin className="w-4 h-4" />
                          <span>{post.eventLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
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

        {!isExpanded && hasMorePosts && (
          <div className="p-4 bg-gray-50 border-t">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(true)}
              className="w-full"
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
