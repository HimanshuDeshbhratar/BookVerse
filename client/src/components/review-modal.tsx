import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: number;
  onReviewSubmitted: () => void;
}

export default function ReviewModal({ isOpen, onClose, bookId, onReviewSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();

  const reviewMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/books/${bookId}/reviews`, {
        rating,
        title: title.trim() || undefined,
        content: content.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Your review has been posted successfully.",
      });
      onReviewSubmitted();
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setRating(0);
    setTitle("");
    setContent("");
    setHoveredRating(0);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating for your review.",
        variant: "destructive",
      });
      return;
    }
    reviewMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Your Rating
            </Label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="text-2xl text-gray-300 hover:text-accent transition-colors"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoveredRating || rating)
                        ? "text-accent fill-current"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
              Review Title (Optional)
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Sum up your thoughts..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
            />
          </div>

          {/* Review Content */}
          <div>
            <Label htmlFor="content" className="text-sm font-medium text-gray-700 mb-2 block">
              Your Review (Optional)
            </Label>
            <Textarea
              id="content"
              rows={4}
              placeholder="What did you think about this book? Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length}/2000 characters
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={reviewMutation.isPending || rating === 0}
              className="flex-1 bg-primary hover:bg-blue-700"
            >
              {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={reviewMutation.isPending}
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
