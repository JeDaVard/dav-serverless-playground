import { getEndedAuctions } from '../lib/getEndedAuctions';
import { closeAuction } from '../lib/closeAuction';
import createError from 'http-errors';

async function processAuctions() {
    const auctionsToClose = await getEndedAuctions();

    try {
        await Promise.allSettled(
            auctionsToClose.map((auction) => closeAuction(auction))
        );
    } catch (e) {
        console.error(e);
        throw new createError.InternalServerError(e);
    }
}

export const handler = processAuctions;
