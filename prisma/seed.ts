import { PrismaClient, MovementType, Product } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Create users
  const password = await bcrypt.hash('password123', 10);

  await prisma.user.createMany({
    data: [
      { email: 'admin@stockpilot.com', password, role: 'ADMIN' },
      { email: 'staff@stockpilot.com', password, role: 'STAFF' },
    ],
  });

  console.log('✅ Users seeded');

  // 2. Create suppliers
  const suppliers = await Promise.all(
    [
      { name: 'TechSource Ltd', email: 'sales@techsource.com', phone: '+1-555-0101' },
      { name: 'Global Goods Inc', email: 'orders@globalgoods.com', phone: '+1-555-0102' },
      { name: 'Prime Supplies Co', email: 'info@primesupplies.com', phone: '+1-555-0103' },
      { name: 'QuickShip Wholesale', email: 'support@quickship.com', phone: '+1-555-0104' },
    ].map((s) => prisma.supplier.create({ data: s })),
  );

  console.log('✅ Suppliers seeded');

  // 3. Create products linked to suppliers
  const products: Product[] = [];

  for (let i = 0; i < 30; i++) {
    const supplier = suppliers[i % suppliers.length];
    const product = await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        sku: faker.string.alphanumeric(8).toUpperCase(),
        price: Number(faker.commerce.price({ min: 5, max: 100 })),
        stock: faker.number.int({ min: 50, max: 200 }),
        threshold: 10,
        supplierId: supplier.id,
      },
    });

    products.push(product);
  }

  console.log('✅ Products seeded');

  // 4. Create orders across last 60 days with realistic growth pattern
  const days = 60;

  for (let d = 0; d < days; d++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - d));
    date.setHours(
      faker.number.int({ min: 8, max: 20 }),
      faker.number.int({ min: 0, max: 59 }),
      0,
      0,
    );

    // Growth factor: more orders as days progress
    const baseOrders = 3 + Math.floor(d / 5);
    // Weekend dip: fewer orders on Sat/Sun
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const weekendFactor = isWeekend ? -2 : 0;
    const ordersToday = Math.max(
      1,
      baseOrders + weekendFactor + faker.number.int({ min: 0, max: 3 }),
    );

    for (let i = 0; i < ordersToday; i++) {
      // Spread order timestamps throughout the day
      const orderDate = new Date(date);
      orderDate.setHours(
        faker.number.int({ min: 8, max: 20 }),
        faker.number.int({ min: 0, max: 59 }),
        faker.number.int({ min: 0, max: 59 }),
      );

      const order = await prisma.order.create({
        data: {
          total: 0,
          createdAt: orderDate,
        },
      });

      let total = 0;
      const itemsCount = faker.number.int({ min: 1, max: 4 });

      for (let j = 0; j < itemsCount; j++) {
        // Bias toward top 5 products (60% chance)
        const product =
          Math.random() < 0.6
            ? products[Math.floor(Math.random() * 5)]
            : products[Math.floor(Math.random() * products.length)];

        const quantity = faker.number.int({ min: 1, max: 3 });
        total += product.price * quantity;

        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity,
            price: product.price,
          },
        });

        await prisma.stockMovement.create({
          data: {
            productId: product.id,
            type: MovementType.SALE,
            quantity: -quantity,
            createdAt: orderDate,
          },
        });
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { total: Math.round(total * 100) / 100 },
      });
    }
  }

  console.log('✅ Orders seeded');

  // 5. Add restock movements for realism
  for (const product of products.slice(0, 10)) {
    const restockDate = new Date();
    restockDate.setDate(restockDate.getDate() - faker.number.int({ min: 5, max: 30 }));

    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: MovementType.RESTOCK,
        quantity: faker.number.int({ min: 20, max: 100 }),
        createdAt: restockDate,
      },
    });
  }

  console.log('✅ Stock movements seeded');

  // 6. Create purchase orders
  for (const supplier of suppliers) {
    const supplierProducts = products.filter((p) => p.supplierId === supplier.id);

    const po = await prisma.purchaseOrder.create({
      data: {
        supplierId: supplier.id,
        status: 'RECEIVED',
        createdAt: new Date(Date.now() - faker.number.int({ min: 5, max: 20 }) * 86400000),
      },
    });

    for (const product of supplierProducts.slice(0, 3)) {
      await prisma.purchaseOrderItem.create({
        data: {
          purchaseOrderId: po.id,
          productId: product.id,
          quantity: faker.number.int({ min: 10, max: 50 }),
        },
      });
    }
  }

  // One pending purchase order
  const pendingPo = await prisma.purchaseOrder.create({
    data: {
      supplierId: suppliers[0].id,
      status: 'PENDING',
    },
  });

  await prisma.purchaseOrderItem.create({
    data: {
      purchaseOrderId: pendingPo.id,
      productId: products[0].id,
      quantity: 25,
    },
  });

  console.log('✅ Purchase orders seeded');

  console.log('🌱 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
