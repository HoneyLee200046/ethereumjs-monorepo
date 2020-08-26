[merkle-patricia-tree](../README.md) › ["baseTrie"](../modules/_basetrie_.md) › [Trie](_basetrie_.trie.md)

# Class: Trie

The basic trie interface, use with `import { BaseTrie as Trie } from 'merkle-patricia-tree'`.
In Ethereum applications stick with the [SecureTrie](_secure_.securetrie.md) overlay.
The API for the base and the secure interface are about the same.

## Hierarchy

* **Trie**

  ↳ [CheckpointTrie](_checkpointtrie_.checkpointtrie.md)

## Index

### Constructors

* [constructor](_basetrie_.trie.md#constructor)

### Properties

* [EMPTY_TRIE_ROOT](_basetrie_.trie.md#empty_trie_root)
* [db](_basetrie_.trie.md#db)

### Accessors

* [root](_basetrie_.trie.md#root)

### Methods

* [_createInitialNode](_basetrie_.trie.md#private-_createinitialnode)
* [_deleteNode](_basetrie_.trie.md#private-_deletenode)
* [_findDbNodes](_basetrie_.trie.md#private-_finddbnodes)
* [_findValueNodes](_basetrie_.trie.md#private-_findvaluenodes)
* [_formatNode](_basetrie_.trie.md#private-_formatnode)
* [_lookupNode](_basetrie_.trie.md#private-_lookupnode)
* [_saveStack](_basetrie_.trie.md#private-_savestack)
* [_setRoot](_basetrie_.trie.md#_setroot)
* [_updateNode](_basetrie_.trie.md#private-_updatenode)
* [_walkTrie](_basetrie_.trie.md#private-_walktrie)
* [batch](_basetrie_.trie.md#batch)
* [checkRoot](_basetrie_.trie.md#checkroot)
* [copy](_basetrie_.trie.md#copy)
* [createReadStream](_basetrie_.trie.md#createreadstream)
* [del](_basetrie_.trie.md#del)
* [findPath](_basetrie_.trie.md#findpath)
* [get](_basetrie_.trie.md#get)
* [put](_basetrie_.trie.md#put)
* [createProof](_basetrie_.trie.md#static-createproof)
* [fromProof](_basetrie_.trie.md#static-fromproof)
* [prove](_basetrie_.trie.md#static-prove)
* [verifyProof](_basetrie_.trie.md#static-verifyproof)

## Constructors

###  constructor

\+ **new Trie**(`db?`: LevelUp | null, `root?`: Buffer): *[Trie](_basetrie_.trie.md)*

*Defined in [baseTrie.ts:47](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L47)*

test

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`db?` | LevelUp &#124; null | A [levelup](https://github.com/Level/levelup) instance. By default (if the db is `null` or left undefined) creates an in-memory [memdown](https://github.com/Level/memdown) instance. |
`root?` | Buffer | A `Buffer` for the root of a previously stored trie  |

**Returns:** *[Trie](_basetrie_.trie.md)*

## Properties

###  EMPTY_TRIE_ROOT

• **EMPTY_TRIE_ROOT**: *Buffer*

*Defined in [baseTrie.ts:45](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L45)*

The root for an empty trie

___

###  db

• **db**: *DB*

*Defined in [baseTrie.ts:43](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L43)*

The backend DB

## Accessors

###  root

• **get root**(): *Buffer*

*Defined in [baseTrie.ts:71](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L71)*

Gets the current root of the `trie`

**Returns:** *Buffer*

• **set root**(`value`: Buffer): *void*

*Defined in [baseTrie.ts:66](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L66)*

Sets the current root of the `trie`

**Parameters:**

Name | Type |
------ | ------ |
`value` | Buffer |

**Returns:** *void*

## Methods

### `Private` _createInitialNode

▸ **_createInitialNode**(`key`: Buffer, `value`: Buffer): *Promise‹void›*

*Defined in [baseTrie.ts:304](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L304)*

Creates the initial node from an empty tree.

**Parameters:**

Name | Type |
------ | ------ |
`key` | Buffer |
`value` | Buffer |

**Returns:** *Promise‹void›*

___

### `Private` _deleteNode

▸ **_deleteNode**(`k`: Buffer, `stack`: TrieNode[]): *Promise‹void›*

*Defined in [baseTrie.ts:439](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L439)*

Deletes a node from the database.

**Parameters:**

Name | Type |
------ | ------ |
`k` | Buffer |
`stack` | TrieNode[] |

**Returns:** *Promise‹void›*

___

### `Private` _findDbNodes

▸ **_findDbNodes**(`onFound`: FoundNodeFunction): *Promise‹void›*

*Defined in [baseTrie.ts:740](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L740)*

Finds all nodes that are stored directly in the db
(some nodes are stored raw inside other nodes)
called by {@link ScratchReadStream}

**Parameters:**

Name | Type |
------ | ------ |
`onFound` | FoundNodeFunction |

**Returns:** *Promise‹void›*

___

### `Private` _findValueNodes

▸ **_findValueNodes**(`onFound`: FoundNodeFunction): *Promise‹void›*

*Defined in [baseTrie.ts:756](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L756)*

Finds all nodes that store k,v values
called by {@link TrieReadStream}

**Parameters:**

Name | Type |
------ | ------ |
`onFound` | FoundNodeFunction |

**Returns:** *Promise‹void›*

___

### `Private` _formatNode

▸ **_formatNode**(`node`: TrieNode, `topLevel`: boolean, `opStack`: BatchDBOp[], `remove`: boolean): *Buffer | null | Buffer‹› | Buffer‹›[][]*

*Defined in [baseTrie.ts:605](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L605)*

Formats node to be saved by `levelup.batch`.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`node` | TrieNode | - | the node to format. |
`topLevel` | boolean | - | if the node is at the top level. |
`opStack` | BatchDBOp[] | - | the opStack to push the node's data. |
`remove` | boolean | false | whether to remove the node (only used for CheckpointTrie). |

**Returns:** *Buffer | null | Buffer‹› | Buffer‹›[][]*

The node's hash used as the key or the rawNode.

___

### `Private` _lookupNode

▸ **_lookupNode**(`node`: Buffer | Buffer[]): *Promise‹TrieNode | null›*

*Defined in [baseTrie.ts:314](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L314)*

Retrieves a node from db by hash.

**Parameters:**

Name | Type |
------ | ------ |
`node` | Buffer &#124; Buffer[] |

**Returns:** *Promise‹TrieNode | null›*

___

### `Private` _saveStack

▸ **_saveStack**(`key`: Nibbles, `stack`: TrieNode[], `opStack`: BatchDBOp[]): *Promise‹void›*

*Defined in [baseTrie.ts:567](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L567)*

Saves a stack of nodes to the database.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`key` | Nibbles | the key. Should follow the stack |
`stack` | TrieNode[] | a stack of nodes to the value given by the key |
`opStack` | BatchDBOp[] | a stack of levelup operations to commit at the end of this funciton  |

**Returns:** *Promise‹void›*

___

###  _setRoot

▸ **_setRoot**(`value?`: Buffer): *void*

*Defined in [baseTrie.ts:75](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L75)*

**Parameters:**

Name | Type |
------ | ------ |
`value?` | Buffer |

**Returns:** *void*

___

### `Private` _updateNode

▸ **_updateNode**(`k`: Buffer, `value`: Buffer, `keyRemainder`: Nibbles, `stack`: TrieNode[]): *Promise‹void›*

*Defined in [baseTrie.ts:336](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L336)*

Updates a node.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`k` | Buffer | - |
`value` | Buffer | - |
`keyRemainder` | Nibbles | - |
`stack` | TrieNode[] |   |

**Returns:** *Promise‹void›*

___

### `Private` _walkTrie

▸ **_walkTrie**(`root`: Buffer, `onFound`: FoundNodeFunction): *Promise‹void›*

*Defined in [baseTrie.ts:208](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L208)*

Walks a trie until finished.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`root` | Buffer | - |
`onFound` | FoundNodeFunction | callback to call when a node is found |

**Returns:** *Promise‹void›*

Resolves when finished walking trie.

___

###  batch

▸ **batch**(`ops`: BatchDBOp[]): *Promise‹void›*

*Defined in [baseTrie.ts:639](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L639)*

The given hash of operations (key additions or deletions) are executed on the DB

**`example`** 
const ops = [
   { type: 'del', key: Buffer.from('father') }
 , { type: 'put', key: Buffer.from('name'), value: Buffer.from('Yuri Irsenovich Kim') }
 , { type: 'put', key: Buffer.from('dob'), value: Buffer.from('16 February 1941') }
 , { type: 'put', key: Buffer.from('spouse'), value: Buffer.from('Kim Young-sook') }
 , { type: 'put', key: Buffer.from('occupation'), value: Buffer.from('Clown') }
]
await trie.batch(ops)

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`ops` | BatchDBOp[] |   |

**Returns:** *Promise‹void›*

___

###  checkRoot

▸ **checkRoot**(`root`: Buffer): *Promise‹boolean›*

*Defined in [baseTrie.ts:86](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L86)*

Checks if a given root exists.

**Parameters:**

Name | Type |
------ | ------ |
`root` | Buffer |

**Returns:** *Promise‹boolean›*

___

###  copy

▸ **copy**(): *[Trie](_basetrie_.trie.md)*

*Defined in [baseTrie.ts:729](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L729)*

Creates a new trie backed by the same db.

**Returns:** *[Trie](_basetrie_.trie.md)*

___

###  createReadStream

▸ **createReadStream**(): *ReadStream*

*Defined in [baseTrie.ts:722](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L722)*

The `data` event is given an `Object` that has two properties; the `key` and the `value`. Both should be Buffers.

**Returns:** *ReadStream*

Returns a [stream](https://nodejs.org/dist/latest-v12.x/docs/api/stream.html#stream_class_stream_readable) of the contents of the `trie`

___

###  del

▸ **del**(`key`: Buffer): *Promise‹void›*

*Defined in [baseTrie.ts:135](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L135)*

Deletes a value given a `key`.

**Parameters:**

Name | Type |
------ | ------ |
`key` | Buffer |

**Returns:** *Promise‹void›*

A Promise that resolves once value is deleted.

___

###  findPath

▸ **findPath**(`key`: Buffer): *Promise‹Path›*

*Defined in [baseTrie.ts:149](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L149)*

Tries to find a path to the node for the given key.
It returns a `stack` of nodes to the closest node.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`key` | Buffer | the search key  |

**Returns:** *Promise‹Path›*

___

###  get

▸ **get**(`key`: Buffer): *Promise‹Buffer | null›*

*Defined in [baseTrie.ts:96](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L96)*

Gets a value given a `key`

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`key` | Buffer | the key to search for |

**Returns:** *Promise‹Buffer | null›*

A Promise that resolves to `Buffer` if a value was found or `null` if no value was found.

___

###  put

▸ **put**(`key`: Buffer, `value`: Buffer): *Promise‹void›*

*Defined in [baseTrie.ts:111](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L111)*

Stores a given `value` at the given `key`.

**Parameters:**

Name | Type |
------ | ------ |
`key` | Buffer |
`value` | Buffer |

**Returns:** *Promise‹void›*

A Promise that resolves once value is stored.

___

### `Static` createProof

▸ **createProof**(`trie`: [Trie](_basetrie_.trie.md), `key`: Buffer): *Promise‹[Proof](../modules/_basetrie_.md#proof)›*

*Defined in [baseTrie.ts:692](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L692)*

Creates a proof from a trie and key that can be verified using [Trie.verifyProof](_basetrie_.trie.md#static-verifyproof).

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`trie` | [Trie](_basetrie_.trie.md) | - |
`key` | Buffer |   |

**Returns:** *Promise‹[Proof](../modules/_basetrie_.md#proof)›*

___

### `Static` fromProof

▸ **fromProof**(`proof`: [Proof](../modules/_basetrie_.md#proof), `trie?`: [Trie](_basetrie_.trie.md)): *Promise‹[Trie](_basetrie_.trie.md)›*

*Defined in [baseTrie.ts:657](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L657)*

Saves the nodes from a proof into the trie. If no trie is provided a new one wil be instantiated.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`proof` | [Proof](../modules/_basetrie_.md#proof) | - |
`trie?` | [Trie](_basetrie_.trie.md) |   |

**Returns:** *Promise‹[Trie](_basetrie_.trie.md)›*

___

### `Static` prove

▸ **prove**(`trie`: [Trie](_basetrie_.trie.md), `key`: Buffer): *Promise‹[Proof](../modules/_basetrie_.md#proof)›*

*Defined in [baseTrie.ts:683](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L683)*

prove has been renamed to [Trie.createProof](_basetrie_.trie.md#static-createproof).

**`deprecated`** 

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`trie` | [Trie](_basetrie_.trie.md) | - |
`key` | Buffer |   |

**Returns:** *Promise‹[Proof](../modules/_basetrie_.md#proof)›*

___

### `Static` verifyProof

▸ **verifyProof**(`rootHash`: Buffer, `key`: Buffer, `proof`: [Proof](../modules/_basetrie_.md#proof)): *Promise‹Buffer | null›*

*Defined in [baseTrie.ts:708](https://github.com/ethereumjs/merkle-patricia-tree/blob/master/src/baseTrie.ts#L708)*

Verifies a proof.

**`throws`** If proof is found to be invalid.

**Parameters:**

Name | Type |
------ | ------ |
`rootHash` | Buffer |
`key` | Buffer |
`proof` | [Proof](../modules/_basetrie_.md#proof) |

**Returns:** *Promise‹Buffer | null›*

The value from the key.
