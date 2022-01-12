import { Channel } from './entities/channel.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Channel)
export class ChannelsRepository extends Repository<Channel> {}
