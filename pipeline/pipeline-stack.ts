import * as cdk from '@aws-cdk/core';
import s3 = require('@aws-cdk/aws-s3');
const codepipeline = require("@aws-cdk/aws-codepipeline");
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import codebuild = require('@aws-cdk/aws-codebuild');

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // Crear un S3 Bucket
    const artifactsBucket = new s3.Bucket(this, "ArtifactsBucket");

    // Crear el pipeline
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
                artifactBucket: artifactsBucket
          });

    // Crear artifact para el código
    const sourceArtifact = new codepipeline.Artifact();

    if (!process.env.GITHUB_TOKEN) {
      console.log("Falta incluir un GITHUB_TOKEN");
    }

    // Agregar source stage
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipeline_actions.GitHubSourceAction({
        actionName: 'Github_Source',
        owner: "andrea-velasquez",
        repo: "quarkus-lambda-sam",
        oauthToken: cdk.SecretValue.plainText(process.env.GITHUB_TOKEN!),
        output: sourceArtifact,
      }),
      ],
    });

    // Crear proyecto de CodeBuild
    const buildProject = new codebuild.PipelineProject(this, 'Build', {
      environment: { buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_2 },
      environmentVariables: {
        'PACKAGE_BUCKET': {
          value: artifactsBucket.bucketName
        }
      }
    });

    // Crear artifact para el proyecto compilado
    const buildArtifact = new codepipeline.Artifact();

    // Agregar build stage
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Build',
          project: buildProject,
          input: sourceArtifact,
          outputs: [buildArtifact],
        }),
      ],
    });

    // Agregar deploy stage
    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new codepipeline_actions.CloudFormationCreateReplaceChangeSetAction({
          actionName: 'CreateChangeSet',
          templatePath: buildArtifact.atPath("out.yaml"),
          stackName: 'quarkus-lambda-sam',
          adminPermissions: true,
          changeSetName: 'quarkus-lambda-sam-changeset',
          runOrder: 1
        }),
        new codepipeline_actions.CloudFormationExecuteChangeSetAction({
          actionName: 'Deploy',
          stackName: 'quarkus-lambda-sam',
          changeSetName: 'quarkus-lambda-sam-changeset',
          runOrder: 2
        }),
      ],
    });

  }
}
