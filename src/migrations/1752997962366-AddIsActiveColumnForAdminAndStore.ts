import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveColumnForAdminAndStore1752997962366 implements MigrationInterface {
    name = 'AddIsActiveColumnForAdminAndStore1752997962366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "store" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "admin" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "store" DROP COLUMN "isActive"`);
    }

}
