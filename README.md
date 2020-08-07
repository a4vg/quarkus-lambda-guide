# AWS Lambda con Quarkus

## Index
1. [Deployar Lambda con Quarkus (sin API)](simple-lambda/simple-lambda.md)

## Requerimientos previos
### Para [Quarkus](https://quarkus.io/get-started/)
* [Java JDK 8 o 11+](https://adoptopenjdk.net/)
* [Maven v3.6.2+](https://maven.apache.org/): Para manejar el proyecto de Quarkus

### Para [AWS](https://cicd.serverlessworkshops.io/setup.html)
Puedes utilizar [AWS Cloud9](https://aws.amazon.com/cloud9/)

O... si deseas realizar los proyectos en local:
* [Docker](https://www.docker.com/products/docker-desktop): Para simular el ambiente de Lambda
* [SAM CLI v0.31.0+](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html): Testear las funciones lambda localmente, compilar y deployar aplicaciones SAM. Para más información sobre SAM, [click aquí](whats-sam.md)
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html): Manejar los recursos de tu cuenta de AWS. Crear roles, deployar, editar, recuperar, etc.

Recuerda configurar AWS CLI con las credenciales de tu cuenta de AWS. Utiliza `aws configure`. Más info [aquí](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)
