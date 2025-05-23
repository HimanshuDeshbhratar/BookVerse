import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BookCard from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, MapPin, Calendar, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { User, ReadingList, Book } from "@shared/schema";

interface ReadingListWithBook extends ReadingList {
  book: Book;
}

export default function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const { user: currentUser } = useAuth();
  const profileUserId = userId || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id;

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: [`/api/users/${profileUserId}`],
    enabled: !!profileUserId,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    booksRead: number;
    reviewsWritten: number;
    toReadList: number;
    followers: number;
  }>({
    queryKey: [`/api/users/${profileUserId}/stats`],
    enabled: !!profileUserId,
  });

  const { data: readingList } = useQuery<ReadingListWithBook[]>({
    queryKey: [`/api/reading-list`, "read"],
    queryFn: async () => {
      const response = await fetch(`/api/reading-list?status=read`);
      if (!response.ok) throw new Error("Failed to fetch reading list");
      return response.json();
    },
    enabled: isOwnProfile,
  });

  const { data: wantToReadList } = useQuery<ReadingListWithBook[]>({
    queryKey: [`/api/reading-list`, "want_to_read"],
    queryFn: async () => {
      const response = await fetch(`/api/reading-list?status=want_to_read`);
      if (!response.ok) throw new Error("Failed to fetch reading list");
      return response.json();
    },
    enabled: isOwnProfile,
  });

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <div className="flex items-start space-x-6">
                  <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
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

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-start space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback className="text-xl">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {user.firstName || user.lastName 
                          ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                          : "BookVerse User"
                        }
                      </h1>
                      <p className="text-gray-600">{user.email}</p>
                    </div>
                    {isOwnProfile && (
                      <Button className="bg-primary hover:bg-blue-700">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                  {user.bio && (
                    <p className="text-gray-700 mb-4">{user.bio}</p>
                  )}
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        }) : "Recently"}
                      </span>
                    </div>
                    {user.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{user.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {statsLoading ? "..." : stats?.booksRead || 0}
                </div>
                <div className="text-gray-600">Books Read</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple mb-2">
                  {statsLoading ? "..." : stats?.reviewsWritten || 0}
                </div>
                <div className="text-gray-600">Reviews Written</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-accent mb-2">
                  {statsLoading ? "..." : stats?.toReadList || 0}
                </div>
                <div className="text-gray-600">Want to Read</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {statsLoading ? "..." : stats?.followers || 0}
                </div>
                <div className="text-gray-600">Followers</div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Tabs */}
          {isOwnProfile && (
            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="read-books" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                    <TabsTrigger value="read-books">Read Books</TabsTrigger>
                    <TabsTrigger value="reviews">My Reviews</TabsTrigger>
                    <TabsTrigger value="reading-list">Reading List</TabsTrigger>
                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="read-books" className="p-6">
                    {readingList && readingList.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {readingList.map((item) => (
                          <div key={item.id} className="relative">
                            <BookCard book={item.book} layout="grid" />
                            {item.userRating && (
                              <Badge className="absolute top-2 right-2 bg-accent text-gray-900">
                                <Star className="w-3 h-3 mr-1" />
                                {item.userRating}/5
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No books read yet.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="p-6">
                    <div className="text-center py-12">
                      <p className="text-gray-500">Reviews functionality coming soon!</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reading-list" className="p-6">
                    {wantToReadList && wantToReadList.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wantToReadList.map((item) => (
                          <BookCard key={item.id} book={item.book} layout="grid" />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No books in your reading list yet.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="favorites" className="p-6">
                    <div className="text-center py-12">
                      <p className="text-gray-500">Favorites functionality coming soon!</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
