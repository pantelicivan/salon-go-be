import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// Static
import {
  DATABASE_TABLE_NAMES,
  DATABASE_SCHEMA_NAMES,
} from '../../common/static/application.static';
import { FileTypeEnum } from '../../features/file-management/static';
import { PolymorphicContextEnum } from '../../common/static/polymorphic.static';

@Entity(DATABASE_TABLE_NAMES.FILES, { schema: DATABASE_SCHEMA_NAMES.CORE })
@Index(['url'])
@Index(['modelType', 'modelId'])
@Index(['modelType', 'modelId', 'context'])
export class File extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'url', type: 'varchar', unique: true })
  url: string;

  @Column({ name: 'key', type: 'varchar' })
  key: string;

  @Column({ name: 'type', type: 'enum', enum: FileTypeEnum })
  type: FileTypeEnum;

  @Column({ name: 'mime_type', type: 'varchar' })
  mimeType: string;

  @Column({ name: 'model_type', type: 'varchar', nullable: true })
  modelType: string | null;

  @Column({ name: 'model_id', type: 'uuid', nullable: true })
  modelId: string | null;

  @Column({
    name: 'context',
    type: 'varchar',
    default: PolymorphicContextEnum.DEFAULT,
  })
  context: string;

  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  thumbnailUrl: string | null;

  @Column({ name: 'thumbnail_key', type: 'varchar', nullable: true })
  thumbnailKey: string | null;

  // Timestamps
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    select: false,
  })
  createdAt?: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
    select: false,
  })
  updatedAt?: Date;

  // Polymorphic relations

  /**
   * @returns Model's type used to form polymorphic relations.
   */
  static getModelType(): string {
    return File.name;
  }
}
