import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB();

export async function updateAuctionImageUrl(id, url) {
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set imgUrl = :imgUrl',
        ExpressionAttributeValues: {
            ':imgUrl': url,
        },
        ReturnValues: 'ALL_NEW',
    };

    return dynamodb.update(params).promise();
}
