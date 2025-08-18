import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn({ length: 15 })
  userID: string;

  @Column({ length: 20 })
  password: string;

  @CreateDateColumn({ type: 'datetime' })
  registeredDate: Date;
}
