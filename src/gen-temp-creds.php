<?php
require 'vendor/autoload.php';

use Aws\Sts\StsClient;

$stsClient = new StsClient([
    'version' => 'latest',
    'region' => 'us-east-1',
    'credentials' => [
        'key' => 'YOUR_ACCESS_KEY',
        'secret' => 'YOUR_SECRET_KEY',
    ],
]);

$result = $stsClient->assumeRole([
    'RoleArn' => 'arn:aws:iam::123456789012:role/YourRoleName',
    'RoleSessionName' => 'web-session',
]);

echo json_encode($result->toArray());
?>
