import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Mail, Phone, Globe, Linkedin, Instagram, Facebook, Youtube, Twitter, Github, MapPin } from 'lucide-react';

interface BusinessProfile {
  id: string;
  business_name: string;
  industry?: string;
  logo_url?: string;
  website?: string;
  summary?: string;
  mobile?: string;
  whatsapp?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
  github?: string;
  google_my_business?: string;
}

const PublicBusinessProfile: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!name) {
        setError("Business name not provided in URL.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('business_name', decodeURIComponent(name))
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          throw error;
        }

        if (data) {
          setProfile(data);
        } else {
          setError("Business profile not found.");
        }
      } catch (err: any) {
        console.error("Error fetching business profile:", err);
        setError(`Failed to fetch business profile: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [name]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading business profile...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="flex justify-center items-center h-screen">No business profile found.</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="shadow-lg rounded-lg">
        <CardHeader className="text-center">
          <Avatar className="w-32 h-32 mx-auto mb-4">
            <AvatarImage src={profile.logo_url || ''} alt={`${profile.business_name} logo`} />
            <AvatarFallback>{profile.business_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-4xl font-bold">{profile.business_name}</CardTitle>
          {profile.industry && <CardDescription className="text-xl text-gray-600">{profile.industry}</CardDescription>}
          {profile.summary && <p className="mt-4 text-gray-700">{profile.summary}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-2xl font-semibold border-b pb-2 mb-4">Contact Information</h3>
          {profile.email && (
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-gray-600" />
              <span>{profile.email}</span>
            </div>
          )}
          {profile.mobile && (
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-gray-600" />
              <span>{profile.mobile}</span>
            </div>
          )}
          {profile.whatsapp && (
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-gray-600" />
              <span>WhatsApp: {profile.whatsapp}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-gray-600" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {profile.website}
              </a>
            </div>
          )}

          <h3 className="text-2xl font-semibold border-b pb-2 mb-4 mt-8">Social Media & Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.linkedin && (
              <div className="flex items-center space-x-2">
                <Linkedin className="h-5 w-5 text-gray-600" />
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  LinkedIn
                </a>
              </div>
            )}
            {profile.instagram && (
              <div className="flex items-center space-x-2">
                <Instagram className="h-5 w-5 text-gray-600" />
                <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Instagram
                </a>
              </div>
            )}
            {profile.facebook && (
              <div className="flex items-center space-x-2">
                <Facebook className="h-5 w-5 text-gray-600" />
                <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Facebook
                </a>
              </div>
            )}
            {profile.youtube && (
              <div className="flex items-center space-x-2">
                <Youtube className="h-5 w-5 text-gray-600" />
                <a href={profile.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  YouTube
                </a>
              </div>
            )}
            {profile.twitter && (
              <div className="flex items-center space-x-2">
                <Twitter className="h-5 w-5 text-gray-600" />
                <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Twitter
                </a>
              </div>
            )}
            {profile.github && (
              <div className="flex items-center space-x-2">
                <Github className="h-5 w-5 text-gray-600" />
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  GitHub
                </a>
              </div>
            )}
            {profile.google_my_business && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-600" />
                <a href={profile.google_my_business} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Google My Business
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicBusinessProfile;
