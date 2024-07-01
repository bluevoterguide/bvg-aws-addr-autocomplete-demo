import { LocationClient, SearchPlaceIndexForSuggestionsCommand } from "@aws-sdk/client-location";


export const getAddressSuggestions = async ({ text, bias }) => { 

    const locationClient = new LocationClient();

    const params = {
        IndexName: "bvg-addr-autocomplete-demo",
        FilterCountries: ["USA"],
        FilterCategories: ["AddressType"],
        Text: text,
        Language: "en"
    };

    if (bias && bias.length === 2) {
        params.BiasPosition = bias;
    }

    let result = { suggestions: [], error: null };
    try {
        const resp = await locationClient.send(new SearchPlaceIndexForSuggestionsCommand(params));
        console.log("AWS API results:");
        console.dir(resp);
        result.suggestions = resp.Results?.map((place) => {
            const text = place.Text;
            if (text) {
                return text;
            } else {
                return "";
            }
        }).filter((t) => t.length > 0) ?? [];
    } catch (error) {
        console.error(`Error: ${error}`);
        result.error = error;
    }
    return result;

};