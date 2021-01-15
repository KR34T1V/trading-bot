import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm'
import {Sell} from './Sell'

@Entity()
export class Purchase {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  symbol!: string

  @Column('double')
  quantity!: number

  @Column('double')
  buyPrice!: number

  @Column('datetime')
  buyTime!: Date

  @OneToOne(
    type => Sell,
    sell => sell.purchase,
    {
      onDelete: 'CASCADE',
      nullable: true,
      eager: true,
      cascade: true
    }
  )
  @JoinColumn()
  sell!: Sell

  public constructor(init?: Partial<Purchase>) {
    Object.assign(this, init)
  }
}
