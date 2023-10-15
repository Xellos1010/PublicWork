// src\config\index.ts
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.DYNAMODB_HOLD_TABLE);
console.log(process.env.DYNAMODB_SETTING_TABLE);
console.log(process.env.DYNAMODB_STRATEGY_TABLE);

export default {
    tables: {
        hold: process.env.DYNAMODB_HOLD_TABLE as string,
        setting: process.env.DYNAMODB_SETTING_TABLE as string,
        strategy: process.env.DYNAMODB_STRATEGY_TABLE as string,
    },
    binance: {
        key: process.env.BINANCE_API_KEY as string,
        secret: process.env.BINANCE_API_SECRET as string
    },
    coinbase: {
        key: process.env.COINBASE_API_KEY as string,
        secret: process.env.COINBASE_API_SECRET as string,
        passphrase: process.env.COINBASE_API_PASSPHRASE as string
    },
    strategy: {
        type: 'most',
        asset: 'BTC',
        currency: 'USD',
        defaultSetting: {isReuseHold: true, riskPercent: 0.05, minAmountUSD: 11}
    },
    user: {
        email: 'admin@admin.com'
    },
    cognito: {
        userPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        clientId: process.env.AWS_COGNITO_APP_CLIENT_ID,
        region: process.env.AWS_COGNITO_REGION,
    }
}