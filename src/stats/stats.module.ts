import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideosRepository } from 'src/videos/videos.repository';
import { ChannelsRepository } from 'src/channels/channels.repository';

@Module({
  imports: [TypeOrmModule.forFeature([VideosRepository, ChannelsRepository])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
