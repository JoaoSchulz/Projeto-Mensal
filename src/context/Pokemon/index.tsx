import { createContext, useEffect, useState } from 'react';
import { Pokemon, RequestPokemon } from '../../models/pokemon'
import api from '../../services/api';

type PokemonContextProviderProps = {
    children: React.ReactNode
}

export type PokemonContextProps = {
    pokemon: Pokemon[],
    setPokemon: React.Dispatch<React.SetStateAction<Pokemon[]>>,
    count: number,
    setCount: React.Dispatch<React.SetStateAction<number>>,
    search: string,
    setSearch: React.Dispatch<React.SetStateAction<string>>,
    morePokemon: number,
    setMorePokemon: React.Dispatch<React.SetStateAction<number>>,
}

const DEFAULT_VALUE = {
    pokemon: [],
    setPokemon: () => [{}],
    count: 0,
    setCount: () => [],
    search: '',
    setSearch: () => '',
    morePokemon: 0,
    setMorePokemon: () => []
}

const PokemonContext = createContext<PokemonContextProps>(DEFAULT_VALUE);

const PokemonContextProvider = ({ children }: PokemonContextProviderProps) => {
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [count, setCount] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [morePokemon, setMorePokemon] = useState<number>(9);

    async function GetInfoPokemons(url: string): Promise<RequestPokemon> {
        const response = await api.get(url)
        const { id, types } = response.data;
        return {
            id,
            types,
            image: response.data.sprites.other.home.front_default,
            attack: response.data.stats[1].base_stat,
            defense: response.data.stats[2].base_stat
        }
    }

    useEffect(() => {
        async function getPokemons() {
            const response = await api.get(`pokemon/?limit=${morePokemon}`)
            const { results, count } = response.data;
            const pokemonData = await Promise.all(
                results.map(async (pokemon: Pokemon) => {
                    const {
                        id,
                        types,
                        image,
                        attack,
                        defense
                    } = await GetInfoPokemons(pokemon.url);

                    return {
                        name: pokemon.name,
                        id,
                        types,
                        image,
                        attack,
                        defense
                    }
                })
            )
            setPokemon(pokemonData);
            setCount(count)
        }
        getPokemons()
    }, [morePokemon]);

    return (
        <PokemonContext.Provider
            value={{ pokemon, setPokemon, count, setCount, morePokemon, setMorePokemon, search, setSearch }}>
            {children}
        </PokemonContext.Provider>
    )
}

export default PokemonContext;

export { PokemonContextProvider };