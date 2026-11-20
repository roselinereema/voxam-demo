
import StudentLayout from "../../../components/Layout/StudentLayout";
import { supabase } from "../../../lib/supabase";

function Settings() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      alert("Unable to log out. Please try again.");
      return;
    }

    window.location.href = "/login";
  };

  return (
    <StudentLayout>
      <div className="student-dashboard">

        <div className="student-dashboard-header">
          <div>
            <h2>Settings</h2>
            <p>Manage your account settings.</p>
          </div>
        </div>

        <div className="student-exam-card">
          <div className="exam-card-details">
            <h3>Account</h3>
            <p>Manage your student account.</p>

            <button
              className="start-exam-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

      </div>
    </StudentLayout>
  );
}

export default Settings;
