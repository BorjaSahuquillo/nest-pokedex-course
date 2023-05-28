import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from '../common/adapters/axios.adapter';
@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  // With only one request for all pokemons
  async executeSeed() {
    await this.pokemonModel.deleteMany(); // delete * from pokemons;

    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    const pokemonToInsert: { name: string; no: number }[] = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];

      // const pokemon = await this.pokemonModel.create({ name, no });
      pokemonToInsert.push({ name, no });
      console.log(name, no);
    });

    await this.pokemonModel.insertMany(pokemonToInsert);
    return data.results;
  }

  /**
   * With one request for pokemon with promiseALl. Not recommended without adapter pattern
  async executeSeed() {
    await this.pokemonModel.deleteMany(); // delete * from pokemons;

    const { data } = await this.axios.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=10',
    );

    const insertPromisesArray = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];

      // const pokemon = await this.pokemonModel.create({ name, no });
      insertPromisesArray.push(this.pokemonModel.create({ name, no }));

      console.log(name, no);
    });

    await Promise.all(insertPromisesArray);

    return data.results;
  }
   **/
}
