import React from 'react';
import LegalPageLayout from '../layouts/LegalPageLayout';

const sections = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'description', title: '2. Description of the Service' },
  { id: 'registration', title: '3. Account Registration' },
  { id: 'responsibilities', title: '4. User Responsibilities' },
  { id: 'acceptable-use', title: '5. Acceptable Use' },
  { id: 'ai-content', title: '6. AI-Generated Content' },
  { id: 'results', title: '7. Interview and Assessment Results' },
  { id: 'intellectual-property', title: '8. Intellectual Property' },
  { id: 'user-content', title: '9. User Content' },
  { id: 'third-party', title: '10. Third-Party Services' },
  { id: 'payments', title: '11. Payments and Subscriptions' },
  { id: 'refunds', title: '12. Refunds and Cancellations' },
  { id: 'availability', title: '13. Service Availability' },
  { id: 'disclaimers', title: '14. Disclaimers' },
  { id: 'limitation', title: '15. Limitation of Liability' },
  { id: 'termination', title: '16. Termination' },
  { id: 'changes', title: '17. Changes to These Terms' },
  { id: 'contact', title: '18. Contact' }
];

export default function TermsOfService() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="October 2026"
      sections={sections}
      metaTitle="Terms of Service | PrepPilot AI"
      metaDescription="Read the Terms of Service for using PrepPilot AI's interview preparation platform."
    >
      <h2 id="acceptance">1. Acceptance of Terms</h2>
      <p>
        By accessing or using PrepPilot AI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
      </p>

      <h2 id="description">2. Description of the Service</h2>
      <p>
        PrepPilot AI provides an AI-powered interview preparation platform, including mock interviews, resume analysis, career coaching tools, and performance analytics.
      </p>

      <h2 id="registration">3. Account Registration</h2>
      <p>
        To use certain features of the service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.
      </p>

      <h2 id="responsibilities">4. User Responsibilities</h2>
      <p>
        You are responsible for your use of the service and for any content you provide, including compliance with applicable laws, rules, and regulations.
      </p>

      <h2 id="acceptable-use">5. Acceptable Use</h2>
      <p>
        You agree not to misuse the service or help anyone else to do so. This includes, but is not limited to:
      </p>
      <ul>
        <li>Reverse engineering, decompiling, or disassembling the software.</li>
        <li>Attempting to probe, scan, or test the vulnerability of any PrepPilot AI system or network.</li>
        <li>Using the service for any illegal or unauthorized purpose.</li>
      </ul>

      <h2 id="ai-content">6. AI-Generated Content</h2>
      <p>
        AI-generated interview questions, evaluations, recommendations, scores, and feedback are intended for preparation and informational purposes only. PrepPilot AI relies on large language models and other AI technologies which may occasionally produce inaccurate or unexpected outputs.
      </p>

      <h2 id="results">7. Interview and Assessment Results</h2>
      <p>
        Interview scores and recommendations provided by PrepPilot AI are generated based on the available responses and assessment signals. They are not official employer evaluations, guaranteed hiring predictions, or professional career guarantees. PrepPilot AI does not guarantee employment or interview success. Our scores do not equal an employer's hiring decision.
      </p>

      <h2 id="intellectual-property">8. Intellectual Property</h2>
      <p>
        The service and its original content, features, and functionality are and will remain the exclusive property of PrepPilot AI and its licensors. The service is protected by copyright, trademark, and other laws.
      </p>

      <h2 id="user-content">9. User Content</h2>
      <p>
        You retain all rights to any resumes, text, or audio responses you submit to the service. By submitting content, you grant PrepPilot AI a license to use, process, and store that content solely for the purpose of providing the service to you.
      </p>

      <h2 id="third-party">10. Third-Party Services</h2>
      <p>
        Our service may contain links to third-party web sites or services that are not owned or controlled by PrepPilot AI. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
      </p>

      <h2 id="payments">11. Payments and Subscriptions</h2>
      <p>
        Some parts of the service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis depending on your subscription plan. You must provide a valid payment method. By submitting such payment information, you automatically authorize us to charge all subscription fees incurred through your account.
      </p>

      <h2 id="refunds">12. Refunds and Cancellations</h2>
      <p>
        For information regarding subscription cancellations and potential refunds, please refer to our <a href="/refund-policy">Refund & Cancellation Policy</a>.
      </p>

      <h2 id="availability">13. Service Availability</h2>
      <p>
        We continuously update our service and may experience delays in updating information. We cannot guarantee the absolute availability of the service at all times. We reserve the right to change or update information and to correct errors, inaccuracies, or omissions at any time without prior notice.
      </p>

      <h2 id="disclaimers">14. Disclaimers</h2>
      <p>
        Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis. PrepPilot AI expressly disclaims all warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
      </p>

      <h2 id="limitation">15. Limitation of Liability</h2>
      <p>
        In no event shall PrepPilot AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
      </p>

      <h2 id="termination">16. Termination</h2>
      <p>
        We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease.
      </p>

      <h2 id="changes">17. Changes to These Terms</h2>
      <p>
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.
      </p>

      <h2 id="contact">18. Contact</h2>
      <p>
        If you have any questions about these Terms, please contact us via our <a href="/contact">Contact</a> page.
      </p>
    </LegalPageLayout>
  );
}
