import Common from '@ethereumjs/common'
import { default as LegacyTransaction } from './legacyTransaction'
import { default as EIP2930Transaction } from './eip2930Transaction'
import { TxOptions, Transaction } from './types'

const DEFAULT_COMMON = new Common({ chain: 'mainnet' })

export default class TransactionFactory {
  // It is not possible to instantiate a TransactionFactory object.
  private constructor() {}

  /**
   * This method tries to decode `raw` data. It is somewhat equivalent to `fromRlpSerializedTx`.
   * However, it could be that the data is not directly RLP-encoded (it is a Typed Transaction)
   * @param rawData - The raw data buffer
   * @param transactionOptions - The transaction options
   */
  public static fromRawData(rawData: Buffer, transactionOptions: TxOptions): Transaction {
    const common = transactionOptions.common ?? DEFAULT_COMMON
    if (rawData[0] <= 0x7f) {
      // It is an EIP-2718 Typed Transaction
      if (!common.eips().includes(2718)) {
        throw new Error('Cannot create a TypedTransaction: EIP-2718 is not enabled')
      }
      // Determine the type.
      let EIP: number
      switch (rawData[0]) {
        case 1:
          EIP = 2930
          break
        default:
          throw new Error(`TypedTransaction with ID ${rawData[0]} unknown`)
      }

      if (!common.eips().includes(EIP)) {
        throw new Error(
          `Cannot create TypedTransaction with ID ${rawData[0]}: EIP ${EIP} not activated`
        )
      }

      return EIP2930Transaction.fromRlpSerializedTx(rawData, transactionOptions)
    } else {
      return LegacyTransaction.fromRlpSerializedTx(rawData, transactionOptions)
    }
  }

  /**
   * When decoding a BlockBody, in the transactions field, a field is either:
   * A Buffer (a TypedTransaction - encoded as TransactionType || rlp(TransactionPayload))
   * A Buffer[] (LegacyTransaction)
   * This method returns the right transaction.
   * @param rawData - Either a Buffer or a Buffer[]
   * @param transactionOptions - The transaction options
   */
  public static fromBlockBodyData(rawData: Buffer | Buffer[], transactionOptions: TxOptions) {
    if (Buffer.isBuffer(rawData)) {
      return this.fromRawData(rawData, transactionOptions)
    } else if (Array.isArray(rawData)) {
      // It is a LegacyTransaction
      return LegacyTransaction.fromValuesArray(rawData, transactionOptions)
    } else {
      throw new Error('Cannot decode transaction: unknown type input')
    }
  }

  /**
   * This helper method allows one to retrieve the class which matches the transactionID
   * If transactionID is undefined, return the LegacyTransaction class.
   * @param transactionID
   * @param common
   */
  public static getTransactionClass(transactionID?: number, common?: Common) {
    const usedCommon = common ?? DEFAULT_COMMON
    if (transactionID) {
      if (transactionID !== 0 && !usedCommon.eips().includes(2718)) {
        throw new Error('Cannot create a TypedTransaction: EIP-2718 is not enabled')
      }
      switch (transactionID) {
        case 0: 
          return LegacyTransaction
        case 1:
          return EIP2930Transaction
        default:
          throw new Error(`TypedTransaction with ID ${transactionID} unknown`)
      }
    }
  }
}
