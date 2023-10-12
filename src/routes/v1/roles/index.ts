import { FastifyInstance, FastifyRequest } from "fastify";
import { Role } from "@prisma/client";

type Request = FastifyRequest<{
  Body: {
    roles: Role[];
  };
}>;
// signup route
export default function (fastify: FastifyInstance, opts: any, done: any) {
  fastify.post("/roles", async (request: Request, reply) => {
    const { roles } = request.body;

    const rolesCreated = await fastify.prisma.role.createMany({
      data: roles,
    });

    return rolesCreated;
  });

  done();
}
