import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import * as snarkjs from 'snarkjs';

import { buildEddsa, buildBabyjub, buildPoseidon } from 'circomlibjs';

export interface ProofInput {
  [key: string]: string | number;  // Index signature for CircuitSignals compatibility
  clientPublicKey: string;
  dateTime: string;
  clientName: string;
  enabled: number;
  Ax: string;
  Ay: string;
  R8x: string;
  R8y: string;
  S: string;
}

export interface KeyPair {
  privateKey: string;
  publicKey: {
    x: string;
    y: string;
  };
}

export interface ProofData {
  proof: any;
  publicSignals: any[];
}

export interface VerificationResult {
  verified: boolean;
  publicSignals: {
    clientPublicKey: string;
    dateTime: string;
    clientName: string;
    bankPublicKey: {
      x: string;
      y: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class KycService {
  private eddsa: any;
  private babyJub: any;
  private poseidon: any;
  private F: any;
  private bankPublicKey: any;
  private initialized = false;

  // Bank's private key (in production, this would be securely stored)
  private bankPrivateKey = Uint8Array.from(
    "0001020304050607080900010203040506070809000102030405060708090001"
      .match(/.{1,2}/g)!
      .map(byte => parseInt(byte, 16))
  );

  constructor() {}

  getBankPublicKey(): { x: string; y: string } | null {
    if (!this.initialized) return null;
    return {
      x: this.F.toObject(this.bankPublicKey[0]).toString(),
      y: this.F.toObject(this.bankPublicKey[1]).toString()
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.eddsa = await buildEddsa();
    this.babyJub = await buildBabyjub();
    this.poseidon = await buildPoseidon();
    this.F = this.babyJub.F;
    this.bankPublicKey = this.eddsa.prv2pub(this.bankPrivateKey);
    this.initialized = true;
  }

  generateKeyPair(): KeyPair {
    if (!this.initialized) throw new Error('KYC Service not initialized');

    // Generate a new random private key
    const privateKey = Uint8Array.from(Array(32).fill(0).map(() => Math.floor(Math.random() * 256)));
    const publicKey = this.eddsa.prv2pub(privateKey);
    
    return {
      privateKey: Array.from(privateKey).map(b => b.toString(16).padStart(2, '0')).join(''),
      publicKey: {
        x: this.F.toObject(publicKey[0]).toString(),
        y: this.F.toObject(publicKey[1]).toString()
      }
    };
  }

  private stringToFieldElement(str: string): bigint {
    // Convert string to bytes
    const bytes = new TextEncoder().encode(str);
    
    // Convert bytes to hex string
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Pad with zeros if needed to ensure even length
    const paddedHex = hex.length % 2 === 0 ? hex : '0' + hex;
    
    // Convert to BigInt
    return BigInt('0x' + paddedHex);
  }

  async generateProof(clientPublicKey: string, dateTime: string, clientName: string): Promise<ProofData> {
    if (!this.initialized) throw new Error('KYC Service not initialized');

    // Convert inputs to field elements
    const clientPubKeyBigInt = BigInt(clientPublicKey);
    const dateTimeBigInt = BigInt(dateTime);
    const clientNameBigInt = this.stringToFieldElement(clientName);

    // Calculate Merkle root
    const intermediate = this.poseidon.F.toObject(this.poseidon([clientPubKeyBigInt, dateTimeBigInt]));
    const root = this.poseidon.F.toObject(this.poseidon([intermediate, clientNameBigInt]));

    // Sign the root with bank's private key
    const signature = this.eddsa.signPoseidon(this.bankPrivateKey, this.F.e(root));

    // Prepare the proof inputs
    const input: ProofInput = {
      clientPublicKey: clientPubKeyBigInt.toString(),
      dateTime: dateTimeBigInt.toString(),
      clientName: clientNameBigInt.toString(),
      enabled: 1,
      Ax: this.F.toObject(this.bankPublicKey[0]).toString(),
      Ay: this.F.toObject(this.bankPublicKey[1]).toString(),
      R8x: this.F.toObject(signature.R8[0]).toString(),
      R8y: this.F.toObject(signature.R8[1]).toString(),
      S: signature.S.toString()
    };

    // Generate the proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      'assets/merkle_verify_signed.wasm',
      'assets/merkle_verify_signed_0001.zkey'
    );

    return { proof, publicSignals };
  }

  async verifyProof(proofData: ProofData): Promise<VerificationResult> {
    if (!this.initialized) throw new Error('KYC Service not initialized');

    try {
      const vKey = await fetch('assets/verification_key.json').then(res => res.json());
      const verified = await snarkjs.groth16.verify(vKey, proofData.publicSignals, proofData.proof);

      const [clientPubKey, dateTimeValue, clientNameValue, bankAx, bankAy] = proofData.publicSignals;

      return {
        verified,
        publicSignals: {
          clientPublicKey: clientPubKey,
          dateTime: dateTimeValue,
          clientName: new TextDecoder().decode(
            Uint8Array.from(
              BigInt(clientNameValue).toString(16).match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
            )
          ),
          bankPublicKey: {
            x: bankAx,
            y: bankAy
          }
        }
      };
    } catch (error: any) {
      console.error('Proof verification error:', error);
      return {
        verified: false,
        publicSignals: {
          clientPublicKey: '',
          dateTime: '',
          clientName: '',
          bankPublicKey: {
            x: '',
            y: ''
          }
        }
      };
    }
  }
}
