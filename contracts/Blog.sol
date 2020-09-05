// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Blog {
    struct Post {
        uint256 id;
        string body;
        string author;
    }
    Post[] private posts;
    uint256 public nextId = 1;

    function create(string memory body, string memory author) public {
        posts.push(Post(nextId, body, author));
        nextId++;
    }

    function read(uint256 id)
        public
        view
        returns (
            uint256,
            string memory,
            string memory
        )
    {
        uint256 i = find(id);
        return (posts[i].id, posts[i].body, posts[i].author);
    }

    //   function destroy(uint id) public {
    //     uint i = find(id);
    //     delete users[i];
    //   }

    function find(uint256 id) internal view returns (uint256) {
        for (uint256 i = 0; i < posts.length; i++) {
            if (posts[i].id == id) {
                return i;
            }
        }
        revert("Post does not exist!");
    }

    function list() public view returns (Post[] memory) {
        return posts;
    }
}
