import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import JobPostForm from "../components/JobPostForm";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { type JobPost } from "../components/JobCard";

export default function EditJobPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Job ID not provided.");
      setLoading(false);
      return;
    }

    const fetchJobPost = async () => {
      try {
        const { data, error } = await supabase
          .from("Job_Posts")
          .select("*, company_name, deadline")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setInitialData(data);
        } else {
          setError("Job post not found.");
        }
      } catch (e: any) {
        console.error("Error fetching job post for editing:", e);
        setError(`Failed to load job post: ${e.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchJobPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-lg text-gray-700">Loading job post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-lg text-red-600">Error: {error}</p>
        <button
          onClick={() => navigate('/my-job-posts')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to My Job Posts
        </button>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-lg text-gray-700">Job post not found.</p>
        <button
          onClick={() => navigate('/my-job-posts')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to My Job Posts
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AfterLoginNavbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Job Post</h1>
        <JobPostForm 
          initialData={initialData} 
          isEditing={true} 
          jobId={id} 
          onSubmissionSuccess={() => navigate('/my-job-posts', { state: { refresh: true } })} // Pass callback for successful submission
        />
      </div>
      <Footer />
    </div>
  );
}
