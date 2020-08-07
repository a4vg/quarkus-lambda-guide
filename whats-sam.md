# ¿SAM? ¿Qué es eso?

SAM (Serverless Application Model) es una herramienta de AWS CloudFormation para manejar tus aplicaciones serverless. Permite testearlas localmente, compilarlas y deployarlas.

#### Alto, ¿qué es AWS CloudFormation?
Es un servicio de AWS que permite configurar y modelar los recursos de AWS (aplicaciones, s3 buckets, lambdas, ec2 instances, etc.), es usado usualmente para manejar la infraestructura de una aplicación, controlarla y deployarla rápidamente.
Existen dos conceptos importantes en CloudFormation: **templates** y **stacks**. Los **templates** son archivos en JSON o YAML que se utilizan como plano para crear tu infraestructura, en ellos indicas qué recursos quieres crear y cómo (configuraciones, relaciones entre ellos, etc.). CloudFormation utiliza el template para crear tu infraestructura dentro de un **stack**, aquí puedes manejar todos los recursos creados a partir del template.
Más información sobre CloudFormation [aquí](https://docs.aws.amazon.com/es_es/AWSCloudFormation/latest/UserGuide/Welcome.html).

Cuando compilamos un proyecto de lambda con Quarkus, Quarkus genera un template (entre otros archivos), dándonos la opción de deployar nuestra lambda con CloudFormation. Este template es el archivo `sam.jvm.yalm` (también esta disponible la versión nativa en `sam.native.yalm`).
