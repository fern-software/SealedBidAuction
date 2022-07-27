// This frontend is loosely based off the frontend developed in this tutorial
// https://dev.to/ghoulkingr/create-a-dapp-with-reactjs-ethers-and-solidity-512n

import { useState } from "react";
import { ethers } from "ethers";
import { Buffer } from "buffer/";

// workaround for keccak package
window.Buffer = window.Buffer || Buffer;
const createKeccakHash = require('keccak')

function App() {
  let [bid, setBid] = useState("");
  let [connected, setConnected] = useState(false);

  let { ethereum } = window;
  let contract = null;

  if (ethereum) {

    let abi = JSON.parse('[{"inputs": [{"internalType": "string","name": "newText","type": "string"}],"name": "changeText","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"stateMutability": "nonpayable","type": "constructor"},{"inputs": [],"name": "text","outputs": [{"internalType": "string","name": "","type": "string"}],"stateMutability": "view","type": "function"}]')

    // This is the address of the smart contract where the auction is deployed (needs to get changed with each deployment)
    let address = 0x630dEe821cA83A03d45Fd9bAd0a994Ac914A2b71;
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
        if (contract && connected) {
          const hexbid = parseInt(bid, 10).toString(16).padStart(32, '0')
          const nonce = parseInt(12345, 10).toString(16).padStart(32, '0')
          const input = hexbid.concat(nonce)
          const commitment = createKeccakHash('keccak256').update(Buffer.from(input, 'hex')).digest('hex')
          
          console.log('hex of bid: ' + hexbid)
          console.log('hex of nonce: ' + nonce)
          console.log('hex of input: ' + input)
          console.log('commitment: ' + commitment)

          contract.bid(commitment)
            .then(() => {
              setBid(bid);
            });
        }
      }}>
          <input type="text" placeholder="0 wei" onChange={e => setBid(e.currentTarget.value)} value={bid} />
          <input type="submit" value="bid" />
      </form>
    </div>
  );
}

export default App;
