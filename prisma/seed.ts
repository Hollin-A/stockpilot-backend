import { PrismaClient, MovementType, Product } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // 1. Create products
  const products: Product[] = [];

  for (let i = 0; i < 30; i++) {
    const product = await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        sku: faker.string.alphanumeric(8),
        price: Number(faker.commerce.price({ min: 5, max: 100 })),
        stock: faker.number.int({ min: 50, max: 200 }),
        threshold: 10,
      },
    });

    products.push(product);
  }

  // 2. Create orders across multiple days
  for (let i = 0; i < 200; i++) {
    const randomDate = faker.date.past({ years: 1 });

    const order = await prisma.order.create({
      data: {
        total: 0,
        createdAt: randomDate,
      },
    });

    let total = 0;

    const itemsCount = faker.number.int({ min: 1, max: 5 });

    for (let j = 0; j < itemsCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = faker.number.int({ min: 1, max: 5 });

      total += product.price * quantity;

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity,
          price: product.price,
        },
      });

      // stock movement
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: MovementType.SALE,
          quantity: -quantity,
          createdAt: randomDate,
        },
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { total },
    });
  }

  console.log('🌱 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
