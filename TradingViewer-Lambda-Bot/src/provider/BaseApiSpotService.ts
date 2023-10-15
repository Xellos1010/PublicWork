// src\provider\BaseApiSpotService.ts
import {
    CoinbasePro,
    OrderSide,
    Account,
    LimitOrder,
    OrderType,
    MarketOrder,
  } from "coinbase-pro-node";
  import config from '../config'
  
  export default class BaseApiSpotService {
    symbol: string;
    client: CoinbasePro;
  
    constructor(symbol: string) {
      this.symbol = symbol;
      // https://public.sandbox.pro.coinbase.com/profile/api
      const auth = {
        apiKey: config.coinbase.key,
        apiSecret: config.coinbase.secret,
        passphrase: config.coinbase.passphrase,
        // The Sandbox is for testing only and offers a subset of the products/assets:
        // https://docs.cloud.coinbase.com/exchange/docs#sandbox
        useSandbox: false,
      };
  
      this.client = new CoinbasePro(auth);
    }
  
    async getBalance(
      currency: string,
      workingCurrency?: string,
      currentPrice?: number
    ): Promise<{ total: number; available: number; onOrder: number }> {
      const accounts: Account[] = await this.client.rest.account.listAccounts();
      const account = accounts.find((acc) => acc.currency === currency);
  
      let onOrder = 0;
      let available = Number(account?.available || 0);
      let total = available + Number(account?.hold || 0);
  
      if (workingCurrency && currentPrice) {
        const workingAccount = accounts.find(
          (acc) => acc.currency === workingCurrency
        );
        const workingOnOrder = Number(workingAccount?.hold || 0);
        total += currentPrice * workingOnOrder;
        onOrder = workingOnOrder;
      }
  
      return { total, available, onOrder };
    }
  
    async getPrice(symbol?: string): Promise<number> {
      symbol = symbol || this.symbol;
      const ticker = await this.client.rest.product.getProductTicker(symbol);
      return Number(ticker.price);
    }
  
    async limitSell(quantity: number, price: number): Promise<unknown> {
      const order: LimitOrder = {
        product_id: this.symbol,
        side: OrderSide.SELL,
        price: price.toFixed(2),
        size: quantity.toFixed(3),
        type: OrderType.LIMIT,
        // Optional: specify time_in_force if needed, for example
        // time_in_force: TimeInForce.GTC
      };
      return this.client.rest.order.placeOrder(order);
    }
  
    async limitBuy(quantity: number, price: number): Promise<unknown> {
      const order: LimitOrder = {
        product_id: this.symbol,
        side: OrderSide.BUY,
        price: price.toFixed(2),
        size: quantity.toFixed(3),
        type: OrderType.LIMIT,
        // Optional: specify time_in_force if needed, for example
        // time_in_force: TimeInForce.GTC
      };
      return this.client.rest.order.placeOrder(order);
    }
  
    async marketSell(quantity: number): Promise<unknown> {
      const order: MarketOrder = {
        product_id: this.symbol,
        side: OrderSide.SELL,
        type: OrderType.MARKET,
        size: quantity.toFixed(5),
        // Alternatively, you can specify funds instead of size
        // funds: 'amount in your account currency'
      };
      return this.client.rest.order.placeOrder(order);
    }
  
    async marketBuy(quantity: number): Promise<unknown> {
      const roundedFunds = Math.floor(quantity * 100) / 100; // Round down to 2 decimal places
  
      const order: MarketOrder = {
        product_id: this.symbol,
        side: OrderSide.BUY,
        type: OrderType.MARKET,
        // size: quantity.toFixed(3),
        funds: roundedFunds.toFixed(2),
        // Alternatively, you can specify funds instead of size
        // funds: 'amount in your account currency'
      };
      return this.client.rest.order.placeOrder(order);
    }
  
    async checkStatus(orderId: string): Promise<string> {
      const order = await this.client.rest.order.getOrder(orderId);
      if (order === null) {
        throw new Error(`Order with ID ${orderId} not found`);
      }
      return order.status;
    }
  
    async cancelOrder(
      orderId: string | undefined
    ): Promise<unknown> {
      if (!orderId) {
        return;
      }
      return this.client.rest.order.cancelOrder(orderId);
    }
  }
  