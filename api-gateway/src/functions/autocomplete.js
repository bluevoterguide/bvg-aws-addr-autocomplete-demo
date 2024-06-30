import { getAddressSuggestions } from "../core/suggestions";
import { response } from '../utils/utils';

const handler = async (event, context) => {
    
    // todo, get input vars from post data
    const { text, bias } = event;

    const result = await getAddressSuggestions({ text, bias });

    return response(result);
};

export { handler }



