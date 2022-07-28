// This frontend is loosely based off the frontend developed in this tutorial
// https://dev.to/ghoulkingr/create-a-dapp-with-reactjs-ethers-and-solidity-512n

import { useState } from "react";
import { ethers } from "ethers";
import { Buffer } from "buffer/";

const createKeccakHash = require('keccak')
const abi = require('./config/abi.json')

// workaround for keccak package
window.Buffer = window.Buffer || Buffer;

function App() {
  let [bid, setBid] = useState("");
  let [nonce, setNonce] = useState("");
  let [connected, setConnected] = useState(false);
  let [hasBid, setHasBid] = useState(false);
  let [revealed, setRevealed] = useState(false);

  let { ethereum } = window;
  let contract = null;

  if (ethereum) {
    // This is the address of the smart contract where the auction is deployed (needs to get changed with each deployment)
    let address = "0x04ee1A0D9E8f96219A6e65dfF36328a5BE1F5a1B";
    let provider = new ethers.providers.Web3Provider(ethereum);
    let signer = provider.getSigner();
    contract = new ethers.Contract(address, abi, signer);
  }

  return (
    <div className="App">

      <button onClick={() => {
          if (contract && !connected) {
              ethereum.request({ method: 'eth_requestAccounts'})
                  .then(accounts => {
                      setConnected(true);
                  })
          }
      }}>{!connected ? 'Connect wallet' : 'Connected' }</button>

      <form onSubmit={(e) => {
        e.preventDefault();
        if (contract && connected && !hasBid) {
          setNonce(parseInt(12345, 10).toString(16).padStart(32, '0'))
          const hexbid = parseInt(bid, 10).toString(16).padStart(32, '0')
          const input = hexbid.concat(nonce)
          const commitment = '0x'.concat(createKeccakHash('keccak256').update(Buffer.from(input, 'hex')).digest('hex'))
          
          console.log('bid: 0x' + hexbid)
          console.log('nonce 0x' + nonce)
          console.log('input: 0x' + input)
          console.log('commitment: ' + commitment)

          contract.bid(commitment)
            .then(() => {
              setHasBid(true);
            });
        }
      }}>
          <input type="text" placeholder="0 wei" onChange={e => setBid(e.currentTarget.value)} value={bid} />
          <input type="submit" value="bid" />
      </form>

      <button onClick={() => {
        if (contract && connected && hasBid && !revealed) {
          const bid_int = parseInt(bid, 16)
          const nonce_int = parseInt(nonce, 16)

          console.log('Attempting to reveal ...')
          console.log('Bid (base 10): %d', bid_int)
          console.log('Nonce (base 10): %d', nonce_int)
          console.log('Bid (base 16): %s', bid)
          console.log('Nonce (base 16): %s', nonce)

          contract.reveal(bid_int, nonce_int)
            .then(() => {
              setRevealed(true);
            });
        }
      }}>{!revealed ? 'Reveal' : 'Revealed' }</button>

    </div>
  );
}

export default App;
