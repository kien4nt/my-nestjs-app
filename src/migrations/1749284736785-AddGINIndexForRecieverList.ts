import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGINIndexForRecieverList1749284736785 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE INDEX "IDX_DeliveryHistory_receiverList_gin" 
            ON "DeliveryHistory" USING GIN ("receiverList");`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_LatestDelivery_receiverList_gin" 
            ON "LatestDelivery" USING GIN ("receiverList");`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX "IDX_DeliveryHistory_receiverList_gin";`
        );
        await queryRunner.query(
            `DROP INDEX "IDX_LatestDelivery_receiverList_gin";`
        );
    }

}
