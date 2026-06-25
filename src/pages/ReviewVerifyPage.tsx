import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSignInWithEmailLink, signInWithEmailLink } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { checkEmailAlreadyReviewed, hashEmail } from '../services/chatReviews';

type VerifyState = 'loading' | 'success' | 'already_reviewed' | 'error';

export default function ReviewVerifyPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<VerifyState>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function handleVerification() {
      try {
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          setErrorMsg('This link is invalid or has already been used.');
          setState('error');
          return;
        }

        // Retrieve the email that was saved before sending the link
        let email = window.localStorage.getItem('reviewVerifyEmail');
        if (!email) {
          // Edge case: opened on a different device — prompt is handled in UI below
          email = window.prompt('Please enter your email to confirm verification:') ?? '';
        }
        if (!email) {
          setErrorMsg('Email is required to complete verification.');
          setState('error');
          return;
        }

        // Complete the Firebase passwordless sign-in
        await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem('reviewVerifyEmail');

        // Hash and check for duplicate review
        const emailHash = await hashEmail(email);
        const alreadyReviewed = await checkEmailAlreadyReviewed(emailHash);

        if (alreadyReviewed) {
          setState('already_reviewed');
          // Redirect after 3 s
          setTimeout(() => navigate('/', { replace: true }), 3000);
          return;
        }

        // Store verified hash in sessionStorage so HomePage can read it
        sessionStorage.setItem('verifiedEmailHash', emailHash);
        sessionStorage.setItem('verifiedEmail', email);

        setState('success');
        setTimeout(() => navigate('/#reviews', { replace: true }), 1500);
      } catch (err: unknown) {
        console.error('[ReviewVerify] error:', err);
        const msg = err instanceof Error ? err.message : 'Verification failed.';
        setErrorMsg(msg);
        setState('error');
      }
    }

    handleVerification();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-150 rounded-3xl shadow-xl max-w-md w-full p-10 text-center space-y-6">
        {state === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-navy/5 flex items-center justify-center">
              <svg className="w-8 h-8 animate-spin text-navy" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-navy">Verifying your email…</h1>
              <p className="text-sm text-gray-400 mt-1">Please wait while we confirm your identity.</p>
            </div>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-navy">Email Verified!</h1>
              <p className="text-sm text-gray-400 mt-1">Redirecting you to the review form…</p>
            </div>
          </>
        )}

        {state === 'already_reviewed' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-navy">Already Reviewed</h1>
              <p className="text-sm text-gray-400 mt-1">
                You've already submitted a review with this email address. Each email can only review once.
              </p>
              <p className="text-xs text-gray-400 mt-3">Redirecting you to the homepage…</p>
            </div>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-navy">Verification Failed</h1>
              <p className="text-sm text-red-500 mt-1">{errorMsg}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy text-white text-sm font-bold hover:bg-navy/90 transition-all"
            >
              Back to Homepage
            </button>
          </>
        )}
      </div>
    </div>
  );
}
