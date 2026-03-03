# 🍔 Menú Interactivo de Hamburguesas

Aplicación web interactiva con animaciones fluidas para seleccionar y visualizar hamburguesas personalizadas. **Incluye panel de administración completo** para gestionar el menú e imágenes.

## 📁 Estructura del Proyecto

```
src/
├── components/              # Componentes reutilizables
│   ├── Burger/              # Componentes de la hamburguesa
│   │   ├── index.ts         # Exportaciones del módulo
│   │   ├── Burger.tsx       # Contenedor principal de la hamburguesa
│   │   ├── TopBun.tsx       # Pan superior
│   │   ├── Cheese.tsx       # Queso
│   │   ├── Meat.tsx         # Carne (deslizable)
│   │   ├── Tomato.tsx       # Tomate
│   │   ├── Lettuce.tsx      # Lechuga
│   │   └── BottomBun.tsx    # Pan inferior
│   ├── Admin/               # 🎛️ Panel de administración
│   │   ├── index.ts         # Exportaciones
│   │   ├── AdminPanel.tsx   # Panel principal con tabs
│   │   ├── MeatEditor.tsx   # Editor de carnes
│   │   ├── IngredientEditor.tsx  # Editor de ingredientes
│   │   └── ImageUploader.tsx     # Subida de imágenes
│   ├── MeatSelector.tsx     # Selector de proteínas
│   ├── NutritionalInfo.tsx  # Panel de información nutricional
│   └── OrderButton.tsx      # Botón de completar pedido
├── contexts/
│   └── MenuContext.tsx      # 🔄 Estado global del menú
├── constants/
│   └── meats.ts             # Datos de las opciones de carne
├── types/
│   └── index.ts             # Definiciones de TypeScript
├── App.tsx                  # Componente principal
├── main.tsx                 # Punto de entrada
└── index.css                # Estilos globales
```

## 🎛️ Panel de Administración

### Acceso
Haz clic en el ícono de **engranaje (⚙️)** en el header para abrir el panel de administración.

### Funcionalidades

#### 1. **Gestión de Carnes**
- ✅ Crear nuevas carnes
- ✅ Editar carnes existentes
- ✅ Eliminar carnes
- ✅ Subir imágenes (archivo o URL)
- ✅ Configurar precios y valores nutricionales
- ✅ Personalizar gradientes CSS

#### 2. **Gestión de Ingredientes**
- ✅ Crear ingredientes personalizados
- ✅ Editar ingredientes existentes
- ✅ Eliminar ingredientes
- ✅ Subir imágenes para cada ingrediente
- ✅ Habilitar/deshabilitar ingredientes
- ✅ Ordenar ingredientes en la hamburguesa

### Subida de Imágenes

El sistema soporta dos métodos:

1. **Arrastrar y soltar** - Arrastra una imagen directamente al área de carga
2. **Seleccionar archivo** - Haz clic para explorar y seleccionar
3. **URL** - Pega la URL de una imagen alojada en línea

**Formatos soportados:** PNG, JPG, GIF  
**Tamaño máximo recomendado:** 5MB

## 🧩 Componentes

### Componentes de Hamburguesa

Cada ingrediente es un componente independiente con sus propias animaciones:

- **TopBun**: Pan superior con semillas de sésamo
- **Cheese**: Queso con efecto de goteo
- **Meat**: Carne con marcas de parrilla (animación de deslizamiento horizontal)
- **Tomato**: Rodajas de tomate
- **Lettuce**: Lechuga con bordes ondulados
- **BottomBun**: Pan inferior
- **Burger**: Contenedor que maneja el estado colapsado/expandido

### Componentes de UI

- **MeatSelector**: Selector horizontal con miniaturas de cada tipo de carne
- **NutritionalInfo**: Muestra calorías, proteína, grasa y carbohidratos
- **OrderButton**: Botón principal de acción con precio

## 🎨 Características de Animación

### 1. Hamburguesa Junta/Separada
- **Estado inicial**: Hamburguesa junta (compacta)
- **Al seleccionar**: Se separa (vista explosionada) por 800ms
- **Después**: Se junta automáticamente

### 2. Deslizamiento de Carne
- Animación horizontal al cambiar de proteína
- Dirección basada en el índice (izquierda/derecha)
- Transición suave con spring physics

### 3. Movimiento de Flotación
- La hamburguesa flota continuamente
- Animación diferente en estado colapsado vs expandido

## 📊 Datos

### Estructura de MeatOption

```typescript
interface MeatOption {
  id: string;           // Identificador único
  name: string;         // Nombre completo
  style: string;        // Clases de gradiente CSS
  price: number;        // Precio en dólares
  calories: number;     // Calorías
  protein: number;      // Proteína en gramos
  fat: number;          // Grasa en gramos
  carbs: number;        // Carbohidratos en gramos
  shortName: string;    // Nombre corto para selector
}
```

## 🚀 Agregar Nueva Carne

1. Edita `src/constants/meats.ts`
2. Agrega un nuevo objeto al array `MEATS`:

```typescript
{
  id: 'pork',
  name: 'Cerdo BBQ',
  style: 'from-[#8B4513] via-[#A0522D] to-[#D2691E]',
  price: 13.50,
  calories: 420.0,
  protein: 35.0,
  fat: 18.0,
  carbs: 48.0,
  shortName: 'Cerdo BBQ'
}
```

## 🎯 Agregar Nuevo Ingrediente

1. Crea el componente en `src/components/Burger/`:

```typescript
import { motion } from 'motion/react';
import { BurgerComponentProps } from '../../types';

export const Bacon = ({ isCollapsed }: BurgerComponentProps) => (
  <motion.div 
    initial={{ y: -50, opacity: 0 }} 
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.2, type: 'spring' }}
    className="relative z-35"
  >
    {/* Tu diseño de bacon aquí */}
  </motion.div>
);
```

2. Importa y agrega a `Burger.tsx`:

```typescript
import { Bacon } from './Bacon';
// ...
<Cheese isCollapsed={isCollapsed} />
<Bacon isCollapsed={isCollapsed} />  {/* Nuevo */}
<Meat ... />
```

3. Exporta en `src/components/Burger/index.ts`

## 🛠️ Tecnologías

- **React 19**: Framework principal
- **TypeScript**: Tipado estático
- **Motion (Framer Motion)**: Animaciones
- **Tailwind CSS 4**: Estilos
- **Vite**: Build tool

## 📝 Próximos Pasos

Ideas para expandir el proyecto:

- [ ] Agregar selector de ingredientes adicionales
- [ ] Implementar carrito de compras
- [ ] Conectar con backend/API
- [ ] Agregar persistencia local
- [ ] Sistema de favoritos
- [ ] Compartir configuración personalizada
- [ ] Modo oscuro/claro
- [ ] Animaciones de entrada/salida de página

## 🎨 Personalización de Colores

Los colores principales se pueden ajustar en:

- **Fondo**: `App.tsx` - clases `bg-gradient-to-br`
- **Botón principal**: `OrderButton.tsx` - `from-[#FF9F0A] to-[#FF7A00]`
- **Ingredientes**: Cada componente en `components/Burger/`

## 📱 Responsive

El diseño es totalmente responsive:
- Mobile: Layout vertical, selector horizontal scroll
- Desktop: Layout horizontal, hamburguesa y panel lado a lado

---

Creado con ❤️ usando React y Motion
