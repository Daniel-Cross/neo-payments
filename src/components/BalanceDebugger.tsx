import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useTheme } from '../contexts/ThemeContext';
import { GradientButton } from './GradientButton';
import { ButtonVariant, getSolanaRpcEndpoints } from '../constants/enums';

export default function BalanceDebugger() {
  const { theme } = useTheme();
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const checkBalance = async () => {
    setIsLoading(true);
    setResults([]);
    
    const walletAddress = '8A4AptCThfbuknsbteHgGKXczfJpfjuVA9SLTSGaaLGC';
    const publicKey = new PublicKey(walletAddress);
    
    const rpcEndpoints = getSolanaRpcEndpoints();
    const newResults: string[] = [];
    newResults.push(`Checking balance for: ${walletAddress}`);
    newResults.push('='.repeat(50));
    
    for (let i = 0; i < rpcEndpoints.length; i++) {
      const endpoint = rpcEndpoints[i];
      newResults.push(`\nEndpoint ${i + 1}: ${endpoint}`);
      
      try {
        const connection = new Connection(endpoint, {
          commitment: 'confirmed',
          confirmTransactionInitialTimeout: 15000,
          disableRetryOnRateLimit: true,
          httpHeaders: {
            'User-Agent': 'Neo-Payments-Wallet/1.0',
          },
        });
        
        const balance = await connection.getBalance(publicKey);
        const solBalance = balance / LAMPORTS_PER_SOL;
        
        newResults.push(`✅ ${solBalance.toFixed(6)} SOL (${balance} lamports)`);
        
      } catch (error) {
        newResults.push(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    newResults.push('\n' + '='.repeat(50));
    newResults.push('Note: This only shows native SOL, not SPL tokens');
    
    setResults(newResults);
    setIsLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.DARK_PURPLE }]}>
      <Text style={[styles.title, { color: theme.text.SOFT_WHITE }]}>
        Balance Debugger
      </Text>
      
      <GradientButton
        title={isLoading ? "Checking..." : "Check Balance"}
        onPress={checkBalance}
        variant={ButtonVariant.PRIMARY}
        disabled={isLoading}
        style={styles.button}
      />
      
      <View style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={index} style={[styles.resultText, { color: theme.text.SOFT_WHITE }]}>
            {result}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginBottom: 20,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 10,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});
