import swaggerJsdoc from 'swagger-jsdoc';

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
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        description: 'Servidor Local',
      },
    ],
  },
  apis: ['./app/api/**/*.ts'], // Busca os comentários JSDoc nos arquivos de rota
};

export const swaggerSpec = swaggerJsdoc(options);
