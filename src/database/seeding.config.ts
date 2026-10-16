import { SeedingSource } from '@concepta/typeorm-seeding';

// Config
import { ConfigService } from '../infrastructure/config/config.service';
import dataSource from './typeorm-cli.datasource';

const config = new ConfigService();
export default new SeedingSource({ dataSource, ...config.getSeedingConfig() });
