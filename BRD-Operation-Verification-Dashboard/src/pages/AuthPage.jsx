import React, { useState } from 'react';
import { CheckCircle, MapPin } from 'lucide-react';
import SignIn from '../components/Auth/SignIn';
import SignUp from '../components/Auth/SignUp';

const AuthPage = ({ onSignIn, onSignUp }) => {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-center">

        {/* Left: Branding */}
        <div className="flex-1 text-center md:text-left order-2 md:order-1">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
            Verification Portal
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 mb-6 md:mb-8">
            Streamline KYC, document verification, and field operations with real-time tracking and analytics.
          </p>
          <div className="flex flex-col xs:flex-row sm:flex-row gap-3 sm:gap-6 items-center md:items-start justify-center md:justify-start text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600 shrink-0" size={18} />
              <span>Real-time SLA Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-blue-600 shrink-0" size={18} />
              <span>Geo-tagged Visits</span>
            </div>
          </div>
        </div>

        {/* Right: Auth Form */}
        <div className="w-full max-w-sm sm:max-w-md order-1 md:order-2">
          {showSignUp ? (
            <SignUp onSwitch={() => setShowSignUp(false)} onSignUp={onSignUp} />
          ) : (
            <SignIn onSwitch={() => setShowSignUp(true)} onSignIn={onSignIn} />
          )}
        </div>

      </div>
    </div>
  );
};

export default AuthPage;