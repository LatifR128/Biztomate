const fs = require('fs');
const path = require('path');

// Import the configuration
const { AppConfig } = require('../config/app.config.js');

function generateAppJson() {
  const appJson = {
    expo: {
      name: AppConfig.app.name,
      slug: AppConfig.app.slug,
      version: AppConfig.app.version,
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: AppConfig.app.slug,
      userInterfaceStyle: "automatic",
      splash: {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: AppConfig.ui.backgroundColor,
      },
      ios: {
        supportsTablet: true,
        bundleIdentifier: AppConfig.bundle.ios,
        buildNumber: AppConfig.app.buildNumber,
        appStoreUrl: AppConfig.apple.appStoreUrl,
        requireFullScreen: false,
        backgroundColor: AppConfig.ui.backgroundColor,
        icon: "./assets/images/icon.png",
        splash: {
          image: "./assets/images/splash-icon.png",
          resizeMode: "contain",
          backgroundColor: AppConfig.ui.backgroundColor,
        },
        infoPlist: {
          NSCameraUsageDescription: AppConfig.permissions.camera.message,
          NSPhotoLibraryUsageDescription: AppConfig.permissions.photoLibrary.message,
          CFBundleDisplayName: AppConfig.app.name,
          CFBundleName: AppConfig.app.name,
          CFBundleShortVersionString: AppConfig.app.version,
          CFBundleVersion: AppConfig.app.buildNumber,
          ITSAppUsesNonExemptEncryption: false,
          UIStatusBarStyle: "dark-content",
          UIViewControllerBasedStatusBarAppearance: false,
          UIBackgroundModes: [],
          UIRequiresFullScreen: false,
          UIRequiresPersistentWiFi: false,
          UISupportedInterfaceOrientations: ["UIInterfaceOrientationPortrait"],
          UISupportedInterfaceOrientations_ipad: [
            "UIInterfaceOrientationPortrait",
            "UIInterfaceOrientationPortraitUpsideDown",
            "UIInterfaceOrientationLandscapeLeft",
            "UIInterfaceOrientationLandscapeRight"
          ],
        },
      },
      plugins: [
        [
          "expo-router",
          {
            origin: "https://biztomate.com/",
          },
        ],
        [
          "expo-camera",
          {
            cameraPermission: AppConfig.permissions.camera.message,
          },
        ],
        [
          "expo-image-picker",
          {
            photosPermission: AppConfig.permissions.photoLibrary.message,
          },
        ],
      ],
      experiments: {
        typedRoutes: true,
      },
      extra: {
        router: {
          origin: "https://biztomate.com/",
        },
        eas: {
          projectId: AppConfig.eas.projectId,
          appleId: AppConfig.apple.appleId,
          developerId: AppConfig.apple.developerId,
          teamId: AppConfig.apple.teamId,
        },
      },
      owner: "latifr",
    },
  };

  return appJson;
}

function generateEasJson() {
  const easJson = {
    cli: {
      version: ">= 5.9.1",
    },
    build: {
      development: {
        developmentClient: true,
        distribution: "internal",
        ios: {
          resourceClass: "m-medium",
        },
      },
      preview: {
        distribution: "internal",
        ios: {
          resourceClass: "m-medium",
        },
      },
      production: {
        ios: {
          resourceClass: "m-medium",
        },
      },
    },
    submit: {
      production: {
        ios: {
          appleId: AppConfig.apple.appleId,
          appleTeamId: AppConfig.apple.teamId,
        },
      },
    },
  };

  return easJson;
}

function main() {
  try {
    console.log('🔄 Generating configuration files...');

    // Generate app.json
    const appJson = generateAppJson();
    fs.writeFileSync(
      path.join(__dirname, '..', 'app.json'),
      JSON.stringify(appJson, null, 2)
    );
    console.log('✅ Generated app.json');

    // Generate eas.json
    const easJson = generateEasJson();
    fs.writeFileSync(
      path.join(__dirname, '..', 'eas.json'),
      JSON.stringify(easJson, null, 2)
    );
    console.log('✅ Generated eas.json');

    console.log('🎉 Configuration generation completed successfully!');
  } catch (error) {
    console.error('❌ Error generating configuration:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateAppJson, generateEasJson }; 