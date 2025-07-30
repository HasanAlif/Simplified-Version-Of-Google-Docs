import { Extension } from "@tiptap/react";

// This extension adds support for line height in text nodes
// It allows setting and unsetting line height for specific node types like paragraphs and headings
declare module "@tiptap/core" { // Extend the Tiptap core module to include line height commands
  interface Commands<ReturnType> { // Define the commands that this extension will add
    // The `setLineHeight` command sets the line height for the selected text nodes
    lineHeight: {
      setLineHeight: (size: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    }; // The `unsetLineHeight` command resets the line height to the default value
  } // This allows components to use these commands to modify the line height of text nodes in the editor
} // Extend the Tiptap core module to include line height commands

// This extension provides functionality to manage line height in text nodes
// It allows setting a specific line height for paragraphs and headings, and provides commands to set or unset the line height
// The extension can be used in a Tiptap editor to enhance text formatting capabilities
export const LineHeightExtension = Extension.create({
  name: "lineHeight",
  addOptions() { // Define the options for this extension
    return {
      types: ["paragraph", "heading"], // Specify the node types that this extension will apply to
      // This extension will apply to paragraphs and headings, allowing line height adjustments for these types
      defaultLineHeight: "normal", // Set the default line height to "normal"
      // This will be used when no specific line height is set for a node
    };
  }, // The `addOptions` method allows customization of the extension's behavior
  // It defines the node types that will be affected by this extension and the default line height


  addGlobalAttributes() { // This method adds global attributes to the specified node types
    // It allows the extension to modify the attributes of text nodes globally
    return [
      {
        types: this.options.types, // Apply the attributes to the specified node types
        // The attributes will be applied to paragraphs and headings as defined in the options
        attributes: { // Define the attributes that will be added to the node types
          // The `lineHeight` attribute will be used to store the line height value for the text nodes
          lineHeight: {
            default: this.options.defaultLineHeight, // Set the default line height to the value specified in the options
            // This ensures that if no line height is set, the node will use the default value
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {}; // If no line height is set, return an empty object to avoid adding unnecessary attributes
              // This prevents the extension from adding a line-height attribute if it is not explicitly set
              return {
                style: `line-height: ${attributes.lineHeight}`, // Render the line height as a style attribute in the HTML output
                // This allows the line height to be applied in the rendered HTML, affecting the appearance of the text
                // The line height will be applied to the text nodes in the editor, affecting their spacing
              };
            },
            parseHTML: (element) => {
              return element.style.lineHeight || this.options.defaultLineHeight; // Parse the line height from the HTML element's style attribute
              // If the line height is not set in the element's style, return the default lineHeight
              // This ensures that the extension can read the line height from existing HTML elements and apply it
            },
          },
        },
      },
    ];
  },
  addCommands() { // This method adds commands to the extension that can be used to modify the line height of text nodes
    // The commands allow users to set or unset the line height for selected text nodes
    return { // Define the commands that will be added to the editor
      // The `setLineHeight` command sets the line height for the selected text nodes
      setLineHeight:
        (lineHeight: string) =>
        ({ tr, state, dispatch }) => { // This command takes a line height value as an argument
          // It returns a function that receives the transaction, state, and dispatch function
          const { selection } = state; // Get the current selection from the editor state
          // The selection represents the currently selected text nodes in the editor
          tr = tr.setSelection(selection); // Set the transaction selection to the current selection

          const { from, to } = selection; // Get the start and end positions of the selection
          // The `from` and `to` positions define the range of text nodes that will be affected by the command
          // The command will apply the specified line height to all text nodes within this range
          state.doc.nodesBetween(from, to, (node, pos) => { // Iterate over all text nodes between the `from` and `to` positions
            // The `nodesBetween` method allows us to traverse the document and access each text node
            if (this.options.types.includes(node.type.name)) { // Check if the current node type is one of the specified types (paragraph or heading)
              // If the node type matches, we can modify its attributes
              tr = tr.setNodeMarkup(pos, undefined, { // Set the node markup at the current position
                // The `setNodeMarkup` method allows us to modify the attributes of the node
                ...node.attrs, // Preserve the existing attributes of the node
                lineHeight, // Set the `lineHeight` attribute to the specified value
                // This updates the line height of the text node to the new value
              });
            }
          });
          if (dispatch) dispatch(tr); // If the dispatch function is provided, dispatch the transaction to update the editor state
          // This applies the changes to the editor, updating the line height of the selected text nodes
          return true;
        },
      unsetLineHeight:
        () =>
        ({ tr, state, dispatch }) => { // This command unsets the line height for the selected text nodes
          // It returns a function that receives the transaction, state, and dispatch function
          const { selection } = state; // Get the current selection from the editor state
          // The selection represents the currently selected text nodes in the editor
          tr = tr.setSelection(selection); // Set the transaction selection to the current selection

          const { from, to } = selection; // Get the start and end positions of the selection
          // The `from` and `to` positions define the range of text nodes that will be affected by the command
          // The command will unset the line height for all text nodes within this range
          state.doc.nodesBetween(from, to, (node, pos) => { // Iterate over all text nodes between the `from` and `to` positions
            // The `nodesBetween` method allows us to traverse the document and access each text node
            if (this.options.types.includes(node.type.name)) { // Check if the current node type is one of the specified types (paragraph or heading)
              // If the node type matches, we can modify its attributes
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs, // Preserve the existing attributes of the node
                lineHeight: this.options.defaultLineHeight, // Set the `lineHeight` attribute to the default value
                // This resets the line height of the text node to the default value
              });
            }
          });
          if (dispatch) dispatch(tr); // If the dispatch function is provided, dispatch the transaction to update the editor state
          // This applies the changes to the editor, resetting the line height of the selected text nodes
          return true;
        },
    };
  },
});
