import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeReceiverListStructure1750407946613 implements MigrationInterface {
    name = 'ChangeReceiverListStructure1750407946613'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delivery_history" ALTER COLUMN "receiverList" SET DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delivery_history" ALTER COLUMN "receiverList" DROP DEFAULT`);
    }

}
