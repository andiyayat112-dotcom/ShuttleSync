# 🏸 ShuttleSync - Sistem Manajemen Lapangan Badminton

Website modern, responsif, dan realtime untuk mengelola usaha lapangan badminton dengan proses pencatatan penyewaan lapangan, penggunaan shuttlecock, dan pembayaran yang cepat, akurat, dan terstruktur.

## 📋 Daftar Isi
- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Penggunaan](#penggunaan)
- [Struktur Database](#struktur-database)
- [API Endpoints](#api-endpoints)
- [Dokumentasi](#dokumentasi)

## ✨ Fitur

### 1. **Login Sistem Role Admin & Kasir**
- ✅ JWT Authentication
- ✅ Password terenkripsi (bcrypt)
- ✅ Redirect berdasarkan role
- ✅ Session management
- ✅ Logout functionality

### 2. **Dashboard Realtime Lapangan**
- ✅ Tampilan card/grid seluruh lapangan
- ✅ Status lapangan realtime (Kosong/Bermain/Waktu Habis)
- ✅ Timer countdown otomatis
- ✅ Jumlah shuttlecock terpakai
- ✅ Total harga sementara
- ✅ Update tanpa refresh menggunakan Socket.io

### 3. **Quick Input Pelanggan**
- ✅ Modal form untuk memulai permainan
- ✅ Input: Nama Pelanggan, Lapangan, Durasi
- ✅ Realtime update status lapangan
- ✅ Simpan otomatis ke database

### 4. **Timer Bermain Otomatis**
- ✅ Timer countdown realtime
- ✅ Status warna: Hijau (kosong), Kuning (≤15 menit), Merah (waktu habis)
- ✅ Persistensi data di database
- ✅ Timer tetap berjalan setelah refresh

### 5. **Kontrol Shuttlecock Realtime**
- ✅ Tombol +/- untuk tambah/kurang shuttlecock
- ✅ Update otomatis ke database
- ✅ Perubahan harga realtime tanpa tombol simpan
- ✅ Socket.io untuk sinkronisasi antar user

### 6. **Perhitungan Pembayaran Otomatis**
- ✅ Formula: (Harga Lapangan × Durasi) + (Harga Shuttlecock × Jumlah)
- ✅ Kalkulasi realtime setiap ada perubahan
- ✅ Modal pembayaran dengan detail lengkap
- ✅ Riwayat transaksi tersimpan

### 7. **Role-Based Access Control**

**Admin:**
- Dashboard
- Kelola Lapangan
- Kelola Harga Lapangan
- Kelola Harga Shuttlecock
- Kelola Akun Kasir
- Laporan Transaksi
- Riwayat Penyewaan

**Kasir:**
- Dashboard Lapangan
- Input Pelanggan
- Mulai Permainan
- Selesai Permainan
- Kontrol Shuttlecock
- Pembayaran

## 🛠️ Teknologi

- **Frontend:** React.js, HTML5, CSS3, JavaScript ES6+
- **Styling:** Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL 8.0+
- **Realtime:** Socket.io
- **Authentication:** JWT (JSON Web Token)
- **Password Encryption:** bcrypt
- **HTTP Client:** Axios
- **Environment:** dotenv

## 📦 Instalasi

### Prerequisites
- Node.js v14+ dan npm/yarn
- MySQL 8.0+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/andiyayat112-dotcom/ShuttleSync.git
cd ShuttleSync
```

### 2. Setup Database

```bash
# Buat database MySQL
mysql -u root -p

# Di MySQL CLI:
CREATE DATABASE shuttle_sync;
USE shuttle_sync;

# Import schema
source database/schema.sql;
```

### 3. Setup Backend

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env dengan konfigurasi MySQL Anda
# Jalankan server
npm start
```

### 4. Setup Frontend

```bash
cd frontend
npm install

# Copy environment file
cp .env.example .env

# Jalankan development server
npm start
```

## ⚙️ Konfigurasi

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=shuttle_sync

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=24h

BCRYPT_ROUNDS=10

NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🚀 Penggunaan

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Akses aplikasi di: `http://localhost:3000`

### Akun Demo

**Admin:**
- Username: `admin`
- Password: `admin123`

**Kasir:**
- Username: `kasir1`
- Password: `kasir123`

## 📊 Struktur Database

### ERD (Entity Relationship Diagram)

```
┌─────────────────┐         ┌──────────────────┐
│     users       │         │    lapangan      │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ id (PK)          │
│ username (UQ)   │         │ nama             │
│ password        │         │ status           │
│ role            │◄────────┤ harga_id (FK)    │
│ created_at      │         │ created_at       │
└─────────────────┘         └──────────────────┘
                                    │
                                    │
                                    ▼
                            ┌──────────────────┐
                            │  transaksi       │
                            ├──────────────────┤
                            │ id (PK)          │
                            │ lapangan_id (FK) │
                            │ nama_pelanggan   │
                            │ durasi           │
                            │ shuttlecock_qty  │
                            │ total_bayar      │
                            │ status           │
                            │ created_at       │
                            └──────────────────┘
                                    │
                                    ▼
                        ┌──────────────────────┐
                        │ detail_transaksi     │
                        ├──────────────────────┤
                        │ id (PK)              │
                        │ transaksi_id (FK)    │
                        │ harga_lapangan_id(FK)│
                        │ harga_shuttlecock_id │
                        │ jumlah_jam           │
                        │ jumlah_shuttlecock   │
                        │ subtotal             │
                        └──────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│  harga_lapangan      │      │ harga_shuttlecock    │
├──────────────────────┤      ├──────────────────────┤
│ id (PK)              │      │ id (PK)              │
│ lapangan_id (FK)     │      │ harga               │
│ harga                │      │ created_at           │
│ created_at           │      │ updated_at           │
│ updated_at           │      └──────────────────────┘
└──────────────────────┘
```

### Tabel Struktur

**users**
```sql
id (INT, PK, AUTO_INCREMENT)
username (VARCHAR, UNIQUE)
password (VARCHAR, bcrypt)
role (ENUM: 'admin', 'kasir')
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**lapangan**
```sql
id (INT, PK, AUTO_INCREMENT)
nama (VARCHAR)
status (ENUM: 'kosong', 'bermain', 'waktu_habis')
harga_id (INT, FK)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**transaksi**
```sql
id (INT, PK, AUTO_INCREMENT)
lapangan_id (INT, FK)
nama_pelanggan (VARCHAR)
durasi_jam (INT)
shuttlecock_qty (INT)
total_bayar (DECIMAL)
status (ENUM: 'pending', 'selesai', 'dibayar')
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**detail_transaksi**
```sql
id (INT, PK, AUTO_INCREMENT)
transaksi_id (INT, FK)
harga_lapangan_id (INT, FK)
harga_shuttlecock_id (INT, FK)
jumlah_jam (INT)
jumlah_shuttlecock (INT)
subtotal (DECIMAL)
```

**harga_lapangan**
```sql
id (INT, PK, AUTO_INCREMENT)
lapangan_id (INT, FK)
harga (DECIMAL)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**harga_shuttlecock**
```sql
id (INT, PK, AUTO_INCREMENT)
harga (DECIMAL)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get profile user

### Lapangan
- `GET /api/lapangan` - Daftar semua lapangan
- `GET /api/lapangan/:id` - Detail lapangan
- `POST /api/lapangan` - Buat lapangan (Admin)
- `PUT /api/lapangan/:id` - Update lapangan (Admin)
- `DELETE /api/lapangan/:id` - Hapus lapangan (Admin)

### Transaksi
- `GET /api/transaksi` - Daftar transaksi
- `POST /api/transaksi/start` - Mulai permainan
- `PUT /api/transaksi/:id/shuttlecock` - Update jumlah shuttlecock
- `POST /api/transaksi/:id/end` - Selesai permainan & bayar
- `GET /api/transaksi/laporan/harian` - Laporan harian

### Harga
- `GET /api/harga/lapangan` - Daftar harga lapangan
- `PUT /api/harga/lapangan/:id` - Update harga lapangan (Admin)
- `GET /api/harga/shuttlecock` - Daftar harga shuttlecock
- `PUT /api/harga/shuttlecock/:id` - Update harga shuttlecock (Admin)

### Kasir (Admin Only)
- `GET /api/kasir` - Daftar kasir
- `POST /api/kasir` - Tambah kasir
- `PUT /api/kasir/:id` - Update kasir
- `DELETE /api/kasir/:id` - Hapus kasir

## 📡 Socket.io Events

### Client → Server
- `start_game` - Memulai permainan
- `update_shuttlecock` - Update jumlah shuttlecock
- `end_game` - Selesai permainan
- `refresh_dashboard` - Refresh dashboard

### Server → Client
- `lapangan_updated` - Lapangan terupdate
- `timer_tick` - Timer countdown
- `shuttlecock_changed` - Shuttlecock berubah
- `game_ended` - Permainan selesai
- `dashboard_refresh` - Dashboard refresh

## 📁 Struktur Folder

```
ShuttleSync/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── jwt.js
│   │   │   └── socket.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── lapanganController.js
│   │   │   ├── transaksiController.js
│   │   │   ├── hargaController.js
│   │   │   └── kasirController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── roleCheck.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Lapangan.js
│   │   │   ├── Transaksi.js
│   │   │   ├── Harga.js
│   │   │   └── DetailTransaksi.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── lapangan.js
│   │   │   ├── transaksi.js
│   │   │   ├── harga.js
│   │   │   └── kasir.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── validator.js
│   │   │   └── response.js
│   │   └── app.js
│   ├── index.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   └── LoginForm.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── DashboardCard.jsx
│   │   │   │   ├── DashboardGrid.jsx
│   │   │   │   ├── StatisticsCard.jsx
│   │   │   │   └── TimerDisplay.jsx
│   │   │   ├── Modals/
│   │   │   │   ├── StartGameModal.jsx
│   │   │   │   ├── PaymentModal.jsx
│   │   │   │   └── ConfirmModal.jsx
│   │   │   ├── Common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   └── Buttons/
│   │   │       ├── PrimaryButton.jsx
│   │   │       ├── SecondaryButton.jsx
│   │   │       └── IconButton.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── KasirDashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ManageLapangan.jsx
│   │   │   ├── ManageHarga.jsx
│   │   │   ├── ManageKasir.jsx
│   │   │   ├── Laporan.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── socket.js
│   │   │   ├── auth.js
│   │   │   ├── lapangan.js
│   │   │   ├── transaksi.js
│   │   │   └── harga.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useSocket.js
│   │   │   └── useForm.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── DataContext.jsx
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── variables.css
│   │   │   └── animations.css
│   │   ├── utils/
│   │   │   ├── formatCurrency.js
│   │   │   ├── formatTime.js
│   │   │   ├── localStorage.js
│   │   │   └── validators.js
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .gitignore
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── ERD.md
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── SOCKET_EVENTS.md
│   ├── DEPLOYMENT.md
│   ├── SECURITY.md
│   └── CONTRIBUTING.md
├── .gitignore
└── README.md
```

## 🔐 Keamanan

- ✅ Password enkripsi menggunakan bcrypt
- ✅ JWT untuk authentication & authorization
- ✅ CORS configuration untuk mencegah XSS
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (prepared statements)
- ✅ Rate limiting pada endpoint login
- ✅ HTTPS recommendation untuk production
- ✅ Environment variables untuk secrets
- ✅ Role-based access control (RBAC)

## 📚 Dokumentasi Lengkap

Silakan lihat folder `docs/` untuk dokumentasi detail:
- `API_DOCUMENTATION.md` - Dokumentasi API lengkap
- `SOCKET_EVENTS.md` - Socket.io events detail
- `DEPLOYMENT.md` - Guide deployment production
- `SECURITY.md` - Best practice keamanan
- `CONTRIBUTING.md` - Kontribusi development

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:
1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

Proyek ini dilisensikan di bawah MIT License - lihat file LICENSE untuk detail.

## 👨‍💻 Author

**ShuttleSync Development Team**
- GitHub: [@andiyayat112-dotcom](https://github.com/andiyayat112-dotcom)

## 📞 Support

Jika ada pertanyaan atau issue, silakan buka GitHub Issue atau hubungi tim development.

---

**Build with ❤️ by Professional Full Stack Developer**
