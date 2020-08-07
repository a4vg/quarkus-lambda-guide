# Deployar Lambda con Quarkus (sin API)
## Objetivo
Deployar manualmente, con la consola o por la interfaz de AWS, una función lambda simple con Quarkus. 

## Contenido
1. [Antes de empezar](#Antes-de-empezar)
2. [Crear el proyecto](#Crear-el-proyecto)
3. [Examinando el proyecto](#Examinando-el-proyecto)
4. [Testear en local](#Testear-en-local)
5. [Compilar el proyecto](#Compilar-el-proyecto)
6. [Deploy](#Deploy)
  6.1. [En consola](#En-consola)
  6.2 [En la interfaz web de Amazon](#En-la-interfaz-web-de-Amazon)
7. [Testear la lambda deployada](#Testear-la-lambda-deployada)
8. [Links](#Links)



## 1. Antes de empezar
Recuerda instalar y configurar los [requerimientos](../README.md).


## 2. Crear el proyecto
Generar proyecto de Quarkus con el siguiente comando. Nótese que usa la extensión `quarkus-amazon-lambda`.
Pedirá un group id y artifact id, este último será el nombre de la carpeta creada.
```bash
mvn archetype:generate \
       -DarchetypeGroupId=io.quarkus \
       -DarchetypeArtifactId=quarkus-amazon-lambda-archetype \
       -DarchetypeVersion=1.6.1.Final
```
![](attachment/Clipboard_2020-08-06-14-10-50.png)

> Nota: También puede hacerse desde https://code.quarkus.io/ seleccionando AWS Lambda.
![](attachment/Clipboard_2020-08-06-13-47-02.png)

## 3. Examinando el proyecto
El proyecto contiene tres lambdas: `TestLambda`, `StreamLambda` y `UnusedLambda` que serán empaquetadas al compilarse. En este proyecto las últimas dos no son usadas, pueden borrarse si deseas.

Algunos datos sobre lambdas en Quarkus:
* Quarkus considera una clase una lambda cuando implementa la interfaz `RequestHandler<?, ?>` o `RequestStreamHandler` (se explicará después).
* Debes tener al menos una lambda en el proyecto, si no lanza error.
* Si tienes más de una lambda, solo una puede ser el _lambda handler_ (lambda principal que recibe el input inicial y devuelve el output final). El _handler_ es indicado en `application.properties` (en `src/main/resources`). Si no indicas el handler o si declaras múltiples lanza error.
* El nombre de la lambda se declara en `@Named("nombre")`, justo antes de la declaración de la clase lambda.

En `application.properties` se indica que `TestLambda`, que ha sido nombrado con un `@Named("test")`, será el _lambda handler_. 

![](attachment/Clipboard_2020-08-06-16-39-38.png)


<details>
<summary>Click para expandir<h3>Interfaces `RequestHandler<?, ?>` y `RequestStreamHandler`</h3></summary>
Para que Quarkus reconozca a la clase como una función lambda, la clase debe implementar una de estas dos interfaces, requeridas por AWS. Estas definen la manera en que se serializará y deserializará el input y output de una Lambda.

**Ambas definen el método `handleRequest`, donde se encuentra la lógica de la lambda.** Los parametros que recibe y lo que devuelve depende de la interfaz, pero siempre se le proporciona el objeto `context`, que recibe información sobre el ambiente donde se está ejecutando la lambda.

En el proyecto `TestLambda` y `UnusedLambda` son ejemplos de cómo implementar un handler con `RequestHandler<?, ?>` y `StreamLambda` de `RequestStreamHandler`.

Más info en los [docs de Amazon](https://docs.aws.amazon.com/lambda/latest/dg/java-handler.html).

#### `RequestHandler<?, ?>`
`RequestHandler` recibe dos tipos como parámetros, correspondientes al Input y Output. Los llamaremos `I` y `O`. Cuando la función lambda sea invocada, el _event_ (así se llama el input) se deserializa (se vuelca en) en un objeto del tipo `I` y, al final, el output de tipo `O` se serializa en un String.

Declara `handleRequest` como...
```java
/**
 * Handles a Lambda Function request
 * @param input The Lambda Function input
 * @param context The Lambda execution environment context object.
 * @return The Lambda Function output
 */
public O handleRequest(I input, Context context);
```

Utiliza el (de)serializador por defecto de AWS.

#### `RequestStreamHandler`
Si necesitas una (des)serialización específica, puedes implementarla con esta interfaz. Permite manipular directamente el `InputStream` y `OutputStream`.

Declara `handleRequest` como...
```java
 /**
  * Handles a Lambda Function request
  * @param input The Lambda Function input stream
  * @param output The Lambda function output stream
  * @param context The Lambda execution environment context object.
  * @throws IOException
  */
public void handleRequest(InputStream input, OutputStream output, Context context) throws IOException;
```
</details>


Analizando el código en `src/main/java/{groupId}`, podemos ver cómo `TestLambda`  implementa `handleRequest` y utiliza el método `process` de la clase `ProcessingService` para procesar el evento.

```java
// src/main/java/dev/sample/TestLambda.java

@Named("test")
public class TestLambda implements RequestHandler<InputObject, OutputObject> {

    @Inject
    ProcessingService service;

    @Override
    public OutputObject handleRequest(InputObject input, Context context) {
        return service.process(input).setRequestId(context.getAwsRequestId());
    }
}
```
Examinando el método `process` y viendo las propiedades de las clases `InputObject` y `OutputObject`, podemos deducir que el _event_ (input) tendrá un formato parecido a este: (por lo general está en JSON)
```json
// event
{
  "name": "nombre",
  "greeting": "saludo"
}
```
y que el output será...
```json
// output
{
  "result": event.name + " " + event.greeting,
  "resultId": context.getAwsRequestId()
}
```
El request ID es parte de la información de `context`, objeto que se proporciona durante la invocación de la lambda y que recibe `handleRequest`.

## 4. Testear  en local
Para invocar la lambda localmente, creamos un archivo `sample-event.json` que contendrá nuestro evento.
```json
// sample-event.json
{
  "name": "Andrea",
  "greeting": "hello"
}
```

Ahora invocamos a la lambda. Docker tiene que estar activado.
```bash
sam local invoke --template-file target/sam.jvm.yaml --event sample-event.json
```

También podemos pasar el evento por el stdin.
```bash
echo '{"name":"Andrea", "greeting": "hello"}' | sam local invoke --template-file target/sam.jvm.yaml --event -
```

![](attachment/Clipboard_2020-08-06-20-36-59.png)

## 5. Compilar el proyecto
Para compilar el proyecto:
```bash
cd quarkus-lambda
mvn clean package
```
Si se desea compilarlo en modo nativo (demora más):
```bash
# Linux
mvn package -Pnative
# Non-linux (con docker)
mvn clean install -Pnative -Dnative-image.docker-build=true
```

### ¿SAM? ¿template-file? ¿Qué es eso?
Revisar [esto](../whats-sam.md).
Más adelante usaremos `sam deploy` para deployar nuestro proyecto con SAM y utilizaremos este template, pero por ahora solo deployaremos la lambda sin CloudFormation (en el link de arriba se habla sobre qué es).

## 6. Deploy
### 6.1 En consola
Dentro de la carpeta `target` que se creó en el build aparece un script `manage.sh`, este tiene ya preparados los comandos para crear la lambda en AWS.

Antes de usar el script debemos crear un Execution Role para la lambda (`aws` debe haber sido configurado previamente con `aws configure`)
```bash
aws iam create-role --role-name lambda-ex --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}'
```
Anotar el `Arn` del rol que aparece.
![](attachment/Clipboard_2020-08-06-17-20-17.png)

Y darle permiso para escribir en los logs de CloudWatch, asignandole el policy `AWSLambdaBasicExecutionRole`.
```bash
aws iam attach-role-policy --role-name lambda-ex --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

Más info sobre esto [aquí](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-awscli.html).

Ahora sí podemos deployar con el script.
```bash
LAMBDA_ROLE_ARN="arn:aws:iam::941267206661:role/lambda-ex" sh target/manage.sh create
```

#### ¿Qué hace el script?
Es un wrapper a distintas funciones de `aws lambda`. La función `cmd_create` crea la lambda en AWS, utilizando como parametros constantes que obtiene del proyecto:

* `FUNCTION_NAME`: artifactId convertido a PascalCase. Ejm: quarkus-lambda a QuarkusLambda. Se usa esta notación en lambdas por convención.
* `ZIP_FILE`: path absoluto al zip en` target/function.zip`, que contiene el código empaquetado.
* `HANDLER`: El lambda handler de Quarkus. Para proyectos creados con `quarkus-amazon-lambda` (como este) es siempre `io.quarkus.amazon.lambda.runtime.QuarkusStreamHandler::handleRequest`. Se explica más en el paso 7 de [deployar con interfaz](#En-la-interfaz-web-de-Amazon)
* `RUNTIME`: El runtime, java11 o java8
* `LAMBDA_ROLE_ARN`: El ARN (id) del rol que se le asignará a la lambda. La variable se puede agregar directamente en el script, modificando el archivo, o utilizando una variable de ambiente (como lo acabamos de hacer).

Las opciones de `timeout` y `memory-size` son restricciones a la lambda para que un request no consuma más de un tiempo límite o memoria (importante porque te cobran por estas cosas).


Como se puede notar, si queremos podemos utilizar directamente el comando `aws lambda create-function` reemplazando estas constantes.

```bash
# manage.sh

function cmd_create() {
  echo Creating function
  set -x
  aws lambda create-function \
    --function-name ${FUNCTION_NAME} \
    --zip-file ${ZIP_FILE} \
    --handler ${HANDLER} \
    --runtime ${RUNTIME} \
    --role ${LAMBDA_ROLE_ARN} \
    --timeout 15 \
    --memory-size 256
}

...

FUNCTION_NAME=QuarkusLambda
HANDLER=io.quarkus.amazon.lambda.runtime.QuarkusStreamHandler::handleRequest
RUNTIME=java11
ZIP_FILE=fileb://{carpeta que contiene al proyecto}/quarkus-lambda/target/function.zip
```

![](attachment/Clipboard_2020-08-06-17-26-15.png)

La función ha sido creada en AWS.

### 6.2. En la interfaz web de Amazon
Esta explicación es la misma que [en esta parte del video](https://youtu.be/Y_gVwQp_Ik8?t=703).
1. Ir a la [página de lambda](https://us-east-2.console.aws.amazon.com/lambda).
2. En el menú de la izquierda, ir a `Functions`.
3. Click en el botón naranja `Create Function`.
4. Darle un nombre cualquiera y seleccionar `Java11` como el runtime. Para los permisos, seleccionar el crear un rol con permisos básicos.

![](attachment/Clipboard_2020-08-06-17-36-06.png)

5. Y crear la función. Nos llevará a la página de la función lambda.
6. Debajo de la sección Designer, ir a `Function code` y `Actions > Upload zip or jar`. Subir el zip `function.zip` que se encuentra en `target`.

![](attachment/Clipboard_2020-08-06-17-50-20.png)

7. Ahora hay que decirle a la lambda cual es el lambda handler. Para esto bajamos a la sección de `Basic Settings` y cambiamos el handler `example.Hello::handleRequest` por `io.quarkus.amazon.lambda.runtime.QuarkusStreamHandler::handleRequest`. Así delegas el trabajo de manejar el handler a Quarkus, que cederá el control a la función lambda que indicamos en `application.properties`. Si el proyecto tuviera solo una función lambda, se la cedería a esa.

![](attachment/Clipboard_2020-08-06-21-03-47.png)

## 7. Testear la lambda deployada
En la interfaz de Amazon, en `Lambda > Functions` aparece la función que acabamos de deployar.

![](attachment/Clipboard_2020-08-06-17-39-59.png)
![](attachment/Clipboard_2020-08-06-17-40-47.png)

Para testear que funcione correctamente, ir a `Test` en la derecha y crear un nuevo evento. En el cuerpo escribimos un JSON con los keys `name` y `greeting`, los valores y el nombre del evento pueden ser cualquiera.

![](attachment/Clipboard_2020-08-06-17-27-53.png)

Creamos el evento y volvemos a hacer click en `Test`. Nos aparece el resultado de nuestra lambda, como cuando la testeamos en local.

![](attachment/Clipboard_2020-08-06-17-28-49.png)


### 8. Links
* https://quarkus.io/guides/amazon-lambda
* https://gerardo.dev/aws-lambda-quarkus.html
* https://www.youtube.com/watch?v=BgeKG-OzF5g
* https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-awscli.html
* https://docs.aws.amazon.com/lambda/latest/dg/java-handler.html
* https://docs.aws.amazon.com/es_es/AWSCloudFormation/latest/UserGuide/Welcome.html

