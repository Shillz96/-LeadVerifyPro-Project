import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="container-custom py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-8 text-center">
          Terms of Service
        </h1>

        <div className="prose prose-lg max-w-none text-text space-y-6">
          <p>
            Welcome to LeadVerifyPro! These Terms of Service ("Terms") govern your access to and use of the LeadVerifyPro services, website, and any associated software (collectively, the "Service") provided by LeadVerifyPro ("we," "us," or "our"). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">1. Acceptance of Terms</h2>
          <p>
            By creating an account, clicking "I Agree," or by accessing or using the Service, you represent that you have read, understood, and agree to be bound by these Terms. If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">2. Description of Service</h2>
          <p>
            LeadVerifyPro provides a platform for lead verification, data enrichment, and related analytics services. The specific features and functionalities available to you may depend on your subscription plan. We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">3. User Accounts</h2>
          <p>
            To access certain features of the Service, you must register for an account. You agree to:
            (a) provide accurate, current, and complete information during the registration process;
            (b) maintain and promptly update your account information;
            (c) maintain the security of your password and accept all risks of unauthorized access to your account; and
            (d) promptly notify us if you discover or otherwise suspect any security breaches related to the Service.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">4. User Responsibilities and Conduct</h2>
          <p>
            You are responsible for all activity that occurs under your account. You agree to use the Service in compliance with all applicable local, state, national, and international laws, rules, and regulations. You agree not to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Upload or transmit any data that is unlawful, harmful, defamatory, obscene, or otherwise objectionable.</li>
            <li>Violate the intellectual property rights of others.</li>
            <li>Use the Service to transmit unsolicited commercial email (spam).</li>
            <li>Attempt to gain unauthorized access to the Service or its related systems or networks.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            <li>Use any data obtained through our Service in a manner that violates any data privacy laws or regulations.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-dark pt-4">5. Subscription, Fees, and Payment</h2>
          <p>
            Certain aspects of the Service may be provided for a fee or other charge. If you elect to use paid aspects of the Service, you agree to our <Link to="/pricing" className="text-primary hover:underline">Pricing and Payment Terms</Link>, which may be updated from time to time. We may add new services for additional fees and charges, or amend fees and charges for existing services, at any time in our sole discretion.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">6. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of LeadVerifyPro and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of LeadVerifyPro.
          </p>
          <p>
            You retain all rights to the data you upload to the Service ("User Data"). You grant us a worldwide, non-exclusive, royalty-free license to use, process, and transmit User Data solely to the extent necessary to provide and improve the Service.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">7. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.
          </p>
          <p>
            If you wish to terminate your account, you may do so by following the instructions on the Service or by contacting us. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">8. Disclaimer of Warranties</h2>
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Your use of the Service is at your sole risk. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
          </p>
          <p>
            LeadVerifyPro, its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">9. Limitation of Liability</h2>
          <p>
            In no event shall LeadVerifyPro, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">10. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of the State of [Your State/Jurisdiction, e.g., California], United States, without regard to its conflict of law provisions.
          </p>
          <p>
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have had between us regarding the Service.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">11. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
          <p>
            By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
          </p>

          <h2 className="text-2xl font-semibold text-dark pt-4">12. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            Email: <a href="mailto:support@leadverifypro.com" className="text-primary hover:underline">support@leadverifypro.com</a>
            <br />
            Address: [Your Company Address Here]
          </p>
          <p className="mt-4">
            <em>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage; 