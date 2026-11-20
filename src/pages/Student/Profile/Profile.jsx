
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import StudentLayout from "../../../components/Layout/StudentLayout";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          setProfile(null);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, register_number, department, year_of_study")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile({
          ...data,
          email: user.email
        });

      } catch (error) {
        console.error("Profile loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <StudentLayout>
      <div className="student-dashboard">

        <div className="student-dashboard-header">
          <div>
            <h2>My Profile</h2>
            <p>View your registered student information.</p>
          </div>
        </div>

        {loading ? (
          <p>Loading profile...</p>
        ) : profile ? (
          <div className="student-exam-card">
            <div className="exam-card-details">

              <h3>{profile.full_name || "Student"}</h3>

              <p>
                <strong>Email:</strong> {profile.email || "Not available"}
              </p>

              <p>
                <strong>Register Number:</strong>{" "}
                {profile.register_number || "Not available"}
              </p>

              <p>
                <strong>Department:</strong>{" "}
                {profile.department || "Not available"}
              </p>

              <p>
                <strong>Year:</strong>{" "}
                {profile.year_of_study || "Not available"}
              </p>

            </div>
          </div>
        ) : (
          <p>Unable to load your profile information.</p>
        )}

      </div>
    </StudentLayout>
  );
}

export default Profile;
