import bcrypt from 'bcrypt';
import { prisma } from "../libs/prisma";
import { generateToken } from '../utils/generateToken';

export const userController = {
  async index(req: any, res: any ) {
    const users = await prisma.user.findMany();

    return res.status(201).json({ users });
  },

  async create(req: any, res: any, next: any) {
    const { name, email, password, phone, city, uf } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      const user = await prisma.user.create({
        data: {
          name, 
          email,
          password: hash,
          phone, 
          city,
          uf
        }
      });

      const token = generateToken(user.id, user.email, user.password)

      return res.status(201).json({
        id: user.id,
        email: user.email,
        token
      });
    } else {
      return res.status(400).send("User already exists, please use other email.")
    }

    next();
  },

}