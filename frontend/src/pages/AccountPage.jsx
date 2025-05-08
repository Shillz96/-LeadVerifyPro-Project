import { useState } from 'react';
import { FiUser, FiLock, FiMail, FiSave, FiTrash2 } from 'react-icons/fi';

const AccountPage = () => {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    company: 'Acme Corp',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [activeTab, setActiveTab] = useState('profile');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // Submit profile updates to API
    console.log('Profile update submitted:', formData);
    // Show success message
    alert('Profile updated successfully!');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Submit password change to API
    console.log('Password change submitted');
    // Show success message and clear password fields
    alert('Password updated successfully!');
    setFormData((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Call API to delete account
      console.log('Account deletion requested');
      // Redirect to homepage or logout
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-6 text-3xl font-bold text-primary">Account Settings</h1>
      
      <div className="mb-8 border-b border-gray-200">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`mr-2 inline-block p-4 border-b-2 ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <FiUser className="inline mr-2" />
            Profile Information
          </button>
          <button
            className={`mr-2 inline-block p-4 border-b-2 ${
              activeTab === 'security'
                ? 'border-primary text-primary'
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('security')}
          >
            <FiLock className="inline mr-2" />
            Security
          </button>
        </div>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 font-medium">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              <FiSave className="mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      )}

      {activeTab === 'security' && (
        <div className="space-y-8">
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                <FiSave className="mr-2" />
                Update Password
              </button>
            </div>
          </form>

          <div className="pt-6 mt-6 border-t border-gray-200">
            <h2 className="mb-4 text-xl font-semibold text-red-600">Danger Zone</h2>
            <p className="mb-4 text-gray-600">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <FiTrash2 className="mr-2" />
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage; 