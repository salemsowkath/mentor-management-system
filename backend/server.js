const express = require("express");
const cors = require("cors");
const db = require("./db");

const {
  signToken,
  verifyPassword,
  hashPassword,
  requireAuth,
  allowRoles,
} = require("./auth");

require("dotenv").config();

const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());


// ======================================================
// BASIC
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Mentor Management Backend is running",
  });
});


// ======================================================
// TEST DATABASE
// ======================================================

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT 1 AS result"
    );

    res.json({
      success: true,
      message: "MySQL connected successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      message: "MySQL connection failed",
    });
  }
});


// ======================================================
// AUTHENTICATION
// ======================================================

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      username,
      password,
    } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Username and password are required",
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        user_id,
        username,
        email,
        password_hash,
        full_name,
        role,
        is_active
      FROM users
      WHERE username = ?
         OR email = ?
      LIMIT 1
      `,
      [username, username]
    );

    const user = rows[0];

    if (
      !user ||
      !user.is_active ||
      !verifyPassword(
        password,
        user.password_hash
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid username or password",
      });
    }

    const payload = {
      userId: user.user_id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,

      exp:
        Math.floor(Date.now() / 1000) +
        60 * 60 * 8,
    };

    const token = signToken(payload);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: payload,
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});


// CURRENT USER
app.get(
  "/api/auth/me",
  requireAuth,
  (req, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  }
);


// ======================================================
// STUDENTS
// HOD + MENTOR READ
// HOD WRITE
// ======================================================

// GET ALL STUDENTS
app.get(
  "/api/students",
  requireAuth,
  allowRoles("HOD", "MENTOR"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `
        SELECT *
        FROM students
        ORDER BY student_id DESC
        `
      );

      res.json({
        success: true,
        students: rows,
      });
    } catch (error) {
      console.error(
        "Fetch students error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch students",
      });
    }
  }
);


// GET SINGLE STUDENT
app.get(
  "/api/students/:id",
  requireAuth,
  allowRoles("HOD", "MENTOR"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `
        SELECT *
        FROM students
        WHERE student_id = ?
        `,
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      res.json({
        success: true,
        student: rows[0],
      });
    } catch (error) {
      console.error(
        "Fetch student error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch student",
      });
    }
  }
);


// ADD STUDENT
app.post(
  "/api/students",
  requireAuth,
  allowRoles("HOD"),
  async (req, res) => {
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
        ug_active_backlog,
      } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message:
            "Student name is required",
        });
      }

      const sql = `
        INSERT INTO students
        (
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
        VALUES
        (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?,
          ?, ?,
          ?, ?, ?, ?, ?, ?, ?
        )
      `;

      const values = [
        name,
        email || null,
        gender || null,
        mobile || null,
        alternate_email || null,
        dob || null,
        mother_tongue || null,
        nativity_state || null,

        sslc_percentage || null,
        sslc_gap ? 1 : 0,

        hsc_diploma_percentage || null,
        hsc_diploma_gap ? 1 : 0,

        ug_degree || null,
        ug_department || null,
        ug_institute || null,
        ug_university || null,
        ug_year_of_passing || null,
        ug_percentage || null,
        ug_active_backlog || 0,
      ];

      const [result] =
        await db.query(sql, values);

      res.status(201).json({
        success: true,
        message:
          "Student added successfully",
        student_id:
          result.insertId,
      });
    } catch (error) {
      console.error(
        "Add student error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to add student",
      });
    }
  }
);


// UPDATE STUDENT
app.put(
  "/api/students/:id",
  requireAuth,
  allowRoles("HOD"),
  async (req, res) => {
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
        ug_active_backlog,
      } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message:
            "Student name is required",
        });
      }

      const [result] =
        await db.query(
          `
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
          `,
          [
            name,
            email || null,
            gender || null,
            mobile || null,
            alternate_email || null,
            dob || null,
            mother_tongue || null,
            nativity_state || null,

            sslc_percentage || null,
            sslc_gap ? 1 : 0,

            hsc_diploma_percentage || null,
            hsc_diploma_gap ? 1 : 0,

            ug_degree || null,
            ug_department || null,
            ug_institute || null,
            ug_university || null,
            ug_year_of_passing || null,
            ug_percentage || null,
            ug_active_backlog || 0,

            id,
          ]
        );

      if (!result.affectedRows) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found",
        });
      }

      res.json({
        success: true,
        message:
          "Student updated successfully",
      });
    } catch (error) {
      console.error(
        "Update student error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update student",
      });
    }
  }
);


// DELETE STUDENT
app.delete(
  "/api/students/:id",
  requireAuth,
  allowRoles("HOD"),
  async (req, res) => {
    try {
      const [result] =
        await db.query(
          `
          DELETE FROM students
          WHERE student_id = ?
          `,
          [req.params.id]
        );

      if (!result.affectedRows) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found",
        });
      }

      res.json({
        success: true,
        message:
          "Student deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete student error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete student",
      });
    }
  }
);


// ======================================================
// MENTOR MANAGEMENT
// HOD ONLY
// ======================================================


// GET ALL MENTORS
app.get(
  "/api/mentors",
  requireAuth,
  allowRoles("HOD"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `
        SELECT
          id,
          name,
          email,
          phone,
          employee_id,
          department,
          designation,
          username,
          status,
          created_at
        FROM mentors
        ORDER BY id DESC
        `
      );

      res.json({
        success: true,
        mentors: rows,
      });
    } catch (error) {
      console.error(
        "Get mentors error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch mentors",
      });
    }
  }
);


// GET SINGLE MENTOR
app.get(
  "/api/mentors/:id",
  requireAuth,
  allowRoles("HOD"),
  async (req, res) => {
    try {
      const [rows] =
        await db.query(
          `
          SELECT
            id,
            name,
            email,
            phone,
            employee_id,
            department,
            designation,
            username,
            status,
            created_at
          FROM mentors
          WHERE id = ?
          `,
          [req.params.id]
        );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Mentor not found",
        });
      }

      res.json({
        success: true,
        mentor: rows[0],
      });
    } catch (error) {
      console.error(
        "Get mentor error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch mentor",
      });
    }
  }
);


// ADD MENTOR
app.post(
  "/api/mentors",
  requireAuth,
  allowRoles("HOD"),
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        employee_id,
        department,
        designation,
        username,
        password,
      } = req.body;

      if (
        !name ||
        !email ||
        !employee_id ||
        !username ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, email, employee ID, username and password are required",
        });
      }

      const [existingMentor] =
        await db.query(
          `
          SELECT id
          FROM mentors
          WHERE email = ?
             OR employee_id = ?
             OR username = ?
          `,
          [
            email,
            employee_id,
            username,
          ]
        );

      if (existingMentor.length) {
        return res.status(409).json({
          success: false,
          message:
            "Mentor email, employee ID or username already exists",
        });
      }

      const [existingUser] =
        await db.query(
          `
          SELECT user_id
          FROM users
          WHERE username = ?
             OR email = ?
          `,
          [
            username,
            email,
          ]
        );

      if (existingUser.length) {
        return res.status(409).json({
          success: false,
          message:
            "Login username or email already exists",
        });
      }

      const passwordHash =
        hashPassword(password);

      const [mentorResult] =
        await db.query(
          `
          INSERT INTO mentors
          (
            name,
            email,
            phone,
            employee_id,
            department,
            designation,
            username,
            password,
            status
          )
          VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
          `,
          [
            name,
            email,
            phone || null,
            employee_id,
            department || null,
            designation || "Mentor",
            username,
            passwordHash,
          ]
        );

      await db.query(
        `
        INSERT INTO users
        (
          username,
          email,
          password_hash,
          full_name,
          role,
          is_active
        )
        VALUES
        (?, ?, ?, ?, 'MENTOR', TRUE)
        `,
        [
          username,
          email,
          passwordHash,
          name,
        ]
      );

      res.status(201).json({
        success: true,
        message:
          "Mentor registered and login account created successfully",
        mentorId:
          mentorResult.insertId,
      });
    } catch (error) {
      console.error(
        "Add mentor error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to register mentor",
      });
    }
  }
);


// UPDATE MENTOR
app.put(
  "/api/mentors/:id",
  requireAuth,
  allowRoles("HOD"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        name,
        email,
        phone,
        employee_id,
        department,
        designation,
        username,
        password,
        status,
      } = req.body;

      const [mentorRows] =
        await db.query(
          `
          SELECT
            id,
            username,
            email
          FROM mentors
          WHERE id = ?
          `,
          [id]
        );

      if (!mentorRows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Mentor not found",
        });
      }

      const oldMentor =
        mentorRows[0];

      if (password) {
        const passwordHash =
          hashPassword(password);

        await db.query(
          `
          UPDATE mentors
          SET
            name = ?,
            email = ?,
            phone = ?,
            employee_id = ?,
            department = ?,
            designation = ?,
            username = ?,
            password = ?,
            status = ?
          WHERE id = ?
          `,
          [
            name,
            email,
            phone || null,
            employee_id,
            department || null,
            designation || "Mentor",
            username,
            passwordHash,
            status || "Active",
            id,
          ]
        );

        await db.query(
          `
          UPDATE users
          SET
            username = ?,
            email = ?,
            password_hash = ?,
            full_name = ?,
            is_active = ?
          WHERE username = ?
          `,
          [
            username,
            email,
            passwordHash,
            name,
            status === "Active" ? 1 : 0,
            oldMentor.username,
          ]
        );
      } else {
        await db.query(
          `
          UPDATE mentors
          SET
            name = ?,
            email = ?,
            phone = ?,
            employee_id = ?,
            department = ?,
            designation = ?,
            username = ?,
            status = ?
          WHERE id = ?
          `,
          [
            name,
            email,
            phone || null,
            employee_id,
            department || null,
            designation || "Mentor",
            username,
            status || "Active",
            id,
          ]
        );

        await db.query(
          `
          UPDATE users
          SET
            username = ?,
            email = ?,
            full_name = ?,
            is_active = ?
          WHERE username = ?
          `,
          [
            username,
            email,
            name,
            status === "Active" ? 1 : 0,
            oldMentor.username,
          ]
        );
      }

      res.json({
        success: true,
        message:
          "Mentor updated successfully",
      });
    } catch (error) {
      console.error(
        "Update mentor error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update mentor",
      });
    }
  }
);


// DELETE MENTOR
app.delete(
  "/api/mentors/:id",
  requireAuth,
  allowRoles("HOD"),
  async (req, res) => {
    try {
      const [mentorRows] =
        await db.query(
          `
          SELECT username
          FROM mentors
          WHERE id = ?
          `,
          [req.params.id]
        );

      if (!mentorRows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Mentor not found",
        });
      }

      const username =
        mentorRows[0].username;

      await db.query(
        `
        DELETE FROM mentor_students
        WHERE mentor_id = ?
        `,
        [req.params.id]
      );

      await db.query(
        `
        DELETE FROM mentors
        WHERE id = ?
        `,
        [req.params.id]
      );

      await db.query(
        `
        DELETE FROM users
        WHERE username = ?
        AND role = 'MENTOR'
        `,
        [username]
      );

      res.json({
        success: true,
        message:
          "Mentor deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete mentor error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete mentor",
      });
    }
  }
);


// ======================================================
// HOD — MENTOR ASSIGNMENT
// ======================================================


// GET ACTIVE MENTORS FOR ASSIGNMENT
app.get(
  "/api/mentor-assignments/mentors",
  requireAuth,
  allowRoles("HOD"),
  async (req, res) => {
    try {
      const [rows] =
        await db.query(
          `
          SELECT
            id,
            name,
            employee_id,
            username,
            department,
            designation
          FROM mentors
          WHERE status = 'Active'
          ORDER BY name
          `
        );

      res.json({
        success: true,
        mentors: rows,
      });
    } catch (error) {
      console.error(
        "Fetch assignment mentors error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch mentors",
      });
    }
  }
);


// GET ALL STUDENTS + ASSIGNMENT
app.get(
  "/api/mentor-assignments/students",
  requireAuth,
  allowRoles("HOD"),
  async (req, res) => {
    try {
      const [rows] =
        await db.query(
          `
          SELECT
            s.student_id,
            s.name,
            s.email,
            s.mobile,

            ms.assignment_id,
            ms.mentor_id,

            m.name AS mentor_name

          FROM students s

          LEFT JOIN mentor_students ms
            ON s.student_id = ms.student_id

          LEFT JOIN mentors m
            ON ms.mentor_id = m.id

          ORDER BY s.student_id
          `
        );

      res.json({
        success: true,
        students: rows,
      });
    } catch (error) {
      console.error(
        "Fetch assignment students error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch students",
      });
    }
  }
);


// ASSIGN STUDENTS
app.post(
  "/api/mentor-assignments",
  requireAuth,
  allowRoles("HOD"),
  async (req, res) => {
    try {
      const {
        mentor_id,
        student_ids,
      } = req.body;

      if (!mentor_id) {
        return res.status(400).json({
          success: false,
          message:
            "Mentor is required",
        });
      }

      if (
        !Array.isArray(student_ids) ||
        student_ids.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one student is required",
        });
      }

      const [mentorRows] =
        await db.query(
          `
          SELECT id
          FROM mentors
          WHERE id = ?
          AND status = 'Active'
          `,
          [mentor_id]
        );

      if (!mentorRows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Active mentor not found",
        });
      }

      const placeholders =
        student_ids
          .map(() => "?")
          .join(",");

      const [existingAssignments] =
        await db.query(
          `
          SELECT
            ms.student_id,
            s.name,
            m.name AS mentor_name

          FROM mentor_students ms

          JOIN students s
            ON ms.student_id =
               s.student_id

          JOIN mentors m
            ON ms.mentor_id = m.id

          WHERE ms.student_id
          IN (${placeholders})
          `,
          student_ids
        );

      if (existingAssignments.length) {
        const names =
          existingAssignments
            .map(
              (student) =>
                `${student.name} → ${student.mentor_name}`
            )
            .join(", ");

        return res.status(409).json({
          success: false,
          message:
            `Some students are already assigned: ${names}`,
        });
      }

      const values =
        student_ids.map(
          (student_id) => [
            mentor_id,
            student_id,
          ]
        );

      await db.query(
        `
        INSERT INTO mentor_students
        (
          mentor_id,
          student_id
        )
        VALUES ?
        `,
        [values]
      );

      res.status(201).json({
        success: true,
        message:
          `${student_ids.length} student(s) assigned successfully`,
      });
    } catch (error) {
      console.error(
        "Assign students error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to assign students",
      });
    }
  }
);


// REMOVE ASSIGNMENT
app.delete(
  "/api/mentor-assignments/:assignmentId",
  requireAuth,
  allowRoles("HOD"),
  async (req, res) => {
    try {
      const [result] =
        await db.query(
          `
          DELETE FROM mentor_students
          WHERE assignment_id = ?
          `,
          [req.params.assignmentId]
        );

      if (!result.affectedRows) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found",
        });
      }

      res.json({
        success: true,
        message:
          "Student removed from mentor successfully",
      });
    } catch (error) {
      console.error(
        "Remove assignment error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to remove student assignment",
      });
    }
  }
);


// ======================================================
// MENTOR — MY STUDENTS
// THIS FIXES YOUR EMPTY PAGE
// ======================================================

app.get(
  "/api/mentor/my-students",
  requireAuth,
  allowRoles("MENTOR"),
  async (req, res) => {
    try {

      // req.user.username comes from JWT
      const username =
        req.user.username;

      if (!username) {
        return res.status(401).json({
          success: false,
          message:
            "Mentor username missing from token",
        });
      }


      // Find mentor record
      const [mentorRows] =
        await db.query(
          `
          SELECT
            id,
            name,
            username,
            employee_id,
            department,
            designation
          FROM mentors
          WHERE username = ?
          AND status = 'Active'
          LIMIT 1
          `,
          [username]
        );

      if (!mentorRows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Mentor profile not found",
        });
      }

      const mentor =
        mentorRows[0];


      // Get assigned students
      const [students] =
        await db.query(
          `
          SELECT
            s.*,

            ms.assignment_id,
            ms.mentor_id,

            m.name AS mentor_name

          FROM mentor_students ms

          INNER JOIN students s
            ON ms.student_id =
               s.student_id

          INNER JOIN mentors m
            ON ms.mentor_id = m.id

          WHERE ms.mentor_id = ?

          ORDER BY s.student_id
          `,
          [mentor.id]
        );


      res.json({
        success: true,

        mentor: {
          id: mentor.id,
          name: mentor.name,
          username: mentor.username,
          employee_id:
            mentor.employee_id,
          department:
            mentor.department,
          designation:
            mentor.designation,
        },

        students,
      });

    } catch (error) {
      console.error(
        "Fetch mentor students error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch assigned students",
      });
    }
  }
);


// ======================================================
// MENTOR — STUDENT COUNT
// ======================================================

app.get(
  "/api/mentor/my-students/count",
  requireAuth,
  allowRoles("MENTOR"),
  async (req, res) => {
    try {
      const username =
        req.user.username;

      const [rows] =
        await db.query(
          `
          SELECT
            COUNT(*) AS total
          FROM mentor_students ms

          INNER JOIN mentors m
            ON ms.mentor_id = m.id

          WHERE m.username = ?
          AND m.status = 'Active'
          `,
          [username]
        );

      res.json({
        success: true,
        count:
          Number(rows[0].total) || 0,
      });
    } catch (error) {
      console.error(
        "Mentor count error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch student count",
      });
    }
  }
);


// ======================================================
// SERVER START
// ======================================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});
