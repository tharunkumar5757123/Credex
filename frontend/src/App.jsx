import Home from './pages/Home.jsx';
import SharedAudit from './pages/SharedAudit.jsx';

export default function App() {
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get('ref');

  // Store referral code in localStorage for later use
  if (referralCode) {
    localStorage.setItem('credex-referral', referralCode);
  }

  if (path.startsWith('/audit/')) {
    return <SharedAudit />;
  }

  return <Home referralCode={referralCode} />;
}
