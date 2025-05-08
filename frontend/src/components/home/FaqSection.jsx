import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const faqs = [
  {
    question: "How does LeadVerifyPro verify lead information?",
    answer: "LeadVerifyPro uses a combination of AI algorithms and data from multiple reliable sources to verify property ownership, contact details, and identify motivated seller indicators. Our system cross-references information across public records, proprietary databases, and online sources to provide you with the most accurate verification possible."
  },
  {
    question: "How long does it take to verify a lead?",
    answer: "Most leads are verified within minutes. Complex cases that require deeper analysis may take up to an hour. The system will notify you as soon as the verification is complete, and you'll be able to access the detailed report immediately."
  },
  {
    question: "Can I import my existing leads?",
    answer: "Yes, you can easily import your existing leads from a CSV file or directly from popular CRM systems that we integrate with. Our system will then begin the verification process on those leads based on your subscription plan limits."
  },
  {
    question: "What happens if a lead can't be verified?",
    answer: "If our system cannot verify a lead with high confidence, we'll provide you with a detailed explanation of which aspects could not be verified and why. This information can still be valuable in deciding whether to pursue the lead further. These partial verifications do not count against your monthly quota."
  },
  {
    question: "Do you offer integrations with CRM systems?",
    answer: "Yes, we offer integrations with popular real estate CRM systems including Salesforce, HubSpot, Zoho, and others. Our Professional and Enterprise plans include these integrations, allowing for seamless workflow between your lead management and verification processes."
  },
  {
    question: "Is there a limit to how many leads I can verify?",
    answer: "Each subscription plan has a specific monthly limit for lead verifications. The Starter plan includes 20 verifications per month, Professional includes 100, and Enterprise offers unlimited verifications. If you need more verifications on the Starter or Professional plans, you can purchase additional verification credits."
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer: "Yes, you can cancel your subscription at any time without any cancellation fees. Your subscription will remain active until the end of your current billing period, after which it will not renew."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We take data security very seriously. All data is encrypted both in transit and at rest. We use industry-standard security practices and regular security audits to ensure your information remains protected. Additionally, we never share your data with third parties without your explicit consent."
  }
];

const FaqItem = ({ faq, index, isOpen, toggleAccordion }) => {
  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        className="flex w-full items-center justify-between py-4 text-left text-dark focus:outline-none"
        onClick={() => toggleAccordion(index)}
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium">{faq.question}</span>
        <span className="ml-6 flex-shrink-0">
          <svg
            className={cn(
              "h-6 w-6 transform transition-transform duration-300",
              isOpen ? "rotate-180" : ""
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-text/80">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="relative py-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-secondary/5 blur-3xl"></div>
      
      <div className="container-custom">
        {/* Section header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-dark md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-text/80">
            Find answers to common questions about LeadVerifyPro and how it can help your real estate business.
          </p>
        </div>
        
        {/* FAQs */}
        <div className="mx-auto max-w-3xl rounded-xl border border-border/40 bg-background p-6 shadow-sm">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              faq={faq}
              index={index}
              isOpen={index === openIndex}
              toggleAccordion={toggleAccordion}
            />
          ))}
        </div>
        
        {/* Additional questions */}
        <div className="mt-12 text-center">
          <p className="text-text">
            Have more questions? Contact our support team at{' '}
            <a href="mailto:support@leadverifypro.com" className="text-primary font-medium hover:underline">
              support@leadverifypro.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FaqSection; 