import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import { Eye, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";

interface BusinessProfileData {
  id: string;
  business_name: string;
  industry: string;
  logo_url: string;
  website: string;
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
  google_my_business: string;
  created_at: string;
}

export default function BusinessProfilePage() {
  const [businessProfile, setBusinessProfile] = useState<BusinessProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBusinessProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          if (isMounted) setError("Failed to get user");
          return;
        }

        if (!user) {
          if (isMounted) navigate("/login");
          return;
        }

        const { data: businessProfileData, error: businessProfileError } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", user.id)
          .single();

        if (businessProfileError) {
          if (isMounted) setError("Error fetching business profile: " + businessProfileError.message);
        } else {
          if (isMounted) setBusinessProfile(businessProfileData as BusinessProfileData);
        }
      } catch (err) {
        if (isMounted) setError("Unexpected error occurred");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBusinessProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleViewCard = () => navigate("/business-profile-card");

  const handleDownloadPdf = async () => {
    if (!cardRef.current || !businessProfile) return;

    setDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        filter: (node) => !(node.tagName === "IMG"), // skip <img> tags
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(dataUrl);

      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${businessProfile.business_name}-profile.pdf`);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-lg">Loading business profile...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-red-500 text-lg">{error}</p>
      </div>
    );

  if (!businessProfile)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-lg">No business profile found</p>
      </div>
    );

  return (
    <>
      <AfterLoginNavbar />

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6" ref={cardRef}>
        {/* Header with Action Buttons */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Business Profile Info */}
            <div className="flex items-center gap-4 md:gap-6">
              {businessProfile.logo_url ? (
                <img
                  src={businessProfile.logo_url}
                  alt="Business Logo"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 text-2xl">
                    {businessProfile.business_name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  {businessProfile.business_name}
                </h1>
                <p className="text-gray-600">{businessProfile.industry}</p>
                {businessProfile.website && (
                  <p className="text-sm text-blue-500 hover:underline">
                    <a href={businessProfile.website} target="_blank" rel="noopener noreferrer">
                      {businessProfile.website}
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
              <button
                onClick={handleViewCard}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <Eye size={16} />
                View Card
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
              >
                <Download size={16} />
                {downloading ? "Downloading..." : "PDF"}
              </button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {businessProfile.mobile && <p>📞 {businessProfile.mobile}</p>}
            {businessProfile.whatsapp && <p>💬 {businessProfile.whatsapp}</p>}
            {businessProfile.email && <p>📧 {businessProfile.email}</p>}
            {/* Address is not in business profile table based on provided schema. Remove if not applicable. */}
            {businessProfile.website && <p>🌐 <a href={businessProfile.website} target="_blank" rel="noopener noreferrer">{businessProfile.website}</a></p>}
          </div>
        </div>

        {/* About Business */}
        {businessProfile.summary && (
          <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">About Business</h2>
            <p className="text-gray-700 leading-relaxed">
              {businessProfile.summary}
            </p>
          </div>
        )}

        {/* Social Links */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Social Media & Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {businessProfile.linkedin && (
              <a
                href={businessProfile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                🔗 LinkedIn
              </a>
            )}
            {businessProfile.instagram && (
              <a
                href={businessProfile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:underline"
              >
                📸 Instagram
              </a>
            )}
            {businessProfile.facebook && (
              <a
                href={businessProfile.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-800 hover:underline"
              >
                📘 Facebook
              </a>
            )}
            {businessProfile.youtube && (
              <a
                href={businessProfile.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:underline"
              >
                ▶️ YouTube
              </a>
            )}
            {businessProfile.twitter && (
              <a
                href={businessProfile.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                🐦 Twitter
              </a>
            )}
            {businessProfile.github && (
              <a
                href={businessProfile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:underline"
              >
                💻 GitHub
              </a>
            )}
            {businessProfile.google_my_business && (
              <a
                href={businessProfile.google_my_business}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                📍 Google My Business
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
