import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'PG_POOL',
      useFactory: async () => {
        const pool = new Pool({
          user: 'admin1',       
          host: 'database-2.c5zubtb65eaw.us-east-1.rds.amazonaws.com',     
          database: 'trackingbd',  
          password: 'admin354',
          port: 5432,
           ssl: {
            rejectUnauthorized: false,
          }
        });
        return pool;
      },
    },
  ],
  exports: ['PG_POOL'],
})
export class DatabaseModule {}