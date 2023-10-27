"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const fastify_1 = __importDefault(require("fastify"));
const pino_1 = __importDefault(require("pino"));
// import { FastifyRedis } from "@fastify/redis";
const cors_1 = __importDefault(require("@fastify/cors"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const fastify_prisma_client_1 = __importDefault(require("fastify-prisma-client"));
const socket_1 = __importDefault(require("./plugins/socket"));
const serverOpts = process.env.NODE_ENV === "production"
    ? {
        // http2: true,
        // https: {
        //   allowHTTP1: true,
        //   key: fs.readFileSync(path.join(__dirname, "pem/", "key.pem")),
        //   cert: fs.readFileSync(path.join(__dirname, "pem/", "cert.pem")),
        // },
        logger: true,
    }
    : {
        logger: (0, pino_1.default)({
            level: "info",
        }),
    };
const server = (0, fastify_1.default)(serverOpts);
server.register(cors_1.default, {
    origin: process.env.NODE_ENV === "production"
        ? "https://next-rebel.surge.sh"
        : "http://localhost:3000",
    preflightContinue: true,
    credentials: true,
});
server.register(cookie_1.default, {
// secret: "my-secret", // for cookies signature
// parseOptions: {
// }     // options for parsing cookies
});
server.register(helmet_1.default, {
    global: true,
});
server.register(rate_limit_1.default, {
    max: 10000,
    timeWindow: "1 minute",
});
server.setErrorHandler(function (error, request, reply) {
    if (reply.statusCode === 429) {
        error.message = "You hit the rate limit! Slow down please!";
    }
    reply.send(error);
});
server.register(socket_1.default, {
    cors: {
        origin: "*",
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
    },
});
server.register(fastify_prisma_client_1.default);
server.register(require("./routes/v1/game"), { prefix: "/v1" });
server.register(require("./routes/v1/signup"), { prefix: "/v1" });
server.register(require("./routes/v1/auth"), { prefix: "/v1" });
server.register(require("./routes/v1/roles"), { prefix: "/v1" });
server.get("/user/:id", function (req, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        // pegar dados do usuario com id x que vem em req.params.id
        // return await
    });
});
server.decorateRequest("someProp", "hello!");
server.get("/", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { someProp } = request; // need to use declaration merging to add this prop to the request interface
    return someProp;
}));
server.get("/typedRequest", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    return request.body.test;
}));
server.get("/ping", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    server.log.info("log message");
    return "pong\n";
}));
server.get("/auth", {
    preValidation: (request, reply, done) => {
        const { username, password } = request.query;
        done(username !== "admin" ? new Error("Must be admin") : undefined); // only validate `admin` account
    },
}, (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = request.query;
    const { "h-Custom": hCustom } = request.headers;
    console.log(hCustom, username);
    return "Logged";
}));
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
    server.log.info(`Server listening at ${address}`);
});
