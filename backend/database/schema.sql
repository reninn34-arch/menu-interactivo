-- Eliminar tablas si existen (para desarrollo)
DROP TABLE IF EXISTS option_values CASCADE;
DROP TABLE IF EXISTS option_groups CASCADE;
DROP TABLE IF EXISTS product_options CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS site_config CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS meats CASCADE;

-- Tabla de usuarios (admin)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración del sitio
CREATE TABLE site_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    site_name VARCHAR(100) NOT NULL,
    tagline VARCHAR(255),
    logo TEXT,
    logo_width INTEGER DEFAULT 120,
    logo_height INTEGER DEFAULT 40,
    primary_color VARCHAR(7) DEFAULT '#FF9F0A',
    secondary_color VARCHAR(7) DEFAULT '#FF7A00',
    background_color VARCHAR(7) DEFAULT '#320A0A',
    text_color VARCHAR(7) DEFAULT '#FFFFFF',
    accent_color VARCHAR(7) DEFAULT '#FFD700',
    branch_name VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'USD',
    currency_symbol VARCHAR(5) DEFAULT '$',
    whatsapp_number VARCHAR(20),
    whatsapp_number_pickup VARCHAR(20),
    whatsapp_number_delivery VARCHAR(20),
    restaurant_address TEXT,
    delivery_cost DECIMAL(10,2),
    allow_orders_outside_hours BOOLEAN DEFAULT FALSE,
    opening_hours JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row_config CHECK (id = 1)
);

-- Tabla de categorías
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    enabled BOOLEAN DEFAULT TRUE,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ingredientes
CREATE TABLE ingredients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    enabled BOOLEAN DEFAULT TRUE,
    order_index INTEGER NOT NULL,
    is_variable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL,
    use_layered_view BOOLEAN DEFAULT FALSE,
    variable_ingredient_id VARCHAR(50) REFERENCES ingredients(id),
    linked_option_group_id VARCHAR(50),
    in_stock BOOLEAN DEFAULT TRUE,
    estimated_time INTEGER,
    nutritional_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de grupos de opciones
CREATE TABLE option_groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    required BOOLEAN DEFAULT FALSE,
    multi_select BOOLEAN DEFAULT FALSE,
    min_selections INTEGER,
    max_selections INTEGER,
    enabled BOOLEAN DEFAULT TRUE,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de valores de opciones
CREATE TABLE option_values (
    id VARCHAR(50) PRIMARY KEY,
    option_group_id VARCHAR(50) REFERENCES option_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price_modifier DECIMAL(10,2) DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    order_index INTEGER NOT NULL,
    image TEXT,
    style VARCHAR(100),
    calories INTEGER,
    protein DECIMAL(5,2),
    fat DECIMAL(5,2),
    carbs DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación producto-opciones (muchos a muchos)
CREATE TABLE product_options (
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    option_group_id VARCHAR(50) REFERENCES option_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, option_group_id)
);

-- Tabla de relación producto-ingredientes (muchos a muchos)
CREATE TABLE product_ingredients (
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    ingredient_id VARCHAR(50) REFERENCES ingredients(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, ingredient_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_enabled ON products(enabled);
CREATE INDEX idx_categories_enabled ON categories(enabled);
CREATE INDEX idx_option_values_group ON option_values(option_group_id);
CREATE INDEX idx_product_options_product ON product_options(product_id);
CREATE INDEX idx_product_options_group ON product_options(option_group_id);

-- Insertar configuración default
INSERT INTO site_config (id, site_name, tagline, branch_name) 
VALUES (1, 'Burger House', 'Las mejores hamburguesas de la ciudad', 'Sucursal Principal');

-- Insertar usuario admin default (password: admin1234)
-- Hash generado con bcrypt
INSERT INTO users (username, password_hash) 
VALUES ('admin', '$2b$10$rGxH5YXhKzBwQZ6fYxLnxOxW5qKXmD7hJZ4vM3K5TfX9LnBpYxGZW');

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_option_groups_updated_at BEFORE UPDATE ON option_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_option_values_updated_at BEFORE UPDATE ON option_values
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON site_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vista para obtener productos con toda su información
CREATE OR REPLACE VIEW products_full AS
SELECT 
    p.*,
    c.name as category_name,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', og.id,
                'name', og.name
            )
        ) FILTER (WHERE og.id IS NOT NULL),
        '[]'
    ) as option_groups,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', i.id,
                'name', i.name
            )
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'
    ) as ingredients
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_options po ON p.id = po.product_id
LEFT JOIN option_groups og ON po.option_group_id = og.id
LEFT JOIN product_ingredients pi ON p.id = pi.product_id
LEFT JOIN ingredients i ON pi.ingredient_id = i.id
GROUP BY p.id, c.name;
