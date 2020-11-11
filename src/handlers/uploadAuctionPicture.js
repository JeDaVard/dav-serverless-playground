import { Buffer } from 'buffer';

import { getAuctionById } from './getAuction';
import { uploadPicture } from '../lib/uploadPicture';

async function uploadAuctionPicture(event) {
    const { id } = event.pathParameters;
    const auction = await getAuctionById(id);
    const base64 = event.body.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    const uploadRes = await uploadPicture(
        `auctions/${auction.id}/image.jpg`,
        buffer
    );

    console.log(uploadRes);

    return {
        statusCode: 200,
        body: JSON.stringify({}),
    };
}

export const handler = uploadAuctionPicture;
