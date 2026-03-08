# 🧪 Testing Documentation

## Configuración de Testing

Este proyecto utiliza **Vitest** como framework de testing, junto con **@testing-library/react** para tests de componentes React.

### Stack de Testing
- **Vitest**: Framework de testing rápido y compatible con Vite
- **@testing-library/react**: Testing de componentes React
- **@testing-library/jest-dom**: Matchers adicionales para assertions
- **jsdom**: Simulación de DOM para tests

## Comandos Disponibles

```bash
# Ejecutar tests en modo watch (desarrollo)
npm test

# Ejecutar tests una vez (CI/CD)
npm run test:run

# Ejecutar tests con interfaz visual
npm run test:ui

# Ejecutar tests con cobertura de código
npm run test:coverage
```

## Tests Implementados

### ✅ `openingHours.test.ts` - Lógica de Horarios

**7 tests implementados** para verificar:

1. **isRestaurantOpen()**
   - ✅ Retorna "abierto 24/7" cuando no hay horarios configurados
   - ✅ Retorna "abierto 24/7" cuando `allowOrdersOutsideHours` es true
   - ✅ Detecta correctamente si está dentro del horario de operación
   - ✅ Detecta correctamente si está antes del horario de apertura
   - ✅ Detecta correctamente cuando el día está marcado como cerrado

2. **getScheduleDisplay()**
   - ✅ Retorna mensaje "Abierto 24/7" cuando no hay horarios
   - ✅ Formatea correctamente el horario de todos los días de la semana

### 📁 `src/utils/imageCompression.test.ts` (5 tests)

3. **compressImage()**
   - ✅ Comprime imágenes grandes correctamente
   - ✅ Omite compresión para imágenes pequeñas (<100KB)
   - ✅ Maneja errores de compresión gracefully (retorna original)

4. **compressAndConvertToBase64()**
   - ✅ Comprime y convierte imagen a base64
   - ✅ Rechaza correctamente en caso de error de FileReader

**Resultado**: ✅ **12 de 12 tests pasando**

## Estructura de Tests

```
src/
├── test/
│   └── setup.ts                    # Configuración global de tests
└── utils/
    ├── openingHours.ts             # Utilidades de horarios
    ├── openingHours.test.ts        # Tests de horarios (7 tests)
    ├── imageCompression.ts         # Utilidades de compresión
    └── imageCompression.test.ts    # Tests de compresión (5 tests)
```

## Cómo Escribir Nuevos Tests

### Ejemplo: Test de Función Utilidad

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myFile';

describe('myFunction', () => {
  it('should do something specific', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Ejemplo: Test de Componente React

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Tests Recomendados para Implementar

### 🎯 Alta Prioridad

1. **CartContext.test.tsx**
   - addItem() - agregar productos al carrito
   - removeItem() - eliminar productos
   - updateQuantity() - actualizar cantidades
   - clearCart() - limpiar carrito
   - Cálculo de totales

2. **ProductBadges.test.tsx**
   - Muestra badge "Agotado" cuando inStock es false
   - Muestra tiempo estimado cuando está disponible
   - No muestra nada cuando no hay badges necesarios

### 🔶 Media Prioridad

3. **ProductCard.test.tsx**
   - Renderiza correctamente el producto
   - Maneja click en botón "Ordenar"
   - Muestra modal de opciones cuando tiene optionGroups
   - Botón deshabilitado cuando inStock es false

4. **InteractiveProductView.test.tsx**
   - Renderiza producto con opciones
   - Maneja selección de opciones
   - Validación de opciones requeridas
   - Cálculo de precio total

### 🟢 Baja Prioridad

5. **MenuContext.test.tsx**
   - CRUD de productos, categorías, opciones
   - Persistencia en localStorage
   - Manejo de errores de storage

## Coverage (Cobertura de Código)

Para ver un reporte de cobertura:

```bash
npm run test:coverage
```

Esto genera:
- Reporte en consola
- Reporte HTML en `coverage/index.html`
- Reporte JSON en `coverage/coverage-final.json`

### Meta de Cobertura

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Statements | 80% | - |
| Branches | 75% | - |
| Functions | 80% | - |
| Lines | 80% | - |

## CI/CD Integration

Para integrar tests en tu pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:run
      - run: npm run test:coverage
```

## Buenas Prácticas

### ✅ DO
- Escribir tests descriptivos con nombres claros
- Usar `describe` para agrupar tests relacionados
- Mockear dependencias externas (APIs, localStorage)
- Testear casos edge (valores null, arrays vacíos, etc.)
- Mantener tests independientes entre sí

### ❌ DON'T
- No testear implementación interna (detalles de código)
- No hacer tests que dependen de otros tests
- No usar valores hardcodeados sin contexto
- No ignorar tests que fallan

## Debugging Tests

### Ver output detallado
```bash
npm test -- --reporter=verbose
```

### Ejecutar un solo archivo
```bash
npm test openingHours.test.ts
```

### Ejecutar tests que coinciden con un patrón
```bash
npm test -- --testNamePattern="isRestaurantOpen"
```

## Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

**Última actualización**: Marzo 2026  
**Tests implementados**: 7/7 ✅  
**Estado**: Funcionando correctamente
