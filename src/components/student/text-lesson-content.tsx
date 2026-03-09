type TextLessonContentProps = {
  content: string;
};

function hasHtmlMarkup(content: string) {
  return /<[a-z][\s\S]*>/i.test(content);
}

export function TextLessonContent({ content }: TextLessonContentProps) {
  const normalizedContent = content.trim();

  if (hasHtmlMarkup(normalizedContent)) {
    return (
      <article
        className="border-border/70 bg-card mx-auto w-full max-w-3xl rounded-2xl border px-4 py-6 font-[family-name:var(--font-inter)] text-[15px] leading-[1.6] shadow-sm sm:px-6 lg:px-8"
        dangerouslySetInnerHTML={{ __html: normalizedContent }}
      />
    );
  }

  return (
    <article className="border-border/70 bg-card mx-auto w-full max-w-3xl rounded-2xl border px-4 py-6 font-[family-name:var(--font-inter)] text-[15px] leading-[1.6] shadow-sm sm:px-6 lg:px-8">
      <div className="space-y-4 whitespace-pre-wrap">{normalizedContent}</div>
    </article>
  );
}
