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

  @Column({ length: 15, unique: true })
  userID: string;

  @Column({ length: 20 })
  password: string;

  @CreateDateColumn({ type: 'datetime' })
  registeredDate: Date;
}
