import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateGINIndexAfterTableNameChanged1749287298382 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE INDEX "IDX_delivery_history_receiverList_gin" 
            ON "delivery_history" USING GIN ("receiverList");`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_latest_delivery_receiverList_gin" 
            ON "latest_delivery" USING GIN ("receiverList");`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(
            `DROP INDEX "IDX_delivery_history_receiverList_gin";`
        );
        await queryRunner.query(
            `DROP INDEX "IDX_latest_delivery_receiverList_gin";`
        );
    }

}
