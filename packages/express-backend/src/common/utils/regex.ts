export function extractArticleSummary(xmlString: string): string | null {
  const regex = /<article_summary>(.*?)<\/article_summary>/s;
  const match = xmlString.match(regex);

  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}