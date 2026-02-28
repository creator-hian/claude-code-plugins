# Unity UI Systems Reference

## UI Toolkit vs UGUI Decision Guide

| Criteria | UI Toolkit | UGUI (Canvas) |
|----------|-----------|---------------|
| Runtime game UI | Supported (Unity 2022+) | Mature, widely used |
| Editor extensions | Primary choice | Not supported |
| Styling | USS (CSS-like) | Inspector + code |
| Layout | Flexbox model | RectTransform + anchors |
| Performance | Better for complex UIs | Good, needs Canvas splitting |
| World-space UI | Limited support | Full support |
| 3rd party assets | Growing ecosystem | Large ecosystem |
| Learning resources | Newer, less coverage | Extensive documentation |

### When to Use UI Toolkit
- Editor tools and custom inspectors
- Complex, text-heavy runtime UI (menus, inventory, settings)
- Projects starting on Unity 2022+
- Teams familiar with web CSS/HTML patterns

### When to Use UGUI
- World-space UI (health bars above characters, in-world screens)
- Projects with existing UGUI codebase
- Heavy use of 3rd party UI assets
- Projects needing Unity 2020/2021 compatibility

## UGUI Canvas Optimization

### Canvas Splitting

A Canvas rebuilds its entire batch when any child element changes. Split static and dynamic elements into separate Canvases.

```
Scene Hierarchy:
├── Canvas-Static         (background, borders, labels that never change)
├── Canvas-Dynamic        (health bars, score, timers)
└── Canvas-Overlay        (popups, tooltips)
```

### Raycast Target Optimization

Disable `Raycast Target` on non-interactive elements to reduce event system processing.

```csharp
// Disable on decorative images
[SerializeField] private Image background;

void Start()
{
    background.raycastTarget = false;
}
```

### Canvas Group for Visibility

Use CanvasGroup to fade or hide groups of elements without triggering Canvas rebuilds.

```csharp
// Fade panel without rebuilding Canvas
CanvasGroup canvasGroup;
if (panel.TryGetComponent(out canvasGroup))
{
    canvasGroup.alpha = 0f;           // Invisible
    canvasGroup.interactable = false; // Can't interact
    canvasGroup.blocksRaycasts = false; // Clicks pass through
}
```

### Layout Group Performance

Layout Groups (HorizontalLayoutGroup, VerticalLayoutGroup, GridLayoutGroup) trigger rebuilds when children change. For static layouts, remove the Layout Group after initial setup.

```csharp
// Remove layout group after initial arrangement
void Start()
{
    // Let layout calculate positions
    LayoutRebuilder.ForceRebuildLayoutImmediate(GetComponent<RectTransform>());

    // Remove layout component to prevent future rebuilds
    LayoutGroup layoutGroup;
    if (TryGetComponent(out layoutGroup))
    {
        Destroy(layoutGroup);
    }
}
```

## UI Toolkit Runtime Basics

### Document Setup

```csharp
using UnityEngine.UIElements;

public class GameUI : MonoBehaviour
{
    private UIDocument uiDocument;
    private Label scoreLabel;
    private Button pauseButton;
    private VisualElement healthBar;

    void OnEnable()
    {
        if (!TryGetComponent(out uiDocument)) return;

        var root = uiDocument.rootVisualElement;

        scoreLabel = root.Q<Label>("score-label");
        pauseButton = root.Q<Button>("pause-button");
        healthBar = root.Q("health-fill");

        pauseButton.clicked += OnPauseClicked;
    }

    void OnDisable()
    {
        if (pauseButton != null)
            pauseButton.clicked -= OnPauseClicked;
    }
}
```

### USS Styling (CSS-like)

```css
/* GameUI.uss */
.container {
    flex-direction: row;
    justify-content: space-between;
    padding: 10px;
}

.health-bar {
    width: 200px;
    height: 20px;
    background-color: rgb(50, 50, 50);
    border-radius: 4px;
}

.health-fill {
    height: 100%;
    background-color: rgb(0, 200, 0);
    transition: width 0.3s ease-in-out;
}

.button-primary {
    background-color: rgb(0, 120, 215);
    color: white;
    border-radius: 4px;
    padding: 8px 16px;
}

.button-primary:hover {
    background-color: rgb(0, 100, 195);
}
```

### Dynamic Element Creation

```csharp
// Create elements in code
var listContainer = root.Q("item-list");

foreach (var item in inventory)
{
    var element = new VisualElement();
    element.AddToClassList("item-row");

    var nameLabel = new Label(item.Name);
    nameLabel.AddToClassList("item-name");

    var countLabel = new Label($"x{item.Count}");
    countLabel.AddToClassList("item-count");

    element.Add(nameLabel);
    element.Add(countLabel);
    listContainer.Add(element);
}
```

## Responsive Layout Patterns (UGUI)

### Anchor-Based Scaling

```csharp
// CanvasScaler configuration for responsive UI
CanvasScaler scaler;
if (TryGetComponent(out scaler))
{
    scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
    scaler.referenceResolution = new Vector2(1920, 1080);
    scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
    scaler.matchWidthOrHeight = 0.5f; // Balance between width and height
}
```

### Safe Area Handling

```csharp
// Handle notch/cutout on mobile devices
public class SafeAreaHandler : MonoBehaviour
{
    [SerializeField] private RectTransform safeAreaPanel;

    void Start()
    {
        ApplySafeArea();
    }

    void ApplySafeArea()
    {
        Rect safeArea = Screen.safeArea;
        Vector2 anchorMin = safeArea.position;
        Vector2 anchorMax = safeArea.position + safeArea.size;

        anchorMin.x /= Screen.width;
        anchorMin.y /= Screen.height;
        anchorMax.x /= Screen.width;
        anchorMax.y /= Screen.height;

        safeAreaPanel.anchorMin = anchorMin;
        safeAreaPanel.anchorMax = anchorMax;
    }
}
```

## Sprite Atlas for UI

Pack UI sprites into a Sprite Atlas to enable batching and reduce draw calls.

1. Create: `Assets > Create > 2D > Sprite Atlas`
2. Add UI sprite folders to the atlas
3. Enable "Include in Build"
4. Unity batches all sprites from the same atlas into a single draw call

## Common Pitfalls

- **Canvas rebuild storms**: Too many elements on a single Canvas with frequent changes
- **Overdraw**: Transparent UI elements stacked on top of each other
- **Raycast on everything**: Event system checks all raycast-enabled elements
- **Layout Groups on dynamic content**: Causes expensive rebuilds every frame
- **Missing sprite atlas**: Each loose sprite is a separate draw call
