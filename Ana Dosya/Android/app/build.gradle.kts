plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.twoplayersnake.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.twoplayersnake.app"
        minSdk = 26
        targetSdk = 36
        versionCode = 69
        versionName = "v3.3.5"
        buildConfigField("String", "GAME_URL_MOBILE", "\"https://2playersnake.com/wp-content/uploads/game-mobile/index.html\"")
        buildConfigField("String", "GAME_URL_PC", "\"https://2playersnake.com/wp-content/uploads/game/index.html\"")

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    signingConfigs {
        create("release") {
            val keyFile = rootProject.file("../../Play Store Key/Play Store Key")
            storeFile = if (keyFile.exists()) keyFile else file("C:/Users/Toygun/Desktop/AI Games/2 Player Snake/Play Store Key/Play Store Key")
            storePassword = "Kimlik17251994."
            keyAlias = "key0"
            keyPassword = "Kimlik17251994."
        }
    }

    buildTypes {
        debug { }
        release {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.activity:activity-ktx:1.10.1")
    implementation("androidx.constraintlayout:constraintlayout:2.2.1")
    implementation("com.google.android.gms:play-services-ads:23.6.0")
    implementation("com.google.android.gms:play-services-games-v2:20.1.0")
    implementation("androidx.core:core-splashscreen:1.0.1")
    implementation("com.google.android.play:review-ktx:2.0.2")
    implementation("com.revenuecat.purchases:purchases:9.0.1")
    implementation("androidx.work:work-runtime-ktx:2.9.1")
}
