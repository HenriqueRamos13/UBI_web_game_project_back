import * as dotenv from "dotenv";
dotenv.config();
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import path from "path";
import fs from "fs";
import pino from "pino";
// import { FastifyRedis } from "@fastify/redis";
import cors from "@fastify/cors";
import type { FastifyCookieOptions } from "@fastify/cookie";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import ws from "fastify-socket.io";
import fastifyPrismaClient from "fastify-prisma-client";
import fastifySocketIO from "./plugins/socket";
import { Server } from "socket.io";

// if (!process.env.MONGO_URI) {
//   console.log("MONGO_URI must be defined");
//   process.exit(1);
// }

interface IQuerystring {
  username: string;
  password: string;
}

interface IHeaders {
  "h-Custom": string;
}

const serverOpts =
  process.env.NODE_ENV === "production"
    ? {
        http2: true,
        https: {
          allowHTTP1: true,
          key: fs.readFileSync(path.join(__dirname, "pem/", "key.pem")),
          cert: fs.readFileSync(path.join(__dirname, "pem/", "cert.pem")),
        },
      }
    : {
        logger: pino({
          level: "info",
        }),
      };

const server = fastify(serverOpts);

server.register(cors, {
  origin: "*",
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
    skipMiddlewares: true
  }
});

server.register(fastifyPrismaClient);

server.register(require("./routes/v1/game"), { prefix: "/v1" });

server.get<{
  Params: {
    id: string;
  };
}>("/user/:id", async function (req, reply) {
    // pegar dados do usuario com id x que vem em req.params.id
    // return await 
});

server.decorateRequest("someProp", "hello!");

server.get("/", async (request, reply) => {
  const { someProp } = request; // need to use declaration merging to add this prop to the request interface
  return someProp;
});

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

server.listen({ port: 3001 }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});

declare module "fastify" {
  interface FastifyInstance {
    // redis: FastifyRedis;
    io: Server;
  }
  interface FastifyRequest {
    // you must reference the interface and not the type
    someProp: string;
  }
}