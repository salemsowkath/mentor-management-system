import { useEffect, useState } from "react";
import "./App.css";

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
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add/Edit form
  const [showAddForm, setShowAddForm] = useState(false);

  // IMPORTANT: stores the student currently being edited
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  // =========================
  // GET STUDENTS
  // =========================
  const fetchStudents = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/students"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();

      setStudents(data.students || []);
    } catch (error) {
      console.error("Fetch students error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // =========================
  // FORM INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // ADD / UPDATE STUDENT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingStudent
        ? `http://localhost:5000/api/students/${editingStudent.student_id}`
        : "http://localhost:5000/api/students";

      const method = editingStudent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Operation failed");
        return;
      }

      alert(
        editingStudent
          ? "Student updated successfully!"
          : "Student added successfully!"
      );

      // Close form
      setShowAddForm(false);

      // Exit edit mode
      setEditingStudent(null);

      // Clear form
      setFormData({ ...emptyForm });

      // Reload students
      await fetchStudents();
    } catch (error) {
      console.error("Student save error:", error);
      alert("Server connection failed");
    }
  };

  // =========================
  // OPEN ADD FORM
  // =========================
  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({ ...emptyForm });
    setShowAddForm(true);
  };

  // =========================
  // OPEN EDIT FORM
  // =========================
  const handleEditStudent = (student) => {
    setEditingStudent(student);

    setFormData({
      name: student.name || "",
      email: student.email || "",
      gender: student.gender || "",
      mobile: student.mobile || "",
      alternate_email: student.alternate_email || "",

      dob: student.dob
        ? String(student.dob).substring(0, 10)
        : "",

      mother_tongue: student.mother_tongue || "",
      nativity_state: student.nativity_state || "",

      sslc_percentage:
        student.sslc_percentage ?? "",

      sslc_gap: Boolean(student.sslc_gap),

      hsc_diploma_percentage:
        student.hsc_diploma_percentage ?? "",

      hsc_diploma_gap:
        Boolean(student.hsc_diploma_gap),

      ug_degree: student.ug_degree || "",
      ug_department: student.ug_department || "",
      ug_institute: student.ug_institute || "",
      ug_university: student.ug_university || "",

      ug_year_of_passing:
        student.ug_year_of_passing ?? "",

      ug_percentage:
        student.ug_percentage ?? "",

      ug_active_backlog:
        student.ug_active_backlog ?? 0,
    });

    setShowAddForm(true);
  };

  // =========================
  // CANCEL FORM
  // =========================
  const handleCancel = () => {
    setShowAddForm(false);
    setEditingStudent(null);
    setFormData({ ...emptyForm });
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="message">
        Loading students...
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================
  return (
    <div className="app">

      <header className="header">
        <h1>Mentor Management System</h1>
        <p>Student Management</p>
      </header>

      <main className="container">

        {!selectedStudent ? (
          <>
            {/* =========================
                TITLE
            ========================= */}
            <div className="title-section">

              <div>
                <h2>Students</h2>
                <span>
                  {students.length} Students
                </span>
              </div>

              <button
                className="add-button"
                onClick={handleAddStudent}
              >
                + Add Student
              </button>

            </div>

            {/* =========================
                ADD / EDIT FORM
            ========================= */}
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

                  {/* NAME */}
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

                  {/* EMAIL */}
                  <div className="form-group">
                    <label>Email</label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  {/* GENDER */}
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

                  {/* MOBILE */}
                  <div className="form-group">
                    <label>Mobile</label>

                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                  </div>

                  {/* ALTERNATE EMAIL */}
                  <div className="form-group">
                    <label>Alternate Email</label>

                    <input
                      type="email"
                      name="alternate_email"
                      value={formData.alternate_email}
                      onChange={handleChange}
                    />
                  </div>

                  {/* DOB */}
                  <div className="form-group">
                    <label>Date of Birth</label>

                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                    />
                  </div>

                  {/* MOTHER TONGUE */}
                  <div className="form-group">
                    <label>Mother Tongue</label>

                    <input
                      type="text"
                      name="mother_tongue"
                      value={formData.mother_tongue}
                      onChange={handleChange}
                    />
                  </div>

                  {/* NATIVITY */}
                  <div className="form-group">
                    <label>Nativity State</label>

                    <input
                      type="text"
                      name="nativity_state"
                      value={formData.nativity_state}
                      onChange={handleChange}
                    />
                  </div>

                  {/* SSLC */}
                  <div className="form-group">
                    <label>SSLC Percentage</label>

                    <input
                      type="number"
                      step="0.01"
                      name="sslc_percentage"
                      value={formData.sslc_percentage}
                      onChange={handleChange}
                    />
                  </div>

                  {/* SSLC GAP */}
                  <div className="form-group checkbox-group">

                    <label>
                      <input
                        type="checkbox"
                        name="sslc_gap"
                        checked={formData.sslc_gap}
                        onChange={handleChange}
                      />

                      Gap after SSLC
                    </label>

                  </div>

                  {/* HSC */}
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

                  {/* HSC GAP */}
                  <div className="form-group checkbox-group">

                    <label>
                      <input
                        type="checkbox"
                        name="hsc_diploma_gap"
                        checked={formData.hsc_diploma_gap}
                        onChange={handleChange}
                      />

                      Gap after HSC / Diploma
                    </label>

                  </div>

                  {/* UG DEGREE */}
                  <div className="form-group">
                    <label>UG Degree</label>

                    <input
                      type="text"
                      name="ug_degree"
                      value={formData.ug_degree}
                      onChange={handleChange}
                    />
                  </div>

                  {/* UG DEPARTMENT */}
                  <div className="form-group">
                    <label>UG Department</label>

                    <input
                      type="text"
                      name="ug_department"
                      value={formData.ug_department}
                      onChange={handleChange}
                    />
                  </div>

                  {/* UG INSTITUTE */}
                  <div className="form-group">
                    <label>UG Institute</label>

                    <input
                      type="text"
                      name="ug_institute"
                      value={formData.ug_institute}
                      onChange={handleChange}
                    />
                  </div>

                  {/* UG UNIVERSITY */}
                  <div className="form-group">
                    <label>UG University</label>

                    <input
                      type="text"
                      name="ug_university"
                      value={formData.ug_university}
                      onChange={handleChange}
                    />
                  </div>

                  {/* UG YEAR */}
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

                  {/* UG PERCENTAGE */}
                  <div className="form-group">
                    <label>UG Percentage</label>

                    <input
                      type="number"
                      step="0.01"
                      name="ug_percentage"
                      value={formData.ug_percentage}
                      onChange={handleChange}
                    />
                  </div>

                  {/* ACTIVE BACKLOG */}
                  <div className="form-group">
                    <label>Active Backlog</label>

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

                {/* FORM BUTTONS */}
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

            {/* =========================
                STUDENT TABLE
            ========================= */}
            <div className="table-container">

              <table>

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Mobile</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {students.map((student) => (

                    <tr key={student.student_id}>

                      <td>
                        {student.student_id}
                      </td>

                      <td>
                        {student.name}
                      </td>

                      <td>
                        {student.email}
                      </td>

                      <td>
                        {student.gender}
                      </td>

                      <td>
                        {student.mobile}
                      </td>

                      <td>

                        <div className="action-buttons">

                          {/* VIEW */}
                          <button
                            className="view-button"
                            onClick={() =>
                              setSelectedStudent(student)
                            }
                          >
                            View Profile
                          </button>

                          {/* EDIT */}
                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEditStudent(student)
                            }
                          >
                            Edit
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          </>
        ) : (

          <StudentProfile
            student={selectedStudent}
            onBack={() =>
              setSelectedStudent(null)
            }
          />

        )}

      </main>

    </div>
  );
}

// ======================================================
// STUDENT PROFILE
// ======================================================

function StudentProfile({
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
          {student.name.charAt(0)}
        </div>

        <div>

          <h2>
            {student.name}
          </h2>

          <p>
            Student ID: {student.student_id}
          </p>

        </div>

      </div>

      {/* PERSONAL */}
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
            value={student.alternate_email}
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
            value={student.mother_tongue}
          />

          <Detail
            label="Nativity"
            value={student.nativity_state}
          />

        </div>

      </section>

      {/* ACADEMIC */}
      <section className="profile-section">

        <h3>
          Academic Information
        </h3>

        <div className="details-grid">

          <Detail
            label="SSLC Percentage"
            value={
              student.sslc_percentage !== null
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
              student.hsc_diploma_percentage !== null
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
            value={student.ug_degree}
          />

          <Detail
            label="UG Department"
            value={student.ug_department}
          />

          <Detail
            label="UG Institute"
            value={student.ug_institute}
          />

          <Detail
            label="UG University"
            value={student.ug_university}
          />

          <Detail
            label="UG Year of Passing"
            value={student.ug_year_of_passing}
          />

          <Detail
            label="UG Percentage"
            value={
              student.ug_percentage !== null
                ? `${student.ug_percentage}%`
                : null
            }
          />

          <Detail
            label="Active Backlog"
            value={student.ug_active_backlog}
          />

        </div>

      </section>

    </div>
  );
}

// ======================================================
// DETAIL COMPONENT
// ======================================================

function Detail({
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

export default App;