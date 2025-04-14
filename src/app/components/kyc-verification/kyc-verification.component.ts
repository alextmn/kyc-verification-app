import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProofQrDialogComponent } from '../proof-qr-dialog/proof-qr-dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KycService, KeyPair, ProofData, VerificationResult } from '../../services/kyc.service';

@Component({
  selector: 'app-kyc-verification',
  templateUrl: './kyc-verification.component.html',
  styleUrls: ['./kyc-verification.component.scss']
})
export class KycVerificationComponent implements OnInit {
  proofForm: FormGroup;
  isValidPublicSignals = true;
  isValidProof = true;
  kycForm: FormGroup;
  clientKeyPair: KeyPair | null = null;
  proofData: ProofData | null = null;
  verificationResult: VerificationResult | null = null;
  loading = false;
  error: string | null = null;
  bankPublicKey: { x: string; y: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private kycService: KycService,
    private dialog: MatDialog
  ) {
    this.proofForm = this.fb.group({
      publicSignals: ['', [Validators.required]],
      proof: ['', [Validators.required]]
    });
    // Format current date-time for datetime-local input
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    this.kycForm = this.fb.group({
      clientName: ['John Doe', Validators.required],
      dateTime: [formattedDateTime, Validators.required]
    });
  }

  async ngOnInit() {
    try {
      await this.kycService.initialize();
      this.bankPublicKey = this.kycService.getBankPublicKey();
      this.generateNewKeyPair();
    } catch (error) {
      this.error = 'Failed to initialize KYC service';
      console.error(error);
    }
  }

  generateNewKeyPair() {
    try {
      this.clientKeyPair = this.kycService.generateKeyPair();
      this.proofData = null;
      this.verificationResult = null;
    } catch (error) {
      this.error = 'Failed to generate key pair';
      console.error(error);
    }
  }

  async generateProof() {
    if (!this.kycForm.valid || !this.clientKeyPair) return;

    this.loading = true;
    this.error = null;
    
    try {
      const { clientName } = this.kycForm.value;
      const dateTime = Math.floor(Date.now() / 1000).toString();

      this.proofData = await this.kycService.generateProof(
        this.clientKeyPair.publicKey.x,
        dateTime,
        clientName
      );

      // Initialize form with formatted JSON
      this.proofForm.patchValue({
        publicSignals: JSON.stringify(this.proofData.publicSignals, null, 2),
        proof: JSON.stringify(this.proofData.proof, null, 2)
      });
      this.isValidPublicSignals = true;
      this.isValidProof = true;

      this.verificationResult = null;

      // Subscribe to form changes
      this.proofForm.get('publicSignals')?.valueChanges.subscribe(text => this.updatePublicSignals(text));
      this.proofForm.get('proof')?.valueChanges.subscribe(text => this.updateProof(text));
    } catch (error) {
      this.error = 'Failed to generate proof';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  private updatePublicSignals(text: string) {
    try {
      const parsedSignals = JSON.parse(text);
      if (this.proofData) {
        this.proofData.publicSignals = parsedSignals;
        this.isValidPublicSignals = true;
      }
    } catch (e) {
      this.isValidPublicSignals = false;
    }
  }

  showQrCode() {
    try {
      const proofText = this.proofForm.get('proof')?.value;
      const publicSignalsText = this.proofForm.get('publicSignals')?.value;
      if (!proofText || !publicSignalsText) return;

      const proof = JSON.parse(proofText);
      const publicSignals = JSON.parse(publicSignalsText);
      const name = this.kycForm.get('clientName')?.value || 'Unknown';
      
      this.dialog.open(ProofQrDialogComponent, {
        data: { proof, name, publicSignals },
        width: '800px',
        maxHeight: '90vh'
      });
    } catch (e) {
      // Error will be handled by form validation
    }
  }

  private updateProof(text: string) {
    try {
      const parsedProof = JSON.parse(text);
      if (this.proofData) {
        this.proofData.proof = parsedProof;
        this.isValidProof = true;
      }
    } catch (e) {
      this.isValidProof = false;
    }
  }

  async verifyProof() {
    if (!this.proofData) return;

    this.loading = true;
    this.error = null;

    try {
      this.verificationResult = await this.kycService.verifyProof(this.proofData);
    } catch (error) {
      this.error = 'Failed to verify proof';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}
