import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
    try {
        const auctions = await dynamodb
            .scan({
                TableName: process.env.AUCTIONS_TABLE_NAME,
            })
            .promise();

        return {
            statusCode: 200,
            body: JSON.stringify(auctions.Items),
        };
    } catch (e) {
        console.error(e);
        throw new createError.InternalServerError(e);
    }
}

export const handler = commonMiddleware(getAuctions);
