import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True only once mounted in the browser, false during the server-rendered
 * pass -- the sanctioned React pattern (via useSyncExternalStore's
 * distinct client/server snapshots) for content that must differ between
 * server and client without tripping a hydration mismatch or needing a
 * setState-in-effect.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
