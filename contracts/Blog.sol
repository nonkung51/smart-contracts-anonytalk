// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Blog {
  struct Post {
    uint id;
    string body;
    string author;
  }
  Post[] private posts;
  uint public nextId = 1;

  function create(string memory body) public {
    posts.push(Post(nextId, body, "test"));
    nextId++;
  }

  function read(uint id) view public returns(uint, string memory, string memory) {
    uint i = find(id);
    return(posts[i].id, posts[i].body, posts[i].author);
  }

//   function destroy(uint id) public {
//     uint i = find(id);
//     delete users[i];
//   }

  function find(uint id) view internal returns(uint) {
    for(uint i = 0; i < posts.length; i++) {
      if(posts[i].id == id) {
        return i;
      }
    }
    revert('Post does not exist!');
  }
  
  function list() view public returns(Post[] memory) {
      return posts;
  }
}