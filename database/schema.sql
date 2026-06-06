-- ShuttleSync Database Schema
-- Badminton Court Management System
-- MySQL 8.0+

-- Drop existing database (optional)
-- DROP DATABASE IF EXISTS shuttle_sync;

-- Create Database
CREATE DATABASE IF NOT EXISTS shuttle_sync;
USE shuttle_sync;

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'kasir') NOT NULL DEFAULT 'kasir',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    KEY idx_username (username),
    KEY idx_role (role),
    KEY idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: lapangan
-- ============================================
CREATE TABLE IF NOT EXISTS lapangan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    status ENUM('kosong', 'bermain', 'waktu_habis') DEFAULT 'kosong',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    KEY idx_status (status),
    KEY idx_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: harga_lapangan
-- ============================================
CREATE TABLE IF NOT EXISTS harga_lapangan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lapangan_id INT NOT NULL,
    harga DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lapangan_id) REFERENCES lapangan(id) ON DELETE CASCADE ON UPDATE CASCADE,
    KEY idx_lapangan_id (lapangan_id),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: harga_shuttlecock
-- ============================================
CREATE TABLE IF NOT EXISTS harga_shuttlecock (
    id INT PRIMARY KEY AUTO_INCREMENT,
    harga DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: transaksi
-- ============================================
CREATE TABLE IF NOT EXISTS transaksi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lapangan_id INT NOT NULL,
    nama_pelanggan VARCHAR(100) NOT NULL,
    durasi_jam INT NOT NULL,
    shuttlecock_qty INT DEFAULT 0,
    total_bayar DECIMAL(12, 2) DEFAULT 0,
    status ENUM('pending', 'selesai', 'dibayar') DEFAULT 'pending',
    waktu_mulai DATETIME DEFAULT CURRENT_TIMESTAMP,
    waktu_selesai DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lapangan_id) REFERENCES lapangan(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    KEY idx_lapangan_id (lapangan_id),
    KEY idx_status (status),
    KEY idx_created_at (created_at),
    KEY idx_nama_pelanggan (nama_pelanggan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: detail_transaksi
-- ============================================
CREATE TABLE IF NOT EXISTS detail_transaksi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaksi_id INT NOT NULL,
    harga_lapangan_id INT NOT NULL,
    harga_shuttlecock_id INT NOT NULL,
    jumlah_jam INT NOT NULL,
    jumlah_shuttlecock INT NOT NULL,
    subtotal_lapangan DECIMAL(12, 2) NOT NULL,
    subtotal_shuttlecock DECIMAL(12, 2) NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (harga_lapangan_id) REFERENCES harga_lapangan(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (harga_shuttlecock_id) REFERENCES harga_shuttlecock(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    KEY idx_transaksi_id (transaksi_id),
    KEY idx_harga_lapangan_id (harga_lapangan_id),
    KEY idx_harga_shuttlecock_id (harga_shuttlecock_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: audit_log (Optional - untuk security)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    KEY idx_user_id (user_id),
    KEY idx_created_at (created_at),
    KEY idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VIEWS: Reporting
-- ============================================

-- View: Laporan Harian
CREATE OR REPLACE VIEW v_laporan_harian AS
SELECT
    DATE(t.created_at) as tanggal,
    l.nama as lapangan,
    COUNT(t.id) as jumlah_transaksi,
    SUM(t.durasi_jam) as total_jam_bermain,
    SUM(t.shuttlecock_qty) as total_shuttlecock_digunakan,
    SUM(t.total_bayar) as total_pendapatan,
    AVG(t.total_bayar) as rata_rata_per_transaksi
FROM transaksi t
JOIN lapangan l ON t.lapangan_id = l.id
WHERE t.status IN ('selesai', 'dibayar')
GROUP BY DATE(t.created_at), l.id, l.nama
ORDER BY tanggal DESC, l.nama;

-- View: Status Lapangan Real-time
CREATE OR REPLACE VIEW v_status_lapangan AS
SELECT
    l.id,
    l.nama,
    l.status,
    CASE
        WHEN l.status = 'kosong' THEN 'Tersedia'
        WHEN l.status = 'bermain' THEN 'Sedang Bermain'
        WHEN l.status = 'waktu_habis' THEN 'Waktu Habis'
        ELSE 'Tidak Diketahui'
    END as status_label,
    COALESCE(t.nama_pelanggan, '-') as pelanggan,
    COALESCE(t.durasi_jam, 0) as durasi_jam,
    COALESCE(t.shuttlecock_qty, 0) as shuttlecock_qty,
    COALESCE(t.total_bayar, 0) as total_bayar_sementara,
    COALESCE(hl.harga, 0) as harga_lapangan_per_jam,
    COALESCE(hs.harga, 0) as harga_shuttlecock_per_buah,
    TIMESTAMPDIFF(MINUTE, t.waktu_mulai, NOW()) as menit_bermain,
    TIMESTAMPDIFF(MINUTE, NOW(), DATE_ADD(t.waktu_mulai, INTERVAL t.durasi_jam HOUR)) as sisa_menit
FROM lapangan l
LEFT JOIN transaksi t ON l.id = t.lapangan_id AND t.status = 'pending'
LEFT JOIN harga_lapangan hl ON l.id = hl.lapangan_id
LEFT JOIN harga_shuttlecock hs ON hs.id = (SELECT id FROM harga_shuttlecock ORDER BY created_at DESC LIMIT 1)
ORDER BY l.nama;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert Admin User
INSERT INTO users (username, password, role) VALUES
('admin', '$2b$10$YourHashedPasswordHere', 'admin'),
('kasir1', '$2b$10$YourHashedPasswordHere', 'kasir');

-- Insert Lapangan
INSERT INTO lapangan (nama, status) VALUES
('Lapangan 1', 'kosong'),
('Lapangan 2', 'kosong'),
('Lapangan 3', 'kosong'),
('Lapangan 4', 'kosong'),
('Lapangan 5', 'kosong'),
('Lapangan 6', 'kosong');

-- Insert Harga Lapangan (Rp 50.000/jam per lapangan)
INSERT INTO harga_lapangan (lapangan_id, harga) VALUES
(1, 50000),
(2, 50000),
(3, 50000),
(4, 50000),
(5, 50000),
(6, 50000);

-- Insert Harga Shuttlecock (Rp 5.000/buah)
INSERT INTO harga_shuttlecock (harga) VALUES
(5000);

-- ============================================
-- PROCEDURES (Optional - untuk optimasi)
-- ============================================

-- Procedure: Calculate Transaction Total
DELIMITER $$

CREATE PROCEDURE sp_calculate_transaction_total(
    IN p_transaksi_id INT,
    OUT p_total DECIMAL(12, 2)
)
READS SQL DATA
BEGIN
    SELECT 
        (t.durasi_jam * hl.harga) + (t.shuttlecock_qty * hs.harga)
    INTO p_total
    FROM transaksi t
    JOIN harga_lapangan hl ON t.lapangan_id = hl.lapangan_id
    JOIN harga_shuttlecock hs ON 1=1
    WHERE t.id = p_transaksi_id
    LIMIT 1;
END$$

-- Procedure: End Game Transaction
CREATE PROCEDURE sp_end_game(
    IN p_transaksi_id INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
MODIFIES SQL DATA
BEGIN
    DECLARE v_lapangan_id INT;
    DECLARE v_total DECIMAL(12, 2);
    DECLARE v_durasi_jam INT;
    DECLARE v_shuttlecock_qty INT;
    DECLARE v_harga_lapangan_id INT;
    DECLARE v_harga_shuttlecock_id INT;
    
    START TRANSACTION;
    
    BEGIN
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            ROLLBACK;
            SET p_success = FALSE;
            SET p_message = 'Error saat menyelesaikan permainan';
        END;
        
        -- Get transaction data
        SELECT lapangan_id, durasi_jam, shuttlecock_qty
        INTO v_lapangan_id, v_durasi_jam, v_shuttlecock_qty
        FROM transaksi
        WHERE id = p_transaksi_id;
        
        -- Get latest prices
        SELECT id INTO v_harga_lapangan_id
        FROM harga_lapangan
        WHERE lapangan_id = v_lapangan_id
        ORDER BY created_at DESC
        LIMIT 1;
        
        SELECT id INTO v_harga_shuttlecock_id
        FROM harga_shuttlecock
        ORDER BY created_at DESC
        LIMIT 1;
        
        -- Calculate total
        CALL sp_calculate_transaction_total(p_transaksi_id, v_total);
        
        -- Insert detail transaksi
        INSERT INTO detail_transaksi 
        (transaksi_id, harga_lapangan_id, harga_shuttlecock_id, jumlah_jam, jumlah_shuttlecock, subtotal_lapangan, subtotal_shuttlecock, total)
        SELECT
            p_transaksi_id,
            v_harga_lapangan_id,
            v_harga_shuttlecock_id,
            v_durasi_jam,
            v_shuttlecock_qty,
            (v_durasi_jam * (SELECT harga FROM harga_lapangan WHERE id = v_harga_lapangan_id)),
            (v_shuttlecock_qty * (SELECT harga FROM harga_shuttlecock WHERE id = v_harga_shuttlecock_id)),
            v_total;
        
        -- Update transaction status
        UPDATE transaksi
        SET status = 'dibayar',
            waktu_selesai = NOW(),
            total_bayar = v_total,
            updated_at = NOW()
        WHERE id = p_transaksi_id;
        
        -- Update lapangan status
        UPDATE lapangan
        SET status = 'kosong',
            updated_at = NOW()
        WHERE id = v_lapangan_id;
        
        COMMIT;
        SET p_success = TRUE;
        SET p_message = 'Permainan berhasil diselesaikan';
    END;
END$$

DELIMITER ;

-- ============================================
-- INDEXES untuk Performance
-- ============================================

CREATE INDEX idx_transaksi_lapangan_created ON transaksi(lapangan_id, created_at);
CREATE INDEX idx_detail_transaksi_created ON detail_transaksi(created_at);
CREATE INDEX idx_audit_log_user_created ON audit_log(user_id, created_at);

-- ============================================
-- DONE
-- ============================================

-- Test query
-- SELECT * FROM v_status_lapangan;
-- SELECT * FROM v_laporan_harian;
