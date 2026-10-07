import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { getDb } from './server/db.js';
import apiRouter from './server/routes.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Ensure uploads folder exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Automatically detects and terminates any stale process occupying the specified port
 * to prevent EADDRINUSE errors forever.
 */
function freePort(port: number) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      const currentPid = process.pid;
      const pids = new Set<string>();
      for (const line of output.split('\n')) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && Number(pid) !== currentPid) {
            pids.add(pid);
          }
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`🧹 Auto-cleared stale process (PID ${pid}) on port ${port}`);
        } catch {
          // ignore
        }
      }
    } else {
      try {
        execSync(`lsof -t -i:${port} | xargs kill -9`, { stdio: 'ignore' });
      } catch {
        // ignore
      }
    }
  } catch {
    // Port is free or lookup returned non-zero
  }
}

async function startServer() {
  // Pre-emptively clear port 3000 and Vite websocket port 24678
  freePort(PORT);
  freePort(24678);

  // Initialize Database
  try {
    await getDb();
    console.log('✅ SQLite Database successfully initialized and seeded.');
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
  }

  // CORS middleware for flexible hosting / remote APIs
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (_req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Middleware
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Static uploads directory
  app.use('/uploads', express.static(uploadsDir));

  // Mount API router
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', name: 'OXYGEN GYM API', time: new Date().toISOString() });
  });

  const httpServer = http.createServer(app);

  if (!isProd) {
    // Development mode with Vite middlewares attached to httpServer
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${PORT} busy, force clearing and retrying...`);
      freePort(PORT);
      setTimeout(() => {
        httpServer.listen(PORT, '0.0.0.0', () => {
          console.log(`🚀 Oxygen Gym Full-Stack Server running on http://localhost:${PORT}`);
        });
      }, 500);
    } else {
      console.error('Server error:', err);
    }
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Oxygen Gym Full-Stack Server running on http://localhost:${PORT}`);
  });

  // Graceful shutdown on Ctrl+C or kill signals
  const shutdown = () => {
    httpServer.close(() => {
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
