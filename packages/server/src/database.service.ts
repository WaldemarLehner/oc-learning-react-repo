import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { basename } from 'path';
import { exit } from 'process';
import { Database } from 'sqlite3';
import { MigrationFn, SequelizeStorage, Umzug } from 'umzug';
import { promisify } from 'util';
import { endOfDay, parseISO, startOfDay } from 'date-fns';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  #db: Database;

  public async getAllForDay(day: Date) {
    const lower = startOfDay(day);
    const upper = endOfDay(day);

    const query = `
    SELECT 
    `;
  }

  constructor() {}

  async onModuleInit() {
    this.#db = new Database('./db.sqlite');

    // We reset the DB on startup to keep things simple for now
    const umzug = new Umzug({
      logger: console,
      migrations: {
        glob: './migrations/*.sql',
        resolve: (params) => {
          const sql = readFileSync(params.path!, 'utf-8');

          const up: MigrationFn = () => {
            return new Promise<void>((res, rej) => {
              this.#db.exec(sql, (err) => {
                if (err) {
                  rej(err);
                } else {
                  res();
                }
              });
            });
          };

          return {
            name: basename(params.path!),
            up: up,
          };
        },
      },
    });

    try {
      const migrations = await umzug.up();
      console.log(migrations.map((e) => e.name));
    } catch (err) {
      console.error('failed migrations: ', err);
      exit(1);
    }
  }
  onModuleDestroy() {
    this.#db.close();
  }
}
