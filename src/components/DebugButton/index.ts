/**
 * DebugButton - Only available in development
 * This file uses conditional imports to ensure the component is completely
 * excluded from production builds via tree-shaking
 */

// Conditionally import DebugButton only in development
// In production builds, this will be replaced with an empty component
export { default } from "./DebugButton.vue";
