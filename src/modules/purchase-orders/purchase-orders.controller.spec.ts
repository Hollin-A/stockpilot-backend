import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';

const mockPurchaseOrdersService = { createPurchaseOrder: jest.fn(), receivePurchaseOrder: jest.fn() };

describe('PurchaseOrdersController', () => {
  let controller: PurchaseOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrdersController],
      providers: [{ provide: PurchaseOrdersService, useValue: mockPurchaseOrdersService }],
    }).compile();

    controller = module.get<PurchaseOrdersController>(PurchaseOrdersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
