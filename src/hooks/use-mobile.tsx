import * as React from "react"

const MOBILE_BREAKPOINT = 768 // Define a constant for the mobile breakpoint, typically 768px

// This hook is used to determine if the current device is a mobile device
// It listens for changes in the window size and updates the state accordingly
// The hook returns a boolean indicating whether the device is mobile or not
// It uses the `window.matchMedia` API to check if the current viewport width is less than the defined mobile breakpoint
// The effect sets up an event listener for changes in the viewport size
// When the viewport size changes, it updates the `isMobile` state based on whether the current width is less than the mobile breakpoint
// The hook returns `true` if the device is mobile (width < MOBILE_BREAKPOINT) and `false` otherwise
// This is useful for responsive design, allowing components to adapt their behavior or appearance based on the device type
// The hook can be used in any React component to conditionally render content or apply styles based on the device type
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined) // Initialize state to undefined to indicate that the device type is not yet determined

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`) // Create a MediaQueryList object to check if the viewport width is less than the mobile breakpoint
    // Add an event listener to update the state when the viewport size changes
    // This listener will be called whenever the viewport width changes, allowing the hook to respond to changes in device orientation or window resizing
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT) // Update the state based on the current window width
    }
    mql.addEventListener("change", onChange) // Attach the event listener to the MediaQueryList object
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT) // Set the initial state based on the current window width
    return () => mql.removeEventListener("change", onChange) // Cleanup function to remove the event listener when the component unmounts or when the effect is re-run
  }, []) // The empty dependency array ensures that this effect runs only once when the component mounts

  return !!isMobile // Return the boolean value indicating whether the device is mobile or not
  // The double negation (!!) converts the value to a boolean, ensuring that the return value is always a boolean type
  // This is useful for ensuring that the hook's return value is consistent and can be used in conditional rendering or logic checks
}
