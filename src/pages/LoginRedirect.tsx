import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function LoginRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user after redirect:", error);
        navigate("/login"); // Redirect to login if user not found
        return;
      }

      if (user) {
        const userType = user.user_metadata?.user_type;
        console.log("User type on login redirect:", userType);

        // Revert to /home2 redirection as requested
        navigate("/home2?justLoggedIn=true");
      } else {
        console.warn("No user found after login redirect, redirecting to login.");
        navigate("/login");
      }
    };

    handleRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-lg text-gray-700">Processing login, please wait...</p>
    </div>
  );
}
