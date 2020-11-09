import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event) {
    const { id } = event.pathParameters;
    const { amount } = event.body;

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highest.amount = :amount',
        ExpressionAttributeValues: { ':amount': amount },
        ReturnValues: 'ALL_NEW',
    };

    try {
        const auction = await dynamodb.update(params).promise();

        if (!auction)
            throw new createError.NotFound(
                `Auction with id: ${id} hasn't been found`
            );

        return {
            statusCode: 200,
            body: JSON.stringify(auction.Item),
        };
    } catch (e) {
        console.error(e);
        throw new createError.InternalServerError(e);
    }
}

export const handler = commonMiddleware(placeBid);
