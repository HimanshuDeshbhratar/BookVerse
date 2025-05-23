import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  location: varchar("location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  description: text("description"),
  genre: varchar("genre", { length: 100 }),
  publishedYear: integer("published_year"),
  pages: integer("pages"),
  coverImageUrl: varchar("cover_image_url"),
  isbn: varchar("isbn", { length: 13 }),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  bookId: integer("book_id").notNull().references(() => books.id),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const readingLists = pgTable("reading_lists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  bookId: integer("book_id").notNull().references(() => books.id),
  status: varchar("status", { length: 20 }).notNull().default("want_to_read"), // want_to_read, reading, read
  dateRead: timestamp("date_read"),
  userRating: integer("user_rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviewLikes = pgTable("review_likes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  reviewId: integer("review_id").notNull().references(() => reviews.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  readingLists: many(readingLists),
  reviewLikes: many(reviewLikes),
}));

export const booksRelations = relations(books, ({ many }) => ({
  reviews: many(reviews),
  readingLists: many(readingLists),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [reviews.bookId],
    references: [books.id],
  }),
  likes: many(reviewLikes),
}));

export const readingListsRelations = relations(readingLists, ({ one }) => ({
  user: one(users, {
    fields: [readingLists.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [readingLists.bookId],
    references: [books.id],
  }),
}));

export const reviewLikesRelations = relations(reviewLikes, ({ one }) => ({
  user: one(users, {
    fields: [reviewLikes.userId],
    references: [users.id],
  }),
  review: one(reviews, {
    fields: [reviewLikes.reviewId],
    references: [reviews.id],
  }),
}));

// Schemas
export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  averageRating: true,
  reviewCount: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReadingListSchema = createInsertSchema(readingLists).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Book = typeof books.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type ReadingList = typeof readingLists.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertReadingList = z.infer<typeof insertReadingListSchema>;
