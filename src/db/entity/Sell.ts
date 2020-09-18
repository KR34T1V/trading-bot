import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm'
import {Purchase} from './Purchase'

@Entity()
export class Sell {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('double')
  sellPrice!: number

  @Column('datetime')
  sellTime!: Date

  @OneToOne(type => Purchase, purchase => purchase.sell)
  purchase!: Purchase
}
