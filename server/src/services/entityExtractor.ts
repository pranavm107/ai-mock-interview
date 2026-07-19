export const extractEntities = (text: string) => {
  // 1. Email extraction & normalization
  const rawEmails = text.match(/[a-zA-Z0-9._%+-]+\s*@\s*[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  const emails = Array.from(new Set(rawEmails.map(e => e.replace(/\s+/g, '').toLowerCase())));

  // 2. Phone extraction & normalization
  const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;
  const rawPhones = text.match(phoneRegex) || [];
  const phones = Array.from(new Set(rawPhones.map(p => {
    let digits = p.replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length > 10 && !p.startsWith('+')) return `+${digits}`;
    if (digits.length > 10 && p.startsWith('+')) return `+${digits}`;
    return p; // fallback
  }).filter(p => p.replace(/\D/g, '').length >= 10)));

  // 3. URL extraction (inclusive of bare domains like github.com/user)
  // Strict regex to prevent matching "React.js", "0.91", etc.
  // Requires http(s):// OR www. OR a known valid TLD.
  const urlRegex = /(?:https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)|(?:[-a-zA-Z0-9@:%._\+~#=]{1,256}\.(?:com|org|net|io|co|app|dev|xyz|me|in|uk|us|edu|gov|tech|site|ai)\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;
  const allUrls = text.match(urlRegex) || [];
  
  // Clean URLs by removing trailing colons/dots and prefixes like "GitHub : "
  const cleanUrls = allUrls.map(url => {
    let cleaned = url.trim().replace(/[:|]+$/, '').trim();
    if (cleaned.toLowerCase().startsWith('github :') || cleaned.toLowerCase().startsWith('github |')) {
      cleaned = cleaned.replace(/^github\s*[:|]\s*/i, '');
    }
    if (cleaned.toLowerCase().startsWith('linkedin :') || cleaned.toLowerCase().startsWith('linkedin |')) {
      cleaned = cleaned.replace(/^linkedin\s*[:|]\s*/i, '');
    }
    return cleaned;
  });

  const linkedin = Array.from(new Set(cleanUrls.filter(url => url.toLowerCase().includes('linkedin.com/in/') || url.toLowerCase().includes('linkedin.com'))));
  const github = Array.from(new Set(cleanUrls.filter(url => url.toLowerCase().includes('github.com'))));
  
  // Exclude list
  const excludeList = ['github.com', 'linkedin.com', 'coursera.org', 'udemy.com', 'medium.com', 'gmail.com', 'yahoo.com', 'hotmail.com'];
  
  const websites = Array.from(new Set(cleanUrls.filter(url => {
    const lower = url.toLowerCase();
    // Exclude emails
    if (lower.includes('@')) return false;
    // Exclude known lists
    if (excludeList.some(ex => lower.includes(ex))) return false;
    return true;
  })));
  
  const portfolioKeywords = ['.xyz', 'vercel.app', 'netlify.app', 'portfolio', 'me.'];
  const portfolio = Array.from(new Set(websites.filter(url => 
    portfolioKeywords.some(kw => url.toLowerCase().includes(kw))
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
