const socketIO = require('socket.io');
const pool = require('./database');

const socketConfig = (io) => {
  io.on('connection', (socket) => {
    console.log(`\n👋 New user connected: ${socket.id}`);

    socket.on('join_room', (data) => {
      socket.join(`lapangan_${data.lapangan_id}`);
      socket.join('dashboard');
      console.log(`🛳 User ${socket.id} joined room lapangan_${data.lapangan_id}`);
    });

    socket.on('start_game', async (data) => {
      try {
        const conn = await pool.getConnection();
        
        await conn.query('UPDATE lapangan SET status = ? WHERE id = ?', ['bermain', data.lapangan_id]);
        
        io.to('dashboard').emit('lapangan_updated', data);
        io.to(`lapangan_${data.lapangan_id}`).emit('game_started', data);
        
        conn.release();
      } catch (error) {
        console.error('Error start_game:', error);
        socket.emit('error', { message: 'Gagal memulai permainan' });
      }
    });

    socket.on('update_shuttlecock', async (data) => {
      try {
        const conn = await pool.getConnection();
        
        await conn.query('UPDATE transaksi SET shuttlecock_qty = ?, total_bayar = ? WHERE id = ?', 
          [data.shuttlecock_qty, data.total_bayar, data.transaksi_id]);
        
        io.to('dashboard').emit('shuttlecock_updated', data);
        io.to(`lapangan_${data.lapangan_id}`).emit('shuttlecock_changed', data);
        
        conn.release();
      } catch (error) {
        console.error('Error update_shuttlecock:', error);
        socket.emit('error', { message: 'Gagal update shuttlecock' });
      }
    });

    socket.on('timer_tick', (data) => {
      io.to('dashboard').emit('timer_update', data);
      io.to(`lapangan_${data.lapangan_id}`).emit('timer_tick', data);
    });

    socket.on('end_game', async (data) => {
      try {
        const conn = await pool.getConnection();
        
        await conn.query('UPDATE lapangan SET status = ? WHERE id = ?', ['kosong', data.lapangan_id]);
        await conn.query('UPDATE transaksi SET status = ?, waktu_selesai = NOW() WHERE id = ?', 
          ['selesai', data.transaksi_id]);
        
        io.to('dashboard').emit('lapangan_updated', data);
        io.to(`lapangan_${data.lapangan_id}`).emit('game_ended', data);
        
        conn.release();
      } catch (error) {
        console.error('Error end_game:', error);
        socket.emit('error', { message: 'Gagal mengakhiri permainan' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`👋 User disconnected: ${socket.id}\n`);
    });
  });
};

module.exports = socketConfig;
