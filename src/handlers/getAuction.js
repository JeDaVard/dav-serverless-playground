import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
    const auction = await dynamodb
        .get({
            TableName: process.env.AUCTIONS_TABLE_NAME,
            Key: {
                id,
            },
        })
        .promise();

    if (!auction)
        throw new createError.NotFound(
            `Auction with id: ${id} hasn't been found`
        );

    return auction;
}

async function getAuction(event) {
    const { id } = event.pathParameters;

    try {
        const auction = await getAuctionById(id);

        return {
            statusCode: 200,
            body: JSON.stringify(auction.Item),
        };
    } catch (e) {
        console.error(e);
        throw new createError.InternalServerError(e);
    }
}

export const handler = commonMiddleware(getAuction);
