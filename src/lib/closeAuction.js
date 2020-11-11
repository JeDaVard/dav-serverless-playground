import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function closeAuction(id) {
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeValues: {
            ':status': 'CLOSED',
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    };
    return await dynamodb.update(params).promise();
}
