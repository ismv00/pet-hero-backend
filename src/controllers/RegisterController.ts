import bcrypt from 'bcrypt';

import { prisma } from '../libs/prisma';
import { generateToken } from '../utils/generateToken';

export const registerController =  {
  async create(req: any, res: any) {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if(!user) {
      return res.status(400).send("User not found, try again!")
    }
    if((!await bcrypt.compare(password, user.password))) {
      return res.status(400).send("Password is invalid.")
    }

    const token = generateToken(user.id, email, password) 

    return res.status(201).json({
      id: user.id,
      email: user.email,
      token
    });
  }
}