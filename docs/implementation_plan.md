# Implementation Plan: Row & Column Shadows/Hover, Equal Height Columns, Section/Column Heights & Row Width Options

## Problem Overview
1. **Row & Column Shadows and Hover**: Box shadow, hover scale, hover shadow, hover background color, and hover border color work for the Section container but are not hooked up or active for Columns and Rows on the canvas or in preview.
2. **Equal Height Columns**: Users cannot currently force all columns in a row/section to stretch to equal height (essential for pricing tables, feature cards, testimonials, etc.).
3. **Height Controls**: No explicit height/min-height control for Section (e.g. 100vh screen height, 600px, etc.) and Columns (e.g. 100% height, min-height).
4. **Row Width & Alignment**: Rows default to 100% width of the section container without options for custom width (e.g. 800px, 960px, 1180px, or custom px/%) and row alignment (center, left, right).

---

## User Review Required
> [!NOTE]
> All new style properties (`equalHeightColumns`, `minHeight`, `height`, `rowWidthType`, `rowCustomWidth`, `rowAlign`, `rowVerticalAlign`) are added backwards-compatibly to `ElementStyles`. Existing sections, rows, and columns will retain their current defaults with zero regressions.

---

## Proposed Changes

### 1. Type Definitions (`src/types/builder.ts`)
#### [MODIFY] [builder.ts](file:///C:/Users/Asad/.gemini/antigravity/scratch/nextforge-builder/src/types/builder.ts)
- Extend `ElementStyles` with:
  ```typescript
  minHeight?: string;
  height?: string;
  equalHeightColumns?: boolean;
  rowWidthType?: 'full' | 'boxed' | 'contained' | 'compact' | 'custom';
  rowCustomWidth?: string;
  rowAlign?: 'left' | 'center' | 'right';
  rowVerticalAlign?: 'top' | 'center' | 'bottom' | 'stretch';
  ```

---

### 2. Inspector Controls (`src/components/editor/SectionInspector.tsx`)
#### [MODIFY] [SectionInspector.tsx](file:///C:/Users/Asad/.gemini/antigravity/scratch/nextforge-builder/src/components/editor/SectionInspector.tsx)
1. **Section Properties (Advanced Tab)**:
   - **Equal Height Columns Toggle**: Switch with label *"Equal Height Columns: Stretches all columns to match the height of the tallest column"*.
   - **Section Height / Min-Height**: Presets (`Auto`, `Screen (100vh)`, `400px`, `600px`, `800px`) + custom px / vh input.
2. **Row Properties (Layout & Spacing / Target Row Scope)**:
   - **Row Width Selector**: `Full (100%)`, `Boxed (1180px)`, `Contained (960px)`, `Compact (720px)`, and `Custom Width` (with numeric stepper/input).
   - **Row Alignment**: `Left`, `Center (mx-auto)`, `Right`.
   - **Row Vertical Alignment**: `Top`, `Center`, `Bottom`, `Stretch`.
   - **Row Min-Height**: `Auto`, `200px`, `350px`, `500px`, custom px.
3. **Column Properties (Target Column Scope)**:
   - **Column Min-Height / Height**: `Auto`, `Full (100%)`, `200px`, `350px`, `500px`, custom px.
4. **Box Shadow & Hover Effects (Styling Tab)**:
   - Ensure the Target Scope switcher (`Section` | `Row` | `Column`) clearly reflects active row and column shadows and hover parameters so users can effortlessly style row and column containers with full visual feedback.

---

### 3. Canvas Rendering & Interactivity (`src/components/editor/CanvasWorkspace.tsx`)
#### [MODIFY] [CanvasWorkspace.tsx](file:///C:/Users/Asad/.gemini/antigravity/scratch/nextforge-builder/src/components/editor/CanvasWorkspace.tsx)
1. **Row & Column Hover and Box Shadow**:
   - Add `hoveredRowId` and `hoveredColId` tracking.
   - Compute `activeShadow`, `activeTransform` (`scale(hoverScale)`), `activeBgColor`, and `activeBorderColor` for both Rows and Columns.
   - Apply transitions `transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1)`.
2. **Equal Height Columns**:
   - When `sec.styles?.equalHeightColumns` or `row.styles?.rowVerticalAlign === 'stretch'` is enabled, apply `items-stretch` to the row flex wrapper, `h-full` to the column wrappers, and `h-full flex flex-col justify-between` to the inner column cards.
3. **Section & Column Heights**:
   - Apply `minHeight` on section container.
   - Apply `minHeight` and `height` on column containers.
4. **Row Custom Width & Alignment**:
   - Calculate effective row width (e.g. 100%, 1180px, 960px, 720px, or custom `rowCustomWidth`).
   - Apply row margin alignment: `mx-auto` for center, `mr-auto` for left, `ml-auto` for right.

---

### 4. Preview Mode Rendering (`src/App.tsx`)
#### [MODIFY] [App.tsx](file:///C:/Users/Asad/.gemini/antigravity/scratch/nextforge-builder/src/App.tsx)
- Ensure all row/column box shadows, hover effects, equal height columns, section/column heights, and row custom widths & alignments render identically in the live preview modal.

---

## Verification Plan
### Automated Verification
- Run `npm run build` to verify TypeScript compile-time safety and production bundle generation.

### Manual / Browser Verification
1. **Box Shadow & Hover on Rows & Columns**:
   - Select Row 1, apply "Elevated" box shadow, set Hover Box Shadow to "Indigo Glow", Hover Scale to "1.01x". Hover over Row on canvas to confirm active shadow and smooth scale.
   - Select Column 1, apply "Glow" box shadow and hover border color. Confirm hover works smoothly.
2. **Equal Height Columns**:
   - In a 2-column or 3-column section with uneven content, enable "Equal Height Columns" in Section Properties. Confirm all columns stretch to equal height.
3. **Section & Column Heights**:
   - Set Section Min-Height to "Screen (100vh)". Confirm canvas section expands to full viewport.
   - Set Column Min-Height to "400px". Confirm column respects the specified height.
4. **Row Custom Width**:
   - Set Row Width to "Compact (720px)" and Alignment to "Center". Confirm the row is centered and constrained to 720px within the wider section.
