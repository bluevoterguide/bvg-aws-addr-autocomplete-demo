
import { LocationClient, SearchPlaceIndexForSuggestionsCommand } from "@aws-sdk/client-location";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import autocompleter from "autocompleter";


const getClient = async () => {
  
  const cognitoClient = new CognitoIdentityClient();

  const creds = await fetch('/api/cognito-credentials.php');

    
  const params = {
    IdentityId: creds,
  };

  const response = await cognitoClient.send(new GetCredentialsForIdentityCommand(params));

  const locationClient = new LocationClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: response.Credentials.AccessKeyId,
      secretAccessKey: response.Credentials.SecretAccessKey,
      sessionToken: response.Credentials.SessionToken,
    }
  });

  
  return locationClient;
    
};

const getAddressAutocompleteSuggestions = async ({ locationClient, text, bias }) => {
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

export const AutoComplete = async () => {

  const locationClient = await getClient();

  autocompleter({
    input: document.getElementById("addr-autocomplete"),
    minLength: 3,
    debounceWaitMs: 300,
    className: "autocomplete-suggestions",
    fetch: (text, update) => {
      const urlParams = new URLSearchParams(window.location.search);
      const biasLat = urlParams.get('lat');
      const biasLng = urlParams.get('lng');
      let bias = [];
      if (biasLat && biasLng) {
        bias = [parseFloat(biasLng), parseFloat(biasLat)];
      }
  
      getAddressAutocompleteSuggestions({ locationClient, text, bias}).then((result) => {
        if (result.error) {
          console.error(`Error fetching address autocomplete suggestions: ${result.error}`)
          update(false);
        } else {
          update(result.suggestions.map((s) => {
            return { label: s };
          }));
        }
      });
    },
    onSelect: (suggestion, input) => {
      input.value = suggestion.label;
    },
  });
}

export default AutoComplete;



