// This frontend is loosely based off the frontend developed in this tutorial
// https://dev.to/ghoulkingr/create-a-dapp-with-reactjs-ethers-and-solidity-512n

import { useState } from "react";
import { ethers } from "ethers";
import { Buffer } from "buffer/";

import Home from './components/Home.js';

const createKeccakHash = require('keccak')
const abi = require('./config/abi.json')

// workaround for keccak package
window.Buffer = window.Buffer || Buffer;

function App() {
  let [formBid, setFormBid] = useState("");
  let [bid, setBid] = useState("");
  let [nonce, setNonce] = useState("");
  let [connected, setConnected] = useState(false);
  let [hasBid, setHasBid] = useState(false);
  let [revealed, setRevealed] = useState(false);
  let [address, setAddress] = useState("");
  let [contract, setContract] = useState(null);

  let { ethereum } = window;

  const onHomeSubmit = (e) => {
    e.preventDefault();
    if (ethereum) {
      let provider = new ethers.providers.Web3Provider(ethereum);
      let signer = provider.getSigner();
      setContract(new ethers.Contract(address, abi, signer));
    }
  }

  return (
    <div className="App">

      {!contract && <Home onSubmit={onHomeSubmit} onChange={e => setAddress(e.currentTarget.value)} value={address}/>}

      {!connected && contract &&
        <button onClick={() => {
          ethereum.request({ method: 'eth_requestAccounts'})
              .then(accounts => {
                  setConnected(true);
              })
        }}>{'Connect wallet'}</button>
      }

      {!hasBid && connected && contract &&
        <form onSubmit={(e) => {
          e.preventDefault();
          if (contract && connected && !hasBid) {
            const nonce = parseInt(12345, 10).toString(16).padStart(64, '0')
            const bid = parseInt(formBid, 10).toString(16).padStart(64, '0')
            const input = bid.concat(nonce)
            const commitment = '0x'.concat(createKeccakHash('keccak256').update(Buffer.from(input, 'hex')).digest('hex'))
            
            console.log('bid: 0x' + bid)
            console.log('nonce 0x' + nonce)
            console.log('input: 0x' + input)
            console.log('commitment: ' + commitment)

            contract.bid(commitment)
              .then(() => {
                console.log('bid successful')
                setNonce(nonce);
                setBid(bid);
                setHasBid(true);
              });
            }
        }}>
            <input type="text" placeholder="0 wei" onChange={e => setFormBid(e.currentTarget.value)} value={formBid} />
            <input type="submit" value="Bid" />
        </form>
      }

      {!revealed && hasBid && connected && contract &&
        <button onClick={() => {
          if (contract && connected && hasBid && !revealed) {
            const bid_int = parseInt(bid, 16)
            const nonce_int = parseInt(nonce, 16)

            console.log('Attempting to reveal ...')
            console.log('Bid: 0x%s', bid)
            console.log('Nonce: 0x%s', nonce)
            console.log('Bid (base 10): %d', bid_int)
            console.log('Nonce (base 10): %d', nonce_int)

            contract.reveal(bid_int, nonce_int, {value: bid_int})
              .then(() => {
                console.log('reveal successful')
                setRevealed(true);
              });
          }
        }}>{'Reveal'}</button>
      }

    </div>
  );
}

export default App;
