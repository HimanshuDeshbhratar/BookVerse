import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBookSchema, insertReviewSchema, insertReadingListSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Book routes
  app.get('/api/books', async (req, res) => {
    try {
      const { search, genre, rating, year, sortBy, page, limit } = req.query;
      const result = await storage.getBooks({
        search: search as string,
        genre: genre as string,
        rating: rating as string,
        year: year as string,
        sortBy: sortBy as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 12,
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get('/api/books/featured', async (req, res) => {
    try {
      const books = await storage.getFeaturedBooks();
      res.json(books);
    } catch (error) {
      console.error("Error fetching featured books:", error);
      res.status(500).json({ message: "Failed to fetch featured books" });
    }
  });

  app.get('/api/books/:id', async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post('/api/books', isAuthenticated, async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      console.error("Error creating book:", error);
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  // Review routes
  app.get('/api/books/:id/reviews', async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const { sortBy } = req.query;
      const reviews = await storage.getReviewsForBook(bookId, sortBy as string);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/books/:id/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({ ...req.body, bookId });
      const review = await storage.createReview({ ...reviewData, userId });
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.post('/api/reviews/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.likeReview(userId, reviewId);
      res.status(200).json({ message: "Review liked" });
    } catch (error) {
      console.error("Error liking review:", error);
      res.status(500).json({ message: "Failed to like review" });
    }
  });

  app.delete('/api/reviews/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.unlikeReview(userId, reviewId);
      res.status(200).json({ message: "Review unliked" });
    } catch (error) {
      console.error("Error unliking review:", error);
      res.status(500).json({ message: "Failed to unlike review" });
    }
  });

  // Reading list routes
  app.get('/api/reading-list', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.query;
      const readingList = await storage.getReadingList(userId, status as string);
      res.json(readingList);
    } catch (error) {
      console.error("Error fetching reading list:", error);
      res.status(500).json({ message: "Failed to fetch reading list" });
    }
  });

  app.post('/api/reading-list', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const readingListData = insertReadingListSchema.parse(req.body);
      const item = await storage.addToReadingList({ ...readingListData, userId });
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reading list data", errors: error.errors });
      }
      console.error("Error adding to reading list:", error);
      res.status(500).json({ message: "Failed to add to reading list" });
    }
  });

  app.put('/api/reading-list/:bookId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookId = parseInt(req.params.bookId);
      const updates = req.body;
      const item = await storage.updateReadingListItem(userId, bookId, updates);
      res.json(item);
    } catch (error) {
      console.error("Error updating reading list item:", error);
      res.status(500).json({ message: "Failed to update reading list item" });
    }
  });

  app.delete('/api/reading-list/:bookId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookId = parseInt(req.params.bookId);
      await storage.removeFromReadingList(userId, bookId);
      res.status(200).json({ message: "Removed from reading list" });
    } catch (error) {
      console.error("Error removing from reading list:", error);
      res.status(500).json({ message: "Failed to remove from reading list" });
    }
  });

  // User profile routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/users/:id/stats', async (req, res) => {
    try {
      const userId = req.params.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.put('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const currentUserId = req.user.claims.sub;
      
      if (userId !== currentUserId) {
        return res.status(403).json({ message: "Cannot update another user's profile" });
      }

      const updates = req.body;
      const user = await storage.upsertUser({ id: userId, ...updates });
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
