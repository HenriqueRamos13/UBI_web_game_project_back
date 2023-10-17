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
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
// signup route
function default_1(fastify, opts, done) {
    fastify.post("/auth", (request, reply) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { email, password } = request.body;
        const user = yield fastify.prisma.user.findUnique({
            where: {
                email: email,
            },
            include: {
                profile: true,
            },
        });
        if (user && user.profile) {
            const isMatch = yield bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = yield jwt.sign({
                    id: user.id,
                    profileId: (_a = user.profile) === null || _a === void 0 ? void 0 : _a.id,
                }, process.env.JWT_SECRET, {
                    expiresIn: "30d",
                });
                reply.setCookie("token", token, {
                    path: "/",
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                });
                reply.code(200).send({ token });
            }
            else {
                reply.code(400).send({ message: "Invalid credentials" });
            }
        }
    }));
    fastify.get("/auth", (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const token = request.cookies.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = yield fastify.prisma.user.findUnique({
                where: {
                    id: decoded.id,
                },
            });
            if (user) {
                reply.code(200).send({ user, token });
            }
            else {
                reply.code(404).send({ message: "User not found" });
            }
        }
        else {
            reply.code(401).send({ message: "Not authorized" });
        }
    }));
    fastify.delete("/auth", (request, reply) => __awaiter(this, void 0, void 0, function* () {
        reply.setCookie("token", "", {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        reply.code(200).send({ message: "Logged out" });
    }));
    done();
}
exports.default = default_1;
