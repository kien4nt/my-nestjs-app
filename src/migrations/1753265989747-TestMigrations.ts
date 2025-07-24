import { MigrationInterface, QueryRunner } from "typeorm";

export class TestMigrations1753265989747 implements MigrationInterface {
    name = 'TestMigrations1753265989747'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin" ("id" SERIAL NOT NULL, "adminId" uuid NOT NULL, "name" text NOT NULL, "officeId" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_abce4cc3fe598f242ab45e529b6" UNIQUE ("adminId"), CONSTRAINT "UQ_a026be7ca12f8999cbdf96dec20" UNIQUE ("name"), CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "delivery_history" ("id" SERIAL NOT NULL, "startDateTime" TIMESTAMP NOT NULL, "endDateTime" TIMESTAMP NOT NULL, "receiverId" integer, "senderId" integer, "transactionStatus" boolean NOT NULL, "transactionType" text NOT NULL, "receiverList" jsonb DEFAULT '[]', "errors" jsonb DEFAULT '[]', CONSTRAINT "PK_b51c834c69b23c838f72729960c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5fd62bf6ae9f2ce91a21e36b0a" ON "delivery_history" ("receiverId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e7382dd1a4ed1f24a7f26b69d0" ON "delivery_history" ("senderId") `);
        await queryRunner.query(`CREATE TABLE "latest_delivery" ("storeIdPK" integer NOT NULL, "startDateTime" TIMESTAMP NOT NULL, "endDateTime" TIMESTAMP NOT NULL, "transactionType" text NOT NULL, "transactionStatus" boolean NOT NULL, "receiverList" jsonb, "errors" jsonb DEFAULT '[]', CONSTRAINT "PK_fea49b0e6bc3388938a9279c338" PRIMARY KEY ("storeIdPK"))`);
        await queryRunner.query(`CREATE TABLE "store" ("id" SERIAL NOT NULL, "storeId" uuid NOT NULL, "storeName" text NOT NULL, "storeCode" text NOT NULL, "storeNameCode" text NOT NULL, "password" text NOT NULL, "storename" text NOT NULL, "storeType" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "adminIdPK" integer, "parentGroupId" integer, CONSTRAINT "UQ_86d47e1262bcf2351ed37dd3cc1" UNIQUE ("storeId"), CONSTRAINT "UQ_0d98f8b63da24c57d6b4781713f" UNIQUE ("storename"), CONSTRAINT "PK_f3172007d4de5ae8e7692759d79" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6c86f1b02694242039a9e49f54" ON "store" ("storeName", "storeCode", "storeNameCode") `);
        await queryRunner.query(`ALTER TABLE "delivery_history" ADD CONSTRAINT "FK_5fd62bf6ae9f2ce91a21e36b0a9" FOREIGN KEY ("receiverId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ADD CONSTRAINT "FK_e7382dd1a4ed1f24a7f26b69d0f" FOREIGN KEY ("senderId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "latest_delivery" ADD CONSTRAINT "FK_fea49b0e6bc3388938a9279c338" FOREIGN KEY ("storeIdPK") REFERENCES "store"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "FK_cc18c58bf33f72ca628a4297921" FOREIGN KEY ("adminIdPK") REFERENCES "admin"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "FK_58a9795ca8f1606b3d582e23e99" FOREIGN KEY ("parentGroupId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_58a9795ca8f1606b3d582e23e99"`);
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_cc18c58bf33f72ca628a4297921"`);
        await queryRunner.query(`ALTER TABLE "latest_delivery" DROP CONSTRAINT "FK_fea49b0e6bc3388938a9279c338"`);
        await queryRunner.query(`ALTER TABLE "delivery_history" DROP CONSTRAINT "FK_e7382dd1a4ed1f24a7f26b69d0f"`);
        await queryRunner.query(`ALTER TABLE "delivery_history" DROP CONSTRAINT "FK_5fd62bf6ae9f2ce91a21e36b0a9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6c86f1b02694242039a9e49f54"`);
        await queryRunner.query(`DROP TABLE "store"`);
        await queryRunner.query(`DROP TABLE "latest_delivery"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e7382dd1a4ed1f24a7f26b69d0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5fd62bf6ae9f2ce91a21e36b0a"`);
        await queryRunner.query(`DROP TABLE "delivery_history"`);
        await queryRunner.query(`DROP TABLE "admin"`);
    }

}
