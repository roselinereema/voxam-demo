
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// ==============================
// LANDING
// ==============================

import Landing from "./pages/Landing/Landing";

// ==============================
// AUTHENTICATION
// ==============================

import Login from "./pages/Auth/Login";

import StudentRegister from "./pages/Auth/StudentRegister/StudentRegister";
import StaffRegister from "./pages/Auth/StaffRegister/StaffRegister";

// ==============================
// STAFF
// ==============================

import StaffDashboard from "./pages/Staff/Dashboard/StaffDashboard";
import CreateExam from "./pages/Staff/CreateExam/CreateExam";
import UploadQuestion from "./pages/Staff/UploadQuestion/UploadQuestion";
import QuestionProcessing from "./pages/Staff/QuestionProcessing/QuestionProcessing";
import ScheduleExam from "./pages/Staff/ScheduleExam/ScheduleExam";
import Students from "./pages/Staff/Students/Students";
import ReviewAnswers from "./pages/Staff/ReviewAnswers/ReviewAnswers";
import Settings from "./pages/Staff/Settings/Settings";

// ==============================
// STUDENT
// ==============================

import StudentDashboard from "./pages/Student/Dashboard/Dashboard";
import AvailableExams from "./pages/Student/AvailableExams/AvailableExams";
import MyExams from "./pages/Student/MyExams/MyExams";
import StudentProfile from "./pages/Student/Profile/Profile";
import StudentSettings from "./pages/Student/Settings/Settings";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ==============================
            DEFAULT
        ============================== */}

        <Route
          path="/"
          element={<Navigate to="/landing" replace />}
        />

        {/* ==============================
            LANDING
        ============================== */}

        <Route
          path="/landing"
          element={<Landing />}
        />

        {/* ==============================
            LOGIN
        ============================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ==============================
            STUDENT REGISTRATION
        ============================== */}

        <Route
          path="/student/register"
          element={<StudentRegister />}
        />
        <Route
  path="/staff/register"
  element={<StaffRegister />}
/>

        {/* ==============================
            STAFF ROUTES
        ============================== */}

        <Route
          path="/staff/dashboard"
          element={<StaffDashboard />}
        />

        <Route
          path="/staff/create-exam"
          element={<CreateExam />}
        />

        <Route
          path="/staff/upload-question"
          element={<UploadQuestion />}
        />

        <Route
          path="/staff/question-processing"
          element={<QuestionProcessing />}
        />

        <Route
          path="/staff/schedule-exam"
          element={<ScheduleExam />}
        />

        <Route
          path="/staff/students"
          element={<Students />}
        />

        <Route
          path="/staff/review-answers"
          element={<ReviewAnswers />}
        />

        <Route
          path="/staff/settings"
          element={<Settings />}
        />

        {/* ==============================
            STUDENT DASHBOARD
        ============================== */}

        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />

        {/* ==============================
            AVAILABLE EXAMS
        ============================== */}

        <Route
          path="/student/exams"
          element={<AvailableExams />}
        />

        {/* ==============================
            MY EXAMINATIONS
        ============================== */}

        <Route
          path="/student/my-exams"
          element={<MyExams />}
        />

        {/* ==============================
            STUDENT PROFILE
        ============================== */}

        <Route
          path="/student/profile"
          element={<StudentProfile />}
        />

        {/* ==============================
            STUDENT SETTINGS
        ============================== */}

        <Route
          path="/student/settings"
          element={<StudentSettings />}
        />

        {/* ==============================
            UNKNOWN URL
        ============================== */}

        <Route
          path="*"
          element={<Navigate to="/landing" replace />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;
