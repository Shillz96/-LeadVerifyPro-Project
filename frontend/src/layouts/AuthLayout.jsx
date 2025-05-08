import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container-custom py-4">
        <Link to="/" className="inline-block">
          <span className="text-2xl font-bold text-dark">LeadVerifyPro</span>
        </Link>
      </header>
      
      <main className="container-custom flex flex-1 items-center justify-center py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </main>
      
      <footer className="container-custom py-4 text-center text-sm text-text">
        <p>© {new Date().getFullYear()} LeadVerifyPro. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout; 