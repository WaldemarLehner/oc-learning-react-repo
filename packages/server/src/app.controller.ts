import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/entries')
  public getAllEntries() {
    return [];
  }

  @Get('/entries/:id')
  public getEntryById() {
    return [];
  }

  @Get('/days/:ts')
  public getEntriesByDay() {
    return [];
  }

  @Post('/entries')
  public createNewEntry() {}

  @Patch('/entries/:id')
  public modifyEntry() {}

  @Delete('/entries/:id')
  public deleteEntry(@Param('id') id: number) {}
}
