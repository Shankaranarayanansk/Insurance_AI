import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { verifyEmail } from '../../redux/slices/authSlice';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        if (token) {
          await dispatch(verifyEmail(token));
          setTimeout(() => {
            navigate('/login', { 
              state: { message: 'Email verified successfully. Please login.' } 
            });
          }, 3000);
        }
      } catch (err: any) {
        setError(err.message || 'Verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [token, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Shield className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            {verifying ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            ) : error ? (
              <>
                <XCircle className="h-12 w-12 text-red-600" />
                <p className="text-red-600">{error}</p>
              </>
            ) : (
              <>
                <CheckCircle className="h-12 w-12 text-green-600" />
                <p className="text-green-600">Email verified successfully!</p>
                <p className="text-sm text-gray-500">Redirecting to login...</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;