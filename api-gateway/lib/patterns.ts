import { Construct } from 'constructs';
import {
  aws_lambda as lambda,
  aws_iam as iam,
  Duration,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import * as path from 'path';

export interface BVGProps extends StackProps {
    readonly bvgEnvironment: {
        [key: string]: any;
      };
}

export interface BVGStackAssetName {
    getName(name: string): string;
  }

export class BVGStack extends Stack implements BVGStackAssetName {

    readonly bvgEnvironment: any;

    constructor(scope: Construct, id: string, props?: BVGProps) {
        super(scope, id, props);

        this.bvgEnvironment = props?.bvgEnvironment;
    }

    getName(name: string) {
        const { env, team, appName } = this.bvgEnvironment;
        return `${env}-${team}-${appName}-${name}`;
      }
}


export class BVGFunction extends Construct implements BVGStackAssetName {
  private readonly bvgEnvironment: any;
  function: lambda.Function;

  constructor(scope: Construct, id: string, props: BVGProps) {
    super(scope, id);
    this.bvgEnvironment = props?.bvgEnvironment;
    this.createLambda();
  }

  getName(name: string) {
    const { env, team, appName } = this.bvgEnvironment;
    return `${env}-${team}-${appName}-${name}`;
  }

  createLambda() {
    const { env, team, appName, name, options = {} } = this.bvgEnvironment;

    const { policies = [], timeout = 30, memory = 128 } = options;

    const lambdaFnName = this.getName(name);

    const environment = {
      env,
      team,
      appName,
    };

    const lambdaFn = new lambda.Function(this, `${lambdaFnName}-id`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: lambdaFnName,
      handler: `${name}.handler`,
      code: lambda.Code.fromAsset(path.resolve(__dirname, `../build/${name}`)),
      timeout: Duration.seconds(timeout),
      memorySize: memory,
    });

    Object.entries(environment).forEach(([key, value]) => {
      lambdaFn.addEnvironment(key, value, { removeInEdge: true });
    });

    policies.forEach((policy: iam.PolicyStatement) => {
      lambdaFn.addToRolePolicy(policy);
    });

    this.function = lambdaFn;
  }
}