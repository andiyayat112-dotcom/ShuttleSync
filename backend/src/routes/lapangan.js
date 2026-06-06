const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get all lapangan
router.get('/', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [lapangan] = await conn.query('SELECT * FROM lapangan ORDER BY id ASC');
    conn.release();

    res.json({
      success: true,
      data: lapangan
    });
  } catch (error) {
    console.error('Get lapangan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error: ' + error.message
    });
  }
});

// Get lapangan by ID
router.get('/:id', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [lapangan] = await conn.query('SELECT * FROM lapangan WHERE id = ?', [req.params.id]);
    conn.release();

    if (lapangan.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lapangan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: lapangan[0]
    });
  } catch (error) {
    console.error('Get lapangan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error: ' + error.message
    });
  }
});

// Create lapangan
router.post('/', authenticate, authorize('admin', 'owner'), async (req, res) => {
  try {
    const { nama_lapangan, harga_per_jam, tipe } = req.body;

    if (!nama_lapangan || !harga_per_jam || !tipe) {
      return res.status(400).json({
        success: false,
        message: 'Nama lapangan, harga per jam, dan tipe harus diisi'
      });
    }

    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO lapangan (nama_lapangan, harga_per_jam, tipe, status, created_at) VALUES (?, ?, ?, ?, NOW())',
      [nama_lapangan, harga_per_jam, tipe, 'kosong']
    );
    conn.release();

    res.status(201).json({
      success: true,
      message: 'Lapangan berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Create lapangan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error: ' + error.message
    });
  }
});

// Update lapangan
router.put('/:id', authenticate, authorize('admin', 'owner'), async (req, res) => {
  try {
    const { nama_lapangan, harga_per_jam, tipe, status } = req.body;

    const conn = await pool.getConnection();
    
    const [lapangan] = await conn.query('SELECT id FROM lapangan WHERE id = ?', [req.params.id]);
    if (lapangan.length === 0) {
      conn.release();
      return res.status(404).json({
        success: false,
        message: 'Lapangan tidak ditemukan'
      });
    }

    await conn.query(
      'UPDATE lapangan SET nama_lapangan = ?, harga_per_jam = ?, tipe = ?, status = ? WHERE id = ?',
      [nama_lapangan, harga_per_jam, tipe, status, req.params.id]
    );
    conn.release();

    res.json({
      success: true,
      message: 'Lapangan berhasil diupdate'
    });
  } catch (error) {
    console.error('Update lapangan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error: ' + error.message
    });
  }
});

// Delete lapangan
router.delete('/:id', authenticate, authorize('admin', 'owner'), async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [lapangan] = await conn.query('SELECT id FROM lapangan WHERE id = ?', [req.params.id]);
    if (lapangan.length === 0) {
      conn.release();
      return res.status(404).json({
        success: false,
        message: 'Lapangan tidak ditemukan'
      });
    }

    await conn.query('DELETE FROM lapangan WHERE id = ?', [req.params.id]);
    conn.release();

    res.json({
      success: true,
      message: 'Lapangan berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete lapangan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error: ' + error.message
    });
  }
});

module.exports = router;
