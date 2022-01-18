import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { VideosRepository } from 'src/videos/videos.repository';

@Injectable()
export class StatsService {
  constructor(
    private videosRepository: VideosRepository,
    private channelsRepository: ChannelsRepository,
  ) {}
  async getStats() {
    try {
      const videoCount = await this.videosRepository
        .createQueryBuilder('video')
        .getCount();
      const channelCount = await this.channelsRepository
        .createQueryBuilder('channel')
        .getCount();
      return { videos: videoCount, channels: channelCount };
    } catch (error) {
      throw new InternalServerErrorException('Error getting stats');
    }
  }
  async getMetrics() {
    try {
      const videoCount = await this.videosRepository
        .createQueryBuilder('video')
        .getCount();
      const channelCount = await this.channelsRepository
        .createQueryBuilder('channel')
        .getCount();

      const channels = await this.channelsRepository
        .createQueryBuilder('channel')
        .loadRelationCountAndMap(
          'channel.videoCount',
          'channel.videos',
          'video',
        )
        .orderBy('channel.createdAt', 'DESC')
        .getMany();

      let channelsString = '';

      for await (const channel of channels) {
        channelsString += `channel_video_count{id="${channel.name}"} ${channel['videoCount']}\n`;
      }

      const metrics =
        `video_count{id="eos"} ${videoCount}\nchannel_count{id="eos"} ${channelCount}\n${channelsString}`.toString();
      return metrics;
    } catch (error) {
      throw new InternalServerErrorException('Error getting stats');
    }
  }
}
