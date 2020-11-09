import AWS from 'aws-sdk';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuction(event) {
    const { id } = event.pathParameters;

    try {
        const auction = await dynamodb.get({
            TableName: process.env.AUCTIONS_TABLE_NAME,
            Key: {
                id
            }
        }).promise();

        if (!auction) throw new createError.NotFound(`Auction with id: ${id} hasn't been found`);

        return {
            statusCode: 200,
            body: JSON.stringify(auction.Items),
        };
    } catch (e) {
        console.error(e);
        throw new createError.InternalServerError(e);
    }
}

export const handler = middy(getAuction)
    .use(httpJsonBodyParser())
    .use(httpEventNormalizer())
    .use(httpErrorHandler());
