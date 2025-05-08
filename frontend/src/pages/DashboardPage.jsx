import { useState, useEffect } from 'react';
import { FiArrowRight, FiHelpCircle, FiChevronRight, FiUsers, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { leadsApi } from '../utils/api';

const DashboardPage = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    verifiedLeads: 0,
    pendingVerification: 0,
    failedVerification: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const data = await leadsApi.getAllLeads();
        setLeads(data.leads || []);
        
        // Calculate stats
        if (data.leads) {
          const verified = data.leads.filter(lead => lead.status === 'verified').length;
          const failed = data.leads.filter(lead => lead.status === 'rejected').length;
          const pending = data.leads.filter(lead => lead.status === 'pending' || lead.status === 'new').length;
          
          setStats({
            totalLeads: data.leads.length,
            verifiedLeads: verified,
            pendingVerification: pending,
            failedVerification: failed
          });
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to load leads. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, []);

  // Fallback to mock data if there are no leads from the API
  const hasMockData = leads.length === 0 && !loading && !error;
  
  // Mock data for visual demonstration when no real data exists
  const mockLeads = [
    { id: 1, fullName: 'John Smith', email: 'john.smith@example.com', phone: '(555) 123-4567', status: 'verified', score: 85 },
    { id: 2, fullName: 'Alice Johnson', email: 'alice.johnson@example.com', phone: '(555) 987-6543', status: 'verified', score: 92 },
    { id: 3, fullName: 'Michael Brown', email: 'michael.brown@example.com', phone: '(555) 456-7890', status: 'new', score: 0 },
    { id: 4, fullName: 'Susan Wilson', email: 'susan.wilson@example.com', phone: '(555) 222-3333', status: 'rejected', score: 32 },
    { id: 5, fullName: 'Robert Garcia', email: 'robert.garcia@example.com', phone: '(555) 111-0000', status: 'new', score: 0 }
  ];
  
  const displayLeads = hasMockData ? mockLeads : leads;
  
  const mockStats = {
    totalLeads: 5,
    verifiedLeads: 2,
    pendingVerification: 2,
    failedVerification: 1
  };
  
  const displayStats = hasMockData ? mockStats : stats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Dashboard</h1>
        <p className="text-text">
          Welcome to LeadVerifyPro. Manage and verify your leads from one place.
        </p>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <FiUsers className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 className="text-text text-sm mb-1">Total Leads</h3>
          <p className="text-3xl font-bold text-dark">{displayStats.totalLeads}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <FiCheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-text text-sm mb-1">Verified Leads</h3>
          <p className="text-3xl font-bold text-dark">{displayStats.verifiedLeads}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-amber-50 p-3 rounded-lg">
              <FiLoader className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <h3 className="text-text text-sm mb-1">Pending Verification</h3>
          <p className="text-3xl font-bold text-dark">{displayStats.pendingVerification}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <FiAlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-text text-sm mb-1">Failed Verification</h3>
          <p className="text-3xl font-bold text-dark">{displayStats.failedVerification}</p>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Link to="/verify" className="group block p-6 bg-white rounded-xl border border-border hover:border-primary transition-colors">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-dark mb-1">Verify New Leads</h3>
              <p className="text-text">Upload and verify your lead data</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
              <FiArrowRight className="h-5 w-5 text-primary group-hover:text-white" />
            </div>
          </div>
        </Link>
        
        <Link to="/verified-leads" className="group block p-6 bg-white rounded-xl border border-border hover:border-primary transition-colors">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-dark mb-1">Manage Verified Leads</h3>
              <p className="text-text">View and export your verified leads</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
              <FiArrowRight className="h-5 w-5 text-primary group-hover:text-white" />
            </div>
          </div>
        </Link>
      </div>
      
      {/* Recent leads */}
      <div className="bg-white rounded-xl border border-border p-6 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-dark">Recent Leads</h2>
          <Link to="/verified-leads" className="text-primary font-medium text-sm flex items-center hover:underline">
            View All
            <FiChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-primary mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-text">Loading leads...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-10">
            <div className="flex flex-col items-center">
              <FiAlertCircle className="h-8 w-8 text-red-600 mb-3" />
              <p className="text-red-600 mb-3">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : displayLeads.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
              <FiUsers className="h-8 w-8 text-text" />
            </div>
            <h3 className="text-lg font-medium text-dark mb-1">No leads found</h3>
            <p className="text-text mb-4">Start by uploading or adding new leads</p>
            <Link 
              to="/verify" 
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Upload Leads
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-text">Name</th>
                  <th className="pb-3 text-left font-medium text-text">Email</th>
                  <th className="pb-3 text-left font-medium text-text">Phone</th>
                  <th className="pb-3 text-left font-medium text-text">Status</th>
                  <th className="pb-3 text-left font-medium text-text">Score</th>
                  <th className="pb-3 text-left font-medium text-text"></th>
                </tr>
              </thead>
              <tbody>
                {displayLeads.slice(0, 5).map((lead) => (
                  <tr key={lead.id} className="border-b border-border">
                    <td className="py-4 font-medium text-dark">{lead.fullName}</td>
                    <td className="py-4 text-text">{lead.email}</td>
                    <td className="py-4 text-text">{lead.phone}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'verified' ? 'bg-green-50 text-green-600' :
                        lead.status === 'rejected' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {lead.status === 'verified' ? 'Verified' :
                         lead.status === 'rejected' ? 'Failed' :
                         'Pending'}
                      </span>
                    </td>
                    <td className="py-4 text-text">{lead.score ? `${lead.score}/100` : 'N/A'}</td>
                    <td className="py-4 text-right">
                      <Link to={`/verified-leads/${lead.id}`} className="text-primary hover:underline text-sm">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 