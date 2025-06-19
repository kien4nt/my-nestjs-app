import { MigrationInterface, QueryRunner } from "typeorm";

export class DropRedundantIndexesOnStoreAndAdmin1750323977931 implements MigrationInterface {
    name = 'DropRedundantIndexesOnStoreAndAdmin1750323977931'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a026be7ca12f8999cbdf96dec2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_abce4cc3fe598f242ab45e529b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0d98f8b63da24c57d6b4781713"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86d47e1262bcf2351ed37dd3cc"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_86d47e1262bcf2351ed37dd3cc" ON "store" ("storeId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0d98f8b63da24c57d6b4781713" ON "store" ("storename") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_abce4cc3fe598f242ab45e529b" ON "admin" ("adminId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a026be7ca12f8999cbdf96dec2" ON "admin" ("name") `);
    }

}
