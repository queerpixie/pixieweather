export function add(a: number, b: number): number {
  return a + b;
}

import { getWeather } from "./weather_client.ts";

const airport = (prompt("Enter the 4 letter ICAO code of the airport to fetch weather for:") ?? "klax").toUpperCase();

console.log(await getWeather(airport.toString()));