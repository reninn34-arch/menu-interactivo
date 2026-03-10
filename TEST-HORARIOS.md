# 🧪 Guía de Pruebas - Sistema de Horarios

## ✅ Checklist de Verificación

### 1. Banner de Estado Visible
- [ ] El banner aparece debajo del header
- [ ] Muestra ícono de reloj
- [ ] Muestra "✅ Abierto" o "❌ Cerrado"
- [ ] Muestra mensaje descriptivo (ej: "Abierto hasta las 22:00")
- [ ] Botón "Ver horarios" es clickeable

### 2. Configuración en Admin
- [ ] Panel admin abre con Ctrl+Shift+A
- [ ] Sección "🕐 Horarios de Operación" está visible
- [ ] Puedo marcar/desmarcar días como cerrados
- [ ] Puedo cambiar horas de apertura/cierre
- [ ] Toggle "Permitir pedidos fuera de horario" funciona
- [ ] Botón "Guardar Configuración" guarda los cambios

### 3. Modal de Horarios
- [ ] Clic en "Ver horarios" abre el modal
- [ ] Modal muestra los 7 días de la semana
- [ ] Cada día muestra su horario o "Cerrado"
- [ ] Si está activo 24/7, muestra mensaje verde
- [ ] Botón X cierra el modal
- [ ] Clic fuera del modal lo cierra

### 4. Lógica de Estado en Tiempo Real

#### 4.1 Escenario: Restaurante Abierto
**Configuración:**
- Hoy: Abierto de 09:00 a 22:00
- Hora actual: 15:00 (dentro del horario)

**Resultado esperado:**
- Banner verde con "✅ Abierto"
- Mensaje: "Abierto hasta las 22:00"

#### 4.2 Escenario: Antes de Abrir
**Configuración:**
- Hoy: Abierto de 10:00 a 22:00
- Hora actual: 08:00 (antes de abrir)

**Resultado esperado:**
- Banner rojo con "❌ Cerrado"
- Mensaje: "Abre hoy a las 10:00"

#### 4.3 Escenario: Día Cerrado
**Configuración:**
- Hoy: Marcado como cerrado
- Mañana: Abre a las 09:00

**Resultado esperado:**
- Banner rojo con "❌ Cerrado"
- Mensaje: "Cerrado hoy" con info del próximo día abierto

#### 4.4 Escenario: Pedidos 24/7
**Configuración:**
- "Permitir pedidos fuera de horario" = ACTIVADO

**Resultado esperado:**
- Banner verde con "✅ Abierto"
- Mensaje: "Pedidos disponibles 24/7"

## 🔧 Pruebas Rápidas

### Prueba 1: Cambiar estado de abierto a cerrado
```
1. Admin → Marca hoy como "Cerrado"
2. Guardar
3. Recargar menú
4. Banner debe mostrar "❌ Cerrado hoy"
```

### Prueba 2: Activar pedidos 24/7
```
1. Admin → Activar "Permitir pedidos fuera de horario"
2. Guardar
3. Recargar menú
4. Banner debe mostrar "✅ Pedidos disponibles 24/7"
```

### Prueba 3: Configurar cierre próximo
```
1. Admin → Configura cierre en 10 minutos
2. Guardar
3. Recargar menú cada minuto
4. Banner debe actualizarse cuando pase la hora de cierre
```

## 🐛 Problemas Comunes

### El banner no aparece
**Causa:** `openingHours` no está configurado
**Solución:** Ir al admin y configurar horarios, guardar

### El banner no se actualiza
**Causa:** Navegador puede tener caché
**Solución:** 
1. Refrescar con Ctrl+F5
2. O invalidar caché en Admin (botón "Invalidar Caché")

### Modal no muestra horarios
**Causa:** `openingHours` está `undefined`
**Solución:** Configurar horarios en admin y guardar

### Siempre muestra "Abierto 24/7"
**Causa:** `openingHours` es null/undefined
**Solución:** Configurar horarios específicos en el admin

## 📊 Valores por Defecto

Los horarios por defecto son:
- **Lunes-Jueves**: 09:00 - 22:00
- **Viernes**: 09:00 - 23:00
- **Sábado**: 10:00 - 23:00
- **Domingo**: 10:00 - 21:00
- **Pedidos 24/7**: Desactivado

## 🎯 Verificación Final

Si todo funciona correctamente:
- ✅ El banner refleja el estado real del restaurante
- ✅ Los cambios en admin se reflejan en el menú
- ✅ El modal muestra todos los horarios correctamente
- ✅ La lógica de apertura/cierre es precisa
- ✅ Los colores del banner son apropiados (verde/rojo)

---

**Fecha de prueba:** _____________
**Resultado:** ✅ Aprobado / ❌ Necesita ajustes
**Notas:** _______________
