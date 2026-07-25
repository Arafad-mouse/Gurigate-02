import { useEffect, useState } from 'react';
import { Settings, Bell, Shield, CreditCard, User, Globe, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    twoFactorAuth: false,
    darkMode: false,
    language: 'en'
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-6 w-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive push notifications for booking updates</p>
              </div>
              <button
                onClick={() => handleToggle('notifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-[#BA0036]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Alerts</p>
                <p className="text-sm text-gray-600">Receive email notifications for important events</p>
              </div>
              <button
                onClick={() => handleToggle('emailAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailAlerts ? 'bg-[#BA0036]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">SMS Alerts</p>
                <p className="text-sm text-gray-600">Receive SMS notifications for urgent matters</p>
              </div>
              <button
                onClick={() => handleToggle('smsAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.smsAlerts ? 'bg-[#BA0036]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.smsAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <button
                onClick={() => handleToggle('twoFactorAuth')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.twoFactorAuth ? 'bg-[#BA0036]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <button className="text-[#BA0036] hover:text-[#a4003a] text-sm font-medium">
              Change Password
            </button>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-6 w-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
          </div>
          <div className="space-y-3">
            <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Visa ending in 4242</p>
                  <p className="text-sm text-gray-600">Expires 12/2025</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Default</span>
            </div>
            <button className="text-[#BA0036] hover:text-[#a4003a] text-sm font-medium">
              Add Payment Method
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-6 w-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.darkMode ? <Moon className="h-5 w-5 text-gray-600" /> : <Sun className="h-5 w-5 text-gray-600" />}
                <div>
                  <p className="font-medium text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-600">Switch between light and dark theme</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('darkMode')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.darkMode ? 'bg-[#BA0036]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-2">Language</p>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA0036] focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
