import { 
  LocationClient,
  SearchPlaceIndexForSuggestionsCommand,
  SearchPlaceIndexForSuggestionsCommandInput,
 } from "@aws-sdk/client-location";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import autocomplete from "autocompleter";

const REGION = "us-east-1";
const IDENTITY_POOL_ID = "us-east-1:3081c288-0f9c-411e-adef-903a7747c84e";

const locationClient = new LocationClient({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: IDENTITY_POOL_ID,
  }),
});

type SuggestionsResult = {suggestions: string[], error: unknown};

const getAddressAutocompleteSuggestions = async (text: string, bias: number[]): Promise<SuggestionsResult> => {
  const params: SearchPlaceIndexForSuggestionsCommandInput = {
    IndexName: "bvg-addr-autocomplete-demo",
    FilterCountries: ["USA"],
    FilterCategories: ["AddressType"],
    Text: text,
    Language: "en",
  };
  if (bias && bias.length === 2) {
    params.BiasPosition = bias;
  }
  const command = new SearchPlaceIndexForSuggestionsCommand(params);

  let result: SuggestionsResult = {suggestions: [], error: false};
  try {
    const resp = await locationClient.send(command);
    console.log("AWS API results:");
    console.dir(resp);
    result.suggestions = resp?.Results?.map((place) => {
      const text = place["Text"];
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

interface AddrSuggestion {
  label: string;
}

autocomplete<AddrSuggestion>({
  input: document.getElementById("addr-autocomplete") as HTMLInputElement,
  minLength: 3,
  debounceWaitMs: 300,
  className: "autocomplete-suggestions",
  fetch: (text: string, update: (suggestions: AddrSuggestion[]|false) => void) => {
    const urlParams = new URLSearchParams(window.location.search);
    const biasLat = urlParams.get('lat');
    const biasLng = urlParams.get('lng');
    let bias: number[] = [];
    if (biasLat && biasLng) {
      bias = [parseFloat(biasLng), parseFloat(biasLat)];
    }

    getAddressAutocompleteSuggestions(text, bias).then((result) => {
      if (result.error) {
        console.error(`Error fetching address autocomplete suggestions: ${result.error}`)
        update(false);
      } else {
        update(result.suggestions.map((s: string): AddrSuggestion => {
          return {label: s};
        }));
      }
    });
  },
  onSelect: (suggestion: AddrSuggestion, input: HTMLInputElement|HTMLTextAreaElement) => {
    input.value = suggestion.label;
  },
});