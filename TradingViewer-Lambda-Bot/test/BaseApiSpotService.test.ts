// test\BaseApiSpotService.test.ts
import BaseApiSpotService from '../src//provider/BaseApiSpotService';
import { Account } from 'coinbase-pro-node';

const listAccounts = jest.fn();
const getProductTicker = jest.fn();
const placeOrder = jest.fn();
const getOrder = jest.fn();
const cancelOrder = jest.fn();

jest.mock('coinbase-pro-node', () => {
  return {
    CoinbasePro: jest.fn().mockImplementation(() => {
      return {
        rest: {
          account: { listAccounts },
          product: { getProductTicker },
          order: { placeOrder, getOrder, cancelOrder },
        },
      };
    }),
    OrderSide: {
      SELL: 'sell',
      BUY: 'buy',
    },
    OrderType: {
      LIMIT : "limit",
      MARKET : "market"
  }
  };
});

const mockAccounts: Account[] = [
  { id: '1', currency: 'USD', balance: '1000', available: '900', hold: '100', profile_id: 'profile1' },
  { id: '2', currency: 'BTC', balance: '5', available: '4', hold: '1', profile_id: 'profile1' }
];

describe('BaseApiSpotService', () => {
    let service: BaseApiSpotService;
  
    beforeEach(() => {
      service = new BaseApiSpotService('BTC-USD'); // Initialize the service here
  
      listAccounts.mockResolvedValue(mockAccounts);
      getProductTicker.mockResolvedValue({ price: '50000.00' });
      placeOrder.mockResolvedValue({ id: 'order1' });
      getOrder.mockResolvedValue({ id: 'order1', status: 'done' });
      cancelOrder.mockResolvedValue(null);
    });

  it('should get balance', async () => {
    const balance = await service.getBalance('USD');
    expect(balance).toEqual({ total: 1000, available: 900, onOrder: 0 });
  });

  it('should get price', async () => {
    const price = await service.getPrice();
    expect(price).toEqual(50000);
  });

  it('should limit sell', async () => {
    const result = await service.limitSell(0.5, 50000);
    expect(result).toEqual({ id: 'order1' });
  });

  it('should limit buy', async () => {
    const result = await service.limitBuy(0.5, 50000);
    expect(result).toEqual({ id: 'order1' });
  });

  it('should market sell', async () => {
    const result = await service.marketSell(0.5);
    expect(result).toEqual({ id: 'order1' });
  });

  it('should market buy', async () => {
    const result = await service.marketBuy(0.5);
    expect(result).toEqual({ id: 'order1' });
  });

  it('should check status', async () => {
    const status = await service.checkStatus('order1');
    expect(status).toEqual('done');
  });

  it('should cancel order', async () => {
    const result = await service.cancelOrder('order1');
    expect(result).toBeNull();
  });
});
