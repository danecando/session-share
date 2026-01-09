export const seo = ({
  title,
  description,
  keywords,
  type,
  image,
  article,
}: {
  title: string;
  description?: string;
  keywords?: string;
  type?: string;
  image?: {
    type?: string;
    url: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
  };
  article?: {
    authors?: string | Array<string>;
    section?: string;
    tags?: string | Array<string>;
    publishedTime?: string;
    modifiedTime?: string;
    expirationTime?: string;
  };
}) => {
  const tags = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:card", content: "summary" },
  ];

  if (type) {
    tags.push({ name: "og:type", content: type });
  }

  if (image?.url) {
    tags.push(
      { name: "og:image", content: image.url },
      { name: "twitter:image", content: image.url },
      { name: "twitter:card", content: "summary_large_image" }
    );

    if (image.type) {
      tags.push({ name: "og:image:type", content: image.type });
    }

    if (image.width && image.height) {
      tags.push(
        { name: "og:image:width", content: image.width.toString() },
        { name: "og:image:height", content: image.height.toString() }
      );
    }

    if (image.alt) {
      tags.push({ name: "og:image:alt", content: image.alt });
    }
  }

  if (article && type === "article") {
    if (article.authors) {
      const authors = Array.isArray(article.authors) ? article.authors : [article.authors];
      authors.forEach((author) => {
        tags.push({ name: "og:article:author", content: author });
      });
    }

    if (article.section) {
      tags.push({ name: "og:article:section", content: article.section });
    }

    if (article.tags) {
      const articleTags = Array.isArray(article.tags) ? article.tags : [article.tags];
      articleTags.forEach((tag) => {
        tags.push({ name: "og:article:tag", content: tag });
      });
    }

    if (article.publishedTime) {
      tags.push({ name: "og:published_time", content: article.publishedTime });
    }

    if (article.modifiedTime) {
      tags.push({ name: "og:modified_time", content: article.modifiedTime });
    }

    if (article.expirationTime) {
      tags.push({ name: "og:expiration_time", content: article.expirationTime });
    }
  }

  return tags;
};
