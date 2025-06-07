import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeAdminIdGenerationToUUIDFromServiceLayer1749290719250 implements MigrationInterface {
    name = 'ChangeAdminIdGenerationToUUIDFromServiceLayer1749290719250'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_cc18c58bf33f72ca628a4297921"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "admin_id_seq" OWNED BY "admin"."id"`);
        await queryRunner.query(`ALTER TABLE "admin" ALTER COLUMN "id" SET DEFAULT nextval('"admin_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "admin" DROP CONSTRAINT "UQ_cee54f45274a3cbb8505798e3df"`);
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "adminId"`);
        await queryRunner.query(`ALTER TABLE "admin" ADD "adminId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin" ADD CONSTRAINT "UQ_abce4cc3fe598f242ab45e529b6" UNIQUE ("adminId")`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "delivery_history_id_seq" OWNED BY "delivery_history"."id"`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ALTER COLUMN "id" SET DEFAULT nextval('"delivery_history_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_58a9795ca8f1606b3d582e23e99"`);
        await queryRunner.query(`ALTER TABLE "delivery_history" DROP CONSTRAINT "FK_5fd62bf6ae9f2ce91a21e36b0a9"`);
        await queryRunner.query(`ALTER TABLE "delivery_history" DROP CONSTRAINT "FK_e7382dd1a4ed1f24a7f26b69d0f"`);
        await queryRunner.query(`ALTER TABLE "latest_delivery" DROP CONSTRAINT "FK_fea49b0e6bc3388938a9279c338"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "store_id_seq" OWNED BY "store"."id"`);
        await queryRunner.query(`ALTER TABLE "store" ALTER COLUMN "id" SET DEFAULT nextval('"store_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ADD CONSTRAINT "FK_5fd62bf6ae9f2ce91a21e36b0a9" FOREIGN KEY ("receiverId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ADD CONSTRAINT "FK_e7382dd1a4ed1f24a7f26b69d0f" FOREIGN KEY ("senderId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "FK_cc18c58bf33f72ca628a4297921" FOREIGN KEY ("adminIdPK") REFERENCES "admin"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "FK_58a9795ca8f1606b3d582e23e99" FOREIGN KEY ("parentGroupId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "latest_delivery" ADD CONSTRAINT "FK_fea49b0e6bc3388938a9279c338" FOREIGN KEY ("storeIdPK") REFERENCES "store"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "latest_delivery" DROP CONSTRAINT "FK_fea49b0e6bc3388938a9279c338"`);
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_58a9795ca8f1606b3d582e23e99"`);
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_cc18c58bf33f72ca628a4297921"`);
        await queryRunner.query(`ALTER TABLE "delivery_history" DROP CONSTRAINT "FK_e7382dd1a4ed1f24a7f26b69d0f"`);
        await queryRunner.query(`ALTER TABLE "delivery_history" DROP CONSTRAINT "FK_5fd62bf6ae9f2ce91a21e36b0a9"`);
        await queryRunner.query(`ALTER TABLE "store" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "store_id_seq"`);
        await queryRunner.query(`ALTER TABLE "latest_delivery" ADD CONSTRAINT "FK_fea49b0e6bc3388938a9279c338" FOREIGN KEY ("storeIdPK") REFERENCES "store"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ADD CONSTRAINT "FK_5fd62bf6ae9f2ce91a21e36b0a9" FOREIGN KEY ("receiverId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "FK_58a9795ca8f1606b3d582e23e99" FOREIGN KEY ("parentGroupId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "delivery_history_id_seq"`);
        await queryRunner.query(`ALTER TABLE "admin" DROP CONSTRAINT "UQ_abce4cc3fe598f242ab45e529b6"`);
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "adminId"`);
        await queryRunner.query(`ALTER TABLE "admin" ADD "adminId" character varying(5)`);
        await queryRunner.query(`ALTER TABLE "admin" ADD CONSTRAINT "UQ_cee54f45274a3cbb8505798e3df" UNIQUE ("adminId")`);
        await queryRunner.query(`ALTER TABLE "admin" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "admin_id_seq"`);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "FK_cc18c58bf33f72ca628a4297921" FOREIGN KEY ("adminIdPK") REFERENCES "admin"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
