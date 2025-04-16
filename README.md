<div align="center">

# 🔐 Zero-Knowledge KYC Verification

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Material](https://img.shields.io/badge/Material-3f51b5?style=for-the-badge&logo=material-design&logoColor=white)](https://material.angular.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

A modern, privacy-focused Know Your Customer (KYC) verification system powered by Zero-Knowledge Proofs. Verify customer identities while maintaining complete privacy and security.

[🚀 Live Demo](https://alextmn.github.io/kyc-verification-app/verify) 

</div>

## ✨ Key Features

### 🔑 Privacy-First Verification
- Zero-Knowledge Proof technology ensures complete privacy
- No sensitive data is ever exposed or stored
- Real-time cryptographic key generation
- Secure EdDSA signatures for verification

### 📜 Digital KYC Certificates
- Professional, shareable certificates
- Embedded QR codes for instant verification
- Tamper-proof design
- Includes verification timestamp and signatures
- Bank-authorized verification status

### 🏦 Bank Integration
- Simulated bank verification process
- Secure public key infrastructure
- Real-time verification status
- Automated timestamp validation

### 🎨 Modern User Experience
- Clean, responsive Material Design interface
- Step-by-step verification process
- Real-time feedback and validation
- Mobile-friendly design
- Intuitive certificate sharing

## 🛠️ Technology Stack

- **Framework**: Angular 15+
- **Language**: TypeScript 4.9+
- **UI**: Angular Material
- **Cryptography**:
  - EdDSA (Edwards-curve Digital Signature Algorithm)
  - Zero-Knowledge Proofs ([Circom Circuits](https://github.com/alextmn/kyc-verification-circom))
  - Merkle Trees
- **Tools**: Node.js, npm

## 🚀 Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/kyc-verification-app.git
   cd kyc-verification-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start development server
   ```bash
   ng serve
   ```

4. Open `http://localhost:4200` in your browser

## 📝 Usage Guide

1. **Generate Keys** 🔑
   - Click "Generate New Key Pair"
   - System creates your unique cryptographic identity
   - Keys are generated securely in your browser

2. **Enter Information** 📋
   - Provide your name
   - System captures the current timestamp
   - Data is prepared for verification

3. **Get Certificate** 📜
   - System generates your zero-knowledge proof
   - Creates a professional KYC certificate
   - Includes QR code for easy sharing

4. **Verify Status** ✅
   - Instant proof verification
   - Check certificate authenticity
   - View verification status

## 🔒 Security Features

- **Zero-Knowledge Proofs**: Verify without revealing private data
- **EdDSA Signatures**: Tamper-proof certificates
- **No Data Storage**: All processing happens in your browser
- **Bank Verification**: Authorized by simulated bank infrastructure
- **Secure Sharing**: QR codes for easy, secure verification
- **Privacy First**: No sensitive information is ever exposed

## 🏗️ Architecture

### Core Components

```typescript
// Core service for cryptographic operations
@Injectable()
class KycService {
  generateProof()
  verifyProof()
  generateKeyPair()
}

// Main verification component
@Component()
class KycVerificationComponent {
  // Handles user interaction and proof generation
}

// Certificate dialog
@Component()
class ProofQrDialog {
  // Displays the KYC certificate with QR code
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ for privacy and security
</div>
