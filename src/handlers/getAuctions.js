import AWS from 'aws-sdk';
import createError from 'http-errors';
import validator from '@middy/validator';

import commonMiddleware from '../lib/commonMiddleware';
import getAuctionsSchema from '../lib/schemas/getAuctionsSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
    let { status } = event.queryStringParameters;

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
            '#status': 'status',
        },
        ExpressionAttributeValues: {
            ':status': status,
        },
    };

    try {
        const auctions = await dynamodb.query(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify(auctions.Items),
        };
    } catch (e) {
        console.error(e);
        throw new createError.InternalServerError(e);
    }
}

export const handler = commonMiddleware(getAuctions).use(
    validator({ inputSchema: getAuctionsSchema, useDefaults: true })
);
