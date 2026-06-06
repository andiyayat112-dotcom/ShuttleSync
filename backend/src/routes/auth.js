const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { generateToken } = require('../config/jwt');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// Register
router.post('/register', async (req, res) => {
  try {
    const { nama, email, password, no_telepon, role } = req.body;

    // Validasi input
    if (!nama || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password harus diisi'
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email tidak valid'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      });
    }

    const conn = await pool.getConnection();

    // Cek email sudah terdaftar
    const [existingUser] = await conn.query('SELECT id FROM user WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      conn.release();
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // Insert user
    await conn.query(
      'INSERT INTO user (nama, email, password, no_telepon, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [nama, email, hashedPassword, no_telepon || null, role || 'kasir']
    );

    conn.release();

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registrasi: ' + error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi'
      });
    }

    const conn = await pool.getConnection();

    const [users] = await conn.query('SELECT * FROM user WHERE email = ?', [email]);

    if (users.length === 0) {
      conn.release();
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      conn.release();
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      nama: user.nama,
      role: user.role
    });

    conn.release();

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error login: ' + error.message
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;

    const conn = await pool.getConnection();

    const [users] = await conn.query('SELECT id, nama, email, no_telepon, role, created_at FROM user WHERE id = ?', [userId]);

    if (users.length === 0) {
      conn.release();
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    conn.release();

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error: ' + error.message
    });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama, no_telepon } = req.body;

    const conn = await pool.getConnection();

    await conn.query('UPDATE user SET nama = ?, no_telepon = ? WHERE id = ?', [nama, no_telepon, userId]);

    conn.release();

    res.json({
      success: true,
      message: 'Profile berhasil diupdate'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error: ' + error.message
    });
  }
});

module.exports = router;
