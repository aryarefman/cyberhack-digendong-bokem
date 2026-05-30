import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import inventoryRoutes from './routes/inventory.js';
import slotsRoutes from './routes/slots.js';
import auditRoutes from './routes/audit.js';
import coldChainRoutes from './routes/cold-chain.js';
import dashboardRoutes from './routes/dashboard.js';
import profileRoutes from './routes/profile.js';
import maintenanceRoutes from './routes/maintenance.js';
import floorPlanUploadRoutes from './routes/floor-plan-upload.js';

const app = express();
const PORT = process.env.PORT || 4000;

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/cold-chain', coldChainRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/floor-plan-upload', floorPlanUploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 AromaSys Backend running on http://localhost:${PORT}`);
});
