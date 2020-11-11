import { Buffer } from 'buffer';
import createError from 'http-errors';
import validator from '@middy/validator';

import { getAuctionById } from './getAuction';
import { uploadPicture } from '../lib/uploadPicture';
import commonMiddleware from '../lib/commonMiddleware';
import { updateAuctionImageUrl } from '../lib/updateAuctionImageUrl';
import uploadImageSchema from '../lib/schemas/uploadImageSchema';

async function uploadAuctionPicture(event) {
    const { id } = event.pathParameters;
    const auction = await getAuctionById(id);
    const base64 = event.body.base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    try {
        const uploadRes = await uploadPicture(
            `auctions/${auction.Item.id}/image.jpg`,
            buffer
        );
        const updated = await updateAuctionImageUrl(
            auction.Item.id,
            uploadRes.Key
        );

        return {
            statusCode: 200,
            body: JSON.stringify(updated.Attributes),
        };
    } catch (e) {
        // console.error(e);
        throw new createError.InternalServerError(e);
    }
}

export const handler = commonMiddleware(uploadAuctionPicture).use(
    validator({
        inputSchema: uploadImageSchema,
    })
);
