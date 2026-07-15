export const extractEntities = (text: string) => {
  const emails = Array.from(new Set(text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []));
  const phones = Array.from(new Set(text.match(/(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g) || []));
  
  const urls = text.match(/https?:\/\/[^\s]+|www\.[^\s]+/gi) || [];
  const linkedin = Array.from(new Set(urls.filter(url => url.toLowerCase().includes('linkedin.com'))));
  const github = Array.from(new Set(urls.filter(url => url.toLowerCase().includes('github.com'))));
  const websites = Array.from(new Set(urls.filter(url => !url.toLowerCase().includes('linkedin.com') && !url.toLowerCase().includes('github.com'))));
  
  // Note: Portfolio might be ambiguous without AI, but we can check for common keywords in URL
  const portfolio = Array.from(new Set(websites.filter(url => 
    url.toLowerCase().includes('portfolio') || 
    url.toLowerCase().includes('me.') || 
    url.toLowerCase().includes('dev')
  )));

  return {
    emails,
    phones,
    linkedin,
    github,
    portfolio,
    websites: websites.filter(w => !portfolio.includes(w))
  };
};
