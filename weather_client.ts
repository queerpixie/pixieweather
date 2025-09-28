const apihook = "https://aviationweather.gov/api/data";
type cloudData = {
    density: string,
    altitude: number
}
type weatherData = {
    raw: string, // This is the raw data that the api sent to the client, you should not rely on this for output, if something is missing, open a issue on the repo.
    airport: string,
    observationDate: Date,
    windSpeed?: number,
    visibility?: number,
    clouds?: cloudData[],
    temp?: number,
    dewPoint?: number,
    altimeter?: number, 
    weatherPhenomena?: string[],
    remarks?: string[], // WARNING: these are unformated, are not cleaned, and contain every value after the RMK value, use with caution
}

type tokenType = "ICAO" | "observationDate" | "windSpeed" | "visibility" | "RVR" | "clouds" | "temp/dewPoint" | "altimeter" | "weatherPhenomena" | "unknown";

function clasifyToken(token: string): tokenType {

    // ICAO code: uppercase string with 4 letters
    if (/^[A-Z]{4}$/.test(token)) {
        return "ICAO";
    }

    // Time of obs in zulu
    if (/^(?:[01]\d|2[0-3])[0-5]\d[0-5]\dZ$/.test(token)) {
        return "observationDate";
    }

    // Wind speed
    if (/(?:[0-2]\d{2}|3[0-5]\d|360|VRB)(?:\d{2,3})(?:KT|G\d{2,3}KT)$/.test(token)) {
        return "windSpeed";
    }

    // TODO: deal with mixed fractions
    if (/(?:P|M)?(?:\d{1,2}|\d\/\d)SM$/.test(token)){
        return "visibility";
    } else if(/\d{4}$/.test(token)) {
        return "visibility";
    }

    // RVR
    if (/R\d{2}(?:L|R|C)?\/\d{4}(?:U|D|N)?$/.test(token)) {
        return "RVR";
    }

    // Clouds
    if (/(?:(?:SKC|CLR|FEW|SCT|BKN|OVC|VV)\d{3}(?:CB|TCU)?)|(?:NSC|NCD|\/\/\/)$/.test(token)) {
        return "clouds";
    }

    // ALT
    if (/A\d{4}$/.test(token)) {
        return "altimeter";
    }

    // temp/dewpoint
    if (/M?\d{2}\/M?\d{2}$/.test(token)) {
        return "temp/dewPoint";
    }
    
    return "unknown";
}

export async function getWeather(icao: string): Promise<string[]> {
    try {
        const params = new URLSearchParams();
        params.append("ids", icao);
        params.append("format", "raw");

        const fetchurl: string = `${apihook}/metar?${params.toString()}`;

        const response = await fetch(fetchurl);

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const responsecontent = await response.text();

        const values = responsecontent.trim().split(/\s+/);

        return values;

    } catch (error) {
        console.error(error);
        return [icao];
    }
}