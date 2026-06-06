# 🏗️ Entity Relationship Diagram (ERD) - ShuttleSync

## Database Schema Visualization

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          SHUTTLE SYNC DATABASE                               │
└──────────────────────────────────────────────────────────────────────────────┘


                              ┌─────────────────────┐
                              │       users         │
                              ├─────────────────────┤
                              │ id (PK)             │
                              │ username (UNIQUE)   │
                              │ password (ENCRYPTED)│
                              │ role (ENUM)         │
                              │ created_at          │
                              │ updated_at          │
                              └─────────────────────┘
                                        │
                                        │ (1 : Many)
                                        │
                                        ▼
                              ┌─────────────────────┐
                              │     lapangan        │
                              ├─────────────────────┤
                              │ id (PK)             │
                              │ nama (VARCHAR)      │
                              │ status (ENUM)       │
                              │ harga_id (FK)       │◄─────┐
                              │ created_at          │      │
                              │ updated_at          │      │
                              └─────────────────────┘      │
                                        │                   │
                                        │ (1 : Many)        │
                                        │                   │
                                        ▼                   │
                              ┌─────────────────────┐      │
                              │    transaksi        │      │
                              ├─────────────────────┤      │
                              │ id (PK)             │      │
                              │ lapangan_id (FK)    │      │
                              │ nama_pelanggan      │      │
                              │ durasi_jam          │      │
                              │ shuttlecock_qty     │      │
                              │ total_bayar         │      │
                              │ status (ENUM)       │      │
                              │ created_at          │      │
                              │ updated_at          │      │
                              └─────────────────────┘      │
                                        │                   │
                                        │ (1 : Many)        │
                                        │                   │
                                        ▼                   │
                              ┌─────────────────────┐      │
                              │ detail_transaksi    │      │
                              ├─────────────────────┤      │
                              │ id (PK)             │      │
                              │ transaksi_id (FK)   │      │
                              │ harga_lapangan_id(FK)────►─┤
                              │ harga_shuttlecock_id│      │
                              │ jumlah_jam          │      │
                              │ jumlah_shuttlecock  │      │
                              │ subtotal            │      │
                              └─────────────────────┘      │
                                                           │
                                                           ▼
                                        ┌─────────────────────────┐
                                        │  harga_lapangan         │
                                        ├─────────────────────────┤
                                        │ id (PK)                 │
                                        │ lapangan_id (FK)        │
                                        │ harga (DECIMAL 12,2)    │
                                        │ created_at              │
                                        │ updated_at              │
                                        └─────────────────────────┘


                                        ┌─────────────────────────┐
                                        │ harga_shuttlecock       │
                                        ├─────────────────────────┤
                                        │ id (PK)                 │
                                        │ harga (DECIMAL 12,2)    │
                                        │ created_at              │
                                        │ updated_at              │
                                        └─────────────────────────┘
```

## 📋 Penjelasan Relasi

### 1. **users → lapangan**
- Relasi: One-to-Many (1:N)
- Satu user (admin/kasir) dapat mengelola banyak lapangan
- Foreign Key: `lapangan.user_id` referensi ke `users.id`

### 2. **lapangan → harga_lapangan**
- Relasi: One-to-Many (1:N)
- Satu lapangan memiliki banyak catatan harga (history)
- Foreign Key: `harga_lapangan.lapangan_id` referensi ke `lapangan.id`

### 3. **lapangan → transaksi**
- Relasi: One-to-Many (1:N)
- Satu lapangan memiliki banyak transaksi/permainan
- Foreign Key: `transaksi.lapangan_id` referensi ke `lapangan.id`

### 4. **transaksi → detail_transaksi**
- Relasi: One-to-Many (1:N)
- Satu transaksi memiliki satu atau lebih detail (breakdown biaya)
- Foreign Key: `detail_transaksi.transaksi_id` referensi ke `transaksi.id`

### 5. **harga_lapangan ← detail_transaksi**
- Relasi: One-to-Many (1:N)
- Satu harga lapangan digunakan di banyak detail transaksi
- Foreign Key: `detail_transaksi.harga_lapangan_id` referensi ke `harga_lapangan.id`

### 6. **harga_shuttlecock ← detail_transaksi**
- Relasi: One-to-Many (1:N)
- Satu harga shuttlecock digunakan di banyak detail transaksi
- Foreign Key: `detail_transaksi.harga_shuttlecock_id` referensi ke `harga_shuttlecock.id`

## 🔑 Primary & Foreign Keys

| Tabel | Column | Type | Constraint |
|-------|--------|------|------------|
| users | id | INT | PRIMARY KEY, AUTO_INCREMENT |
| lapangan | id | INT | PRIMARY KEY, AUTO_INCREMENT |
| lapangan | harga_id | INT | FOREIGN KEY → harga_lapangan.id |
| transaksi | id | INT | PRIMARY KEY, AUTO_INCREMENT |
| transaksi | lapangan_id | INT | FOREIGN KEY → lapangan.id |
| detail_transaksi | id | INT | PRIMARY KEY, AUTO_INCREMENT |
| detail_transaksi | transaksi_id | INT | FOREIGN KEY → transaksi.id |
| detail_transaksi | harga_lapangan_id | INT | FOREIGN KEY → harga_lapangan.id |
| detail_transaksi | harga_shuttlecock_id | INT | FOREIGN KEY → harga_shuttlecock.id |
| harga_lapangan | id | INT | PRIMARY KEY, AUTO_INCREMENT |
| harga_lapangan | lapangan_id | INT | FOREIGN KEY → lapangan.id |
| harga_shuttlecock | id | INT | PRIMARY KEY, AUTO_INCREMENT |

## 📊 Normalization Status

✅ **3NF (Third Normal Form) Compliant**
- Tidak ada redundansi data
- Semua non-key attributes bergantung pada primary key
- Tidak ada transitive dependencies

## 💾 Indexing Strategy

```sql
-- Index untuk performa query
INDEX idx_users_username ON users(username);
INDEX idx_lapangan_status ON lapangan(status);
INDEX idx_transaksi_lapangan_id ON transaksi(lapangan_id);
INDEX idx_transaksi_created_at ON transaksi(created_at);
INDEX idx_detail_transaksi_transaksi_id ON detail_transaksi(transaksi_id);
INDEX idx_harga_lapangan_lapangan_id ON harga_lapangan(lapangan_id);
```

## 🔄 Data Flow

### Alur Penyewaan Lapangan

```
1. User (Kasir) Login
   ↓
2. Lihat Dashboard → Lapangan Kosong
   ↓
3. Klik "Mulai Permainan" → Input Pelanggan
   ↓
4. Data Simpan ke Tabel TRANSAKSI
   ↓
5. Status Lapangan berubah "BERMAIN"
   ↓
6. Timer Berjalan, Bisa Update Shuttlecock
   ↓
7. Data Update ke Database + Socket.io Real-time
   ↓
8. Klik "Selesai" → Hitung Total Bayar
   ↓
9. Simpan ke DETAIL_TRANSAKSI
   ↓
10. Lapangan kembali "KOSONG"
    ↓
11. Transaksi Selesai
```

### Alur Kalkulasi Biaya

```
Get Data dari Tabel:
├─ Harga Lapangan (dari harga_lapangan)
├─ Durasi Bermain (dari transaksi)
├─ Harga Shuttlecock (dari harga_shuttlecock)
└─ Jumlah Shuttlecock (dari transaksi)

Formula Kalkulasi:
├─ Biaya Lapangan = harga_lapangan × durasi_jam
├─ Biaya Shuttlecock = harga_shuttlecock × jumlah_shuttlecock
└─ TOTAL = Biaya Lapangan + Biaya Shuttlecock

Simpan Hasil:
└─ detail_transaksi.subtotal
   & transaksi.total_bayar
```

## 🗄️ Storage Estimation

| Tabel | Avg Rows/Bulan | Storage | Notes |
|-------|-----------------|---------|-------|
| users | 50 | 5 KB | Kasir & Admin |
| lapangan | 100 | 10 KB | Statis |
| transaksi | 1000 | 100 KB | Akumulatif |
| detail_transaksi | 1000 | 50 KB | Akumulatif |
| harga_lapangan | 200 | 20 KB | History Harga |
| harga_shuttlecock | 100 | 10 KB | History Harga |
| **TOTAL** | | **~195 KB/bulan** | |

*Estimasi untuk kapasitas 10 lapangan dengan rata-rata 100 transaksi/hari*
