import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Phone, Mail, MapPin, Globe, Linkedin, Instagram, Facebook, Youtube, Twitter, Github } from "lucide-react";

interface UserProfile {
  name: string;
  profession: string;
  logo_url: string;
  experience: number;
  languages: string;
  skills: string;
  address: string;
  summary: string;
  mobile: string;
  whatsapp: string;
  email: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  youtube: string;
  twitter: string;
  github: string;
  website: string;
  google_my_business: string;
}

export default function PublicProfileCard() {
  const { userId } = useParams<{ userId: string }>();
  console.log("useParams userId:", userId); // New debugging line
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      console.log("Fetching public profile for userId:", userId); // Debugging line
      if (!userId) {
        setError("Invalid profile link");
        setLoading(false);
        return;
      }

      try {
        // Fetch public profile data without authentication
        const { data: userProfileData, error: userProfileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", userId)
          .limit(1); // Use limit(1) instead of single()

        console.log("Supabase query result:", { userProfileData, userProfileError }); // Debugging line

        if (userProfileError) {
          setError("Error fetching profile: " + userProfileError.message); // More descriptive error
        } else {
          setUserProfile(userProfileData?.[0] as UserProfile || null); // Access as array element
        }
      } catch (err: any) { // Catch potential unexpected errors
        console.error("Error loading public profile:", err);
        setError(err.message || "Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">This profile may be private or no longer available.</p>
        </div>
      </div>
    );

  if (!userProfile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Profile not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Public Profile Card - Same design as your ProfileCard */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Gradient */}
          <div 
            className="relative px-6 py-8 text-white"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #1d4ed8 100%)'
            }}
          >
            {/* Profile Image */}
            <div className="flex justify-center mb-4">
              {userProfile.logo_url ? (
                <img
                  src={userProfile.logo_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 shadow-lg"
                  style={{ borderColor: '#ffffff' }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-lg"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: '#ffffff' 
                  }}
                >
                  <span className="text-white text-2xl font-bold">
                    {userProfile.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl font-bold text-center text-white mb-1">
              {userProfile.name}
            </h1>
            {userProfile.profession && (
              <p className="text-center text-white text-lg opacity-90">{userProfile.profession}</p>
            )}
          </div>

          {/* Content Section - Same as your ProfileCard */}
          <div className="px-6 py-6" style={{ backgroundColor: '#ffffff' }}>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#2563eb' }}>
                Professional Summary
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                {userProfile.summary || `${userProfile.profession} with ${userProfile.experience} years of experience. Skilled professional ready to deliver exceptional results.`}
              </p>
            </div>

            {userProfile.experience && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#2563eb' }}>
                  Experience
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  {userProfile.experience} years
                </p>
              </div>
            )}

            {userProfile.skills && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#2563eb' }}>
                  Skills
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  {userProfile.skills}
                </p>
              </div>
            )}

            {userProfile.languages && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#2563eb' }}>
                  Languages
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  {userProfile.languages}
                </p>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-3">
              {userProfile.mobile && (
                <div className="flex items-center gap-3" style={{ color: '#374151' }}>
                  <div className="p-2 rounded-full" style={{ backgroundColor: '#dbeafe' }}>
                    <Phone size={16} style={{ color: '#2563eb' }} />
                  </div>
                  <span className="text-sm">{userProfile.mobile}</span>
                </div>
              )}

              {userProfile.whatsapp && (
                <div className="flex items-center gap-3" style={{ color: '#374151' }}>
                  <div className="p-2 rounded-full" style={{ backgroundColor: '#dcfce7' }}>
                    <Phone size={16} style={{ color: '#059669' }} />
                  </div>
                  <span className="text-sm">{userProfile.whatsapp}</span>
                </div>
              )}

              {userProfile.email && (
                <div className="flex items-center gap-3" style={{ color: '#374151' }}>
                  <div className="p-2 rounded-full" style={{ backgroundColor: '#fee2e2' }}>
                    <Mail size={16} style={{ color: '#dc2626' }} />
                  </div>
                  <span className="text-sm">{userProfile.email}</span>
                </div>
              )}

              {userProfile.address && (
                <div className="flex items-center gap-3" style={{ color: '#374151' }}>
                  <div className="p-2 rounded-full" style={{ backgroundColor: '#dcfce7' }}>
                    <MapPin size={16} style={{ color: '#059669' }} />
                  </div>
                  <span className="text-sm">{userProfile.address}</span>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            <div className="mt-6 pt-4" style={{ borderTop: '1px solid #f3f4f6' }}>
              <div className="flex flex-wrap justify-center gap-4">
                {userProfile.linkedin && (
                  <a
                    href={userProfile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white p-2 rounded-full transition-colors" style={{ backgroundColor: '#2563eb' }}
                  >
                    <Linkedin size={16} />
                  </a>
                )}
                {userProfile.instagram && (
                  <a
                    href={userProfile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white p-2 rounded-full transition-colors" style={{ backgroundColor: '#E1306C' }}
                  >
                    <Instagram size={16} />
                  </a>
                )}
                {userProfile.facebook && (
                  <a
                    href={userProfile.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white p-2 rounded-full transition-colors" style={{ backgroundColor: '#1877F2' }}
                  >
                    <Facebook size={16} />
                  </a>
                )}
                {userProfile.youtube && (
                  <a
                    href={userProfile.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white p-2 rounded-full transition-colors" style={{ backgroundColor: '#FF0000' }}
                  >
                    <Youtube size={16} />
                  </a>
                )}
                {userProfile.twitter && (
                  <a
                    href={userProfile.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white p-2 rounded-full transition-colors" style={{ backgroundColor: '#1DA1F2' }}
                  >
                    <Twitter size={16} />
                  </a>
                )}
                {userProfile.github && (
                  <a
                    href={userProfile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white p-2 rounded-full transition-colors" style={{ backgroundColor: '#333333' }}
                  >
                    <Github size={16} />
                  </a>
                )}
                {userProfile.website && (
                  <a
                    href={userProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white p-2 rounded-full transition-colors" style={{ backgroundColor: '#4b5563' }}
                  >
                    <Globe size={16} />
                  </a>
                )}
                {userProfile.google_my_business && (
                  <a
                    href={userProfile.google_my_business}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white p-2 rounded-full transition-colors" style={{ backgroundColor: '#4285F4' }}
                  >
                    <Globe size={16} /> {/* Using Globe icon for Google My Business for now */}
                  </a>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid #f3f4f6' }}>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Powered by Softcadd</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {/* <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-4">Want to create your own professional profile?</p>
          <a 
            href="/register" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your Profile
          </a>
        </div> */}
      </div>
    </div>
  );
}
