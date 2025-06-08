import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeAdminIdStoreIdToUUIDTypeAddStoreNameCodeColumnToStore3ColumnIndexing1749351654370 implements MigrationInterface {
    name = 'ChangeAdminIdStoreIdToUUIDTypeAddStoreNameCodeColumnToStore3ColumnIndexing1749351654370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "store_adminIdPK_fkey"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e398112470c7079de18bd125c6"`);
        await queryRunner.query(`ALTER TABLE "store" DROP COLUMN "passwordHash"`);
        await queryRunner.query(`ALTER TABLE "store" ADD "storeNameCode" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "store" ADD "password" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin" DROP CONSTRAINT "UQ_abce4cc3fe598f242ab45e529b6"`);
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "adminId"`);
        await queryRunner.query(`ALTER TABLE "admin" ADD "adminId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin" ADD CONSTRAINT "UQ_abce4cc3fe598f242ab45e529b6" UNIQUE ("adminId")`);
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "UQ_3d067c8b01beffe1c136edfea9c"`);
        await queryRunner.query(`ALTER TABLE "store" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "store" ADD "storeId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "UQ_86d47e1262bcf2351ed37dd3cc1" UNIQUE ("storeId")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a026be7ca12f8999cbdf96dec2" ON "admin" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_abce4cc3fe598f242ab45e529b" ON "admin" ("adminId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0d98f8b63da24c57d6b4781713" ON "store" ("storename") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6c86f1b02694242039a9e49f54" ON "store" ("storeName", "storeCode", "storeNameCode") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_86d47e1262bcf2351ed37dd3cc" ON "store" ("storeId") `);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "FK_cc18c58bf33f72ca628a4297921" FOREIGN KEY ("adminIdPK") REFERENCES "admin"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_cc18c58bf33f72ca628a4297921"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86d47e1262bcf2351ed37dd3cc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6c86f1b02694242039a9e49f54"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0d98f8b63da24c57d6b4781713"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_abce4cc3fe598f242ab45e529b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a026be7ca12f8999cbdf96dec2"`);
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "UQ_86d47e1262bcf2351ed37dd3cc1"`);
        await queryRunner.query(`ALTER TABLE "store" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "store" ADD "storeId" character varying(5)`);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "UQ_3d067c8b01beffe1c136edfea9c" UNIQUE ("storeId")`);
        await queryRunner.query(`ALTER TABLE "admin" DROP CONSTRAINT "UQ_abce4cc3fe598f242ab45e529b6"`);
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "adminId"`);
        await queryRunner.query(`ALTER TABLE "admin" ADD "adminId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin" ADD CONSTRAINT "UQ_abce4cc3fe598f242ab45e529b6" UNIQUE ("adminId")`);
        await queryRunner.query(`ALTER TABLE "store" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "store" DROP COLUMN "storeNameCode"`);
        await queryRunner.query(`ALTER TABLE "store" ADD "passwordHash" text NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e398112470c7079de18bd125c6" ON "store" ("storeCode", "storeName") `);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "store_adminIdPK_fkey" FOREIGN KEY ("adminIdPK") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
