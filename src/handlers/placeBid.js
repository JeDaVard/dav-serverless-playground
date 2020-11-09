import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware';
import { getAuctionById } from './getAuction';

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
        const auction = getAuctionById(id);
        if (auction.highest.amount >= amount)
            throw new createError.BadRequest(
                `New bid must be greater than the actual bid, so ${amount} is not greater than ${auction.highest.amount}`
            );

        const updated = await dynamodb.update(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify(updated.Attributes),
        };
    } catch (e) {
        console.error(e);
        throw new createError.InternalServerError(e);
    }
}

export const handler = commonMiddleware(placeBid);
