// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint256 public count;

    event CountUpdated(uint256 newCount);

    function get() public view returns (uint256) {
        return count;
    }

    function inc() public {
        count += 1;
        emit CountUpdated(count);
    }

    function dec() public {
        count -= 1;
        emit CountUpdated(count);
    }
}
