import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Book, Star, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Book className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">BookVerse</span>
            </div>
            <Button onClick={handleLogin} className="bg-primary hover:bg-blue-700">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-purple text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Discover Your Next{" "}
              <span className="text-accent">Great Read</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of book lovers sharing reviews, discovering new authors, 
              and building their perfect reading list.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleLogin}
                className="bg-accent hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-3 text-lg"
              >
                Get Started
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-8 py-3 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose BookVerse?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect with fellow readers, discover your next favorite book, 
              and share your thoughts with our vibrant community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Book className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Vast Library
                </h3>
                <p className="text-gray-600">
                  Explore thousands of books across every genre imaginable. 
                  From classics to contemporary fiction.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Honest Reviews
                </h3>
                <p className="text-gray-600">
                  Read authentic reviews from real readers and share your own 
                  thoughts to help others discover great books.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Reading Community
                </h3>
                <p className="text-gray-600">
                  Connect with like-minded readers, join book clubs, 
                  and participate in reading challenges.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join BookVerse today and discover your next favorite book.
          </p>
          <Button 
            onClick={handleLogin}
            className="bg-primary hover:bg-blue-700 font-semibold px-8 py-3 text-lg"
          >
            Join BookVerse
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Book className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">BookVerse</span>
              </div>
              <p className="text-gray-400 mb-4">
                Discover your next great read and connect with fellow book lovers 
                in our vibrant community.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Discover</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Featured Books</a></li>
                <li><a href="#" className="hover:text-white transition-colors">New Releases</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bestsellers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Book Genres</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Book Clubs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reading Challenges</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Author Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discussion Forums</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BookVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
