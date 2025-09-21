'use client';
import { useState, useEffect } from 'react';
import api from "@/utils/axios";
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

// Helper to format camelCase keys into human-readable labels
function formatLabel(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1') // add space before uppercase letters
    .replace(/^./, str => str.toUpperCase()); // capitalize first letter
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');

  const tabs = [
    'General',
    'Store Info',
    'SEO',
    'Emails',
    'Maintenance',
    'Security',
    'Payments',
    'Shipping',
    'Analytics',
    'Social Media'
  ];
  const [activeTab, setActiveTab] = useState('General');

  // --- All Setting States ---
  const [siteName, setSiteName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [locale, setLocale] = useState('');
  const [timezone, setTimezone] = useState('');
  const [currency, setCurrency] = useState('');
  const [enableAnalytics, setEnableAnalytics] = useState(2);

  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [storeLogo, setStoreLogo] = useState('');
  const [storeTagline, setStoreTagline] = useState('');
  const [storeTimezone, setStoreTimezone] = useState('');

  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [robotsTxt, setRobotsTxt] = useState('');

  const [supportEmail, setSupportEmail] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

  const [maintenanceMode, setMaintenanceMode] = useState(2);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const [enable2FA, setEnable2FA] = useState(2);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(0);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(0);
  const [enableCaptcha, setEnableCaptcha] = useState(2);
  const [passwordComplexity, setPasswordComplexity] = useState('');

  const [enableCOD, setEnableCOD] = useState(2);
  const [enableStripe, setEnableStripe] = useState(2);
  const [stripeApiKey, setStripeApiKey] = useState('');
  const [enablePayPal, setEnablePayPal] = useState(2);
  const [paypalClientId, setPaypalClientId] = useState('');

  const [defaultShippingMethod, setDefaultShippingMethod] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [enableExpressShipping, setEnableExpressShipping] = useState(2);

  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [facebookPixelId, setFacebookPixelId] = useState('');
  const [hotjarId, setHotjarId] = useState('');

  const [facebookUrl, setFacebookUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  useEffect(() => {
    if (message) {
      toast(message);
      setMessage('');
    }
  }, [message]);

  // --- Populate states from API ---
  useEffect(() => {
    if (!session?.user.accessToken) return;

    api.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/settings`).then(res => {
      const data = res.data;

      setSiteName(data.siteName || '');
      setBaseUrl(data.baseUrl || '');
      setLocale(data.locale || '');
      setTimezone(data.timezone || '');
      setCurrency(data.currency || '');
      setEnableAnalytics(data.enableAnalytics || 2);

      setContactEmail(data.contactEmail || '');
      setContactPhone(data.contactPhone || '');
      setAddress(data.address || '');
      setStoreLogo(data.storeLogo || '');
      setStoreTagline(data.storeTagline || '');
      setStoreTimezone(data.storeTimezone || '');

      setMetaTitle(data.metaTitle || '');
      setMetaDescription(data.metaDescription || '');
      setMetaKeywords(data.metaKeywords || '');
      setRobotsTxt(data.robotsTxt || '');

      setSupportEmail(data.supportEmail || '');
      setFromEmail(data.fromEmail || '');
      setSmtpHost(data.smtpHost || '');
      setSmtpPort(data.smtpPort || 587);
      setSmtpUser(data.smtpUser || '');
      setSmtpPass(data.smtpPass || '');

      setMaintenanceMode(data.maintenanceMode || 2);
      setMaintenanceMessage(data.maintenanceMessage || '');

      setEnable2FA(data.enable2FA || 2);
      setPasswordExpiryDays(data.passwordExpiryDays || 0);
      setMaxLoginAttempts(data.maxLoginAttempts || 0);
      setEnableCaptcha(data.enableCaptcha || 2);
      setPasswordComplexity(data.passwordComplexity || '');

      setEnableCOD(data.enableCOD || 2);
      setEnableStripe(data.enableStripe || 2);
      setStripeApiKey(data.stripeApiKey || '');
      setEnablePayPal(data.enablePayPal || 2);
      setPaypalClientId(data.paypalClientId || '');

      setDefaultShippingMethod(data.defaultShippingMethod || '');
      setFreeShippingThreshold(data.freeShippingThreshold || 0);
      setEnableExpressShipping(data.enableExpressShipping || 2);

      setGoogleAnalyticsId(data.googleAnalyticsId || '');
      setFacebookPixelId(data.facebookPixelId || '');
      setHotjarId(data.hotjarId || '');

      setFacebookUrl(data.facebookUrl || '');
      setTwitterUrl(data.twitterUrl || '');
      setInstagramUrl(data.instagramUrl || '');
      setLinkedinUrl(data.linkedinUrl || '');
    });
  }, [session]);

  const booleanFields = [
      "enableAnalytics",
      "enable2FA",
      "enableCaptcha",
      "enableCOD",
      "enableStripe",
      "enablePayPal",
      "enableExpressShipping",
      "maintenanceMode"
  ];

  const handleSave = () => {
    const payload = {
      siteName,
      baseUrl,
      locale,
      timezone,
      currency,
      enableAnalytics,
      contactEmail,
      contactPhone,
      address,
      storeLogo,
      storeTagline,
      storeTimezone,
      metaTitle,
      metaDescription,
      metaKeywords,
      robotsTxt,
      supportEmail,
      fromEmail,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      maintenanceMode,
      maintenanceMessage,
      enable2FA,
      passwordExpiryDays,
      maxLoginAttempts,
      enableCaptcha,
      passwordComplexity,
      enableCOD,
      enableStripe,
      stripeApiKey,
      enablePayPal,
      paypalClientId,
      defaultShippingMethod,
      freeShippingThreshold,
      enableExpressShipping,
      googleAnalyticsId,
      facebookPixelId,
      hotjarId,
      facebookUrl,
      twitterUrl,
      instagramUrl,
      linkedinUrl
    };

    if (!session?.user.accessToken) return;

    api.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/settings`, payload, {
      headers: { Authorization: `Bearer ${session.user.accessToken}` },
    }).then(() => {
      setMessage('✅ Settings saved successfully!')
    });
  };

  // 🔥 Improved renderer: dropdowns for booleans, number input for numbers
  const renderInputs = (inputs: [string, any, Function][]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {inputs.map(([key, value, setter]: any) => (
        <div key={key} className="flex flex-col">
          <label className="font-medium mb-1">{formatLabel(key)}</label>
          {booleanFields.includes(key) ? (
            <select
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="1">Yes</option>
              <option value="2">No</option>
            </select>
          ) : typeof value === 'number' ? (
            <input
              type="number"
              value={value}
              onChange={(e) => setter(Number(e.target.value))}
              className="border p-2 rounded"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="border p-2 rounded"
            />
          )}
        </div>
      ))}
    </div>
  );

  const tabSettings: Record<string, [string, any, Function][]> = {
    General: [
      ['siteName', siteName, setSiteName],
      ['baseUrl', baseUrl, setBaseUrl],
      ['locale', locale, setLocale],
      ['timezone', timezone, setTimezone],
      ['currency', currency, setCurrency],
      ['enableAnalytics', enableAnalytics, setEnableAnalytics]
    ],
    'Store Info': [
      ['contactEmail', contactEmail, setContactEmail],
      ['contactPhone', contactPhone, setContactPhone],
      ['address', address, setAddress],
      ['storeLogo', storeLogo, setStoreLogo],
      ['storeTagline', storeTagline, setStoreTagline],
      ['storeTimezone', storeTimezone, setStoreTimezone]
    ],
    SEO: [
      ['metaTitle', metaTitle, setMetaTitle],
      ['metaDescription', metaDescription, setMetaDescription],
      ['metaKeywords', metaKeywords, setMetaKeywords],
      ['robotsTxt', robotsTxt, setRobotsTxt]
    ],
    Emails: [
      ['supportEmail', supportEmail, setSupportEmail],
      ['fromEmail', fromEmail, setFromEmail],
      ['smtpHost', smtpHost, setSmtpHost],
      ['smtpPort', smtpPort, setSmtpPort],
      ['smtpUser', smtpUser, setSmtpUser],
      ['smtpPass', smtpPass, setSmtpPass]
    ],
    Maintenance: [
      ['maintenanceMode', maintenanceMode, setMaintenanceMode],
      ['maintenanceMessage', maintenanceMessage, setMaintenanceMessage]
    ],
    Security: [
      ['enable2FA', enable2FA, setEnable2FA],
      ['passwordExpiryDays', passwordExpiryDays, setPasswordExpiryDays],
      ['maxLoginAttempts', maxLoginAttempts, setMaxLoginAttempts],
      ['enableCaptcha', enableCaptcha, setEnableCaptcha],
      ['passwordComplexity', passwordComplexity, setPasswordComplexity]
    ],
    Payments: [
      ['enableCOD', enableCOD, setEnableCOD],
      ['enableStripe', enableStripe, setEnableStripe],
      ['stripeApiKey', stripeApiKey, setStripeApiKey],
      ['enablePayPal', enablePayPal, setEnablePayPal],
      ['paypalClientId', paypalClientId, setPaypalClientId]
    ],
    Shipping: [
      ['defaultShippingMethod', defaultShippingMethod, setDefaultShippingMethod],
      ['freeShippingThreshold', freeShippingThreshold, setFreeShippingThreshold],
      ['enableExpressShipping', enableExpressShipping, setEnableExpressShipping]
    ],
    Analytics: [
      ['googleAnalyticsId', googleAnalyticsId, setGoogleAnalyticsId],
      ['facebookPixelId', facebookPixelId, setFacebookPixelId],
      ['hotjarId', hotjarId, setHotjarId]
    ],
    'Social Media': [
      ['facebookUrl', facebookUrl, setFacebookUrl],
      ['twitterUrl', twitterUrl, setTwitterUrl],
      ['instagramUrl', instagramUrl, setInstagramUrl],
      ['linkedinUrl', linkedinUrl, setLinkedinUrl]
    ]
  };

  return (
    <div className="p-6 flex space-x-6 max-w-7xl">
      {/* Sidebar */}
      <div className="w-48 space-y-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full text-left p-3 rounded ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Top Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6 bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">
            {activeTab} Settings
          </h2>
          {renderInputs(tabSettings[activeTab])}
        </div>

        {/* Bottom Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
