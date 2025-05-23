import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ReviewCard from "@/components/review-card";
import ReviewModal from "@/components/review-modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pen, Share, Star, Calendar, Tag, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Book, Review, User } from "@shared/schema";

interface ReviewWithUser extends Review {
  user: User;
  likesCount: number;
}

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewSort, setReviewSort] = useState("recent");
  const { toast } = useToast();

  const { data: book, isLoading: bookLoading } = useQuery<Book>({
    queryKey: [`/api/books/${id}`],
    enabled: !!id,
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<ReviewWithUser[]>({
    queryKey: [`/api/books/${id}/reviews`, reviewSort],
    queryFn: async () => {
      const response = await fetch(`/api/books/${id}/reviews?sortBy=${reviewSort}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    },
    enabled: !!id,
  });

  const addToListMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("POST", "/api/reading-list", {
        bookId: parseInt(id!),
        status,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to reading list",
        description: "Book has been added to your reading list.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddToList = () => {
    addToListMutation.mutate("want_to_read");
  };

  const handleReviewSubmitted = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/books/${id}/reviews`] });
    queryClient.invalidateQueries({ queryKey: [`/api/books/${id}`] });
    setIsReviewModalOpen(false);
  };

  const handleShare = () => {
    if (navigator.share && book) {
      navigator.share({
        title: book.title,
        text: `Check out "${book.title}" by ${book.author} on BookVerse`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Book link has been copied to clipboard.",
      });
    }
  };

  if (bookLoading || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                  <div className="bg-gray-300 rounded-lg h-96 mb-6"></div>
                </div>
                <div className="lg:col-span-2">
                  <div className="h-8 bg-gray-300 rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2 mb-6"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Book Information */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="relative">
                  <img
                    src={book.coverImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"}
                    alt={book.title}
                    className="w-full rounded-lg shadow-2xl mb-6"
                  />
                  {book.averageRating && parseFloat(book.averageRating) > 0 && (
                    <Badge className="absolute top-3 right-3 bg-accent text-gray-900">
                      <Star className="w-3 h-3 mr-1" />
                      {parseFloat(book.averageRating).toFixed(1)}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Button
                    onClick={handleAddToList}
                    disabled={addToListMutation.isPending}
                    className="w-full bg-primary hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Reading List
                  </Button>
                  <Button
                    onClick={() => setIsReviewModalOpen(true)}
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    <Pen className="w-4 h-4 mr-2" />
                    Write a Review
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share Book
                  </Button>
                </div>
              </div>
            </div>

            {/* Book Details and Reviews */}
            <div className="lg:col-span-2">
              {/* Book Info */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
                
                <div className="flex items-center flex-wrap gap-6 mb-6">
                  <div className="flex items-center">
                    <div className="flex text-accent mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(parseFloat(book.averageRating || "0"))
                              ? "fill-current"
                              : ""
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {book.averageRating ? parseFloat(book.averageRating).toFixed(1) : "No rating"}
                    </span>
                    <span className="text-gray-600 ml-2">
                      ({book.reviewCount || 0} reviews)
                    </span>
                  </div>
                  {book.publishedYear && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{book.publishedYear}</span>
                    </div>
                  )}
                  {book.genre && (
                    <div className="flex items-center text-gray-600">
                      <Tag className="w-4 h-4 mr-2" />
                      <span>{book.genre}</span>
                    </div>
                  )}
                </div>

                {book.description && (
                  <div className="prose max-w-none mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{book.description}</p>
                  </div>
                )}

                {/* Book Stats */}
                <Card className="mb-8">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {book.pages || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-600">Pages</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {book.pages ? `${Math.round(book.pages / 250)}h` : "Unknown"}
                        </div>
                        <div className="text-sm text-gray-600">Avg. Reading Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {book.reviewCount || 0}
                        </div>
                        <div className="text-sm text-gray-600">Reviews</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reviews Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Reader Reviews</h3>
                  <Select value={reviewSort} onValueChange={setReviewSort}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="helpful">Most Helpful</SelectItem>
                      <SelectItem value="rating-high">Highest Rating</SelectItem>
                      <SelectItem value="rating-low">Lowest Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {reviewsLoading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/6 mb-4"></div>
                            <div className="space-y-2">
                              <div className="h-3 bg-gray-300 rounded"></div>
                              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No reviews yet. Be the first to review this book!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        bookId={parseInt(id!)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
