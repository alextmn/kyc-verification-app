import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as QRCode from 'qrcode';

export interface QrDialogData {
  proof: any;
  name: string;
  publicSignals?: any;
}

@Component({
  selector: 'app-proof-qr-dialog',
  templateUrl: './proof-qr-dialog.component.html',
  styleUrls: ['./proof-qr-dialog.component.css']
})
export class ProofQrDialogComponent implements OnInit {
  verificationDate: string = '';
  showPublicData = false;
  compressedSize = 0;
  qrDataUrl = '';
  loading = true;
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<ProofQrDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: QrDialogData
  ) {
    if (this.data.publicSignals) {
      this.verificationDate = this.formatDate(this.data.publicSignals[1]);
    }
  }

  formatPublicData(): string {
    if (!this.data.publicSignals) return '';

    const publicData = {
      clientName: this.data.name,
      clientPublicKey: this.data.publicSignals[0],
      verificationTime: this.verificationDate,
      bankPublicKey: {
        x: this.data.publicSignals[3],
        y: this.data.publicSignals[4]
      }
    };

    return JSON.stringify(publicData, null, 2);
  }

  private formatDate(timestamp: string): string {
    // Convert seconds to milliseconds for JavaScript Date
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private compressProof(proof: any): [string[], string] {
    const values: string[] = [];
    
    // Add pi_a values
    values.push(...proof.pi_a);
    
    // Add pi_b values (flatten the nested array)
    proof.pi_b.forEach((pair: string[]) => values.push(...pair));
    
    // Add pi_c values
    values.push(...proof.pi_c);
    
    return [values, this.data.name];
  }

  private decompressProof(values: string[]): any {
    let index = 0;
    
    // Extract pi_a (3 values)
    const pi_a = values.slice(index, index + 3);
    index += 3;
    
    // Extract pi_b (6 values, needs to be paired)
    const pi_b = [
      values.slice(index, index + 2),
      values.slice(index + 2, index + 4),
      values.slice(index + 4, index + 6)
    ];
    index += 6;
    
    // Extract pi_c (3 values)
    const pi_c = values.slice(index, index + 3);
    
    return {
      pi_a,
      pi_b,
      pi_c,
      protocol: 'groth16',
      curve: 'bn128'
    };
  }

  async ngOnInit() {
    try {
      const compressedData = this.compressProof(this.data.proof);
      const proofString = JSON.stringify(compressedData);
      this.compressedSize = new Blob([proofString]).size;
      this.qrDataUrl = await QRCode.toDataURL(proofString, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 400
      });
    } catch (error: any) {
      this.error = error.message || 'Failed to generate QR code';
    } finally {
      this.loading = false;
    }
  }

  close() {
    this.dialogRef.close();
  }

}
