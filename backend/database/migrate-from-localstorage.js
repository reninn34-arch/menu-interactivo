// Script de migración: localStorage → PostgreSQL
// Ejecutar en la consola del navegador (DevTools)

async function migrateToBackend() {
  const API_URL = 'http://localhost:3001/api';
  
  // 1. Login para obtener token
  console.log('🔐 Iniciando sesión...');
  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin1234' })
  });
  
  if (!loginResponse.ok) {
    console.error('❌ Error al iniciar sesión');
    return;
  }
  
  const { token } = await loginResponse.json();
  console.log('✅ Sesión iniciada correctamente');
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // 2. Migrar Configuración del Sitio
  console.log('\n⚙️ Migrando configuración del sitio...');
  const siteConfig = JSON.parse(localStorage.getItem('siteConfig') || '{}');
  if (Object.keys(siteConfig).length > 0) {
    const configResponse = await fetch(`${API_URL}/site-config`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        site_name: siteConfig.siteName,
        tagline: siteConfig.tagline,
        logo: siteConfig.logo,
        logo_width: siteConfig.logoWidth,
        logo_height: siteConfig.logoHeight,
        primary_color: siteConfig.primaryColor,
        secondary_color: siteConfig.secondaryColor,
        background_color: siteConfig.backgroundColor,
        text_color: siteConfig.textColor,
        accent_color: siteConfig.accentColor,
        branch_name: siteConfig.branchName,
        currency: siteConfig.currency,
        currency_symbol: siteConfig.currencySymbol,
        whatsapp_number: siteConfig.whatsappNumber,
        whatsapp_number_pickup: siteConfig.whatsappNumberPickup,
        whatsapp_number_delivery: siteConfig.whatsappNumberDelivery,
        restaurant_address: siteConfig.restaurantAddress,
        delivery_cost: siteConfig.deliveryCost,
        allow_orders_outside_hours: siteConfig.allowOrdersOutsideHours,
        opening_hours: siteConfig.openingHours
      })
    });
    console.log(configResponse.ok ? '✅ Configuración migrada' : '❌ Error en configuración');
  }
  
  // 3. Migrar Categorías
  console.log('\n📁 Migrando categorías...');
  const categories = JSON.parse(localStorage.getItem('categories') || '[]');
  for (const category of categories) {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify(category)
    });
    console.log(`${response.ok ? '✅' : '❌'} Categoría: ${category.name}`);
  }
  
  // 4. Migrar Ingredientes
  console.log('\n🥬 Migrando ingredientes...');
  const ingredients = JSON.parse(localStorage.getItem('ingredients') || '[]');
  for (const ingredient of ingredients) {
    const response = await fetch(`${API_URL}/ingredients`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: ingredient.id,
        name: ingredient.name,
        type: ingredient.type,
        enabled: ingredient.enabled,
        order_index: ingredient.orderIndex,
        is_variable: ingredient.isVariable
      })
    });
    console.log(`${response.ok ? '✅' : '❌'} Ingrediente: ${ingredient.name}`);
  }
  
  // 5. Migrar Grupos de Opciones
  console.log('\n⚙️ Migrando grupos de opciones...');
  const optionGroups = JSON.parse(localStorage.getItem('optionGroups') || '[]');
  for (const group of optionGroups) {
    const response = await fetch(`${API_URL}/option-groups`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: group.id,
        name: group.name,
        description: group.description,
        required: group.required,
        multi_select: group.multiSelect,
        min_selections: group.minSelections,
        max_selections: group.maxSelections,
        enabled: group.enabled,
        order_index: group.orderIndex,
        values: group.values.map(v => ({
          id: v.id,
          name: v.name,
          price_modifier: v.priceModifier,
          enabled: v.enabled,
          order_index: v.orderIndex,
          image: v.image,
          style: v.style,
          calories: v.calories,
          protein: v.protein,
          fat: v.fat,
          carbs: v.carbs
        }))
      })
    });
    console.log(`${response.ok ? '✅' : '❌'} Grupo: ${group.name}`);
  }
  
  // 6. Migrar Productos
  console.log('\n🍔 Migrando productos...');
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  for (const product of products) {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: product.id,
        category_id: product.categoryId,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        enabled: product.enabled,
        featured: product.featured,
        order_index: product.orderIndex,
        use_layered_view: product.useLayeredView,
        variable_ingredient_id: product.variableIngredientId,
        linked_option_group_id: product.linkedOptionGroupId,
        in_stock: product.inStock,
        estimated_time: product.estimatedTime,
        nutritional_info: product.nutritionalInfo,
        option_groups: product.optionGroups,
        ingredients: product.ingredients
      })
    });
    console.log(`${response.ok ? '✅' : '❌'} Producto: ${product.name}`);
  }
  
  console.log('\n🎉 ¡Migración completada!');
  console.log('📊 Resumen:');
  console.log(`  - Configuración: 1 registro`);
  console.log(`  - Categorías: ${categories.length} registros`);
  console.log(`  - Ingredientes: ${ingredients.length} registros`);
  console.log(`  - Grupos de opciones: ${optionGroups.length} registros`);
  console.log(`  - Productos: ${products.length} registros`);
}

// Ejecutar migración
migrateToBackend().catch(console.error);
