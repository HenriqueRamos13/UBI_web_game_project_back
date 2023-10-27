"use strict";
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
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const socket_io_1 = require("socket.io");
const fastifySocketIO = (0, fastify_plugin_1.default)(function (fastify, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.decorate("io", new socket_io_1.Server(fastify.server, opts));
        fastify.addHook("onClose", (fastify, done) => {
            fastify.io.close();
            done();
        });
    });
}, { fastify: ">=4.x.x", name: "fastify-socket.io" });
exports.default = fastifySocketIO;
