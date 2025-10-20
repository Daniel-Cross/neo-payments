import { Keypair, PublicKey } from '@solana/web3.js';
import { transactionService } from '../services/transactionService';

/**
 * Test utility for verifying transaction service functionality
 * This helps you understand how the raw transaction mechanics work
 */
export class TransactionTest {
  
  /**
   * Test transaction creation without sending
   * This is safe to run - no actual transactions are sent
   */
  static async testTransactionCreation() {
    console.log('🧪 Testing transaction creation...');
    
    try {
      // Create test keypairs
      const sender = Keypair.generate();
      const recipient = Keypair.generate();
      
      console.log('📝 Sender:', sender.publicKey.toString());
      console.log('📝 Recipient:', recipient.publicKey.toString());
      
      // Test basic transaction creation
      const transferParams = {
        from: sender.publicKey,
        to: recipient.publicKey,
        amount: 0.001, // 0.001 SOL
        memo: 'Test transaction from Neo Wallet',
      };
      
      const transaction = await transactionService.createTransferTransaction(transferParams);
      console.log('✅ Transaction created successfully');
      console.log('📊 Transaction instructions:', transaction.instructions.length);
      
      // Test fee estimation
      const feeEstimate = await transactionService.estimateTransactionFee(transaction);
      console.log('💰 Estimated fee:', feeEstimate.feeInSOL, 'SOL');
      
      // Test address validation
      const isValidSender = transactionService.validateAddress(sender.publicKey.toString());
      const isValidRecipient = transactionService.validateAddress(recipient.publicKey.toString());
      const isValidInvalid = transactionService.validateAddress('invalid-address');
      
      console.log('✅ Sender address valid:', isValidSender);
      console.log('✅ Recipient address valid:', isValidRecipient);
      console.log('❌ Invalid address rejected:', !isValidInvalid);
      
      return {
        success: true,
        transaction,
        feeEstimate,
        validation: {
          sender: isValidSender,
          recipient: isValidRecipient,
          invalid: !isValidInvalid,
        },
      };
      
    } catch (error) {
      console.error('❌ Transaction creation test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Test transaction signing (without sending)
   * This is also safe - just tests the signing process
   */
  static async testTransactionSigning() {
    console.log('🔐 Testing transaction signing...');
    
    try {
      const sender = Keypair.generate();
      const recipient = Keypair.generate();
      
      const transferParams = {
        from: sender.publicKey,
        to: recipient.publicKey,
        amount: 0.001,
        memo: 'Test signing',
      };
      
      const transaction = await transactionService.createTransferTransaction(transferParams);
      
      // Sign the transaction
      const signedTransaction = transactionService.signTransaction(transaction, sender);
      
      console.log('✅ Transaction signed successfully');
      console.log('📝 Signature count:', signedTransaction.signatures.length);
      
      // Check if the signature is a SignaturePubkeyPair (has publicKey property)
      const firstSignature = signedTransaction.signatures[0];
      const signerVerified = 'publicKey' in firstSignature && firstSignature.publicKey.equals(sender.publicKey);
      console.log('🔑 Signer verified:', signerVerified);
      
      return {
        success: true,
        signedTransaction,
        signerVerified,
      };
      
    } catch (error) {
      console.error('❌ Transaction signing test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Test versioned transaction creation
   * This tests the newer, more efficient transaction format
   */
  static async testVersionedTransaction() {
    console.log('🚀 Testing versioned transaction...');
    
    try {
      const sender = Keypair.generate();
      const recipient = Keypair.generate();
      
      const transferParams = {
        from: sender.publicKey,
        to: recipient.publicKey,
        amount: 0.001,
        memo: 'Test versioned transaction',
      };
      
      const versionedTransaction = await transactionService.createVersionedTransferTransaction(transferParams);
      
      console.log('✅ Versioned transaction created');
      console.log('📊 Transaction version:', versionedTransaction.version);
      
      return {
        success: true,
        versionedTransaction,
      };
      
    } catch (error) {
      console.error('❌ Versioned transaction test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Run all tests
   * This gives you a comprehensive overview of transaction mechanics
   */
  static async runAllTests() {
    console.log('🎯 Running comprehensive transaction tests...\n');
    
    const results = {
      creation: await this.testTransactionCreation(),
      signing: await this.testTransactionSigning(),
      versioned: await this.testVersionedTransaction(),
    };
    
    console.log('\n📋 Test Results Summary:');
    console.log('Transaction Creation:', results.creation.success ? '✅ PASS' : '❌ FAIL');
    console.log('Transaction Signing:', results.signing.success ? '✅ PASS' : '❌ FAIL');
    console.log('Versioned Transaction:', results.versioned.success ? '✅ PASS' : '❌ FAIL');
    
    const allPassed = Object.values(results).every(result => result.success);
    console.log('\n🎉 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
    
    return results;
  }
}

/**
 * Helper function to run tests from anywhere in your app
 * Call this to verify your transaction service is working
 */
export const runTransactionTests = () => {
  return TransactionTest.runAllTests();
};
