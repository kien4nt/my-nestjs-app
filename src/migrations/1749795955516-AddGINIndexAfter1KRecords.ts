import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGINIndexAfter1KRecords1749795955516 implements MigrationInterface {
    name = 'AddGINIndexAfter1KRecords1749795955516'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_5fd62bf6ae9f2ce91a21e36b0a" ON "delivery_history" ("receiverId") `);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_class c
                    WHERE c.relname = 'IDX_delivery_history_receiverList_gin'
                ) THEN
                    CREATE INDEX "IDX_delivery_history_receiverList_gin" 
                    ON "delivery_history" USING GIN ("receiverList");
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_class c
                    WHERE c.relname = 'IDX_latest_delivery_receiverList_gin'
                ) THEN
                    CREATE INDEX "IDX_latest_delivery_receiverList_gin" 
                    ON "latest_delivery" USING GIN ("receiverList");
                END IF;
            END
            $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(`DROP INDEX "public"."IDX_5fd62bf6ae9f2ce91a21e36b0a"`);
        await queryRunner.query(
            `DROP INDEX IF EXISTS "IDX_delivery_history_receiverList_gin";`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "IDX_latest_delivery_receiverList_gin";`
        );
    }


}
