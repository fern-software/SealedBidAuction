pragma solidity >=0.8.0 <0.9.0;
/*
Implements a sealed bid auction where bidders know who they are bidding against but not the amounts of the bids.
The creator of the contract is automatically set to be the auctioneer
Users can start bidding after the contract is constructed and until endBlock. No withdrawls can happen during endBlock but afterwards 2 things can happen:
1) Losing bidders can withdraw their bids
2) The auctioneer can withdraw the winning bid

The winning bidder's address is also logged after the bidding has ended
*/
contract SealedBidAuction {
   // Setup
   address payable public auctioneer;
   uint public startBlock;
   uint public endBlock;

   // State
   bool public cancelled;
   address private currentWinner;
   uint256 private winningBid = 0;

   mapping(address => uint256) bids;


   // Modifiers
   modifier onlyAuctioneer {
      require(msg.sender == auctioneer);
      _;
   }

   modifier notAuctioneer {
      require(msg.sender != auctioneer);
      _;
   }

   modifier inBlockRange {
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

   // Constructor
   // Begins the auction that starts at the current block and ends at endBlock_
   // Sender is assumed to be the auctioneer and must be a payable address
   constructor(uint endBlock_) {
      assert(block.number >= endBlock_);
      auctioneer = payable(msg.sender);
      startBlock = block.number;
      endBlock = endBlock_;
   }


   function bid() public payable notCancelled inBlockRange notAuctioneer {
        // Add to user's current bid (mappings default to 0 value)
        bids[msg.sender] += msg.value;
        if(msg.value > winningBid) {
            currentWinner = msg.sender;
            winningBid = msg.value;
        }
   }

   function withdrawWinningBid() public payable notCancelled afterEnd onlyAuctioneer {
       auctioneer.transfer(winningBid);
       winningBid = 0;
   }

   function withdraw() public cancelledOrEnded notWinner {
       payable(msg.sender).transfer(bids[msg.sender]);
       bids[msg.sender] = 0;
   }

   function cancelAuction() public notCancelled onlyAuctioneer inBlockRange {
      cancelled = true;
      emit LogCanceled();
   }

    function queryWinner() public notCancelled afterEnd {
        emit LogWinner(currentWinner);
    }

   event LogWinner(address winner);
   event LogCanceled();
}
