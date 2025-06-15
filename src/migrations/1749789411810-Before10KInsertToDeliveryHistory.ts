import { MigrationInterface, QueryRunner } from "typeorm";

export class Before10KInsertToDeliveryHistory1749789411810 implements MigrationInterface {
    name = 'Before10KInsertToDeliveryHistory1749789411810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_delivery_history_receiverList_gin"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_latest_delivery_receiverList_gin"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_delivery_history_receiverList_gin" 
                    ON "delivery_history" USING GIN ("receiverList"); `);
        await queryRunner.query(`CREATE INDEX "IDX_latest_delivery_receiverList_gin" 
                    ON "latest_delivery" USING GIN ("receiverList"); `);
    }

}
