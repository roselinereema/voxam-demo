
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import "./StudentRegister.css";

function StudentRegister() {

  const navigate = useNavigate();

  // Form states
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    registerNumber: "",
    email: "",
    department: "",
    yearOfStudy: "",
    password: "",
    confirmPassword: ""
  });


  // Handle input changes
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  };


  // Move to next step
  const handleNext = (e) => {

    e.preventDefault();

    if (!formData.fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!formData.registerNumber.trim()) {
      alert("Please enter your register number.");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    if (!formData.department) {
      alert("Please select your department.");
      return;
    }

    if (!formData.yearOfStudy) {
      alert("Please select your year of study.");
      return;
    }

    setStep(2);

  };


  // Student registration using Supabase
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
            register_number: formData.registerNumber.trim(),
            department: formData.department,
            year_of_study: formData.yearOfStudy
          }

        }

      });

      if (error) {
        alert(error.message);
        return;
      }

      if (data.user) {

        alert(
          "Registration successful! Please check your email and click the confirmation link to verify your account."
        );

        navigate("/login");

      }

    } catch (error) {

      console.error("Registration error:", error);

      alert("Something went wrong. Please try again.");

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="student-register-page">

      {/* =========================
          LEFT SIDE
      ========================= */}

      <div className="student-register-left">

        <h1>🔊 AI Voice Exam</h1>

        <div className="student-register-intro">

          <h2>
            Begin Your
            <br />
            Learning Journey.
          </h2>

          <p>
            Create your student account and experience
            accessible voice-enabled examinations.
          </p>

        </div>

      </div>


      {/* =========================
          RIGHT SIDE
      ========================= */}

      <div className="student-register-right">

        <div className="student-register-card">

          <div className="student-register-header">

            <h2>Create Student Account</h2>

            <p>
              {step === 1
                ? "Enter your personal details"
                : "Create your account password"}
            </p>

          </div>


          {/* =========================
              PROGRESS INDICATOR
          ========================= */}

          <div className="register-progress">

            <div className="progress-steps">

              <div className={`progress-step ${step >= 1 ? "active" : ""}`}>

                <span>1</span>

                <p>Personal Details</p>

              </div>


              <div className="progress-line"></div>


              <div className={`progress-step ${step >= 2 ? "active" : ""}`}>

                <span>2</span>

                <p>Security</p>

              </div>

            </div>


            <div className="progress-track">

              <div
                className={`progress-fill ${step === 2 ? "completed" : ""}`}
              ></div>

            </div>

          </div>


          {/* =========================
              STEP 1: PERSONAL DETAILS
          ========================= */}

          {step === 1 && (

            <form onSubmit={handleNext}>

              <div className="student-form-group">

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


              <div className="student-form-group">

                <label>Register Number</label>

                <input
                  type="text"
                  name="registerNumber"
                  placeholder="Enter your register number"
                  value={formData.registerNumber}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="student-form-group">

                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="student-form-group">

                <label>Department</label>

                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >

                  <option value="">Select Department</option>

                  <option value="CSE">
                    Computer Science
                  </option>

                  <option value="IT">
                    Information Technology
                  </option>

                  <option value="ECE">
                    Electronics and Communication
                  </option>

                  <option value="EEE">
                    Electrical and Electronics
                  </option>

                  <option value="MECH">
                    Mechanical
                  </option>

                  <option value="CIVIL">
                    Civil
                  </option>

                  <option value="OTHER">
                    Other
                  </option>

                </select>

              </div>


              <div className="student-form-group">

                <label>Year of Study</label>

                <select
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                  required
                >

                  <option value="">Select Year</option>

                  <option value="1st Year">1st Year</option>

                  <option value="2nd Year">2nd Year</option>

                  <option value="3rd Year">3rd Year</option>

                  <option value="4th Year">4th Year</option>

                </select>

              </div>


              <button
                type="submit"
                className="student-register-button"
              >

                Continue →

              </button>

            </form>

          )}


          {/* =========================
              STEP 2: PASSWORD
          ========================= */}

          {step === 2 && (

            <form onSubmit={handleSubmit}>

              <div className="student-form-group">

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


              <div className="student-form-group">

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


              <label className="student-show-password">

                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />

                Show Password

              </label>


              <button
                type="submit"
                className="student-register-button"
                disabled={loading}
              >

                {loading
                  ? "Creating Account..."
                  : "Create Account"}

              </button>


              <button
                type="button"
                className="student-back-button"
                onClick={() => setStep(1)}
                disabled={loading}
              >

                ← Back to Personal Details

              </button>

            </form>

          )}


          {/* =========================
              LOGIN LINK
          ========================= */}

          <div className="student-register-footer">

            Already have an account?

            <button
              type="button"
              onClick={() => navigate("/login")}
            >

              Login

            </button>

          </div>


        </div>

      </div>

    </div>

  );

}

export default StudentRegister;
