import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
    let auction;

    try {
        auction = await dynamodb
            .get({
                TableName: process.env.AUCTIONS_TABLE_NAME,
                Key: { id },
            })
            .promise();
    } catch (e) {
        console.error(e);
        throw new createError.InternalServerError(e);
    }

    if (!auction.Item)
        throw new createError.NotFound(
            `Auction with id: ${id} hasn't been found`
        );

    return auction;
}

async function getAuction(event) {
    const { id } = event.pathParameters;

    const auction = await getAuctionById(id);

    return {
        statusCode: 200,
        body: JSON.stringify(auction.Item),
    };
}

export const handler = commonMiddleware(getAuction);
