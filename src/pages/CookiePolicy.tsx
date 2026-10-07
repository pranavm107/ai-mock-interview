import React from 'react';
import LegalPageLayout from '../layouts/LegalPageLayout';

const sections = [
  { id: 'what-are-cookies', title: '1. What Are Cookies?' },
  { id: 'how-we-use-cookies', title: '2. How We Use Cookies' },
  { id: 'essential-cookies', title: '3. Essential Cookies' },
  { id: 'authentication-cookies', title: '4. Authentication Cookies' },
  { id: 'analytics-cookies', title: '5. Analytics Cookies' },
  { id: 'preference-cookies', title: '6. Preference Cookies' },
  { id: 'managing-cookies', title: '7. Managing Cookies' },
  { id: 'changes', title: '8. Changes to This Policy' },
  { id: 'contact', title: '9. Contact' }
];

export default function CookiePolicy() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      lastUpdated="October 2026"
      sections={sections}
      metaTitle="Cookie Policy | PrepPilot AI"
      metaDescription="Learn about how PrepPilot AI uses cookies and similar technologies to improve your experience."
    >
      <h2 id="what-are-cookies">1. What Are Cookies?</h2>
      <p>
        Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
      </p>

      <h2 id="how-we-use-cookies">2. How We Use Cookies</h2>
      <p>
        PrepPilot AI uses cookies and similar technologies to ensure our application functions securely, to manage your active sessions, and to understand how you interact with our platform.
      </p>

      <h2 id="essential-cookies">3. Essential Cookies</h2>
      <p>
        These cookies are strictly necessary to provide you with services available through our website and to use some of its features. Because these cookies are strictly necessary to deliver the website, refusing them will have an impact on how our site functions. You can block or delete them by changing your browser settings, but some parts of the site will not work.
      </p>

      <h2 id="authentication-cookies">4. Authentication Cookies</h2>
      <p>
        We use Clerk for our authentication system. Clerk uses strictly necessary cookies to maintain your signed-in state, protect against CSRF attacks, and ensure the security of your account while you navigate between the dashboard and preparation features.
      </p>

      <h2 id="analytics-cookies">5. Analytics Cookies</h2>
      <p>
        If implemented, these cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you. We currently prioritize essential operational cookies over third-party advertising cookies.
      </p>

      <h2 id="preference-cookies">6. Preference Cookies</h2>
      <p>
        These cookies allow us to remember your preferences and settings, such as your selected theme or interface preferences, to provide a more personalized experience during your mock interviews.
      </p>

      <h2 id="managing-cookies">7. Managing Cookies</h2>
      <p>
        You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website (specifically signed-in dashboard areas) may be restricted.
      </p>

      <h2 id="changes">8. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
      </p>

      <h2 id="contact">9. Contact</h2>
      <p>
        If you have any questions about our use of cookies, please reach out via our <a href="/contact">Contact</a> page.
      </p>
    </LegalPageLayout>
  );
}
