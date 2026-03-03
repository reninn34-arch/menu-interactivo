# 🎛️ Sistema de Administración CMS Completo

## 🚀 Acceder al Panel

1. Haz clic en el **ícono de engranaje (⚙️)** en la esquina superior derecha
2. Se abrirá el panel de administración en pantalla completa
3. Navega entre las **5 pestañas** disponibles

---

## 1. ⚙️ Configuración General

Control total del branding y apariencia de tu sitio.

### Información del Sitio
- **Nombre del Sitio**: Título principal (ej: "Burger House")
- **Nombre de Sucursal**: Ubicación específica (ej: "Sucursal Centro")
- **Eslogan**: Frase descriptiva de tu marca
- **Moneda**: USD, EUR, MXN, COP, ARS
- **Símbolo de Moneda**: $, €, £, etc.
- **Logo**: Sube el logo de tu restaurante (PNG transparente recomendado)

### Colores del Tema

#### Paletas Predefinidas (1 clic)
- **Naranja** (Default): Cálido y acogedor
- **Rojo Pasión**: Intenso y apetitoso  
- **Azul Océano**: Fresco y moderno
- **Verde Fresco**: Natural y saludable
- **Púrpura Real**: Elegante y sofisticado

#### Personalización Manual
- **Color Principal**: Marca principal
- **Color Secundario**: Gradientes y complemento
- **Color de Acento**: Precios y destacados
- **Color de Fondo**: Fondo de la app
- **Color de Texto**: Texto principal

**Vista Previa en Tiempo Real** muestra cómo se verán los cambios.

---

## 2. 📁 Gestión de Categorías

Organiza tu menú en secciones.

### Categorías por Defecto
- 🍔 Hamburguesas
- 🥤 Bebidas
- 🍟 Acompañamientos
- 🍰 Postres

### Agregar Categoría
1. Clic en **"Agregar Categoría"**
2. Completa:
   - **Nombre**: Título (ej: "Ensaladas")
   - **Descripción**: Texto opcional
   - **Icono**: Emoji (🥗, 🌮, 🍕)
   - **Habilitada**: Checkbox de visibilidad
   - **Imagen**: Foto de portada
3. **"Guardar"**

### Funciones
- **Editar**: Botón de lápiz
- **Reordenar**: Botones ↑↓
- **Habilitar/Deshabilitar**: Ícono de ojo 👁️
- **Eliminar**: ⚠️ Borra también todos sus productos

---

## 3. 📦 Gestión de Productos

Administra todos los items del menú.

### Filtrar por Categoría
Usa los botones de categoría para ver productos específicos.

### Agregar Producto  
1. Clic en **"Agregar Producto"**
2. **Campos principales**:
   - **Categoría**: Selecciona de dropdown
   - **Nombre**: Del producto
   - **Descripción**: Detalles
   - **Precio**: Valor numérico
   - **Orden**: Posición
   - **Imagen**: Foto atractiva
3. **Ingredientes del Producto**:
   - Selecciona los ingredientes que incluye el producto
   - Los ingredientes marcados se mostrarán en la tarjeta del producto
   - Solo aparecen ingredientes habilitados
   - Puedes seleccionar múltiples ingredientes haciendo clic en cada checkbox
4. **Opciones**:
   - **Habilitado**: Visible o no
   - **Destacado**: Marca con estrella ⭐
5. **Info Nutricional (Opcional)**:
   - Calorías, Proteína, Grasa, Carbohidratos
6. **"Guardar"**

### Ver Ingredientes de un Producto
En la tarjeta de cada producto se muestra:
- Los primeros 4 ingredientes asignados
- Un contador "+X más" si hay más de 4 ingredientes
- Esta información aparece debajo del precio

### Funciones Rápidas
- **Estrella**: Destacar/quitar destacado
- **Ojo**: Habilitar/deshabilitar
- **↑↓**: Reordenar dentro de categoría
- **Lápiz**: Editar
- **Papelera**: Eliminar

---

## 4. 🥩 Gestión de Carnes

Opciones de carne para hamburguesas.

### Agregar Carne
1. **"Agregar Carne"**
2. Completa:
   - **Nombre**: Completo (ej: "Pollo a la Parrilla")
   - **Nombre Corto**: Para botón (ej: "Pollo")
   - **Precio**: Con dos decimales
   - **Calorías, Proteína, Grasa, Carbohidratos**
   - **Estilo**: Gradiente CSS Tailwind
   - **Imagen**: Foto de la carne
3. **"Guardar"**

### Gradientes CSS 🎨
```css
/* Pollo */
from-[#8B4513] via-[#A0522D] to-[#D2691E]

/* Carne Roja */
from-[#2A1305] via-[#3E1F0A] to-[#5C2E0F]

/* Pescado */
from-[#DEB887] via-[#F4A460] to-[#E89B53]

/* Wagyu */
from-[#1A0A0A] via-[#2D1515] to-[#432020]
```

**Herramientas**: [cssgradient.io](https://cssgradient.io/), [uigradients.com](https://uigradients.com/)

---

## 5. 🥬 Gestión de Ingredientes

Ingredientes visuales de las hamburguesas.

### Agregar Ingrediente
1. Pestaña **"Ingredientes"**
2. **"Agregar Ingrediente"**
3. Completa:
   - **Nombre**: Del ingrediente
   - **Tipo**: TopBun, Cheese, Tomato, Lettuce, BottomBun
   - **Orden**: 1 = superior
   - **Habilitado**: Checkbox  
   - **Imagen**: Foto (PNG transparente ideal)
4. **"Guardar"**

### Funciones
- **Ojo**: Habilitar/deshabilitar rápido
- **Orden**: Número determina posición en hamburguesa

---

## 📸 Subir Imágenes (3 Métodos)

### Método 1: Arrastrar y Soltar
Arrastra archivo al área de carga → Vista previa automática

### Método 2: Seleccionar Archivo
Clic en **"examina"** → Selecciona imagen → Carga

### Método 3: URL Externa
Pega URL completa → Se muestra si es válida

### Eliminar/Cambiar
- **Eliminar**: Clic en X roja de vista previa
- **Cambiar**: Sube nueva imagen directamente

---

## 💡 Mejores Prácticas

### Imágenes
- **Formato**: PNG transparente para ingredientes
- **Tamaño**: 300x300px a 800x800px
- **Peso**: < 500KB optimizado
- **Calidad**: Alta resolución

### Precios
- Dos decimales: **12.50** ✅ (no 12.5 ❌)
- Símbolo consistente
- Redondeo uniforme

### Nombres
- **Cortos de carne**: ≤ 10 caracteres
- **Productos**: Descriptivos pero concisos
- Sin abreviaciones confusas

### Orden
- Categorías: 1, 2, 3... por prioridad
- Productos: 1+ dentro de categoría
- Ingredientes: 1 = superior

### Colores
- Prueba paletas primero
- Verifica contraste texto/fondo
- Coherencia con marca

---

## 🔄 Flujo de Trabajo

### Primera Configuración
1. **Configuración**: Logo, colores, moneda
2. **Categorías**: Ajusta según tu menú
3. **Productos**: Agrega a cada categoría
4. **Carnes**: Opciones de hamburguesas
5. **Ingredientes**: Elementos visuales

### Actualización Regular
- **Destacados**: Cambia por temporada
- **Habilitar/deshabilitar**: Items no disponibles
- **Precios**: Cuando sea necesario
- **Imágenes**: Mejora con fotos profesionales

---

## ⚠️ Advertencias

1. **Persistencia**: Los cambios están en memoria. Al recargar página, se restauran defaults. Para persistencia, conecta backend/localStorage.

2. **Eliminar Categorías**: Borra TODOS los productos asociados (irreversible).

3. **URLs Externas**: Deben ser públicas. Si fuente elimina imagen, desaparece.

4. **Formato Gradientes**: Exactamente `from-[#HEX] via-[#HEX] to-[#HEX]`

---

## ❓ FAQ

**P: ¿Se guardan automáticamente?**  
R: No, debes hacer clic en "Guardar" en cada formulario.

**P: ¿Puedo revertir cambios?**  
R: No hay función deshacer. Guarda backup de configuraciones importantes.

**P: ¿Límite de categorías?**  
R: Sin límite, pero 4-8 es ideal para UX.

**P: ¿Puedo duplicar productos?**  
R: No automáticamente, crea nuevo y copia datos manualmente.

---

## 🛠️ Mejoras Futuras

- ✅ Sistema CMS completo  
- ⏳ Persistencia en base de datos
- ⏳ Exportar/importar configuración
- ⏳ Modo oscuro/claro
- ⏳ Vista previa pública
- ⏳ Multi-idioma
- ⏳ Sistema de cupones

---

**¡Guarda esta guía para referencia rápida!**

Para documentación técnica, ver [ESTRUCTURA.md](ESTRUCTURA.md)
