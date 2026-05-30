/* eslint-disable @typescript-eslint/no-empty-object-type */
import "framer-motion";
import type { HTMLAttributes, RefAttributes } from "react";

/**
 * Augment framer-motion types to accept standard HTML attributes (className, onClick, etc.)
 * on motion components. This resolves the known type incompatibility between
 * framer-motion v11.9.0 and React 19's stricter type definitions.
 */
declare module "framer-motion" {
  export interface HTMLMotionProps<TagName extends keyof React.JSX.IntrinsicElements>
    extends React.HTMLAttributes<Element> {}

  export interface MotionProps extends React.HTMLAttributes<Element> {}
}
