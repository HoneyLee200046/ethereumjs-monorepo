# SYNOPSIS

[![Build Status](https://travis-ci.org/ethereumjs/ethereumjs-common.svg?branch=master)](https://travis-ci.org/ethereumjs/ethereumjs-common)
[![Coverage Status](https://img.shields.io/coveralls/ethereumjs/ethereumjs-common.svg?style=flat-square)](https://coveralls.io/r/ethereumjs/ethereumjs-common)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) 
[![Gitter](https://img.shields.io/gitter/room/ethereum/ethereumjs.svg?style=flat-square)]()

# ETHEREUMJS-COMMON
Resources common to all Ethereum implementations

Succeeds the old [ethereum/common](https://github.com/ethereumjs/common/) library.

# INSTALL
`npm install ethereumjs-common`

# USAGE

All parameters can be accessed through the ``Common`` class which can be required through the
main package and instantiated either with just the ``network`` (e.g. 'mainnet') or the ``network``
together with a specific ``hardfork`` provided.

Here are some simple usage examples:

```javascript
const Common = require('ethereumjs-common')

// Instantiate with only the network
let c = new Common('ropsten')
c.param('gasPrices', 'ecAddGas', 'byzantium') // 500

// Network and hardfork provided
c = new Common('ropsten', 'byzantium')
c.param('pow', 'minerReward') // 3000000000000000000

// Access genesis data for Ropsten network
c.genesis().hash // 0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d

// Get bootstrap nodes for network
c.bootstrapNodes() // Array with current nodes
```

# API

See the API documentation for a full list of functions for accessing specific network and
depending hardfork parameters. There are also additional helper functions like 
``paramByBlock (topic, name, blockNumber)`` or ``hardforkIsActiveOnBlock (hardfork, blockNumber)``
to ease ``blockNumber`` based access to parameters.

- [API Docs](./docs/index.md)


# Hardfork Params

There are currently parameter changes by the following past and future hardfork by the
library supported:

- ``chainstart``
- ``homestead``
- ``dao``
- ``tangerineWhistle``
- ``spuriousDragon``
- ``byzantium``
- ``constantinople`` (Draft)
- ``casper`` (Draft)


For hardfork-specific parameter access with the ``param()`` and ``paramByBlock()`` functions
you can use the following ``topics``:

- ``gasConfig``
- ``gasPrices``
- ``vm``
- ``pow``
- ``casper``
- ``sharding``

See one of the hardfork files like ``byzantium.json`` in the ``hardforks`` directory
for an overview. For consistency, the chain start (``chainstart``) is considered an own 
hardfork.

The hardfork-specific json files only contain the deltas from ``chainstart`` and
shouldn't be accessed directly until you have a specific reason for it.

Note: The list of ``gasPrices`` and gas price changes on hardforks is consistent 
but not complete, so there are currently gas price values missing (PRs welcome!).

# Network Params

Supported networks:

- ``mainnet``
- ``ropsten``
- ``rinkeby``
- ``kovan``

The following network-specific parameters are provided:

- ``name``
- ``networkID``
- ``genesis`` block header values
- ``hardforks`` block numbers
- ``bootstrapNodes`` list

To get an overview of the different parameters have a look at one of the network-specifc
files like ``mainnet.json`` in the ``networks`` directory.

# Bootstrap Nodes

There is no separate config file for bootstrap nodes like in the old ``ethereum-common`` library.
Instead use the ``common.bootstrapNodes()`` function to get nodes for a specific network.

# Genesis States

Network-specific genesis files are located in the ``genesisStates`` folder.

Due to the large file sizes genesis states are not directly included in the ``index.js`` file
but have to be accessed directly, e.g.:

```
const mainnetGenesisState = require('ethereumjs-common/genesisStates/mainnet')
```

# LICENSE
[MIT](https://opensource.org/licenses/MIT)
