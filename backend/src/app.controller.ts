import { Controller, Get, Query } from '@nestjs/common';

@Controller()
export class AppController {

  @Get('')
  get() {
    return 'Hello world!';
  }

  @Get('hi')
  getProfile(@Query('name') name: string) {
    return `Hi, ${name ? name : 'Unknow'}!`;
  }

}
