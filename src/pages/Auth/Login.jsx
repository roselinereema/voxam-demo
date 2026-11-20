
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./Login.css";

function Login() {

  const navigate = useNavigate();

  // Login states
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Authentication states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ==============================
  // SUPABASE LOGIN
  // ==============================

  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {

      // STEP 1: Authenticate user

      const { data, error } =
        await supabase.auth.signInWithPassword({

          email: email.trim(),
          password: password

        });

      if (error) {
        throw error;
      }

      // STEP 2: Get user UUID

      const userId = data.user.id;

      // STEP 3: Fetch user profile

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

      if (profileError) {

        await supabase.auth.signOut();

        throw profileError;

      }

      // STEP 4: Verify selected role

      if (profile.role !== role) {

        await supabase.auth.signOut();

        throw new Error(
          `This account is not registered as ${role}.`
        );

      }

      // STEP 5: Navigate according to role

      if (profile.role === "student") {

        navigate("/student/dashboard");

      } else if (profile.role === "staff") {

        navigate("/staff/dashboard");

      } else {

        await supabase.auth.signOut();

        throw new Error("Invalid account role.");

      }

    } catch (error) {

      console.error("Login Error:", error);

      setErrorMessage(error.message);

    } finally {

      setLoading(false);

    }

  };


  // ==============================
  // CREATE ACCOUNT NAVIGATION
  // ==============================

  const handleCreateAccount = () => {

    if (role === "student") {

      navigate("/student/register");

    } else {

      navigate("/staff/register");

    }

  };


  // ==============================
  // PAGE UI
  // ==============================

  return (

    <div className="login-page">

      {/* LEFT SIDE */}

      <div className="login-left">

        <div className="login-brand">

          <div className="login-logo">
            🔊
          </div>

          <div>

            <h1>AI Voice Exam</h1>

            <p>
              Accessible AI-Powered Examination
            </p>

          </div>

        </div>


        <div className="login-introduction">

          <h2>
            Smarter.
            <br />
            Accessible.
            <br />
            Voice Enabled.
          </h2>

          <p>
            Take examinations using voice technology,
            speech-to-text and voice-based answer editing
            for accessible digital assessment.
          </p>


          <div className="login-features">

            <div>
              <span>🔊</span>
              <p>Listen to Questions</p>
            </div>

            <div>
              <span>🎤</span>
              <p>Speak Your Answers</p>
            </div>

            <div>
              <span>✏️</span>
              <p>Edit Answers Using Voice</p>
            </div>

          </div>

        </div>

      </div>


      {/* RIGHT SIDE */}

      <div className="login-right">

        <div className="login-card">

          <div className="login-card-header">

            <h2>Welcome Back</h2>

            <p>
              Login to continue to your portal
            </p>

          </div>


          {/* ROLE SELECTOR */}

          <div className="role-selector">

            <button
              type="button"
              className={
                role === "student"
                  ? "role-button active"
                  : "role-button"
              }
              onClick={() => {
                setRole("student");
                setErrorMessage("");
              }}
            >
              👨‍🎓 Student
            </button>


            <button
              type="button"
              className={
                role === "staff"
                  ? "role-button active"
                  : "role-button"
              }
              onClick={() => {
                setRole("staff");
                setErrorMessage("");
              }}
            >
              👩‍🏫 Staff
            </button>

          </div>


          {/* LOGIN FORM */}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="form-group">

              <label>
                {role === "student"
                  ? "Student Email"
                  : "Staff Email"}
              </label>

              <input
                type="email"
                placeholder={
                  role === "student"
                    ? "student@example.com"
                    : "staff@example.com"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label>Password</label>

              <div className="password-input">

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>

              </div>

            </div>


            {/* LOGIN OPTIONS */}

            <div className="login-options">

              <label className="remember-me">

                <input type="checkbox" />

                <span>Remember me</span>

              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Forgot Password?
              </button>

            </div>


            {/* ERROR MESSAGE */}

            {errorMessage && (

              <p className="login-error">
                {errorMessage}
              </p>

            )}


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading
                ? "Please wait..."
                : `Login as ${
                    role === "student"
                      ? "Student"
                      : "Staff"
                  }`
              }

            </button>

          </form>


          {/* OR SEPARATOR */}

          <div className="login-divider">

            <span></span>

            <p>OR</p>

            <span></span>

          </div>


          {/* CREATE ACCOUNT */}

          <div className="create-account-section">

            <p>Don't have an account?</p>

            <button
              type="button"
              className="create-account-button"
              onClick={handleCreateAccount}
            >
              Create {
                role === "student"
                  ? "Student"
                  : "Staff"
              } Account
            </button>

          </div>


          {/* BACK TO HOME */}

          <div className="back-home">

            <button
              type="button"
              onClick={() => navigate("/landing")}
            >
              ← Back to Home
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Login;
