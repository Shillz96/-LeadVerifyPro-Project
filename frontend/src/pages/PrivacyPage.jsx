import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="container-custom py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-8 text-center">
          Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none text-text space-y-6">
          <p>
            LeadVerifyPro ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services (collectively, the "Service"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the Service.
          </p>
          <p>
            <em>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em>
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">1. Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect via the Service includes:
          </p>
          <h3 className="text-xl font-semibold text-dark">Personal Data</h3>
          <p>
            Personally identifiable information, such as your name, email address, company name, and payment information, that you voluntarily give to us when you register for the Service or when you choose to participate in various activities related to the Service, such as online chat and message boards.
          </p>
          <h3 className="text-xl font-semibold text-dark">Derivative Data</h3>
          <p>
            Information our servers automatically collect when you access the Service, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Service.
          </p>
          <h3 className="text-xl font-semibold text-dark">Data from Third Parties</h3>
          <p>
            We may receive information about you from third-party sources, such as public databases, social media platforms, data providers, and other partners, to enhance our ability to provide relevant marketing, offers, and services to you. 
          </p>
          <h3 className="text-xl font-semibold text-dark">Data You Provide for Verification</h3>
          <p>
             When you use our lead verification services, you will upload data (e.g., lists of email addresses, phone numbers, company information). We process this data solely for the purpose of providing the verification service to you. We treat this data as confidential and do not use it for any other purpose.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">2. Use of Your Information</h2>
          <p>
            Having accurate information permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Create and manage your account.</li>
            <li>Process your transactions and send you related information, including purchase confirmations and invoices.</li>
            <li>Email you regarding your account or order.</li>
            <li>Provide and deliver the products and services you request.</li>
            <li>Improve our website and services.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
            <li>Notify you of updates to the Service.</li>
            <li>Offer new products, services, and/or recommendations to you.</li>
            <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
            <li>Respond to your comments, questions, and customer service requests.</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-dark pt-4">3. Disclosure of Your Information</h2>
          <p>
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
          </p>
          <h3 className="text-xl font-semibold text-dark">By Law or to Protect Rights</h3>
          <p>
            If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
          </p>
          <h3 className="text-xl font-semibold text-dark">Third-Party Service Providers</h3>
          <p>
            We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
          </p>
          <h3 className="text-xl font-semibold text-dark">Business Transfers</h3>
          <p>
            We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
          </p>
          <h3 className="text-xl font-semibold text-dark">With Your Consent</h3>
          <p>
            We may disclose your personal information for any other purpose with your consent.
          </p>
          <p>
            We do not sell your personal information or the data you upload for verification to third parties.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">4. Tracking Technologies</h2>
          <h3 className="text-xl font-semibold text-dark">Cookies and Web Beacons</h3>
          <p>
            We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Service to help customize the Service and improve your experience. When you access the Service, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default. You can remove or reject cookies, but be aware that such action could affect the availability and functionality of the Service.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">5. Data Security</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">6. Data Retention</h2>
          <p>
            We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
          </p>
          <p>
            Data you upload for verification purposes is retained only as long as necessary to provide the service and is then securely deleted according to our data retention schedules, unless otherwise required by law or agreed with you.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">7. Your Data Protection Rights</h2>
          <p>
            Depending on your location, you may have the following rights regarding your personal data:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The right to access – You have the right to request copies of your personal data.</li>
            <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
            <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
            <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
            <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
            <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
          </ul>
          <p>
            If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us at our provided contact information.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">8. Children's Privacy</h2>
          <p>
            Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. In the case we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">9. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <p>
            Email: <a href="mailto:privacy@leadverifypro.com" className="text-primary hover:underline">privacy@leadverifypro.com</a>
            <br />
            Address: [Your Company Address Here]
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 