const servicesGlobalEnv = {
    "db-bank": {
        PORT: 4401,
        MONGODB_URI_EAST_BANK: "mongodb://admin:password@localhost:4401/east_bank?authSource=admin",
        MONGODB_URI_WESTERN_BANK: "mongodb://admin:password@localhost:4401/western_bank?authSource=admin"
    },
    BankEastRepo: {
        PORT: 4402,
        HOST: "http://localhost:4402"
    },
    BankWesternRepo: {
        PORT: 4403,
        HOST: "http://localhost:4403"
    },
    "db-paidify": {
        HOST: "localhost",
        PORT: 4404,
        SSL_CA: undefined,
        PAIDIFY_SCHEMA: "paidify",
        UNIV_SCHEMA: "univ",
        USER_AUTH: "auth",
        PASSWORD_AUTH: "auth@paidify",
        USER_QUERIES: "queries",
        PASSWORD_QUERIES: "queries@paidify",
        USER_BALANCE_GATEWAY: "balance_gateway",
        PASSWORD_BALANCE_GATEWAY: "balance_gateway@paidify",
        USER_PAYMENT_GATEWAY: "payment_gateway",
        PASSWORD_PAYMENT_GATEWAY: "payment_gateway@paidify"
    },
    "db-monitor": {
        HOST: "localhost",
        PORT: 4405,
        SSL_CA: undefined,
        MONITOR_SCHEMA: "monitor",
        USER_API_GATEWAY: "api_gateway",
        PASSWORD_API_GATEWAY: "api_gateway@paidify"
    },
    "api-gateway": {
        HOST: "http://localhost:4410",
        PORT: 4410
    },
    "authentication-service": {
        HOST: "http://localhost:4406",
        PORT: 4406
    },
    "queries-service": {
        HOST: "http://localhost:4407",
        PORT: 4407
    },
    "Payment-Gateway": {
        HOST: "http://localhost:4408",
        PORT: 4408
    },
    "balance-gateway": {
        HOST: "http://localhost:4409",
        PORT: 4409
    },
    "paidify-web": {
        HOST: "http://localhost:4400",
        PORT: 4400
    },
    shared: {
        JWT_SECRET:
            "OKjiK1MkhAuKQW9uBK7g5xGOksU2ZtBUxz0FSGdxkHH6aKyeLS44/VNuuiR6vgtM1mwduhCBALBgqV5a3dYW6EL3oBDzlwcKbusaM4qA2waeylgEBZJ9nfrAMD2K2eU2yLqPalj+UvsIt7mMFfHT3aPB18H0ey8hJ6jt4puh4YmFDiJTbt0ecWJdouzCWHMUD4CfGXLGq/LxYiM7UO+nZQ=="
    }
};

export const services = [
    {
        title: "db-bank",
        repoUrl: "https://github.com/Paidify/db-bank.git",
        description: "Representation of Bank's database in Paidify system",
        commands: ["docker-compose up"],
        order: 1,
        env: {
            PORT: servicesGlobalEnv["db-bank"].PORT
        }
    },
    {
        title: "BankEastRepo",
        repoUrl: "https://github.com/Paidify/BankEastRepo.git",
        description: "Representation of East Bank in the system",
        commands: ["npm install", "npm start"],
        order: 2,
        env: {
            MONGODB_URI: servicesGlobalEnv["db-bank"].MONGODB_URI_EAST_BANK,
            PORT: servicesGlobalEnv.BankEastRepo.PORT,
            TERMINAL_TITLE: "API - Bank East"
        }
    },
    {
        title: "BankWesternRepo",
        repoUrl: "https://github.com/Paidify/BankEastRepo.git",
        description: "Representation of Western Bank in the system",
        commands: ["npm install", "npm start"],
        order: 3,
        env: {
            MONGODB_URI: servicesGlobalEnv["db-bank"].MONGODB_URI_WESTERN_BANK,
            PORT: servicesGlobalEnv.BankWesternRepo.PORT,
            TERMINAL_TITLE: "API - Bank Western"
        }
    },
    {
        title: "db-paidify",
        repoUrl: "https://github.com/Paidify/db-paidify.git",
        description:
            "Main database for Paidify system. It also includes University database schema for simplicity",
        commands: ["docker-compose up"],
        order: 4,
        env: {
            PORT: servicesGlobalEnv["db-paidify"].PORT
        }
    },
    {
        title: "db-monitor",
        repoUrl: "https://github.com/Paidify/db-monitor.git",
        description:
            "Database to manage Paidify services for the Circuit Breaker pattern implementation",
        commands: ["docker-compose up"],
        order: 5,
        env: {
            PORT: servicesGlobalEnv["db-monitor"].PORT
        }
    },
    {
        title: "api-gateway",
        repoUrl: "https://github.com/Paidify/api-gateway.git",
        description: "Gateway for handling API requests",
        commands: ["npm install", "npm start"],
        order: 6,
        env: {
            PORT: servicesGlobalEnv["api-gateway"].PORT,
            NODE_ENV: "production",

            // db
            DB_HOST: servicesGlobalEnv["db-monitor"].HOST,
            DB_PORT: servicesGlobalEnv["db-monitor"].PORT,
            DB_USER: servicesGlobalEnv["db-monitor"].USER_API_GATEWAY,
            DB_PASSWORD: servicesGlobalEnv["db-monitor"].PASSWORD_API_GATEWAY,
            DB_MONITOR_SCHEMA: servicesGlobalEnv["db-monitor"].MONITOR_SCHEMA,

            // other
            TERMINAL_TITLE: "API Gateway"
        }
    },
    {
        title: "authentication-service",
        repoUrl: "https://github.com/Paidify/authentication-service.git",
        description: "Service for handling authentication",
        commands: ["npm install", "npm start"],
        order: 7,
        env: {
            HOST: servicesGlobalEnv["authentication-service"].HOST,
            PORT: servicesGlobalEnv["authentication-service"].PORT,
            NODE_ENV: "production",

            // api gateway
            API_GATEWAY_URL: servicesGlobalEnv["api-gateway"].HOST,

            // db
            DB_HOST: servicesGlobalEnv["db-paidify"].HOST,
            DB_PORT: servicesGlobalEnv["db-paidify"].PORT,
            DB_SSL_CA: servicesGlobalEnv["db-paidify"].SSL_CA,
            DB_USER: servicesGlobalEnv["db-paidify"].USER_AUTH,
            DB_PASSWORD: servicesGlobalEnv["db-paidify"].PASSWORD_AUTH,
            DB_PAIDIFY_SCHEMA: servicesGlobalEnv["db-paidify"].PAIDIFY_SCHEMA,
            DB_UNIV_SCHEMA: servicesGlobalEnv["db-paidify"].UNIV_SCHEMA,

            // Rijndael - Comfortable numb
            JWT_SECRET: servicesGlobalEnv.shared.JWT_SECRET,

            // other
            TERMINAL_TITLE: "Authentication Service"
        }
    },
    {
        title: "queries-service",
        repoUrl: "https://github.com/Paidify/queries-service.git",
        description: "Service for handling general queries",
        commands: ["npm install", "npm start"],
        order: 8,
        env: {
            HOST: servicesGlobalEnv["queries-service"].HOST,
            PORT: servicesGlobalEnv["queries-service"].PORT,
            NODE_ENV: "production",

            // api gateway
            API_GATEWAY_URL: servicesGlobalEnv["api-gateway"].HOST,

            // db
            DB_HOST: servicesGlobalEnv["db-paidify"].HOST,
            DB_PORT: servicesGlobalEnv["db-paidify"].PORT,
            DB_SSL_CA: servicesGlobalEnv["db-paidify"].SSL_CA,
            DB_USER: servicesGlobalEnv["db-paidify"].USER_QUERIES,
            DB_PASSWORD: servicesGlobalEnv["db-paidify"].PASSWORD_QUERIES,
            DB_PAIDIFY_SCHEMA: servicesGlobalEnv["db-paidify"].PAIDIFY_SCHEMA,
            DB_UNIV_SCHEMA: servicesGlobalEnv["db-paidify"].UNIV_SCHEMA,

            // banks endpoints
            WESTERN_BANK_API_ENDPOINT: `${servicesGlobalEnv["BankWesternRepo"].HOST}/checkvalidcard`,
            EAST_BANK_API_ENDPOINT: `${servicesGlobalEnv["BankEastRepo"].HOST}/checkvalidcard`,

            // Rijndael - Comfortable numb
            JWT_SECRET: servicesGlobalEnv.shared.JWT_SECRET,

            // other
            TERMINAL_TITLE: "Queries Service"
        }
    },
    {
        title: "Payment-Gateway",
        repoUrl: "https://github.com/Paidify/Payment-Gateway.git",
        description: "Service for handling payments",
        commands: ["npm install", "npm start"],
        order: 9,
        env: {
            HOST: servicesGlobalEnv["Payment-Gateway"].HOST,
            PORT: servicesGlobalEnv["Payment-Gateway"].PORT,
            NODE_ENV: "production",

            // api gateway
            API_GATEWAY_URL: servicesGlobalEnv["api-gateway"].HOST,

            // db
            DB_HOST: servicesGlobalEnv["db-paidify"].HOST,
            DB_PORT: servicesGlobalEnv["db-paidify"].PORT,
            DB_SSL_CA: servicesGlobalEnv["db-paidify"].SSL_CA,
            DB_USER: servicesGlobalEnv["db-paidify"].USER_PAYMENT_GATEWAY,
            DB_PASSWORD:
                servicesGlobalEnv["db-paidify"].PASSWORD_PAYMENT_GATEWAY,
            DB_PAIDIFY_SCHEMA: servicesGlobalEnv["db-paidify"].PAIDIFY_SCHEMA,
            DB_UNIV_SCHEMA: servicesGlobalEnv["db-paidify"].UNIV_SCHEMA,

            // banks endpoints
            WESTERN_BANK_API_ENDPOINT: `${servicesGlobalEnv["BankWesternRepo"].HOST}/makepay`,
            EAST_BANK_API_ENDPOINT: `${servicesGlobalEnv["BankEastRepo"].HOST}/makepay`,

            // mail
            MAIL_HOST: "smtp.gmail.com",
            MAIL_PORT: 465,
            MAIL_USER: "paidifyproject@gmail.com",
            MAIL_PASSWORD: "password",

            // Rijndael - Comfortable numb
            JWT_SECRET: servicesGlobalEnv.shared.JWT_SECRET,

            // other
            TERMINAL_TITLE: "Payment Gateway"
        }
    },
    {
        title: "balance-gateway",
        repoUrl: "https://github.com/Paidify/balance-gateway.git",
        description: "Service for handling balance queries",
        commands: ["npm install", "npm start"],
        order: 10,
        env: {
            HOST: servicesGlobalEnv["balance-gateway"].HOST,
            PORT: servicesGlobalEnv["balance-gateway"].PORT,
            NODE_ENV: "production",

            // api gateway
            API_GATEWAY_URL: servicesGlobalEnv["api-gateway"].HOST,

            // db
            DB_HOST: servicesGlobalEnv["db-paidify"].HOST,
            DB_PORT: servicesGlobalEnv["db-paidify"].PORT,
            DB_SSL_CA: servicesGlobalEnv["db-paidify"].SSL_CA,
            DB_USER: servicesGlobalEnv["db-paidify"].USER_BALANCE_GATEWAY,
            DB_PASSWORD:
                servicesGlobalEnv["db-paidify"].PASSWORD_BALANCE_GATEWAY,
            DB_PAIDIFY_SCHEMA: servicesGlobalEnv["db-paidify"].PAIDIFY_SCHEMA,
            DB_UNIV_SCHEMA: servicesGlobalEnv["db-paidify"].UNIV_SCHEMA,

            // banks endpoints
            WESTERN_BANK_API_ENDPOINT: `${servicesGlobalEnv["BankWesternRepo"].HOST}/checkbalance`,
            EAST_BANK_API_ENDPOINT: `${servicesGlobalEnv["BankEastRepo"].HOST}/checkbalance`,

            // Rijndael - Comfortable numb
            JWT_SECRET: servicesGlobalEnv.shared.JWT_SECRET,

            // other
            TERMINAL_TITLE: "Balance Gateway"
        }
    },
    {
        title: "paidify-web",
        repoUrl: "https://github.com/Paidify/paidify-web.git",
        description: "Client-side web application for Paidify",
        commands: [
            "npm install",
            "npm run build",
            `npx next start -p ${servicesGlobalEnv["paidify-web"].PORT}`
        ],
        order: 11,
        env: {
            NEXT_PUBLIC_API_URL: `${servicesGlobalEnv["api-gateway"].HOST}/v1`
        }
    }
];

process.title = "Paidify - run local";
