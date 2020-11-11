import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB();

export async function updateAuctionImageUrl(id, url) {
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set image = :image',
        ExpressionAttributeValues: {
            ':image': url,
        },
        ReturnValues: 'ALL_NEW',
    };

    console.log(params);

    return dynamodb.updateItem(params).promise();
}
