pragma solidity >=0.8.0 <0.9.0;
/*
Implements a sealed bid auction where bidders know who they are bidding against but not the amounts of the bids. This is accomplished using commitments.
The creator of the contract is automatically set to be the auctioneer
Users can start bidding after the contract is constructed. This phase is active until revealBlock.
Next the reveal phase begins where willing users reveal their bid amount by calling reveal(). This phase is active until endBlock. The user must submit their bid amount in ETH alongside the reveal data to be considered in the auction
(Note that users can reveal at any time, but if they do this after endBlock they can only withdraw their bid and cannot be considered the winner)

Next, both of these can happen:
1) Losing bidders can withdraw their bids only once they reveal
2) The auctioneer can withdraw the highest revealed bid (the winner)

The winning bidder's address is also logged after endBlock
*/
contract SealedBidAuction {
   // Setup
   address payable public auctioneer;
   uint public startBlock;
   uint public revealBlock;
   uint public endBlock;

   // State
   bool public cancelled;
   address private currentWinner;
   uint256 private winningBid = 0;

   mapping(address => uint256) bids; // Revealed bids
   mapping(address => bytes32) commitments; // Hidden bids


   // Modifiers
   modifier onlyAuctioneer {
      require(msg.sender == auctioneer);
      _;
   }

   modifier notAuctioneer {
      require(msg.sender != auctioneer);
      _;
   }

   modifier biddingValid {
      require(startBlock <= block.number && block.number < endBlock);
      _;
   }

   modifier afterEnd {
      require(block.number >= endBlock);
      _;
   }

   modifier notCancelled {
      require(!cancelled);
      _;
   }

   modifier cancelledOrEnded {
      require(cancelled || block.number >= endBlock);
      _;
   }

   modifier notWinner {
       require(bids[msg.sender] != winningBid);
       _;
   }

   modifier bidOnce {
      require(commitments[msg.sender] == bytes32(0), "Cannot commit twice");
      _;
   }


   // Constructor
   // Begins the auction that starts at the current block and ends at endBlock_
   // Sender is assumed to be the auctioneer and must be a payable address
   constructor(uint revealBlock_, uint endBlock_) {
      assert(block.number < revealBlock_);
      assert(block.number < endBlock_);
      assert(revealBlock_ < endBlock_);
      auctioneer = payable(msg.sender);
      startBlock = block.number;
      revealBlock = revealBlock_;
      endBlock = endBlock_;
   }


   function bid(bytes32 commit_hash) public notCancelled biddingValid notAuctioneer bidOnce {
      commitments[msg.sender] = commit_hash;
   }

   function reveal(uint256 bid_val, uint256 nonce) public payable notCancelled notAuctioneer {
      bytes32 compare = encode(bid_val, msg.sender, nonce);
      require(commitments[msg.sender] == compare, "Invalid commitment");
      require(msg.value == bid_val, "Payment does not match commited bid");
      if(msg.value > winningBid) {
         currentWinner = msg.sender;
         winningBid = msg.value;
      }
   }

   // Encode given data to verify a user indeed made a commitment
   function encode(uint256 val, address addr, uint256 nonce) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(nonce, val, addr));
    }

   function withdrawWinningBid() public payable notCancelled afterEnd onlyAuctioneer {
       auctioneer.transfer(winningBid);
       winningBid = 0;
   }

   function withdraw() public cancelledOrEnded notWinner {
       payable(msg.sender).transfer(bids[msg.sender]);
       bids[msg.sender] = 0;
   }

   // Can only be called before reveal phase
   function cancelAuction() public notCancelled onlyAuctioneer biddingValid {
      cancelled = true;
      emit LogCanceled();
   }

    function queryWinner() public notCancelled afterEnd {
        emit LogWinner(currentWinner);
    }

   event LogWinner(address winner);
   event LogCanceled();
}
