# CloudFormation
CloudFormation es un servicio de AWS que permite configurar y modelar los recursos de AWS (aplicaciones, s3 buckets, lambdas, ec2 instances, etc.), es usado usualmente para manejar la infraestructura de una aplicación, controlarla y deployarla rápidamente.

Existen dos conceptos importantes en CloudFormation: **templates** y **stacks**. Los **templates** son archivos en JSON o YAML que se utilizan como plano para crear tu infraestructura, en ellos indicas qué recursos quieres crear y cómo (configuraciones, relaciones entre ellos, etc.). CloudFormation utiliza el template para crear tu infraestructura dentro de un **stack**, aquí puedes manejar todos los recursos creados a partir del template.

AWS CDK y SAM son dos herramientas contruidas en base a CloudFormation, para facilitar la creación de tu infraestructura.

Más información sobre CloudFormation [aquí](https://docs.aws.amazon.com/es_es/AWSCloudFormation/latest/UserGuide/Welcome.html).

## [AWS CDK](https://docs.aws.amazon.com/it_it/cdk/latest/guide/home.html)
AWS Cloud Development Kit permite crear una infraestructura "programáticamente", es decir con código en lenguajes ya conocidos como C#, F#, Java, Javascript, Python o Typescript. Permite crear recursos con estos lenguajes, entre ellos lambdas y pipelines, y sintetizarlos a un template (con `cdk synth`), que luego será utilizado por CloudFormation para materializar la infraestructura. Puede ser usado junto con el SAM CLI para testear la aplicación localmente.

Para más información, click [aquí](https://docs.aws.amazon.com/it_it/cdk/latest/guide/home.html).

<img src=https://docs.aws.amazon.com/it_it/cdk/latest/guide/images/AppStacks.png width=700px>

## [SAM CLI](https://docs.aws.amazon.com/it_it/cdk/latest/guide/sam.html)
SAM CLI (Serverless Application Model Command Line Interface) es una herramienta de AWS CloudFormation para manejar tus aplicaciones serverless. Permite compilarlas y deployarlas, al igual que AWS CDK, pero su principal función es testearlas localmente. Para funcionar necesita un template en formato `YAML` o `JSON` que defina nuestros recursos y cómo estarán configurados. Podemos escribir este template desde cero o, si hemos construido nuestra infraestructura con AWS CDK, generarla con `cdk synth`. Para AWS CDK con SAM CLI, click [aquí](https://docs.aws.amazon.com/it_it/cdk/latest/guide/sam.html).

Cuando compilamos un proyecto de lambda con Quarkus, Quarkus genera un template (entre otros archivos), dándonos la opción de deployar nuestra lambda con CloudFormation. Este template es el archivo `sam.jvm.yalm` (también esta disponible la versión nativa en `sam.native.yalm`).
