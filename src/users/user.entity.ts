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

  @PrimaryColumn()
  userID: string;

  @Column()
  password: string;

  @CreateDateColumn({ type: 'datetime' })
  registeredDate: Date;
}
