import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userID: string;

  @Column()
  password: string;

  @CreateDateColumn({ type: 'datetime' })
  registeredDate: Date;
}
