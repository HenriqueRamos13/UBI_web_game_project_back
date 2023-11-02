import * as dotenv from "dotenv";
dotenv.config();
import fastify, {
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
} from "fastify";
import path from "node:path";
import fs from "fs";
import pino from "pino";
import cors from "@fastify/cors";
import type { FastifyCookieOptions } from "@fastify/cookie";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import ws from "fastify-socket.io";
import fastifyPrismaClient from "fastify-prisma-client";
import fastifySocketIO from "./plugins/socket";
import { Server } from "socket.io";

interface IQuerystring {
  username: string;
  password: string;
}

interface IHeaders {
  "h-Custom": string;
}

const serverOpts: FastifyServerOptions =
  process.env.NODE_ENV === "production"
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
        logger: pino({
          level: "info",
        }),
      };

const server = fastify(serverOpts);

server.register(cors, {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://next-rebel.surge.sh"
      : "http://localhost:3000",
  preflightContinue: true,
  credentials: true,
});

server.register(cookie, {
  // secret: "my-secret", // for cookies signature
  // parseOptions: {
  // }     // options for parsing cookies
} as FastifyCookieOptions);

server.register(helmet, {
  global: true,
});

server.register(rateLimit, {
  max: 10000,
  timeWindow: "1 minute",
});
server.setErrorHandler(function (error, request, reply) {
  if (reply.statusCode === 429) {
    error.message = "You hit the rate limit! Slow down please!";
  }
  reply.send(error);
});

server.register(fastifySocketIO, {
  cors: {
    origin: "*",
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // defaults to 2 minutes
    skipMiddlewares: true,
  },
});

server.register(fastifyPrismaClient);

server.register(require("./routes/v1/game"), { prefix: "/v1" });
server.register(require("./routes/v1/signup"), { prefix: "/v1" });
server.register(require("./routes/v1/auth"), { prefix: "/v1" });
server.register(require("./routes/v1/roles"), { prefix: "/v1" });

server.get<{
  Params: {
    id: string;
  };
}>("/user/:id", async function (req, reply) {
  // pegar dados do usuario com id x que vem em req.params.id
  // return await
});

// server.get("/", async (request, reply) => {});

type CustomRequest = FastifyRequest<{
  Body: { test: boolean };
}>;
server.get(
  "/typedRequest",
  async (request: CustomRequest, reply: FastifyReply) => {
    return request.body.test;
  }
);

server.get("/ping", async (request, reply) => {
  server.log.info("log message");
  return "pong\n";
});

server.get<{
  Querystring: IQuerystring;
  Headers: IHeaders;
}>(
  "/auth",
  {
    preValidation: (request, reply, done) => {
      const { username, password } = request.query;
      done(username !== "admin" ? new Error("Must be admin") : undefined); // only validate `admin` account
    },
  },
  async (request, reply) => {
    const { username, password } = request.query;
    const { "h-Custom": hCustom } = request.headers;

    console.log(hCustom, username);

    return "Logged";
  }
);

const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3001;

server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});

declare module "fastify" {
  interface FastifyInstance {
    io: Server;
  }
  interface FastifyRequest {
    someProp: string;
  }
}
