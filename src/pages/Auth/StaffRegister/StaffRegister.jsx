
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import "./StaffRegister.css";

function StaffRegister() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            role: "staff"
          }
        }
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Unable to create staff account.");
      }

      alert(
        "Staff account created successfully! Please verify your email if required, then log in."
      );

      navigate("/login");
    } catch (error) {
      console.error("Staff registration error:", error);
      alert(error.message || "Unable to create staff account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-register-page">

      {/* LEFT SIDE */}

      <div className="staff-register-left">
        <h1>🔊 AI Voice Exam</h1>

        <div className="staff-register-intro">
          <h2>
            Empowering
            <br />
            Accessible
            <br />
            Examinations.
          </h2>

          <p>
            Create your staff account and manage
            accessible AI-powered voice examinations.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="staff-register-right">
        <div className="staff-register-card">

          <div className="staff-register-header">
            <h2>Create Staff Account</h2>
            <p>
              {step === 1
                ? "Enter your professional details"
                : "Create your account password"}
            </p>
          </div>

          {/* PROGRESS INDICATOR */}

          <div className="staff-register-progress">

            <div className="staff-progress-steps">

              <div className={`staff-progress-step ${step >= 1 ? "active" : ""}`}>
                <span>1</span>
                <p>Personal Details</p>
              </div>

              <div className="staff-progress-line"></div>

              <div className={`staff-progress-step ${step >= 2 ? "active" : ""}`}>
                <span>2</span>
                <p>Security</p>
              </div>

            </div>

            <div className="staff-progress-track">
              <div
                className={`staff-progress-fill ${step === 2 ? "completed" : ""}`}
              ></div>
            </div>

          </div>

          {/* STEP 1 */}

          {step === 1 && (
            <form onSubmit={handleNext}>

              <div className="staff-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="staff-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="staff@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="staff-register-button"
              >
                Continue →
              </button>

            </form>
          )}

          {/* STEP 2 */}

          {step === 2 && (
            <form onSubmit={handleSubmit}>

              <div className="staff-form-group">
                <label>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="staff-form-group">
                <label>Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>

              <label className="staff-show-password">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                Show Password
              </label>

              <button
                type="submit"
                className="staff-register-button"
                disabled={loading}
              >
                {loading
                  ? "Creating Account..."
                  : "Create Staff Account"}
              </button>

              <button
                type="button"
                className="staff-back-button"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← Back to Personal Details
              </button>

            </form>
          )}

          {/* FOOTER */}

          <div className="staff-register-footer">
            Already have an account?

            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>

          <div className="staff-back-home">
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

export default StaffRegister;
