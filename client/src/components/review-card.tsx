import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, Reply } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Review, User } from "@shared/schema";

interface ReviewCardProps {
  review: Review & { user: User; likesCount: number };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [hasLiked, setHasLiked] = useState(false);
  const { toast } = useToast();

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (hasLiked) {
        return apiRequest("DELETE", `/api/reviews/${review.id}/like`);
      } else {
        return apiRequest("POST", `/api/reviews/${review.id}/like`);
      }
    },
    onSuccess: () => {
      setHasLiked(!hasLiked);
      // In a real app, you'd want to update the likes count in the cache
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={review.user.profileImageUrl || undefined} />
          <AvatarFallback>
            {getInitials(review.user.firstName, review.user.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">
                {review.user.firstName || review.user.lastName 
                  ? `${review.user.firstName || ""} ${review.user.lastName || ""}`.trim()
                  : "BookVerse User"
                }
              </h4>
              <div className="flex items-center space-x-2">
                <div className="flex text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < review.rating ? "fill-current" : ""}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {formatDate(review.createdAt!)}
                </span>
              </div>
            </div>
          </div>
          {review.title && (
            <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
          )}
          {review.content && (
            <p className="text-gray-700 mb-3">{review.content}</p>
          )}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`hover:text-primary ${hasLiked ? "text-primary" : ""}`}
            >
              <ThumbsUp className={`w-3 h-3 mr-1 ${hasLiked ? "fill-current" : ""}`} />
              {review.likesCount} Helpful
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:text-primary"
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
