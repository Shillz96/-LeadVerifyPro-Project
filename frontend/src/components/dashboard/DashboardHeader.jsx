import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const DashboardHeader = ({ toggleSidebar }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  
  const notifications = [
    {
      id: 1,
      title: 'New Lead Verified',
      message: 'A new lead has been successfully verified.',
      time: '5 minutes ago',
      read: false,
    },
    {
      id: 2,
      title: 'Subscription Renewal',
      message: 'Your subscription will renew in 7 days.',
      time: '2 hours ago',
      read: true,
    },
    {
      id: 3,
      title: 'New Feature Available',
      message: 'Check out our new lead scoring system.',
      time: '1 day ago',
      read: true,
    },
  ];
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <header className="sticky top-0 z-20 border-b border-border/40 bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side - Mobile menu button and logo */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-4 rounded-md p-2 text-text hover:bg-primary/5 hover:text-dark focus:outline-none md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">LeadVerifyPro</span>
          </Link>
        </div>
        
        {/* Right side - Search, notifications, profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 text-text/50"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search leads..."
                className="w-full rounded-lg border border-border/40 bg-background py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative rounded-full p-1 text-text hover:bg-primary/5 hover:text-dark focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              
              {/* Notification badge */}
              <span className="absolute right-0 top-0 flex h-2 w-2 rounded-full bg-notification"></span>
            </button>
            
            {/* Notifications dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border/40 bg-background shadow-lg">
                <div className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-dark">Notifications</h3>
                    <button className="text-sm text-primary hover:underline">Mark all as read</button>
                  </div>
                  
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "rounded-lg p-3 transition-colors",
                          notification.read ? "bg-background" : "bg-primary/5"
                        )}
                      >
                        <div className="flex justify-between">
                          <p className="font-medium text-dark">{notification.title}</p>
                          <span className="text-xs text-text/70">{notification.time}</span>
                        </div>
                        <p className="mt-1 text-sm text-text/80">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Link
                      to="/dashboard/notifications"
                      className="text-sm text-primary hover:underline"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center rounded-full text-sm focus:outline-none"
            >
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </button>
            
            {/* Profile menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border/40 bg-background py-2 shadow-lg">
                <Link
                  to="/dashboard/profile"
                  className="block px-4 py-2 text-sm text-text hover:bg-primary/5 hover:text-dark"
                >
                  Your Profile
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="block px-4 py-2 text-sm text-text hover:bg-primary/5 hover:text-dark"
                >
                  Settings
                </Link>
                <Link
                  to="/dashboard/subscription"
                  className="block px-4 py-2 text-sm text-text hover:bg-primary/5 hover:text-dark"
                >
                  Subscription
                </Link>
                <div className="my-1 border-t border-border/40"></div>
                <Link
                  to="/logout"
                  className="block px-4 py-2 text-sm text-text hover:bg-primary/5 hover:text-dark"
                >
                  Sign out
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 