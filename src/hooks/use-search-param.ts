import { parseAsString, useQueryState } from "nuqs";

// This hook is used to manage the search parameter in the URL
// It allows components to access and modify the search parameter easily
export function useSearchParam() { // This function returns a query state for the "search" parameter
  // It uses the `useQueryState` hook from the `nuqs` library to manage the state of the search parameter
  // The `parseAsString` function is used to ensure that the search parameter is treated as a string
  // The `withDefault` method sets the default value to an empty string if the search parameter is not present in the URL
  return useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({
      clearOnDefault: true,
    }) // This ensures that the search parameter is cleared when it is set to its default value
  ); // The `useQueryState` hook returns an object that contains the current value of the search parameter and a function to update it
} // This hook can be used in any component to access or modify the search parameter in the URL
// It simplifies the process of managing search parameters in a React application, making it easier to implement search functionality
