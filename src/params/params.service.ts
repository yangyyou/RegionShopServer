import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateParamDto, UpdateParamDto } from './dto/params.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository, wrap } from '@mikro-orm/core';
import { Param } from './entities/param.entity';

@Injectable()
export class ParamsService {
  constructor(
    @InjectRepository(Param)
    private readonly paramRepo: EntityRepository<Param>,
    private readonly em: EntityManager,
  ) {}

  async create(createParamDto: CreateParamDto) {
    const exist = await this.paramRepo.count({ key: createParamDto.key });
    if (exist)
      throw new BadRequestException(`param key ${createParamDto.key} exist.`);
    const newParam = this.paramRepo.create(createParamDto);
    this.em.persistAndFlush(newParam);
    return newParam;
  }

  findAll() {
    const params = this.paramRepo.findAll();
    return params;
  }

  async findOne(id: number) {
    const param = await this.paramRepo.findOne({ id: id });
    if (!param) throw new BadRequestException(`param ${param} no exist`);
    return param;
  }

  async update(id: number, updateParamDto: UpdateParamDto) {
    const param = await this.paramRepo.findOne({ id: id });
    if (!param) throw new BadRequestException(`param ${param} no exist`);
    await wrap(param).assign(updateParamDto);
    this.em.persistAndFlush(param);
    return param;
  }

  async remove(id: number) {
    const param = await this.paramRepo.findOne({ id: id });
    if (!param) throw new BadRequestException(`param ${id} no exist`);
    this.em.removeAndFlush(param);
    return true;
  }
}
