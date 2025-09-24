import { useEffect, useState } from "react";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import { supabase } from "../lib/supabaseClient";
import JobCard, { type JobPost } from "../components/JobCard";
import { useUser } from "../context/UserContext";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function MyJobPosts() {
  const { profile } = useUser();
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchMyJobPosts = async () => {
      if (!profile?.id) {
        setError("User not logged in or user ID not available.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("Job_Posts")
          .select("*, company_name, deadline") // Select company_name and deadline directly
          .eq("company_id", profile.id) // Filter by company_id (UUID) from profile
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setJobPosts(data || []);
      } catch (e: any) {
        console.error("Error fetching job posts:", e);
        setError(`Failed to load job posts: ${e.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobPosts();
  }, [profile?.id, refreshTrigger]);

  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshTrigger(prev => prev + 1);
      // Clear the refresh state so it doesn't trigger on subsequent visits
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.refresh, location.pathname, navigate]);

  const handleDelete = async (jobId: number) => {
    if (window.confirm("Are you sure you want to delete this job post? This action cannot be undone.")) {
      try {
        setLoading(true);
        const { error } = await supabase.from("Job_Posts").delete().eq("id", jobId);
        if (error) {
          throw error;
        }
        toast.success("Job post deleted successfully!");
        setRefreshTrigger(prev => prev + 1); // Trigger re-fetch
      } catch (e: any) {
        console.error("Error deleting job post:", e);
        toast.error(`Failed to delete job post: ${e.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AfterLoginNavbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Job Posts</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-medium">Error: {error}</p>
            <p className="text-sm mt-2">Please try again later.</p>
          </div>
        ) : jobPosts.length === 0 ? (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 text-gray-800">No job posts found</h3>
            <p className="text-gray-600">You haven't posted any jobs yet.</p>
            <button
              onClick={() => { /* Navigate to post a job page */ }}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post a New Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobPosts.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                hideApplyButton={true} // Hide apply button for businessman's job posts
                onClick={() => {
                  // Navigate to the JobApplicants page, passing job.id
                  navigate(`/my-job-posts/${job.id}/applicants`);
                }}
                showViewApplicantsButton={true}
                onViewApplicantsClick={() => {
                  navigate(`/my-job-posts/${job.id}/applicants`);
                }}
                showEditButton={true} // Show edit button for my job posts
                onEditClick={() => {
                  navigate(`/edit-job/${job.id}`); // Navigate to edit job page
                }}
                showDeleteButton={true} // Show delete button for my job posts
                onDeleteClick={() => handleDelete(job.id)} // Pass delete handler
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
