// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8; //>=0.8.7 <0.9.0 //^0.8.7; // 0.8.12 ^ means that any versuib above the selected, it means it will use any versuib abice ut

contract SimpleStorage {
    //boolean, uint, int, address, bytes

    uint256 favoriteNumber;

    mapping(string => uint256) public nameToFavoriteNumber;

    struct People {
        uint256 favoriteNumber;
        string name;
    }

    uint256[] public favoriteNumbersList;
    People[] public people;

    function store(uint256 _favoriteNumber) public virtual {
        favoriteNumber = _favoriteNumber;

        retrieve();
    }

    function retrieve() public view returns (uint256) {
        return favoriteNumber;
    }

    function addPerson(string memory _name, uint256 _favoriteNumber) public {
        people.push(People(_favoriteNumber, _name));
        nameToFavoriteNumber[_name] = _favoriteNumber;
    }
}
