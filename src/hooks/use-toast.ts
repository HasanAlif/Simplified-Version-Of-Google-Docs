/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1 // This constant defines the maximum number of toasts that can be displayed at once
// It is set to 1 to ensure that only one toast is visible at a time, which helps to avoid cluttering the UI with multiple notifications
// This limit can be adjusted based on the design requirements or user experience considerations
// If you want to allow multiple toasts, you can increase this value
const TOAST_REMOVE_DELAY = 1000000 // This constant defines the delay before a toast is removed from the UI
// It is set to a very high value (1 million milliseconds) to effectively prevent automatic removal
// This means that toasts will remain visible until explicitly dismissed by the user or programmatically

type ToasterToast = ToastProps & { // This type extends the ToastProps type to include additional properties specific to the toaster implementation
  id: string // Unique identifier for the toast
  title?: React.ReactNode // Optional title for the toast
  description?: React.ReactNode // Optional description for the toast
  action?: ToastActionElement // Optional action element for the toast
}

//@ts ignore
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const // This object defines the action types used in the reducer for managing toasts
// It uses TypeScript's `as const` assertion to ensure that the properties are treated as literal types
// This allows for better type inference and ensures that the action types cannot be changed accidentally

let count = 0 // This variable is used to generate unique IDs for each toast
// It is incremented each time a new toast is created, ensuring that each toast has a unique identifier
// This is important for managing the state of toasts, especially when updating or dismissing them
// The count is reset to 0 when it reaches the maximum safe integer value to prevent overflow
// This approach ensures that the IDs remain unique throughout the lifecycle of the application

function genId() { // This function generates a unique ID for each toast
  count = (count + 1) % Number.MAX_SAFE_INTEGER // It increments the count and wraps it around to 0 when it reaches the maximum safe integer value
  return count.toString() // The ID is returned as a string, which is suitable for use as a key in React components or for identifying the toast in the state
}

type ActionType = typeof actionTypes // This type extracts the keys of the actionTypes object as a union type
// It allows us to use the action types in a type-safe manner throughout the application
// This ensures that we can only use the defined action types and helps to prevent errors related to typos or incorrect action names
// The ActionType can be used in the reducer and other parts of the application where actions are dispatched
// It provides a clear and consistent way to refer to the action types, improving code readability and maintainability

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    } // This type defines the possible actions that can be dispatched to the reducer
// Each action has a type and may include additional properties depending on the action type

interface State { // This interface defines the state of the toast system
  // It contains an array of toasts, each represented by the ToasterToast type
  // The state is used to manage the current toasts displayed in the UI
  // The state is updated by the reducer based on the actions dispatched
  // This allows for dynamic updates to the toast notifications, such as adding new toasts, updating existing toasts, dismissing toasts, and removing toasts after a delay
  toasts: ToasterToast[] // Array of currently active toasts
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>() // This map stores the timeouts for each toast by its ID
// It allows us to keep track of the timeouts associated with each toast, enabling us to remove them after a specified delay
// The key is the toast ID, and the value is the timeout ID returned by `setTimeout`
// This is useful for managing the lifecycle of toasts, especially when we want to automatically remove them after a certain period
// The map ensures that we can efficiently check if a toast is already scheduled for removal and avoid setting multiple timeouts for the same toast
// It also helps to prevent memory leaks by allowing us to clear timeouts when a toast is dismissed or removed
// The `addToRemoveQueue` function uses this map to schedule the removal of toasts after the specified delay, ensuring that only one timeout is active for each toast

const addToRemoveQueue = (toastId: string) => { // This function adds a toast ID to the removal queue
  // It checks if the toast ID is already in the queue and, if not, sets a timeout to remove the toast after the specified delay
  // This helps to manage the lifecycle of toasts by ensuring that they are removed from the UI after a certain period
  // The timeout is set using `setTimeout`, and the ID of the timeout is stored in the `toastTimeouts` map
  // This allows us to keep track of the timeouts for each toast and prevents multiple timeouts from being set for the same toast
  // If the toast ID is already in the queue, the function does nothing to avoid unnecessary operations
  if (toastTimeouts.has(toastId)) {
    return
  } // If the toast ID is not in the queue, we proceed to set a timeout for its removal
  // The timeout is set to the defined TOAST_REMOVE_DELAY, which determines how long the toast will remain visible before being removed
  // After the timeout expires, the toast is removed from the state by dispatching a REMOVE_TOAST action
  // This ensures that the toast is cleaned up from the UI and the state, preventing memory leaks and keeping the UI responsive

  const timeout = setTimeout(() => { // This function is called after the specified delay to remove the toast from the state
    toastTimeouts.delete(toastId) // It first removes the toast ID from the `toastTimeouts` map to prevent further timeouts for this toast
    // Then, it dispatches a REMOVE_TOAST action to remove the toast from the state
    // This action will trigger the reducer to update the state and remove the toast from the UI
    // The timeout ensures that the toast is only removed after the specified delay, allowing it to be visible to the user for a certain period
    // This is useful for providing feedback to the user, such as success or error messages, without cluttering the UI with too many notifications
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    }) // The toast is removed from the state, and the UI is updated accordingly
  }, TOAST_REMOVE_DELAY) // The timeout is set to the defined TOAST_REMOVE_DELAY, which determines how long the toast will remain visible before being removed

  toastTimeouts.set(toastId, timeout) // The timeout ID is stored in the `toastTimeouts` map with the toast ID as the key
  // This allows us to keep track of the timeout for this specific toast, enabling us to clear it if needed
  // If the toast is dismissed before the timeout expires, we can clear the timeout to prevent it from executing
  // This helps to manage the lifecycle of toasts effectively
  // It ensures that toasts are removed from the UI after a certain period, providing a clean and responsive user experience
}

export const reducer = (state: State, action: Action): State => { // This function is the reducer for managing the state of toasts
  // It takes the current state and an action as parameters and returns the new state based on the action type
  // The reducer handles different action types to add, update, dismiss, and remove toasts
  // It uses a switch statement to determine the action type and perform the corresponding state update
  // The reducer is pure, meaning it does not have side effects and does not mutate the existing state
  // Instead, it creates a new state object with the updated toasts
  switch (action.type) { // This switch statement checks the action type and performs the corresponding state update
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      } // This case handles adding a new toast to the state
      // It spreads the existing toasts and adds the new toast at the beginning of the array

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      } // This case handles updating an existing toast in the state
      // It maps over the existing toasts and updates the toast that matches the ID in the action
      // The updated toast is merged with the existing properties, allowing for partial updates

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      } // This case handles dismissing a toast
      // If a toast ID is provided, it adds the toast to the removal queue
      // If no ID is provided, it adds all toasts to the removal queue

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      } // It updates the state by setting the `open` property of the dismissed toast(s) to false
      // This effectively hides the toast from the UI while keeping it in the state for potential future updates or removal
      // The `open` property is used to control the visibility of the toast in the UI
      // The state is updated by mapping over the existing toasts and modifying the one that matches the provided toast ID or all toasts if no ID is specified
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        } // This case handles removing a toast from the state
        // If no toast ID is provided, it clears all toasts from the state
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      } // If a toast ID is provided, it filters out the toast with that ID from the state
    // This ensures that the toast is completely removed from the state and will no longer be displayed
  } // If the action type does not match any of the cases, the state remains unchanged
} // The reducer returns the current state without modifications, allowing for flexibility in handling actions

const listeners: Array<(state: State) => void> = [] // This array holds the listeners that will be notified when the state changes
// Listeners are functions that will be called with the new state whenever the state is updated
// This allows components or other parts of the application to react to state changes and update accordingly

let memoryState: State = { toasts: [] } // This variable holds the current state of the toasts in memory
// It is initialized with an empty array of toasts
// The memory state is used to keep track of the current toasts and their properties

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  }) // This function dispatches an action to the reducer and updates the memory state
  // It calls the reducer with the current memory state and the action, which returns a new state
  // After updating the memory state, it notifies all registered listeners with the new state
  // This allows the application to respond to state changes and update the UI or perform other actions
  // The listeners are functions that are called with the new state, allowing them to react to the changes
  // This is a common pattern in state management libraries, where actions are dispatched to update the state and listeners are notified of the changes
} // The dispatch function is used to send actions to the reducer and update the state

type Toast = Omit<ToasterToast, "id"> // This type represents the properties of a toast without the `id` field
// It is used to define the properties that can be passed when creating a new toast
// The `id` field is generated automatically when the toast is created, so it is omitted

function toast({ ...props }: Toast) { // This function creates a new toast with the provided properties
  // It generates a unique ID for the toast and dispatches an action to add the toast
  // The properties of the toast are spread into the action, allowing for customization of the toast
  // The function returns an object with methods to dismiss and update the toast
  // The `dismiss` method allows the toast to be closed, while the `update` method allows for updating the toast's properties
  // This provides a flexible way to manage toasts
  const id = genId() // Generate a unique ID for the toast
  // The ID is generated using the `genId` function, which ensures that each toast has a unique identifier
  // This is important for managing the state of toasts, especially when updating or dismissing them
  // The ID is used to identify the toast in the state and to ensure that the correct toast is updated or dismissed
  // It is also used to manage the lifecycle of the toast, such as removing it after a certain period
  // The ID is essential for the proper functioning of the toast system, allowing for unique identification and management of each toast

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    }) // This function allows updating the properties of an existing toast
  // It takes the new properties as an argument and dispatches an action to update the toast
  // The action includes the new properties and the ID of the toast to be updated
  // This allows for dynamic updates to the toast, such as changing the title, description, or action elements
  // The `update` function can be called at any time to modify the toast's properties
  // This is useful for scenarios where the toast needs to reflect changes in the application state or user interactions
  // The updated toast will be reflected in the UI, allowing for real-time updates to the toast notification
  // The `update` function provides a convenient way to manage the toast's properties without needing to create a new toast each time
  // It ensures that the toast remains consistent and up-to-date with the current state of the application
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id }) // This function allows dismissing the toast
  // It dispatches an action to dismiss the toast by its ID
  // The action sets the `open` property of the toast to false, effectively hiding it
  // The `dismiss` function can be called when the user interacts with the toast, such as clicking a close button or when the toast's timeout expires

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  }) // This action adds the new toast to the state
  // It includes the properties of the toast, the generated ID, and sets the `open` property to true
  // The `onOpenChange` property is a callback that will be called when the toast's open state changes
  // If the toast is closed (open becomes false), it calls the `dismiss` function to remove the toast from the state
  // This ensures that the toast is properly managed and removed when it is no longer needed
  // The `dispatch` function is called to update the state with the new toast

  return {
    id: id,
    dismiss,
    update,
  } // The function returns an object containing the toast ID, the `dismiss` method to close the toast, and the `update` method to modify the toast's properties
  // This allows the caller to easily manage the toast, including dismissing it or updating its properties
  // The returned object can be used in the UI to control the toast's behavior and appearance
  // It provides a simple interface for interacting with the toast, making it easy to integrate into the application and manage toast notifications effectively
}

// This function is used to create and manage toast notifications in the application
// It provides a way to add, update, dismiss, and remove toasts from the state
// The `useToast` hook can be used in React components to access the current state of toasts and perform actions on them
// It allows for a clean and organized way to handle toast notifications, ensuring that they are displayed and managed correctly in the UI
// The `useToast` hook provides a convenient way to access the toast state and actions in functional components
// It allows components to subscribe to toast state changes and react accordingly
// The hook returns the current state of toasts along with methods to create new toasts, dismiss existing ones, and update their properties
// This makes it easy to integrate toast notifications into the application and manage them effectively
function useToast() {
  const [state, setState] = React.useState<State>(memoryState) // This hook initializes the state with the current memory state of toasts
  // It uses the `useState` hook to create a state variable and a function to update it
  // The initial state is set to the current memory state, which contains the existing toasts
  // The `setState` function is used to update the state when the memory state changes
  // This allows the component to re-render whenever the state is updated, ensuring that the UI reflects the current state of toasts
  // The `useToast` hook provides a way to manage toast notifications in a React application
  // It allows components to access the current state of toasts and perform actions such as adding, updating, dismissing, and removing toasts

  React.useEffect(() => {
    listeners.push(setState) // This effect adds the `setState` function to the listeners array
    return () => {
      const index = listeners.indexOf(setState) // This cleanup function removes the `setState` function from the listeners array when the component unmounts
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state]) // This effect runs when the component mounts and adds the `setState` function to the listeners array
  // It ensures that the component will be notified of any state changes and will re-render accordingly

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }), // This method allows dismissing a toast by its ID
  } // The `toast` method can be used to create new toasts, while the `dismiss` method allows for dismissing existing toasts
} // The `useToast` hook returns the current state of toasts along with methods to manage them

export { useToast, toast }
