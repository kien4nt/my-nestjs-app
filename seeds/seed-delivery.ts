import { faker } from '@faker-js/faker';
import DataSource from '../src/data-source';
import { Store } from '../src/store/store.entity';
import { DeliveryHistory } from '../src/delivery-history/delivery-history.entity';
import { LatestDelivery } from '../src/latest-delivery/latest-delivery.entity';


async function seedDeliveryVariant() {
    await DataSource.initialize();

    const storeRepo = DataSource.getRepository(Store);
    const deliveryRepo = DataSource.getRepository(DeliveryHistory);
    const latestDeliveryRepo = DataSource.getRepository(LatestDelivery);

    const allStores = await storeRepo.find({ relations: ['admin', 'latestDelivery', 'childShops'] });
    const deliveryHistories: DeliveryHistory[] = [];
    const batchSize = 100;
    const numberOfRecordsToInsert = 10000;
    let totalDeliveries = await deliveryRepo.count()

    while (totalDeliveries < numberOfRecordsToInsert) {
        for (const sender of allStores.filter(s => s.storeType === 'group')) {
            const canSend =
                !sender.latestDelivery || sender.latestDelivery.transactionStatus === false;

            if (!canSend) continue;

            const receivers = allStores.filter(r => {
                if (r.id === sender.id) return false;
                if (r.admin?.id !== sender.admin?.id) return false;

                const isManagedShop = sender.childShops.some(cs => cs.id === r.id);
                const receiverDelivery = r.latestDelivery;
                const canReceive = !receiverDelivery || receiverDelivery.transactionStatus === false;

                return (isManagedShop || r.storeType === 'group') && canReceive;
            });

            const maxReceivers = Math.min(receivers.length, 50);
            const minReceivers = Math.min(10, receivers.length);

            if (minReceivers === 0) continue;

            const chosenReceivers = faker.helpers.arrayElements(
                receivers, faker.number.int({ min: minReceivers, max: maxReceivers })
            );

            if (chosenReceivers.length === 0) continue;

            const now = new Date();

            //sending start between today and 7 days later
            //sending end within a day from start
            const senderStart = faker.date.soon({ days: 7, refDate: now });
            const senderEnd = faker.date.soon({ days: 1, refDate: senderStart });

            const receiverList: string[] = [];
            for (const r of chosenReceivers) {
                receiverList.push(r.storeId);
            }

            const isCompleted = faker.number.int({ min: 1, max: 100 }) <= 98;


            const senderRecord = deliveryRepo.create({
                startDateTime: senderStart,
                endDateTime: senderEnd,
                transactionType: 'send',
                transactionStatus: !isCompleted,
                senderStore: sender,
                receiverStore: undefined,
                receiverList: receiverList,
                errors: isCompleted && faker.number.int({ min: 1, max: 100 }) <= 2
                    ? [{ errorCode: 'TIMEOUT', errorMessage: 'Sender failed due to timeout.' }]
                    : [],
            });

            deliveryHistories.push(senderRecord);

            for (const receiver of chosenReceivers) {
                //start,end of receiving are bounded between start,end of sending
                const rStart = faker.date.between({ from: senderStart, to: senderEnd });
                const rEnd = faker.date.between({ from: rStart, to: senderEnd });

                const rCompleted = faker.number.int({ min: 1, max: 100 }) <= 98;

                const rRecord = deliveryRepo.create({
                    startDateTime: rStart,
                    endDateTime: rEnd,
                    transactionType: 'receive',
                    transactionStatus: !rCompleted,
                    senderStore: sender,
                    receiverStore: receiver,
                    receiverList: [],
                    errors: rCompleted && faker.number.int({ min: 1, max: 100 }) <= 2
                        ? [{ errorCode: 'MISSING_DATA', errorMessage: 'Receiver lost package info.' }]
                        : [],
                });
                deliveryHistories.push(rRecord);

                await latestDeliveryRepo.upsert({
                    storeIdPK: receiver.id,
                    store: receiver,
                    startDateTime: rStart,
                    endDateTime: rEnd,
                    transactionType: 'receive',
                    transactionStatus: !rCompleted,
                    receiverList: [],
                    errors: rRecord.errors,
                }, ['storeIdPK']);
            }

            await latestDeliveryRepo.upsert({
                storeIdPK: sender.id,
                store: sender,
                startDateTime: senderStart,
                endDateTime: senderEnd,
                transactionType: 'send',
                transactionStatus: !isCompleted,
                receiverList: receiverList,
                errors: senderRecord.errors,
            }, ['storeIdPK']);


            if (deliveryHistories.length >= batchSize) {
                const saveStart = Date.now();
                const savedHistoryRecords = await deliveryRepo.save(deliveryHistories);
                totalDeliveries += savedHistoryRecords.length;
                console.log(`${totalDeliveries} records saved so far... Latest took ${Date.now() - saveStart} ms`);
                deliveryHistories.length = 0;
            }

            if (totalDeliveries >= numberOfRecordsToInsert) break;
        }
    }

    if (deliveryHistories.length > 0) {
        const lastSaveStart = Date.now();
        await deliveryRepo.save(deliveryHistories);
        console.log(`${totalDeliveries} records saved so far... Latest took ${Date.now() - lastSaveStart} ms`);
    }

    console.log(`Delievery seeding completed: ${totalDeliveries} records.`);
    await DataSource.destroy();
}

seedDeliveryVariant().catch((err) => console.error('Error:', err));
