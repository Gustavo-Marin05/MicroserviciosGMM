const express = require('express');
const proxy = require('express-http-proxy');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_demo';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4000';
const VEHICLE_SERVICE_URL = process.env.VEHICLE_SERVICE_URL || 'http://localhost:5000';

console.log('Configuración:');
console.log('AUTH_SERVICE_URL:', AUTH_SERVICE_URL);
console.log('VEHICLE_SERVICE_URL:', VEHICLE_SERVICE_URL);

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check del API Gateway
app.get('/health', (req, res) => {
  res.json({ 
    status: 'API Gateway funcionando',
    services: {
      auth: AUTH_SERVICE_URL,
      vehicle: VEHICLE_SERVICE_URL
    }
  });
});

// ✅ Middleware de autenticación que soporta cookies O headers
function authMiddleware(req, res, next) {
  // Intentar obtener token de la cookie primero, luego del header
  let token = req.cookies.token;
  
  if (!token) {
    const auth = req.headers['authorization'];
    if (auth) {
      const parts = auth.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }
  }
  
  if (!token) {
    return res.status(401).json({ error: 'No autorizado - Token requerido' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Adaptarse a diferentes formatos de payload (name o username)
    req.headers['x-user'] = payload.name || payload.username;
    console.log('✅ Token válido para usuario:', payload.name || payload.username);
    next();
  } catch (error) {
    console.error('❌ Error verificando token:', error.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// ✅ Interceptar login para guardar token en cookie
app.post('/auth/login', express.json(), async (req, res) => {
  try {
    // Reenviar al auth-service
    const response = await fetch(`${AUTH_SERVICE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    
    if (response.ok && data.token) {
      // ✅ Guardar token en cookie httpOnly
      res.cookie('token', data.token, {
        httpOnly: true,
        secure: false,   // false para desarrollo, true en producción con HTTPS
        maxAge: 3600000, // 1 hora
        sameSite: 'lax'
      });
      
      console.log('🍪 Cookie establecida para usuario:', req.body.name || req.body.username);
      
      // Devolver también el token en la respuesta
      return res.json({ 
        message: 'Login exitoso',
        token: data.token 
      });
    }
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ Endpoint para logout (eliminar cookie)
app.post('/auth/logout', (req, res) => {
  res.clearCookie('token');
  console.log('🍪 Cookie eliminada - Logout exitoso');
  res.json({ message: 'Logout exitoso' });
});

// Proxy a auth/profile con autenticación
app.use('/auth/profile', authMiddleware, proxy(AUTH_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    console.log('🔵 Proxying to auth-service /profile');
    return '/profile';
  }
}));

// Proxy a auth-service (signup, health)
app.use('/auth', proxy(AUTH_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    const path = req.url.replace('/auth', '');
    console.log('🔵 Proxying to auth-service:', path);
    return path;
  }
}));



// Proxy a /vehiculos con autenticación
app.use('/vehiculos', authMiddleware, proxy(VEHICLE_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    const fullPath = '/vehiculos' + (req.url === '/' ? '' : req.url);
    console.log('Proxying to vehicle-service:', fullPath);
    return fullPath;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    // Asegurar que se pasen los headers necesarios
    if (srcReq.headers['x-user']) {
      proxyReqOpts.headers['x-user'] = srcReq.headers['x-user'];
    }
    return proxyReqOpts;
  },
  timeout: 30000,
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    console.log(' Response from vehicle-service:', userRes.statusCode);
    return proxyResData;
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('Error conectando con vehicle-service:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ 
        error: 'Vehicle service no disponible',
        details: err.message,
        target: VEHICLE_SERVICE_URL
      });
    }
  }
}));

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ API Gateway listening on port ${PORT}`);
});