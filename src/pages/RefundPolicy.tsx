import React from 'react';
import LegalPageLayout from '../layouts/LegalPageLayout';

const sections = [
  { id: 'cancellation', title: '1. Subscription Cancellation' },
  { id: 'free-plan', title: '2. Free Plan' },
  { id: 'paid-plans', title: '3. Paid Plans' },
  { id: 'refund-eligibility', title: '4. Refund Eligibility' },
  { id: 'failed-payments', title: '5. Failed or Duplicate Payments' },
  { id: 'changes', title: '6. Changes to Plans' },
  { id: 'processing', title: '7. Processing Refunds' },
  { id: 'contact', title: '8. Contact' }
];

export default function RefundPolicy() {
  return (
    <LegalPageLayout
      title="Refund & Cancellation Policy"
      lastUpdated="October 2026"
      sections={sections}
      metaTitle="Refund & Cancellation Policy | PrepPilot AI"
      metaDescription="Review PrepPilot AI's policies regarding subscription cancellations, paid plans, and refunds."
    >
      <h2 id="cancellation">1. Subscription Cancellation</h2>
      <p>
        You may cancel your PrepPilot AI subscription at any time through your account settings. Upon cancellation, you will continue to have access to the premium features of the service through the end of your current paid billing period. We do not automatically issue prorated refunds for the remaining time in your billing cycle.
      </p>

      <h2 id="free-plan">2. Free Plan</h2>
      <p>
        Users on the Free plan are not charged and therefore are not eligible for any refunds. You may delete your free account at any time.
      </p>

      <h2 id="paid-plans">3. Paid Plans</h2>
      <p>
        PrepPilot AI offers paid subscription plans (such as Pro or Enterprise) that provide advanced mock interview generation and deeper analytics. Subscriptions are billed in advance on a recurring basis (e.g., monthly or annually).
      </p>

      <h2 id="refund-eligibility">4. Refund Eligibility</h2>
      <p>
        Because PrepPilot AI incurs immediate costs to generate AI-powered interviews, process transcripts, and utilize advanced language models, all payments are generally non-refundable. However, we review refund requests on a case-by-case basis. You may be eligible for a refund if:
      </p>
      <ul>
        <li>You experienced a significant, reproducible technical failure that prevented you from using the service.</li>
        <li>Your account was charged due to a verifiable billing error on our end.</li>
      </ul>
      <p>
        Requests based on dissatisfaction with the AI's feedback style or lack of usage of the platform are typically not eligible for refunds.
      </p>

      <h2 id="failed-payments">5. Failed or Duplicate Payments</h2>
      <p>
        If your payment method fails, your subscription may be suspended until a valid payment method is provided. If you believe you have been charged twice for the same billing cycle (a duplicate payment), please contact our support team immediately so we can investigate and issue a refund for the duplicate charge.
      </p>

      <h2 id="changes">6. Changes to Plans</h2>
      <p>
        If you upgrade your plan during a billing cycle, you will be charged a prorated amount for the remainder of the cycle. If you downgrade your plan, the new rate will apply at the start of your next billing cycle. We do not provide refunds for plan downgrades.
      </p>

      <h2 id="processing">7. Processing Refunds</h2>
      <p>
        If a refund is approved, it will be processed and a credit will automatically be applied to your credit card or original method of payment, typically within 5-10 business days, depending on your bank or payment processor.
      </p>

      <h2 id="contact">8. Contact</h2>
      <p>
        To submit a refund request or for any billing inquiries, please reach out via our <a href="/contact">Contact</a> page with your account details and a description of your issue.
      </p>
    </LegalPageLayout>
  );
}
