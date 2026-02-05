# Features

## OCR & Image Processing

- **Advanced Preprocessing Pipeline**: Adaptive contrast enhancement, binarization, and noise reduction using `sharp`.
- **Intelligent Region Isolation**: Automatic detection and extraction of text density areas.
- **Multi-Engine OCR**: Tesseract.js optimized with custom PSM modes and LSTM OCR engine.
- **Quality Validation**: Real-time confidence scoring and text quality analysis.

## Intelligence & Search

- **Fuzzy Drug Detection**: Intelligent matching of extracted text against drug dictionaries using `Fuse.js`.
- **Normalization Engine**: Advanced text cleaning and normalization for improved matching accuracy.

## Core API

- **Modular Architecture**: Clean separation of concerns with TypeScript-based controllers, services, and repositories.
- **Persistence Layer**: Reliable JSON-based data store with easy migration paths to PostgreSQL.
- **Security**: Built-in authentication and middleware-based request validation.
- **Scan History**: Comprehensive tracking of user scans with metadata and confidence levels.

## Infrastructure

- **Docker Support**: Multi-stage production Dockerfile with Tesseract system dependencies.
- **Deployment Ready**: Optimized for Render and other serverless/container platforms.
- **TypeScript First**: Full type safety across the entire codebase.
