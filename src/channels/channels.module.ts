import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsRepository } from './channels.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelsRepository])],
  controllers: [ChannelsController],
  providers: [ChannelsService],
})
export class ChannelsModule {}
