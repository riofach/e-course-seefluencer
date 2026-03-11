# Hiring Challenge - Database Schema Reference

This document provides reference schemas to help you get started with the database design. Use Drizzle ORM to implement these.

## Database Tables

### 1. Users Table

```typescript
import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const Users = pgTable('users', {
  id: varchar().primaryKey().notNull(),
  email: varchar().notNull().unique(),
  name: varchar(),
  password: varchar().notNull(), // Hashed password
  role: varchar().default('student'), // 'student' | 'admin'
  emailVerified: timestamp(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
```

### 2. Courses Table

```typescript
export const Courses = pgTable('courses', {
  id: varchar().primaryKey().notNull(),
  title: varchar().notNull(),
  description: text().notNull(),
  thumbnail: varchar(),
  slug: varchar().unique(),
  status: varchar().default('draft'), // 'draft' | 'published'
  isFree: boolean().default(false),
  sortOrder: integer().default(0),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
```

### 3. Chapters Table

```typescript
export const Chapters = pgTable('chapters', {
  id: varchar().primaryKey().notNull(),
  courseId: varchar().notNull().references(() => Courses.id, { onDelete: 'cascade' }),
  title: varchar().notNull(),
  description: text(),
  slug: varchar(),
  sortOrder: integer().default(0),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
```

### 4. Lessons Table

```typescript
export const Lessons = pgTable('lessons', {
  id: varchar().primaryKey().notNull(),
  chapterId: varchar().notNull().references(() => Chapters.id, { onDelete: 'cascade' }),
  title: varchar().notNull(),
  description: text(),
  content: text(), // For text-based lessons
  videoUrl: varchar(), // For video lessons
  type: varchar().default('video'), // 'video' | 'text' | 'quiz'
  slug: varchar(),
  sortOrder: integer().default(0),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
```

### 5. User Progress Table

```typescript
export const UserProgress = pgTable('user_progress', {
  id: varchar().primaryKey().notNull(),
  userId: varchar().notNull().references(() => Users.id, { onDelete: 'cascade' }),
  lessonId: varchar().notNull().references(() => Lessons.id, { onDelete: 'cascade' }),
  completed: boolean().default(false),
  completedAt: timestamp(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
```

### 6. Quizzes Table

```typescript
export const Quizzes = pgTable('quizzes', {
  id: varchar().primaryKey().notNull(),
  lessonId: varchar().notNull().references(() => Lessons.id, { onDelete: 'cascade' }),
  question: text().notNull(),
  optionA: varchar().notNull(),
  optionB: varchar().notNull(),
  optionC: varchar().notNull(),
  optionD: varchar().notNull(),
  correctAnswer: varchar().notNull(), // 'A', 'B', 'C', or 'D'
  points: integer().default(10),
  sortOrder: integer().default(0),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
```

### 7. Quiz Attempts Table

```typescript
export const QuizAttempts = pgTable('quiz_attempts', {
  id: varchar().primaryKey().notNull(),
  userId: varchar().notNull().references(() => Users.id, { onDelete: 'cascade' }),
  lessonId: varchar().notNull().references(() => Lessons.id, { onDelete: 'cascade' }),
  score: integer().notNull(), // Total points scored
  totalPoints: integer().notNull(), // Total possible points
  passed: boolean().default(false), // True if score >= 70%
  answers: jsonb(), // Store user's answers: { quizId: 'selectedAnswer' }
  createdAt: timestamp().defaultNow(),
});
```

### 8. Plans Table

```typescript
export const Plans = pgTable('plans', {
  id: varchar().primaryKey().notNull(),
  name: varchar().notNull(), // 'Monthly', 'Yearly', etc.
  description: text(),
  price: integer().notNull(), // Price in cents (e.g., 299900 = $29.99)
  duration: integer().notNull(), // Duration in days (30, 365, etc.)
  features: jsonb(), // Array of features: ['Access to all courses', 'etc']
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
```

### 9. Subscriptions Table

```typescript
export const Subscriptions = pgTable('subscriptions', {
  id: varchar().primaryKey().notNull(),
  userId: varchar().notNull().references(() => Users.id, { onDelete: 'cascade' }),
  planId: varchar().notNull().references(() => Plans.id),
  status: varchar().default('active'), // 'active' | 'expired' | 'cancelled'
  startDate: timestamp().notNull(),
  endDate: timestamp().notNull(),
  paymentProvider: varchar(), // 'stripe', 'midtrans', etc.
  paymentId: varchar(), // External payment ID
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
```

## Example Server Action (Create Course)

```typescript
// app/actions/createCourse.ts
'use server'

import { db } from '@/db/drizzle'
import { Courses } from '@/db/schema'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'

export async function createCourse(data: {
  title: string
  description: string
  slug: string
  isFree?: boolean
}) {
  const session = await getServerSession()
  
  // Check if user is admin
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  const course = await db.insert(Courses).values({
    id: generateId(), // Use cuid2 or similar
    ...data,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning()

  revalidatePath('/courses')
  return course[0]
}
```

## Example Server Action (Get Course with Progress)

```typescript
// app/actions/getCourse.ts
'use server'

import { db } from '@/db/drizzle'
import { Courses, Chapters, Lessons, UserProgress } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { getServerSession } from 'next-auth'

export async function getCourse(slug: string) {
  const session = await getServerSession()
  const userId = session?.user?.id

  // Get course with chapters and lessons
  const course = await db.query.Courses.findFirst({
    where: eq(Courses.slug, slug),
    with: {
      chapters: {
        orderBy: [Chapters.sortOrder],
        with: {
          lessons: {
            orderBy: [Lessons.sortOrder],
          },
        },
      },
    },
  })

  // Get user progress if logged in
  let progress: Record<string, boolean> = {}
  if (userId) {
    const userProgress = await db
      .select()
      .from(UserProgress)
      .where(eq(UserProgress.userId, userId))
    
    progress = userProgress.reduce((acc, p) => {
      acc[p.lessonId] = p.completed
      return acc
    }, {} as Record<string, boolean>)
  }

  return { course, progress }
}
```

## Example .env File

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/course_platform?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Payment Provider (Stripe Example)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Or Midtrans (Alternative)
MIDTRANS_SERVER_KEY="..."
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="..."

# Email (Optional - for notifications)
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourdomain.com"
```

## Quick Start Checklist

- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Set up PostgreSQL database
- [ ] Install Drizzle ORM: `pnpm add drizzle-orm pg` and `pnpm add -D drizzle-kit`
- [ ] Create `db/drizzle.ts` with database connection
- [ ] Define schema in `db/schema/` directory
- [ ] Generate migrations: `pnpm drizzle-kit generate`
- [ ] Run migrations: `pnpm drizzle-kit migrate`
- [ ] Set up NextAuth.js
- [ ] Create seed script for initial data
- [ ] Start building features!

---

**Note:** These are reference schemas. Feel free to adjust based on your implementation needs, but maintain proper relationships and constraints.

