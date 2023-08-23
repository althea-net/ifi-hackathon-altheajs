import { hashMessage } from '@ethersproject/hash'
import {
  computePublicKey,
  recoverPublicKey,
} from '@ethersproject/signing-key'
import { altheaToEth } from '@althea-net/address-converter'
import { signatureToWeb3Extension } from '@althea-net/transactions';
import { createTxRaw, createAnyMessage } from '@althea-net/proto';

let mmAccounts; // Stores the most recent list of accounts from MetaMask
let currPubkey; // Stores the most recent verified PubKey

const verifyPubKeyMsg = 'Verify Public Key'; // Used to derive a user's pubkey, since MetaMask doesn't store it

// Quick and easy way to tell if the browser has MetaMask available
export function metamaskInstalled() {
    return typeof window.ethereum !== 'undefined';
}

// Requests the user's accounts from MetaMask, stores them in mmAccounts
export async function connectMetamask() {
    mmAccounts = await window?.ethereum?.request({
        method: 'eth_requestAccounts',
    });
    console.log("Discovered accounts: ", mmAccounts);
}

// MetaMask does not store the pubkey, so this prompts the user to sign a "Verify Public Key" message
// Then we derive the pubkey from their signature and store in currPubkey
export async function verifyPubKey() {
    const signature = await window?.ethereum?.request({
        method: 'personal_sign',
        params: [verifyPubKeyMsg, mmAccounts[0], ''],
    })

    // Compress the key, since the client expects
    // public keys to be compressed.
    const uncompressedPk = recoverPublicKey(
        hashMessage(verifyPubKeyMsg),
        signature,
    )

    const hexPk = computePublicKey(uncompressedPk, true)
    const pk = Buffer.from(
        hexPk.replace('0x', ''), 'hex',
    ).toString('base64')
    currPubkey = pk
}

// Returns the current value in currPubkey
// Fails if user has not verified their pubkey
export function GetCurrPubkey() {
    return currPubkey;
}

// Returns the current selected account in MetaMask
// Fails if user has not connected MetaMask to our site
export function GetCurrAccount() {
    if (mmAccounts && mmAccounts.length > 0) {
        return mmAccounts[0];
    } else {
        return undefined;
    }
}

// Signs the input `tx` using information from `context` with EIP-712, then packs the signature
// into an ExtensionOptionsWeb3Tx and places on the Legacy Amino Tx body
export async function SignEIP712CosmosTx(context, tx) {
    const { sender, chain } = context

    const senderHexAddress = altheaToEth(sender.accountAddress)
    const eip712Payload = JSON.stringify(tx.eipToSign)

    const mmArgs = {
        method: 'eth_signTypedData_v4',
        params: [senderHexAddress, eip712Payload],
    }
    const signature = await window.ethereum.request(mmArgs)
    const extension = signatureToWeb3Extension(chain, sender, signature);

    const { legacyAmino } = tx
    legacyAmino.body.extensionOptions.push(createAnyMessage(extension))

    const bodyBytes = legacyAmino.body.toBinary()
    const authInfoBytes = legacyAmino.authInfo.toBinary()

    const signedTx = createTxRaw(bodyBytes, authInfoBytes, [new Uint8Array()])

    return signedTx
}