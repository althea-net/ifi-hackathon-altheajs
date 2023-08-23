import { generateEndpointAccount, AccountResponse } from '@althea-net/provider';
import { nodeurl } from '../constants/nodeConstants';

const restOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json'},
    // mode: 'no-cors', // This option will break the request in a confusing way when cors support is available
}

// Note that the node will return a 400 status code if the account does not exist.
export default async function getAccountInfo(account) {
    const queryEndpoint = `${nodeurl}${generateEndpointAccount(account)}`;
    console.log("Querying ", queryEndpoint);
    return fetch(
        queryEndpoint,
        restOptions,
    ).then((res) => res.json())
}