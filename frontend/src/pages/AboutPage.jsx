import { FiUser, FiClock, FiThumbsUp, FiGlobe } from 'react-icons/fi';
import leadVerifyProVideo from '../assets/images/video/AI_Video_Generation_LeadVerifyPro.mp4';

const teamMembers = [
  {
    name: 'Dylan Spivack',
    role: 'CEO & Co-Founder',
    image: 'https://muzetalent.com/images/spexx.jpg',
    bio: 'Former lead at a major CRM company with over 15 years of experience in the sales and marketing space.'
  },
];

const stats = [
  {
    title: '10M+',
    description: 'Leads verified monthly',
    icon: <FiThumbsUp className="h-8 w-8 text-primary" />
  },
  {
    title: '99.7%',
    description: 'Verification accuracy',
    icon: <FiClock className="h-8 w-8 text-primary" />
  },
  {
    title: '2,500+',
    description: 'Happy customers',
    icon: <FiUser className="h-8 w-8 text-primary" />
  },
  {
    title: '45+',
    description: 'Countries served',
    icon: <FiGlobe className="h-8 w-8 text-primary" />
  }
];

const AboutPage = () => {
  return (
    <div className="container-custom py-16">
      {/* Hero section */}
      <div className="mb-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-dark">About LeadVerifyPro</h1>
          <p className="text-xl text-text">
            We're on a mission to help businesses build stronger relationships with verified, 
            high-quality leads.
          </p>
        </div>
        
        <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
          <video
            className="w-full h-full object-cover"
            controls
            autoPlay
            muted
            loop
            playsInline
            aria-label="LeadVerifyPro introduction video"
          >
            <source src={leadVerifyProVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="text-center max-w-3xl mx-auto mt-8 px-6">
          <h2 className="text-2xl font-bold text-dark mb-4">Our Story</h2>
          <p className="text-text">
            Founded in 2020, LeadVerifyPro emerged from our founders' frustration with 
            low-quality leads harming sales efficiency. We built our platform to solve this
            problem not just for ourselves, but for businesses worldwide.
          </p>
        </div>
      </div>
      
      {/* Mission section */}
      <div className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-dark">Our Mission</h2>
            <p className="text-lg mb-6 text-text">
              At LeadVerifyPro, we believe that quality leads are the foundation of effective sales 
              and marketing. Our mission is to help businesses of all sizes eliminate wasted resources 
              by providing industry-leading verification technology.
            </p>
            <p className="text-lg text-text">
              We're committed to continuous innovation, exceptional accuracy, and outstanding customer 
              service. By focusing on these core values, we help our clients build stronger relationships 
              and drive greater success.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md border border-border/40"
              >
                <div className="mb-4">{stat.icon}</div>
                <h3 className="text-2xl font-bold mb-1 text-dark">{stat.title}</h3>
                <p className="text-sm text-text">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Team section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-12 text-center text-dark">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md border border-border/40 flex flex-col items-center text-center"
            >
              <img 
                src={member.image} 
                alt={member.name}
                className="w-24 h-24 object-cover rounded-full mb-4"
              />
              <h3 className="text-xl font-semibold mb-1 text-dark">{member.name}</h3>
              <p className="text-sm font-medium text-primary mb-3">{member.role}</p>
              <p className="text-sm text-text">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Values section */}
      <div>
        <h2 className="text-3xl font-bold mb-12 text-center text-dark">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Accuracy Above All',
              description: 'We prioritize the highest standards of data verification accuracy to ensure our clients can trust every verified lead.'
            },
            {
              title: 'Innovation & Improvement',
              description: 'We continuously improve our algorithms and processes to stay ahead of changing data landscapes and verification challenges.'
            },
            {
              title: 'Customer Success',
              description: 'Your success is our success. We partner with our clients to ensure they receive maximum value from our solutions.'
            }
          ].map((value, index) => (
            <div 
              key={index} 
              className="bg-primary/5 p-8 rounded-2xl border border-primary/20"
            >
              <h3 className="text-xl font-semibold mb-4 text-dark">{value.title}</h3>
              <p className="text-text">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 