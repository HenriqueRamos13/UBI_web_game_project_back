import { FastifyInstance, FastifyRequest } from "fastify";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

type Request = FastifyRequest<{
  Body: {
    email: string;
    password: string;
  };
}>;
// signup route
export default function (fastify: FastifyInstance, opts: any, done: any) {
  fastify.post("/auth", async (request: Request, reply) => {
    const { email, password } = request.body;

    const user = await fastify.prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        profile: true,
      },
    });

    if (user && user.profile) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const token = await jwt.sign(
          {
            id: user.id,
            profileId: user.profile?.id,
          },
          process.env.JWT_SECRET!,
          {
            expiresIn: "30d",
          }
        );

        reply.setCookie("token", token, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        reply.code(200).send({ token });
      } else {
        reply.code(400).send({ message: "Invalid credentials" });
      }
    }
  });

  fastify.get("/auth", async (request: Request, reply) => {
    const token = request.cookies.token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);

      const user = await fastify.prisma.user.findUnique({
        where: {
          id: (decoded as any).id,
        },
      });

      if (user) {
        reply.code(200).send({ user, token });
      } else {
        reply.code(404).send({ message: "User not found" });
      }
    } else {
      reply.code(401).send({ message: "Not authorized" });
    }
  });

  fastify.delete("/auth", async (request: Request, reply) => {
    reply.setCookie("token", "", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    reply.code(200).send({ message: "Logged out" });
  });

  done();
}
