# 📱 Progressive Web App (PWA)

Tu menú interactivo ahora es una **Progressive Web App** que puede instalarse como una aplicación nativa en dispositivos móviles y escritorio.

## ✨ Características

- ✅ Instalable en cualquier dispositivo
- ✅ Funciona offline con caché inteligente
- ✅ Icono en pantalla de inicio
- ✅ Experiencia de app nativa
- ✅ Actualizaciones automáticas
- ✅ **Nombre e iconos personalizados según tu configuración**

## 📥 Cómo Instalar la App

### En Android (Chrome/Edge)
1. Abre el menú en tu navegador
2. Toca el menú (⋮) en la esquina superior derecha
3. Selecciona **"Instalar aplicación"** o **"Agregar a pantalla de inicio"**
4. Confirma la instalación
5. ¡Listo! La app aparecerá en tu pantalla de inicio

### En iPhone/iPad (Safari)
1. Abre el menú en Safari
2. Toca el botón de **Compartir** (□ con flecha)
3. Desplázate y selecciona **"Agregar a pantalla de inicio"**
4. Personaliza el nombre si deseas
5. Toca **"Agregar"**
6. ¡Listo! La app aparecerá en tu pantalla de inicio

### En Windows/Mac (Chrome/Edge)
1. Abre el menú en tu navegador
2. Busca el icono de instalación (➕) en la barra de direcciones
3. Haz clic en **"Instalar"**
4. La app se abrirá en su propia ventana
5. Puedes anclarla a la barra de tareas o escritorio

## 🎨 Personalizar el Nombre de la App

**El nombre se actualiza automáticamente** desde tu configuración:

1. Ve a **Admin → Configuración General**
2. Cambia el **"Nombre del Sitio"** (ej: "Restaurante El Buen Sabor")
3. Guarda los cambios
4. El manifest PWA se actualizará automáticamente
5. Los nuevos usuarios verán tu nombre de negocio al instalar

**Nota**: Los usuarios que ya instalaron la app deben desinstalarla y reinstalarla para ver el nuevo nombre.

## 🎨 Personalizar el Logo de la App (AUTOMÁTICO)

**El logo de la app se actualiza automáticamente** desde tu configuración:

1. Ve a **Admin → Configuración General**
2. Sube tu logo en **"Logo del Sitio"**
3. Guarda los cambios
4. El logo se guarda automáticamente como archivo `/pwa-icon.png` en el servidor
5. El manifest PWA usa ese archivo como icono de la app
6. Los usuarios verán tu logo cuando instalen la app

**Importante**: 
- El logo se convierte automáticamente a PNG optimizado
- No necesitas crear múltiples tamaños, el navegador los redimensiona
- Si cambias el logo, los usuarios deben desinstalar y reinstalar la app para ver el cambio
- Recomendado: Imagen cuadrada (512x512px o similar) con fondo transparente

## ⚙️ Configuración

### manifest.json
**El manifest se genera DINÁMICAMENTE** desde tu configuración:

- **Nombre**: Se obtiene del "Nombre del Sitio" en Configuración
- **Colores**: Se obtienen de "Color Primario" y "Color de Fondo"
- **Endpoint**: `/manifest.json` (servido por el backend)

Cuando cambies el nombre o colores en el panel de administración, el manifest se actualizará automáticamente.

**Nota**: Los usuarios que ya instalaron la app deben desinstalar y reinstalar para ver los cambios en el nombre.

### Service Worker
El archivo \`public/sw.js\` maneja:
- Caché de recursos
- Funcionamiento offline
- Actualizaciones automáticas

## 🚀 Despliegue

Cuando despliegues tu app (Railway, Vercel, etc.), asegúrate de:

1. ✅ Usar **HTTPS** (requerido para PWA)
2. ✅ Los archivos \`manifest.json\` y \`sw.js\` estén en \`public/\`
3. ✅ Los iconos estén en todos los tamaños requeridos
4. ✅ El \`index.html\` incluya el link al manifest

## 🔄 Actualizar la PWA

Cuando hagas cambios:

1. Incrementa la versión en \`sw.js\`:
   ```javascript
   const CACHE_NAME = 'menu-interactivo-v4'; // Cambiar número
   ```

2. Los usuarios recibirán la actualización automáticamente

**Versión actual**: v3

### 🔄 Forzar actualización del logo/nombre de la app

Si cambias el logo o nombre en el admin y ya tienes la app instalada:

1. **Desinstala la app** del dispositivo
2. **Cierra todas las pestañas** del menú
3. **Abre de nuevo** el menú en el navegador
4. **Reinstala la app**
5. Ahora verás el nuevo logo y nombre

**Nota**: El manifest.json NO se cachea, siempre se obtiene actualizado del servidor.

## 🧪 Probar Localmente

1. Ejecuta el proyecto:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Abre las DevTools (F12)
3. Ve a la pestaña **"Application"** → **"Manifest"**
4. Verifica que el manifest esté correcto
5. Ve a **"Service Workers"** y verifica que esté registrado

## 📊 Validar PWA

Usa estas herramientas para validar tu PWA:

- **Lighthouse** (en Chrome DevTools): Auditoría completa
- **PWA Builder**: https://www.pwabuilder.com/
- **Web.dev**: https://web.dev/measure/

## ❓ Solución de Problemas

### La app no se puede instalar
- ✅ Verifica que uses **HTTPS** (no HTTP)
- ✅ Verifica que \`manifest.json\` esté accesible
- ✅ Verifica que el service worker esté registrado

### Los iconos no aparecen
- ✅ Verifica que los archivos PNG existan en \`public/\`
- ✅ Verifica los tamaños en \`manifest.json\`
- ✅ Limpia el caché del navegador

### Cambios no se actualizan
- ✅ Incrementa la versión del caché en \`sw.js\`
- ✅ Cierra completamente la app y vuelve a abrirla
- ✅ Desinstala y reinstala la app

## 🎉 ¡Eso es todo!

Tu menú ahora es una app profesional que tus clientes pueden instalar y usar como cualquier otra aplicación en sus dispositivos.
