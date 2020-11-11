import AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import createError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware';
import validate from '@middy/validator';
import createAuctionSchema from '../lib/schemas/createAuctionSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
    const { title } = event.body;
    const { email } = event.requestContext.authorizer;

    const now = new Date();
    const end = new Date();
    end.setMinutes(end.getMinutes() + 2);

    const auction = {
        id: uuid(),
        title,
        status: 'OPEN',
        createdAt: now.toISOString(),
        endAt: end.toISOString(),
        highest: {
            amount: 0,
            bidder: null,
        },
        seller: email,
    };

    try {
        await dynamodb
            .put({
                TableName: process.env.AUCTIONS_TABLE_NAME,
                Item: auction,
            })
            .promise();
    } catch (e) {
        console.error(e);
        throw new createError.InternalServerError(e);
    }

    return {
        statusCode: 201,
        body: JSON.stringify(auction),
    };
}

export const handler = commonMiddleware(createAuction).use(
    validate({
        inputSchema: createAuctionSchema,
    })
);
