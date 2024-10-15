export function extractArticleSummary(xmlString: string): string | null {
  const regex = /<overall_summary>(.*?)<\/overall_summary>/s;
  const match = xmlString.match(regex);

  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

export function extractCategory(xmlString: string): string {
  const regex = /<category>(.*?)<\/category>/s;
  const match = xmlString.match(regex);

  if (match && match[1]) {
    return match[1].trim();
  }
  return 'Uncategorized';
}

export function extractWeeklyContent(text: string): string | null {
  const match = text?.match(/<weekly_content>[\s\S]*<\/weekly_content>/);
  return match ? match[0] : null;
}

export function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}
