import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SendMailEvent } from '../type';

@Injectable()
export class SendMailEventListener {
  @OnEvent('send-mail')
  handle(event: SendMailEvent) {
    console.log('A new entity created with this information');
    console.log(event);
  }
}
