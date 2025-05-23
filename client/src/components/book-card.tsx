import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Book } from "@shared/schema";

interface BookCardProps {
  book: Book;
  layout?: "grid" | "list";
}

export default function BookCard({ book, layout = "grid" }: BookCardProps) {
  const { toast } = useToast();

  const addToListMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/reading-list", {
        bookId: book.id,
        status: "want_to_read",
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to reading list",
        description: `"${book.title}" has been added to your reading list.`,
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

  const handleAddToList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToListMutation.mutate();
  };

  const rating = parseFloat(book.averageRating || "0");

  if (layout === "list") {
    return (
      <Link href={`/books/${book.id}`}>
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer">
          <div className="flex space-x-4">
            <img
              src={book.coverImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150"}
              alt={book.title}
              className="w-16 h-24 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 hover:text-primary transition-colors">
                {book.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{book.author}</p>
              <div className="flex items-center mb-2">
                <div className="flex text-accent mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < Math.floor(rating) ? "fill-current" : ""}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
              </div>
              {book.description && (
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                  {book.description.length > 120 
                    ? `${book.description.substring(0, 120)}...`
                    : book.description
                  }
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{book.genre}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddToList}
                  disabled={addToListMutation.isPending}
                  className="text-primary hover:text-blue-700 text-sm"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/books/${book.id}`}>
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-xl transition-shadow">
          <img
            src={book.coverImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=450"}
            alt={book.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {rating > 0 && (
            <Badge className="absolute top-3 right-3 bg-accent text-gray-900">
              <Star className="w-3 h-3 mr-1 fill-current" />
              {rating.toFixed(1)}
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {book.title}
          </h3>
          <p className="text-gray-600 mb-2">{book.author}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{book.genre}</span>
            <span className="text-sm text-gray-500">
              {book.reviewCount || 0} reviews
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
