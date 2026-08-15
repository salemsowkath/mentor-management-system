import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

const emptyForm = {
  name: "",
  email: "",
  gender: "",
  mobile: "",
  alternate_email: "",
  dob: "",
  mother_tongue: "",
  nativity_state: "",
  sslc_percentage: "",
  sslc_gap: false,
  hsc_diploma_percentage: "",
  hsc_diploma_gap: false,
  ug_degree: "",
  ug_department: "",
  ug_institute: "",
  ug_university: "",
  ug_year_of_passing: "",
  ug_percentage: "",
  ug_active_backlog: 0,
};

function App() {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("mentor_token")
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Session expired");
        }

        return response.json();
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("mentor_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleLoginSuccess = (loginData) => {
    localStorage.setItem(
      "mentor_token",
      loginData.token
    );

    setToken(loginData.token);
    setUser(loginData.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("mentor_token");
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="screen-center">
        <div className="loading-box">
          Checking login...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (user.role === "HOD") {
    return (
      <HODDashboard
        user={user}
        token={token}
        onLogout={handleLogout}
      />
    );
  }

  if (user.role === "MENTOR") {
    return (
      <MentorDashboard
        title="Mentor Dashboard"
        subtitle="Mentor Management"
        user={user}
        token={token}
        onLogout={handleLogout}
      />
    );
  }

  if (user.role === "STUDENT") {
    return (
      <StudentDashboard
        title="Student Dashboard"
        subtitle="Student Portal"
        user={user}
        token={token}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="screen-center">
      <div className="loading-box">
        Unknown user role.
      </div>
    </div>
  );
}function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      if (!response.ok) {
  setError(
    data.message || "Invalid username or password"
  );
  return;
}

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Invalid username or password"
        );
        return;
      }

      onLoginSuccess(data);
    } catch (error) {
      console.error("Login error:", error);
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          MMS
        </div>

        <h1>
          Mentor Management System
        </h1>

        <p className="login-subtitle">
          Secure Role-Based Login
        </p>

        <form onSubmit={handleSubmit}>

          <div className="login-field">
            <label>Username</label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />
          </div>

          <div className="login-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

        <div className="login-info">
          <p>Development HOD Account</p>
          <span>
            Username: <strong>hod</strong>
          </span>
          <span>
            Password: <strong>hod123</strong>
          </span>
        </div>

      </div>

    </div>
  );
}function HODDashboard({
  user,
  token,
  onLogout,
}) {
  const [activeModule, setActiveModule] =
    useState("dashboard");

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            MMS
          </div>

          <div>
            <h2>Mentor System</h2>
            <span>HOD Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button
            className={
              activeModule === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActiveModule("dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={
              activeModule === "mentors"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActiveModule("mentors")
            }
          >
            <span>👨‍🏫</span>
            Manage Mentors
          </button>

          <button
            className={
              activeModule === "students"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActiveModule("students")
            }
          >
            <span>🎓</span>
            Student Management
          </button>

          <button
            className="nav-item"
            onClick={() =>
              alert("Manage Subjects module coming next")
            }
          >
            <span>📚</span>
            Manage Subjects
          </button>

          <button
            className="nav-item"
            onClick={() =>
              alert("Groups module coming next")
            }
          >
            <span>👥</span>
            Student Groups
          </button>

          <button
            className="nav-item"
            onClick={() =>
              alert("Approvals module coming next")
            }
          >
            <span>✓</span>
            Approvals
          </button>

          <button
            className="nav-item"
            onClick={() =>
              alert("Reports module coming next")
            }
          >
            <span>📊</span>
            Department Reports
          </button>

          <button
            className="nav-item"
            onClick={() =>
              alert("Master Data module coming next")
            }
          >
            <span>⚙</span>
            Master Data
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-user">
            <div className="user-avatar">
              {user.fullName
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div>
              <strong>
                {user.fullName}
              </strong>

              <span>HOD</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </aside>


      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <h1>
              {activeModule === "dashboard"
                ? "HOD Dashboard"
                : activeModule === "mentors"
                ? "Manage Mentors"
                : "Student Management"}
            </h1>

            <p>
              Welcome back, {user.fullName}
            </p>
          </div>

          <div className="header-role">
            HOD
          </div>

        </header>


        {activeModule === "dashboard" && (
          <HODHome token={token} />
        )}

        {activeModule === "mentors" && (
          <MentorManagement token={token} />
        )}

        {activeModule === "mentor-assignments" && (
          <MentorStudentAssignments token={token} />
       )}

        {activeModule === "students" && (
          <StudentManagement token={token} />
       )}

      </main>

    </div>
  );
}function HODHome({ token }) {
  const [studentCount, setStudentCount] =
    useState(0);

  const [mentorCount, setMentorCount] =
    useState(0);

  useEffect(() => {

    const loadCounts = async () => {
      try {

        const studentResponse =
          await fetch(
            `${API}/api/students`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (studentResponse.ok) {
          const studentData =
            await studentResponse.json();

          setStudentCount(
            studentData.students?.length || 0
          );
        }

        const mentorResponse =
          await fetch(
            `${API}/api/mentors`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (mentorResponse.ok) {
          const mentorData =
            await mentorResponse.json();

          setMentorCount(
            mentorData.mentors?.length || 0
          );
        }

      } catch (error) {
        console.error(
          "Dashboard count error:",
          error
        );
      }
    };

    loadCounts();

  }, [token]);

  return (
    <div className="dashboard-content">

      <div className="welcome-card">

        <div>
          <h2>
            Welcome to HOD Dashboard
          </h2>

          <p>
            Manage your department,
            mentors and students from
            one place.
          </p>
        </div>

        <div className="welcome-icon">
          🏫
        </div>

      </div>


      <div className="stats-grid">

        <StatCard
          title="Total Students"
          value={studentCount}
          icon="🎓"
        />

        <StatCard
          title="Total Mentors"
          value={mentorCount}
          icon="👨‍🏫"
        />

        <StatCard
          title="Pending Approvals"
          value="0"
          icon="✓"
        />

        <StatCard
          title="Department Reports"
          value="0"
          icon="📊"
        />

      </div>


      <div className="dashboard-section">

        <h2>
          HOD Responsibilities
        </h2>

        <div className="responsibility-grid">

          <div className="responsibility-card">
            <span>👨‍🏫</span>
            <h3>Manage Mentors</h3>
            <p>
              Register and manage
              department mentors.
            </p>
          </div>

          <div className="responsibility-card">
            <span>🎓</span>
            <h3>Student Management</h3>
            <p>
              Manage student information
              and profiles.
            </p>
          </div>

          <div className="responsibility-card">
            <span>👥</span>
            <h3>Groups</h3>
            <p>
              Organize students and
              assign mentors.
            </p>
          </div>

          <div className="responsibility-card">
            <span>📊</span>
            <h3>Reports</h3>
            <p>
              Monitor department
              performance.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>
      </div>

    </div>
  );
}function MentorDashboard({
  title,
  subtitle,
  user,
  token,
  onLogout,
}) {
  const [activeModule, setActiveModule] =
    useState("dashboard");

  const mentorModules = [
    {
      id: "dashboard",
      icon: "⌂",
      name: "Dashboard",
    },
    {
      id: "students",
      icon: "🎓",
      name: "My Students",
    },
    {
      id: "attendance",
      icon: "✓",
      name: "Attendance",
    },
    {
      id: "cia",
      icon: "📊",
      name: "CIA / Marks",
    },
    {
      id: "counselling",
      icon: "🧠",
      name: "Counselling",
    },
    {
      id: "parent",
      icon: "👨‍👩‍👧",
      name: "Parent Interactions",
    },
    {
      id: "tracking",
      icon: "📈",
      name: "Learner Tracking",
    },
    {
      id: "achievements",
      icon: "🏆",
      name: "Achievements",
    },
    {
      id: "action-plan",
      icon: "📅",
      name: "Monthly Action Plan",
    },
  ];

  const renderModule = () => {
    switch (activeModule) {

      case "students":
        return (
          <MentorAssignedStudents
             token={token}
          />
        );

      case "attendance":
        return (
          <div className="coming-card">
            <div className="coming-icon">
              ✓
            </div>

            <h2>
              Attendance
            </h2>

            <p>
              Attendance Tracker
            </p>
          </div>
        );

      case "cia":
        return (
          <div className="coming-card">
            <div className="coming-icon">
              📊
            </div>

            <h2>
              CIA / Marks
            </h2>

            <p>
              Continuous Internal Assessment
            </p>
          </div>
        );

      case "counselling":
        return (
          <div className="coming-card">
            <div className="coming-icon">
              🧠
            </div>

            <h2>
              Counselling
            </h2>

            <p>
              Counselling Register
            </p>
          </div>
        );

      case "parent":
        return (
          <div className="coming-card">
            <div className="coming-icon">
              👨‍👩‍👧
            </div>

            <h2>
              Parent Interactions
            </h2>

            <p>
              Parent Meeting and Communication History
            </p>
          </div>
        );

      case "tracking":
        return (
          <div className="coming-card">
            <div className="coming-icon">
              📈
            </div>

            <h2>
              Learner Tracking
            </h2>

            <p>
              Categorize and track student progress
            </p>
          </div>
        );

      case "achievements":
        return (
          <div className="coming-card">
            <div className="coming-icon">
              🏆
            </div>

            <h2>
              Student Achievements
            </h2>

            <p>
              Achievement Log and Registry
            </p>
          </div>
        );

      case "action-plan":
        return (
          <div className="coming-card">
            <div className="coming-icon">
              📅
            </div>

            <h2>
              Monthly Action Plan
            </h2>

            <p>
              Create and manage monthly student actions
            </p>
          </div>
        );

      default:
        return (
          <MentorHome
            user={user}
            onNavigate={setActiveModule}
          />
        );
    }
  };

  return (
    <div className="dashboard-layout">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="sidebar">

        <div className="sidebar-logo">

          <div className="sidebar-logo-icon">
            MMS
          </div>

          <div>
            <h2>
              Mentor System
            </h2>

            <span>
              Mentor Portal
            </span>
          </div>

        </div>


        <nav className="sidebar-nav">

          {mentorModules.map((module) => (

            <button
              key={module.id}
              className={
                activeModule === module.id
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() =>
                setActiveModule(module.id)
              }
            >

              <span>
                {module.icon}
              </span>

              {module.name}

            </button>

          ))}

        </nav>


        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="user-avatar">

              {user.fullName
                ?.charAt(0)
                ?.toUpperCase()}

            </div>

            <div>

              <strong>
                {user.fullName}
              </strong>

              <span>
                MENTOR
              </span>

            </div>

          </div>


          <button
            className="logout-button"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </aside>


      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>

            <h1>
              {title}
            </h1>

            <p>
              Welcome, {user.fullName}
            </p>

          </div>


          <div className="header-role">
            MENTOR
          </div>

        </header>


        <div className="dashboard-content">

          {renderModule()}

        </div>

      </main>

    </div>
  );
}function MentorHome({ user, onNavigate }) {

  return (
    <div className="module-content">

      <div className="module-toolbar">

        <div>

          <h2>
            Mentor Dashboard
          </h2>

          <p>
            Welcome back, {user.fullName}
          </p>

        </div>

      </div>


      <div className="stat-grid">

        <StatCard
          title="My Students"
          value="0"
          icon="🎓"
        />

        <StatCard
          title="Attendance"
          value="0%"
          icon="✓"
        />

        <StatCard
          title="Pending Tasks"
          value="0"
          icon="📋"
        />

        <StatCard
          title="Achievements"
          value="0"
          icon="🏆"
        />

      </div>


      <div className="dashboard-section">

        <h2>
          Mentor Responsibilities
        </h2>

        <div className="responsibility-grid">

          <div className="responsibility-card">
            <span>🎓</span>

            <h3>
              My Students
            </h3>

            <p>
              <button
                className="primary-button"
                onClick={() => onNavigate("students")}
              >
                👥 View My Students
              </button>
            </p>
          </div>


          <div className="responsibility-card">
            <span>✓</span>

            <h3>
              Attendance
            </h3>

            <p>
              Manage student attendance records.
            </p>
          </div>


          <div className="responsibility-card">
            <span>📊</span>

            <h3>
              CIA / Marks
            </h3>

            <p>
              Monitor student academic performance.
            </p>
          </div>


          <div className="responsibility-card">
            <span>🧠</span>

            <h3>
              Counselling
            </h3>

            <p>
              Maintain student counselling records.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}function StudentManagement({ token }) {

  const [students, setStudents] =
    useState([]);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [editingStudent, setEditingStudent] =
    useState(null);

  const [formData, setFormData] =
    useState(emptyForm);


  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };


  const fetchStudents = async () => {

    try {

      const response = await fetch(
        `${API}/api/students`,
        {
          headers: authHeaders,
        }
      );

      if (response.status === 401 ||
          response.status === 403) {
        throw new Error(
          "You are not authorized"
        );
      }

      if (!response.ok) {
        throw new Error(
          "Failed to fetch students"
        );
      }

      const data =
        await response.json();

      setStudents(
        data.students || []
      );

    } catch (error) {

      console.error(
        "Fetch students error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchStudents();

  }, []);


  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const url = editingStudent
        ? `${API}/api/students/${editingStudent.student_id}`
        : `${API}/api/students`;

      const method =
        editingStudent
          ? "PUT"
          : "POST";

      const response = await fetch(
        url,
        {
          method,
          headers: {
            ...authHeaders,
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify(formData),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        alert(
          data.message ||
          "Operation failed"
        );

        return;
      }

      alert(
        editingStudent
          ? "Student updated successfully!"
          : "Student added successfully!"
      );

      setShowAddForm(false);
      setEditingStudent(null);
      setFormData({ ...emptyForm });

      await fetchStudents();

    } catch (error) {

      console.error(
        "Student save error:",
        error
      );

      alert(
        "Server connection failed"
      );
    }
  };


  const handleAddStudent = () => {

    setEditingStudent(null);
    setFormData({ ...emptyForm });
    setShowAddForm(true);
  };


  const handleEditStudent = (
    student
  ) => {

    setEditingStudent(student);

    setFormData({

      name:
        student.name || "",

      email:
        student.email || "",

      gender:
        student.gender || "",

      mobile:
        student.mobile || "",

      alternate_email:
        student.alternate_email || "",

      dob:
        student.dob
          ? String(student.dob)
              .substring(0, 10)
          : "",

      mother_tongue:
        student.mother_tongue || "",

      nativity_state:
        student.nativity_state || "",

      sslc_percentage:
        student.sslc_percentage ?? "",

      sslc_gap:
        Boolean(student.sslc_gap),

      hsc_diploma_percentage:
        student.hsc_diploma_percentage ?? "",

      hsc_diploma_gap:
        Boolean(
          student.hsc_diploma_gap
        ),

      ug_degree:
        student.ug_degree || "",

      ug_department:
        student.ug_department || "",

      ug_institute:
        student.ug_institute || "",

      ug_university:
        student.ug_university || "",

      ug_year_of_passing:
        student.ug_year_of_passing ?? "",

      ug_percentage:
        student.ug_percentage ?? "",

      ug_active_backlog:
        student.ug_active_backlog ?? 0,

    });

    setShowAddForm(true);
  };


  const handleCancel = () => {

    setShowAddForm(false);
    setEditingStudent(null);
    setFormData({ ...emptyForm });

  };


  const handleDeleteStudent = async (
    student
  ) => {

    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete ${student.name}?`
      );

    if (!confirmDelete) {
      return;
    }

    try {

      const response = await fetch(
        `${API}/api/students/${student.student_id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        alert(
          data.message ||
          "Failed to delete student"
        );

        return;
      }

      alert(
        "Student deleted successfully!"
      );

      await fetchStudents();

    } catch (error) {

      console.error(
        "Delete student error:",
        error
      );

      alert(
        "Server connection failed"
      );
    }
  };


  if (loading) {

    return (
      <div className="loading-module">
        Loading students...
      </div>
    );
  }


  if (selectedStudent) {

    return (
      <StudentProfile
        student={selectedStudent}
        onBack={() =>
          setSelectedStudent(null)
        }
      />
    );
  }


  return (
    <div className="module-content">

      <div className="module-toolbar">

        <div>
          <h2>
            Student Management
          </h2>

          <p>
            {students.length} students
            registered
          </p>
        </div>

        <button
          className="add-button"
          onClick={handleAddStudent}
        >
          + Add Student
        </button>

      </div>


      {showAddForm && (

        <form
          className="student-form"
          onSubmit={handleSubmit}
        >

          <h2>
            {editingStudent
              ? "Edit Student"
              : "Add New Student"}
          </h2>

          <div className="form-grid">

            <div className="form-group">
              <label>Name *</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>


            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>Gender</label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">
                  Select Gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>
              </select>
            </div>


            <div className="form-group">
              <label>Mobile</label>

              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>
                Alternate Email
              </label>

              <input
                type="email"
                name="alternate_email"
                value={
                  formData.alternate_email
                }
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>
                Date of Birth
              </label>

              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>
                Mother Tongue
              </label>

              <input
                type="text"
                name="mother_tongue"
                value={
                  formData.mother_tongue
                }
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>
                Nativity State
              </label>

              <input
                type="text"
                name="nativity_state"
                value={
                  formData.nativity_state
                }
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>
                SSLC Percentage
              </label>

              <input
                type="number"
                step="0.01"
                name="sslc_percentage"
                value={
                  formData.sslc_percentage
                }
                onChange={handleChange}
              />
            </div>


            <div className="form-group checkbox-group">

              <label>
                <input
                  type="checkbox"
                  name="sslc_gap"
                  checked={
                    formData.sslc_gap
                  }
                  onChange={handleChange}
                />
                SSLC Gap
              </label>

            </div>


            <div className="form-group">
              <label>
                HSC / Diploma Percentage
              </label>

              <input
                type="number"
                step="0.01"
                name="hsc_diploma_percentage"
                value={
                  formData.hsc_diploma_percentage
                }
                onChange={handleChange}
              />
            </div>


            <div className="form-group checkbox-group">

              <label>
                <input
                  type="checkbox"
                  name="hsc_diploma_gap"
                  checked={
                    formData.hsc_diploma_gap
                  }
                  onChange={handleChange}
                />
                HSC / Diploma Gap
              </label>

            </div>


            <div className="form-group">
              <label>
                UG Degree
              </label>

              <input
                type="text"
                name="ug_degree"
                value={
                  formData.ug_degree
                }
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>
                UG Department
              </label>

              <input
                type="text"
                name="ug_department"
                value={
                  formData.ug_department
                }
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>
                UG Institute
              </label>

              <input
                type="text"
                name="ug_institute"
                value={
                  formData.ug_institute
                }
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>
                UG University
              </label>

              <input
                type="text"
                name="ug_university"
                value={
                  formData.ug_university
                }
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>
                UG Year of Passing
              </label>

              <input
                type="number"
                name="ug_year_of_passing"
                value={
                  formData.ug_year_of_passing
                }
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>
                UG Percentage
              </label>

              <input
                type="number"
                step="0.01"
                name="ug_percentage"
                value={
                  formData.ug_percentage
                }
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>
                Active Backlog
              </label>

              <input
                type="number"
                min="0"
                name="ug_active_backlog"
                value={
                  formData.ug_active_backlog
                }
                onChange={handleChange}
              />
            </div>

          </div>


          <div className="form-actions">

            <button
              type="submit"
              className="save-button"
            >
              {editingStudent
                ? "Update Student"
                : "Save Student"}
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>

          </div>

        </form>
      )}


      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Mobile</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {students.length === 0 ? (

              <tr>
                <td
                  colSpan="6"
                  className="empty-table"
                >
                  No students found
                </td>
              </tr>

            ) : (

              students.map((student) => (

                <tr
                  key={
                    student.student_id
                  }
                >

                  <td>
                    {student.student_id}
                  </td>

                  <td>
                    {student.name}
                  </td>

                  <td>
                    {student.email ||
                      "—"}
                  </td>

                  <td>
                    {student.gender ||
                      "—"}
                  </td>

                  <td>
                    {student.mobile ||
                      "—"}
                  </td>

                  <td>

                    <div className="action-buttons">

                      <button
                        className="view-button"
                        onClick={() =>
                          setSelectedStudent(
                            student
                          )
                        }
                      >
                        View
                      </button>

                      <button
                        className="edit-button"
                        onClick={() =>
                          handleEditStudent(
                            student
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDeleteStudent(
                            student
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}function StudentProfile({
  student,
  onBack,
}) {
  return (
    <div className="profile">

      <button
        className="back-button"
        onClick={onBack}
      >
        ← Back to Students
      </button>

      <div className="profile-header">

        <div className="avatar">
          {student.name
            ?.charAt(0)}
        </div>

        <div>
          <h2>
            {student.name}
          </h2>

          <p>
            Student ID:{" "}
            {student.student_id}
          </p>
        </div>

      </div>


      <section className="profile-section">

        <h3>
          Personal Information
        </h3>

        <div className="details-grid">

          <Detail
            label="Email"
            value={student.email}
          />

          <Detail
            label="Alternate Email"
            value={
              student.alternate_email
            }
          />

          <Detail
            label="Gender"
            value={student.gender}
          />

          <Detail
            label="Mobile"
            value={student.mobile}
          />

          <Detail
            label="Date of Birth"
            value={student.dob}
          />

          <Detail
            label="Mother Tongue"
            value={
              student.mother_tongue
            }
          />

          <Detail
            label="Nativity"
            value={
              student.nativity_state
            }
          />

        </div>

      </section>


      <section className="profile-section">

        <h3>
          Academic Information
        </h3>

        <div className="details-grid">

          <Detail
            label="SSLC Percentage"
            value={
              student.sslc_percentage !==
              null
                ? `${student.sslc_percentage}%`
                : null
            }
          />

          <Detail
            label="SSLC Gap"
            value={
              student.sslc_gap
                ? "Yes"
                : "No"
            }
          />

          <Detail
            label="HSC / Diploma Percentage"
            value={
              student.hsc_diploma_percentage !==
              null
                ? `${student.hsc_diploma_percentage}%`
                : null
            }
          />

          <Detail
            label="HSC / Diploma Gap"
            value={
              student.hsc_diploma_gap
                ? "Yes"
                : "No"
            }
          />

          <Detail
            label="UG Degree"
            value={
              student.ug_degree
            }
          />

          <Detail
            label="UG Department"
            value={
              student.ug_department
            }
          />

          <Detail
            label="UG Institute"
            value={
              student.ug_institute
            }
          />

          <Detail
            label="UG University"
            value={
              student.ug_university
            }
          />

          <Detail
            label="UG Year of Passing"
            value={
              student.ug_year_of_passing
            }
          />

          <Detail
            label="UG Percentage"
            value={
              student.ug_percentage !==
              null
                ? `${student.ug_percentage}%`
                : null
            }
          />

          <Detail
            label="Active Backlog"
            value={
              student.ug_active_backlog
            }
          />

        </div>

      </section>

    </div>
  );
}function Detail({
  label,
  value,
}) {
  return (
    <div className="detail">

      <span>
        {label}
      </span>

      <strong>
        {value ?? "Not provided"}
      </strong>

    </div>
  );
}

// ======================================================
// HOD — MENTOR ASSIGNMENT
// ======================================================

function MentorStudentAssignments({ token }) {
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignmentData();
  }, []);

  const loadAssignmentData = async () => {
    try {
      const [mentorResponse, studentResponse] =
        await Promise.all([
          fetch(`${API}/api/mentor-assignments/mentors`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API}/api/mentor-assignments/students`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const mentorData = await mentorResponse.json();
      const studentData = await studentResponse.json();

      if (!mentorResponse.ok) {
        throw new Error(
          mentorData.message || "Failed to load mentors"
        );
      }

      if (!studentResponse.ok) {
        throw new Error(
          studentData.message || "Failed to load students"
        );
      }

      setMentors(mentorData.mentors || []);
      setStudents(studentData.students || []);

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  };

  const assignStudents = async () => {
    if (!selectedMentor) {
      alert("Please select a mentor");
      return;
    }

    if (selectedStudents.length === 0) {
      alert("Please select at least one student");
      return;
    }

    try {
      const response = await fetch(
        `${API}/api/mentor-assignments`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            mentor_id: Number(selectedMentor),
            student_ids: selectedStudents,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Assignment failed"
        );
      }

      alert(data.message);

      setSelectedStudents([]);

      await loadAssignmentData();

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-module">
        Loading mentor assignments...
      </div>
    );
  }

  return (
    <div className="module-content">

      <div className="module-toolbar">
        <div>
          <h2>
            Assign Students to Mentor
          </h2>

          <p>
            HOD can assign students to active mentors.
          </p>
        </div>
      </div>


      <div className="assignment-card">

        <label>
          Select Mentor
        </label>

        <select
          value={selectedMentor}
          onChange={(e) =>
            setSelectedMentor(e.target.value)
          }
        >
          <option value="">
            -- Select Mentor --
          </option>

          {mentors.map((mentor) => (
            <option
              key={mentor.id}
              value={mentor.id}
            >
              {mentor.name} ({mentor.employee_id})
            </option>
          ))}
        </select>


        <h3>
          Select Students
        </h3>


        <div className="student-selection-list">

          {students.map((student) => (

            <label
              key={student.student_id}
              className="student-selection-item"
            >

              <input
                type="checkbox"
                checked={selectedStudents.includes(
                  student.student_id
                )}
                disabled={Boolean(
                  student.assignment_id
                )}
                onChange={() =>
                  toggleStudent(
                    student.student_id
                  )
                }
              />

              <span>
                <strong>
                  {student.name}
                </strong>

                <small>
                  {student.email}
                </small>
              </span>

              {student.assignment_id && (
                <em>
                  Assigned to {student.mentor_name}
                </em>
              )}

            </label>

          ))}

        </div>


        <button
          className="primary-button"
          onClick={assignStudents}
        >
          Assign Selected Students
        </button>

      </div>

    </div>
  );
}

// ======================================================
// MENTOR — ASSIGNED STUDENTS
// ======================================================

function MentorAssignedStudents({ token }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchAssignedStudents = async () => {
    try {
      setLoading(true);

      if (!token) {
        throw new Error("Authentication token missing");
      }

      const response = await fetch(
        `${API}/api/mentor/my-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load assigned students"
        );
      }

      setStudents(data.students || []);

    } catch (error) {
      console.error(
        "Fetch assigned students error:",
        error
      );

      alert(error.message);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAssignedStudents();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="loading-module">
        Loading assigned students...
      </div>
    );
  }

  if (selectedStudent) {
    return (
      <div className="module-content">

        <button
          className="back-button"
          onClick={() =>
            setSelectedStudent(null)
          }
        >
          ← Back to My Students
        </button>

        <div className="profile">

          <div className="profile-header">

            <div className="avatar">
              {selectedStudent.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div>
              <h2>
                {selectedStudent.name}
              </h2>

              <p>
                Student ID:{" "}
                {selectedStudent.student_id}
              </p>
            </div>

          </div>

          <section className="profile-section">

            <h3>
              Student Information
            </h3>

            <div className="details-grid">

              <Detail
                label="Name"
                value={selectedStudent.name}
              />

              <Detail
                label="Email"
                value={selectedStudent.email}
              />

              <Detail
                label="Mobile"
                value={selectedStudent.mobile}
              />

              <Detail
                label="Gender"
                value={selectedStudent.gender}
              />

              <Detail
                label="Department"
                value={selectedStudent.ug_department}
              />

              <Detail
                label="UG Degree"
                value={selectedStudent.ug_degree}
              />

              <Detail
                label="UG Percentage"
                value={
                  selectedStudent.ug_percentage !== null
                    ? `${selectedStudent.ug_percentage}%`
                    : null
                }
              />

              <Detail
                label="Active Backlog"
                value={selectedStudent.ug_active_backlog}
              />

            </div>

          </section>

        </div>

      </div>
    );
  }

  return (
    <div className="module-content">

      <div className="module-toolbar">

        <div>
          <h2>
            My Students
          </h2>

          <p>
            {students.length} assigned students
          </p>
        </div>

        <button
          className="primary-button"
          onClick={fetchAssignedStudents}
        >
          ↻ Refresh
        </button>

      </div>

      {students.length === 0 ? (

        <div className="coming-card">

          <div className="coming-icon">
            🎓
          </div>

          <h2>
            No Students Assigned
          </h2>

          <p>
            The HOD has not assigned any students
            to you yet.
          </p>

        </div>

      ) : (

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Department</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {students.map((student) => (

                <tr
                  key={student.student_id}
                >

                  <td>
                    {student.student_id}
                  </td>

                  <td>
                    <strong>
                      {student.name}
                    </strong>
                  </td>

                  <td>
                    {student.email || "—"}
                  </td>

                  <td>
                    {student.mobile || "—"}
                  </td>

                  <td>
                    {student.ug_department || "—"}
                  </td>

                  <td>

                    <button
                      className="view-button"
                      onClick={() =>
                        setSelectedStudent(
                          student
                        )
                      }
                    >
                      View
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

// ======================================================
// HOD — MENTOR MANAGEMENT
// ======================================================

function MentorManagement({ token }) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingMentor, setEditingMentor] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    employee_id: "",
    department: "",
    designation: "Mentor",
    username: "",
    password: "",
    status: "Active",
  });

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };


  // ==========================================
  // FETCH MENTORS
  // ==========================================

  const fetchMentors = async () => {
    try {
      setLoading(true);

      if (!token) {
        throw new Error("Authentication token missing");
      }

      const response = await fetch(
        `${API}/api/mentors`,
        {
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch mentors"
        );
      }

      setMentors(data.mentors || []);

    } catch (error) {
      console.error(
        "Fetch mentors error:",
        error
      );

      alert(
        error.message ||
        "Failed to load mentors"
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (token) {
      fetchMentors();
    }
  }, [token]);


// ======================================================
// MENTOR — ASSIGNED STUDENTS
// ======================================================



  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  const handleAddMentor = () => {
    setEditingMentor(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      employee_id: "",
      department: "",
      designation: "Mentor",
      username: "",
      password: "",
      status: "Active",
    });

    setShowForm(true);
  };


  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const handleEditMentor = (mentor) => {
    setEditingMentor(mentor);

    setFormData({
      name: mentor.name || "",
      email: mentor.email || "",
      phone: mentor.phone || "",
      employee_id:
        mentor.employee_id || "",
      department:
        mentor.department || "",
      designation:
        mentor.designation || "Mentor",
      username:
        mentor.username || "",
      password: "",
      status:
        mentor.status || "Active",
    });

    setShowForm(true);
  };


  // ==========================================
  // CANCEL FORM
  // ==========================================

  const handleCancel = () => {
    setShowForm(false);
    setEditingMentor(null);
  };


  // ==========================================
  // SAVE / UPDATE MENTOR
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingMentor
        ? `${API}/api/mentors/${editingMentor.id}`
        : `${API}/api/mentors`;

      const method = editingMentor
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,
          headers: {
            ...authHeaders,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Operation failed"
        );

        return;
      }

      alert(
        editingMentor
          ? "Mentor updated successfully!"
          : "Mentor registered successfully!"
      );

      setShowForm(false);
      setEditingMentor(null);

      await fetchMentors();

    } catch (error) {
      console.error(
        "Save mentor error:",
        error
      );

      alert(
        "Server connection failed"
      );
    }
  };


  // ==========================================
  // DELETE MENTOR
  // ==========================================

  const handleDeleteMentor = async (
    mentor
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${mentor.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/api/mentors/${mentor.id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Failed to delete mentor"
        );

        return;
      }

      alert(
        "Mentor deleted successfully!"
      );

      await fetchMentors();

    } catch (error) {
      console.error(
        "Delete mentor error:",
        error
      );

      alert(
        "Server connection failed"
      );
    }
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="loading-module">
        Loading mentors...
      </div>
    );
  }


  // ==========================================
  // VIEW MENTOR
  // ==========================================

  if (selectedMentor) {
    return (
      <MentorProfile
        mentor={selectedMentor}
        onBack={() =>
          setSelectedMentor(null)
        }
        onEdit={() => {
          handleEditMentor(
            selectedMentor
          );

          setSelectedMentor(null);
        }}
      />
    );
  }


  return (
    <div className="module-content">

      {/* HEADER */}

      <div className="module-toolbar">

        <div>
          <h2>
            Manage Mentors
          </h2>

          <p>
            {mentors.length} registered mentors
          </p>
        </div>

        <button
          className="add-button"
          onClick={handleAddMentor}
        >
          + Register New Mentor
        </button>

      </div>


      {/* FORM */}

      {showForm && (
        <form
          className="student-form"
          onSubmit={handleSubmit}
        >

          <h2>
            {editingMentor
              ? "Update Mentor"
              : "Register New Mentor"}
          </h2>


          <div className="form-grid">

            <div className="form-group">
              <label>
                Full Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>


            <div className="form-group">
              <label>
                Email *
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>


            <div className="form-group">
              <label>
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>
                Employee ID *
              </label>

              <input
                type="text"
                name="employee_id"
                value={
                  formData.employee_id
                }
                onChange={handleChange}
                required
              />
            </div>


            <div className="form-group">
              <label>
                Department
              </label>

              <input
                type="text"
                name="department"
                value={
                  formData.department
                }
                onChange={handleChange}
                placeholder="CSE"
              />
            </div>


            <div className="form-group">
              <label>
                Designation
              </label>

              <input
                type="text"
                name="designation"
                value={
                  formData.designation
                }
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>
                Username *
              </label>

              <input
                type="text"
                name="username"
                value={
                  formData.username
                }
                onChange={handleChange}
                required
              />
            </div>


            <div className="form-group">
              <label>
                Password
                {editingMentor
                  ? " (leave blank to keep current)"
                  : " *"}
              </label>

              <input
                type="password"
                name="password"
                value={
                  formData.password
                }
                onChange={handleChange}
                required={!editingMentor}
              />
            </div>


            {editingMentor && (
              <div className="form-group">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={handleChange}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>

              </div>
            )}

          </div>


          <div className="form-actions">

            <button
              type="submit"
              className="save-button"
            >
              {editingMentor
                ? "Update Mentor"
                : "Register Mentor"}
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>

          </div>

        </form>
      )}


      {/* MENTOR TABLE */}

      <div className="table-container">

        <table>

          <thead>

            <tr>
              <th>ID</th>
              <th>Mentor</th>
              <th>Employee ID</th>
              <th>Email</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>

          </thead>


          <tbody>

            {mentors.length === 0 ? (

              <tr>

                <td
                  colSpan="7"
                  className="empty-table"
                >
                  No mentors registered
                </td>

              </tr>

            ) : (

              mentors.map((mentor) => (

                <tr key={mentor.id}>

                  <td>
                    {mentor.id}
                  </td>

                  <td>
                    <strong>
                      {mentor.name}
                    </strong>
                  </td>

                  <td>
                    {mentor.employee_id}
                  </td>

                  <td>
                    {mentor.email}
                  </td>

                  <td>
                    {mentor.department ||
                      "—"}
                  </td>

                  <td>

                    <span
                      className={
                        mentor.status ===
                        "Active"
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {mentor.status}
                    </span>

                  </td>

                  <td>

                    <div className="action-buttons">

                      <button
                        className="view-button"
                        onClick={() =>
                          setSelectedMentor(
                            mentor
                          )
                        }
                      >
                        View
                      </button>

                      <button
                        className="edit-button"
                        onClick={() =>
                          handleEditMentor(
                            mentor
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDeleteMentor(
                            mentor
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

// ======================================================
// MENTOR PROFILE
// ======================================================

function MentorProfile({
  mentor,
  onBack,
  onEdit,
}) {
  return (
    <div className="profile">

      <button
        className="back-button"
        onClick={onBack}
      >
        ← Back to Mentors
      </button>


      <div className="profile-header">

        <div className="avatar">
          {mentor.name
            ?.charAt(0)
            ?.toUpperCase()}
        </div>

        <div>

          <h2>
            {mentor.name}
          </h2>

          <p>
            Employee ID:{" "}
            {mentor.employee_id}
          </p>

        </div>

      </div>


      <section className="profile-section">

        <h3>
          Mentor Information
        </h3>

        <div className="details-grid">

          <Detail
            label="Full Name"
            value={mentor.name}
          />

          <Detail
            label="Email"
            value={mentor.email}
          />

          <Detail
            label="Phone"
            value={mentor.phone}
          />

          <Detail
            label="Employee ID"
            value={
              mentor.employee_id
            }
          />

          <Detail
            label="Department"
            value={
              mentor.department
            }
          />

          <Detail
            label="Designation"
            value={
              mentor.designation
            }
          />

          <Detail
            label="Username"
            value={
              mentor.username
            }
          />

          <Detail
            label="Status"
            value={
              mentor.status
            }
          />

        </div>

      </section>


      <div className="form-actions">

        <button
          className="edit-button profile-edit-button"
          onClick={onEdit}
        >
          Edit Mentor
        </button>

      </div>

    </div>
  );
}

export default App;
