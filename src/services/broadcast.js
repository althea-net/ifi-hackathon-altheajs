import {
  generateEndpointBroadcast,
  generatePostBodyBroadcast,
  BroadcastMode,
} from '@althea-net/provider'
import { nodeurl } from '../constants/nodeConstants'

export async function BroadcastEIP712Tx(signedTx, optionalEndpoint) {

    const postOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: generatePostBodyBroadcast(signedTx, BroadcastMode.Block),
    }

    const broadcastEndpoint = `${nodeurl}${generateEndpointBroadcast()}`
    const broadcastPost = await fetch(
        broadcastEndpoint,
        postOptions,
    )

    console.log("Broadcasting Tx: ", JSON.stringify(postOptions))

    return await broadcastPost.json()
}