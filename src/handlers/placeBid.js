import AWS from 'aws-sdk';
import createError from 'http-errors';
import validate from '@middy/validator';

import commonMiddleware from '../lib/commonMiddleware';
import { getAuctionById } from './getAuction';
import placeBidSchema from '../lib/schemas/placeBidSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event) {
    const { id } = event.pathParameters;
    const { amount } = event.body;
    const { email } = event.requestContext.authorizer;

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression:
            'set highest.amount = :amount, highest.bidder = :bidder',
        ExpressionAttributeValues: { ':amount': amount, ':bidder': email },
        ReturnValues: 'ALL_NEW',
    };
    const { Item } = await getAuctionById(id);

    // Status validation
    if (Item.status === 'CLOSED')
        throw new createError.BadRequest(`This auction is closed`);

    // Bid identity validation
    if (email === Item.seller)
        throw new createError.Forbidden(`You can't bit on your auction`);

    // Avoid double bidding
    if (email === Item.highest.bidder)
        throw new createError.Forbidden(`You are already the highest bidder`);

    // Amount validation
    if (Item.highest.amount >= amount)
        throw new createError.BadRequest(
            `New bid must be greater than the actual bid, so ${amount} is not greater than ${Item.highest.amount}`
        );

    try {
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

export const handler = commonMiddleware(placeBid).use(
    validate({
        inputSchema: placeBidSchema,
    })
);
