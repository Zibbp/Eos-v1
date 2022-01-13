import {
  ConflictException,
  HttpCode,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Channel } from './entities/channel.entity';
import { ChannelsRepository } from './channels.repository';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class ChannelsService {
  private logger = new Logger('ChannelsService');
  constructor(private channelsRepository: ChannelsRepository) {}
  async create(createChannelDto: CreateChannelDto) {
    try {
      const channel = new Channel();
      channel.name = createChannelDto.name;
      channel.profileImagePath = createChannelDto.profileImagePath;
      await this.channelsRepository.save(channel);
      return channel;
    } catch (error) {
      if (error && error.code === '23505') {
        this.logger.verbose(`${createChannelDto.name} channel already exists`);
        throw new ConflictException(
          `${createChannelDto.name} channel already exists`,
        );
      } else {
        throw new InternalServerErrorException(
          'Error occured while attempting to insert channel.',
        );
      }
    }
  }

  async findAll(options: IPaginationOptions): Promise<Pagination<Channel>> {
    try {
      const queryBuilder =
        this.channelsRepository.createQueryBuilder('channel');
      queryBuilder.orderBy('channel.createdAt', 'DESC');

      return paginate<Channel>(queryBuilder, options);
    } catch (error) {
      this.logger.error('Error fetching channels', error);
      throw new InternalServerErrorException('Error fetching channels.');
    }
  }

  // try {
  //   const channels = await this.channelsRepository.find({
  //     order: {
  //       createdAt: 'DESC',
  //     },
  //   });
  //   return channels;
  // } catch (error) {
  //   this.logger.error('error', error);
  // }

  async findOneById(id: string) {
    try {
      const channel = await this.channelsRepository
        .createQueryBuilder('channel')
        .where('channel.id = :id', { id: id })
        .loadRelationCountAndMap(
          'channel.videoCount',
          'channel.videos',
          'video',
        )
        .getOneOrFail();

      return channel;
    } catch (error) {
      throw new NotFoundException('Channel not found');
    }
  }
  async findOneByName(name: string) {
    try {
      const channel = await this.channelsRepository
        .createQueryBuilder('channel')
        .where('channel.name = :name', { name: name })
        .loadRelationCountAndMap(
          'channel.videoCount',
          'channel.videos',
          'video',
        )
        .getOneOrFail();

      return channel;
    } catch (error) {
      throw new NotFoundException('Channel not found');
    }
  }

  update(id: number, updateChannelDto: UpdateChannelDto) {
    return `This action updates a #${id} channel`;
  }

  remove(id: number) {
    return `This action removes a #${id} channel`;
  }
}
