# 🍔 Menu Interactivo - Sistema de Pedidos para Restaurantes

Sistema completo de menú digital interactivo con carrito de compras, panel de administración, y envío automático de pedidos por WhatsApp. Ideal para restaurantes de hamburguesas, pizzerías, taquerías y más.

## ✨ Características Principales

### Para Clientes
- 🎨 **Visualización 3D Interactiva**: Productos con capas animadas (hamburguesas, tacos, pizzas)
- 🛒 **Carrito Inteligente**: Gestión completa de pedidos con opciones personalizables
- 📝 **Notas Especiales**: Campo para solicitudes personalizadas (sin cebolla, extra queso, etc.)
- ⏰ **Horarios en Tiempo Real**: Muestra si el restaurante está abierto o cerrado
- 📦 **Estado de Disponibilidad**: Productos con indicador de stock y tiempo de preparación
- 📱 **WhatsApp Integrado**: Envío automático de pedidos con formato profesional
- 🚚 **Delivery/Pickup**: Opciones de entrega con cálculo de costo
- 🎯 **Responsive**: Diseño adaptado para móvil, tablet y desktop

### Para Administradores
- 🔐 **Panel Admin Seguro**: Acceso con contraseña (Ctrl+Shift+A)
- 📊 **Gestión Completa**:
  - Productos (nombre, precio, descripción, imágenes, disponibilidad)
  - Categorías (hamburguesas, bebidas, postres, etc.)
  - Opciones y Extras (tamaños, ingredientes, complementos)
  - Tipos de Carne (res, pollo, cerdo, vegano, etc.)
  - Ingredientes Visuales (capas para vista 3D)
- 🖼️ **Compresión Automática de Imágenes**: Las imágenes se optimizan automáticamente a max 500KB y 1200px
- ⏰ **Configuración de Horarios**: Horario de operación por día, horarios de apertura/cierre
- 🎨 **Personalización Visual**: Colores, logos, nombre del restaurante
- 💰 **Costos de Delivery**: Configuración de precios de envío
- 📱 **Múltiples WhatsApp**: Números separados para pickup y delivery

## 🏗️ Arquitectura

Este proyecto tiene dos modos de operación:

### 1. **Modo Frontend-Only** (localStorage)
- Ideal para demos y proyectos pequeños
- Sin necesidad de servidor backend
- Almacenamiento local en el navegador
- Configuración cero

### 2. **Modo Backend + PostgreSQL** (Producción)
- Backend REST API con Node.js + Express
- Base de datos PostgreSQL
- Autenticación JWT
- Escalable para múltiples usuarios

**Recomendación**: Usa localStorage para prototipos y PostgreSQL para producción.

## ⚙️ Configuración de Modo de Almacenamiento

El sistema se configura mediante variables de entorno en el archivo `.env`:

### Modo localStorage (Por Defecto)
```bash
# .env
VITE_STORAGE_MODE=localStorage
```
- ✅ Sin necesidad de backend
- ✅ Datos persistentes en el navegador
- ✅ Ideal para desarrollo y demos
- ⚠️ Los datos se pierden si se limpia el navegador
- ⚠️ No compartido entre dispositivos

### Modo API (Producción)
```bash
# .env
VITE_STORAGE_MODE=api
VITE_API_URL=http://localhost:3001/api
```
- ✅ Datos centralizados en PostgreSQL
- ✅ Sincronización entre dispositivos
- ✅ Autenticación con JWT
- ✅ Backups automáticos de base de datos
- 🔧 Requiere backend en ejecución

### Cambiar de Modo

1. **Copiar archivo de ejemplo**:
   ```bash
   cp .env.example .env
   ```

2. **Editar `.env`** y cambiar `VITE_STORAGE_MODE`:
   ```bash
   # Para localStorage
   VITE_STORAGE_MODE=localStorage
   
   # Para API
   VITE_STORAGE_MODE=api
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Reiniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

### Diferencias de Autenticación

| Característica | localStorage | API |
|---------------|--------------|-----|
| Login | Solo contraseña | Usuario + contraseña |
| Credenciales por defecto | `admin1234` | `admin` / `admin1234` |
| Tokens JWT | ❌ No | ✅ Sí |
| Multi-usuario | ❌ No | ✅ Sí |
| Sesión persistente | localStorage | Token con expiración |

## 🚀 Inicio Rápido

### Opción A: Frontend Solo (localStorage) - Recomendado para Empezar

#### Requisitos Previos
- Node.js 18+ 
- npm o yarn

#### Instalación

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd menu-interactivo

# Instalar dependencias
npm install

# Crear archivo de configuración
cp .env.example .env
# Por defecto ya usa localStorage, no necesita cambios

# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
http://localhost:5173
```

✅ **¡Listo!** El sistema está funcionando con almacenamiento local.  
📝 **Nota**: Los datos se guardan automáticamente en el navegador.  
🔐 **Login admin**: Solo contraseña `admin1234`

#### Construir para Producción

```bash
# Genera build optimizado en carpeta /dist
npm run build

# Preview del build
npm run preview
```

### Opción B: Backend + PostgreSQL (Producción)

#### Requisitos Previos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

#### Instalación

**1. Backend:**
```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Crear la base de datos
createdb -U postgres menu_interactivo

# Inicializar el schema
psql -U postgres -d menu_interactivo -f database/schema.sql

# Iniciar servidor backend
npm run dev
# Backend corriendo en http://localhost:3001
```

**2. Frontend:**
```bash
# Volver a la raíz del proyecto
cd ..

# Instalar dependencias (si no lo hiciste antes)
npm install

# Configurar modo API
cp .env.example .env
# Editar .env y cambiar:
# VITE_STORAGE_MODE=api
# VITE_API_URL=http://localhost:3001/api

# Iniciar frontend en modo desarrollo
npm run dev
```

✅ **¡Sistema completo funcionando!**  
🔐 **Login admin**: Usuario `admin` + contraseña `admin1234`  
📖 **Documentación completa**: [backend/README.md](backend/README.md)

**3. Migrar datos de localStorage (opcional):**
```bash
# Si ya tienes datos en localStorage y quieres migrarlos al backend:
# 1. Abrir frontend en modo localStorage
# 2. DevTools → Console → Copiar datos del localStorage
# 3. Usar script de migración (ver backend/README.md)


## 🧪 Testing

Este proyecto incluye tests automatizados con **Vitest**.

```bash
# Ejecutar tests en modo watch
npm test

# Ejecutar tests una sola vez
npm run test:run

# Ver cobertura de código
npm run test:coverage

# Interfaz visual de tests
npm run test:ui
```

**Estado actual**: ✅ **12 de 12 tests pasando**
- 7 tests: openingHours utilities
- 5 tests: imageCompression utilities

Ver [TESTING.md](TESTING.md) para documentación completa de testing.

## 🔑 Acceso al Panel de Administración

1. **Presiona**: `Ctrl + Shift + A` (o `Cmd + Shift + A` en Mac)
2. **Contraseña por defecto**: `admin1234`
3. **Cambiar contraseña**: Desde el panel admin → Configuración General → Seguridad

## 📱 Configuración de WhatsApp

### Formato del Número
```
[Código País][Número]
Sin espacios, guiones ni símbolos
```

**Ejemplo para Ecuador**:
- 🇪🇨 Ecuador: `593987654321` (593 + 9 dígitos)
- Código país: `593`
- Números móviles comienzan con `9`
- Total: 12 dígitos (593 + 9)

### Configurar desde Admin
1. Panel Admin → Configuración General
2. Sección "WhatsApp y Dirección"
3. Configurar números separados para:
   - 🏪 **Pickup**: Número del restaurante
   - 🚚 **Delivery**: Número de servicio de entrega

## 🖼️ Optimización de Imágenes

### Compresión Automática
El sistema optimiza automáticamente todas las imágenes subidas para mejorar el rendimiento:

- **Tamaño máximo**: 500KB por imagen
- **Dimensiones máximas**: 1200px (ancho o alto)
- **Formato**: Conversión automática a JPEG optimizado
- **Calidad**: 85% (balance entre tamaño y calidad)

### Características
- ✅ Las imágenes pequeñas (<100KB) no se recomprimen
- ✅ Procesamiento en segundo plano (no bloquea la UI)
- ✅ Indicador visual de progreso durante la compresión
- ✅ Manejo de errores: si falla, se usa la imagen original
- ✅ Logs en consola del navegador con estadísticas de compresión

### Ejemplo de Reducción
```
Original:   2.5MB (3000x2000px)
↓ Compresión automática
Optimizada: 450KB (1200x800px)
Reducción:  82% de ahorro
```

**Resultado**: Carga más rápida del menú y menor uso de localStorage

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Admin/          # Panel de administración
│   │   ├── AdminPanel.tsx
│   │   ├── ProductEditor.tsx
│   │   ├── CategoryEditor.tsx
│   │   ├── OptionGroupEditor.tsx
│   │   └── SiteConfigEditor.tsx
│   ├── Burger/         # Componentes 3D de hamburguesa
│   ├── Cart.tsx        # Carrito de compras
│   ├── ProductCard.tsx # Tarjeta de producto
│   ├── ProductBadges.tsx # Badges reutilizables
│   ├── ErrorBoundary.tsx # Manejo de errores
│   └── ...             # Más componentes
├── contexts/           # State Management (Context API)
│   ├── MenuContext.tsx    # Productos, categorías, config
│   ├── CartContext.tsx    # Carrito de compras
│   └── AuthContext.tsx    # Autenticación admin
├── services/           # Capa de servicios
│   ├── api.ts             # Cliente REST API
│   └── storageAdapter.ts  # Abstracción de almacenamiento
├── types/              # TypeScript interfaces
│   └── index.ts        # Definiciones de tipos
├── utils/              # Funciones de utilidad
│   ├── openingHours.ts     # Lógica de horarios
│   ├── openingHours.test.ts # Tests de horarios
│   └── imageCompression.ts # Compresión de imágenes
├── constants/          # Datos constantes
│   └── meats.ts        # Tipos de carne predefinidos
├── test/               # Configuración de testing
│   └── setup.ts        # Setup global de vitest
├── App.tsx             # Componente principal
├── main.tsx            # Entry point
└── vite-env.d.ts       # TypeScript definitions para Vite
```

## 🔧 Arquitectura Técnica del Sistema Dual-Mode

### Storage Adapter Pattern

El sistema utiliza un **Storage Adapter** que abstrae la lógica de persistencia, permitiendo cambiar entre localStorage y API sin modificar el código de los componentes.

```typescript
// Detección automática del modo
const STORAGE_MODE = import.meta.env.VITE_STORAGE_MODE || 'localStorage';

// Interfaz unificada
export const storageAdapter = {
  // Todas las operaciones retornan Promises
  loadProducts: async (): Promise<Product[]> => {...},
  saveProduct: async (product: Product): Promise<void> => {...},
  deleteProduct: async (id: string): Promise<void> => {...},
  // ... más métodos para categories, ingredients, etc.
}
```

### Flujo de Datos

#### Modo localStorage:
```
Component → StorageAdapter → localStorage
                             ↓
                      Browser Storage
```

#### Modo API:
```
Component → StorageAdapter → API Client → Backend API → PostgreSQL
                             ↓
                    Transform Layer
                    (snake_case ↔ camelCase)
```

### API Client (`services/api.ts`)

Cliente REST completo con:
- **JWT Authentication**: Token automático en headers
- **Auto-retry**: Reintentos en error 401
- **Data Transform**: snake_case (API) ↔ camelCase (Frontend)
- **Type Safety**: Completamente tipado con TypeScript

```typescript
// Ejemplo de uso
import { productsApi } from './services/api';

// Create
const newProduct = await productsApi.create(productData);

// Read
const products = await productsApi.getAll();
const product = await productsApi.getById('id-123');

// Update
await productsApi.update('id-123', updatedData);

// Delete
await productsApi.delete('id-123');
```

### Context Architecture

Todos los contexts son **async-first** y soportan ambos modos:

```typescript
// MenuContext.tsx
export const MenuContext = createContext({
  // Data
  products: Product[],
  categories: Category[],
  
  // Loading states
  isLoading: boolean,
  error: string | null,
  
  // Async operations
  updateProduct: (product: Product) => Promise<void>,
  addProduct: (product: Product) => Promise<void>,
  deleteProduct: (id: string) => Promise<void>,
  
  // Refetch capability
  refetchData: () => Promise<void>,
});
```

### Error Handling

El sistema maneja errores de forma consistente:

```typescript
try {
  setIsLoading(true);
  const result = await storageAdapter.saveProduct(product);
  // Actualizar estado local
  setProducts(prev => [...prev, result]);
} catch (error) {
  setError(`Error al guardar producto: ${error.message}`);
  console.error('Error details:', error);
} finally {
  setIsLoading(false);
}
```

### Cache Management (localStorage mode)

Sistema de cache con TTL de 24 horas:

```typescript
// Cache validation
const isCacheValid = () => {
  const timestamp = localStorage.getItem('cache_timestamp');
  if (!timestamp) return false;
  const age = Date.now() - parseInt(timestamp);
  return age < 24 * 60 * 60 * 1000; // 24h
};

// Auto-invalidation
if (!isCacheValid()) {
  // Clear cache and reload
  localStorage.clear();
  window.location.reload();
}
```


## 🎨 Personalización

### Cambiar Colores del Tema
1. Panel Admin → Configuración General → "Personalización Visual"
2. Ajustar colores con el selector o código HEX
3. Presets disponibles: Naranja, Rojo, Azul, Verde, Púrpura

### Agregar Productos
1. Panel Admin → "Productos"
2. Click en "Agregar Producto"
3. Completar:
   - Nombre y descripción
   - Precio base
   - Categoría
   - Imagen (opcional)
   - Info nutricional (opcional)
   - ✅ Stock disponible
   - ⏱️ Tiempo de preparación

### Configurar Horarios
1. Panel Admin → Configuración General → "Horarios de Operación"
2. Para cada día:
   - ✅ Activar/desactivar día
   - ⏰ Hora de apertura
   - ⏰ Hora de cierre
3. Opcional: "Permitir pedidos fuera de horario" (24/7)

## 🔧 Tecnologías Utilizadas

### Frontend
- **Framework**: React 19
- **Lenguaje**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React

### State & Data
- **State Management**: React Context API
- **Persistencia**: localStorage / PostgreSQL (modo backend)
- **Error Handling**: react-error-boundary
- **Image Optimization**: browser-image-compression

### Backend (Opcional)
- **Runtime**: Node.js
- **Framework**: Express
- **Base de Datos**: PostgreSQL
- **ORM/Query**: pg (node-postgres)
- **Autenticación**: JWT + bcrypt
- **CORS**: cors middleware

### Testing
- **Framework**: Vitest
- **Component Testing**: @testing-library/react
- **DOM Matchers**: @testing-library/jest-dom

## 📁 Estructura del Proyecto

```
menu-interactivo/
├── src/                      # Frontend React
│   ├── components/           # Componentes React
│   │   ├── Admin/           # Panel de administración
│   │   ├── Burger/          # Componentes 3D de hamburguesa
│   │   ├── Cart.tsx         # Carrito de compras
│   │   └── ...              
│   ├── contexts/            # State Management (Context API)
│   │   ├── MenuContext.tsx  # Productos, categorías, config
│   │   ├── CartContext.tsx  # Carrito de compras
│   │   └── AuthContext.tsx  # Autenticación admin
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Funciones de utilidad
│   │   ├── openingHours.ts      # Lógica de horarios
│   │   ├── imageCompression.ts  # Optimización de imágenes
│   │   └── *.test.ts            # Tests unitarios
│   └── ...
├── backend/                 # Backend Node.js (Opcional)
│   ├── src/
│   │   ├── routes/          # Endpoints REST API
│   │   ├── middleware/      # Auth JWT
│   │   ├── config/          # Configuración DB
│   │   └── server.js        # Servidor Express
│   ├── database/
│   │   ├── schema.sql       # Schema PostgreSQL
│   │   └── migrate-from-localstorage.js
│   └── README.md            # Documentación backend
├── package.json
├── vite.config.ts
├── vitest.config.ts
└── README.md                # Este archivo
```

## 📦 Datos de Muestra

El sistema incluye datos de ejemplo:
- 3 hamburguesas (Clásica, BBQ, Vegana)
- 4 categorías (Hamburguesas, Bebidas, Acompañamientos, Postres)
- 5 tipos de carne (Res, Pollo, Cerdo, Pescado, Vegano)
- Grupos de opciones (tamaños, extras, salsas)

Puedes **eliminar** o **modificar** todo desde el panel admin.

## 🚨 Resetear a Valores por Defecto

⚠️ **PRECAUCIÓN**: Esto elimina TODOS tus cambios

1. Panel Admin → Configuración General
2. Scroll hasta el final
3. Click en "Resetear a Valores por Defecto"

## 🎯 Calidad del Código

### Características Implementadas

#### Frontend
- ✅ **TypeScript**: Tipado fuerte en todo el código
- ✅ **JSDoc**: Documentación de funciones críticas
- ✅ **React.memo**: Optimización de performance
- ✅ **Accesibilidad**: ARIA labels y navegación por teclado
- ✅ **Error Boundary**: Manejo robusto de errores
- ✅ **Testing**: 12 tests automatizados con Vitest (todos pasando)
- ✅ **Image Optimization**: Compresión automática de imágenes
- ✅ **Code Reusability**: Componentes reutilizables (ProductBadges)
- ✅ **Clean Code**: Separación de concerns y buenas prácticas
- ✅ **24h Cache System**: Sistema de caché inteligente para optimizar recursos

#### Backend (PostgreSQL)
- ✅ **RESTful API**: Endpoints organizados y semánticos
- ✅ **JWT Authentication**: Seguridad con tokens
- ✅ **Password Hashing**: bcrypt con factor 10
- ✅ **Connection Pooling**: Gestión eficiente de conexiones
- ✅ **CORS Configured**: Headers de seguridad configurados
- ✅ **SQL Injection Protection**: Prepared statements con pg
- ✅ **Database Triggers**: Auto-actualización de timestamps
- ✅ **Transaction Support**: ACID compliance en operaciones complejas
- ✅ **Error Handling**: Middleware centralizado de errores
- ✅ **Environment Variables**: Configuración segura con dotenv


### Arquitectura
- 📐 **REST API**: Backend desacoplado del frontend
- 🗄️ **Relational DB**: PostgreSQL con esquema normalizado
- 🔄 **Stateless Backend**: Escalable horizontalmente
- 💾 **Persistent Storage**: Datos seguros en BD relacional
- 🔐 **Secure Auth**: JWT con expiración de 24h

## 📚 Documentación Adicional

- [backend/README.md](backend/README.md) - Documentación completa del backend API
- [TESTING.md](TESTING.md) - Guía completa de testing
- [Vitest](https://vitest.dev/) - Framework de testing
- [React Testing Library](https://testing-library.com/react) - Testing de componentes
- [PostgreSQL Docs](https://www.postgresql.org/docs/) - Documentación de PostgreSQL
- [Express.js](https://expressjs.com/) - Framework web para Node.js
Frontend

#### El panel admin no se abre
- Verifica que estés usando `Ctrl+Shift+A` (Windows/Linux) o `Cmd+Shift+A` (Mac)
- Asegúrate de tener JavaScript habilitado en tu navegador

#### Los pedidos no se envían por WhatsApp
- Verifica que el número esté en formato internacional (sin +, espacios ni guiones)
- Ejemplo correcto: `593987654321` (\ud83c\uddea\ud83c\udde8 Ecuador: 593 + 9 d\u00edgitos)

#### localStorage lleno
- El sistema maneja automáticamente errores de QuotaExceeded
- Si las imágenes son muy grandes, considera usar URLs externas
- O migra al backend PostgreSQL para almacenamiento ilimitado

#### Tests fallan
```bash
# Limpiar y reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
npm test
```

### Backend

#### Error: "password authentication failed"
- Verifica las credenciales en `.env`
- Confirma que el usuario PostgreSQL existe
- Revisa que PostgreSQL esté en ejecución

#### Error: "database does not exist"
- Crea la base de datos: `createdb -U postgres menu_interactivo`
- O desde psql: `CREATE DATABASE menu_interactivo;`

#### Error: "relation does not exist"
- Ejecuta el schema: `psql -U postgres -d menu_interactivo -f database/schema.sql`

#### Error: "Port 3001 already in use"
- Cambia el puerto en `.env` (PORT=3002)
- O mata el proceso: `lsof -ti:3001 | xargs kill` (Unix/Mac)

#### CORS errors en frontend
- Verifica que `FRONTEND_URL` en `.env` coincida con tu frontend
- Default: `http://localhost:5173 -rf node_modules package-lock.json
npm install
npm test
```

## 📄 Licencia

**Licencia Comercial Propietaria**

Este software es un producto comercial protegido por derechos de autor. Todos los derechos reservados.

### Términos de Uso:
- ✅ Permitido el uso para un sitio/restaurante por licencia
- ✅ Personalización y modificación del código para uso propio
- ✅ Soporte técnico incluido durante el período de garantía
- ❌ Prohibida la redistribución o reventa del código fuente
- ❌ Prohibido el uso en proyectos de terceros sin licencia adicional

Para adquirir licencias adicionales o uso multi-sitio, contacte al desarrollador.

## 📧 Soporte y Contacto

Para consultas comerciales, soporte técnico o personalización:

- 📧 **Email**: [erik@clemetinepure.com]
- 💬 **WhatsApp**: [0958828771]
- 📝 **Documentación**: Ver este README y `/backend/README.md`

### Soporte Incluido:
- ✅ Instalación y configuración inicial
- ✅ Resolución de bugs y errores
- ✅ Consultas técnicas básicas
- ✅ Actualizaciones de seguridad (6 meses)

### Servicios Adicionales (Opcionales):
- 🎨 Personalización de diseño y branding
- 🔧 Desarrollo de funcionalidades específicas
- 🚀 Configuración de hosting y dominio
- 📱 Integración con otros sistemas (POS, delivery, etc.)
- 🎓 Capacitación para el equipo del restaurante

---

**Sistema Profesional de Menú Digital para Restaurantes**

**Versión**: 1.0.0  
**Última actualización**: Marzo 2026  
**Estado**: ✅ Producción - Probado y Estable  
**Tecnología**: React + TypeScript + Node.js + PostgreSQL
