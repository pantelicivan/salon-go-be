import { DataSource, DataSourceOptions } from 'typeorm';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';

// Config
import { ConfigService } from '../infrastructure/config/config.service';

initializeTransactionalContext({
  storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE,
});

const config = new ConfigService();
// Adding the transactional DataSource so that the seeds pass.
const dataSource = addTransactionalDataSource(
  new DataSource(config.getTypeOrmConfig() as DataSourceOptions),
);

export default dataSource;
