import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";
import { ArrowLeft, User, Mail, Phone, FileText } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface JobApplication {
  id: number; // This is the application ID from the Applications table
  applicant_id: string; // This is the UUID of the applicant
  full_name: string;
  email: string;
  phone?: string | null;
  resume_url?: string | null;
  cover_letter_url?: string | null;
  status: string; // 'pending', 'approved', 'rejected'
  created_at: string; // Application creation date
}

export default function JobApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { profile } = useUser();
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState<string>("");

  useEffect(() => {
    const fetchJobAndApplicants = async () => {
      if (!profile?.id || !jobId) {
        setError("User or job ID not available.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch job details to get the title and verify ownership
        const { data: jobData, error: jobError } = await supabase
          .from("Job_Posts")
          .select("profession, company_id")
          .eq("id", parseInt(jobId)) // Convert jobId to number for the query
          .single();

        if (jobError) throw jobError;
        if (!jobData || jobData.company_id !== profile.id) {
          setError("Job not found or you don't have permission to view applicants for this job.");
          setLoading(false);
          return;
        }
        setJobTitle(jobData.profession);

        // Fetch applications for this job
        const { data: applicationsData, error: applicationsError } = await supabase
          .from("Applications")
          .select(`
            id,
            applicant_id,
            full_name,
            email,
            phone,
            resume_url,
            cover_letter_url,
            status,
            created_at
          `)
          .eq("job_id", parseInt(jobId)) // Convert jobId to number for the query
          .order("created_at", { ascending: true });

        if (applicationsError) throw applicationsError;
        setApplicants(applicationsData as JobApplication[]);
      } catch (err: any) {
        console.error("Error fetching job applicants:", err);
        setError(err.message || "Failed to fetch job applicants.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndApplicants();
  }, [jobId, profile?.id]);

  const handleApprove = async (applicationId: number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("Applications")
        .update({ status: "approved" })
        .eq("id", applicationId);

      if (error) throw error;
      toast.success("Applicant approved!");
      // Refresh applicants list
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: "approved" } : app
        )
      );
    } catch (err: any) {
      console.error("Error approving applicant:", err);
      toast.error(err.message || "Failed to approve applicant.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AfterLoginNavbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-700">Loading applicants...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AfterLoginNavbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            <p>{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-blue-600 hover:underline"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      <AfterLoginNavbar />
      <div className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to My Job Posts
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Applicants for "{jobTitle || "Job"}"
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Review profiles of professionals who applied to your job post.
        </p>

        {applicants.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600 text-lg">
              No professionals have applied for this job yet.
            </p>
            <button
              onClick={() => navigate("/my-job-posts")}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Back to My Job Posts
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applicants.map((applicant) => (
              <div
                key={applicant.id} // Use applicant.id for key (which is now the application ID)
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <User size={24} className="text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    {applicant.full_name}
                  </h2>
                </div>
                
                <div className="space-y-2 text-gray-700 mb-4">
                  <p className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-gray-500" />
                    {applicant.email}
                  </p>
                  {applicant.phone && (
                    <p className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-gray-500" />
                      {applicant.phone}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Applied on: {new Date(applicant.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                  {applicant.resume_url && (
                    <a
                      href={applicant.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <FileText size={16} /> View Resume
                    </a>
                  )}
                  {applicant.cover_letter_url && (
                    <a
                      href={applicant.cover_letter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <FileText size={16} /> View Cover Letter
                    </a>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  {applicant.status === "pending" ? (
                    <button
                      onClick={() => handleApprove(applicant.id)} // Use applicant.id (which is now the application ID)
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      Approve Applicant
                    </button>
                  ) : applicant.status === "approved" ? (
                    <p className="w-full text-center text-green-700 bg-green-50 py-2 px-4 rounded-lg text-sm font-medium border border-green-200">
                      Approved
                    </p>
                  ) : (
                    <p className="w-full text-center text-red-700 bg-red-50 py-2 px-4 rounded-lg text-sm font-medium border border-red-200">
                      Rejected
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
