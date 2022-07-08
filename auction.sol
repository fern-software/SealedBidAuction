pragma solidity >=0.8.0 <0.9.0;
/*
Implements a sealed bid auction where bidders can know who they are bidding against but not the amounts of the bids.
Users can bid after the contract is constructed until endBlock. No withdrawls can happen during endBlock but afterwards 2 things can happen:
1) Losing bidders can withdraw their bids
2) The auctioneer can withdraw the winning bid
The winning bidder's address is also logged after the bidding has ended
*/
contract SealedBidAuction {
   // Setup
   address payable public auctioneer;
   uint public startBlock;
   uint public endBlock;
   address public auctionWinner;

   // State
   bool public cancelled;

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
      // See if user already has a bid and add their current bid to it if so
      bids[msg.sender] += msg.value;

   }

   function withdrawWinningBid() public notCancelled afterEnd onlyAuctioneer {}
   function withdraw() public cancelledOrEnded {}
   function cancelAuction() public notCancelled onlyAuctioneer inBlockRange {
      cancelled = true;
   }

   function determineWinner() public notCancelled afterEnd {}

   event LogWinner(address winner);
   event LogCanceled();
}
