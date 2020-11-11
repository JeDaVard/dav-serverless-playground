import AWS from 'aws-sdk';

const s3 = new AWS.S3();
const Bucket = process.env.AUCTIONS_BUCKET_NAME;

export async function uploadPicture(Key, Body) {
    return await s3
        .upload({
            Bucket,
            Key,
            Body,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg',
        })
        .promise();
}
