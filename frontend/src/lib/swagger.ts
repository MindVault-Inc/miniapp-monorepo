import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api', // Path to API folder
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'MindVault API Documentation',
        version: '1.0.0',
        description: 'API documentation for MindVault application',
      },
    //   components: {
    //     securitySchemes: {
    //       BearerAuth: {
    //         type: 'http',
    //         scheme: 'bearer',
    //         bearerFormat: 'JWT',
    //       },
    //     },
    //   },
      security: [],
    },
  });
  return spec;
}; 