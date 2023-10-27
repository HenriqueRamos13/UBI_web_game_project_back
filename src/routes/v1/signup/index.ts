import { FastifyInstance, FastifyRequest } from "fastify";
import * as bcrypt from "bcrypt";

type Request = FastifyRequest<{
  Body: {
    email: string;
    password: string;
    name: string;
    gender: string;
  };
}>;
// signup route
export default function (fastify: FastifyInstance, opts: any, done: any) {
  fastify.post("/signup", async (request: Request, reply) => {
    const { email, password, name, gender } = request.body;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await fastify.prisma.user.create({
      data: {
        email: email,
        password: hash,
        profile: {
          create: {
            xp: 0,
            gender,
            name,
          },
        },
      },
    });

    // return status 200 or 400
    if (user) {
      reply.code(200).send({ message: "User created successfully" });
    } else {
      reply.code(400).send({ message: "User not created" });
    }
  });

  done();
}
