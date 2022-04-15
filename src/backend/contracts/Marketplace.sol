// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    // State variable
    address payable public immutable feeAccount;
    uint public immutable feePercent;
    uint public itemCount;
    struct Item{
        uint itemID;
        IERC721 nft;
        uint tokenID;
        uint price;
        address payable seller;
        bool sold;
    }
    event Offered(
        uint itemID,
        address indexed nft,
        uint tokenID,
        uint price,
        address indexed seller
    );
    event Bought(
        uint itemID,
        address indexed nft,
        uint tokenID,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    mapping(uint => Item) public items;

    constructor(uint _feePercent){
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    function makeItem(IERC721 _nft, uint _tokenID, uint _price) external nonReentrant{
        require (_price > 0,"price must be greater than zero");
        itemCount ++;
        //nft transfer
        _nft.transferFrom(msg.sender, address(this), _tokenID);
        //adding new item to items mapping
        items[itemCount]= Item(
            itemCount,
            _nft,
            _tokenID,
            _price,
            payable(msg.sender),
            false
        );
        // emit offered event
        emit Offered(
            itemCount,
            address(_nft),
            _tokenID,
            _price,
            msg.sender
        );
        
    }

    function purchaseItem(uint _itemID) external payable nonReentrant{
        uint _totalPrice= getTotalPrice(_itemID);
        Item storage item = items[_itemID];
        require(_itemID>0 && _itemID<=itemCount, "item does not exist");
        require(msg.value >= _totalPrice, "not enough ether to buy item (including the fee)");
        require(!item.sold,"item already sold");
    
         //pay seller and feeAccount
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice-item.price);
        //update item to sold
        item.sold = true;
        //transfer nft to buyer
        item.nft.transferFrom(address(this),msg.sender,item.tokenID);
        //emiting bought event
        emit Bought(
            _itemID,
            address(item.nft),
            item.tokenID,
            item.price,
            item.seller,
            msg.sender
        );

    }
    function getTotalPrice(uint _itemID) view public returns(uint){
        return(items[_itemID].price*(100+feePercent)/100);
    }

}

