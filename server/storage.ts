import {
  users,
  books,
  reviews,
  readingLists,
  reviewLikes,
  type User,
  type UpsertUser,
  type Book,
  type Review,
  type ReadingList,
  type InsertBook,
  type InsertReview,
  type InsertReadingList,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, ilike, and, sql, avg, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Book operations
  getBooks(params: {
    search?: string;
    genre?: string;
    rating?: string;
    year?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ books: Book[]; total: number }>;
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  getFeaturedBooks(): Promise<Book[]>;
  
  // Review operations
  getReviewsForBook(bookId: number, sortBy?: string): Promise<(Review & { user: User; likesCount: number })[]>;
  createReview(review: InsertReview & { userId: string }): Promise<Review>;
  likeReview(userId: string, reviewId: number): Promise<void>;
  unlikeReview(userId: string, reviewId: number): Promise<void>;
  
  // Reading list operations
  getReadingList(userId: string, status?: string): Promise<(ReadingList & { book: Book })[]>;
  addToReadingList(item: InsertReadingList & { userId: string }): Promise<ReadingList>;
  updateReadingListItem(userId: string, bookId: number, updates: Partial<InsertReadingList>): Promise<ReadingList>;
  removeFromReadingList(userId: string, bookId: number): Promise<void>;
  
  // User stats
  getUserStats(userId: string): Promise<{
    booksRead: number;
    reviewsWritten: number;
    toReadList: number;
    followers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getBooks(params: {
    search?: string;
    genre?: string;
    rating?: string;
    year?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ books: Book[]; total: number }> {
    const { search, genre, rating, year, sortBy = "popular", page = 1, limit = 12 } = params;
    const offset = (page - 1) * limit;

    let query = db.select().from(books);
    let conditions: any[] = [];

    if (search) {
      conditions.push(
        sql`${books.title} ILIKE ${'%' + search + '%'} OR ${books.author} ILIKE ${'%' + search + '%'}`
      );
    }

    if (genre) {
      conditions.push(eq(books.genre, genre));
    }

    if (rating) {
      const minRating = parseInt(rating.replace('+', ''));
      conditions.push(sql`${books.averageRating} >= ${minRating}`);
    }

    if (year) {
      if (year === 'older') {
        conditions.push(sql`${books.publishedYear} < 2022`);
      } else {
        conditions.push(eq(books.publishedYear, parseInt(year)));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        query = query.orderBy(desc(books.averageRating));
        break;
      case 'recent':
        query = query.orderBy(desc(books.createdAt));
        break;
      case 'title':
        query = query.orderBy(asc(books.title));
        break;
      default: // popular
        query = query.orderBy(desc(books.reviewCount));
        break;
    }

    const booksResult = await query.limit(limit).offset(offset);
    
    // Get total count
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(books);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const [{ count: total }] = await countQuery;

    return { books: booksResult, total };
  }

  async getBook(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }

  async getFeaturedBooks(): Promise<Book[]> {
    return await db
      .select()
      .from(books)
      .orderBy(desc(books.averageRating), desc(books.reviewCount))
      .limit(4);
  }

  async getReviewsForBook(bookId: number, sortBy: string = "recent"): Promise<(Review & { user: User; likesCount: number })[]> {
    let orderBy;
    switch (sortBy) {
      case 'helpful':
        orderBy = desc(sql`likes_count`);
        break;
      case 'rating-high':
        orderBy = desc(reviews.rating);
        break;
      case 'rating-low':
        orderBy = asc(reviews.rating);
        break;
      default: // recent
        orderBy = desc(reviews.createdAt);
        break;
    }

    const result = await db
      .select({
        review: reviews,
        user: users,
        likesCount: sql<number>`COALESCE(COUNT(${reviewLikes.id}), 0)`.as('likes_count'),
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(reviewLikes, eq(reviews.id, reviewLikes.reviewId))
      .where(eq(reviews.bookId, bookId))
      .groupBy(reviews.id, users.id)
      .orderBy(orderBy);

    return result.map(row => ({
      ...row.review,
      user: row.user!,
      likesCount: row.likesCount,
    }));
  }

  async createReview(reviewData: InsertReview & { userId: string }): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    
    // Update book average rating and review count
    await this.updateBookStats(reviewData.bookId);
    
    return review;
  }

  private async updateBookStats(bookId: number): Promise<void> {
    const stats = await db
      .select({
        avgRating: avg(reviews.rating),
        reviewCount: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.bookId, bookId));

    if (stats[0]) {
      await db
        .update(books)
        .set({
          averageRating: stats[0].avgRating?.toString() || "0",
          reviewCount: stats[0].reviewCount || 0,
        })
        .where(eq(books.id, bookId));
    }
  }

  async likeReview(userId: string, reviewId: number): Promise<void> {
    await db.insert(reviewLikes).values({ userId, reviewId }).onConflictDoNothing();
  }

  async unlikeReview(userId: string, reviewId: number): Promise<void> {
    await db
      .delete(reviewLikes)
      .where(and(eq(reviewLikes.userId, userId), eq(reviewLikes.reviewId, reviewId)));
  }

  async getReadingList(userId: string, status?: string): Promise<(ReadingList & { book: Book })[]> {
    let query = db
      .select({
        readingList: readingLists,
        book: books,
      })
      .from(readingLists)
      .leftJoin(books, eq(readingLists.bookId, books.id))
      .where(eq(readingLists.userId, userId));

    if (status) {
      query = query.where(and(eq(readingLists.userId, userId), eq(readingLists.status, status)));
    }

    const result = await query.orderBy(desc(readingLists.createdAt));
    
    return result.map(row => ({
      ...row.readingList,
      book: row.book!,
    }));
  }

  async addToReadingList(item: InsertReadingList & { userId: string }): Promise<ReadingList> {
    const [readingListItem] = await db
      .insert(readingLists)
      .values(item)
      .onConflictDoUpdate({
        target: [readingLists.userId, readingLists.bookId],
        set: { status: item.status, updatedAt: new Date() },
      })
      .returning();
    return readingListItem;
  }

  async updateReadingListItem(userId: string, bookId: number, updates: Partial<InsertReadingList>): Promise<ReadingList> {
    const [updated] = await db
      .update(readingLists)
      .set(updates)
      .where(and(eq(readingLists.userId, userId), eq(readingLists.bookId, bookId)))
      .returning();
    return updated;
  }

  async removeFromReadingList(userId: string, bookId: number): Promise<void> {
    await db
      .delete(readingLists)
      .where(and(eq(readingLists.userId, userId), eq(readingLists.bookId, bookId)));
  }

  async getUserStats(userId: string): Promise<{
    booksRead: number;
    reviewsWritten: number;
    toReadList: number;
    followers: number;
  }> {
    const [booksReadResult] = await db
      .select({ count: count() })
      .from(readingLists)
      .where(and(eq(readingLists.userId, userId), eq(readingLists.status, "read")));

    const [reviewsResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.userId, userId));

    const [toReadResult] = await db
      .select({ count: count() })
      .from(readingLists)
      .where(and(eq(readingLists.userId, userId), eq(readingLists.status, "want_to_read")));

    return {
      booksRead: booksReadResult.count,
      reviewsWritten: reviewsResult.count,
      toReadList: toReadResult.count,
      followers: 0, // TODO: Implement followers system
    };
  }
}

export const storage = new DatabaseStorage();
