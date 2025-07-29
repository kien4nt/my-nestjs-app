import { MigrationInterface, QueryRunner } from "typeorm";

export class AfterReview1753774042857 implements MigrationInterface {
    name = 'AfterReview1753774042857'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "latest_delivery" ALTER COLUMN "receiverList" SET DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "latest_delivery" ALTER COLUMN "receiverList" DROP DEFAULT`);
    }

}
