import swaggerJsdoc from 'swagger-jsdoc';

import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'inDicaPraia API Documentation',
      version: '1.0.0',
      description: 'Documentação automática das APIs do projeto inDicaPraia',
    },
    servers: [
      {
        url: '/',
        description: 'Servidor Atual',
      },
    ],
  },
  // Usa caminho absoluto para garantir que o swagger-jsdoc encontre os arquivos em produção
  apis: [path.join(process.cwd(), 'app/api/**/*.ts')],
};

export const swaggerSpec = swaggerJsdoc(options);
