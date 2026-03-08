-- Story 2.3 manual testing seed
-- Safe to re-run: clears Story 2.3 demo rows first.

BEGIN;

DELETE FROM lessons
WHERE chapter_id IN (
  SELECT ch.id
  FROM chapters ch
  INNER JOIN courses c ON c.id = ch.course_id
  WHERE c.slug IN (
    'react-dasar',
    'nextjs-lanjut',
    'draft-course-hidden'
  )
);

DELETE FROM chapters
WHERE course_id IN (
  SELECT id
  FROM courses
  WHERE slug IN (
    'react-dasar',
    'nextjs-lanjut',
    'draft-course-hidden'
  )
);

DELETE FROM courses
WHERE slug IN (
  'react-dasar',
  'nextjs-lanjut',
  'draft-course-hidden'
);

INSERT INTO courses (title, description, thumbnail_url, slug, is_free, is_published)
VALUES
  (
    'React Dasar',
    'Belajar React dari nol sampai memahami komponen, props, state, dan pola UI modern.',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
    'react-dasar',
    true,
    true
  ),
  (
    'Next.js Lanjut',
    'Pendalaman App Router, Server Components, ISR, dan arsitektur production-ready.',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    'nextjs-lanjut',
    false,
    true
  ),
  (
    'Draft Course Hidden',
    'Kursus draft untuk memastikan route detail tidak mengekspos course unpublished.',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    'draft-course-hidden',
    false,
    false
  );

INSERT INTO chapters (course_id, title, description, "order")
SELECT c.id, v.title, v.description, v.display_order
FROM courses c
INNER JOIN (
  VALUES
    ('react-dasar', 'Pengenalan React', 'Konsep dasar dan ekosistem React.', 1),
    ('react-dasar', 'State dan Interaksi', 'Mengelola data dan event pada komponen.', 2),
    ('nextjs-lanjut', 'App Router Fundamentals', 'Menyusun route dan layout modern.', 1),
    ('nextjs-lanjut', 'Caching dan Rendering', 'ISR, streaming, dan strategi performa.', 2),
    ('draft-course-hidden', 'Draft Chapter', 'Konten draft tersembunyi.', 1)
) AS v(slug, title, description, display_order)
  ON c.slug = v.slug;

INSERT INTO lessons (chapter_id, title, type, content, is_free, "order")
SELECT ch.id, v.title, v.lesson_type, v.content, v.is_free, v.display_order
FROM chapters ch
INNER JOIN courses c ON c.id = ch.course_id
INNER JOIN (
  VALUES
    ('react-dasar', 'Pengenalan React', 'Apa itu React?', 'video', 'https://example.com/react-intro', true, 1),
    ('react-dasar', 'Pengenalan React', 'Memahami JSX', 'text', '# JSX Dasar', true, 2),
    ('react-dasar', 'State dan Interaksi', 'useState untuk Pemula', 'video', 'https://example.com/react-state', false, 1),
    ('react-dasar', 'State dan Interaksi', 'Quiz State Dasar', 'quiz', '{"question":"Apa itu state?"}', false, 2),
    ('nextjs-lanjut', 'App Router Fundamentals', 'Struktur Folder App Router', 'text', '# App Router', false, 1),
    ('nextjs-lanjut', 'App Router Fundamentals', 'Nested Layout di Next.js', 'video', 'https://example.com/next-layout', false, 2),
    ('nextjs-lanjut', 'Caching dan Rendering', 'ISR dan Revalidation', 'video', 'https://example.com/next-isr', false, 1),
    ('nextjs-lanjut', 'Caching dan Rendering', 'Quiz Rendering Strategy', 'quiz', '{"question":"Kapan memakai ISR?"}', false, 2),
    ('draft-course-hidden', 'Draft Chapter', 'Hidden Draft Lesson', 'text', '# Hidden', false, 1)
) AS v(slug, chapter_title, title, lesson_type, content, is_free, display_order)
  ON c.slug = v.slug
 AND ch.title = v.chapter_title;

COMMIT;
