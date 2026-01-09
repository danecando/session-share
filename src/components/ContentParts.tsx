interface ContentPartsProps {
  content: string | Array<string>;
  className?: string;
}

export function ContentParts({ content, className }: ContentPartsProps) {
  if (!content.length) return null;
  return (
    <div className={className}>
      {(Array.isArray(content) ? content : [content]).map((text, index) => (
        <div key={index} className="whitespace-pre-wrap">
          {text}
        </div>
      ))}
    </div>
  );
}
