import {Expo, ExpoPushMessage, ExpoPushReceiptId, ExpoPushTicket, ExpoPushToken} from 'expo-server-sdk';

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security

// Currently I have not enabled push security, however this might be a good
//    idea to look into later so 3rd parties can't send notifications to our users if they crack their tokens
//    See this for more info: https://docs.expo.io/push-notifications/sending-notifications/#additional-security
const expo = new Expo();

const sendPushNotifications = (messages: ExpoPushMessage[]) => {
    // The Expo push notification service accepts batches of notifications so
    // that you don't need to send 1000 requests to send 1000 notifications. We
    // recommend you batch your notifications to reduce the number of requests
    // and to compress them (notifications with similar content will get
    // compressed).
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];
    (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (const chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk);
                tickets.push(...ticketChunk);
                // NOTE: If a ticket contains an error code in ticket.details.error, you
                // must handle it appropriately. The error codes are listed in the Expo
                // documentation:
                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
                console.error(error);
            }
        }
        setTimeout(() => {
            const receiptIds: ExpoPushReceiptId[] = [];
            for (const ticket of tickets) {
                // NOTE: Not all tickets have IDs; for example, tickets for notifications
                // that could not be enqueued will have error information and no receipt ID.
                // @ts-ignore this line checks if ticket.id even exists so don't worry that it might not
                if (ticket.id) {
                    // @ts-ignore already checked if ticket.id exists
                    receiptIds.push(ticket.id);
                }
            }

            const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
            (async () => {
                // Like sending notifications, there are different strategies you could use
                // to retrieve batches of receipts from the Expo service.
                for (const chunk of receiptIdChunks) {
                    try {
                        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                        console.log(receipts);

                        // The receipts specify whether Apple or Google successfully received the
                        // notification and information about an error, if one occurred.
                        for (const receiptId in receipts) {
                            // @ts-ignore I know this code works because it is provided by Expo
                            const { status, message, details } = receipts[receiptId];
                            if (status === 'error') {
                                console.error(
                                    `There was an error sending a notification: ${message}`
                                );
                                // @ts-ignore I know this code works because it is provided by Expo
                                if (details && details.error) {
                                    // The error codes are listed in the Expo documentation:
                                    // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                                    // You must handle the errors appropriately.
                                    // @ts-ignore I know this code works because it is provided by Expo
                                    console.error(`The error code is ${details.error}`);
                                }
                            }
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            })();
        }, 5000);
    })();
};


const sendBatchNotification = (title: string, body: string, expoPushTokens: ExpoPushToken[], data: object = {}) => {
    // Create the messages that you want to send to clients
    const messages = [];
    for (const pushToken of expoPushTokens) {
        // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

        // Check that all your push tokens appear to be valid Expo push tokens
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }

        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
            to: pushToken,
            sound: 'default',
            body: body,
            title: title,
            data: data,
        } as ExpoPushMessage);
    }
    sendPushNotifications(messages);
};

export {sendPushNotifications, sendBatchNotification};
