import { Module } from '@nestjs/common';
import { ParamsService } from './params.service';
import { ParamsController } from './params.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Param } from './entities/param.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Param])],
  controllers: [ParamsController],
  providers: [ParamsService],
})
export class ParamsModule {}
