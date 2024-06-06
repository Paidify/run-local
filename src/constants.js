import path from "path";

export const __dirname = process.execPath.endsWith("paidify.exe")
    ? path.join(process.execPath, "..")
    : process.cwd();
export const repos = [
    {
        name: "db-bank",
        title: "db-bank",
        url: "https://github.com/Paidify/db-bank.git",
        description: "Representation of Bank's database in Paidify system",
        commands: ["docker-compose up -d"],
        order: 1
    },
    {
        name: "BankEastRepo",
        title: "BankEastRepo",
        url: "https://github.com/Paidify/BankEastRepo.git",
        description: "Representation of East Bank in the system",
        commands: ["npm start"],
        order: 2
    },
    {
        name: "db-paidify",
        title: "db-paidify",
        url: "https://github.com/Paidify/db-paidify.git",
        description:
            "Main database for Paidify system. It also includes University database schema for simplicity",
        commands: ["docker-compose up -d"],
        order: 3
    },
    {
        name: "db-monitor",
        title: "db-monitor",
        url: "https://github.com/Paidify/db-monitor.git",
        description:
            "Database to manage Paidify services for the Circuit Breaker pattern implementation",
        commands: ["docker-compose up -d"],
        order: 4
    },
    {
        name: "Authentication Service",
        title: "authentication-service",
        url: "https://github.com/Paidify/authentication-service.git",
        description: "Service for handling authentication",
        commands: ["npm start"],
        order: 5
    },
    {
        name: "Queries Service",
        title: "queries-service",
        url: "https://github.com/Paidify/queries-service.git",
        description: "Service for handling general queries",
        commands: ["npm start"],
        order: 6
    },
    {
        name: "Payment Gateway",
        title: "Payment-Gateway",
        url: "https://github.com/Paidify/Payment-Gateway.git",
        description: "Service for handling payments",
        commands: ["npm start"],
        order: 7
    },
    {
        name: "Balance Gateway",
        title: "balance-gateway",
        url: "https://github.com/Paidify/balance-gateway.git",
        description: "Service for handling balance queries",
        commands: ["npm start"],
        order: 8
    },
    {
        name: "API Gateway",
        title: "api-gateway",
        url: "https://github.com/Paidify/api-gateway.git",
        description: "Gateway for handling API requests",
        commands: ["npm start"],
        order: 9
    },
    {
        name: "Paidify Web",
        title: "paidify-web",
        url: "https://github.com/Paidify/paidify-web.git",
        description: "Client-side web application for Paidify",
        commands: ["npm start"],
        order: 10
    }
];
