import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function closeAuction(auction) {
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id: auction.id },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeValues: {
            ':status': 'CLOSED',
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    };
    await dynamodb.update(params).promise();

    const { title, seller, highest } = auction;
    const { amount, bidder } = highest;

    if (amount === 0)
        return sqs
            .sendMessage({
                QueueUrl: process.env.MAIL_QUEUE_URL,
                MessageBody: JSON.stringify({
                    subject: 'You auction is closed',
                    recipient: seller,
                    body: `Sorry! Your item "${title}" has been closed without any bids.`,
                }),
            })
            .promise();

    const notifySeller = sqs
        .sendMessage({
            QueueUrl: process.env.MAIL_QUEUE_URL,
            MessageBody: JSON.stringify({
                subject: 'Your item has been sold',
                recipient: seller,
                body: `Woohoo! Your item "${title}" has been sold for $${amount}.`,
            }),
        })
        .promise();

    const notifyBidder = sqs
        .sendMessage({
            QueueUrl: process.env.MAIL_QUEUE_URL,
            MessageBody: JSON.stringify({
                subject: 'You won the auction',
                recipient: bidder,
                body: `What a great deal! You got yourself a "${title}" for $${amount}.`,
            }),
        })
        .promise();

    return Promise.allSettled([notifyBidder, notifySeller]);
}
