#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MainStack } from '../lib/main-stack';
import { BVGProps } from '../lib/patterns';

const app = new cdk.App();

const env = app.node.tryGetContext('env');
const team = app.node.tryGetContext('team');
const appName = app.node.tryGetContext('appName');

new MainStack(app, `${env}-${team}-${appName}-stack`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  bvgEnvironment: {
    env,
    team,
    appName,
  }
} as BVGProps);