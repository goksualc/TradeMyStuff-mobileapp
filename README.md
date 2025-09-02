# Trade My Stuff - React Native Mobile App

A comprehensive React Native mobile application for the Trade My Stuff marketplace, connecting to the existing website backend at https://trademystuffmarketplace.com.

## Features

### 🔐 Authentication
- User registration and login
- Password recovery
- Secure token management
- Persistent authentication state

### 🛍️ Product Management
- Browse featured and recent products
- Advanced search with filters (category, condition, price range, location)
- Product details with images and seller information
- Create, edit, and manage product listings
- Product status management (available, sold, pending)

### 👥 User Profiles
- Complete user profile management
- Avatar upload and customization
- User statistics and ratings
- Public profile viewing
- Follow/unfollow functionality

### 💬 Real-time Chat
- Direct messaging between buyers and sellers
- Product-specific conversations
- Unread message indicators
- Message status tracking

### 🔍 Search & Discovery
- Real-time search functionality
- Advanced filtering options
- Category-based browsing
- Location-based product discovery

## Tech Stack

- **Framework**: React Native 0.72.6
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation v6
- **UI Components**: React Native Paper
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Icons**: React Native Vector Icons
- **Images**: React Native Fast Image

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth)
├── navigation/         # Navigation configuration
├── screens/            # App screens
│   ├── auth/          # Authentication screens
│   └── main/          # Main app screens
├── services/           # API services
├── store/              # Redux store and slices
├── theme/              # App theme configuration
└── types/              # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- CocoaPods (for iOS dependencies)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trademystuff-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS specific setup (macOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Start Metro bundler**
   ```bash
   npm start
   ```

5. **Run the app**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   ```

## Configuration

### Environment Variables

The app is configured to connect to the production backend at `https://trademystuffmarketplace.com`. To use a different backend:

1. Update the `BASE_URL` in `src/services/api.ts`
2. Ensure your backend implements the expected API endpoints

### API Endpoints

The app expects the following API structure:

- **Authentication**: `/api/auth/*`
- **Products**: `/api/products/*`
- **Users**: `/api/users/*`
- **Chat**: `/api/chat/*`

## Development

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations
- Use consistent naming conventions

### State Management

- Use Redux Toolkit for global state
- Implement proper loading and error states
- Use async thunks for API calls
- Maintain normalized data structures

### Navigation

- Use React Navigation v6
- Implement proper navigation types
- Handle deep linking when needed
- Maintain navigation state consistency

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Building for Production

### Android

```bash
cd android
./gradlew assembleRelease
```

### iOS

```bash
cd ios
xcodebuild -workspace TrademyStuff-mobileapp.xcworkspace -scheme TrademyStuff-mobileapp -configuration Release archive -archivePath build/TrademyStuff-mobileapp.xcarchive
```

## Deployment

### Android

1. Generate a signed APK/AAB
2. Upload to Google Play Console
3. Configure release notes and metadata

### iOS

1. Archive the app in Xcode
2. Upload to App Store Connect
3. Configure app store information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

- [ ] Push notifications
- [ ] Offline support
- [ ] Image upload functionality
- [ ] Payment integration
- [ ] Social features (sharing, following)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Accessibility improvements

## Acknowledgments

- React Native community
- React Navigation team
- Redux Toolkit contributors
- React Native Paper team
# TradeMyStuff-mobileapp
