import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function deleteAuction(event) {
  const { id } = event.pathParameters;

  try {
    const auction = await dynamodb
      .delete({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: {
          id,
        },
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify(auction),
    };
  } catch (e) {
    console.error(e);
    throw new createError.InternalServerError(e);
  }
}

export const handler = commonMiddleware(deleteAuction);
