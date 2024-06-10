fetch('/path/to/your/php/gen-temp-creds.php')
  .then(response => response.json())
  .then(data => {
    AWS.config.update({
      accessKeyId: data.Credentials.AccessKeyId,
      secretAccessKey: data.Credentials.SecretAccessKey,
      sessionToken: data.Credentials.SessionToken,
      region: 'us-east-1'
    });

    const locationClient = new AWS.Location();

    const getAddressAutocompleteSuggestions = async (text, bias) => {
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
        const resp = await locationClient.searchPlaceIndexForSuggestions(params).promise();
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

        getAddressAutocompleteSuggestions(text, bias).then((result) => {
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
  });
