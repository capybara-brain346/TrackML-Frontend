# TrackML Frontend

A sophisticated web application for tracking and managing machine learning models, built with React and TypeScript. This application helps researchers and ML practitioners keep track of their model experiments, studies, and wishlists in an organized manner.

## 🌟 Features

- **Model Management**
  - Create, view, update, and delete ML model entries
  - Track model metadata including name, developer, type, status, and more
  - Organize models with custom tags
  - Add source links and documentation files
  - Compare multiple models side by side

- **Advanced Search Capabilities**
  - Full-text search across all model entries
  - Semantic search functionality for intelligent model discovery
  - Filter by model type, status, and tags
  - Real-time search results

- **Model Types Support**
  - Audio Models
  - Chatbots
  - Classification Models
  - Clustering Models
  - Code Assistants
  - Data Analysis Models
  - Diffusion Models
  - Forecasting Models
  - Image Editing Models
  - Large Language Models (LLMs)
  - Machine Translation Models
  - MultiModal Models
  - Named Entity Recognition (NER)
  - Object Detection Models
  - Recommendation Systems
  - Reinforcement Learning Models
  - Segmentation Models
  - Sentiment Analysis Models
  - Text Generation Models
  - Time Series Models
  - Vision Models
  - Voice Generation Models
  - And more...

## 🛠 Technology Stack

- **Frontend Framework**
  - React 18+
  - TypeScript
  - Vite (for blazing fast builds)

- **UI/UX**
  - TailwindCSS for styling
  - Responsive design
  - Modern component architecture
  - Interactive modals and forms

- **State Management**
  - React Context API
  - Custom hooks for business logic

- **Authentication**
  - Secure user authentication
  - Protected routes
  - User-specific model tracking

- **API Integration**
  - RESTful API consumption
  - Axios for HTTP requests
  - Error handling and loading states

- **Deployment**
  - AWS Amplify
  - Continuous Integration/Continuous Deployment (CI/CD)
  - Production-grade hosting

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn package manager
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/TrackML-Frontend.git
cd TrackML-Frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add necessary environment variables:
```env
VITE_API_URL=your_api_url
VITE_AUTH_DOMAIN=your_auth_domain
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

## 🌍 Deployment

This application is deployed using AWS Amplify. To deploy your own instance:

1. Set up an AWS account if you haven't already
2. Install and configure the AWS Amplify CLI
3. Initialize your Amplify project:
```bash
amplify init
```

4. Push your changes to Amplify:
```bash
amplify push
```

## 🧪 Testing

Run the test suite:
```bash
npm run test
# or
yarn test
```

## 📚 Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/      # React Context providers
├── pages/         # Page components
├── services/      # API and external service integrations
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── App.tsx        # Root component
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the build tool
- TailwindCSS team for the styling framework
- AWS Amplify team for the deployment platform
