import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeLatestDeliveryReceiverListToNullable1749792275122 implements MigrationInterface {
    name = 'ChangeLatestDeliveryReceiverListToNullable1749792275122'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "latest_delivery" ALTER COLUMN "receiverList" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ALTER COLUMN "receiverList" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "latest_delivery" ALTER COLUMN "receiverList" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ALTER COLUMN "receiverList" SET NOT NULL`);
    }

}
