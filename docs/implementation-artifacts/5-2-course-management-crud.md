# Story 5.2: Course Management (CRUD)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an admin,
I want to create, edit, and manage Courses with auto-save and publish/draft toggle,
so that I can control what content is available on the platform with full lifecycle management.

## Acceptance Criteria

1. **Given** I am in the admin panel at `/admin/courses`
   **When** the page loads
   **Then** I see a list of ALL courses (both published and draft) with their status badges and action buttons.

2. **Given** I am on the courses list page
   **When** I click "Create New Course"
   **Then** a new blank course is created in the database with `status: 'draft'` and I am redirected to the course editor page `/admin/courses/[courseId]`.

3. **Given** I am on the course editor page `/admin/courses/[courseId]`
   **When** I fill in or update the fields (Title, Description, Thumbnail URL, `isFree` toggle)
   **Then** the changes are auto-saved via Server Actions with debounce (no manual Save button for text fields) (FR21).

4. **Given** I am on the course editor page
   **When** a Thumbnail URL is entered in the input
   **Then** a live preview of the image renders below the input immediately (per architecture: "URL Text Only with Preview").

5. **Given** I am on the course editor page
   **When** I click the "Publish" button (currently `status: 'draft'`)
   **Then** the course `status` is updated to `'published'` in the database and the button toggles to "Unpublish" (FR21).

6. **Given** I am on the course editor page
   **When** I click the "Unpublish" button (currently `status: 'published'`)
   **Then** the course `status` reverts to `'draft'` and it is no longer visible on the public `/courses` catalog.

7. **Given** I am on the courses list page
   **When** I click the "Delete" button on a course
   **Then** a confirmation dialog ("Are you sure? This will also delete all Chapters and Lessons.") appears.

8. **Given** I have confirmed deletion in the dialog
   **When** the Server Action completes
   **Then** the course and all its cascaded child records (chapters, lessons, quizzes) are deleted from the database and the list refreshes.

9. **Given** any form validation error occurs (e.g., title is empty, invalid URL)
   **When** the user blurs away from the field
   **Then** an inline red error message is shown per-field (on-blur validation strategy per UX spec).

10. **Given** an auto-save completes successfully
    **When** in the background
    **Then** a non-blocking Toast notification shows "Draft saved automatically" (NFR-U3).

## Tasks / Subtasks

- [x] **Create Course List page** (AC: 1, 2)
  - [x] Create `project-e-course/src/app/(admin)/admin/courses/page.tsx` as a React Server Component
  - [x] Fetch all courses with `getAllCourses()` query — NO status filter (show all: draft + published)
  - [x] Render `CourseListTable` component showing: Title, Status badge, isFree badge, createdAt, action buttons (Edit, Delete)
  - [x] Add "Create New Course" button that calls a Server Action to create a blank draft and redirect
  - [x] Wrap table in `<Suspense fallback={<CourseListSkeleton />}>` for loading state

- [x] **Create Course Editor page** (AC: 3, 4, 5, 6, 9, 10)
  - [x] Create `project-e-course/src/app/(admin)/admin/courses/[courseId]/page.tsx` as a React Server Component
  - [x] Fetch course by ID server-side with `getCourseById(courseId)` — return 404 if not found
  - [x] Render `CourseEditForm` client component with the course data pre-filled
  - [x] Add "Publish / Unpublish" toggle button (calls separate Server Action `toggleCoursePublishStatus`)
  - [x] Add breadcrumb: `Admin / Courses / [Course Title]`

- [x] **Build `CourseEditForm` client component** (AC: 3, 4, 9, 10)
  - [x] Create `project-e-course/src/components/admin/CourseEditForm.tsx` as `'use client'`
  - [x] Fields: Title (text), Description (textarea), Thumbnail URL (text), isFree (toggle/checkbox)
  - [x] Use `react-hook-form` + `@hookform/resolvers/zod` with `courseUpdateSchema`
  - [x] Implement on-blur validation — show per-field red error messages
  - [x] Implement **debounced auto-save** (500ms delay after last keypress) using `useEffect` + `useCallback`
  - [x] Show thumbnail URL live preview: `<img src={watchedThumbnailUrl} />` below the input when URL is truthy
  - [x] Show Toast ("Draft saved automatically") after successful auto-save via `sonner` toast
  - [x] Disable auto-save if form is invalid (Zod schema fails)

- [x] **Build `CourseListTable` client component** (AC: 1, 7, 8)
  - [x] Create `project-e-course/src/components/admin/CourseListTable.tsx` as `'use client'`
  - [x] Render table with columns: Title, Status (`published` = green badge / `draft` = gray badge), isFree (`Free` = blue badge / `Premium` = purple badge), Actions
  - [x] Delete button triggers shadcn `AlertDialog` for confirmation: "Are you sure? This will also delete all Chapters and Lessons."
  - [x] On confirm: call `deleteCourse(courseId)` Server Action, then `router.refresh()` to revalidate

- [x] **Create Zod validation schemas** (AC: 9)
  - [x] Create `project-e-course/src/lib/validations/course.ts`
  - [x] `courseCreateSchema`: `{ title: z.string().min(1, "Title is required") }` (minimal for blank draft creation)
  - [x] `courseUpdateSchema`: `{ title: z.string().min(1).max(255), description: z.string().optional(), thumbnailUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")), isFree: z.boolean() }`
  - [x] Export both schemas — also export inferred types: `CourseUpdateInput`

- [x] **Create Server Actions for Courses** (AC: 2, 3, 5, 6, 8)
  - [x] Create `project-e-course/src/server/actions/courses/index.ts`
  - [x] `createCourse(): Promise<ActionResponse<{ courseId: string }>>` — inserts blank draft, returns new ID for redirect
  - [x] `updateCourse(courseId: string, data: CourseUpdateInput): Promise<ActionResponse<void>>` — validates with `courseUpdateSchema`, updates DB, calls `revalidatePath('/admin/courses')` and `revalidatePath('/courses')` (public catalog cache)
  - [x] `toggleCoursePublishStatus(courseId: string): Promise<ActionResponse<{ newStatus: string }>>` — flips between `'draft'` and `'published'`, calls `revalidatePath('/courses')` and `revalidatePath('/admin/courses')`
  - [x] `deleteCourse(courseId: string): Promise<ActionResponse<void>>` — deletes course (Cascade Delete will handle children), calls `revalidatePath('/admin/courses')` and `revalidatePath('/courses')`

- [x] **Create database query functions for courses** (AC: 1, 3)
  - [x] Create `project-e-course/src/server/queries/courses.ts` (may already exist from Epic 2 — extend, don't recreate)
  - [x] `getAllCourses(): Promise<Course[]>` — fetch ALL courses regardless of status, ordered by `createdAt DESC`
  - [x] `getCourseById(courseId: string): Promise<Course | undefined>` — single course by primary key
  - [x] Use Drizzle `db.select().from(courses).orderBy(desc(courses.createdAt))`

- [x] **Add Admin Sidebar navigation link** (from Story 5.1 established layout)
  - [x] Open `project-e-course/src/components/admin/AdminSidebar.tsx` (created in Story 5.1)
  - [x] Verify "Courses" nav link (`/admin/courses`) is already present — if not, add it
  - [x] Ensure active state works correctly for `/admin/courses` and `/admin/courses/[courseId]`

## Dev Notes

### 🔴 Critical: Physical Project Root

**ALL source files live under `project-e-course/`**. The `package.json` is at `project-e-course/package.json`. Always prefix all paths with `project-e-course/`. This applies even if `hiring-seefluencer/` is visible at the repo root — it is the **outer monorepo shell**, NOT where the Next.js app lives.

### 🔴 Critical: Admin Zone Is ALWAYS Light Mode

Admin CMS does NOT use dark mode. Per UX spec: "Admin: Pure SaaS minimal — white, 1px borders `#E5E7EB`, no decorations." Do NOT apply `dark:` Tailwind variants inside admin components. The admin layout from Story 5.1 already enforces this via `bg-white` without dark variants.

### 🔴 Critical: Route Group for Admin Pages

Admin pages use the `(admin)` route group pattern (invisible in URL):

- File: `src/app/(admin)/admin/courses/page.tsx` → URL: `/admin/courses`
- File: `src/app/(admin)/admin/courses/[courseId]/page.tsx` → URL: `/admin/courses/[courseId]`

The `(admin)` directory was created in Story 5.1. **DO NOT create a new route group** — extend the existing one.

### 🔴 Critical: Cascade Delete Is Already Configured in Schema

From the architecture and Epic analysis: the Drizzle schema was set up in Story 1.1 with Cascade Delete for the entire content hierarchy:

```
courses → chapters → lessons → quizzes/quiz_attempts
```

This means calling `db.delete(courses).where(eq(courses.id, courseId))` will **automatically delete** all child chapters, lessons, quiz questions, etc. You do NOT need to manually delete children. Just delete the course.

Always confirm the schema's `onDelete: 'cascade'` in `project-e-course/src/server/db/schema.ts` before implementation.

### 🔴 Critical: `revalidatePath` Must Cover BOTH Admin and Public Routes

When a course status changes (publish/unpublish) or is deleted, you MUST revalidate:

1. `/admin/courses` — so the admin list refreshes
2. `/courses` — so the public student catalog ISR cache is busted (from Epic 2, the course catalog uses ISR/`unstable_cache`)

Failing to revalidate `/courses` means students will see stale published/unpublished status.

### 🔴 Critical: Auto-Save Is NOT a "Save" Button

Per UX spec (Anti-Pattern: "Multi-step form wizard" and "Auto-save first for Admin"): **there must be no manual "Save" button** for text content fields (Title, Description, Thumbnail URL, isFree). The form auto-saves via debounce. The only "manual" actions are:

- "Publish / Unpublish" toggle (explicit status change)
- "Delete" (destructive action with confirmation)

### 🔴 Critical: Server Action Return Type

All Server Actions MUST use the `ActionResponse<T>` type from `~/types/index.ts`:

```ts
// From architecture.md — standardized contract
type ActionResponse<T> = { success: true; data: T } | { success: false; error: string };
```

This type is already defined at `project-e-course/src/types/index.ts` from prior stories. Import it, do NOT redefine.

### 🔴 Critical: Redirect After Course Creation

When `createCourse()` creates a blank draft and returns the new `courseId`, the **calling component** must use Next.js `redirect()` (for RSC) or `router.push()` (for client component) to navigate to `/admin/courses/[courseId]`. Since "Create New Course" button is typically a client-side form action, use `useRouter` + call the server action, then redirect:

```ts
const result = await createCourse();
if (result.success) {
	router.push(`/admin/courses/${result.data.courseId}`);
}
```

### 🔵 Drizzle Schema Reference (Courses Table — Already Exists)

```ts
// project-e-course/src/server/db/schema.ts — ALREADY DEFINED, do NOT recreate
export const courses = pgTable('courses', {
	id: varchar('id', { length: 191 })
		.primaryKey()
		.$defaultFn(() => createId()),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	thumbnailUrl: varchar('thumbnail_url', { length: 2048 }),
	isFree: boolean('is_free').notNull().default(false),
	status: varchar('status', { length: 20 }).notNull().default('draft'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**⚠️ IMPORTANT: The `slug` field is required (NOT NULL) in the schema.** When creating a blank draft course via `createCourse()`, you must generate a default slug. Use the `cuid2` ID or a UUID-based temporary slug:

```ts
import { createId } from '@paralleldrive/cuid2';
const tempSlug = `draft-${createId()}`;
```

The slug can be updated later when the admin sets the final title. Do NOT leave slug empty or the INSERT will fail.

### 🔵 Server Actions File Location

Per architecture's Feature-Sliced Actions pattern:

- Server Actions for course mutations → `project-e-course/src/server/actions/courses/index.ts`

Check if this file already exists from Epic 2 stories. If it does, **extend it** rather than creating a new file. Do not create `actions/admin/courses.ts` — the pattern is feature-sliced by domain, not by persona.

### 🔵 Auto-Save Debounce Implementation Pattern

```tsx
// project-e-course/src/components/admin/CourseEditForm.tsx
'use client';
import { useCallback, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { updateCourse } from '~/server/actions/courses';
import { courseUpdateSchema, type CourseUpdateInput } from '~/lib/validations/course';

export function CourseEditForm({ course }: { course: CourseWithId }) {
	const form = useForm<CourseUpdateInput>({
		resolver: zodResolver(courseUpdateSchema),
		defaultValues: {
			title: course.title,
			description: course.description ?? '',
			thumbnailUrl: course.thumbnailUrl ?? '',
			isFree: course.isFree,
		},
	});

	const watchedValues = useWatch({ control: form.control });
	const watchedThumbnailUrl = form.watch('thumbnailUrl');

	const autoSave = useCallback(
		async (data: CourseUpdateInput) => {
			const result = await updateCourse(course.id, data);
			if (result.success) {
				toast.success('Draft saved automatically');
			} else {
				toast.error(`Auto-save failed: ${result.error}`);
			}
		},
		[course.id],
	);

	useEffect(() => {
		if (!form.formState.isValid) return; // Don't save invalid state
		const handler = setTimeout(() => {
			void form.handleSubmit(autoSave)();
		}, 500); // 500ms debounce
		return () => clearTimeout(handler);
	}, [watchedValues]); // Re-run whenever any watched value changes

	return (
		<form>
			{/* Title field */}
			{/* Description field */}
			{/* Thumbnail URL field + live preview */}
			{watchedThumbnailUrl && (
				<img
					src={watchedThumbnailUrl}
					alt="Thumbnail preview"
					className="mt-2 h-32 w-auto rounded border object-cover"
				/>
			)}
			{/* isFree toggle */}
		</form>
	);
}
```

### 🔵 Publish/Unpublish Toggle Pattern

The Publish toggle is a **separate, explicit button** — it is NOT auto-saved. This is deliberate: publishing is a significant action with public visibility impact.

```tsx
// In course editor page or CourseEditForm
<Button
	variant={course.status === 'published' ? 'outline' : 'default'}
	onClick={async () => {
		const result = await toggleCoursePublishStatus(course.id);
		if (result.success) {
			toast.success(
				result.data.newStatus === 'published' ? 'Course is now live!' : 'Course set to draft',
			);
			router.refresh(); // Refresh RSC data
		}
	}}
>
	{course.status === 'published' ? 'Unpublish' : 'Publish Course'}
</Button>
```

### 🔵 Delete Confirmation with AlertDialog

Always wrap destructive delete behind shadcn `AlertDialog`:

```tsx
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '~/components/ui/alert-dialog';

<AlertDialog>
	<AlertDialogTrigger asChild>
		<Button variant="destructive">Delete</Button>
	</AlertDialogTrigger>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Are you sure?</AlertDialogTitle>
			<AlertDialogDescription>
				This will permanently delete this course along with all its Chapters, Lessons, and Quiz
				questions. This action cannot be undone.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction onClick={() => handleDelete(courseId)}>
				Yes, delete course
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>;
```

### 🔵 Course List Query Pattern

```ts
// project-e-course/src/server/queries/courses.ts
import { db } from '~/server/db';
import { courses } from '~/server/db/schema';
import { desc, eq } from 'drizzle-orm';

// Admin: fetch ALL courses (no published filter)
export async function getAllCourses() {
	return db.select().from(courses).orderBy(desc(courses.createdAt));
}

// Admin: fetch single course for editor
export async function getCourseById(courseId: string) {
	const result = await db.select().from(courses).where(eq(courses.id, courseId));
	return result[0];
}
```

> ⚠️ If `courses.ts` already exists (from Epic 2, which uses `getPublishedCourses()`), **add to the existing file** — do NOT create a duplicate.

### 🔵 TypeScript Conventions (Established in Prior Stories)

- **No `any` types** — use `typeof courses.$inferSelect` for Drizzle types
- **File naming:** `kebab-case` for files, `PascalCase` for components
- **Import alias:** `~` maps to `src/` (e.g., `~/server/actions/courses`, `~/components/admin/CourseEditForm`)
- **Server Action return type:** Always `ActionResponse<T>` from `~/types/index.ts`
- **Error boundaries:** Do NOT throw from RSC — wrap in `try/catch` and return `{ success: false, error: message }`

### 🔵 Zod Schema Pattern

```ts
// project-e-course/src/lib/validations/course.ts
import { z } from 'zod';

export const courseUpdateSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
	description: z.string().optional(),
	thumbnailUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')), // Allow empty string (user cleared the field)
	isFree: z.boolean(),
});

export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
```

### 🔵 Status Badge Styling

Use shadcn `Badge` with variant overrides for visual clarity:

```tsx
// Published: green, Draft: gray, isFree: blue, Premium: purple
<Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
  {course.status === 'published' ? 'Published' : 'Draft'}
</Badge>
<Badge variant={course.isFree ? 'outline' : 'secondary'}>
  {course.isFree ? 'Free' : 'Premium'}
</Badge>
```

### 🟡 UX Design Requirements for Admin Zone

Per `ux-design-specification.md`:

- **Admin Publishing Pipeline Journey:** Create course → Add chapters → Add lessons → Publish ← This story covers only the Course level
- **Auto-save First (Admin):** No "Save" button for content fields — uses debounced auto-save
- **Desktop-First:** Admin CMS is optimized for desktop; forms should use clear grid layout
- **Empty States:** If no courses exist, show illustration + "Create New Course" CTA button
- **Feedback:** Toast for auto-save success. AlertDialog for destructive actions.
- **Button placement:** Primary action (Publish) on right-side; Destructive (Delete) uses red `destructive` variant

### 🟡 UX Visual Specification (Pixel-Level)

This section provides the **exact visual implementation details** extracted from `ux-design-directions.html` (the approved HTML mockup) and `ux-design-specification.md`. Developers MUST follow these values precisely — do not invent alternatives.

#### Admin Zone — Color Tokens

| Token                | Value                    | Usage                                 |
| -------------------- | ------------------------ | ------------------------------------- |
| Background (page)    | `bg-white`               | Admin content area background         |
| Background (sidebar) | `bg-gray-50`             | Admin sidebar background              |
| Border               | `border-gray-200`        | All borders in Admin zone (1px)       |
| Primary accent       | `indigo-500` / `#6366F1` | Focus rings, active states            |
| Primary CTA          | `indigo-600` / `#4F46E5` | Publish button bg                     |
| Destructive          | `red-600` / `#EF4444`    | Delete button                         |
| Success              | `green-500` / `#22C55E`  | Published badge                       |
| Text primary         | `text-gray-900`          | Headings, labels                      |
| Text secondary       | `text-gray-500`          | Muted labels, inactive nav            |
| Text label (form)    | `text-gray-600`          | Form field labels                     |
| Shadow               | **NONE** — `shadow-none` | Admin zone is border-only, no shadows |

> ⚠️ **IMPORTANT:** Admin Zone = **always light**. NEVER apply `dark:` variants inside admin components. NEVER add `shadow-*` classes — use border-only design.

#### Admin Sidebar — Exact Tailwind Classes

From the approved HTML mockup (`ux-design-directions.html`, line 294):

```tsx
// Admin sidebar container
<aside className="w-40 border-r border-gray-200 bg-gray-50 p-4">
	// Sidebar title
	<div className="text-xs font-bold text-gray-900 mb-6">Admin Panel</div>
	// Nav list
	<nav className="space-y-1">
		// ACTIVE nav item
		<div className="text-[11px] bg-white border border-gray-200 shadow-sm rounded flex items-center px-2 py-1.5 font-medium text-gray-900">
			Dashboard
		</div>
		// INACTIVE nav item
		<div className="text-[11px] text-gray-500 hover:bg-gray-100 rounded flex items-center px-2 py-1.5">
			Courses
		</div>
	</nav>
</aside>
```

> Note: The admin sidebar in Story 5.1 may have `w-48` (wider). If Story 5.1's sidebar already exists at `AdminSidebar.tsx`, do NOT change its width — the mockup shows `w-40` as reference but the established component width from 5.1 takes precedence. Just verify the active/inactive state classes match.

#### Admin Form Fields — Exact Tailwind Classes

From the approved HTML mockup (`ux-design-directions.html`, lines 319–374):

```tsx
// Form field label
<label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
  Title
</label>

// Text input (normal state)
<input
  type="text"
  className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
/>

// Text input (error state — add on top of normal classes)
<input
  type="text"
  className="w-full border border-red-400 rounded-md px-3 py-1.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
/>

// Textarea (same as input but as textarea)
<textarea
  className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
  rows={4}
/>

// Select element
<select className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-white outline-none">
  <option>Option 1</option>
</select>

// Error message (shown below input on blur)
<p className="mt-1 text-[11px] text-red-500">Title is required</p>
```

#### Admin Form Layout — Grid & Spacing

```tsx
// Form container (single column, constrained width)
<div className="space-y-4 max-w-lg">
	// Two-column grid for paired fields (e.g., Type + Access in lesson form)
	<div className="grid grid-cols-2 gap-3">
		<div>{/* left field */}</div>
		<div>{/* right field */}</div>
	</div>
</div>
```

For the **Course Editor** specifically:

- Title and Description → single column, full width
- Thumbnail URL → single column, full width
- isFree toggle → single row with label on left, toggle on right
- Form container max width: `max-w-lg` (no wider — Admin forms should feel focused, not sprawling)

#### Admin Content Area — Layout Structure

```tsx
// Course editor page layout (RSC page level)
<div className="flex-1 p-6 bg-white min-h-screen">
	{/* Breadcrumb */}
	<nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
		<a href="/admin" className="hover:text-gray-900 transition-colors">
			Admin
		</a>
		<span>/</span>
		<a href="/admin/courses" className="hover:text-gray-900 transition-colors">
			Courses
		</a>
		<span>/</span>
		<span className="text-gray-900 font-medium">{course.title || 'New Course'}</span>
	</nav>

	{/* Page heading row */}
	<div className="flex items-center justify-between mb-6">
		<h1 className="text-lg font-semibold text-gray-900">{course.title || 'Untitled Course'}</h1>
		{/* Publish/Unpublish button — right-aligned */}
		<Button variant={course.status === 'published' ? 'outline' : 'default'}>
			{course.status === 'published' ? 'Unpublish' : 'Publish Course'}
		</Button>
	</div>

	{/* Form */}
	<CourseEditForm course={course} />

	{/* Chapters placeholder (for Story 5.3) */}
	<div className="mt-10 border-t border-gray-200 pt-6">
		<h2 className="text-sm font-semibold text-gray-700 mb-4">Chapters</h2>
		<div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
			Chapters management will be available in the next update.
		</div>
	</div>
</div>
```

#### Admin Breadcrumb — Exact Tailwind Classes

Per UX spec: breadcrumb is mandatory in App/Admin Zone, always shows location hierarchy.

```tsx
// Breadcrumb container
<nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
	<a href="/admin" className="hover:text-gray-900 transition-colors">
		Admin
	</a>
	<span className="text-gray-300">/</span>
	<a href="/admin/courses" className="hover:text-gray-900 transition-colors">
		Courses
	</a>
	<span className="text-gray-300">/</span>
	{/* Current page — not a link, darker text */}
	<span className="text-gray-900 font-medium">{course.title || 'New Course'}</span>
</nav>
```

#### Status & Pricing Badges — Exact Tailwind Classes

Per UX spec color tokens and HTML mockup badge patterns:

```tsx
// Published badge — Green
<span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
  Published
</span>

// Draft badge — Gray
<span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
  Draft
</span>

// Free badge — Teal/Cyan (matches mockup: teal-500/20 bg, teal-400 text)
<span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
  Free
</span>

// Premium badge — Purple
<span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
  Premium
</span>
```

> These can be implemented with shadcn `Badge` using `className` overrides, or as plain `<span>` elements. Either is acceptable — consistency matters more than which approach.

#### Course List Table — Layout & Classes

```tsx
// Page header row
<div className="flex items-center justify-between mb-6">
  <h1 className="text-lg font-semibold text-gray-900">Courses</h1>
  <Button onClick={handleCreateCourse} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2">
    + Create New Course
  </Button>
</div>

// Table wrapper
<div className="rounded-md border border-gray-200 overflow-hidden">
  <table className="w-full text-sm">
    <thead>
      <tr className="bg-gray-50 border-b border-gray-200">
        <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Title</th>
        <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
        <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pricing</th>
        <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Created</th>
        <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 text-sm font-medium text-gray-900">{course.title}</td>
        <td className="px-4 py-3">{/* Status badge */}</td>
        <td className="px-4 py-3">{/* Pricing badge */}</td>
        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(course.createdAt)}</td>
        <td className="px-4 py-3 text-right">
          {/* Edit button */}
          <Button variant="ghost" size="sm" asChild>
            <a href={`/admin/courses/${course.id}`} className="text-xs text-gray-600 hover:text-gray-900">Edit</a>
          </Button>
          {/* Delete button */}
          <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-700 ml-1">Delete</Button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

#### Empty State — When No Courses Exist

Per UX spec anti-pattern rule: "No empty states = confusion; every empty state must have illustration + CTA."

```tsx
// Empty state (shown when courses array is empty)
<div className="flex flex-col items-center justify-center py-24 text-center">
	{/* Simple SVG illustration — clipboard/document icon */}
	<svg
		className="w-16 h-16 text-gray-300 mb-4"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1}
			d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
		/>
	</svg>
	<h3 className="text-sm font-semibold text-gray-900 mb-1">No courses yet</h3>
	<p className="text-xs text-gray-500 mb-6 max-w-xs">
		Get started by creating your first course. It will be saved as a draft until you publish it.
	</p>
	<Button
		onClick={handleCreateCourse}
		className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2"
	>
		+ Create New Course
	</Button>
</div>
```

#### Thumbnail Preview — Exact Tailwind Classes

```tsx
// Thumbnail URL input + live preview
<div>
	<label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
		Thumbnail URL
	</label>
	<input
		type="text"
		placeholder="https://example.com/thumbnail.jpg"
		className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
		{...form.register('thumbnailUrl')}
	/>
	{/* Live preview — only shown when URL is truthy */}
	{watchedThumbnailUrl && (
		<div className="mt-2">
			<img
				src={watchedThumbnailUrl}
				alt="Thumbnail preview"
				className="h-32 w-auto rounded-md border border-gray-200 object-cover"
				onError={(e) => {
					e.currentTarget.style.display = 'none';
				}}
			/>
		</div>
	)}
</div>
```

#### isFree Toggle — Exact Layout

```tsx
// isFree toggle row (label left, toggle right)
<div className="flex items-center justify-between py-3 border-t border-gray-100">
	<div>
		<p className="text-sm font-medium text-gray-900">Free Course</p>
		<p className="text-xs text-gray-500">Students can access without payment</p>
	</div>
	{/* shadcn Switch component */}
	<Switch
		checked={form.watch('isFree')}
		onCheckedChange={(val) => form.setValue('isFree', val)}
		className="data-[state=checked]:bg-indigo-600"
	/>
</div>
```

#### Auto-Save Toast — Exact Configuration

```tsx
// Success toast (after auto-save completes)
toast.success('Draft saved automatically', {
	duration: 2000, // Short — non-intrusive
	position: 'bottom-right',
});

// Error toast (if auto-save fails)
toast.error(`Auto-save failed: ${result.error}`, {
	duration: 4000,
	position: 'bottom-right',
});

// Publish success toast
toast.success('Course is now live!', {
	duration: 3000,
	position: 'bottom-right',
});
```

#### Typography in Admin Zone — Type Scale

| Element             | Tailwind Class                                                     |
| ------------------- | ------------------------------------------------------------------ |
| Page title (h1)     | `text-lg font-semibold text-gray-900`                              |
| Section title (h2)  | `text-sm font-semibold text-gray-700`                              |
| Form label          | `text-[10px] font-semibold text-gray-600 uppercase tracking-wider` |
| Input text          | `text-sm text-gray-900`                                            |
| Helper/muted text   | `text-xs text-gray-500`                                            |
| Table header        | `text-[11px] font-semibold text-gray-500 uppercase tracking-wider` |
| Badge text          | `text-[11px] font-medium`                                          |
| Nav item (active)   | `text-[11px] font-medium text-gray-900`                            |
| Nav item (inactive) | `text-[11px] text-gray-500`                                        |

#### Spacing Conventions in Admin Zone

Per UX spec spacing scale (4px base unit):

| Context                               | Tailwind Class            |
| ------------------------------------- | ------------------------- |
| Page content padding                  | `p-6` (24px)              |
| Section spacing (between form fields) | `space-y-4` (16px gap)    |
| Label → Input gap                     | `mb-1` (4px)              |
| Two-column form grid gap              | `gap-3` (12px)            |
| Sidebar padding                       | `p-4` (16px)              |
| Sidebar section spacing               | `mb-6` (24px)             |
| Table cell padding                    | `px-4 py-3` (16px / 12px) |
| Breadcrumb margin bottom              | `mb-6` (24px)             |
| Page heading margin bottom            | `mb-6` (24px)             |
| Chapters placeholder margin top       | `mt-10` (40px)            |

#### Border Radius Conventions

Per UX spec: App/Admin zone uses `8px–12px` (shadcn default):

| Element                   | Class                             |
| ------------------------- | --------------------------------- |
| Input / Select / Textarea | `rounded-md` (6px shadcn default) |
| Buttons                   | `rounded-md` (shadcn default)     |
| Badges                    | `rounded-full` (9999px pill)      |
| Table wrapper             | `rounded-md`                      |
| Image thumbnail preview   | `rounded-md`                      |
| Empty state icon bg       | none needed                       |

### 🟡 Admin Loop — This Story's Scope

From UX Spec Journey 2 (Publishing Pipeline):

```
Admin Dashboard → Click 'Create New Course' → Draft Course Editor → Edit Basic Info + Set Pricing → Auto-Save → Publish Course
```

This story (5.2) covers: **Course level only** (Create, Edit, Delete, Publish). Chapters (5.3), Lessons (5.4), and Quiz (5.5) are separate stories and will be built in subsequent iterations within the same editor page at `/admin/courses/[courseId]`.

Design the `/admin/courses/[courseId]` editor page with a **placeholder area** at the bottom for "Chapters" section (to be implemented in Story 5.3). This prevents layout surprises later.

### 🟡 Slug Auto-Generation Consideration

The `courses` table has a unique `slug` column used in the public `/courses/[slug]` student route. In this admin story:

- When creating a new blank draft, generate a temporary unique slug (e.g., `draft-${cuid()}`)
- When the admin updates the Title, consider auto-generating a slug from the title as a nice-to-have UX improvement (e.g., `"My Course" → "my-course"`)
- **DO NOT** make slug editing the main focus — it is acceptable to keep the auto-generated slug for MVP

### 🟢 What Already Exists (DO NOT Recreate)

```
project-e-course/src/server/db/schema.ts         — `courses` table (with slug, status, thumbnailUrl, isFree)
project-e-course/src/server/db/index.ts           — `db` Drizzle instance
project-e-course/src/server/auth.ts              — NextAuth with role in JWT
project-e-course/src/middleware.ts               — /admin/* protection
project-e-course/src/types/index.ts              — ActionResponse<T>
project-e-course/src/components/ui/             — All shadcn primitives (badge, button, card, alert-dialog, skeleton, etc.)
project-e-course/src/components/admin/StatCard.tsx  — From Story 5.1
project-e-course/src/components/admin/AdminSidebar.tsx  — From Story 5.1 (with Courses nav link)
project-e-course/src/components/admin/AdminHeader.tsx   — From Story 5.1
project-e-course/src/app/(admin)/admin/layout.tsx   — Admin layout with sidebar
project-e-course/src/server/queries/courses.ts   — CHECK: may have getPublishedCourses() from Epic 2
project-e-course/src/server/actions/courses/     — CHECK: may have actions from Epic 2
```

### 🟢 New Files to Create

```
project-e-course/src/app/(admin)/admin/courses/page.tsx              — Course list RSC page
project-e-course/src/app/(admin)/admin/courses/[courseId]/page.tsx   — Course editor RSC page
project-e-course/src/components/admin/CourseEditForm.tsx              — Auto-save form (client component)
project-e-course/src/components/admin/CourseListTable.tsx             — Course list with delete (client component)
project-e-course/src/lib/validations/course.ts                        — Zod schemas for course
```

### 🟢 Files to Extend (If They Exist)

```
project-e-course/src/server/queries/courses.ts   — Add getAllCourses(), getCourseById() if not already present
project-e-course/src/server/actions/courses/index.ts  — Add createCourse(), updateCourse(), toggleCoursePublishStatus(), deleteCourse()
project-e-course/src/components/admin/AdminSidebar.tsx  — Verify Courses link active state works
```

### Project Structure Notes

- Admin course pages go under `src/app/(admin)/admin/courses/` — consistent with route group pattern
- Admin-specific form components go under `src/components/admin/` — parallel to `CourseListTable`, `CourseEditForm`
- Zod validation schemas go under `src/lib/validations/` — separate from server actions and components
- Server Actions for courses go in `src/server/actions/courses/` — extend existing file, don't duplicate

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 5 overview, Story 5.2 acceptance criteria (FR21), Admin Publishing Pipeline journey, FR21 "Full CRUD: judul, sinopsis, thumbnail URL, slug, isFree, Publikasi vs Draft"]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Feature-Sliced Actions (`server/actions/courses/`), Admin Zone route group `(admin)`, Middleware `/admin/*` protection, URL Text Only media strategy with live preview, Cascade Delete schema, `ActionResponse<T>` standard, Zod dual-layer validation, TypeScript strict mode, `revalidatePath` for ISR cache busting]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Admin Zone: always light, white bg + 1px `#E5E7EB` borders; Auto-save first (no Save button); Desktop-First CMS; AlertDialog for destructive; Toast feedback; Empty states with illustration + CTA; Button hierarchy (Destructive = red, Primary = Indigo right-aligned); Admin emotional goal: Confident & In Control]
- [Source: `_bmad-output/implementation-artifacts/5-1-admin-dashboard-and-analytics.md` — Physical project root `project-e-course/`, Admin layout structure, Admin sidebar with active states, AdminHeader with NavbarProfileDropdown, MobileAdminSidebar pattern, Drizzle `count()` import, kebab-case file naming, `~/` import alias, no `any` types, `ActionResponse<T>` at `~/types/index.ts`, existing schema tables]

## Dev Agent Record

### Agent Model Used

cliproxy/gpt-5.4

### Debug Log References

- `npm test`
- `npx vitest run "src/components/admin/CourseListTable.test.tsx" "src/components/admin/CourseEditForm.test.tsx" "src/app/(admin)/admin/layout.test.tsx" "src/components/admin/AdminHeaderContent.test.tsx"`
- `npm run check`

### Completion Notes List

- Implemented admin course list page with Suspense fallback, empty state CTA, draft/published visibility, and create redirect flow.
- Implemented admin course editor page with breadcrumb, publish/unpublish action, chapter placeholder, and 404 handling.
- Added course validation schemas, course queries, course server actions, alert dialog + switch UI primitives, and active admin sidebar route handling.
- Added Node test coverage for schemas, queries, and course actions plus Vitest coverage for admin table, edit form, and admin shell behavior.

### File List

- `project-e-course/src/app/(admin)/admin/courses/page.tsx`
- `project-e-course/src/app/(admin)/admin/courses/page.test.tsx`
- `project-e-course/src/app/(admin)/admin/courses/[courseId]/page.tsx`
- `project-e-course/src/app/(admin)/admin/courses/[courseId]/page.test.tsx`
- `project-e-course/src/components/admin/AdminHeaderContent.test.tsx`
- `project-e-course/src/components/admin/AdminSidebar.tsx`
- `project-e-course/src/components/admin/CourseEditForm.tsx`
- `project-e-course/src/components/admin/CourseEditForm.test.tsx`
- `project-e-course/src/components/admin/CourseListTable.tsx`
- `project-e-course/src/components/admin/CourseListTable.test.tsx`
- `project-e-course/src/components/admin/MobileAdminSidebar.tsx`
- `project-e-course/src/components/ui/alert-dialog.tsx`
- `project-e-course/src/components/ui/switch.tsx`
- `project-e-course/src/lib/validations/course.ts`
- `project-e-course/src/lib/validations/course.test.ts`
- `project-e-course/src/server/actions/courses/index.ts`
- `project-e-course/src/server/actions/courses/shared.ts`
- `project-e-course/src/server/actions/courses/shared.test.ts`
- `project-e-course/src/server/queries/courses.ts`
- `project-e-course/src/server/queries/courses.shared.ts`
- `project-e-course/src/server/queries/courses.test.ts`
- `project-e-course/src/setup-tests.ts`
- `project-e-course/vitest.config.ts`

### Review Follow-ups (AI)

- [ ] [AI-Review][Medium] Add error toast for failed `createCourse` and `deleteCourse` in `CourseListTable`
- [ ] [AI-Review][Medium] Make `isPublished` boolean aligned with documented enum `status` field
- [ ] [AI-Review][Low] Add `maxLength` to Course title input
- [ ] [AI-Review][Low] Generate nicer slugs instead of default UUID slugs when published

## Change Log

- 2026-03-10: Fixed High Severity UX bugs in `CourseEditForm.tsx` during code review. Form now correctly prevents default submission on Enter key, and auto-save respects the on-blur UX requirement without forcing premature validation errors.
- 2026-03-10: Implemented Story 5.2 admin course CRUD pages, queries, actions, validation, and tests.

## Status

in-progress
