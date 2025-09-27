import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'PG_POOL',
      useFactory: async () => {
        const pool = new Pool({
          user: 'postgres',       
          host: 'localhost',     
          database: 'trackingbd',  
          password: 'admin',
          port: 5432,
        });
        return pool;
      },
    },
  ],
  exports: ['PG_POOL'],
})
export class DatabaseModule {}