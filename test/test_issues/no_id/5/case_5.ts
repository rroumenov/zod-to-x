import { z } from "zod";
import { Application, Infrastructure, Zod2XModel, extendZod } from "../../../../dist";
extendZod(z);

/**
 * - Use case:
 * A protobuf file is generated. Aliased types are used in the source code and generated in the
 * output protobuf file, but they are not supported by protobuf and should be skipped.
 *
 * - Current state:
 * Aliased types are generated in the output protobuf file, which is not valid protobuf syntax.
 *
 * @current
 * message ResGetWeather {
 *   WeatherId weatherId = 1;
 *   // Other fields...
 * }
 *
 * @expected
 * message ResGetWeather {
 *   string weatherId = 1;
 *   // Other fields...
 * }
 */

@Application({ namespace: "WEATHER_DTOS", file: "weather.dtos" })
class WeatherServiceDtosModels extends Zod2XModel {
    readonly WeatherId = z.string().uuid();
}

export const weatherServiceDtos = new WeatherServiceDtosModels();

@Infrastructure({ namespace: "WEATHER_API", file: "weather.api" })
class WeatherApiModels extends Zod2XModel {
    readonly ResGetWeather = z.object({
        weatherId: weatherServiceDtos.WeatherId,
        data: z.any(),
    });
}

export const weatherServiceApi = new WeatherApiModels();
