import { z } from "zod";
import { Application, Infrastructure, Zod2XModel, extendZod } from "../../../../dist";
extendZod(z);

/**
 * - Use case:
 * There is a layer with a single type inherited from a type defined in another layer.
 *
 * - Current state:
 * Importing the type from another layer is not working as expected.
 *
 * @current
 * export interface ResGetWeather extends WEATHER_DTOS.GetWeatherUseCaseResultDto {}
 *
 * @expected
 * import * as WEATHER_DTOS from "./weather.dtos";
 *
 * export interface ResGetWeather extends WEATHER_DTOS.GetWeatherUseCaseResultDto {}
 */
@Application({ namespace: "WEATHER_DTOS", file: "weather.dtos" })
class WeatherServiceDtosModels extends Zod2XModel {
    readonly GetWeatherUseCaseResultDto = z.object({ test1: z.string() });
}

export const weatherServiceDtos = new WeatherServiceDtosModels();

@Infrastructure({ namespace: "WEATHER_API", file: "weather.api" })
class WeatherApiModels extends Zod2XModel {
    readonly ResGetWeather = weatherServiceDtos.GetWeatherUseCaseResultDto;
}

export const weatherServiceApi = new WeatherApiModels();
