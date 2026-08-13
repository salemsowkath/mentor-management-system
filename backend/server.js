const express = require('express');
const cors = require('cors');
const db = require('./db');

const {
  signToken,
  verifyPassword,
  hashPassword,
  requireAuth,
  allowRoles
} = require('./auth');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Mentor Management Backend is running' }));

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS result');
    res.json({ success: true, message: 'MySQL connected successfully', data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'MySQL connection failed' });
  }
});

// =========================
// AUTHENTICATION
// =========================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password are required' });

    const [rows] = await db.query(
      'SELECT user_id, username, email, password_hash, full_name, role, is_active FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, username]
    );
    const user = rows[0];

    if (!user || !user.is_active || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const payload = {
      userId: user.user_id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    };

    res.json({ success: true, message: 'Login successful', token: signToken(payload), user: payload });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// =========================
// STUDENTS - HOD ONLY
// Existing working CRUD is preserved.
// =========================
app.get('/api/students', requireAuth, allowRoles('HOD', 'MENTOR'), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM students ORDER BY student_id DESC');
    res.json({ success: true, students: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

app.post('/api/students', requireAuth, allowRoles('HOD'), async (req, res) => {
  try {
    const {
      name, email, gender, mobile, alternate_email, dob, mother_tongue, nativity_state,
      sslc_percentage, sslc_gap, hsc_diploma_percentage, hsc_diploma_gap,
      ug_degree, ug_department, ug_institute, ug_university, ug_year_of_passing,
      ug_percentage, ug_active_backlog
    } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Student name is required' });

    const sql = `INSERT INTO students (
      name,email,gender,mobile,alternate_email,dob,mother_tongue,nativity_state,
      sslc_percentage,sslc_gap,hsc_diploma_percentage,hsc_diploma_gap,
      ug_degree,ug_department,ug_institute,ug_university,ug_year_of_passing,ug_percentage,ug_active_backlog
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const values = [name,email,gender,mobile,alternate_email,dob,mother_tongue,nativity_state,sslc_percentage,sslc_gap,hsc_diploma_percentage,hsc_diploma_gap,ug_degree,ug_department,ug_institute,ug_university,ug_year_of_passing,ug_percentage,ug_active_backlog];
    const [result] = await db.query(sql, values);
    res.status(201).json({ success: true, message: 'Student added successfully', student_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to add student' });
  }
});

app.put('/api/students/:id', requireAuth, allowRoles('HOD'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, email, gender, mobile, alternate_email, dob, mother_tongue, nativity_state,
      sslc_percentage, sslc_gap, hsc_diploma_percentage, hsc_diploma_gap,
      ug_degree, ug_department, ug_institute, ug_university, ug_year_of_passing,
      ug_percentage, ug_active_backlog
    } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Student name is required' });

    const updateSql = `UPDATE students SET
      name=?, email=?, gender=?, mobile=?, alternate_email=?, dob=?, mother_tongue=?, nativity_state=?,
      sslc_percentage=?, sslc_gap=?, hsc_diploma_percentage=?, hsc_diploma_gap=?,
      ug_degree=?, ug_department=?, ug_institute=?, ug_university=?, ug_year_of_passing=?, ug_percentage=?, ug_active_backlog=?
      WHERE student_id=?`;
    const values = [name,email,gender,mobile,alternate_email,dob,mother_tongue,nativity_state,sslc_percentage,sslc_gap,hsc_diploma_percentage,hsc_diploma_gap,ug_degree,ug_department,ug_institute,ug_university,ug_year_of_passing,ug_percentage,ug_active_backlog,id];
    const [result] = await db.query(updateSql, values);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update student' });
  }
});

app.delete('/api/students/:id', requireAuth, allowRoles('HOD'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM students WHERE student_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete student' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


// =========================
// MENTORS - HOD ONLY
// =========================

// GET ALL MENTORS
app.get('/api/mentors', requireAuth, allowRoles('HOD'), async (req, res) => {
  try {
    const [rows] = await db.query(`
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
    `);

    res.json({
      success: true,
      mentors: rows
    });
  } catch (error) {
    console.error('Get mentors error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentors'
    });
  }
});


// GET SINGLE MENTOR
app.get('/api/mentors/:id', requireAuth, allowRoles('HOD'), async (req, res) => {
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
      WHERE id = ?
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    res.json({
      success: true,
      mentor: rows[0]
    });
  } catch (error) {
    console.error('Get mentor error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor'
    });
  }
});


// ADD NEW MENTOR
// ==========================================
// ADD NEW MENTOR
// ==========================================

app.post('/api/mentors', requireAuth, allowRoles('HOD'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      employee_id,
      department,
      designation,
      username,
      password
    } = req.body;

    if (!name || !email || !employee_id || !username || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Name, email, employee ID, username and password are required'
      });
    }

    // Check duplicate mentor information
    const [existingMentor] = await db.query(
      `
      SELECT id
      FROM mentors
      WHERE email = ?
         OR employee_id = ?
         OR username = ?
      `,
      [email, employee_id, username]
    );

    if (existingMentor.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          'Mentor email, employee ID or username already exists'
      });
    }

    // Check duplicate login username/email
    const [existingUser] = await db.query(
      `
      SELECT user_id
      FROM users
      WHERE username = ?
         OR email = ?
      `,
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          'Login username or email already exists'
      });
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create mentor record
    const [mentorResult] = await db.query(
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
      `,
      [
        name,
        email,
        phone || null,
        employee_id,
        department || null,
        designation || 'Mentor',
        username,
        passwordHash
      ]
    );

    // Create login user
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
      VALUES (?, ?, ?, ?, 'MENTOR', TRUE)
      `,
      [
        username,
        email,
        passwordHash,
        name
      ]
    );

    res.status(201).json({
      success: true,
      message:
        'Mentor registered and login account created successfully',
      mentorId: mentorResult.insertId
    });

  } catch (error) {
    console.error(
      'Add mentor error:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to register mentor'
    });
  }
});

// UPDATE MENTOR
app.put('/api/mentors/:id', requireAuth, allowRoles('HOD'), async (req, res) => {
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
      status
    } = req.body;

    const [mentor] = await db.query(
      'SELECT id FROM mentors WHERE id = ?',
      [id]
    );

    if (mentor.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    if (password) {
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
          designation || 'Mentor',
          username,
          password,
          status || 'Active',
          id
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
          designation || 'Mentor',
          username,
          status || 'Active',
          id
        ]
      );
    }

    res.json({
      success: true,
      message: 'Mentor updated successfully'
    });

  } catch (error) {
    console.error('Update mentor error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update mentor'
    });
  }
});


// DELETE MENTOR
app.delete('/api/mentors/:id', requireAuth, allowRoles('HOD'), async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM mentors WHERE id = ?',
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    res.json({
      success: true,
      message: 'Mentor deleted successfully'
    });

  } catch (error) {
    console.error('Delete mentor error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete mentor'
    });
  }
});