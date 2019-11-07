import { Controller, Get, Query, InternalServerErrorException, Body, Head } from '@nestjs/common';

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

  @Head('check-online')
  checkOnline() {
    return true;
  }

}
