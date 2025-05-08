import { useState } from 'react';
import { FiDownload, FiFilter, FiSearch, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const MOCK_LEADS = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    company: 'Acme Inc',
    position: 'Marketing Director',
    phone: '(555) 123-4567',
    status: 'verified',
    score: 98,
    verifiedDate: '2023-08-15',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@techcorp.com',
    company: 'TechCorp',
    position: 'CEO',
    phone: '(555) 987-6543',
    status: 'verified',
    score: 95,
    verifiedDate: '2023-08-14',
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael.b@globex.net',
    company: 'Globex',
    position: 'Sales Manager',
    phone: '(555) 456-7890',
    status: 'invalid',
    score: 45,
    verifiedDate: '2023-08-12',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'e.davis@startup.io',
    company: 'StartUp.io',
    position: 'Product Manager',
    phone: '(555) 234-5678',
    status: 'verified',
    score: 92,
    verifiedDate: '2023-08-10',
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david.w@enterprise.com',
    company: 'Enterprise Solutions',
    position: 'CTO',
    phone: '(555) 876-5432',
    status: 'invalid',
    score: 30,
    verifiedDate: '2023-08-09',
  },
];

const VerifiedLeadsPage = () => {
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'verifiedDate', direction: 'desc' });

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get class for sort button
  const getSortButtonClass = (name) => {
    return sortConfig.key === name
      ? `ml-1 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`
      : 'ml-1 opacity-0 group-hover:opacity-50';
  };

  // Filter and sort leads
  const filteredLeads = leads
    .filter((lead) => {
      // Filter by status
      if (statusFilter !== 'all' && lead.status !== statusFilter) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          lead.name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.company.toLowerCase().includes(searchLower) ||
          lead.position.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Handle export to CSV
  const handleExport = () => {
    const headers = ['Name', 'Email', 'Company', 'Position', 'Phone', 'Status', 'Score', 'Verified Date'];
    const data = filteredLeads.map((lead) => [
      lead.name,
      lead.email,
      lead.company,
      lead.position,
      lead.phone,
      lead.status,
      lead.score,
      lead.verifiedDate,
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map((row) => row.join(',')),
    ].join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `verified_leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-primary mb-4 md:mb-0">Verified Leads</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            <FiDownload className="mr-2" />
            Export to CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="w-full md:w-48">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              >
                <option value="all">All Leads</option>
                <option value="verified">Verified Only</option>
                <option value="invalid">Invalid Only</option>
              </select>
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => requestSort('name')}
                    className="group font-medium flex items-center"
                  >
                    Name
                    <span className={getSortButtonClass('name')}>▼</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => requestSort('email')}
                    className="group font-medium flex items-center"
                  >
                    Email
                    <span className={getSortButtonClass('email')}>▼</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => requestSort('company')}
                    className="group font-medium flex items-center"
                  >
                    Company
                    <span className={getSortButtonClass('company')}>▼</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => requestSort('position')}
                    className="group font-medium flex items-center"
                  >
                    Position
                    <span className={getSortButtonClass('position')}>▼</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => requestSort('status')}
                    className="group font-medium flex items-center"
                  >
                    Status
                    <span className={getSortButtonClass('status')}>▼</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => requestSort('score')}
                    className="group font-medium flex items-center"
                  >
                    Score
                    <span className={getSortButtonClass('score')}>▼</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => requestSort('verifiedDate')}
                    className="group font-medium flex items-center"
                  >
                    Verified Date
                    <span className={getSortButtonClass('verifiedDate')}>▼</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{lead.name}</td>
                    <td className="px-4 py-3">{lead.email}</td>
                    <td className="px-4 py-3">{lead.company}</td>
                    <td className="px-4 py-3">{lead.position}</td>
                    <td className="px-4 py-3">{lead.phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {lead.status === 'verified' ? (
                          <>
                            <FiCheckCircle className="text-green-500 mr-1" />
                            <span className="text-green-500">Verified</span>
                          </>
                        ) : (
                          <>
                            <FiXCircle className="text-red-500 mr-1" />
                            <span className="text-red-500">Invalid</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div
                          className={`mr-2 w-12 h-2 rounded-full ${
                            lead.score >= 90
                              ? 'bg-green-500'
                              : lead.score >= 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        >
                          <div
                            className="h-full rounded-full bg-green-600"
                            style={{ width: `${lead.score}%` }}
                          ></div>
                        </div>
                        {lead.score}%
                      </div>
                    </td>
                    <td className="px-4 py-3">{lead.verifiedDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VerifiedLeadsPage; 