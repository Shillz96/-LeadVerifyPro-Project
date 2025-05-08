import { useState } from 'react';
import { FiBarChart2, FiPieChart, FiDownload, FiCalendar, FiFilter } from 'react-icons/fi';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState('last30');
  const [activeChart, setActiveChart] = useState('verification');
  
  // Mock data for charts
  const verificationData = {
    labels: ['Valid', 'Invalid', 'Unverified'],
    values: [65, 23, 12],
    colors: ['#10B981', '#EF4444', '#9CA3AF']
  };
  
  const sourceData = {
    labels: ['Website Form', 'CSV Upload', 'API', 'Manual Entry'],
    values: [42, 31, 18, 9],
    colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B']
  };
  
  const dailyVerifications = [
    { date: '2023-12-01', verified: 150, invalid: 32 },
    { date: '2023-12-02', verified: 142, invalid: 28 },
    { date: '2023-12-03', verified: 134, invalid: 24 },
    { date: '2023-12-04', verified: 168, invalid: 35 },
    { date: '2023-12-05', verified: 187, invalid: 41 },
    { date: '2023-12-06', verified: 196, invalid: 39 },
    { date: '2023-12-07', verified: 172, invalid: 36 },
    { date: '2023-12-08', verified: 148, invalid: 32 },
    { date: '2023-12-09', verified: 163, invalid: 35 },
    { date: '2023-12-10', verified: 175, invalid: 38 },
    { date: '2023-12-11', verified: 192, invalid: 42 },
    { date: '2023-12-12', verified: 204, invalid: 46 },
    { date: '2023-12-13', verified: 215, invalid: 50 },
    { date: '2023-12-14', verified: 208, invalid: 48 }
  ];
  
  const summaryData = [
    { title: 'Total Leads', value: '15,624', change: '+12%', changeType: 'positive' },
    { title: 'Valid Leads', value: '12,458', change: '+15%', changeType: 'positive' },
    { title: 'Invalid Leads', value: '3,166', change: '+4%', changeType: 'negative' },
    { title: 'Verification Rate', value: '92%', change: '+3%', changeType: 'positive' }
  ];
  
  // Simple mock chart components
  const PieChart = ({ data }) => (
    <div className="flex justify-center items-center">
      <div className="w-48 h-48 rounded-full border-8 border-gray-100 relative flex items-center justify-center">
        {data.labels.map((label, index) => (
          <div 
            key={index} 
            className="absolute inset-0"
            style={{
              background: `conic-gradient(transparent ${index * 3.6 * data.values[index]}deg, ${data.colors[index]} ${index * 3.6 * data.values[index]}deg, ${data.colors[index]} ${(index + 1) * 3.6 * data.values[index]}deg, transparent ${(index + 1) * 3.6 * data.values[index]}deg)`,
              clipPath: 'circle(50% at 50% 50%)'
            }}
          />
        ))}
        <div className="w-32 h-32 rounded-full bg-white z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-dark">
              {data.values.reduce((a, b) => a + b, 0)}
            </div>
            <div className="text-xs text-text">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const BarChart = ({ data }) => (
    <div className="h-64 flex items-end justify-between px-4">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center w-full">
          <div className="flex-grow w-full flex items-end">
            <div 
              className="w-full bg-primary/80 rounded-t"
              style={{ 
                height: `${(item.verified / 220) * 100}%`, 
                marginRight: '2px'
              }}
            />
            <div 
              className="w-full bg-red-500/80 rounded-t"
              style={{ 
                height: `${(item.invalid / 220) * 100}%`,
                marginLeft: '2px'
              }}
            />
          </div>
          <div className="text-xs mt-2 text-text">
            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Verification Reports</h1>
        <p className="text-text">
          Get insights into your lead verification metrics and performance trends.
        </p>
      </div>
      
      {/* Controls */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex space-x-2">
          <div className="inline-flex items-center rounded-md border border-border bg-white p-1">
            <button
              onClick={() => setActiveChart('verification')}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                activeChart === 'verification' 
                  ? 'bg-primary text-white' 
                  : 'text-text hover:text-dark'
              }`}
            >
              <FiPieChart className="inline-block mr-1" />
              Verification
            </button>
            <button
              onClick={() => setActiveChart('source')}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                activeChart === 'source' 
                  ? 'bg-primary text-white' 
                  : 'text-text hover:text-dark'
              }`}
            >
              <FiPieChart className="inline-block mr-1" />
              Source
            </button>
            <button
              onClick={() => setActiveChart('trends')}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                activeChart === 'trends' 
                  ? 'bg-primary text-white' 
                  : 'text-text hover:text-dark'
              }`}
            >
              <FiBarChart2 className="inline-block mr-1" />
              Trends
            </button>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none border border-border rounded-lg pl-10 pr-4 py-2 bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
            >
              <option value="last7">Last 7 days</option>
              <option value="last30">Last 30 days</option>
              <option value="last90">Last 90 days</option>
              <option value="custom">Custom range</option>
            </select>
            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text" />
          </div>
          
          <button className="flex items-center border border-border rounded-lg px-4 py-2 bg-white text-text hover:text-dark transition-colors">
            <FiFilter className="mr-2" />
            Filters
          </button>
          
          <button className="flex items-center border border-border rounded-lg px-4 py-2 bg-white text-text hover:text-dark transition-colors">
            <FiDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryData.map((item, index) => (
          <div key={index} className="bg-white rounded-xl border border-border p-6">
            <h3 className="text-sm font-medium text-text mb-2">{item.title}</h3>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-dark">{item.value}</p>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                item.changeType === 'positive' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="bg-white rounded-xl border border-border p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-dark">
            {activeChart === 'verification' && 'Verification Status'}
            {activeChart === 'source' && 'Lead Source Distribution'}
            {activeChart === 'trends' && 'Daily Verification Trends'}
          </h2>
          <div className="text-sm text-text">
            Dec 1 - Dec 14, 2023
          </div>
        </div>
        
        {activeChart === 'verification' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <PieChart data={verificationData} />
            </div>
            <div className="md:col-span-2">
              <div className="space-y-4">
                {verificationData.labels.map((label, index) => (
                  <div key={index} className="flex items-center justify-between pb-2 border-b border-border/40 last:border-0">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: verificationData.colors[index] }}
                      />
                      <span className="text-dark">{label}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{verificationData.values[index]}%</span>
                      <span className="text-text">
                        {Math.round(verificationData.values[index] * 156.24)} leads
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-dark mb-4">Insights</h3>
                <ul className="space-y-2 text-text">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Your valid lead rate is 15% higher than the industry average.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Consider implementing advanced email verification to further reduce invalid leads.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Your verification performance has improved 12% since last month.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {activeChart === 'source' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <PieChart data={sourceData} />
            </div>
            <div className="md:col-span-2">
              <div className="space-y-4">
                {sourceData.labels.map((label, index) => (
                  <div key={index} className="flex items-center justify-between pb-2 border-b border-border/40 last:border-0">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: sourceData.colors[index] }}
                      />
                      <span className="text-dark">{label}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{sourceData.values[index]}%</span>
                      <span className="text-text">
                        {Math.round(sourceData.values[index] * 156.24 / 100)} leads
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-dark mb-4">Source Analysis</h3>
                <ul className="space-y-2 text-text">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Website forms generate your highest quality leads with 94% validity rate.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>API integrations have increased by 22% this month.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>CSV uploads typically contain 15% more duplicate entries than other sources.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {activeChart === 'trends' && (
          <div className="grid grid-cols-1 gap-8">
            <BarChart data={dailyVerifications} />
            
            <div className="flex justify-center items-center mt-4 space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary/80 rounded-full mr-2" />
                <span className="text-sm text-text">Valid</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500/80 rounded-full mr-2" />
                <span className="text-sm text-text">Invalid</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium text-dark mb-4">Trend Insights</h3>
              <ul className="space-y-2 text-text">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Lead verification volumes have increased by 42% since December 7th.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Weekday verifications average 25% higher than weekend volumes.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Invalid lead rates have remained relatively stable at 17-23% throughout the period.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Recent reports */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold text-dark">Recent Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                  Report Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                  Date Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                  Lead Count
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                  Format
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {[
                { name: 'December Campaign Verification', date: '2023-12-14', count: 1245, format: 'CSV' },
                { name: 'Q4 Lead Analysis', date: '2023-12-10', count: 5632, format: 'Excel' },
                { name: 'Website Form Verification', date: '2023-12-08', count: 892, format: 'CSV' },
                { name: 'November Monthly Report', date: '2023-12-01', count: 3210, format: 'PDF' },
                { name: 'Trade Show Leads', date: '2023-11-25', count: 452, format: 'CSV' }
              ].map((report, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">
                    {report.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                    {new Date(report.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                    {report.count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                    {report.format}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <button className="text-primary hover:text-primary/80 font-medium">
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 