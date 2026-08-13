const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Mentor Management Backend is running"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS result");

        res.json({
            success: true,
            message: "MySQL connected successfully",
            data: rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "MySQL connection failed"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/api/students", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM students");

        res.json({
            success: true,
            students: rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch students"
        });
    }
});

app.post("/api/students", async (req, res) => {
  try {
    const {
      name,
      email,
      gender,
      mobile,
      alternate_email,
      dob,
      mother_tongue,
      nativity_state,
      sslc_percentage,
      sslc_gap,
      hsc_diploma_percentage,
      hsc_diploma_gap,
      ug_degree,
      ug_department,
      ug_institute,
      ug_university,
      ug_year_of_passing,
      ug_percentage,
      ug_active_backlog
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Student name is required"
      });
    }

    const sql = `
      INSERT INTO students (
        name,
        email,
        gender,
        mobile,
        alternate_email,
        dob,
        mother_tongue,
        nativity_state,
        sslc_percentage,
        sslc_gap,
        hsc_diploma_percentage,
        hsc_diploma_gap,
        ug_degree,
        ug_department,
        ug_institute,
        ug_university,
        ug_year_of_passing,
        ug_percentage,
        ug_active_backlog
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      email,
      gender,
      mobile,
      alternate_email,
      dob,
      mother_tongue,
      nativity_state,
      sslc_percentage,
      sslc_gap,
      hsc_diploma_percentage,
      hsc_diploma_gap,
      ug_degree,
      ug_department,
      ug_institute,
      ug_university,
      ug_year_of_passing,
      ug_percentage,
      ug_active_backlog
    ];

    const [result] = await db.query(sql, values);

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      student_id: result.insertId
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to add student"
    });
  }
});

app.put("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      gender,
      mobile,
      alternate_email,
      dob,
      mother_tongue,
      nativity_state,
      sslc_percentage,
      sslc_gap,
      hsc_diploma_percentage,
      hsc_diploma_gap,
      ug_degree,
      ug_department,
      ug_institute,
      ug_university,
      ug_year_of_passing,
      ug_percentage,
      ug_active_backlog
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Student name is required"
      });
    }

    const sql = `
      UPDATE students
      SET
        name = ?,
        email = ?,
        gender = ?,
        mobile = ?,
        alternate_email = ?,
        dob = ?,
        mother_tongue = ?,
        nativity_state = ?,
        sslc_percentage = ?,
        sslc_gap = ?,
        hsc_diploma_percentage = ?,
        hsc_diploma_gap = ?,
        ug_degree = ?,
        ug_department = ?,
        ug_institute = ?,
        ug_university = ?,
        ug_year_of_passing = ?,
        ug_percentage = ?,
        ug_active_backlog = ?
      WHERE student_id = ?
    `;

    const values = [
      name,
      email,
      gender,
      mobile,
      alternate_email,
      dob,
      mother_tongue,
      nativity_state,
      sslc_percentage,
      sslc_gap,
      hsc_diploma_percentage,
      hsc_diploma_gap,
      ug_degree,
      ug_department,
      ug_institute,
      ug_university,
      ug_year_of_passing,
      ug_percentage,
      ug_active_backlog,
      id
    ];

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      message: "Student updated successfully"
    });

  } catch (error) {
    console.error("Update student error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update student"
    });
  }
});