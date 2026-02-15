import mongoose from 'mongoose';
import { env } from './config/env.js';
import { Category, TranslatedField } from './models/Category.js';
import { Brand } from './models/Brand.js';
import { AttributeDefinition } from './models/AttributeDefinition.js';
import { Product } from './models/ProductEnhanced.js';

async function seedDatabase() {
    try {
        console.log('🔗 Conectando a MongoDB...');
        await mongoose.connect(env.mongoUri, {
            dbName: env.projectId,
        });
        console.log('✅ Conectado a MongoDB');

        // Limpiar colecciones existentes
        console.log('🧹 Limpiando colecciones...');
        await Promise.all([
            Category.deleteMany({}),
            Brand.deleteMany({}),
            AttributeDefinition.deleteMany({}),
            Product.deleteMany({}),
        ]);

        // 1. Crear categorías principales
        console.log('\n📁 Creando categorías...');
        const electronicsCategory = await Category.create({
            name: { es: 'Electrónicos', en: 'Electronics', pt: 'Eletrônicos' },
            description: { es: 'Dispositivos y tecnología', en: 'Devices and technology', pt: 'Dispositivos e tecnologia' },
            active: true,
            order: 1,
        });

        const clothingCategory = await Category.create({
            name: { es: 'Ropa y Accesorios', en: 'Clothing & Accessories', pt: 'Roupas e Acessórios' },
            description: { es: 'Moda y accesorios', en: 'Fashion and accessories', pt: 'Moda e acessórios' },
            active: true,
            order: 2,
        });

        const homeCategory = await Category.create({
            name: { es: 'Hogar y Jardín', en: 'Home & Garden', pt: 'Casa e Jardim' },
            description: { es: 'Artículos para el hogar y electrodomésticos', en: 'Home items and appliances', pt: 'Artigos para casa e eletrodomésticos' },
            active: true,
            order: 3,
        });

        const sportsCategory = await Category.create({
            name: { es: 'Deportes y Fitness', en: 'Sports & Fitness', pt: 'Esportes e Fitness' },
            description: { es: 'Equipamiento deportivo y ropa atlética', en: 'Sports equipment and athletic wear', pt: 'Equipamento esportivo e roupas atléticas' },
            active: true,
            order: 4,
        });

        const beautyCategory = await Category.create({
            name: { es: 'Belleza y Salud', en: 'Beauty & Health', pt: 'Beleza e Saúde' },
            description: { es: 'Cuidado personal y perfumería', en: 'Personal care and perfumery', pt: 'Cuidado pessoal e perfumaria' },
            active: true,
            order: 5,
        });

        // 2. Crear subcategorías
        console.log('📂 Creando subcategorías...');
        const smartphonesSubcat = await Category.create({
            name: { es: 'Smartphones', en: 'Smartphones', pt: 'Smartphones' },
            parentCategory: electronicsCategory._id,
            active: true,
        });

        const laptopsSubcat = await Category.create({
            name: { es: 'Notebooks', en: 'Laptops', pt: 'Notebooks' },
            parentCategory: electronicsCategory._id,
            active: true,
        });

        const audioSubcat = await Category.create({
            name: { es: 'Audio y Video', en: 'Audio & Video', pt: 'Áudio e Vídeo' },
            parentCategory: electronicsCategory._id,
            active: true,
        });

        const shirtsSubcat = await Category.create({
            name: { es: 'Remeras', en: 'T-Shirts', pt: 'Camisetas' },
            parentCategory: clothingCategory._id,
            active: true,
        });

        const shoesSubcat = await Category.create({
            name: { es: 'Calzado', en: 'Footwear', pt: 'Calçados' },
            parentCategory: sportsCategory._id,
            active: true,
        });

        const appliancesSubcat = await Category.create({
            name: { es: 'Grandes Electrodomésticos', en: 'Large Appliances', pt: 'Grandes Eletrodomésticos' },
            parentCategory: homeCategory._id,
            active: true,
        });

        // 3. Crear marcas
        console.log('\n🏷️  Creando marcas...');
        const samsung = await Brand.create({ name: 'Samsung', active: true });
        const apple = await Brand.create({ name: 'Apple', active: true });
        const basicWear = await Brand.create({ name: 'BasicWear', active: true });
        const dell = await Brand.create({ name: 'Dell', active: true });
        const nike = await Brand.create({ name: 'Nike', active: true });
        const adidas = await Brand.create({ name: 'Adidas', active: true });
        const sony = await Brand.create({ name: 'Sony', active: true });
        const lg = await Brand.create({ name: 'LG', active: true });
        const logitech = await Brand.create({ name: 'Logitech', active: true });
        const whirlpool = await Brand.create({ name: 'Whirlpool', active: true });

        // 4. Crear definiciones de atributos
        console.log('\n🏷️  Creando atributos...');
        await AttributeDefinition.create({
            name: { es: 'Color', en: 'Color', pt: 'Cor' },
            key: 'color',
            type: 'select',
            values: ['Blanco', 'Negro', 'Azul', 'Rojo', 'Verde', 'Gris'],
            active: true,
        });

        await AttributeDefinition.create({
            name: { es: 'Almacenamiento', en: 'Storage', pt: 'Armazenamento' },
            key: 'storage',
            type: 'select',
            values: ['128GB', '256GB', '512GB', '1TB'],
            active: true,
        });

        await AttributeDefinition.create({
            name: { es: 'RAM', en: 'RAM', pt: 'RAM' },
            key: 'ram',
            type: 'select',
            values: ['8GB', '12GB', '16GB', '24GB', '32GB'],
            active: true,
        });

        await AttributeDefinition.create({
            name: { es: 'Talle', en: 'Size', pt: 'Tamanho' },
            key: 'size',
            type: 'select',
            values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            active: true,
        });

        // 5. Crear productos con opciones y variantes
        console.log('\n📦 Creando productos con variantes...');

        // PRODUCTO 1: Samsung Galaxy S24 con opciones de Color y Almacenamiento
        const galaxyS24 = await Product.create({
            name: { es: 'Samsung Galaxy S24', en: 'Samsung Galaxy S24', pt: 'Samsung Galaxy S24' },
            description: {
                es: 'El último smartphone Samsung con tecnología de punta y cámara profesional de 200MP',
                en: 'The latest Samsung smartphone with cutting-edge technology and 200MP professional camera',
                pt: 'O mais recente smartphone Samsung com tecnologia de ponta e câmera profissional de 200MP',
            },
            brand: samsung._id,
            category: electronicsCategory._id,
            subcategories: [smartphonesSubcat._id],
            sku: 'SAM-S24',
            price: 799.99,
            stock: 0, // Stock en variantes
            currency: 'USD',
            available: true,
            featured: true,
            shippingCost: 0,
            imageUrl: 'https://picsum.photos/seed/s24-1/800/600',
            images: [
                'https://picsum.photos/seed/s24-1/800/600',
                'https://picsum.photos/seed/s24-2/800/600',
                'https://picsum.photos/seed/s24-3/800/600',
            ],
            tags: ['smartphone', 'samsung', 'android', '5g'],
            weight: 167,
            dimensions: { length: 147, width: 70.6, height: 7.6 },
            options: [
                {
                    name: 'Color',
                    key: 'color',
                    values: ['Blanco', 'Negro', 'Azul'],
                },
                {
                    name: 'Almacenamiento',
                    key: 'storage',
                    values: ['128GB', '256GB', '512GB'],
                },
            ],
            variants: [
                // Blanco
                {
                    name: 'Blanco - 128GB',
                    sku: 'SAM-S24-BLA-128',
                    ean: '8806094876543',
                    attributes: { color: 'Blanco', storage: '128GB' },
                    price: 799.99,
                    discountPrice: 749.99,
                    stock: 25,
                    available: true,
                    images: [
                        'https://picsum.photos/seed/s24-white-128-1/800/600',
                        'https://picsum.photos/seed/s24-white-128-2/800/600',
                    ],
                },
                {
                    name: 'Blanco - 256GB',
                    sku: 'SAM-S24-BLA-256',
                    ean: '8806094876550',
                    attributes: { color: 'Blanco', storage: '256GB' },
                    price: 899.99,
                    stock: 18,
                    available: true,
                    images: ['https://picsum.photos/seed/s24-white-256/800/600'],
                },
                {
                    name: 'Blanco - 512GB',
                    sku: 'SAM-S24-BLA-512',
                    attributes: { color: 'Blanco', storage: '512GB' },
                    price: 1099.99,
                    stock: 10,
                    available: true,
                },
                // Negro
                {
                    name: 'Negro - 128GB',
                    sku: 'SAM-S24-NEG-128',
                    attributes: { color: 'Negro', storage: '128GB' },
                    price: 799.99,
                    stock: 30,
                    available: true,
                    images: [
                        'https://picsum.photos/seed/s24-black-128-1/800/600',
                        'https://picsum.photos/seed/s24-black-128-2/800/600',
                    ],
                },
                {
                    name: 'Negro - 256GB',
                    sku: 'SAM-S24-NEG-256',
                    attributes: { color: 'Negro', storage: '256GB' },
                    price: 899.99,
                    stock: 22,
                    available: true,
                    images: ['https://picsum.photos/seed/s24-black-256/800/600'],
                },
                {
                    name: 'Negro - 512GB',
                    sku: 'SAM-S24-NEG-512',
                    attributes: { color: 'Negro', storage: '512GB' },
                    price: 1099.99,
                    stock: 15,
                    available: true,
                },
                // Azul
                {
                    name: 'Azul - 128GB',
                    sku: 'SAM-S24-AZU-128',
                    attributes: { color: 'Azul', storage: '128GB' },
                    price: 799.99,
                    stock: 20,
                    available: true,
                    images: ['https://picsum.photos/seed/s24-blue-128/800/600'],
                },
                {
                    name: 'Azul - 256GB',
                    sku: 'SAM-S24-AZU-256',
                    attributes: { color: 'Azul', storage: '256GB' },
                    price: 899.99,
                    stock: 12,
                    available: true,
                },
            ],
        });

        // PRODUCTO 2: Remera Básica con opciones de Color y Talle
        const basicTshirt = await Product.create({
            name: { es: 'Remera Básica', en: 'Basic T-Shirt', pt: 'Camiseta Básica' },
            description: {
                es: '100% algodón, corte clásico, disponible en múltiples colores y talles',
                en: '100% cotton, classic fit, available in multiple colors and sizes',
                pt: '100% algodão, corte clássico, disponível em várias cores e tamanhos',
            },
            brand: basicWear._id,
            category: clothingCategory._id,
            subcategories: [shirtsSubcat._id],
            sku: 'BW-TSHIRT',
            price: 19.99,
            stock: 0,
            currency: 'USD',
            available: true,
            featured: true,
            shippingCost: 5,
            imageUrl: 'https://picsum.photos/seed/tshirt-main/800/600',
            images: [
                'https://picsum.photos/seed/tshirt-main/800/600',
                'https://picsum.photos/seed/tshirt-detail/800/600',
            ],
            tags: ['remera', 'básica', 'algodón', 'unisex'],
            options: [
                {
                    name: 'Color',
                    key: 'color',
                    values: ['Blanco', 'Negro', 'Gris', 'Azul'],
                },
                {
                    name: 'Talle',
                    key: 'size',
                    values: ['S', 'M', 'L', 'XL'],
                },
            ],
            variants: [
                // Blanco
                { name: 'Blanco - S', sku: 'BW-TSHIRT-BLA-S', attributes: { color: 'Blanco', size: 'S' }, price: 19.99, stock: 50, available: true, images: ['https://picsum.photos/seed/tshirt-white/800/600'] },
                { name: 'Blanco - M', sku: 'BW-TSHIRT-BLA-M', attributes: { color: 'Blanco', size: 'M' }, price: 19.99, stock: 75, available: true },
                { name: 'Blanco - L', sku: 'BW-TSHIRT-BLA-L', attributes: { color: 'Blanco', size: 'L' }, price: 19.99, stock: 60, available: true },
                { name: 'Blanco - XL', sku: 'BW-TSHIRT-BLA-XL', attributes: { color: 'Blanco', size: 'XL' }, price: 19.99, stock: 40, available: true },
                // Negro
                { name: 'Negro - S', sku: 'BW-TSHIRT-NEG-S', attributes: { color: 'Negro', size: 'S' }, price: 19.99, stock: 45, available: true, images: ['https://picsum.photos/seed/tshirt-black/800/600'] },
                { name: 'Negro - M', sku: 'BW-TSHIRT-NEG-M', attributes: { color: 'Negro', size: 'M' }, price: 19.99, stock: 80, available: true },
                { name: 'Negro - L', sku: 'BW-TSHIRT-NEG-L', attributes: { color: 'Negro', size: 'L' }, price: 19.99, stock: 55, available: true },
                { name: 'Negro - XL', sku: 'BW-TSHIRT-NEG-XL', attributes: { color: 'Negro', size: 'XL' }, price: 19.99, stock: 35, available: true },
                // Gris
                { name: 'Gris - S', sku: 'BW-TSHIRT-GRI-S', attributes: { color: 'Gris', size: 'S' }, price: 19.99, stock: 30, available: true, images: ['https://picsum.photos/seed/tshirt-grey/800/600'] },
                { name: 'Gris - M', sku: 'BW-TSHIRT-GRI-M', attributes: { color: 'Gris', size: 'M' }, price: 19.99, stock: 40, available: true },
                { name: 'Gris - L', sku: 'BW-TSHIRT-GRI-L', attributes: { color: 'Gris', size: 'L' }, price: 19.99, stock: 35, available: true },
                { name: 'Gris - XL', sku: 'BW-TSHIRT-GRI-XL', attributes: { color: 'Gris', size: 'XL' }, price: 19.99, stock: 25, available: true },
            ],
        });

        // PRODUCTO 3: Dell XPS 15 con opciones de RAM y Almacenamiento
        const dellXps15 = await Product.create({
            name: { es: 'Dell XPS 15', en: 'Dell XPS 15', pt: 'Dell XPS 15' },
            description: {
                es: 'Notebook profesional con pantalla InfinityEdge 15.6", ideal para creadores de contenido',
                en: 'Professional laptop with 15.6" InfinityEdge display, ideal for content creators',
                pt: 'Notebook profissional com tela InfinityEdge de 15,6", ideal para criadores de conteúdo',
            },
            brand: dell._id,
            category: electronicsCategory._id,
            subcategories: [laptopsSubcat._id],
            sku: 'DELL-XPS15',
            price: 1499.99,
            stock: 0,
            currency: 'USD',
            available: true,
            featured: true,
            shippingCost: 0,
            imageUrl: 'https://picsum.photos/seed/xps15-main/800/600',
            images: [
                'https://picsum.photos/seed/xps15-main/800/600',
                'https://picsum.photos/seed/xps15-side/800/600',
                'https://picsum.photos/seed/xps15-keyboard/800/600',
            ],
            tags: ['notebook', 'laptop', 'dell', 'profesional'],
            weight: 1800,
            dimensions: { length: 344, width: 230, height: 18 },
            options: [
                {
                    name: 'RAM',
                    key: 'ram',
                    values: ['16GB', '32GB'],
                },
                {
                    name: 'Almacenamiento',
                    key: 'storage',
                    values: ['512GB', '1TB'],
                },
            ],
            variants: [
                { name: '16GB - 512GB', sku: 'DELL-XPS15-16-512', attributes: { ram: '16GB', storage: '512GB' }, price: 1499.99, discountPrice: 1399.99, stock: 15, available: true },
                { name: '16GB - 1TB', sku: 'DELL-XPS15-16-1TB', attributes: { ram: '16GB', storage: '1TB' }, price: 1699.99, stock: 12, available: true },
                { name: '32GB - 512GB', sku: 'DELL-XPS15-32-512', attributes: { ram: '32GB', storage: '512GB' }, price: 1799.99, stock: 8, available: true },
                { name: '32GB - 1TB', sku: 'DELL-XPS15-32-1TB', attributes: { ram: '32GB', storage: '1TB' }, price: 1999.99, stock: 10, available: true },
            ],
        });

        // PRODUCTO 4: iPhone 15 Pro con variantes de Color y Almacenamiento
        const iphone15 = await Product.create({
            name: { es: 'iPhone 15 Pro', en: 'iPhone 15 Pro', pt: 'iPhone 15 Pro' },
            description: {
                es: 'El iPhone más avanzado con chip A17 Pro, marco de titanio y el sistema de cámara más potente en un iPhone.',
                en: 'The most advanced iPhone with A17 Pro chip, titanium frame, and the most powerful camera system on an iPhone.',
                pt: 'O iPhone mais avançado com chip A17 Pro, moldura de titânio e o sistema de câmera mais potente em um iPhone.',
            },
            brand: apple._id,
            category: electronicsCategory._id,
            subcategories: [smartphonesSubcat._id],
            sku: 'APP-IP15P',
            price: 999.99,
            stock: 0,
            currency: 'USD',
            available: true,
            featured: true,
            shippingCost: 0,
            imageUrl: 'https://picsum.photos/seed/iphone15-main/800/600',
            images: [
                'https://picsum.photos/seed/iphone15-main/800/600',
                'https://picsum.photos/seed/iphone15-back/800/600',
                'https://picsum.photos/seed/iphone15-side/800/600',
            ],
            tags: ['iphone', 'apple', 'smartphone', 'ios', 'titanio'],
            weight: 187,
            dimensions: { length: 146.6, width: 70.6, height: 8.25 },
            options: [
                {
                    name: 'Color',
                    key: 'color',
                    values: ['Natural', 'Azul', 'Negro'],
                },
                {
                    name: 'Almacenamiento',
                    key: 'storage',
                    values: ['128GB', '256GB', '512GB'],
                },
            ],
            variants: [
                // Natural
                { name: 'Natural - 128GB', sku: 'APP-IP15P-NAT-128', ean: '194253683664', attributes: { color: 'Natural', storage: '128GB' }, price: 999.99, stock: 15, available: true, images: ['https://picsum.photos/seed/ip15-nat/800/600'] },
                { name: 'Natural - 256GB', sku: 'APP-IP15P-NAT-256', ean: '194253683671', attributes: { color: 'Natural', storage: '256GB' }, price: 1099.99, stock: 10, available: true },
                { name: 'Natural - 512GB', sku: 'APP-IP15P-NAT-512', ean: '194253683688', attributes: { color: 'Natural', storage: '512GB' }, price: 1299.99, stock: 5, available: true },
                // Azul
                { name: 'Azul - 128GB', sku: 'APP-IP15P-AZU-128', ean: '194253683695', attributes: { color: 'Azul', storage: '128GB' }, price: 999.99, stock: 12, available: true, images: ['https://picsum.photos/seed/ip15-blue/800/600'] },
                { name: 'Azul - 256GB', sku: 'APP-IP15P-AZU-256', ean: '194253683701', attributes: { color: 'Azul', storage: '256GB' }, price: 1099.99, stock: 8, available: true },
                // Negro
                { name: 'Negro - 128GB', sku: 'APP-IP15P-NEG-128', ean: '194253683718', attributes: { color: 'Negro', storage: '128GB' }, price: 999.99, stock: 20, available: true, discountPrice: 949.99, images: ['https://picsum.photos/seed/ip15-black/800/600'] },
            ]
        });

        // PRODUCTO 5: Zapatillas Nike Air Max 270 (Deportes y Fitness)
        const nikeAirMax = await Product.create({
            name: { es: 'Nike Air Max 270', en: 'Nike Air Max 270', pt: 'Nike Air Max 270' },
            description: {
                es: 'Zapatillas con la unidad Air más alta de Nike hasta el momento, ofreciendo máxima amortiguación y estilo.',
                en: 'Sneakers featuring Nike\'s tallest Air unit yet, offering maximum cushioning and style.',
                pt: 'Tênis com a maior unidade Air da Nike até agora, oferecendo amortecimento e estilo máximos.',
            },
            brand: nike._id,
            category: sportsCategory._id,
            subcategories: [shoesSubcat._id],
            sku: 'NIK-AM270',
            price: 160,
            stock: 0,
            currency: 'USD',
            available: true,
            imageUrl: 'https://picsum.photos/seed/nike-air/800/600',
            tags: ['nike', 'airmax', 'running', 'lifestyle'],
            options: [
                { name: 'Color', key: 'color', values: ['Total Orange', 'Black/White', 'Volt'] },
                { name: 'Talle (US)', key: 'size', values: ['8', '9', '10', '11'] }
            ],
            variants: [
                { name: 'Total Orange - 9', sku: 'NIK-AM270-OR-9', attributes: { color: 'Total Orange', size: '9' }, price: 160, stock: 10, available: true },
                { name: 'Total Orange - 10', sku: 'NIK-AM270-OR-10', attributes: { color: 'Total Orange', size: '10' }, price: 160, stock: 15, available: true },
                { name: 'Black/White - 9', sku: 'NIK-AM270-BW-9', attributes: { color: 'Black/White', size: '9' }, price: 160, stock: 20, available: true },
            ]
        });

        // PRODUCTO 6: Sony WH-1000XM5 (Electrónicos -> Audio)
        const sonyHeadphones = await Product.create({
            name: { es: 'Sony WH-1000XM5', en: 'Sony WH-1000XM5', pt: 'Sony WH-1000XM5' },
            description: {
                es: 'Auriculares con cancelación de ruido líder en la industria y sonido excepcional.',
                en: 'Industry-leading noise canceling headphones with exceptional sound.',
                pt: 'Fones de ouvido com cancelamento de ruído líder do setor e som excepcional.',
            },
            brand: sony._id,
            category: electronicsCategory._id,
            subcategories: [audioSubcat._id],
            sku: 'SONY-WH1000XM5',
            price: 399.99,
            stock: 0,
            currency: 'USD',
            available: true,
            featured: true,
            imageUrl: 'https://picsum.photos/seed/sony-wh/800/600',
            options: [
                { name: 'Color', key: 'color', values: ['Silver', 'Black', 'Midnight Blue'] }
            ],
            variants: [
                { name: 'Silver', sku: 'SONY-XM5-SLV', attributes: { color: 'Silver' }, price: 399.99, stock: 8, available: true, images: ['https://picsum.photos/seed/sony-silver/800/600'] },
                { name: 'Black', sku: 'SONY-XM5-BLK', attributes: { color: 'Black' }, price: 399.99, stock: 12, available: true, images: ['https://picsum.photos/seed/sony-black/800/600'] },
            ]
        });

        // PRODUCTO 7: Heladera Whirlpool Inverter (Hogar -> Electrodomésticos)
        const whirlpoolFridge = await Product.create({
            name: { es: 'Heladera Whirlpool Inverter', en: 'Whirlpool Inverter Fridge', pt: 'Geladeira Whirlpool Inverter' },
            description: {
                es: 'Heladera de alta eficiencia energética con tecnología Inverter y gran capacidad.',
                en: 'High energy efficiency refrigerator with Inverter technology and large capacity.',
                pt: 'Geladeira de alta eficiência energética com tecnologia Inverter e grande capacidade.',
            },
            brand: whirlpool._id,
            category: homeCategory._id,
            subcategories: [appliancesSubcat._id],
            sku: 'WHI-REF-INV',
            price: 1200,
            stock: 5,
            currency: 'USD',
            available: true,
            imageUrl: 'https://picsum.photos/seed/fridge/800/600',
            weight: 85000,
            dimensions: { length: 700, width: 750, height: 1850 }
        });

        // PRODUCTO 8: Monitor LG UltraWide (Electrónicos)
        const lgMonitor = await Product.create({
            name: { es: 'Monitor LG UltraWide 34"', en: 'LG UltraWide 34" Monitor', pt: 'Monitor LG UltraWide 34"' },
            brand: lg._id,
            category: electronicsCategory._id,
            sku: 'LG-34UW-95',
            price: 899,
            stock: 10,
            currency: 'USD',
            available: true,
            imageUrl: 'https://picsum.photos/seed/monitor/800/600',
        });

        // PRODUCTO 9: Mouse Logitech MX Master 3S (Electrónicos)
        const logitechMouse = await Product.create({
            name: { es: 'Logitech MX Master 3S', en: 'Logitech MX Master 3S', pt: 'Logitech MX Master 3S' },
            brand: logitech._id,
            category: electronicsCategory._id,
            sku: 'LOGI-MX3S',
            price: 99,
            stock: 50,
            currency: 'USD',
            available: true,
            imageUrl: 'https://picsum.photos/seed/mouse/800/600',
        });

        // PRODUCTO 10: Sudadera Adidas Essentials (Ropa)
        const adidasHoodie = await Product.create({
            name: { es: 'Sudadera Adidas Essentials', en: 'Adidas Essentials Hoodie', pt: 'Moletom Adidas Essentials' },
            brand: adidas._id,
            category: clothingCategory._id,
            sku: 'ADI-HOOD-ESS',
            price: 65,
            stock: 30,
            currency: 'USD',
            available: true,
            imageUrl: 'https://picsum.photos/seed/adidas/800/600',
        });

        // PRODUCTO 11: Perfume Chanel No. 5 (Belleza)
        const beautyProduct = await Product.create({
            name: { es: 'Chanel No. 5', en: 'Chanel No. 5', pt: 'Chanel No. 5' },
            description: {
                es: 'La fragancia más icónica del mundo, símbolo de elegancia y sofisticación.',
                en: 'The world\'s most iconic fragrance, a symbol of elegance and sophistication.',
                pt: 'A fragrância mais icônica do mundo, símbolo de elegância e sofisticação.',
            },
            category: beautyCategory._id,
            sku: 'CHA-N5-100',
            price: 155,
            stock: 25,
            currency: 'USD',
            available: true,
            imageUrl: 'https://picsum.photos/seed/perfume/800/600',
        });

        console.log('✅ Productos creados:');
        console.log(`   - ${(galaxyS24.name as TranslatedField).es} (${galaxyS24.variants?.length || 0} variantes)`);
        console.log(`   - ${(basicTshirt.name as TranslatedField).es} (${basicTshirt.variants?.length || 0} variantes)`);
        console.log(`   - ${(dellXps15.name as TranslatedField).es} (${dellXps15.variants?.length || 0} variantes)`);
        console.log(`   - ${(iphone15.name as TranslatedField).es} (${iphone15.variants?.length || 0} variantes)`);
        console.log(`   - ${(nikeAirMax.name as TranslatedField).es} (${nikeAirMax.variants?.length || 0} variantes)`);
        console.log(`   - ${(sonyHeadphones.name as TranslatedField).es} (${sonyHeadphones.variants?.length || 0} variantes)`);
        console.log(`   - ${(whirlpoolFridge.name as TranslatedField).es} (Simple)`);
        console.log(`   - ${(lgMonitor.name as TranslatedField).es} (Simple)`);
        console.log(`   - ${(logitechMouse.name as TranslatedField).es} (Simple)`);
        console.log(`   - ${(adidasHoodie.name as TranslatedField).es} (Simple)`);
        console.log(`   - ${(beautyProduct.name as TranslatedField).es} (Simple)`);

        console.log('\n🎉 Seed completado exitosamente!');
        console.log(`   📦 ${await Product.countDocuments()} productos`);
        console.log(`   📁 ${await Category.countDocuments()} categorías`);
        console.log(`   🏷️  ${await Brand.countDocuments()} marcas`);
        console.log(`   🔖 ${await AttributeDefinition.countDocuments()} atributos`);

    } catch (error) {
        console.error('❌ Error en seed:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Desconectado de MongoDB');
    }
}

seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
