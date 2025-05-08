import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      
      // Reset form after submission
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <FiMail className="h-6 w-6 text-primary" />,
      title: 'Email',
      info: 'info@leadverifypro.com',
      action: 'mailto:info@leadverifypro.com'
    },
    {
      icon: <FiPhone className="h-6 w-6 text-primary" />,
      title: 'Phone',
      info: '+1 (555) 123-4567',
      action: 'tel:+15551234567'
    },
    {
      icon: <FiMapPin className="h-6 w-6 text-primary" />,
      title: 'Office',
      info: '123 Verification Ave, Suite 500, San Francisco, CA 94107',
      action: 'https://maps.google.com'
    }
  ];

  return (
    <div className="container-custom py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-dark">Get in Touch</h1>
        <p className="text-xl text-text">
          Have questions or need assistance? We're here to help you get the most out of LeadVerifyPro.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Contact form - takes up 3/5 of the grid on large screens */}
        <div className="lg:col-span-3 bg-white p-8 rounded-2xl shadow-md border border-border/40">
          <h2 className="text-2xl font-bold mb-6 text-dark">Send us a message</h2>
          
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <FiSend className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-green-800 mb-2">Message Sent!</h3>
              <p className="text-green-700">
                Thank you for contacting us. We'll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-primary hover:text-primary/80 font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-dark mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                    placeholder="John Smith"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-dark mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-dark mb-1">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                    placeholder="Your Company"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-dark mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                    placeholder="How can we help?"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-dark mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors resize-none"
                  placeholder="Tell us how we can assist you..."
                ></textarea>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-6 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          )}
        </div>
        
        {/* Contact info - takes up 2/5 of the grid on large screens */}
        <div className="lg:col-span-2">
          <div className="bg-primary/5 p-8 rounded-2xl border border-primary/20 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-dark">Contact Information</h2>
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0 mr-4 mt-1">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-dark mb-1">{item.title}</h3>
                    <a 
                      href={item.action} 
                      className="text-text hover:text-primary transition-colors"
                      target={item.title === 'Office' ? '_blank' : undefined}
                      rel={item.title === 'Office' ? 'noopener noreferrer' : undefined}
                    >
                      {item.info}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-md border border-border/40">
            <h2 className="text-2xl font-bold mb-6 text-dark">Business Hours</h2>
            <ul className="space-y-3">
              {[
                { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM PST' },
                { day: 'Saturday', hours: '10:00 AM - 2:00 PM PST' },
                { day: 'Sunday', hours: 'Closed' }
              ].map((schedule, index) => (
                <li key={index} className="flex justify-between items-center pb-2 border-b border-border/40 last:border-0">
                  <span className="font-medium text-dark">{schedule.day}</span>
                  <span className="text-text">{schedule.hours}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 pt-6 border-t border-border/40">
              <h3 className="text-lg font-medium text-dark mb-2">Support Hours</h3>
              <p className="text-text">
                Our customer support team is available 24/7 for urgent inquiries through our support portal.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ section */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10 text-dark">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              question: 'How quickly do you respond to inquiries?',
              answer: 'We strive to respond to all inquiries within 24 business hours. For urgent matters, please call our support line directly.'
            },
            {
              question: 'Do you offer custom enterprise solutions?',
              answer: 'Yes, we provide tailored solutions for enterprise clients. Please contact our sales team to discuss your specific requirements.'
            },
            {
              question: 'How can I request a product demo?',
              answer: 'You can request a demo by filling out the contact form on this page or by emailing demo@leadverifypro.com with your details.'
            }
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-border/40">
              <h3 className="text-lg font-medium mb-2 text-dark">{item.question}</h3>
              <p className="text-text">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 