import jwt, { verify, type JwtPayload } from 'jsonwebtoken';
import fs from 'fs';
import { secret } from '../auth/config';
import { prisma } from '../libs/prisma';
import { urlencoded } from 'express';

export const caseController = {

  async index(req: any, res: any) {
    const cases = await prisma.case.findMany()

    return res.status(201).json({ cases })
  },

  async create(req: any, res: any) {
    //Busca o token enviado na requisicao e desestrutura para obter apenas o valor
    const token = req.headers.authorization?.replace("Bearer ", "");

    // Desestrutura os dados enviados no corpo da requisicao
    const { name, description, size } = req.body;

    //Busca as imagens enviadas na requisicao
    const files = req.files;

    //Desestrutura imagem a imagem
    const imagesUrls = files.map((file:any) => file.path);

    if(token) {
      const decodedToken = jwt.verify(token, secret) as JwtPayload;
      const userId = decodedToken.id;
      console.log(userId)

      const user = await prisma.user.findUnique({
        where: {
          id: userId
        },
      });

      if (user) {
        if(token && jwt.verify(token, secret)) {
          const createdCase = await prisma.case.create({
            data: {
              name, description, size,
              imageUrl1: imagesUrls[0],
              user: {
                connect: { id: user.id}
              }
            }
          });

          return res.status(201).json({ createdCase });
        } else {
          return res.status(401).send("Invalid Token");
        }
      }
    } else {
      return res.status(401).send("user not found")
    }
  },

  async delete(req: any, res: any) {
    // Busca o id do case criado
    const { id } = req.params;
    console.log(id)
    //Busca o token enviado na requisicao e desestruturo ele
    const token = req.headers.authorization.replace("Bearer ", "");

    //Decodifico o token e pego apenas o ID dele
    const decodedToken = jwt.verify(token, secret) as JwtPayload;
    const userByToken = decodedToken.id;

    console.log(userByToken)

    try {
      if(!userByToken) {
        res.status(404).send("User not found!")
      }

      const caseId = await prisma.case.findUnique({
        where: {
          id: parseInt(id, 10),
          userId: parseInt(userByToken)
        },
      });

      console.log(caseId)

      if(!caseId || caseId?.userId !== caseId.userId) {
        res.status(404).send("Case not found")
      }


      const imagesUrls = [
        caseId?.imageUrl1
      ];

      imagesUrls.forEach((imageUrl) => {
        if(imageUrl) {
          fs.unlinkSync(imageUrl);
        }
      })

     await prisma.case.delete({
        where: {
          id: parseInt(id),
          userId: userByToken
        }
      })

      return res.status(201).send("Case delete with success!")
    } catch(error) {
      console.error(error) ;
      return res.status(500).send("Failed to delete the case.")
    }
  }
}