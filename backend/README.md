# Backend API - Menu Interactivo

Backend REST API construido con Node.js, Express y PostgreSQL para el sistema de menú interactivo.

## 🚀 Requisitos Previos

- Node.js 18+ (LTS recomendado)
- PostgreSQL 14+ instalado y en ejecución
- npm o yarn

## 📦 Instalación

1. **Instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=menu_interactivo
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
PORT=3001
NODE_ENV=development
JWT_SECRET=tu_secret_key_super_seguro_aqui
FRONTEND_URL=http://localhost:5173
```

3. **Crear la base de datos:**
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE menu_interactivo;

# Salir
\q
```

4. **Inicializar el schema:**
```bash
# Opción 1: Usar el script npm
npm run db:init

# Opción 2: Manualmente
psql -U postgres -d menu_interactivo -f database/schema.sql
```

## 🏃‍♂️ Ejecución

### Modo desarrollo (con auto-reload):
```bash
npm run dev
```

### Modo producción:
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3001`

## 📡 Endpoints API

### Health Check
- `GET /api/health` - Estado del servidor
- `GET /api/health/db` - Estado de la conexión a BD

### Autenticación
- `POST /api/auth/login` - Login de usuario
  ```json
  {
    "username": "admin",
    "password": "admin1234"
  }
  ```
- `POST /api/auth/register` - Registrar nuevo usuario (requiere auth)

### Categorías
- `GET /api/categories` - Listar todas las categorías
- `GET /api/categories/:id` - Obtener categoría por ID
- `POST /api/categories` - Crear categoría (requiere auth)
- `PUT /api/categories/:id` - Actualizar categoría (requiere auth)
- `DELETE /api/categories/:id` - Eliminar categoría (requiere auth)

### Productos
- `GET /api/products` - Listar todos los productos
- `GET /api/products/:id` - Obtener producto con opciones e ingredientes
- `POST /api/products` - Crear producto (requiere auth)
- `PUT /api/products/:id` - Actualizar producto (requiere auth)
- `DELETE /api/products/:id` - Eliminar producto (requiere auth)

### Ingredientes
- `GET /api/ingredients` - Listar todos los ingredientes
- `GET /api/ingredients/:id` - Obtener ingrediente por ID
- `POST /api/ingredients` - Crear ingrediente (requiere auth)
- `PUT /api/ingredients/:id` - Actualizar ingrediente (requiere auth)
- `DELETE /api/ingredients/:id` - Eliminar ingrediente (requiere auth)

### Grupos de Opciones
- `GET /api/option-groups` - Listar grupos con valores
- `GET /api/option-groups/:id` - Obtener grupo con valores
- `POST /api/option-groups` - Crear grupo (requiere auth)
- `PUT /api/option-groups/:id` - Actualizar grupo (requiere auth)
- `DELETE /api/option-groups/:id` - Eliminar grupo (requiere auth)

### Configuración del Sitio
- `GET /api/site-config` - Obtener configuración
- `PUT /api/site-config` - Actualizar configuración (requiere auth)

## 🔐 Autenticación

La mayoría de endpoints POST/PUT/DELETE requieren autenticación JWT.

**Header requerido:**
```
Authorization: Bearer <tu_token_jwt>
```

**Usuario default:**
- Username: `admin`
- Password: `admin1234`

**Cambiar password default:**
```javascript
// Generar nuevo hash con bcrypt
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('tu_nuevo_password', 10);
console.log(hash);

// Actualizar en la BD
UPDATE users SET password_hash = '<nuevo_hash>' WHERE username = 'admin';
```

## 🗄️ Estructura de la Base de Datos

```
users                 - Usuarios admin
site_config           - Configuración global (single row)
categories            - Categorías de productos
products              - Productos del menú
ingredients           - Ingredientes disponibles
option_groups         - Grupos de opciones (ej: "Tipo de Pan")
option_values         - Valores de opciones (ej: "Blanco", "Integral")
product_options       - Relación productos-opciones (M:N)
product_ingredients   - Relación productos-ingredientes (M:N)
```

## 🔧 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de PostgreSQL
│   ├── middleware/
│   │   └── auth.js               # Middleware de autenticación JWT
│   ├── routes/
│   │   ├── auth.js               # Rutas de autenticación
│   │   ├── categories.js         # CRUD de categorías
│   │   ├── products.js           # CRUD de productos
│   │   ├── ingredients.js        # CRUD de ingredientes
│   │   ├── optionGroups.js       # CRUD de grupos de opciones
│   │   └── siteConfig.js         # Configuración del sitio
│   └── server.js                 # Servidor principal
├── database/
│   └── schema.sql                # Schema de la base de datos
├── .env.example                  # Template de variables de entorno
├── package.json
└── README.md
```

## 🧪 Testing

### Probar con cURL:

```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin1234"}'

# Obtener categorías
curl http://localhost:3001/api/categories

# Crear categoría (con auth)
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu_token>" \
  -d '{"id":"burgers","name":"Hamburguesas","order_index":0}'
```

### Probar con Thunder Client / Postman:
1. Importa la colección de endpoints
2. Configura el environment (base URL: `http://localhost:3001`)
3. Obtén token con `/api/auth/login`
4. Agrega token a las requests protegidas

## 🚨 Troubleshooting

**Error: "password authentication failed"**
- Verifica las credenciales en `.env`
- Confirma que el usuario PostgreSQL existe

**Error: "database does not exist"**
- Crea la base de datos: `createdb -U postgres menu_interactivo`

**Error: "relation does not exist"**
- Ejecuta el schema: `psql -U postgres -d menu_interactivo -f database/schema.sql`

**Error: "Port 3001 already in use"**
- Cambia el puerto en `.env` o mata el proceso que lo usa

## 📝 Notas de Desarrollo

- **Connection Pooling**: Configurado con 20 conexiones máximas
- **CORS**: Habilitado para `http://localhost:5173` (frontend)
- **Request Limit**: 10MB para subir imágenes base64
- **JWT Expiration**: 24 horas
- **Triggers**: Auto-actualización de `updated_at` en todas las tablas

## 🔄 Migración desde localStorage

Para migrar datos existentes del frontend:
1. Exporta los datos del localStorage del navegador
2. Crea un script de migración o usa el endpoint bulk import (pendiente)
3. Valida que todos los datos se hayan transferido correctamente

## 📈 Mejoras Futuras

- [ ] Paginación en endpoints de listado
- [ ] Rate limiting
- [ ] Websockets para actualizaciones en tiempo real
- [ ] Cache con Redis
- [ ] Tests unitarios y de integración
- [ ] Docker setup
- [ ] CI/CD pipeline
- [ ] Backup automático de BD
- [ ] Logging estructurado (Winston/Pino)
- [ ] API documentation con Swagger

## 📄 Licencia

ISC
