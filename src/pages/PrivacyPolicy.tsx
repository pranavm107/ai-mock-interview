import React from 'react';
import LegalPageLayout from '../layouts/LegalPageLayout';

const sections = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'information-we-collect', title: '2. Information We Collect' },
  { id: 'how-we-use-information', title: '3. How We Use Information' },
  { id: 'ai-data', title: '4. AI and Interview Data' },
  { id: 'resume-profile', title: '5. Resume and Profile Information' },
  { id: 'authentication', title: '6. Authentication Information' },
  { id: 'cookies', title: '7. Cookies & Similar Technologies' },
  { id: 'service-providers', title: '8. Service Providers' },
  { id: 'data-security', title: '9. Data Security' },
  { id: 'data-retention', title: '10. Data Retention' },
  { id: 'your-rights', title: '11. Your Privacy Rights' },
  { id: 'children', title: '12. Children\'s Privacy' },
  { id: 'changes', title: '13. Changes to This Privacy Policy' },
  { id: 'contact', title: '14. Contact Us' }
];

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="October 2026"
      sections={sections}
      metaTitle="Privacy Policy | PrepPilot AI"
      metaDescription="Learn how PrepPilot AI collects, uses, and protects your personal information and interview data."
    >
      <h2 id="introduction">1. Introduction</h2>
      <p>
        Welcome to PrepPilot AI. We respect your privacy and are committed to protecting your personal data. 
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
        and use our AI-powered interview preparation services.
      </p>

      <h2 id="information-we-collect">2. Information We Collect</h2>
      <p>We may collect information about you in a variety of ways when you use our services. The information we may collect includes:</p>
      <ul>
        <li><strong>Personal Data:</strong> Name, email address, and demographic information you voluntarily give to us when registering.</li>
        <li><strong>Professional Data:</strong> Employment history, education, skills, and other information contained in your resume uploads or profile.</li>
        <li><strong>Usage Data:</strong> Information our servers automatically collect when you access the site, such as your IP address, browser type, and interaction with the platform.</li>
      </ul>

      <h2 id="how-we-use-information">3. How We Use Information</h2>
      <p>We use the information we collect primarily to provide, maintain, and improve our services. This includes:</p>
      <ul>
        <li>Generating customized mock interviews based on your profile and target roles.</li>
        <li>Evaluating your interview performance and providing actionable feedback.</li>
        <li>Managing your account and processing transactions securely.</li>
        <li>Improving our algorithms, user experience, and overall platform functionality.</li>
      </ul>

      <h2 id="ai-data">4. AI and Interview Data</h2>
      <p>
        Because PrepPilot AI processes your interview answers to provide real-time feedback, please be aware of how we handle this specific data:
      </p>
      <ul>
        <li><strong>Processing:</strong> Your voice responses, text inputs, and interview transcripts are processed to generate questions, evaluate responses, and identify improvement areas.</li>
        <li><strong>Third-Party AI:</strong> Certain AI-powered features use third-party AI service providers (such as Groq) to process information necessary to provide the requested evaluations.</li>
        <li><strong>Usage limits:</strong> We do not use your personal interview transcripts to train global foundational models. They are used strictly to provide your personalized feedback and analytics dashboard.</li>
      </ul>

      <h2 id="resume-profile">5. Resume and Profile Information</h2>
      <p>
        When you upload your resume, our systems parse and store this data to tailor your interview experience. You may delete or update your resume from your profile dashboard at any time.
      </p>

      <h2 id="authentication">6. Authentication Information</h2>
      <p>
        We use Clerk as our secure authentication provider. We do not store your raw passwords. Clerk handles the secure storage of your credentials, multi-factor authentication, and active sessions.
      </p>

      <h2 id="cookies">7. Cookies and Similar Technologies</h2>
      <p>
        We use cookies and similar tracking technologies to track activity on our service and hold certain information, primarily for essential session management and authentication. For detailed information, please review our <a href="/cookies">Cookie Policy</a>.
      </p>

      <h2 id="service-providers">8. Service Providers</h2>
      <p>
        We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf (e.g., payment processing, data analysis, email delivery, hosting services).
      </p>

      <h2 id="data-security">9. Data Security</h2>
      <p>
        We use administrative, technical, and physical security measures to help protect your personal information. This includes secure transmission (HTTPS) and access controls. However, please note that no method of transmission over the internet or electronic storage is entirely secure. We implement reasonable security safeguards but cannot guarantee absolute security.
      </p>

      <h2 id="data-retention">10. Data Retention</h2>
      <p>
        We retain personal information we collect from you where we have an ongoing legitimate business need to do so (for example, to provide you with a service you have requested or to comply with applicable legal, tax, or accounting requirements).
      </p>

      <h2 id="your-rights">11. Your Privacy Rights</h2>
      <p>
        Depending on your location and applicable law, you may have rights regarding your personal information, including the right to access, correct, update, or request deletion of your personal data. You can manage most of this directly through your account settings or by contacting us.
      </p>

      <h2 id="children">12. Children's Privacy</h2>
      <p>
        Our services are not intended for use by children under the age of 16. We do not knowingly collect personally identifiable information from children under 16.
      </p>

      <h2 id="changes">13. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
      </p>

      <h2 id="contact">14. Contact Us</h2>
      <p>
        If you have questions or comments about this Privacy Policy, please reach out to us through our <a href="/contact">Contact</a> page.
      </p>
    </LegalPageLayout>
  );
}
