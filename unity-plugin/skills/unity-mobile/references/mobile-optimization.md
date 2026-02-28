# Mobile Platform Optimization

## IL2CPP Build Configuration

IL2CPP is Unity's scripting backend for iOS (required) and Android (recommended for release).

### Player Settings

```
// Build Settings > Player Settings > Other Settings
Scripting Backend: IL2CPP
API Compatibility Level: .NET Standard 2.1
Managed Stripping Level: High (smallest build, most aggressive)
```

### Managed Stripping Levels

| Level | Description | Risk |
|-------|-------------|------|
| Minimal | Removes unreachable code only | Safest |
| Low | Strips unused classes | Low risk |
| Medium | Strips unused methods and fields | Moderate risk |
| High | Aggressive stripping | May break reflection |

### Preserving Code from Stripping

When using reflection or serialization, IL2CPP stripping may remove needed types. Use `link.xml` to preserve them.

```xml
<!-- Assets/link.xml -->
<linker>
    <!-- Preserve entire assembly -->
    <assembly fullname="Assembly-CSharp" preserve="all"/>

    <!-- Preserve specific type -->
    <assembly fullname="Assembly-CSharp">
        <type fullname="MyNamespace.MyClass" preserve="all"/>
    </assembly>
</linker>
```

### IL2CPP Restrictions

- No `System.Reflection.Emit` (runtime code generation)
- No dynamic types (`dynamic` keyword)
- Generic virtual methods may require explicit instantiation
- Some LINQ expressions generate unsupported code paths

```csharp
// Problematic: generic virtual method
public virtual T GetValue<T>() { return default; }

// Safe: use non-generic base with casting
public virtual object GetValue() { return null; }
```

## Mobile Input Handling

### Touch Input

```csharp
void Update()
{
    if (Input.touchCount > 0)
    {
        Touch touch = Input.GetTouch(0);

        switch (touch.phase)
        {
            case TouchPhase.Began:
                OnTouchStart(touch.position);
                break;
            case TouchPhase.Moved:
                OnTouchMove(touch.position, touch.deltaPosition);
                break;
            case TouchPhase.Ended:
                OnTouchEnd(touch.position);
                break;
            case TouchPhase.Canceled:
                OnTouchCanceled();
                break;
        }
    }
}
```

### Multi-Touch Gesture Detection

```csharp
// Pinch zoom detection
if (Input.touchCount == 2)
{
    Touch touch0 = Input.GetTouch(0);
    Touch touch1 = Input.GetTouch(1);

    Vector2 prevPos0 = touch0.position - touch0.deltaPosition;
    Vector2 prevPos1 = touch1.position - touch1.deltaPosition;

    float prevDistance = (prevPos0 - prevPos1).magnitude;
    float currentDistance = (touch0.position - touch1.position).magnitude;

    float delta = currentDistance - prevDistance;
    OnPinchZoom(delta);
}
```

### Input System Package (Recommended)

```csharp
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.EnhancedTouch;

void OnEnable()
{
    EnhancedTouchSupport.Enable();
    UnityEngine.InputSystem.EnhancedTouch.Touch.onFingerDown += OnFingerDown;
}

void OnDisable()
{
    UnityEngine.InputSystem.EnhancedTouch.Touch.onFingerDown -= OnFingerDown;
    EnhancedTouchSupport.Disable();
}

void OnFingerDown(Finger finger)
{
    Vector2 screenPos = finger.screenPosition;
    HandleTouch(screenPos);
}
```

## Memory Management

### Memory Budgets

| Device Tier | Available RAM | Recommended Budget |
|-------------|--------------|-------------------|
| Low-end | 1-2 GB | < 200 MB |
| Mid-range | 3-4 GB | < 400 MB |
| High-end | 6+ GB | < 600 MB |

### Texture Compression Formats

| Format | Platform | Quality | Size |
|--------|----------|---------|------|
| ASTC | iOS & Android | Best | Smallest |
| ETC2 | Android (OpenGL ES 3.0+) | Good | Small |
| PVRTC | iOS (legacy) | Good | Small |

ASTC is recommended for all modern mobile devices. Use 6x6 block size for a balance of quality and size.

### Application Lifecycle

```csharp
void OnApplicationPause(bool isPaused)
{
    if (isPaused)
    {
        // App sent to background
        SaveProgress();
        PauseAudio();
        ReduceResourceUsage();
    }
    else
    {
        // App returned to foreground
        ResumeAudio();
        RestoreResourceUsage();
    }
}

void OnApplicationFocus(bool hasFocus)
{
    if (!hasFocus)
    {
        // App lost focus (notification overlay, etc.)
        Time.timeScale = 0f;
    }
    else
    {
        Time.timeScale = 1f;
    }
}
```

## Battery Optimization

### Frame Rate Management

```csharp
// Lower frame rate for less demanding scenes
Application.targetFrameRate = 30; // Menu, loading screens

// Higher frame rate for gameplay
Application.targetFrameRate = 60; // Active gameplay

// Adaptive frame rate based on thermal state (Unity 2022+)
void Update()
{
    if (SystemInfo.batteryLevel < 0.2f)
    {
        Application.targetFrameRate = 30;
    }
}
```

### Reducing GPU Load

```csharp
// Lower quality on battery
if (SystemInfo.batteryStatus == BatteryStatus.Discharging)
{
    QualitySettings.SetQualityLevel(0); // Low quality
    QualitySettings.shadows = ShadowQuality.Disable;
    QualitySettings.antiAliasing = 0;
}
```

## Platform-Specific Code

```csharp
#if UNITY_IOS
    // iOS-only code
    UnityEngine.iOS.Device.SetNoBackupFlag(savePath);
#elif UNITY_ANDROID
    // Android-only code
    using var javaClass = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
    var activity = javaClass.GetStatic<AndroidJavaObject>("currentActivity");
#endif

// Runtime platform check (for shared builds)
if (Application.platform == RuntimePlatform.IPhonePlayer)
{
    // iOS runtime
}
else if (Application.platform == RuntimePlatform.Android)
{
    // Android runtime
}
```

## App Size Reduction

- **Texture compression**: Use ASTC, reduce max resolution for mobile
- **Audio compression**: Vorbis for music, ADPCM for short SFX
- **Mesh optimization**: Reduce vertex count, use LODs
- **Managed stripping**: Set to High for smallest binary
- **Split Application Binary**: Enable for Android (APK + OBB or AAB)
- **On-demand resources**: Use Addressables for assets loaded after install
- **Strip Engine Code**: Remove unused Unity engine modules in Player Settings
