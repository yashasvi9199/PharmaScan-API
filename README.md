# PharmaScan-API

> **Sophisticated OCR & Intelligence Engine for Pharmaceutical Analysis**

PharmaScan-API is an enterprise-grade backend system designed to extract, analyze, and identify pharmaceutical products from image data. Leveraging an advanced OCR pipeline and intelligent fuzzy matching, it provides high-accuracy drug detection even from low-quality scans.

---

## 🚀 Core Capabilities

- **High-Fidelity OCR**: Multi-stage image preprocessing (Adaptive Contrast, Binarization, Denoising) via `sharp`.
- **Intelligent Identification**: Fuzzy search algorithms powered by `Fuse.js` for precise drug detection.
- **Production Resilience**: Built with TypeScript and a modular, layered architecture.
- **Container Optimized**: Multi-stage Docker integration for seamless deployment.

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express 5.0
- **Language**: TypeScript 5.x
- **Vision**: Tesseract.js & Sharp
- **Search**: Fuse.js
- **Persistence**: Modular JSON/PostgreSQL Store

## 📦 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Tesseract OCR system libraries (for native performance)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd PharmaScan-API

# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot-reload
npm run dev
```

### Build & Production

```bash
# Compile TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## 🐳 Docker Integration

The project includes a multi-stage Dockerfile optimized for production environments.

```bash
# Build the image
docker build -t pharmascan-api .

# Run the container
docker run -p 3000:3000 pharmascan-api
```

## 🔌 API Endpoints

| Method | Endpoint        | Description                           |
| :----- | :-------------- | :------------------------------------ |
| `POST` | `/api/scan`     | Upload image for OCR & drug detection |
| `GET`  | `/api/products` | Retrieve pharmaceutical product list  |
| `GET`  | `/api/history`  | View scan history with analytics      |
| `GET`  | `/api/lookup`   | Fuzzy search for specific medications |
| `POST` | `/api/auth`     | User authentication & sessions        |

## 📐 Architecture

The codebase follows a clean, layered architecture:

- **Controllers**: Request handling and response orchestration.
- **Services**: Core business logic and OCR pipeline management.
- **Repositories**: Data access and persistence abstraction.
- **Middlewares**: Security, file uploads, and validation.
- **Lib**: Low-level engine adapters (OCR, Image).

---

## 📄 License

This project is licensed under the ISC License.
