import { Construct } from 'constructs';
import { BVGStack, BVGProps, BVGFunction } from './patterns';
import {
  aws_apigateway as apigateway,
} from 'aws-cdk-lib';

export class MainStack extends BVGStack {
  constructor(scope: Construct, id: string, props?: BVGProps) {
    super(scope, id, props);


    // this.createLambda('connect', );
    const autocompleteLambda = new BVGFunction(
      this,
      `${this.getName('autocomplete')}-fn`,
      {
        bvgEnvironment: {
          ...this.bvgEnvironment,
          name: 'autocomplete',
          options: {
            policies: [],
          },
        },
      }
    );

    //create api-gateway and attach lambda here

  }
}
