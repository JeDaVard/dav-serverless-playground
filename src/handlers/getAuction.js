import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuction(event) {
  const { id } = event.pathParameters;

  try {
    const auction = await dynamodb
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: {
          id,
        },
      })
      .promise();

    console.log(JSON.stringify(auction));

    if (!auction)
      throw new createError.NotFound(
        `Auction with id: ${id} hasn't been found`
      );

    return {
      statusCode: 200,
      body: JSON.stringify(auction.Items),
    };
  } catch (e) {
    console.error(e);
    throw new createError.InternalServerError(e);
  }
}

export const handler = commonMiddleware(getAuction);
